import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaWallet } from 'react-icons/fa';
import Web3 from 'web3';

import { fetchPublicConfig } from '../api';
import { CONTRACT_BALANCE_UPDATED_EVENT, getChainPayContract } from '../blockchain/chainPayContract';
import { commonText } from '../text';
import SuccessModal from './SuccessModal';

interface DepositButtonProps {
    className: string;
    children: React.ReactNode;
    walletAddress?: string;
    onSuccess?: () => Promise<void> | void;
}

interface SuccessModalState {
    isOpen: boolean;
    title: string;
    content: React.ReactNode;
    actionLabel: string;
}

const depositText = {
    modalTitle: 'Nạp tiền vào ChainPay',
    modalDescription: 'Nhập số ETH bạn muốn nạp. MetaMask sẽ mở để xác nhận giao dịch deposit vào smart contract.',
    amountLabel: 'Số tiền nạp (ETH)',
    amountPlaceholder: 'Ví dụ: 0.25',
    amountHint: 'ChainPay sẽ nhận ETH này và quy đổi lưu trữ nội bộ theo đơn vị WEI.',
    confirmAction: 'Mở MetaMask để nạp',
    successTitle: 'Nạp tiền thành công',
    successAction: 'Tiếp tục',
    successMessage: (amountEth: string) => `Bạn đã nạp ${amountEth} ETH vào ví Smart Contract của ChainPay.`,
    successHashLabel: 'Transaction Hash',
    errors: {
        missingMetaMask: 'Vui lòng cài đặt MetaMask trước khi nạp tiền.',
        missingContractAddress: 'Không tìm thấy địa chỉ smart contract để thực hiện deposit.',
        invalidAmount: 'Số ETH nạp vào không hợp lệ.',
        missingActiveAccount: 'Không tìm thấy tài khoản MetaMask đang hoạt động.',
        walletMismatch: 'Tài khoản MetaMask hiện tại không trùng với ví đã đăng ký.',
        invalidContractAddress: 'Địa chỉ smart contract hiện tại không hợp lệ.',
        rejected: 'Bạn đã từ chối giao dịch trong MetaMask.',
        generic: 'Không thể nạp tiền vào smart contract lúc này.',
        wrongChain: (chainId: string) => `Vui lòng chuyển MetaMask sang đúng mạng ChainPay (chainId ${chainId}).`
    }
} as const;

const resolveRegisteredWallet = (walletAddress?: string) => {
    if (walletAddress) {
        return walletAddress;
    }

    const userStr = localStorage.getItem('user');
    if (!userStr) {
        return '';
    }

    try {
        const user = JSON.parse(userStr) as { walletAddress?: string };
        return user.walletAddress ?? '';
    } catch (error) {
        console.error(error);
        return '';
    }
};

