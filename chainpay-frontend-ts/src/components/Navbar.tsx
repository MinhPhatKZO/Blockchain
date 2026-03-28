import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCubes, FaHistory, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

const Navbar: React.FC = () => {
    const location = useLocation();
    const isDashboard = location.pathname.includes('/dashboard');

    // 1. Tự động lấy thông tin user từ localStorage để hiển thị
    const [currentUser, setCurrentUser] = useState<{ username: string } | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                setCurrentUser(JSON.parse(userStr));
            } catch (error) {
                console.error("Lỗi parse user từ localStorage", error);
            }
        }
    }, []);

    // 2. Hàm đăng xuất
    const logout = () => {
        if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    };

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 sm:px-10 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
            
            {/* TRÁI: Logo (Nhấn vào luôn quay về trang Cửa Hàng /products) */}
            <Link to="/products" className="flex items-center gap-4 group">
                <div className="bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] p-2.5 rounded-xl text-white shadow-lg shadow-[#6C5CE7]/30 group-hover:scale-105 transition-transform duration-300">
                    <FaCubes size={22} />
                </div>
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight group-hover:opacity-80 transition-opacity">
                        ChainPay <span className="font-light">{isDashboard ? 'Wallet' : 'Store'}</span>
                    </h1>
                </div>
            </Link>

            {/* PHẢI: Thông tin User & Các nút thao tác */}
            <div className="flex items-center gap-3 sm:gap-4">

                {/* Nút Lịch sử mua hàng */}
                <Link 
                    to="/dashboard" 
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-sm hover:shadow-md ${
                        isDashboard 
                        ? 'bg-slate-100 text-slate-400 cursor-default shadow-none hover:shadow-none pointer-events-none'
                        : 'bg-slate-900 hover:bg-[#6C5CE7] text-white hover:shadow-[#6C5CE7]/30'
                    }`}
                >
                    <FaHistory size={16} />
                    <span className="hidden sm:inline">Lịch Sử Mua Hàng</span>
                </Link>

                {/* Tên tài khoản đang sử dụng - ĐÃ CHUYỂN THÀNH LINK */}
                {currentUser && currentUser.username && (
                    <Link 
                        to="/profile" 
                        className="hidden md:flex items-center gap-2 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all duration-300 cursor-pointer"
                    >
                        <FaUserCircle className="text-[#6C5CE7]" size={18} />
                        <span className="text-sm font-bold text-slate-700">@{currentUser.username}</span>
                    </Link>
                )}

                {/* Nút Đăng Xuất */}
                <button 
                    onClick={logout} 
                    className="flex items-center gap-2 bg-white hover:bg-red-50 text-slate-600 hover:text-red-500 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 border border-slate-200 shadow-sm"
                >
                    <FaSignOutAlt size={16} /> 
                    <span className="hidden lg:inline">Đăng Xuất</span>
                </button>

            </div>
        </nav>
    );
};

export default Navbar;