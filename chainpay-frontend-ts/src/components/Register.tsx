import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import WalletConnect from './WalletConnect';
import { AuthRequest } from '../types';
import { FaUser, FaLock, FaWallet, FaUserPlus, FaIdCard, FaCube } from 'react-icons/fa';

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
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-black font-sans py-12 relative overflow-hidden">
            
            {/* Hiệu ứng ánh sáng nền mờ ảo (Đồng bộ với Login) */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6C5CE7] rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#A29BFE] rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse" style={{animationDelay: '2s'}}></div>

            <div className="bg-white w-full max-w-[480px] rounded-[32px] shadow-2xl shadow-black/50 overflow-hidden transform transition-all animate-in fade-in zoom-in duration-500 border border-slate-200 relative z-10">
                
                <div className="p-8 sm:p-10">
                    {/* --- HEADER --- */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] rounded-2xl shadow-lg shadow-[#6C5CE7]/30 flex items-center justify-center text-white mb-5 transform hover:rotate-12 transition-transform duration-300">
                            <FaCube size={32} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tạo Tài Khoản</h2>
                        <p className="text-slate-500 text-sm font-medium mt-1">Tham gia mạng lưới ChainPay</p>
                    </div>

                    {/* --- WALLET CONNECT SECTION --- */}
                    <div className="mb-6 p-5 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner">
                        <label className="flex items-center gap-2 text-[11px] font-black text-[#6C5CE7] uppercase tracking-wider mb-3">
                            <span className="flex items-center justify-center w-5 h-5 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] text-white rounded-full text-[10px] shadow-md">1</span>
                            Kết nối ví MetaMask
                        </label>
                        {/* Component WalletConnect của bạn */}
                        <div className="bg-white p-2 rounded-xl border border-slate-200">
                            <WalletConnect onAddressChange={(addr) => setFormData({...formData, walletAddress: addr})} />
                        </div>
                    </div>

                    {/* --- FORM ĐĂNG KÝ --- */}
                    <form onSubmit={handleRegister} className="flex flex-col gap-5">
                        
                        {/* Ví Blockchain (Readonly) */}
                        <div>
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1 mb-1.5 flex items-center justify-between">
                                Địa chỉ ví Blockchain <span className="text-[9px] bg-[#6C5CE7]/10 text-[#6C5CE7] px-2 py-0.5 rounded-md font-bold tracking-widest uppercase">Tự động</span>
                            </label>
                            <div className="relative group">
                                <FaWallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="text" 
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-mono text-slate-500 outline-none cursor-not-allowed"
                                    value={formData.walletAddress}
                                    onChange={e => setFormData({...formData, walletAddress: e.target.value})}
                                    placeholder="0x... (Cần kết nối ví ở trên)"
                                    required 
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* Họ và tên */}
                        <div>
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block">Họ và Tên</label>
                            <div className="relative group">
                                <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6C5CE7] transition-colors" />
                                <input 
                                    type="text" 
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all text-slate-800 shadow-sm"
                                    value={formData.fullName}
                                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                                    placeholder="Nguyễn Văn A"
                                    required 
                                />
                            </div>
                        </div>

                        {/* Username & Password */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block">Tên đăng nhập</label>
                                <div className="relative group">
                                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6C5CE7] transition-colors" />
                                    <input 
                                        type="text" 
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all text-slate-800 shadow-sm"
                                        value={formData.username}
                                        onChange={e => setFormData({...formData, username: e.target.value})} 
                                        placeholder="user123"
                                        required 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block">Mật khẩu</label>
                                <div className="relative group">
                                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6C5CE7] transition-colors" />
                                    <input 
                                        type="password" 
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all text-slate-800 shadow-sm"
                                        value={formData.password}
                                        onChange={e => setFormData({...formData, password: e.target.value})} 
                                        placeholder="••••••••"
                                        required 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            className="mt-4 w-full py-4 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] text-white font-bold rounded-xl shadow-lg shadow-[#6C5CE7]/30 hover:shadow-[#6C5CE7]/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <FaUserPlus className="group-hover:scale-110 transition-transform" /> 
                                    Hoàn tất Đăng Ký
                                </>
                            )}
                        </button>
                    </form>

                    {/* --- FOOTER --- */}
                    <div className="text-center mt-8 pt-6 border-t border-slate-100">
                        <p className="text-sm font-medium text-slate-500">
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="text-[#6C5CE7] font-black hover:text-[#A29BFE] hover:underline transition-colors">
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