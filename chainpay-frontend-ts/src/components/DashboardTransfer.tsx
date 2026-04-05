import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import Web3 from 'web3';
import { FaExchangeAlt, FaPaperPlane, FaShoppingCart, FaWallet } from 'react-icons/fa';

import { axiosClient } from '../api';
import { CONTRACT_BALANCE_UPDATED_EVENT, getChainPayContract } from '../blockchain/chainPayContract';
import { commonText, dashboardText } from '../text';
import type { DashboardOutletContext, PurchaseLocationState } from './DashboardTypes';
import SuccessModal from './SuccessModal';

interface SuccessModalState {
    isOpen: boolean;
    title: string;
    content: React.ReactNode;
    actionLabel: string;
    actionMode: 'shopping' | 'transfer';
}

const DashboardTransfer: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const purchaseState = (location.state ?? {}) as PurchaseLocationState;
    const { currentUser, publicConfig, loading: pageLoading, refreshDashboardData } = useOutletContext<DashboardOutletContext>();

    const [toAddress, setToAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [productId, setProductId] = useState<number | null>(null);
    const [productName, setProductName] = useState('');
    const [priceEth, setPriceEth] = useState('');
    const [loading, setLoading] = useState(false);
    const [successModal, setSuccessModal] = useState<SuccessModalState>({
        isOpen: false,
        title: '',
        content: null,
        actionLabel: '',
        actionMode: 'transfer'
    });

    const isPurchasing = !!productName;

    useEffect(() => {
        setToAddress(purchaseState.prefillAddress ?? '');
        setAmount(purchaseState.prefillAmount ?? '');
        setProductId(purchaseState.productId ?? null);
        setProductName(purchaseState.productName ?? '');
        setPriceEth(purchaseState.priceEth ?? '');
        setSuccessModal((previousState) => ({
            ...previousState,
            isOpen: false
        }));
    }, [
        purchaseState.prefillAddress,
        purchaseState.prefillAmount,
        purchaseState.productId,
        purchaseState.productName,
        purchaseState.priceEth
    ]);

    const ensureExpectedNetwork = async (ethereum: any) => {
        if (!publicConfig?.chainId) return;

        const activeChainId = await ethereum.request({ method: 'eth_chainId' });
        const parsedChainId = Number(publicConfig.chainId);

        if (!Number.isFinite(parsedChainId)) return;

        const expectedChainId = `0x${parsedChainId.toString(16)}`;
        if (String(activeChainId).toLowerCase() !== expectedChainId.toLowerCase()) {
            throw new Error(dashboardText.transfer.errors.wrongChain(publicConfig.chainId));
        }
    };

    const handleSend = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);

        try {
            const ethereum = (window as any).ethereum;
            if (!ethereum) throw new Error(dashboardText.transfer.errors.missingMetaMask);

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            const activeAccount = accounts?.[0];
            if (!activeAccount) throw new Error(dashboardText.transfer.errors.missingActiveAccount);

            await ensureExpectedNetwork(ethereum);

            const web3 = new Web3(ethereum);
            const trimmedAmount = amount.trim();

            if (!web3.utils.isAddress(toAddress)) throw new Error(dashboardText.transfer.errors.invalidAddress);
            if (!publicConfig?.contractAddress) throw new Error(dashboardText.transfer.errors.missingContractAddress);
            if (!web3.utils.isAddress(publicConfig.contractAddress)) throw new Error(dashboardText.transfer.errors.invalidContractAddress);
            if (!/^\d+$/.test(trimmedAmount) || /^0+$/.test(trimmedAmount)) {
                throw new Error(dashboardText.transfer.errors.invalidAmount);
            }
            if (currentUser?.walletAddress && currentUser.walletAddress.toLowerCase() !== String(activeAccount).toLowerCase()) {
                throw new Error(dashboardText.transfer.errors.walletMismatch);
            }

            const contract = getChainPayContract(web3, publicConfig.contractAddress);
            const receipt = await contract.methods.sendPayment(toAddress, trimmedAmount).send({
                from: activeAccount
            });

            const txHash = String(receipt.transactionHash ?? '');
            if (!txHash) throw new Error(dashboardText.transfer.errors.missingTransactionHash);

            await axiosClient.post('/payment/record', {
                toAddress,
                amount: trimmedAmount,
                transactionHash: txHash,
                productId
            });

            if (isPurchasing) {
                setSuccessModal({
                    isOpen: true,
                    title: dashboardText.transfer.purchaseSuccessTitle,
                    content: (
                        <p>{dashboardText.transfer.purchaseSuccessMessage(productName, priceEth)}</p>
                    ),
                    actionLabel: dashboardText.transfer.purchaseSuccessAction,
                    actionMode: 'shopping'
                });
            } else {
                setSuccessModal({
                    isOpen: true,
                    title: dashboardText.transfer.transferSuccessTitle,
                    content: <p>{dashboardText.transfer.transferSuccessMessage(trimmedAmount, toAddress)}</p>,
                    actionLabel: dashboardText.transfer.transferSuccessAction,
                    actionMode: 'transfer'
                });
                setToAddress('');
                setAmount('');
            }

            window.dispatchEvent(new CustomEvent(CONTRACT_BALANCE_UPDATED_EVENT));
            await refreshDashboardData();
        } catch (error: any) {
            console.error(error);
            const errorMessage = error?.code === 4001
                ? dashboardText.transfer.errors.rejected
                : error?.message || dashboardText.transfer.errors.generic;
            alert(dashboardText.transfer.errors.failedPrefix + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSuccessModal = () => {
        setSuccessModal((previousState) => ({
            ...previousState,
            isOpen: false
        }));
    };

    const handleSuccessAction = () => {
        if (successModal.actionMode === 'shopping') {
            handleCloseSuccessModal();
            navigate('/products');
            return;
        }

        handleCloseSuccessModal();
    };

    return (
        <>
            <SuccessModal
                isOpen={successModal.isOpen}
                title={successModal.title}
                content={successModal.content}
                actionLabel={successModal.actionLabel}
                onAction={handleSuccessAction}
                onClose={handleCloseSuccessModal}
            />

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-6">
                    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-[#6C5CE7]/10 p-3 text-[#6C5CE7]">
                                <FaWallet size={18} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">{dashboardText.transfer.sourceTitle}</h3>
                                <p className="mt-1 text-sm font-medium text-slate-500">{dashboardText.transfer.sourceDescription}</p>
                            </div>
                        </div>

                        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                            <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">{commonText.labels.registeredWallet}</div>
                            <div className="mt-3 break-all font-mono text-sm text-slate-700">
                                {currentUser?.walletAddress ?? (pageLoading ? commonText.states.loadingData : dashboardText.transfer.noRegisteredWallet)}
                            </div>
                        </div>

                        <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                            <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">{commonText.labels.network}</div>
                            <div className="mt-3 text-lg font-black text-slate-900">
                                {commonText.labels.chainId} {publicConfig?.chainId ?? (pageLoading ? '...' : '--')}
                            </div>
                            <div className="mt-2 text-sm font-medium text-slate-500">
                                {dashboardText.transfer.networkHint}
                            </div>
                        </div>
                    </div>

                    {isPurchasing && (
                        <div className="rounded-[32px] border border-amber-200 bg-amber-50 p-6 shadow-sm sm:p-8">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-amber-100 p-3 text-amber-600">
                                    <FaShoppingCart size={18} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">{dashboardText.transfer.orderTitle}</h3>
                                    <p className="mt-1 text-sm font-medium text-slate-500">{dashboardText.transfer.orderDescription}</p>
                                </div>
                            </div>

                            <div className="mt-6 rounded-[24px] border border-amber-200 bg-white p-5">
                                <div className="font-black text-slate-900">{productName}</div>
                                <div className="mt-2 text-sm font-medium text-slate-500">{priceEth} {commonText.labels.eth}</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 p-6 sm:p-8">
                        <div className="flex items-center gap-3">
                            <div className={`rounded-2xl p-3 ${isPurchasing ? 'bg-amber-100 text-amber-600' : 'bg-[#6C5CE7]/10 text-[#6C5CE7]'}`}>
                                {isPurchasing ? <FaShoppingCart size={18} /> : <FaExchangeAlt size={18} />}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">
                                    {isPurchasing ? dashboardText.transfer.paymentTitle : dashboardText.transfer.transferTitle}
                                </h3>
                                <p className="mt-1 text-sm font-medium text-slate-500">
                                    {isPurchasing ? dashboardText.transfer.paymentDescription : dashboardText.transfer.transferDescription}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8">
                        <form onSubmit={handleSend} className="space-y-5">
                            <div>
                                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">
                                    {isPurchasing ? dashboardText.transfer.storeAddressLabel : dashboardText.transfer.receiverAddressLabel}
                                </label>
                                <input
                                    className={`w-full rounded-2xl border px-4 py-3.5 text-sm font-mono outline-none transition-all focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/20 ${isPurchasing ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500' : 'border-slate-200 bg-slate-50 text-slate-800'}`}
                                    placeholder={dashboardText.transfer.addressPlaceholder}
                                    value={toAddress}
                                    onChange={(event) => setToAddress(event.target.value)}
                                    required
                                    readOnly={isPurchasing}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">
                                    {dashboardText.transfer.amountLabel}
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    className={`w-full rounded-2xl border px-4 py-3.5 text-sm font-bold outline-none transition-all focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/20 ${isPurchasing ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500' : 'border-slate-200 bg-slate-50 text-slate-800'}`}
                                    placeholder={dashboardText.transfer.amountPlaceholder}
                                    value={amount}
                                    onChange={(event) => setAmount(event.target.value)}
                                    required
                                    readOnly={isPurchasing}
                                />
                            </div>

                            <button
                                type="submit"
                                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black text-white shadow-lg transition-all ${isPurchasing ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/20' : 'bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] shadow-[#6C5CE7]/20'}`}
                                disabled={loading}
                            >
                                {loading ? commonText.states.processing : (
                                    <>
                                        <FaPaperPlane />
                                        {isPurchasing ? dashboardText.transfer.confirmPayment : dashboardText.transfer.confirmTransaction}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
};

export default DashboardTransfer;
