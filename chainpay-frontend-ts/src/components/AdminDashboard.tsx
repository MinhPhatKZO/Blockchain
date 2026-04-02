import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaCubes, FaHistory, FaShieldAlt, FaSearch, FaTimes } from 'react-icons/fa';

// Import các component con
import UserManagement from './UserManagement';
import ProductManagement from './ProductManagement';
import TransactionLedger from './TransactionLedger';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'products' | 'transactions'>('users');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Data States
  const [stats, setStats] = useState({ totalUsers: 0, totalTransactions: 0, totalProducts: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Pagination States
  const [userPage, setUserPage] = useState(1);
  const [prodPage, setProdPage] = useState(1);
  const [txPage, setTxPage] = useState(1);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({ 
    name: '', 
    priceEth: '', 
    imageUrl: '', 
    description: '' 
  });

  // Memoize config để tránh re-render vô tận
  const config = useMemo(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  }), []);

  const fetchData = async () => {
    try {
      const [sRes, uRes, pRes, tRes] = await Promise.all([
        axios.get('http://localhost:8080/api/admin/stats', config),
        axios.get('http://localhost:8080/api/admin/users', config),
        axios.get('http://localhost:8080/api/admin/products', config),
        axios.get('http://localhost:8080/api/admin/transactions', config)
      ]);
      setStats(sRes.data);
      setUsers(uRes.data);
      setProducts(pRes.data);
      setTransactions(tRes.data);
    } catch (err) {
      console.error("Lỗi tải data:", err);
      if (axios.isAxiosError(err) && err.response?.status === 403) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  // --- LOGIC SẢN PHẨM (FIX LỖI 500 Ở ĐÂY) ---
  const openProductModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({ 
        name: product.name, 
        priceEth: product.priceEth.toString(), // Chuyển số về string để hiển thị trong input
        imageUrl: product.imageUrl || '', 
        description: product.description || '' 
      });
    } else {
      setEditingProduct(null);
      setProductForm({ name: '', priceEth: '', imageUrl: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.priceEth) {
      alert("Vui lòng điền tên và giá!");
      return;
    }

    try {
      const ethValue = parseFloat(productForm.priceEth);

      const weiValue = (BigInt(Math.floor(ethValue * 1e9)) * BigInt(1e9)).toString();

      const payload = {
        name: productForm.name,
        description: productForm.description || "Chưa có mô tả",
        priceEth: ethValue.toString(),
        priceWei: weiValue,
        imageUrl: productForm.imageUrl || "https://via.placeholder.com/300"
      };

      console.log("Đang gửi Payload:", payload);

      if (editingProduct) {
        await axios.put(`http://localhost:8080/api/admin/products/${editingProduct.id}`, payload, config);
        alert('Cập nhật sản phẩm thành công! 🚀');
      } else {
        await axios.post('http://localhost:8080/api/admin/products', payload, config);
        alert('Thêm sản phẩm mới thành công! ✨');
      }

      setIsModalOpen(false);
      fetchData(); // Tải lại danh sách để cập nhật giao diện
    } catch (err: any) {
      console.error("Lỗi 500 chi tiết:", err.response?.data);
      alert('Lỗi Server: ' + (err.response?.data?.message || 'Hãy kiểm tra log ở IntelliJ!'));
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (window.confirm(`Xóa sản phẩm "${name}"?`)) {
      try {
        await axios.delete(`http://localhost:8080/api/admin/products/${id}`, config);
        fetchData();
      } catch (err) { alert('Không thể xóa sản phẩm!'); }
    }
  };

  const getDisplayName = (addr: string) => {
    if (!addr) return "Hệ thống";
    const user = users.find(u => u.walletAddress?.toLowerCase() === addr.toLowerCase());
    return user ? user.fullName : `${addr.substring(0, 6)}...`;
  };

  const chartData = useMemo(() =>
    transactions.slice(0, 10).map(tx => ({
      time: new Date(tx.createdAt).toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'}),
      amount: parseFloat(tx.amount) || 0
    })).reverse(),
  [transactions]);

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-[#6C5CE7]">Đang tải dữ liệu Blockchain...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Header */}
      <nav className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-[#6C5CE7] p-2 rounded-xl text-white shadow-lg shadow-purple-100"><FaShieldAlt /></div>
          <h1 className="text-xl font-black">ChainPay <span className="text-[#6C5CE7]">Admin</span></h1>
        </div>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="text-sm font-bold text-red-500 hover:underline">Đăng xuất</button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
           <StatCard label="Thành viên" value={stats.totalUsers} icon={<FaUsers/>} />
           <StatCard label="Sản phẩm" value={stats.totalProducts} icon={<FaCubes/>} />
           <StatCard label="Giao dịch" value={stats.totalTransactions} icon={<FaHistory/>} />
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex gap-2 bg-white p-1.5 rounded-2xl shadow-sm border">
            <TabBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="Người dùng" />
            <TabBtn active={activeTab === 'products'} onClick={() => setActiveTab('products')} label="Sản phẩm" />
            <TabBtn active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} label="Giao dịch" />
          </div>
          <div className="relative w-full md:w-72">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" placeholder="Tìm kiếm nhanh..." 
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-[#6C5CE7] outline-none transition-all"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Dynamic Components */}
        <div className="min-h-[600px]">
          {activeTab === 'users' && (
            <UserManagement 
              users={users} searchTerm={searchTerm} userPage={userPage} setUserPage={setUserPage} 
              onDelete={() => {}} onAdd={() => {}} chartData={chartData} 
            />
          )}
          {activeTab === 'products' && (
            <ProductManagement 
              products={products} searchTerm={searchTerm} prodPage={prodPage} setProdPage={setProdPage} 
              onAdd={() => openProductModal()} onEdit={openProductModal} onDelete={handleDeleteProduct} 
            />
          )}
          {activeTab === 'transactions' && (
            <TransactionLedger 
              transactions={transactions} txPage={txPage} setTxPage={setTxPage} getDisplayName={getDisplayName} 
            />
          )}
        </div>
      </main>

      {/* MODAL THÊM/SỬA SẢN PHẨM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white w-full max-w-md rounded-[32px] p-8 relative shadow-2xl animate-in zoom-in duration-200">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-600"><FaTimes size={20}/></button>
            <h2 className="text-2xl font-black mb-6">{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tên sản phẩm</label>
                <input 
                  className="w-full border border-slate-100 bg-slate-50 rounded-2xl px-5 py-3.5 mt-1 outline-none focus:bg-white focus:ring-2 focus:ring-[#6C5CE7]/10 focus:border-[#6C5CE7]" 
                  value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  placeholder="iPhone 15 Pro..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Giá (ETH)</label>
                  <input 
                    type="number" step="0.01"
                    className="w-full border border-slate-100 bg-slate-50 rounded-2xl px-5 py-3.5 mt-1 outline-none focus:bg-white focus:ring-2 focus:ring-[#6C5CE7]/10 focus:border-[#6C5CE7]" 
                    value={productForm.priceEth} onChange={(e) => setProductForm({...productForm, priceEth: e.target.value})}
                    placeholder="0.5"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">URL ảnh</label>
                  <input 
                    className="w-full border border-slate-100 bg-slate-50 rounded-2xl px-5 py-3.5 mt-1 outline-none focus:bg-white focus:ring-2 focus:ring-[#6C5CE7]/10 focus:border-[#6C5CE7]" 
                    value={productForm.imageUrl} onChange={(e) => setProductForm({...productForm, imageUrl: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Mô tả</label>
                <textarea 
                  rows={3}
                  className="w-full border border-slate-100 bg-slate-50 rounded-2xl px-5 py-3.5 mt-1 outline-none focus:bg-white focus:ring-2 focus:ring-[#6C5CE7]/10 focus:border-[#6C5CE7]" 
                  value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  placeholder="Mô tả sản phẩm..."
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-500 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors">Hủy</button>
              <button onClick={handleSaveProduct} className="flex-1 py-4 font-bold text-white bg-[#6C5CE7] rounded-2xl shadow-lg shadow-purple-200 hover:bg-[#5A4AD1] transition-all active:scale-95">Lưu lại</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-components Helper ---
const StatCard = ({label, value, icon}: any) => (
  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between">
    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p><p className="text-3xl font-black">{value.toLocaleString()}</p></div>
    <div className="text-2xl text-[#6C5CE7] bg-purple-50 p-4 rounded-2xl">{icon}</div>
  </div>
);

const TabBtn = ({active, onClick, label}: any) => (
  <button 
    onClick={onClick} 
    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${active ? 'bg-[#6C5CE7] text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
  >
    {label}
  </button>
);

export default AdminDashboard;