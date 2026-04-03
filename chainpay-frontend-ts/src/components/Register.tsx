import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCube, FaIdCard, FaLock, FaUser, FaUserPlus, FaWallet } from 'react-icons/fa';

import axiosClient from '../api/axiosClient';
import { authText, commonText } from '../text';
import { AuthRequest } from '../types';
import WalletConnect from './WalletConnect';

const Register: React.FC = () => {
    const [formData, setFormData] = useState<AuthRequest>({
        username: '',
        password: '',
        fullName: '',
        walletAddress: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        try {
            await axiosClient.post('/auth/register', formData);
            alert(authText.register.successAlert);
            navigate('/login');
        } catch (error: any) {
            alert(authText.register.errorPrefix + (error.response?.data || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-black p-4 py-12 font-sans">
            <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-[#6C5CE7] opacity-40 mix-blend-multiply blur-[128px]"></div>
            <div className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-[#A29BFE] opacity-40 mix-blend-multiply blur-[128px]" style={{ animationDelay: '2s' }}></div>

            <div className="relative z-10 w-full max-w-[480px] overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl shadow-black/50 transition-all duration-500 animate-in fade-in zoom-in">
                <div className="p-8 sm:p-10">
                    <div className="mb-8 flex flex-col items-center">
                        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] text-white shadow-lg shadow-[#6C5CE7]/30 transition-transform duration-300 hover:rotate-12">
                            <FaCube size={32} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-slate-900">{authText.register.title}</h2>
                        <p className="mt-1 text-sm font-medium text-slate-500">{authText.register.subtitle}</p>
                    </div>

                    <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-inner">
                        <label className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-[#6C5CE7]">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] text-[10px] text-white shadow-md">1</span>
                            {authText.register.walletStepLabel}
                        </label>
                        <div className="rounded-xl border border-slate-200 bg-white p-2">
                            <WalletConnect onAddressChange={(address) => setFormData({ ...formData, walletAddress: address })} />
                        </div>
                    </div>

                    <form onSubmit={handleRegister} className="flex flex-col gap-5">
                        <div>
                            <label className="ml-1 mb-1.5 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-500">
                                {authText.register.walletAddressLabel}
                                <span className="rounded-md bg-[#6C5CE7]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#6C5CE7]">
                                    {commonText.labels.auto}
                                </span>
                            </label>
                            <div className="relative">
                                <FaWallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 py-3.5 pl-11 pr-4 text-sm font-mono text-slate-500 outline-none"
                                    value={formData.walletAddress}
                                    onChange={(event) => setFormData({ ...formData, walletAddress: event.target.value })}
                                    placeholder={authText.register.walletAddressPlaceholder}
                                    required
                                    readOnly
                                />
                            </div>
                        </div>

                        <div>
                            <label className="ml-1 mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-500">
                                {authText.register.fullNameLabel}
                            </label>
                            <div className="group relative">
                                <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#6C5CE7]" />
                                <input
                                    type="text"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-800 shadow-sm outline-none transition-all focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/30"
                                    value={formData.fullName}
                                    onChange={(event) => setFormData({ ...formData, fullName: event.target.value })}
                                    placeholder={authText.register.fullNamePlaceholder}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className="ml-1 mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-500">
                                    {authText.register.usernameLabel}
                                </label>
                                <div className="group relative">
                                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#6C5CE7]" />
                                    <input
                                        type="text"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-800 shadow-sm outline-none transition-all focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/30"
                                        value={formData.username}
                                        onChange={(event) => setFormData({ ...formData, username: event.target.value })}
                                        placeholder={authText.register.usernamePlaceholder}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="ml-1 mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-500">
                                    {authText.register.passwordLabel}
                                </label>
                                <div className="group relative">
                                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#6C5CE7]" />
                                    <input
                                        type="password"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-800 shadow-sm outline-none transition-all focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/30"
                                        value={formData.password}
                                        onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                                        placeholder={authText.register.passwordPlaceholder}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="group mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] py-4 font-bold text-white shadow-lg shadow-[#6C5CE7]/30 transition-all hover:-translate-y-0.5 hover:shadow-[#6C5CE7]/50"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                            ) : (
                                <>
                                    <FaUserPlus className="transition-transform group-hover:scale-110" />
                                    {authText.register.submit}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 border-t border-slate-100 pt-6 text-center">
                        <p className="text-sm font-medium text-slate-500">
                            {authText.register.loginPrompt}{' '}
                            <Link to="/login" className="font-black text-[#6C5CE7] transition-colors hover:text-[#A29BFE] hover:underline">
                                {authText.register.loginLink}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
