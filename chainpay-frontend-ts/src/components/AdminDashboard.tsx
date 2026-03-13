import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaTrashAlt, FaHistory, FaUsers, FaCubes, FaArrowLeft, FaSearch, FaTimes, FaShieldAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({ totalUsers: 0, totalTransactions: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', fullName: '', walletAddress: '', role: 'USER' });
  
  // Pagination State
  const [userPage, setUserPage] = useState(1);
  const [txPage, setTxPage] = useState(1);
  const usersPerPage = 4;
  const txPerPage = 6;

  const navigate = useNavigate();

  const fetchAdminData = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [statsRes, usersRes, transRes] = await Promise.all([
        axios.get('http://localhost:8080/api/admin/stats', config),
        axios.get('http://localhost:8080/api/admin/users', config),
        axios.get('http://localhost:8080/api/admin/transactions', config)
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setTransactions(transRes.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAdminData(); }, []);

  useEffect(() => { setUserPage(1); }, [searchTerm]);
  useEffect(() => { setTxPage(1); }, [selectedUser]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/auth/register', newUser, { headers: { Authorization: `Bearer ${token}` } });
      alert("✅ Đã tạo thành viên mới thành công!");
      setShowAddModal(false);
      setNewUser({ username: '', password: '', fullName: '', walletAddress: '', role: 'USER' });
      fetchAdminData(); 
    } catch (err) { alert("❌ Lỗi: Không thể tạo người dùng. Username có thể đã tồn tại."); }
  };

  const handleDeleteUser = async (id: number, name: string) => {
    if (window.confirm(`⚠️ Xóa người dùng "${name}"? Hành động này không thể hoàn tác.`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8080/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (selectedUser?.id === id) setSelectedUser(null);
        fetchAdminData();
      } catch (err) { alert("Không thể xóa người dùng này! Có thể do ràng buộc dữ liệu."); }
    }
  };

  const getDisplayName = (address: string) => {
    if (!address) return "Hệ thống";
    const user = users.find(u => u.walletAddress?.toLowerCase() === address.toLowerCase());
    return user ? user.fullName : "Ví Ẩn Danh";
  };

  const displayUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalUserPages = Math.max(1, Math.ceil(displayUsers.length / usersPerPage));
  const paginatedUsers = displayUsers.slice((userPage - 1) * usersPerPage, userPage * usersPerPage);

  const filteredTransactions = selectedUser 
    ? transactions.filter(tx => tx.fromAddress?.toLowerCase() === selectedUser.walletAddress?.toLowerCase() || tx.toAddress?.toLowerCase() === selectedUser.walletAddress?.toLowerCase())
    : transactions;
  const totalTxPages = Math.max(1, Math.ceil(filteredTransactions.length / txPerPage));
  const paginatedTx = filteredTransactions.slice((txPage - 1) * txPerPage, txPage * txPerPage);

  const chartData = transactions.slice(0, 15).map(tx => ({
    time: new Date(tx.createdAt).toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit' }),
    amount: parseFloat(tx.amount) || 0
  })).reverse();

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4 text-[#6C5CE7] animate-pulse font-bold">
        <FaCubes size={48} className="animate-bounce drop-shadow-lg" />
        <p className="tracking-widest uppercase text-sm">Khởi động Blockchain Ledger...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20 relative text-slate-800">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] p-2.5 rounded-xl text-white shadow-lg shadow-[#6C5CE7]/30">
            <FaCubes size={22} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">ChainPay <span className="font-light">Console</span></h1>
            <span className="text-[10px] uppercase tracking-widest text-[#6C5CE7] font-bold flex items-center gap-1 mt-0.5">
              <FaShieldAlt className="text-[#A29BFE]" /> Admin Authority
            </span>
          </div>
        </div>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} 
          className="bg-white hover:bg-slate-50 text-slate-600 hover:text-red-500 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 border border-slate-200 shadow-sm">
          Đăng xuất
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Tổng Thành Viên', val: stats.totalUsers, icon: <FaUsers /> },
            { label: 'Lệnh Giao Dịch', val: stats.totalTransactions || 0, icon: <FaHistory /> },
            { label: 'Network Node', val: 'Ganache Local', icon: <FaCubes /> }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-7 rounded-[28px] shadow-sm hover:shadow-xl hover:shadow-[#6C5CE7]/10 transition-all duration-300 border border-slate-200 flex items-center justify-between group">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-3xl font-black text-slate-900 group-hover:text-[#6C5CE7] transition-colors">{item.val}</p>
              </div>
              <div className="p-4 bg-slate-50 text-[#A29BFE] rounded-2xl text-2xl group-hover:bg-gradient-to-br group-hover:from-[#6C5CE7] group-hover:to-[#A29BFE] group-hover:text-white transition-all duration-500">
                {item.icon}
              </div>
            </div>
          ))}
        </div>

        {/* --- CHART SECTION --- */}
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-8 mb-8">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h3 className="font-black text-slate-900 text-lg">Lưu lượng giao dịch</h3>
                    <p className="text-xs text-[#A29BFE] font-bold mt-1 uppercase tracking-wider">Khối lượng ETH chuyển qua hệ thống</p>
                </div>
            </div>
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(108 92 231 / 0.1)'}} />
                        <Bar dataKey="amount" fill="url(#colorUv)" radius={[6, 6, 0, 0]} barSize={30} />
                        <defs>
                          {/* Khai báo dải màu Gradient cho Chart */}
                          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#A29BFE" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#6C5CE7" stopOpacity={1}/>
                          </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LHS: USER MANAGEMENT --- */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[650px]">
              
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Quản lý Users</h3>
                </div>
                <button onClick={() => setShowAddModal(true)} className="p-3 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] text-white rounded-xl hover:-translate-y-0.5 transition-all shadow-md shadow-[#6C5CE7]/30">
                  <FaUserPlus size={16} />
                </button>
              </div>
              
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                <div className="relative group">
                  <FaSearch className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[#6C5CE7] transition-colors" />
                  <input type="text" placeholder="Tìm tên, username..." className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>

              <div className="overflow-y-auto flex-1 p-2">
                {paginatedUsers.map(u => (
                  <div key={u.id} onClick={() => setSelectedUser(u)} className={`m-2 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300 border ${selectedUser?.id === u.id ? 'bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] shadow-md text-white border-transparent' : 'bg-white border-slate-100 hover:border-[#A29BFE]/50 hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-inner ${selectedUser?.id === u.id ? 'bg-white/20 text-white' : 'bg-[#6C5CE7]/10 text-[#6C5CE7]'}`}>
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${selectedUser?.id === u.id ? 'text-white' : 'text-slate-800'}`}>{u.fullName}</p>
                        <p className={`text-xs font-medium ${selectedUser?.id === u.id ? 'text-white/80' : 'text-slate-400'}`}>@{u.username}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${u.role === 'ADMIN' ? (selectedUser?.id === u.id ? 'bg-white/20' : 'bg-purple-100 text-purple-700') : (selectedUser?.id === u.id ? 'bg-black/10' : 'bg-slate-100 text-slate-500')}`}>{u.role}</span>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteUser(u.id, u.fullName); }} className={`${selectedUser?.id === u.id ? 'text-white/70 hover:text-white hover:bg-red-500/80' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'} p-1.5 rounded-lg transition-colors`}><FaTrashAlt size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Phân trang Users */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-sm font-bold text-[#6C5CE7]">
                  <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1} className="p-2 hover:bg-[#6C5CE7]/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"><FaChevronLeft /></button>
                  <span>{userPage} / {totalUserPages}</span>
                  <button onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))} disabled={userPage === totalUserPages} className="p-2 hover:bg-[#6C5CE7]/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"><FaChevronRight /></button>
              </div>
            </div>
          </div>

          {/* --- RHS: TRANSACTION LOGS --- */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden sticky top-28 h-[650px] flex flex-col">
              
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                <div>
                  <h3 className="font-black text-slate-900 text-xl">{selectedUser ? `Lịch sử: ${selectedUser.fullName}` : "Sổ cái giao dịch (Ledger)"}</h3>
                </div>
                {selectedUser && (
                  <button onClick={() => setSelectedUser(null)} className="flex items-center gap-2 text-xs font-bold text-[#6C5CE7] bg-[#6C5CE7]/10 px-4 py-2.5 rounded-xl hover:bg-[#6C5CE7] hover:text-white transition-all">
                    <FaArrowLeft /> Xem tất cả
                  </button>
                )}
              </div>
              
              <div className="overflow-y-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0 z-10 shadow-sm border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Hoạt động</th>
                      <th className="px-6 py-4 text-right">Giá trị (ETH)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedTx.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1.5 w-full">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-slate-400 font-medium w-8 text-xs">Từ:</span>
                                <span className={`font-bold ${tx.fromAddress?.toLowerCase() === selectedUser?.walletAddress?.toLowerCase() ? 'text-[#6C5CE7] bg-[#6C5CE7]/10 px-2 rounded' : 'text-slate-700'}`}>{getDisplayName(tx.fromAddress)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-slate-400 font-medium w-8 text-xs">Đến:</span>
                                <span className={`font-bold ${tx.toAddress?.toLowerCase() === selectedUser?.walletAddress?.toLowerCase() ? 'text-[#6C5CE7] bg-[#6C5CE7]/10 px-2 rounded' : 'text-slate-700'}`}>{getDisplayName(tx.toAddress)}</span>
                              </div>
                              <div className="mt-1">
                                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{tx.transactionHash ? `${tx.transactionHash.substring(0, 24)}...` : 'N/A'}</span>
                              </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right flex flex-col justify-center h-full">
                          <span className="font-black text-[#6C5CE7] text-lg">{tx.amount} <span className="text-xs text-slate-400">ETH</span></span>
                          <div className="mt-1 flex justify-end items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${tx.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                            <span className="text-[10px] text-slate-400 font-medium">{tx.createdAt ? new Date(tx.createdAt).toLocaleString('vi-VN') : 'N/A'}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Phân trang Giao dịch */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-sm font-bold text-[#6C5CE7]">
                  <button onClick={() => setTxPage(p => Math.max(1, p - 1))} disabled={txPage === 1} className="p-2 hover:bg-[#6C5CE7]/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"><FaChevronLeft /></button>
                  <span>Trang {txPage} / {totalTxPages}</span>
                  <button onClick={() => setTxPage(p => Math.min(totalTxPages, p + 1))} disabled={txPage === totalTxPages} className="p-2 hover:bg-[#6C5CE7]/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"><FaChevronRight /></button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- MODAL TẠO USER --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1e1b4b]/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] text-white">
              <div className="flex items-center gap-3">
                <FaUserPlus size={20} />
                <h3 className="font-bold text-xl tracking-tight">Thêm Thành Viên</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"><FaTimes /></button>
            </div>
            <form onSubmit={handleCreateUser} className="p-8 flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Họ và Tên</label>
                  <input type="text" required placeholder="Nguyễn Văn A" className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] font-medium text-slate-800 transition-all" value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Username</label>
                  <input type="text" required placeholder="user123" className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] font-medium text-slate-800 transition-all" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Mật khẩu</label>
                  <input type="password" required placeholder="••••••••" className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] font-medium text-slate-800 transition-all" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                </div>
                <div className="col-span-2 grid grid-cols-3 gap-4 mt-2">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Ví Blockchain (Tùy chọn)</label>
                    <input type="text" placeholder="0x..." className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] font-mono text-xs text-slate-600 transition-all" value={newUser.walletAddress} onChange={e => setNewUser({...newUser, walletAddress: e.target.value})} />
                  </div>
                  <div className="col-span-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Phân Quyền</label>
                    <select className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] font-bold text-slate-800 text-sm appearance-none cursor-pointer transition-all" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3.5 font-bold text-slate-600 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 rounded-xl transition-all border border-slate-200">Hủy bỏ</button>
                <button type="submit" className="flex-1 py-3.5 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] text-white font-bold rounded-xl shadow-lg shadow-[#6C5CE7]/30 hover:shadow-[#6C5CE7]/50 hover:-translate-y-0.5 transition-all">Tạo Tài Khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;