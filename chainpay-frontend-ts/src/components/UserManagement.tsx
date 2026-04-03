import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FaChevronLeft, FaChevronRight, FaTrashAlt } from 'react-icons/fa';

import { adminText } from '../text';

interface ChartPoint {
    time: string;
    amount: number;
}

interface Props {
    users: any[];
    searchTerm: string;
    userPage: number;
    setUserPage: (page: number) => void;
    onDelete: (id: number, name: string) => void;
    onAdd: () => void;
    chartData: ChartPoint[];
}

const formatEthValue = (value: number) => new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: value > 0 && value < 1 ? 4 : 2
}).format(value);

const UserManagement: React.FC<Props> = ({ users, searchTerm, userPage, setUserPage, onDelete, onAdd, chartData }) => {
    const itemsPerPage = 6;
    const filtered = users.filter((user) =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    const data = filtered.slice((userPage - 1) * itemsPerPage, userPage * itemsPerPage);

    return (
        <div className="grid grid-cols-1 gap-8 duration-500 animate-in fade-in lg:grid-cols-12">
            <div className="flex h-[600px] flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm lg:col-span-5">
                <div className="flex items-center justify-between border-b border-slate-100 p-6">
                    <h3 className="text-lg font-black text-slate-900">{adminText.userManagement.title}</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {data.map((user) => (
                        <div key={user.id} className="m-2 flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:bg-slate-50">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 font-bold text-[#6C5CE7]">
                                    {user.fullName.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{user.fullName}</p>
                                    <p className="text-xs text-slate-400">@{user.username}</p>
                                </div>
                            </div>
                            <button onClick={() => onDelete(user.id, user.fullName)} className="p-2 text-slate-300 hover:text-red-500">
                                <FaTrashAlt />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-between bg-slate-50 p-4 text-sm font-bold text-[#6C5CE7]">
                    <button onClick={() => setUserPage(Math.max(1, userPage - 1))} disabled={userPage === 1} className="disabled:opacity-20">
                        <FaChevronLeft />
                    </button>
                    <span>{userPage} / {totalPages}</span>
                    <button onClick={() => setUserPage(Math.min(totalPages, userPage + 1))} disabled={userPage === totalPages} className="disabled:opacity-20">
                        <FaChevronRight />
                    </button>
                </div>
            </div>
            <div className="h-[600px] rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm lg:col-span-7">
                <h3 className="mb-6 text-lg font-black text-slate-900">Tổng ETH được giao dịch theo ngày</h3>
                <div className="h-[450px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 12, right: 16, left: 16, bottom: 28 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="time"
                                fontSize={11}
                                axisLine={false}
                                tickLine={false}
                                label={{
                                    value: 'Ngày / tháng',
                                    position: 'insideBottom',
                                    offset: -18,
                                    style: { fill: '#94a3b8', fontSize: 12, fontWeight: 700 }
                                }}
                            />
                            <YAxis
                                fontSize={11}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value: number) => formatEthValue(value)}
                                label={{
                                    value: 'Tổng ETH',
                                    angle: -90,
                                    position: 'insideLeft',
                                    style: { fill: '#94a3b8', fontSize: 12, fontWeight: 700, textAnchor: 'middle' }
                                }}
                            />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                formatter={(value) => [`${formatEthValue(Number(value ?? 0))} ETH`, 'Tổng giao dịch']}
                                labelFormatter={(label) => `Ngày ${String(label)}`}
                            />
                            <Bar dataKey="amount" name="Tổng giao dịch" fill="#6C5CE7" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
