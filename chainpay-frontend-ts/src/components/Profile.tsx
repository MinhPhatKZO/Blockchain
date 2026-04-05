import React, { useCallback, useEffect, useState } from 'react';
import { FaCheckCircle, FaCopy, FaEthereum, FaInfoCircle, FaWallet } from 'react-icons/fa';
import Web3 from 'web3';

import { axiosClient } from '../api';
import { CONTRACT_BALANCE_UPDATED_EVENT } from '../blockchain/chainPayContract';
import { commonText, profileText } from '../text';
import DepositButton from './DepositButton';
import Navbar from '../components/Navbar';

interface UserData {
    id: number | string;
    fullName?: string;
    username: string;
    walletAddress?: string;
}

const formatNumberString = (value: string) => value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const formatWei = (value: string | null) => {
    if (!value) {
        return commonText.labels.notAvailable;
    }

    return /^\d+$/.test(value) ? formatNumberString(value) : value;
};

const formatEth = (value: string | null) => {
    if (!value) {
        return commonText.labels.notAvailable;
    }

    try {
        const etherValue = Web3.utils.fromWei(value, 'ether');
        const [wholePart, fractionPart = ''] = etherValue.split('.');
        const trimmedFraction = fractionPart.slice(0, 6).replace(/0+$/, '');
        const formattedWholePart = formatNumberString(wholePart);
        return trimmedFraction ? `${formattedWholePart}.${trimmedFraction}` : formattedWholePart;
    } catch (error) {
        console.error(error);
        return commonText.labels.notAvailable;
    }
};