const DepositButton: React.FC<DepositButtonProps> = ({ className, children, walletAddress, onSuccess }) => {
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [amountEth, setAmountEth] = useState('');
    const [config, setConfig] = useState<{ contractAddress: string; chainId: string } | null>(null);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [successModal, setSuccessModal] = useState<SuccessModalState>({
        isOpen: false,
        title: '',
        content: null,
        actionLabel: ''
    });

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const publicConfig = await fetchPublicConfig();
                setConfig({
                    contractAddress: publicConfig.contractAddress,
                    chainId: publicConfig.chainId
                });
            } catch (configError) {
                console.error(configError);
            }
        };

        void loadConfig();
    }, []);

    useEffect(() => {
        if (!isDepositModalOpen) {
            return;
        }

        const { body } = document;
        const previousOverflow = body.style.overflow;
        body.style.overflow = 'hidden';

        return () => {
            body.style.overflow = previousOverflow;
        };
    }, [isDepositModalOpen]);

    const closeDepositModal = () => {
        if (submitting) {
            return;
        }

        setIsDepositModalOpen(false);
        setError('');
    };

    const ensureExpectedNetwork = async (ethereum: any, chainId?: string) => {
        if (!chainId) {
            return;
        }

        const activeChainId = await ethereum.request({ method: 'eth_chainId' });
        const parsedChainId = Number(chainId);

        if (!Number.isFinite(parsedChainId)) {
            return;
        }

        const expectedChainId = `0x${parsedChainId.toString(16)}`;
        if (String(activeChainId).toLowerCase() !== expectedChainId.toLowerCase()) {
            throw new Error(depositText.errors.wrongChain(chainId));
        }
    };

    const handleDeposit = async () => {
        const trimmedAmount = amountEth.trim();

        if (!trimmedAmount || !/^\d+(\.\d+)?$/.test(trimmedAmount) || Number(trimmedAmount) <= 0) {
            setError(depositText.errors.invalidAmount);
            return;
        }

        const ethereum = (window as any).ethereum;
        if (!ethereum) {
            setError(depositText.errors.missingMetaMask);
            return;
        }

        if (!config?.contractAddress) {
            setError(depositText.errors.missingContractAddress);
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            const activeAccount = accounts?.[0];

            if (!activeAccount) {
                throw new Error(depositText.errors.missingActiveAccount);
            }

            await ensureExpectedNetwork(ethereum, config.chainId);

            const registeredWallet = resolveRegisteredWallet(walletAddress);
            if (registeredWallet && registeredWallet.toLowerCase() !== String(activeAccount).toLowerCase()) {
                throw new Error(depositText.errors.walletMismatch);
            }

            const web3 = new Web3(ethereum);
            if (!web3.utils.isAddress(config.contractAddress)) {
                throw new Error(depositText.errors.invalidContractAddress);
            }

            const depositValueWei = web3.utils.toWei(trimmedAmount, 'ether');
            const contract = getChainPayContract(web3, config.contractAddress);
            const receipt = await contract.methods.deposit().send({
                from: activeAccount,
                value: depositValueWei
            });

            const transactionHash = String(receipt?.transactionHash ?? '');

            setIsDepositModalOpen(false);
            setAmountEth('');
            setSuccessModal({
                isOpen: true,
                title: depositText.successTitle,
                content: (
                    <div className="space-y-4">
                        <p>{depositText.successMessage(trimmedAmount)}</p>
                        {transactionHash && (
                            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                                    {depositText.successHashLabel}
                                </div>
                                <div className="mt-2 break-all font-mono text-sm text-slate-600">
                                    {transactionHash}
                                </div>
                            </div>
                        )}
                    </div>
                ),
                actionLabel: depositText.successAction
            });

            window.dispatchEvent(new CustomEvent(CONTRACT_BALANCE_UPDATED_EVENT));

            if (onSuccess) {
                await onSuccess();
            }
        } catch (depositError: any) {
            console.error(depositError);
            if (depositError?.code === 4001) {
                setError(depositText.errors.rejected);
            } else {
                setError(depositError?.message || depositText.errors.generic);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const closeSuccessModal = () => {
        setSuccessModal((previousState) => ({
            ...previousState,
            isOpen: false
        }));
    };

    const renderDepositModal = () => {
        if (!isDepositModalOpen) {
            return null;
        }

        return createPortal(
            <div className="fixed inset-0 z-[65] flex items-center justify-center px-4 py-8 sm:px-6">
                <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={closeDepositModal} />

                <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-2xl shadow-slate-900/20">
                    <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-br from-[#A29BFE] via-[#efeaff] to-white" />
                    <div className="absolute right-[-45px] top-[-30px] h-36 w-36 rounded-full bg-[#6C5CE7]/20 blur-3xl" />
                    <div className="relative p-6 sm:p-8">
                        <button
                            type="button"
                            onClick={closeDepositModal}
                            aria-label={commonText.actions.closeAria}
                            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-400 transition-colors hover:text-slate-700"
                        >
                            <FaTimes size={14} />
                        </button>

                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/25">
                                <FaWallet size={26} />
                            </div>

                            <div>
                                <div className="text-xs font-black uppercase tracking-[0.3em] text-[#6C5CE7]">{commonText.brand.appName}</div>
                                <h3 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">{depositText.modalTitle}</h3>
                            </div>
                        </div>

                        <p className="mt-6 text-sm font-medium leading-7 text-slate-500 sm:text-base">
                            {depositText.modalDescription}
                        </p>

                        <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50/90 p-5">
                            <label className="block text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">
                                {depositText.amountLabel}
                            </label>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={amountEth}
                                onChange={(event) => setAmountEth(event.target.value)}
                                placeholder={depositText.amountPlaceholder}
                                className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base font-bold text-slate-800 outline-none transition-all focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/20"
                            />
                            <p className="mt-3 text-sm font-medium leading-6 text-slate-500">
                                {depositText.amountHint}
                            </p>
                            {error && (
                                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={closeDepositModal}
                                className="flex-1 rounded-2xl bg-slate-100 px-5 py-4 text-sm font-black text-slate-500 transition-colors hover:bg-slate-200"
                            >
                                {commonText.actions.cancel}
                            </button>
                            <button
                                type="button"
                                onClick={handleDeposit}
                                disabled={submitting}
                                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] px-5 py-4 text-sm font-black text-white shadow-lg shadow-[#6C5CE7]/25 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                            >
                                {submitting ? commonText.states.processing : depositText.confirmAction}
                            </button>
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    return (
        <>
            <button
                type="button"
                className={className}
                onClick={() => {
                    setError('');
                    setIsDepositModalOpen(true);
                }}
            >
                {children}
            </button>

            {renderDepositModal()}

            <SuccessModal
                isOpen={successModal.isOpen}
                title={successModal.title}
                content={successModal.content}
                actionLabel={successModal.actionLabel}
                onAction={closeSuccessModal}
                onClose={closeSuccessModal}
            />
        </>
    );
};

export default DepositButton;
