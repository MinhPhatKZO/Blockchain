import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Web3 from 'web3';
import { FaCheckCircle, FaExchangeAlt, FaHistory, FaPaperPlane, FaShoppingCart, FaWallet } from 'react-icons/fa';

import axiosClient from '../api/axiosClient';
import { fetchPublicConfig, PublicConfig } from '../api/publicConfig';
import { PaymentResponse } from '../types';
import Navbar from './Navbar';
import NotificationListener from './NotificationListener';
import WalletConnect from './WalletConnect';

interface User {
    id?: number;
    username: string;
    walletAddress: string;
    fullName?: string;
}

interface Product {
    id: number;
    name: string;
    imageUrl: string;
    priceEth: string;
    priceWei: string;
}

interface TransactionHistory {
    id: number;
    fromAddress: string;
    toAddress: string;
    amount: string | number;
    status: string;
    transactionHash: string;
    timestamp: string;
    product?: Product;
}

interface PurchaseLocationState {
    prefillAmount?: string;
    prefillAddress?: string;
    productId?: number;
    productName?: string;
    priceEth?: string;
}

const Dashboard: React.FC = () => {
    const location = useLocation();
    const purchaseState = (location.state ?? {}) as PurchaseLocationState;

    const [toAddress, setToAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [productId, setProductId] = useState<number | null>(null);
    const [productName, setProductName] = useState('');
    const [priceEth, setPriceEth] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PaymentResponse | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [history, setHistory] = useState<TransactionHistory[]>([]);
    const [publicConfig, setPublicConfig] = useState<PublicConfig | null>(null);

    const isPurchasing = !!productName;

    useEffect(() => {
        setToAddress(purchaseState.prefillAddress ?? '');
        setAmount(purchaseState.prefillAmount ?? '');
        setProductId(purchaseState.productId ?? null);
        setProductName(purchaseState.productName ?? '');
        setPriceEth(purchaseState.priceEth ?? '');
        fetchDashboardData();
    }, [
        purchaseState.prefillAddress,
        purchaseState.prefillAmount,
        purchaseState.productId,
        purchaseState.productName,
        purchaseState.priceEth
    ]);

    const fetchDashboardData = async () => {
        try {
            const [configRes, userRes, historyRes] = await Promise.all([
                fetchPublicConfig(),
                axiosClient.get<User>('/users/me'),
                axiosClient.get<TransactionHistory[]>('/users/history')
            ]);

            setPublicConfig(configRes);
            setCurrentUser(userRes.data);
            setHistory(historyRes.data);
            localStorage.setItem('user', JSON.stringify(userRes.data));
        } catch (error) {
            console.error('Loi tai Dashboard:', error);
        }
    };

    const ensureExpectedNetwork = async (ethereum: any) => {
        if (!publicConfig?.chainId) return;

        const activeChainId = await ethereum.request({ method: 'eth_chainId' });
        const parsedChainId = Number(publicConfig.chainId);
        if (!Number.isFinite(parsedChainId)) return;
        const expectedChainId = `0x${parsedChainId.toString(16)}`;

        if (activeChainId.toLowerCase() !== expectedChainId.toLowerCase()) {
            throw new Error(`Vui long chuyen MetaMask sang dung mang ChainPay (chainId ${publicConfig.chainId}).`);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const ethereum = (window as any).ethereum;
            if (!ethereum) throw new Error('Vui long cai dat vi MetaMask!');

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            const activeAccount = accounts?.[0];
            if (!activeAccount) throw new Error('Khong tim thay tai khoan MetaMask dang hoat dong.');

            await ensureExpectedNetwork(ethereum);

            const web3 = new Web3(ethereum);
            const trimmedAmount = amount.trim();

            if (!web3.utils.isAddress(toAddress)) throw new Error('Dia chi nhan khong hop le.');
            if (!/^\d+$/.test(trimmedAmount) || /^0+$/.test(trimmedAmount)) {
                throw new Error('So tien thanh toan khong hop le.');
            }
            if (currentUser?.walletAddress && currentUser.walletAddress.toLowerCase() !== activeAccount.toLowerCase()) {
                throw new Error('Tai khoan MetaMask hien tai khong trung voi vi da dang ky.');
            }

            let txHash = '';

            if (isPurchasing) {
                const receipt = await web3.eth.sendTransaction({
                    from: activeAccount,
                    to: toAddress,
                    value: trimmedAmount
                });
                txHash = String(receipt.transactionHash ?? '');
            } else {
                const contractAddress = publicConfig?.contractAddress;
                if (!contractAddress) throw new Error('Chua tai duoc cau hinh smart contract.');

                const contractABI = [
                    {
                        inputs: [
                            { internalType: 'address', name: 'to', type: 'address' },
                            { internalType: 'uint256', name: 'amount', type: 'uint256' }
                        ],
                        name: 'sendPayment',
                        outputs: [],
                        stateMutability: 'nonpayable',
                        type: 'function'
                    }
                ];

                const contract = new web3.eth.Contract(contractABI as any, contractAddress);
                const receipt = await contract.methods.sendPayment(toAddress, trimmedAmount).send({ from: activeAccount });
                txHash = String(receipt.transactionHash ?? '');
            }

            if (!txHash) throw new Error('Khong nhan duoc transaction hash tu MetaMask.');

            await axiosClient.post('/payment/record', {
                toAddress,
                amount: trimmedAmount,
                transactionHash: txHash,
                productId
            });

            setResult({
                status: 'SUCCESS',
                message: isPurchasing
                    ? `Thanh toan don hang "${productName}" qua MetaMask thanh cong!`
                    : 'Chuyen tien thanh cong!',
                transactionHash: txHash
            });

            if (!isPurchasing) {
                setToAddress('');
                setAmount('');
            }

            fetchDashboardData();
        } catch (error: any) {
            console.error('Loi MetaMask:', error);
            const errorMessage = error?.code === 4001
                ? 'Ban da tu choi giao dich trong MetaMask.'
                : error?.message || 'Khong the gui giao dich.';
            alert(`Giao dich that bai: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-20 text-slate-800">
            {currentUser?.walletAddress && <NotificationListener walletAddress={currentUser.walletAddress} />}
            <Navbar />

            <main className="max-w-6xl mx-auto px-6 sm:px-10 py-10 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">
                <section className="bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] rounded-[32px] shadow-xl shadow-[#6C5CE7]/20 p-6 text-white h-fit">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-black text-lg flex items-center gap-2"><FaWallet /> Vi Web3</h2>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">MetaMask</span>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                        <WalletConnect />
                    </div>
                    {currentUser?.walletAddress && (
                        <div className="mt-4 text-xs bg-white/10 rounded-2xl p-4 border border-white/20">
                            <div className="font-bold mb-2">Vi da dang ky</div>
                            <div className="font-mono break-all">{currentUser.walletAddress}</div>
                        </div>
                    )}
                </section>

                <section className="space-y-8">
                    <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${isPurchasing ? 'bg-amber-100 text-amber-600' : 'bg-[#6C5CE7]/10 text-[#6C5CE7]'}`}>
                                {isPurchasing ? <FaShoppingCart size={20} /> : <FaExchangeAlt size={20} />}
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 text-xl">
                                    {isPurchasing ? 'Thanh toan don hang' : 'Chuyen tien'}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1 font-medium">
                                    {isPurchasing
                                        ? 'Thanh toan truc tiep tu MetaMask toi vi cua hang'
                                        : 'Giao dich thong qua smart contract'}
                                </p>
                            </div>
                        </div>

                        <div className="p-6 sm:p-8">
                            {isPurchasing && (
                                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
                                    <div className="text-[11px] font-black text-amber-600 uppercase tracking-widest mb-3">Don hang cua ban</div>
                                    <div className="flex items-center justify-between bg-white border border-amber-100 rounded-xl p-4">
                                        <span className="font-bold text-slate-900">{productName}</span>
                                        <span className="font-black text-amber-600">{priceEth} ETH</span>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSend} className="space-y-5">
                                <div>
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block">
                                        {isPurchasing ? 'Dia chi cua hang' : 'Dia chi nguoi nhan'}
                                    </label>
                                    <input
                                        className={`w-full px-4 py-3.5 border rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all ${isPurchasing ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                                        placeholder="0x..."
                                        value={toAddress}
                                        onChange={(e) => setToAddress(e.target.value)}
                                        required
                                        readOnly={isPurchasing}
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block">
                                        So tien (Wei)
                                    </label>
                                    <input
                                        type="number"
                                        className={`w-full px-4 py-3.5 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all ${isPurchasing ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                                        placeholder="Nhap so luong WEI..."
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                        readOnly={isPurchasing}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${isPurchasing ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE]'}`}
                                    disabled={loading}
                                >
                                    {loading ? 'Dang xu ly...' : <><FaPaperPlane /> Xac nhan {isPurchasing ? 'Thanh toan' : 'Giao dich'}</>}
                                </button>
                            </form>

                            {result && (
                                <div className="mt-6 p-4 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-800">
                                    <div className="font-bold mb-2 flex items-center gap-2">
                                        <FaCheckCircle /> {result.message}
                                    </div>
                                    <div className="text-xs font-mono break-all bg-white/60 border border-emerald-100 rounded-lg p-2">
                                        {result.transactionHash}
                                    </div>
                                    {isPurchasing && (
                                        <div className="mt-4">
                                            <Link to="/products" className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors">
                                                Quay lai cua hang
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center gap-3">
                            <div className="p-2.5 bg-slate-200 text-slate-600 rounded-xl"><FaHistory size={20} /></div>
                            <h3 className="font-black text-slate-900 text-xl">Lich su giao dich</h3>
                        </div>

                        <div className="p-6 sm:p-8 space-y-4">
                            {history.length > 0 ? history.map((tx) => {
                                const isSender = currentUser?.walletAddress?.toLowerCase() === tx.fromAddress.toLowerCase();
                                return (
                                    <div key={tx.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <div className="font-bold text-slate-900">
                                                    {tx.product ? tx.product.name : (isSender ? tx.toAddress : tx.fromAddress)}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    {new Date(tx.timestamp).toLocaleString('vi-VN')}
                                                </div>
                                            </div>
                                            <div className={`font-black ${isSender ? 'text-red-500' : 'text-emerald-500'}`}>
                                                {isSender ? '-' : '+'}{tx.amount} WEI
                                            </div>
                                        </div>
                                        <div className="mt-3 text-xs font-mono text-slate-500 break-all">{tx.transactionHash}</div>
                                        <div className="mt-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">{tx.status}</div>
                                    </div>
                                );
                            }) : (
                                <div className="text-center text-slate-400 py-8 italic">Chua co giao dich nao.</div>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
