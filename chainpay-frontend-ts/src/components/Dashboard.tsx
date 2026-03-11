import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { PaymentRequest, PaymentResponse } from '../types';
import NotificationListener from './NotificationListener';
import WalletConnect from './WalletConnect';
// Import Icons
import { FaPaperPlane, FaWallet, FaSignOutAlt, FaExchangeAlt, FaUserCircle, FaHistory } from 'react-icons/fa';

// Định nghĩa User
interface User {
    username: string;
    walletAddress: string;
    fullName?: string;
}

const Dashboard: React.FC = () => {
    const [toAddress, setToAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PaymentResponse | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // Load User từ LocalStorage
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const userObj = JSON.parse(userStr);
                setCurrentUser(userObj);
            } catch (e) {
                console.error("Lỗi đọc user từ storage", e);
            }
        }
    }, []);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const request: PaymentRequest = { toAddress, amount };
            const response = await axiosClient.post<PaymentResponse>('/payment/send', request);
            setResult(response.data);
            
            if(response.data.status === 'SUCCESS') {
                setAmount('');
            }
        } catch (error: any) {
            alert('❌ Giao dịch thất bại: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    }

    return (
        <div className="min-vh-100 py-4" 
             style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            
            {/* --- LẮNG NGHE THÔNG BÁO NGẦM --- */}
            {currentUser && currentUser.walletAddress && (
                <NotificationListener walletAddress={currentUser.walletAddress} />
            )}

            <div className="container">
                {/* --- HEADER --- */}
                <div className="d-flex justify-content-between align-items-center mb-5 bg-white rounded-4 shadow-sm p-4">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow" 
                             style={{ width: '50px', height: '50px', fontSize: '24px' }}>
                            🚀
                        </div>
                        <div>
                            <h4 className="mb-0 fw-bold text-dark">ChainPay Dashboard</h4>
                            {currentUser && <small className="text-muted">Xin chào, <strong>{currentUser.username}</strong></small>}
                        </div>
                    </div>
                    <button onClick={logout} className="btn btn-outline-danger d-flex align-items-center gap-2 rounded-pill px-4">
                        <FaSignOutAlt /> <span className="d-none d-md-inline">Đăng Xuất</span>
                    </button>
                </div>

                <div className="row g-4">
                    {/* --- CỘT TRÁI: THÔNG TIN VÍ --- */}
                    <div className="col-lg-4">
                        {/* Card Ví Web3 */}
                        <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-4 text-white" 
                             style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <h5 className="mb-0 fw-bold"><FaWallet className="me-2"/> Ví Web3</h5>
                                    <span className="badge bg-white text-primary rounded-pill">MetaMask</span>
                                </div>
                                <div className="bg-white bg-opacity-25 p-3 rounded-3 mb-3">
                                    <WalletConnect />
                                </div>
                                <small className="d-block opacity-75 fst-italic">
                                    *Kết nối ví để xác thực quyền sở hữu trên Blockchain.
                                </small>
                            </div>
                        </div>

                        {/* Card Thông tin User (Optional) */}
                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-body p-4">
                                <h6 className="fw-bold text-muted text-uppercase mb-3 small">Thông tin tài khoản</h6>
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <FaUserCircle className="text-secondary display-6"/>
                                    <div>
                                        <div className="fw-bold text-dark">{currentUser?.fullName || currentUser?.username}</div>
                                        <div className="small text-muted text-break">{currentUser?.walletAddress || 'Chưa cập nhật ví'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- CỘT PHẢI: FORM CHUYỂN TIỀN --- */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-lg rounded-4 h-100">
                            <div className="card-header bg-white border-bottom-0 p-4 pb-0">
                                <h5 className="fw-bold text-primary d-flex align-items-center gap-2">
                                    <FaExchangeAlt /> Chuyển Tiền (Qua Backend)
                                </h5>
                            </div>
                            <div className="card-body p-4">
                                <form onSubmit={handleSend}>
                                    <div className="mb-4">
                                        <label className="form-label fw-bold small text-muted text-uppercase">Địa chỉ người nhận</label>
                                        <div className="input-group input-group-lg">
                                            <span className="input-group-text bg-light border-end-0">
                                                <FaUserCircle className="text-secondary" />
                                            </span>
                                            <input 
                                                className="form-control bg-light border-start-0 fs-6" 
                                                placeholder="0x... (Ví Ganache người nhận)" 
                                                value={toAddress}
                                                onChange={e => setToAddress(e.target.value)} 
                                                required 
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-bold small text-muted text-uppercase">Số tiền (Wei)</label>
                                        <div className="input-group input-group-lg">
                                            <span className="input-group-text bg-light border-end-0">
                                                <FaExchangeAlt className="text-secondary" />
                                            </span>
                                            <input 
                                                type="number" 
                                                className="form-control bg-light border-start-0 fs-6" 
                                                placeholder="Ví dụ: 1000" 
                                                value={amount}
                                                onChange={e => setAmount(e.target.value)} 
                                                required 
                                            />
                                            <span className="input-group-text bg-light border-start-0 text-muted fs-6">WEI</span>
                                        </div>
                                        <div className="form-text mt-2 ms-1">
                                            <small>ℹ️ 1 ETH = 10^18 Wei. Hãy nhập số nhỏ để test (ví dụ 100-5000).</small>
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="btn btn-primary bg-gradient w-100 py-3 rounded-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                                        disabled={loading}
                                        style={{ transition: 'all 0.3s' }}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                Đang xử lý trên Blockchain...
                                            </>
                                        ) : (
                                            <>
                                                <FaPaperPlane /> Gửi Tiền Ngay
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Kết quả giao dịch */}
                                {result && (
                                    <div className={`alert mt-4 rounded-3 border-0 shadow-sm d-flex align-items-start gap-3 ${result.status === 'SUCCESS' ? 'alert-success' : 'alert-danger'}`}>
                                        <div className="fs-4">
                                            {result.status === 'SUCCESS' ? '✅' : '❌'}
                                        </div>
                                        <div className="w-100 overflow-hidden">
                                            <h6 className="alert-heading fw-bold mb-1">
                                                {result.status === 'SUCCESS' ? 'Giao Dịch Thành Công!' : 'Giao Dịch Thất Bại'}
                                            </h6>
                                            <p className="mb-1 small">{result.message}</p>
                                            {result.transactionHash && (
                                                <div className="bg-white bg-opacity-50 p-2 rounded text-break font-monospace small">
                                                    <strong>Hash:</strong> {result.transactionHash}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;