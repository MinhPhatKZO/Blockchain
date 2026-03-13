import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { jwtDecode } from 'jwt-decode';
import { FaUser, FaLock, FaSignInAlt, FaCube } from 'react-icons/fa'; 

// Định nghĩa cấu trúc Token để giải mã
interface DecodedToken {
    sub: string;
    role: string;
    exp: number;
}

interface AuthResponse {
    accessToken: string;
    tokenType: string;
    user?: {
        id: number;
        username: string;
        walletAddress: string;
    }
}

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const res = await axiosClient.post<AuthResponse>('/auth/login', { username, password });
            const { accessToken } = res.data;

            localStorage.setItem('token', accessToken);

            const decoded = jwtDecode<DecodedToken>(accessToken);

            if (res.data.user) {
                localStorage.setItem('user', JSON.stringify(res.data.user));
            } else {
                localStorage.setItem('user', JSON.stringify({ username: username }));
            }

            if (decoded.role === 'ROLE_ADMIN') {
                navigate('/admin'); 
            } else {
                navigate('/dashboard'); 
            }

        } catch (error: any) {
            console.error(error);
            alert('❌ Đăng nhập thất bại: ' + (error.response?.data?.message || 'Sai thông tin đăng nhập!'));
        } finally {
            setLoading(false);
        }
    };

    return (
        // Background tone Tím Web3 (Đồng bộ với Admin/Register)
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-black font-sans py-12 relative overflow-hidden">
            
            {/* Hiệu ứng ánh sáng nền mờ ảo (Tùy chọn cho thêm phần ảo diệu) */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6C5CE7] rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#A29BFE] rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse" style={{animationDelay: '2s'}}></div>

            {/* Card màu trắng */}
            <div className="bg-white w-full max-w-[420px] rounded-[32px] shadow-2xl shadow-black/50 overflow-hidden transform transition-all animate-in fade-in zoom-in duration-500 border border-slate-200 relative z-10">
                
                <div className="p-8 sm:p-10">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-10">
                        {/* Icon Logo Tím */}
                        <div className="w-16 h-16 bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] rounded-2xl shadow-lg shadow-[#6C5CE7]/30 flex items-center justify-center text-white mb-5 transform hover:rotate-12 transition-transform duration-300">
                            <FaCube size={32} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">ChainPay</h2>
                        <p className="text-slate-500 text-sm font-medium mt-1">Truy cập hệ thống Web3</p>
                    </div>

                    <form onSubmit={handleLogin} className="flex flex-col gap-6">
                        {/* Username Input */}
                        <div>
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block">
                                Tên đăng nhập
                            </label>
                            <div className="relative group">
                                {/* Đổi focus color thành màu Tím */}
                                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6C5CE7] transition-colors" />
                                <input 
                                    type="text" 
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all shadow-sm text-slate-800"
                                    placeholder="Nhập username..."
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block">
                                Mật khẩu
                            </label>
                            <div className="relative group">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6C5CE7] transition-colors" />
                                <input 
                                    type="password" 
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all shadow-sm text-slate-800"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button (Gradient Tím) */}
                        <button 
                            type="submit" 
                            className="mt-2 w-full py-4 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] text-white font-bold rounded-xl shadow-lg shadow-[#6C5CE7]/30 hover:shadow-[#6C5CE7]/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <FaSignInAlt className="group-hover:translate-x-1 transition-transform" /> 
                                    Truy Cập Hệ Thống
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="text-center mt-8 pt-6 border-t border-slate-100">
                        <p className="text-sm font-medium text-slate-500">
                            Chưa có tài khoản?{' '}
                            <Link to="/register" className="text-[#6C5CE7] font-black hover:text-[#A29BFE] hover:underline transition-colors">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;