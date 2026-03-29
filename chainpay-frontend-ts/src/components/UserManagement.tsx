import React from 'react';
import { FaTrashAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Props {
  users: any[];
  searchTerm: string;
  userPage: number;
  setUserPage: (p: number) => void;
  onDelete: (id: number, name: string) => void;
  onAdd: () => void;
  chartData: any[];
}

const UserManagement: React.FC<Props> = ({ users, searchTerm, userPage, setUserPage, onDelete, onAdd, chartData }) => {
  const itemsPerPage = 6;
  const filtered = users.filter(u => u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || u.username.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const data = filtered.slice((userPage - 1) * itemsPerPage, userPage * itemsPerPage);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-5 flex flex-col h-[600px] bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-black text-slate-900 text-lg">Danh sách Users</h3>
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          {data.map(u => (
            <div key={u.id} className="m-2 p-4 rounded-2xl flex items-center justify-between border border-slate-100 bg-white hover:bg-slate-50 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-[#6C5CE7] flex items-center justify-center font-bold">{u.fullName.charAt(0)}</div>
                <div><p className="text-sm font-bold text-slate-800">{u.fullName}</p><p className="text-xs text-slate-400">@{u.username}</p></div>
              </div>
              <button onClick={() => onDelete(u.id, u.fullName)} className="text-slate-300 hover:text-red-500 p-2"><FaTrashAlt /></button>
            </div>
          ))}
        </div>
        <div className="p-4 bg-slate-50 flex justify-between items-center text-sm font-bold text-[#6C5CE7]">
          <button onClick={() => setUserPage(Math.max(1, userPage - 1))} disabled={userPage === 1} className="disabled:opacity-20"><FaChevronLeft /></button>
          <span>{userPage} / {totalPages}</span>
          <button onClick={() => setUserPage(Math.min(totalPages, userPage + 1))} disabled={userPage === totalPages} className="disabled:opacity-20"><FaChevronRight /></button>
        </div>
      </div>
      <div className="lg:col-span-7 bg-white rounded-[32px] shadow-sm border border-slate-200 p-8 h-[600px]">
        <h3 className="font-black text-slate-900 text-lg mb-6">Lưu lượng giao dịch (ETH)</h3>
        <div className="h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis fontSize={11} axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="amount" fill="#6C5CE7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
export default UserManagement;