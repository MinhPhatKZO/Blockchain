import React from 'react';
import { FaChevronLeft, FaChevronRight, FaHistory } from 'react-icons/fa';

import { adminText, commonText } from '../text';

interface Props {
    transactions: any[];
    txPage: number;
    setTxPage: (page: number) => void;
    getDisplayName: (address: string) => string;
}

const TransactionLedger: React.FC<Props> = ({ transactions, txPage, setTxPage, getDisplayName }) => {
    const itemsPerPage = 10;
    const totalPages = Math.ceil(transactions.length / itemsPerPage) || 1;
    const data = transactions.slice((txPage - 1) * itemsPerPage, txPage * itemsPerPage);

    return (
        <div className="flex min-h-[600px] flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3 border-b border-slate-100 p-6">
                <div className="rounded-lg bg-slate-100 p-2 text-slate-500"><FaHistory /></div>
                <h3 className="text-xl font-black text-slate-900">{adminText.transactionLedger.title}</h3>
            </div>
            <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <tr>
                            <th className="px-6 py-4">{adminText.transactionLedger.activity}</th>
                            <th className="px-6 py-4">{adminText.transactionLedger.txHash}</th>
                            <th className="px-6 py-4 text-right">{adminText.transactionLedger.value}</th>
                            <th className="px-6 py-4 text-right">{adminText.transactionLedger.timeStatus}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {data.map((transaction) => (
                            <tr key={transaction.id} className="transition-colors hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <p className="text-xs font-bold text-slate-700">{adminText.transactionLedger.from}: {getDisplayName(transaction.fromAddress)}</p>
                                    <p className="text-xs font-bold text-slate-700">{adminText.transactionLedger.to}: {getDisplayName(transaction.toAddress)}</p>
                                </td>
                                <td className="select-all px-6 py-4 font-mono text-[10px] text-slate-400 hover:text-[#6C5CE7]">
                                    {transaction.transactionHash || commonText.labels.notAvailable}
                                </td>
                                <td className="px-6 py-4 text-right text-lg font-black text-[#6C5CE7]">{transaction.amount} {commonText.labels.eth}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-[9px] font-bold ${transaction.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                        {transaction.status}
                                    </div>
                                    <p className="mt-1 text-[10px] font-medium text-slate-300">{new Date(transaction.createdAt).toLocaleString('vi-VN')}</p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex items-center justify-between bg-slate-50 p-4 font-bold text-[#6C5CE7]">
                <button onClick={() => setTxPage(Math.max(1, txPage - 1))} disabled={txPage === 1}>
                    <FaChevronLeft />
                </button>
                <span>{adminText.transactionLedger.pageLabel(txPage, totalPages, transactions.length)}</span>
                <button onClick={() => setTxPage(Math.min(totalPages, txPage + 1))} disabled={txPage === totalPages}>
                    <FaChevronRight />
                </button>
            </div>
        </div>
    );
};

export default TransactionLedger;
