import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { PaymentRequest, PaymentResponse } from '../types';
import NotificationListener from './NotificationListener';
import WalletConnect from './WalletConnect';
import { FaPaperPlane, FaWallet, FaSignOutAlt, FaExchangeAlt, FaUserCircle, FaHistory, FaArrowUp, FaArrowDown, FaInfoCircle, FaCopy, FaCheckCircle } from 'react-icons/fa';
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
    
    // Thêm State lưu số dư
    const [balance, setBalance] = useState<string>('Đang tải...');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // 1. Lấy thông tin User
            const userRes = await axiosClient.get<User>('/users/me');
            setCurrentUser(userRes.data);
            localStorage.setItem('user', JSON.stringify(userRes.data));

            // 2. Lấy Lịch sử giao dịch
            const historyRes = await axiosClient.get<TransactionHistory[]>('/users/history');
            setHistory(historyRes.data);

            // 3. Lấy Số dư từ Smart Contract (Dựa vào API vừa tạo)
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

            // --- ĐOẠN SỬA QUAN TRỌNG: ÉP METAMASK MỞ BẢNG CHỌN TÀI KHOẢN ---
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            const activeAccount = accounts[0]; // Lấy ví đang hiển thị trong MetaMask
            console.log("Ví đang hoạt động:", activeAccount);

            const web3 = new Web3(ethereum);
            const contractAddress = "0x155bF19F19Ce8EB4E6df40013168F22407FEC1e1"; 
            
            const contractABI = [
                {
                    "inputs": [
                        { "internalType": "address", "name": "to", "type": "address" },
                        { "internalType": "uint256", "name": "amount", "type": "uint256" }
                    ],
                    "name": "sendPayment",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                }
            ];

            const contract = new web3.eth.Contract(contractABI, contractAddress);

            // Gửi giao dịch với account vừa lấy được từ MetaMask (activeAccount)
            const receipt = await contract.methods.sendPayment(toAddress, amount).send({ 
                from: activeAccount 
            });

            const txHash = receipt.transactionHash as string;

            // Lưu vào Backend
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
        setTimeout(() => setCopied(false), 2000); // Tắt hiệu ứng copy sau 2 giây
    };

    const logout = () => {
        if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    }

    return (
        <div className="min-vh-100 py-4" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            {currentUser && currentUser.walletAddress && (
                <NotificationListener walletAddress={currentUser.walletAddress} />
            )}

            <div className="container">
                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-4 bg-white rounded-4 shadow-sm p-4">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow" style={{ width: '50px', height: '50px', fontSize: '24px' }}>🚀</div>
                        <div>
                            <h4 className="mb-0 fw-bold text-dark">ChainPay Dashboard</h4>
                            {currentUser && <small className="text-muted">Xin chào, <strong>{currentUser.username}</strong></small>}
                        </div>
                    </div>
                    <button onClick={logout} className="btn btn-outline-danger rounded-pill px-4">
                        <FaSignOutAlt className="me-2"/> Đăng Xuất
                    </button>
                </div>

                <div className="row g-4">
                    {/* --- CỘT TRÁI --- */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-4 text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <h5 className="mb-0 fw-bold"><FaWallet className="me-2"/> Ví Web3</h5>
                                    <span className="badge bg-white text-primary rounded-pill">MetaMask</span>
                                </div>
                                <div className="bg-white bg-opacity-25 p-3 rounded-3 mb-3">
                                    <WalletConnect />
                                </div>
                            </div>
                        </div>

                        {/* --- BẢNG THÔNG TIN TÀI KHOẢN (ĐÃ ĐƯỢC NÂNG CẤP) --- */}
                        <div className="card border-0 shadow-sm rounded-4 mb-4">
                            <div className="card-body p-4">
                                <h6 className="fw-bold text-muted text-uppercase mb-4 small"><FaInfoCircle className="me-1"/> Hồ Sơ Của Tôi</h6>
                                
                                {currentUser ? (
                                    <div>
                                        {/* Avatar & Tên */}
                                        <div className="d-flex align-items-center gap-3 mb-4">
                                            <FaUserCircle className="text-secondary opacity-75" style={{ fontSize: '3.5rem' }}/>
                                            <div style={{overflow: 'hidden'}}>
                                                <div className="fw-bold text-dark fs-5">{currentUser.fullName || 'Chưa cập nhật tên'}</div>
                                                <div className="small text-muted d-flex align-items-center gap-2 mt-1">
                                                    <span className="badge bg-light text-dark border">ID: #{currentUser.id || '---'}</span>
                                                    <span>@{currentUser.username}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Địa chỉ Ví */}
                                        <div className="bg-light p-3 rounded-3 border mb-3">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>Địa chỉ Ví Liên Kết</small>
                                                <button 
                                                    onClick={() => copyToClipboard(currentUser.walletAddress)} 
                                                    className="btn btn-sm btn-link text-decoration-none p-0"
                                                    title="Copy địa chỉ ví"
                                                >
                                                    {copied ? <FaCheckCircle className="text-success" /> : <FaCopy className="text-primary" />}
                                                </button>
                                            </div>
                                            <div className="font-monospace text-truncate text-dark fw-medium" style={{ fontSize: '0.85rem' }}>
                                                {currentUser.walletAddress}
                                            </div>
                                        </div>

                                        {/* Số dư hiện tại */}
                                        <div className="p-3 rounded-3 border" style={{ backgroundColor: '#f8f9ff', borderColor: '#dbeafe' }}>
                                            <small className="text-primary d-block text-uppercase fw-bold mb-1" style={{fontSize: '0.7rem'}}>Số dư khả dụng (Contract)</small>
                                            <div className="d-flex align-items-baseline gap-2">
                                                <span className="fw-bold fs-3 text-primary">{balance}</span>
                                                <span className="fw-bold text-primary opacity-75 small">WEI</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status"></div>
                                        <div className="mt-2 small text-muted">Đang tải thông tin...</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* --- CỘT PHẢI (Form gửi tiền & Lịch sử giữ nguyên như cũ) --- */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-lg rounded-4 mb-4">
                            <div className="card-header bg-white border-bottom-0 p-4 pb-0">
                                <h5 className="fw-bold text-primary"><FaExchangeAlt className="me-2"/> Chuyển Tiền</h5>
                            </div>
                            <div className="card-body p-4">
                                <form onSubmit={handleSend}>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-muted">Địa chỉ người nhận</label>
                                        <input className="form-control bg-light fs-6" placeholder="0x..." value={toAddress} onChange={e => setToAddress(e.target.value)} required />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-bold small text-muted">Số tiền (Wei)</label>
                                        <input type="number" className="form-control bg-light fs-6" placeholder="Nhập số WEI" value={amount} onChange={e => setAmount(e.target.value)} required />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 py-3 rounded-3 fw-bold shadow-sm" disabled={loading}>
                                        {loading ? "Đang xử lý trên Blockchain..." : <><FaPaperPlane className="me-2"/> Gửi Tiền Ngay</>}
                                    </button>
                                </form>

                                {result && (
                                    <div className={`alert mt-4 rounded-3 border-0 shadow-sm ${result.status === 'SUCCESS' ? 'alert-success' : 'alert-danger'}`}>
                                        <h6 className="fw-bold">{result.status === 'SUCCESS' ? '✅ Giao Dịch Thành Công!' : '❌ Giao Dịch Thất Bại'}</h6>
                                        <p className="mb-1 small">{result.message}</p>
                                        {result.transactionHash && <div className="small font-monospace">Hash: {result.transactionHash}</div>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* LỊCH SỬ GIAO DỊCH */}
                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-header bg-white border-bottom-0 p-4 pb-0 d-flex justify-content-between align-items-center">
                                <h5 className="fw-bold text-dark"><FaHistory className="me-2"/> Lịch sử giao dịch</h5>
                                <span className="badge bg-primary rounded-pill">{history.length} GD</span>
                            </div>
                            <div className="card-body p-4">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light text-muted small">
                                            <tr>
                                                <th>Loại</th>
                                                <th>Đối tác</th>
                                                <th>Số tiền (WEI)</th>
                                                <th>Trạng thái</th>
                                                <th>Thời gian</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.length > 0 ? history.map((tx) => {
                                                const isSender = currentUser?.walletAddress.toLowerCase() === tx.fromAddress.toLowerCase();
                                                return (
                                                    <tr key={tx.id} onClick={() => setSelectedTx(tx)} style={{ cursor: 'pointer', transition: 'background-color 0.2s' }} title="Nhấn để xem chi tiết">
                                                        <td>
                                                            {isSender ? 
                                                                <span className="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle"><FaArrowUp className="me-1"/> Gửi</span> : 
                                                                <span className="badge bg-success bg-opacity-10 text-success border border-success-subtle"><FaArrowDown className="me-1"/> Nhận</span>
                                                            }
                                                        </td>
                                                        <td className="font-monospace small text-truncate" style={{maxWidth: '150px'}}>
                                                            {isSender ? tx.toAddress : tx.fromAddress}
                                                        </td>
                                                        <td className={`fw-bold ${isSender ? 'text-danger' : 'text-success'}`}>
                                                            {isSender ? '-' : '+'}{tx.amount}
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${tx.status === 'SUCCESS' ? 'bg-success' : tx.status === 'PENDING' ? 'bg-warning' : 'bg-danger'}`}>
                                                                {tx.status}
                                                            </span>
                                                        </td>
                                                        <td className="small text-muted">
                                                            {new Date(tx.timestamp).toLocaleString('vi-VN')}
                                                        </td>
                                                    </tr>
                                                );
                                            }) : (
                                                <tr>
                                                    <td colSpan={5} className="text-center text-muted py-4">Chưa có giao dịch nào.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL CHI TIẾT GIAO DỊCH */}
            {selectedTx && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050, backdropFilter: 'blur(3px)' }} onClick={() => setSelectedTx(null)}>
                    <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                            <div className="modal-header bg-light border-bottom-0 p-4 pb-3">
                                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                                    <FaInfoCircle className="text-primary" /> Chi Tiết Giao Dịch
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setSelectedTx(null)}></button>
                            </div>
                            <div className="modal-body p-4 pt-2">
                                <div className="text-center mb-4">
                                    <span className={`badge fs-6 px-4 py-2 rounded-pill ${selectedTx.status === 'SUCCESS' ? 'bg-success' : selectedTx.status === 'PENDING' ? 'bg-warning' : 'bg-danger'}`}>
                                        {selectedTx.status === 'SUCCESS' ? '✅ THÀNH CÔNG' : selectedTx.status === 'PENDING' ? '⏳ ĐANG XỬ LÝ' : '❌ THẤT BẠI'}
                                    </span>
                                </div>
                                <div className="bg-light p-3 rounded-3 mb-3 border">
                                    <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{fontSize: '0.7rem'}}>Mã Hash (TxHash)</small>
                                    <div className="font-monospace text-break small text-dark">
                                        {selectedTx.transactionHash || 'Chưa có trên mạng lưới'}
                                    </div>
                                </div>
                                <div className="row g-3 mb-3">
                                    <div className="col-12">
                                        <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{fontSize: '0.7rem'}}>Từ (Người Gửi)</small>
                                        <div className="font-monospace small text-truncate bg-light p-2 rounded border">{selectedTx.fromAddress}</div>
                                    </div>
                                    <div className="col-12">
                                        <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{fontSize: '0.7rem'}}>Đến (Người Nhận)</small>
                                        <div className="font-monospace small text-truncate bg-light p-2 rounded border">{selectedTx.toAddress}</div>
                                    </div>
                                </div>
                                <div className="row g-3">
                                    <div className="col-6">
                                        <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{fontSize: '0.7rem'}}>Số Tiền</small>
                                        <div className="fw-bold fs-5 text-primary">{selectedTx.amount} <span className="fs-6 text-muted">WEI</span></div>
                                    </div>
                                    <div className="col-6">
                                        <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{fontSize: '0.7rem'}}>Số Block</small>
                                        <div className="fw-bold text-dark fs-5">{selectedTx.blockNumber || '---'}</div>
                                    </div>
                                </div>
                                <hr className="my-3 text-muted" />
                                <div>
                                    <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{fontSize: '0.7rem'}}>Thời gian tạo</small>
                                    <div className="text-dark fw-medium">{new Date(selectedTx.timestamp).toLocaleString('vi-VN')}</div>
                                </div>
                            </div>
                            <div className="modal-footer border-top-0 p-4 pt-0">
                                <button type="button" className="btn btn-secondary w-100 py-2 rounded-3 fw-bold" onClick={() => setSelectedTx(null)}>Đóng Cửa Sổ</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;