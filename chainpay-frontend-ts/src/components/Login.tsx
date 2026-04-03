import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FaCube, FaLock, FaSignInAlt, FaUser } from 'react-icons/fa';

import axiosClient from '../api/axiosClient';
import { authText } from '../text';

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
    };
}

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);

        try {
            const response = await axiosClient.post<AuthResponse>('/auth/login', { username, password });
            const { accessToken } = response.data;

            localStorage.setItem('token', accessToken);

            const decoded = jwtDecode<DecodedToken>(accessToken);

            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            } else {
                localStorage.setItem('user', JSON.stringify({ username }));
            }

            if (decoded.role === 'ROLE_ADMIN') {
                navigate('/admin');
            } else {
                navigate('/products');
            }
        } catch (error: any) {
            console.error(error);
            alert(authText.login.failedPrefix + (error.response?.data?.message || authText.login.invalidCredentials));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-black p-4 py-12 font-sans">
            <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-[#6C5CE7] opacity-40 mix-blend-multiply blur-[128px]"></div>
            <div className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-[#A29BFE] opacity-40 mix-blend-multiply blur-[128px]" style={{ animationDelay: '2s' }}></div>

            <div className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl shadow-black/50 transition-all duration-500 animate-in fade-in zoom-in">
                <div className="p-8 sm:p-10">
                    <div className="mb-10 flex flex-col items-center">
                        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] text-white shadow-lg shadow-[#6C5CE7]/30 transition-transform duration-300 hover:rotate-12">
                            <FaCube size={32} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-slate-900">{authText.login.title}</h2>
                        <p className="mt-1 text-sm font-medium text-slate-500">{authText.login.subtitle}</p>
                    </div>

                    <form onSubmit={handleLogin} className="flex flex-col gap-6">
                        <div>
                            <label className="ml-1 mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-500">
                                {authText.login.usernameLabel}
                            </label>
                            <div className="group relative">
                                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#6C5CE7]" />
                                <input
                                    type="text"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-800 shadow-sm outline-none transition-all focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/30"
                                    placeholder={authText.login.usernamePlaceholder}
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="ml-1 mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-500">
                                {authText.login.passwordLabel}
                            </label>
                            <div className="group relative">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#6C5CE7]" />
                                <input
                                    type="password"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-800 shadow-sm outline-none transition-all focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/30"
                                    placeholder={authText.login.passwordPlaceholder}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] py-4 font-bold text-white shadow-lg shadow-[#6C5CE7]/30 transition-all hover:-translate-y-0.5 hover:shadow-[#6C5CE7]/50"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                            ) : (
                                <>
                                    <FaSignInAlt className="transition-transform group-hover:translate-x-1" />
                                    {authText.login.submit}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 border-t border-slate-100 pt-6 text-center">
                        <p className="text-sm font-medium text-slate-500">
                            {authText.login.registerPrompt}{' '}
                            <Link to="/register" className="font-black text-[#6C5CE7] transition-colors hover:text-[#A29BFE] hover:underline">
                                {authText.login.registerLink}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
