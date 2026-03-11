import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import WalletConnect from './WalletConnect';
import { AuthRequest } from '../types';
// Import các icons
import { FaUser, FaLock, FaWallet, FaUserPlus, FaIdCard } from 'react-icons/fa';

const Register: React.FC = () => {
    const [formData, setFormData] = useState<AuthRequest>({
        username: '', password: '', fullName: '', walletAddress: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosClient.post('/auth/register', formData);
            alert('✅ Đăng ký thành công! Hãy đăng nhập.');
            navigate('/login');
        } catch (error: any) {
            alert('❌ Lỗi: ' + (error.response?.data || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 py-5" 
             style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden" 
                 style={{ maxWidth: '500px', width: '100%', backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                
                <div className="card-body p-5">
                    {/* Header */}
                    <div className="text-center mb-4">
                        <div className="bg-success bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow" 
                             style={{ width: '60px', height: '60px', fontSize: '24px' }}>
                            <FaUserPlus />
                        </div>
                        <h3 className="fw-bold text-dark">Đăng Ký Tài Khoản</h3>
                        <p className="text-muted small">Tham gia mạng lưới thanh toán ChainPay</p>
                    </div>

                    {/* Khu vực Kết nối ví */}
                    <div className="mb-4 p-3 bg-white rounded-3 shadow-sm border border-light">
                        <label className="form-label fw-bold small text-uppercase text-primary mb-2">
                            Bước 1: Kết nối ví MetaMask
                        </label>
                        <WalletConnect onAddressChange={(addr) => setFormData({...formData, walletAddress: addr})} />
                    </div>

                    <form onSubmit={handleRegister}>
                        {/* Wallet Address Input */}
                        <div className="form-group mb-3">
                            <label className="form-label fw-bold small text-muted">Địa chỉ ví (Tự động điền)</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0 rounded-start-3">
                                    <FaWallet className="text-success" />
                                </span>
                                <input 
                                    type="text" 
                                    className="form-control bg-light border-start-0 rounded-end-3 py-2"
                                    value={formData.walletAddress}
                                    onChange={e => setFormData({...formData, walletAddress: e.target.value})}
                                    placeholder="0x..."
                                    required 
                                />
                            </div>
                        </div>

                        {/* Full Name Input */}
                        <div className="form-group mb-3">
                            <label className="form-label fw-bold small text-muted">Họ và tên</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0 rounded-start-3">
                                    <FaIdCard className="text-secondary" />
                                </span>
                                <input 
                                    type="text" 
                                    className="form-control bg-light border-start-0 rounded-end-3 py-2"
                                    value={formData.fullName}
                                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                                    placeholder="Nhập họ tên đầy đủ"
                                    required 
                                />
                            </div>
                        </div>

                        {/* Username Input */}
                        <div className="form-group mb-3">
                            <label className="form-label fw-bold small text-muted">Tên đăng nhập</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0 rounded-start-3">
                                    <FaUser className="text-secondary" />
                                </span>
                                <input 
                                    type="text" 
                                    className="form-control bg-light border-start-0 rounded-end-3 py-2"
                                    value={formData.username}
                                    onChange={e => setFormData({...formData, username: e.target.value})} 
                                    placeholder="Chọn username"
                                    required 
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="form-group mb-4">
                            <label className="form-label fw-bold small text-muted">Mật khẩu</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0 rounded-start-3">
                                    <FaLock className="text-secondary" />
                                </span>
                                <input 
                                    type="password" 
                                    className="form-control bg-light border-start-0 rounded-end-3 py-2"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})} 
                                    placeholder="Nhập mật khẩu"
                                    required 
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            className="btn btn-success bg-gradient w-100 py-2 rounded-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="spinner-border spinner-border-sm text-light" role="status"></div>
                            ) : (
                                <>
                                    <FaUserPlus /> Hoàn tất Đăng Ký
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Link */}
                    <div className="text-center mt-4 pt-3 border-top">
                        <p className="small text-muted mb-0">
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="text-primary fw-bold text-decoration-none">
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;