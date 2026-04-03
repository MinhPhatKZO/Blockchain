import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { FaArrowDown, FaArrowUp, FaHistory } from 'react-icons/fa';

import { commonText, dashboardText } from '../text';
import type { DashboardOutletContext } from './DashboardTypes';

const DashboardHistory: React.FC = () => {
    const { currentUser, history, loading } = useOutletContext<DashboardOutletContext>();

    return (
        <section className="rounded-[32px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-slate-200 p-3 text-slate-600">
                        <FaHistory size={18} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900">{dashboardText.history.title}</h3>
                        <p className="mt-1 text-sm font-medium text-slate-500">{dashboardText.history.description}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 p-6 sm:p-8">
                {history.length > 0 ? history.map((transaction) => {
                    const isSender = currentUser?.walletAddress?.toLowerCase() === transaction.fromAddress.toLowerCase();

                    return (
                        <div
                            key={transaction.id}
                            className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5 transition-colors hover:border-slate-300"
                        >
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className={`rounded-2xl p-3 ${isSender ? 'bg-rose-100 text-rose-500' : 'bg-emerald-100 text-emerald-600'}`}>
                                            {isSender ? <FaArrowUp size={16} /> : <FaArrowDown size={16} />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="truncate text-base font-black text-slate-900">
                                                {transaction.product ? transaction.product.name : (isSender ? transaction.toAddress : transaction.fromAddress)}
                                            </div>
                                            <div className="mt-1 text-sm font-medium text-slate-500">
                                                {new Date(transaction.timestamp).toLocaleString('vi-VN')}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-xs text-slate-500">
                                        {transaction.transactionHash}
                                    </div>
                                </div>

                                <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
                                    <div className={`text-xl font-black ${isSender ? 'text-rose-500' : 'text-emerald-500'}`}>
                                        {isSender ? '-' : '+'}{transaction.amount} {commonText.labels.wei}
                                    </div>
                                    <div className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">
                                        {transaction.status}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                        <div className="text-lg font-black text-slate-600">
                            {loading ? dashboardText.history.emptyLoading : dashboardText.history.empty}
                        </div>
                        <div className="mt-2 text-sm font-medium text-slate-400">
                            {dashboardText.history.emptyHint}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default DashboardHistory;
