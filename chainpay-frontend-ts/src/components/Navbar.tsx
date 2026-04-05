import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FaCubes, FaPlusCircle, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

import { commonText, navbarText } from '../text';
import DepositButton from './DepositButton';
import { dashboardSections } from './DashboardSections';

const Navbar: React.FC = () => {
    const location = useLocation();
    const isDashboard = location.pathname.startsWith('/dashboard');

    const [currentUser, setCurrentUser] = useState<{ username: string } | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                setCurrentUser(JSON.parse(userStr));
            } catch (error) {
                console.error(error);
            }
        }
    }, []);

    const logout = () => {
        if (window.confirm(commonText.prompts.confirmLogout)) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    };

    return (
        <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-md sm:px-10">
            <Link to="/products" className="group flex items-center gap-4">
                <div className="rounded-xl bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] p-2.5 text-white shadow-lg shadow-[#6C5CE7]/30 transition-transform duration-300 group-hover:scale-105">
                    <FaCubes size={22} />
                </div>
                <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-slate-900 transition-opacity group-hover:opacity-80">
                        {commonText.brand.appName}{' '}
                        <span className="font-light">{isDashboard ? commonText.brand.wallet : commonText.brand.store}</span>
                    </h1>
                </div>
            </Link>

            <div className="flex items-center gap-3 sm:gap-4">
                {dashboardSections.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        title={label}
                        aria-label={label}
                        className={({ isActive }) => `flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 ${isActive ? 'border-transparent bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/25' : 'border-slate-200 bg-white text-slate-500 shadow-sm hover:border-[#6C5CE7]/30 hover:text-[#6C5CE7] hover:shadow-md'}`}
                    >
                        <Icon size={15} />
                    </NavLink>
                ))}

                {currentUser && currentUser.username && (
                    <DepositButton
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#6C5CE7]/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#6C5CE7]/25"
                    >
                        <FaPlusCircle size={16} />
                        <span className="hidden sm:inline">{commonText.actions.deposit}</span>
                    </DepositButton>
                )}

                {currentUser && currentUser.username && (
                    <Link
                        to="/profile"
                        className="hidden cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 shadow-sm transition-all duration-300 hover:bg-slate-100 md:flex"
                    >
                        <FaUserCircle className="text-[#6C5CE7]" size={18} />
                        <span className="text-sm font-bold text-slate-700">{navbarText.profileLabel(currentUser.username)}</span>
                    </Link>
                )}

                <button
                    onClick={logout}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition-all duration-300 hover:bg-red-50 hover:text-red-500"
                >
                    <FaSignOutAlt size={16} />
                    <span className="hidden lg:inline">{commonText.actions.logout}</span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
