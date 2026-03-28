import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { PaymentResponse } from '../types';
import NotificationListener from './NotificationListener';
import WalletConnect from './WalletConnect';
import { FaPaperPlane, FaWallet, FaExchangeAlt, FaHistory, FaArrowUp, FaArrowDown, FaInfoCircle, FaCopy, FaCheckCircle, FaTimes, FaShoppingCart } from 'react-icons/fa';
import Web3 from 'web3';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

interface User {
    id?: number;
    username: string;
    walletAddress: string;
    fullName?: string;
}

// Thêm interface cho Product để TypeScript không la làng
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
    amount: number;
    status: string;
    transactionHash: string;
    timestamp: string;
    blockNumber?: number;
    product?: Product; // Thêm trường này để nhận dữ liệu JOIN từ backend
}

const Dashboard: React.FC = () => {
    const location = useLocation();
    const [toAddress, setToAddress] = useState('');
    const [amount, setAmount] = useState('');
    
    // State cho thông tin sản phẩm (nếu đi từ trang cửa hàng qua)
    const [productId, setProductId] = useState<number | null>(null);
    const [productName, setProductName] = useState('');
    const [priceEth, setPriceEth] = useState('');

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PaymentResponse | null>(null);
    
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [history, setHistory] = useState<TransactionHistory[]>([]);
    const [selectedTx, setSelectedTx] = useState<TransactionHistory | null>(null);
    
    const [, setBalance] = useState<string>('Đang tải...');
    const [, setCopied] = useState(false);

    useEffect(() => {
        if (location.state) {
            if (location.state.prefillAddress) {
                setToAddress(location.state.prefillAddress);
            }
            if (location.state.prefillAmount) {
                setAmount(location.state.prefillAmount);
            }
            // Lấy thông tin sản phẩm
            if (location.state.productId) {
                setProductId(location.state.productId);
            }
            if (location.state.productName) {
                setProductName(location.state.productName);
            }
            if (location.state.priceEth) {
                setPriceEth(location.state.priceEth);
            }
        }
        fetchDashboardData();
    }, [location.state]);

    const fetchDashboardData = async () => {
        try {
            const userRes = await axiosClient.get<User>('/users/me');
            setCurrentUser(userRes.data);
            localStorage.setItem('user', JSON.stringify(userRes.data));

            const historyRes = await axiosClient.get<TransactionHistory[]>('/users/history');
            setHistory(historyRes.data);

            if (userRes.data.walletAddress) {
                try {
                    const balRes = await axiosClient.get(`/payment/balance/${userRes.data.walletAddress}`);
                    setBalance(balRes.data.toString());
                } catch (err) {
                    console.error("Lấy số dư thất bại", err);
                    setBalance('0');
                }
            }
        } catch (error) {
            console.error("Lỗi tải dữ liệu Dashboard:", error);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const ethereum = (window as any).ethereum;
            if (!ethereum) throw new Error("Vui lòng cài đặt ví MetaMask!");

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            const activeAccount = accounts[0]; 

            const web3 = new Web3(ethereum);
            const contractAddress = "0xd9145CCE52D386f254917e481eB44e9943F39138"; 
            
            const contractABI = [
                {
                    "inputs": [{ "internalType": "address payable", "name": "to", "type": "address" }],
                    "name": "sendPayment",
                    "outputs": [],
                    "stateMutability": "payable",
                    "type": "function"
                }
            ];

            const contract = new web3.eth.Contract(contractABI, contractAddress);

            const receipt = await contract.methods.sendPayment(toAddress).send({ 
                from: activeAccount,
                value: amount 
            });

            const txHash = receipt.transactionHash as string;

            // 1. Lưu lịch sử giao dịch (Đã gộp luôn ID sản phẩm nếu có)
            await axiosClient.post('/payment/record', {
                toAddress,
                amount,
                transactionHash: txHash,
                productId: productId // Bắn productId xuống Backend ở đây nè
            });

            // Đã XÓA phần gọi API orders đi theo yêu cầu của bạn!

            setResult({
                status: 'SUCCESS',
                message: productName ? `Thanh toán đơn hàng "${productName}" thành công!` : 'Chuyển tiền thành công!',
                transactionHash: txHash
            });
            
            if (!productName) {
                setAmount('');
                setToAddress('');
            }
            fetchDashboardData(); 

        } catch (error: any) {
            console.error("Lỗi MetaMask:", error);
            alert('❌ Giao dịch thất bại: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const isPurchasing = !!productName;

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-20 relative text-slate-800">
            {currentUser && currentUser.walletAddress && (
                <NotificationListener walletAddress={currentUser.walletAddress} />
            )}

            <Navbar />

            <main className="max-w-7xl mx-auto px-6 sm:px-10 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* --- CỘT TRÁI (THÔNG TIN & KẾT NỐI VÍ) --- */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] rounded-[32px] shadow-xl shadow-[#6C5CE7]/20 p-6 text-white relative overflow-hidden">
                            <div className="absolute -right-10 -bottom-10 opacity-10"><FaWallet size={150} /></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <h5 className="font-black text-lg flex items-center gap-2"><FaWallet /> Ví Web3</h5>
                                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">MetaMask</span>
                                </div>
                                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
                                    <WalletConnect />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- CỘT PHẢI (CHUYỂN TIỀN & LỊCH SỬ) --- */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        
                        {/* Form Chuyển Tiền / Thanh Toán */}
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${isPurchasing ? 'bg-amber-100 text-amber-600' : 'bg-[#6C5CE7]/10 text-[#6C5CE7]'}`}>
                                    {isPurchasing ? <FaShoppingCart size={20} /> : <FaExchangeAlt size={20} />}
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-xl">
                                        {isPurchasing ? 'Thanh Toán Đơn Hàng' : 'Chuyển Tiền'}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1 font-medium">
                                        {isPurchasing ? 'Xác nhận giao dịch mua hàng qua Smart Contract' : 'Thực hiện giao dịch qua Smart Contract'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="p-6 sm:p-8">
                                {isPurchasing && (
                                    <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
                                        <h4 className="text-[11px] font-black text-amber-600 uppercase tracking-widest mb-3">Đơn hàng của bạn</h4>
                                        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-amber-100">
                                            <span className="font-bold text-slate-800 text-lg">{productName}</span>
                                            <span className="font-black text-xl text-amber-600">{priceEth} <span className="text-sm text-amber-500 font-bold">ETH</span></span>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleSend} className="flex flex-col gap-6">
                                    <div>
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block">
                                            {isPurchasing ? 'Địa chỉ Cửa hàng (Nhận tiền)' : 'Địa chỉ người nhận'}
                                        </label>
                                        <input 
                                            className={`w-full px-4 py-3.5 border rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all shadow-sm ${isPurchasing ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' : 'bg-slate-50 border-slate-200 text-slate-800'}`} 
                                            placeholder="0x..." 
                                            value={toAddress} 
                                            onChange={e => setToAddress(e.target.value)} 
                                            required 
                                            readOnly={isPurchasing}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block">Số tiền (Wei)</label>
                                        <input 
                                            type="number" 
                                            className={`w-full px-4 py-3.5 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all shadow-sm ${isPurchasing ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' : 'bg-slate-50 border-slate-200 text-slate-800'}`} 
                                            placeholder="Nhập số lượng WEI..." 
                                            value={amount} 
                                            onChange={e => setAmount(e.target.value)} 
                                            required 
                                            readOnly={isPurchasing}
                                        />
                                    </div>
                                    
                                    <button type="submit" className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${isPurchasing ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5' : 'bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] shadow-[#6C5CE7]/30 hover:shadow-[#6C5CE7]/50 hover:-translate-y-0.5'}`} disabled={loading}>
                                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><FaPaperPlane /> Xác nhận {isPurchasing ? 'Thanh Toán' : 'Giao Dịch'}</>}
                                    </button>
                                </form>

                                {result && (
                                    <div className={`mt-6 p-4 rounded-xl border ${result.status === 'SUCCESS' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                        <h6 className="font-bold mb-1 flex items-center gap-2">
                                            {result.status === 'SUCCESS' ? <FaCheckCircle /> : <FaTimes />}
                                            {result.status === 'SUCCESS' ? 'Giao dịch Thành Công!' : 'Giao dịch Thất Bại!'}
                                        </h6>
                                        <p className="text-sm opacity-90 mb-2">{result.message}</p>
                                        {result.transactionHash && (
                                            <div className="bg-white/50 p-2 rounded text-xs font-mono break-all border border-current/10">
                                                Hash: {result.transactionHash}
                                            </div>
                                        )}
                                        {isPurchasing && result.status === 'SUCCESS' && (
                                            <div className="mt-4">
                                                <Link to="/products" className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors">
                                                    Quay lại Cửa Hàng
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* --- BẢNG LỊCH SỬ GIAO DỊCH MỚI --- */}
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-slate-200 text-slate-600 rounded-xl"><FaHistory size={20} /></div>
                                    <h3 className="font-black text-slate-900 text-xl">Lịch sử giao dịch ví</h3>
                                </div>
                                <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{history.length} GD</span>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4">Hoạt động</th>
                                            <th className="px-6 py-4">Sản Phẩm / Đối tác</th>
                                            <th className="px-6 py-4">Số lượng</th>
                                            <th className="px-6 py-4">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 text-sm">
                                        {history.length > 0 ? history.map((tx) => {
                                            const isSender = currentUser?.walletAddress.toLowerCase() === tx.fromAddress.toLowerCase();
                                            return (
                                                <tr key={tx.id} onClick={() => setSelectedTx(tx)} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                                                    
                                                    {/* Cột 1: Hash và Loại GD */}
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-1.5">
                                                            {isSender 
                                                                ? <span className="inline-flex w-fit items-center gap-1.5 bg-red-50 text-red-600 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider"><FaArrowUp /> GỬI TIỀN</span>
                                                                : <span className="inline-flex w-fit items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider"><FaArrowDown /> NHẬN TIỀN</span>
                                                            }
                                                            <span className="font-mono text-slate-500 text-xs">...{tx.transactionHash?.slice(-8)}</span>
                                                        </div>
                                                    </td>

                                                    {/* Cột 2: Sản phẩm hoặc Ví đối tác */}
                                                    <td className="px-6 py-5">
                                                        {tx.product ? (
                                                            <div className="flex items-center gap-3">
                                                                <img src={tx.product.imageUrl} alt={tx.product.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                                                                <span className="font-bold text-slate-800 text-xs max-w-[150px] truncate">{tx.product.name}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="font-mono text-slate-500 text-xs truncate max-w-[120px] bg-white border border-slate-200 px-2 py-1 rounded-md group-hover:border-slate-300">
                                                                {isSender ? tx.toAddress : tx.fromAddress}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Cột 3: Số tiền */}
                                                    <td className="px-6 py-5">
                                                        <span className={`font-black ${isSender ? 'text-red-500' : 'text-emerald-500'}`}>
                                                            {isSender ? '-' : '+'}{tx.amount} <span className="text-[10px] text-slate-400">WEI</span>
                                                        </span>
                                                    </td>

                                                    {/* Cột 4: Trạng thái & Thời gian */}
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-1">
                                                            <span className={`inline-flex w-fit px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${tx.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : tx.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                                                {tx.status}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400">{new Date(tx.timestamp).toLocaleDateString('vi-VN')}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan={4} className="text-center text-slate-400 py-12 italic">Chưa có giao dịch nào trên mạng lưới.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* --- MODAL CHI TIẾT GIAO DỊCH (Đã thêm phần hiển thị Sản phẩm) --- */}
            {selectedTx && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setSelectedTx(null)}>
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden transform transition-all" onClick={e => e.stopPropagation()}>
                        
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h5 className="font-black text-slate-900 text-lg flex items-center gap-2">
                                <FaInfoCircle className="text-[#6C5CE7]" /> Chi Tiết Giao Dịch
                            </h5>
                            <button onClick={() => setSelectedTx(null)} className="p-2 bg-white text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-200 transition-colors"><FaTimes /></button>
                        </div>
                        
                        <div className="p-6 sm:p-8 flex flex-col gap-5">
                            <div className="text-center">
                                <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase ${selectedTx.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : selectedTx.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                    {selectedTx.status === 'SUCCESS' ? '✅ Thành Công' : selectedTx.status === 'PENDING' ? '⏳ Đang xử lý' : '❌ Thất Bại'}
                                </span>
                            </div>

                            {/* HIỂN THỊ SẢN PHẨM Ở MODAL (Nếu có) */}
                            {selectedTx.product && (
                                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-center gap-4">
                                    <img src={selectedTx.product.imageUrl} alt={selectedTx.product.name} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-amber-200" />
                                    <div>
                                        <small className="text-amber-600 font-bold text-[10px] uppercase tracking-widest block">Đơn hàng đã mua</small>
                                        <div className="font-bold text-slate-800 text-sm mt-0.5">{selectedTx.product.name}</div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <small className="text-[#6C5CE7] font-bold text-[10px] uppercase tracking-widest mb-1 block">Mã Hash (TxHash)</small>
                                <div className="font-mono text-xs text-slate-700 break-all bg-white p-2 rounded-lg border border-slate-200">
                                    {selectedTx.transactionHash || 'Chưa có trên mạng lưới'}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <small className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1 block">Từ (Người Gửi)</small>
                                    <div className="font-mono text-xs text-slate-600 truncate bg-slate-50 p-2.5 rounded-xl border border-slate-100">{selectedTx.fromAddress}</div>
                                </div>
                                <div>
                                    <small className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1 block">Đến (Người Nhận)</small>
                                    <div className="font-mono text-xs text-slate-600 truncate bg-slate-50 p-2.5 rounded-xl border border-slate-100">{selectedTx.toAddress}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 mt-2">
                                <div>
                                    <small className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1 block">Số Tiền</small>
                                    <div className="font-black text-xl text-[#6C5CE7]">{selectedTx.amount} <span className="text-xs text-slate-500">WEI</span></div>
                                </div>
                                <div>
                                    <small className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1 block">Block</small>
                                    <div className="font-bold text-lg text-slate-800">{selectedTx.blockNumber || '---'}</div>
                                </div>
                            </div>

                            <div className="text-center text-xs text-slate-400 font-medium mt-2">
                                {new Date(selectedTx.timestamp).toLocaleString('vi-VN')}
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50">
                            <button className="w-full py-3.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition-colors" onClick={() => setSelectedTx(null)}>Đóng Cửa Sổ</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;