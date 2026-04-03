import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { FaCheckCircle, FaCube, FaStore, FaUserCircle, FaWallet } from 'react-icons/fa';

import { commonText, dashboardText } from '../text';
import type { DashboardOutletContext } from './DashboardTypes';
import WalletConnect from './WalletConnect';

const DashboardWallet: React.FC = () => {
    const { currentUser, publicConfig, loading } = useOutletContext<DashboardOutletContext>();

    return (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] p-6 text-white shadow-xl shadow-[#6C5CE7]/20 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-xs font-black uppercase tracking-[0.3em] text-white/70">{dashboardText.wallet.heroBadge}</div>
                        <h3 className="mt-3 flex items-center gap-3 text-2xl font-black">
                            <FaWallet />
                            {dashboardText.wallet.heroTitle}
                        </h3>
                        <p className="mt-2 max-w-lg text-sm font-medium text-white/80">
                            {dashboardText.wallet.heroDescription}
                        </p>
                    </div>

                    <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white/90">
                        {commonText.labels.metamask}
                    </span>
                </div>

                <div className="mt-8 rounded-[28px] border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
                    <WalletConnect />
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-[24px] border border-white/20 bg-white/10 p-5">
                        <div className="mb-3 flex items-center gap-2 text-sm font-black text-white/80">
                            <FaUserCircle />
                            {dashboardText.wallet.accountTitle}
                        </div>
                        <div className="text-xl font-black">
                            {currentUser?.username
                                ? `${commonText.user.usernamePrefix}${currentUser.username}`
                                : loading
                                    ? commonText.states.loading
                                    : commonText.user.empty}
                        </div>
                        <div className="mt-2 text-xs font-medium text-white/70">
                            {dashboardText.wallet.accountHint}
                        </div>
                    </div>

                    <div className="rounded-[24px] border border-white/20 bg-white/10 p-5">
                        <div className="mb-3 flex items-center gap-2 text-sm font-black text-white/80">
                            <FaCube />
                            {dashboardText.wallet.chainIdTitle}
                        </div>
                        <div className="text-xl font-black">
                            {publicConfig?.chainId ?? (loading ? commonText.states.loading : '--')}
                        </div>
                        <div className="mt-2 text-xs font-medium text-white/70">
                            {dashboardText.wallet.chainIdHint}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
                            <FaCheckCircle size={18} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">{dashboardText.wallet.registeredTitle}</h3>
                            <p className="mt-1 text-sm font-medium text-slate-500">{dashboardText.wallet.registeredDescription}</p>
                        </div>
                    </div>

                    <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                        <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">{commonText.labels.walletAddress}</div>
                        <div className="mt-3 break-all font-mono text-sm text-slate-700">
                            {currentUser?.walletAddress ?? (loading ? commonText.states.loadingData : dashboardText.wallet.registeredEmpty)}
                        </div>
                    </div>
                </div>

                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-[#6C5CE7]/10 p-3 text-[#6C5CE7]">
                            <FaStore size={18} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">{dashboardText.wallet.storeTitle}</h3>
                            <p className="mt-1 text-sm font-medium text-slate-500">{dashboardText.wallet.storeDescription}</p>
                        </div>
                    </div>

                    <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                        <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">{commonText.labels.storeWallet}</div>
                        <div className="mt-3 break-all font-mono text-sm text-slate-700">
                            {publicConfig?.storeWalletAddress ?? (loading ? commonText.states.loadingData : dashboardText.wallet.storeEmpty)}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DashboardWallet;
