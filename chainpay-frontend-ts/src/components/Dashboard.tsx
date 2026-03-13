import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { PaymentRequest, PaymentResponse } from '../types';
import NotificationListener from './NotificationListener';
import WalletConnect from './WalletConnect';
import { FaPaperPlane, FaWallet, FaSignOutAlt, FaExchangeAlt, FaHistory, FaArrowUp, FaArrowDown, FaInfoCircle, FaCopy, FaCheckCircle, FaCubes, FaTimes } from 'react-icons/fa';
import Web3 from 'web3';

interface User {
    id?: number;
    username: string;
    walletAddress: string;
    fullName?: string;
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
}

const Dashboard: React.FC = () => {
    const [toAddress, setToAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PaymentResponse | null>(null);
    
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [history, setHistory] = useState<TransactionHistory[]>([]);
    const [selectedTx, setSelectedTx] = useState<TransactionHistory | null>(null);
    
    const [balance, setBalance] = useState<string>('Đang tải...');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

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

            await axiosClient.post('/payment/record', {
                toAddress,
                amount,
                transactionHash: txHash
            });

            setResult({
                status: 'SUCCESS',
                message: 'Chuyển tiền thành công!',
                transactionHash: txHash
            });
            
            setAmount('');
            setToAddress('');
            fetchDashboardData(); 

        } catch (error: any) {
            console.error("Lỗi MetaMask:", error);
            alert('❌ Giao dịch thất bại: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); 
    };

    const logout = () => {
        if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-20 relative text-slate-800">
            {currentUser && currentUser.walletAddress && (
                <NotificationListener walletAddress={currentUser.walletAddress} />
            )}

            {/* --- NAVBAR --- */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 sm:px-10 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] p-2.5 rounded-xl text-white shadow-lg shadow-[#6C5CE7]/30">
                        <FaCubes size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">ChainPay <span className="font-light">Wallet</span></h1>
                        {currentUser && <span className="text-[10px] uppercase tracking-widest text-[#6C5CE7] font-bold mt-0.5 block">Hi, @{currentUser.username}</span>}
                    </div>
                </div>
                <button onClick={logout} className="flex items-center gap-2 bg-white hover:bg-red-50 text-slate-600 hover:text-red-500 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 border border-slate-200 shadow-sm">
                    <FaSignOutAlt /> <span className="hidden sm:inline">Đăng Xuất</span>
                </button>
            </nav>

            <main className="max-w-7xl mx-auto px-6 sm:px-10 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* --- CỘT TRÁI (THÔNG TIN & KẾT NỐI VÍ) --- */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        
                        {/* Box Kết nối ví (Gradient Tím) */}
                        <div className="bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] rounded-[32px] shadow-xl shadow-[#6C5CE7]/20 p-6 text-white relative overflow-hidden">
                            <div className="absolute -right-10 -bottom-10 opacity-10">
                                <FaWallet size={150} />
                            </div>
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

                        {/* Box Hồ sơ của tôi */}
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-6">
                            <h6 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-6 uppercase tracking-wider">
                                <FaInfoCircle className="text-[#6C5CE7]" /> Hồ Sơ Của Tôi
                            </h6>
                            
                            {currentUser ? (
                                <div className="flex flex-col gap-6">
                                    {/* Avatar & Tên */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-[#6C5CE7]/10 text-[#6C5CE7] rounded-full flex items-center justify-center font-black text-2xl shadow-inner">
                                            {currentUser.fullName ? currentUser.fullName.charAt(0) : 'U'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 text-lg leading-tight">{currentUser.fullName || 'Chưa cập nhật tên'}</div>
                                            <div className="text-xs text-slate-400 mt-1 flex gap-2">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">ID: #{currentUser.id}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Địa chỉ Ví */}
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group">
                                        <div className="flex justify-between items-center mb-1">
                                            <small className="text-[#6C5CE7] font-bold text-[10px] uppercase tracking-widest">Địa chỉ Ví Liên Kết</small>
                                            <button onClick={() => copyToClipboard(currentUser.walletAddress)} className="text-slate-400 hover:text-[#6C5CE7] transition-colors" title="Copy địa chỉ ví">
                                                {copied ? <FaCheckCircle className="text-emerald-500" /> : <FaCopy />}
                                            </button>
                                        </div>
                                        <div className="font-mono text-xs text-slate-600 truncate bg-white p-2 rounded-lg border border-slate-200">
                                            {currentUser.walletAddress}
                                        </div>
                                    </div>

                                    {/* Số dư hiện tại */}
                                    <div className="bg-[#6C5CE7]/5 p-5 rounded-2xl border border-[#6C5CE7]/20">
                                        <small className="text-[#6C5CE7] font-bold text-[10px] uppercase tracking-widest mb-1 block">Số dư khả dụng (Contract)</small>
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-black text-3xl text-slate-900">{balance}</span>
                                            <span className="font-bold text-slate-400 text-xs">WEI</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-8 h-8 border-4 border-[#6C5CE7]/30 border-t-[#6C5CE7] rounded-full animate-spin mx-auto mb-3"></div>
                                    <div className="text-sm text-slate-400 font-medium">Đang tải thông tin...</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- CỘT PHẢI (CHUYỂN TIỀN & LỊCH SỬ) --- */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        
                        {/* Form Chuyển Tiền */}
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center gap-3">
                                <div className="p-2.5 bg-[#6C5CE7]/10 text-[#6C5CE7] rounded-xl">
                                    <FaExchangeAlt size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-xl">Chuyển Tiền</h3>
                                    <p className="text-xs text-slate-400 mt-1 font-medium">Thực hiện giao dịch qua Smart Contract</p>
                                </div>
                            </div>
                            
                            <div className="p-6 sm:p-8">
                                <form onSubmit={handleSend} className="flex flex-col gap-6">
                                    <div>
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block">Địa chỉ người nhận</label>
                                        <input className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all text-slate-800 shadow-sm" placeholder="0x..." value={toAddress} onChange={e => setToAddress(e.target.value)} required />
                                    </div>
                                    
                                    <div>
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block">Số tiền (Wei)</label>
                                        <input type="number" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all text-slate-800 shadow-sm" placeholder="Nhập số lượng WEI..." value={amount} onChange={e => setAmount(e.target.value)} required />
                                    </div>
                                    
                                    <button type="submit" className="w-full py-4 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] text-white font-bold rounded-xl shadow-lg shadow-[#6C5CE7]/30 hover:shadow-[#6C5CE7]/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2" disabled={loading}>
                                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><FaPaperPlane /> Xác nhận Giao dịch</>}
                                    </button>
                                </form>

                                {/* Kết quả Giao dịch */}
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
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bảng Lịch sử giao dịch */}
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-slate-200 text-slate-600 rounded-xl"><FaHistory size={20} /></div>
                                    <h3 className="font-black text-slate-900 text-xl">Lịch sử giao dịch</h3>
                                </div>
                                <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{history.length} GD</span>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4">Hoạt động</th>
                                            <th className="px-6 py-4">Đối tác</th>
                                            <th className="px-6 py-4">Số lượng</th>
                                            <th className="px-6 py-4">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 text-sm">
                                        {history.length > 0 ? history.map((tx) => {
                                            const isSender = currentUser?.walletAddress.toLowerCase() === tx.fromAddress.toLowerCase();
                                            return (
                                                <tr key={tx.id} onClick={() => setSelectedTx(tx)} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                                                    <td className="px-6 py-5">
                                                        {isSender 
                                                            ? <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider"><FaArrowUp /> GỬI</span>
                                                            : <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider"><FaArrowDown /> NHẬN</span>
                                                        }
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="font-mono text-slate-500 text-xs truncate max-w-[120px] bg-white border border-slate-200 px-2 py-1 rounded-md group-hover:border-slate-300">
                                                            {isSender ? tx.toAddress : tx.fromAddress}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={`font-black ${isSender ? 'text-red-500' : 'text-emerald-500'}`}>
                                                            {isSender ? '-' : '+'}{tx.amount} <span className="text-[10px] text-slate-400">WEI</span>
                                                        </span>
                                                    </td>
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

            {/* --- MODAL CHI TIẾT GIAO DỊCH (Tailwind) --- */}
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