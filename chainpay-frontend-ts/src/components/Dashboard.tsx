import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { axiosClient, fetchPublicConfig } from '../api';
import { dashboardText } from '../text';
import { dashboardSections } from './DashboardSections';
import type { DashboardOutletContext, PurchaseLocationState, TransactionHistory, User } from './DashboardTypes';
import Navbar from './Navbar';
import NotificationListener from './NotificationListener';

const Dashboard: React.FC = () => {
    const location = useLocation();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [history, setHistory] = useState<TransactionHistory[]>([]);
    const [publicConfig, setPublicConfig] = useState<DashboardOutletContext['publicConfig']>(null);
    const [loading, setLoading] = useState(true);

    const refreshDashboardData = useCallback(async () => {
        try {
            setLoading(true);

            const [configRes, userRes, historyRes] = await Promise.all([
                fetchPublicConfig(),
                axiosClient.get<User>('/users/me'),
                axiosClient.get<TransactionHistory[]>('/users/history')
            ]);

            setPublicConfig(configRes);
            setCurrentUser(userRes.data);
            setHistory(historyRes.data);
            localStorage.setItem('user', JSON.stringify(userRes.data));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void refreshDashboardData();
    }, [refreshDashboardData]);

    const activeSection = useMemo(() => {
        return dashboardSections.find((section) => location.pathname.startsWith(section.to)) ?? dashboardSections[2];
    }, [location.pathname]);

    const purchaseState = (location.state ?? {}) as PurchaseLocationState;
    const isPurchaseFlow = location.pathname.startsWith('/dashboard/transfer') && !!purchaseState.productName;

    const heroTitle = isPurchaseFlow ? dashboardText.transfer.paymentTitle : activeSection.title;
    const heroDescription = isPurchaseFlow
        ? dashboardText.transfer.paymentDescription
        : activeSection.description;

    const outletContext: DashboardOutletContext = {
        currentUser,
        history,
        publicConfig,
        loading,
        refreshDashboardData
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans text-slate-800">
            {currentUser?.walletAddress && <NotificationListener walletAddress={currentUser.walletAddress} />}
            <Navbar />

            <main className="mx-auto max-w-6xl space-y-6 px-6 py-10 sm:px-10">
                <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-64 bg-gradient-to-l from-[#A29BFE]/25 via-[#6C5CE7]/10 to-transparent" />

                    <div className="relative max-w-2xl">
                        <div className="inline-flex rounded-full bg-[#6C5CE7]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-[#6C5CE7]">
                            {dashboardText.page.badge}
                        </div>
                        <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                            {heroTitle}
                        </h2>
                        <p className="mt-3 text-sm font-medium leading-7 text-slate-500 sm:text-base">
                            {heroDescription}
                        </p>
                    </div>
                </section>

                <Outlet context={outletContext} />
            </main>
        </div>
    );
};

export default Dashboard;
