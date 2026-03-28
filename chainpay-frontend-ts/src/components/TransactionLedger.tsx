import React from 'react';
import { FaChevronLeft, FaChevronRight, FaHistory } from 'react-icons/fa';

interface Props {
  transactions: any[];
  txPage: number;
  setTxPage: (p: number) => void;
  getDisplayName: (addr: string) => string;
}

const TransactionLedger: React.FC<Props> = ({ transactions, txPage, setTxPage, getDisplayName }) => {
  const itemsPerPage = 10;
  const totalPages = Math.ceil(transactions.length / itemsPerPage) || 1;
  const data = transactions.slice((txPage - 1) * itemsPerPage, txPage * itemsPerPage);

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col animate-in fade-in">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><FaHistory /></div>
        <h3 className="font-black text-slate-900 text-xl">Sổ cái giao dịch hệ thống</h3>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Hoạt động</th>
              <th className="px-6 py-4">Mã Hash (TxHash)</th>
              <th className="px-6 py-4 text-right">Giá trị (ETH)</th>
              <th className="px-6 py-4 text-right">Thời gian / Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map(tx => (
              <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-xs font-bold text-slate-700">Từ: {getDisplayName(tx.fromAddress)}</p>
                  <p className="text-xs font-bold text-slate-700">Đến: {getDisplayName(tx.toAddress)}</p>
                </td>
                <td className="px-6 py-4 font-mono text-[10px] text-slate-400 select-all hover:text-[#6C5CE7]">{tx.transactionHash || 'N/A'}</td>
                <td className="px-6 py-4 text-right font-black text-[#6C5CE7] text-lg">{tx.amount} ETH</td>
                <td className="px-6 py-4 text-right">
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-bold ${tx.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {tx.status}
                  </div>
                  <p className="text-[10px] text-slate-300 mt-1 font-medium">{new Date(tx.createdAt).toLocaleString('vi-VN')}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-slate-50 flex justify-between items-center text-[#6C5CE7] font-bold">
         <button onClick={() => setTxPage(Math.max(1, txPage - 1))} disabled={txPage === 1}><FaChevronLeft /></button>
         <span>Trang {txPage} / {totalPages} (Tổng {transactions.length})</span>
         <button onClick={() => setTxPage(Math.min(totalPages, txPage + 1))} disabled={txPage === totalPages}><FaChevronRight /></button>
      </div>
    </div>
  );
};
export default TransactionLedger;