const ProfilePage: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);
    const [contractBalanceWei, setContractBalanceWei] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [balanceError, setBalanceError] = useState('');
    const [copied, setCopied] = useState(false);

    const loadProfile = useCallback(async () => {
        try {
            setLoading(true);
            setBalanceError('');

            const userResponse = await axiosClient.get<UserData>('/users/me');
            const user = userResponse.data;

            setCurrentUser(user);
            localStorage.setItem('user', JSON.stringify(user));

            if (!user.walletAddress) {
                setContractBalanceWei(null);
                return;
            }

            try {
                const contractBalanceResponse = await axiosClient.get<string>(`/payment/balance/${user.walletAddress}`);
                setContractBalanceWei(String(contractBalanceResponse.data ?? '0'));
            } catch (contractApiError) {
                console.error(contractApiError);
                setContractBalanceWei(null);
                setBalanceError(profileText.page.balanceUnavailable);
            }
        } catch (error) {
            console.error(error);
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    setCurrentUser(JSON.parse(userStr));
                } catch (parseError) {
                    console.error(parseError);
                }
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadProfile();

        const handleBalanceUpdated = () => {
            void loadProfile();
        };

        window.addEventListener(CONTRACT_BALANCE_UPDATED_EVENT, handleBalanceUpdated);

        return () => {
            window.removeEventListener(CONTRACT_BALANCE_UPDATED_EVENT, handleBalanceUpdated);
        };
    }, [loadProfile]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-800 selection:bg-[#6C5CE7] selection:text-white">
            <Navbar />

            <main className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
                {loading ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[32px] border border-slate-200 bg-white p-12 text-center shadow-sm">
                        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#6C5CE7]/20 border-t-[#6C5CE7]"></div>
                        <h3 className="text-lg font-bold text-slate-700">{profileText.page.loadingTitle}</h3>
                        <p className="mt-1 text-sm text-slate-500">{profileText.page.loadingDescription}</p>
                    </div>
                ) : currentUser ? (
                    <div className="flex flex-col gap-8">
                        <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
                            <div className="h-32 bg-gradient-to-r from-[#6C5CE7] via-[#8e7bfa] to-[#a29bfe] sm:h-40"></div>

                            <div className="relative px-6 pb-8 sm:px-10">
                                <div className="-mt-12 mb-6 flex items-end justify-between sm:-mt-16">
                                    <div className="h-24 w-24 rounded-full bg-white p-1.5 shadow-md sm:h-32 sm:w-32">
                                        <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#6C5CE7]/10 to-[#6C5CE7]/20 text-4xl font-black text-[#6C5CE7] sm:text-5xl">
                                            {currentUser.fullName
                                                ? currentUser.fullName.charAt(0).toUpperCase()
                                                : (currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U')}
                                        </div>
                                    </div>
                                    <div className="mb-2 sm:mb-4">
                                        <span className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-2 font-mono text-sm font-bold text-slate-600 shadow-sm">
                                            <FaInfoCircle className="text-slate-400" /> {profileText.page.idLabel}: #{currentUser.id || commonText.labels.notAvailable}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                                        {currentUser.fullName || currentUser.username || profileText.page.unnamedUser}
                                    </h1>
                                    <p className="mt-1 font-medium text-slate-500">{commonText.user.usernamePrefix}{currentUser.username}</p>
                                </div>
                            </div>
                        </div>

                        {balanceError && (
                            <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                                <FaInfoCircle /> {balanceError}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                                        <FaWallet size={18} />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-800">{profileText.page.linkedWalletTitle}</h2>
                                </div>

                                {currentUser.walletAddress ? (
                                    <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                        <div className="relative z-10 mb-3 flex items-center justify-between">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{profileText.page.walletAddressLabel}</span>
                                            <button
                                                onClick={() => copyToClipboard(currentUser.walletAddress!)}
                                                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 shadow-sm transition-all hover:border-[#6C5CE7] hover:text-[#6C5CE7]"
                                                title={profileText.page.copyWalletTitle}
                                            >
                                                {copied ? <><FaCheckCircle className="text-emerald-500" /> {commonText.actions.copied}</> : <><FaCopy /> {commonText.actions.copy}</>}
                                            </button>
                                        </div>
                                        <div className="relative z-10 break-all font-mono text-sm leading-relaxed text-slate-700">
                                            {currentUser.walletAddress}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 rounded-2xl border border-orange-100 bg-orange-50 p-4 text-sm font-medium text-orange-600">
                                        <FaInfoCircle /> {profileText.page.noLinkedWallet}
                                    </div>
                                )}
                            </div>

                            <div className="group relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-6 text-white shadow-lg sm:p-8">
                                <div className="absolute -right-6 -top-6 text-white/5 transition-transform duration-500 group-hover:scale-110">
                                    <FaEthereum size={180} />
                                </div>

                                <div className="relative z-10 flex h-full flex-col justify-between">
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-emerald-400 backdrop-blur-sm">
                                            <FaEthereum size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-200">{profileText.page.accountBalanceTitle}</h2>
                                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                                                {profileText.page.accountBalanceCaption}
                                            </p>
                                        </div>
                                    </div>

                                    {currentUser.walletAddress ? (
                                        <div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-black tracking-tight text-white sm:text-5xl">{formatEth(contractBalanceWei)}</span>
                                                <span className="text-lg font-bold text-slate-400">{commonText.labels.eth}</span>
                                            </div>
                                            <p className="mt-2 font-mono text-xs text-slate-400">
                                                {profileText.page.availableLabel}: {formatWei(contractBalanceWei)} {commonText.labels.wei}
                                            </p>
                                            <p className="mt-4 max-w-xs text-sm font-medium leading-6 text-slate-300">
                                                {profileText.page.contractBalanceHint}
                                            </p>
                                            <DepositButton
                                                walletAddress={currentUser.walletAddress}
                                                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-900 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100"
                                            >
                                                {commonText.actions.deposit}
                                                <span className="text-slate-400">{profileText.page.depositButtonSuffix}</span>
                                            </DepositButton>
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-medium text-slate-300">
                                            {profileText.page.balanceHintNoWallet}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[32px] border border-slate-200 bg-white p-12 text-center shadow-sm">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                            <FaInfoCircle />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">{profileText.page.profileUnavailableTitle}</h3>
                        <p className="mt-1 text-sm text-slate-500">{profileText.page.profileUnavailableDescription}</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProfilePage;
