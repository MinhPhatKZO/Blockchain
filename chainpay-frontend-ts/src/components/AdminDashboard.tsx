import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaCubes, FaHistory, FaSearch, FaShieldAlt, FaTimes, FaUsers } from 'react-icons/fa';

import { adminText, commonText } from '../text';
import ProductManagement from './ProductManagement';
import TransactionLedger from './TransactionLedger';
import UserManagement from './UserManagement';

const normalizeWeiAmount = (value: unknown) => {
    const normalized = String(value ?? '').trim();

    if (!normalized) {
        return '0';
    }

    const integerPart = normalized.split('.')[0].replace(/^0+(?=\d)/, '');

    return /^\d+$/.test(integerPart) ? integerPart : '0';
};

const addWholeNumberStrings = (left: string, right: string) => {
    const leftDigits = left.split('').reverse();
    const rightDigits = right.split('').reverse();
    const maxLength = Math.max(leftDigits.length, rightDigits.length);
    let carry = 0;
    let result = '';

    for (let index = 0; index < maxLength; index += 1) {
        const leftDigit = Number(leftDigits[index] ?? 0);
        const rightDigit = Number(rightDigits[index] ?? 0);
        const total = leftDigit + rightDigit + carry;
        result = `${total % 10}${result}`;
        carry = Math.floor(total / 10);
    }

    return `${carry ? carry.toString() : ''}${result}`.replace(/^0+(?=\d)/, '');
};

const weiToEthNumber = (weiValue: string, fractionDigits = 6) => {
    const normalizedWei = normalizeWeiAmount(weiValue).padStart(19, '0');
    const whole = normalizedWei.slice(0, -18).replace(/^0+(?=\d)/, '');
    const trimmedFraction = normalizedWei
        .slice(-18)
        .slice(0, fractionDigits)
        .replace(/0+$/, '');

    return Number(`${whole || '0'}${trimmedFraction ? `.${trimmedFraction}` : ''}`);
};

const formatWeiString = (value: unknown) => normalizeWeiAmount(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const formatEthFromWei = (value: unknown) => {
    const ethValue = weiToEthNumber(normalizeWeiAmount(value));
    return `${new Intl.NumberFormat('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: ethValue > 0 && ethValue < 1 ? 6 : 4
    }).format(ethValue)} ETH`;
};

const formatAddress = (value: string) => {
    if (!value) {
        return commonText.labels.notAvailable;
    }

    return value.length <= 16 ? value : `${value.slice(0, 10)}...${value.slice(-8)}`;
};

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'users' | 'products' | 'transactions'>('users');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ totalUsers: 0, totalTransactions: 0, totalProducts: 0 });
    const [users, setUsers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [userPage, setUserPage] = useState(1);
    const [prodPage, setProdPage] = useState(1);
    const [txPage, setTxPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [productForm, setProductForm] = useState({
        name: '',
        priceEth: '',
        imageUrl: '',
        description: ''
    });

    const config = useMemo(() => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }), []);

    const fetchData = async () => {
        try {
            const [statsResponse, usersResponse, productsResponse, transactionsResponse] = await Promise.all([
                axios.get('http://localhost:8080/api/admin/stats', config),
                axios.get('http://localhost:8080/api/admin/users', config),
                axios.get('http://localhost:8080/api/admin/products', config),
                axios.get('http://localhost:8080/api/admin/transactions', config)
            ]);
            setStats(statsResponse.data);
            setUsers(usersResponse.data);
            setProducts(productsResponse.data);
            setTransactions(transactionsResponse.data);
        } catch (error) {
            console.error(error);
            if (axios.isAxiosError(error) && error.response?.status === 403) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config]);

    const openProductModal = (product: any = null) => {
        if (product) {
            setEditingProduct(product);
            setProductForm({
                name: product.name,
                priceEth: product.priceEth.toString(),
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
            alert(adminText.dashboard.alerts.missingNameAndPrice);
            return;
        }

        try {
            const ethValue = parseFloat(productForm.priceEth);
            const weiValue = (BigInt(Math.floor(ethValue * 1e9)) * BigInt(1e9)).toString();

            const payload = {
                name: productForm.name,
                description: productForm.description || adminText.dashboard.defaults.description,
                priceEth: ethValue.toString(),
                priceWei: weiValue,
                imageUrl: productForm.imageUrl || adminText.dashboard.defaults.imageUrl
            };

            if (editingProduct) {
                await axios.put(`http://localhost:8080/api/admin/products/${editingProduct.id}`, payload, config);
                alert(adminText.dashboard.alerts.updateSuccess);
            } else {
                await axios.post('http://localhost:8080/api/admin/products', payload, config);
                alert(adminText.dashboard.alerts.createSuccess);
            }

            setIsModalOpen(false);
            void fetchData();
        } catch (error: any) {
            console.error(error);
            alert(adminText.dashboard.alerts.serverErrorPrefix + (error.response?.data?.message || adminText.dashboard.alerts.serverErrorFallback));
        }
    };

    const handleDeleteProduct = async (id: number, name: string) => {
        if (window.confirm(adminText.dashboard.confirmations.deleteProduct(name))) {
            try {
                await axios.delete(`http://localhost:8080/api/admin/products/${id}`, config);
                void fetchData();
            } catch (error) {
                alert(adminText.dashboard.alerts.deleteFailed);
            }
        }
    };

    const getDisplayName = (address: string) => {
        if (!address) return commonText.user.system;
        const user = users.find((item) => item.walletAddress?.toLowerCase() === address.toLowerCase());
        return user ? user.fullName : `${address.substring(0, 6)}...`;
    };

    const selectedUserTransactions = useMemo(() => {
        if (!selectedUser?.walletAddress) {
            return [];
        }

        const walletAddress = String(selectedUser.walletAddress).toLowerCase();

        return transactions
            .filter((transaction) => {
                const fromAddress = String(transaction.fromAddress ?? '').toLowerCase();
                const toAddress = String(transaction.toAddress ?? '').toLowerCase();
                return fromAddress === walletAddress || toAddress === walletAddress;
            })
            .sort((left, right) => {
                const leftTime = new Date(left.createdAt || left.timestamp || 0).getTime();
                const rightTime = new Date(right.createdAt || right.timestamp || 0).getTime();
                return rightTime - leftTime;
            });
    }, [selectedUser, transactions]);

    const chartData = useMemo(() => {
        const dailyTotals = new Map<string, { amountWei: string; time: string; sortValue: number }>();

        transactions
            .filter((transaction) => !transaction.status || String(transaction.status).toUpperCase() === 'SUCCESS')
            .forEach((transaction) => {
                const rawDate = transaction.createdAt || transaction.timestamp;
                const createdAt = new Date(rawDate);

                if (Number.isNaN(createdAt.getTime())) {
                    return;
                }

                const dayKey = [
                    createdAt.getFullYear(),
                    String(createdAt.getMonth() + 1).padStart(2, '0'),
                    String(createdAt.getDate()).padStart(2, '0')
                ].join('-');

                const currentTotal = dailyTotals.get(dayKey)?.amountWei ?? '0';
                dailyTotals.set(dayKey, {
                    amountWei: addWholeNumberStrings(currentTotal, normalizeWeiAmount(transaction.amount)),
                    time: createdAt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                    sortValue: new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate()).getTime()
                });
            });

        return Array.from(dailyTotals.values())
            .sort((left, right) => left.sortValue - right.sortValue)
            .slice(-10)
            .map(({ amountWei, time }) => ({
                time,
                amount: weiToEthNumber(amountWei)
            }));
    }, [transactions]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center font-bold text-[#6C5CE7]">{adminText.dashboard.loading}</div>;
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
            <nav className="sticky top-0 z-40 flex items-center justify-between border-b bg-white px-8 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-[#6C5CE7] p-2 text-white shadow-lg shadow-purple-100"><FaShieldAlt /></div>
                    <h1 className="text-xl font-black">
                        {commonText.brand.appName} <span className="text-[#6C5CE7]">{commonText.brand.admin}</span>
                    </h1>
                </div>
                <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="text-sm font-bold text-red-500 hover:underline">
                    {adminText.dashboard.logout}
                </button>
            </nav>

            <main className="mx-auto max-w-7xl px-6 py-10">
                <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <StatCard label={adminText.dashboard.stats.users} value={stats.totalUsers} icon={<FaUsers />} />
                    <StatCard label={adminText.dashboard.stats.products} value={stats.totalProducts} icon={<FaCubes />} />
                    <StatCard label={adminText.dashboard.stats.transactions} value={stats.totalTransactions} icon={<FaHistory />} />
                </div>

                <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="flex gap-2 rounded-2xl border bg-white p-1.5 shadow-sm">
                        <TabBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} label={adminText.dashboard.tabs.users} />
                        <TabBtn active={activeTab === 'products'} onClick={() => setActiveTab('products')} label={adminText.dashboard.tabs.products} />
                        <TabBtn active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} label={adminText.dashboard.tabs.transactions} />
                    </div>
                    <div className="relative w-full md:w-72">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input
                            type="text"
                            placeholder={adminText.dashboard.searchPlaceholder}
                            className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition-all focus:border-[#6C5CE7]"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                    </div>
                </div>

                <div className="min-h-[600px]">
                    {activeTab === 'users' && (
                        <UserManagement
                            users={users}
                            searchTerm={searchTerm}
                            userPage={userPage}
                            setUserPage={setUserPage}
                            onDelete={() => {}}
                            onAdd={() => {}}
                            onSelectUser={setSelectedUser}
                            chartData={chartData}
                        />
                    )}
                    {activeTab === 'products' && (
                        <ProductManagement
                            products={products}
                            searchTerm={searchTerm}
                            prodPage={prodPage}
                            setProdPage={setProdPage}
                            onAdd={() => openProductModal()}
                            onEdit={openProductModal}
                            onDelete={handleDeleteProduct}
                        />
                    )}
                    {activeTab === 'transactions' && (
                        <TransactionLedger
                            transactions={transactions}
                            txPage={txPage}
                            setTxPage={setTxPage}
                            getDisplayName={getDisplayName}
                        />
                    )}
                </div>
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-md rounded-[32px] bg-white p-8 shadow-2xl duration-200 animate-in zoom-in">
                        <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-slate-300 hover:text-slate-600">
                            <FaTimes size={20} />
                        </button>
                        <h2 className="mb-6 text-2xl font-black">
                            {editingProduct ? adminText.dashboard.productModal.editTitle : adminText.dashboard.productModal.createTitle}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="ml-1 text-[10px] font-bold uppercase text-slate-400">{adminText.dashboard.productModal.nameLabel}</label>
                                <input
                                    className="mt-1 w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3.5 outline-none focus:border-[#6C5CE7] focus:bg-white focus:ring-2 focus:ring-[#6C5CE7]/10"
                                    value={productForm.name}
                                    onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
                                    placeholder={adminText.dashboard.productModal.namePlaceholder}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="ml-1 text-[10px] font-bold uppercase text-slate-400">{adminText.dashboard.productModal.priceLabel}</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="mt-1 w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3.5 outline-none focus:border-[#6C5CE7] focus:bg-white focus:ring-2 focus:ring-[#6C5CE7]/10"
                                        value={productForm.priceEth}
                                        onChange={(event) => setProductForm({ ...productForm, priceEth: event.target.value })}
                                        placeholder={adminText.dashboard.productModal.pricePlaceholder}
                                    />
                                </div>
                                <div>
                                    <label className="ml-1 text-[10px] font-bold uppercase text-slate-400">{adminText.dashboard.productModal.imageUrlLabel}</label>
                                    <input
                                        className="mt-1 w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3.5 outline-none focus:border-[#6C5CE7] focus:bg-white focus:ring-2 focus:ring-[#6C5CE7]/10"
                                        value={productForm.imageUrl}
                                        onChange={(event) => setProductForm({ ...productForm, imageUrl: event.target.value })}
                                        placeholder={adminText.dashboard.productModal.imageUrlPlaceholder}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="ml-1 text-[10px] font-bold uppercase text-slate-400">{adminText.dashboard.productModal.descriptionLabel}</label>
                                <textarea
                                    rows={3}
                                    className="mt-1 w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3.5 outline-none focus:border-[#6C5CE7] focus:bg-white focus:ring-2 focus:ring-[#6C5CE7]/10"
                                    value={productForm.description}
                                    onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
                                    placeholder={adminText.dashboard.productModal.descriptionPlaceholder}
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex gap-4">
                            <button onClick={() => setIsModalOpen(false)} className="flex-1 rounded-2xl bg-slate-100 py-4 font-bold text-slate-500 transition-colors hover:bg-slate-200">
                                {commonText.actions.cancel}
                            </button>
                            <button onClick={handleSaveProduct} className="flex-1 rounded-2xl bg-[#6C5CE7] py-4 font-bold text-white shadow-lg shadow-purple-200 transition-all hover:bg-[#5A4AD1] active:scale-95">
                                {commonText.actions.save}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedUser && (
                <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />

                    <div className="relative flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-[36px] border border-white/60 bg-white shadow-2xl shadow-slate-900/20 animate-in fade-in zoom-in-95">
                        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-br from-[#ede9ff] via-white to-[#f8fafc]" />

                        <div className="relative border-b border-slate-100 px-6 pb-6 pt-8 sm:px-8">
                            <button onClick={() => setSelectedUser(null)} className="absolute right-6 top-6 text-slate-300 transition-colors hover:text-slate-600">
                                <FaTimes size={20} />
                            </button>

                            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-2xl font-black text-[#6C5CE7] shadow-inner">
                                        {selectedUser.fullName?.charAt(0) ?? selectedUser.username?.charAt(0) ?? 'U'}
                                    </div>
                                    <div>
                                        <div className="text-xs font-black uppercase tracking-[0.3em] text-[#6C5CE7]">{adminText.userManagement.modalTitle}</div>
                                        <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">{selectedUser.fullName}</h2>
                                        <p className="mt-1 font-medium text-slate-500">@{selectedUser.username}</p>
                                        <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-slate-500">{adminText.userManagement.modalSubtitle}</p>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{adminText.userManagement.walletLabel}</div>
                                        <div className="mt-2 max-w-[260px] break-all font-mono text-xs text-slate-600">
                                            {selectedUser.walletAddress || adminText.userManagement.noWallet}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{adminText.userManagement.totalTransactionsLabel}</div>
                                        <div className="mt-2 text-2xl font-black text-slate-900">{selectedUserTransactions.length}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative flex-1 overflow-y-auto px-6 py-6 sm:px-8">
                            {!selectedUser.walletAddress ? (
                                <div className="rounded-[28px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-700">
                                    {adminText.userManagement.noWallet}
                                </div>
                            ) : selectedUserTransactions.length === 0 ? (
                                <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-12 text-center text-sm font-medium text-slate-500">
                                    {adminText.userManagement.empty}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {selectedUserTransactions.map((transaction) => {
                                        const isOutgoing = String(transaction.fromAddress ?? '').toLowerCase() === String(selectedUser.walletAddress).toLowerCase();
                                        return (
                                            <div key={transaction.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                    <div>
                                                        <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.2em] ${isOutgoing ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                            {isOutgoing ? adminText.userManagement.sentBadge : adminText.userManagement.receivedBadge}
                                                        </div>
                                                        <div className="mt-4 space-y-2 text-sm font-medium text-slate-600">
                                                            <p><span className="font-black text-slate-900">{adminText.transactionLedger.from}:</span> {formatAddress(transaction.fromAddress)}</p>
                                                            <p><span className="font-black text-slate-900">{adminText.transactionLedger.to}:</span> {formatAddress(transaction.toAddress)}</p>
                                                            {transaction.product?.name && (
                                                                <p><span className="font-black text-slate-900">{adminText.userManagement.productLabel}:</span> {transaction.product.name}</p>
                                                            )}
                                                            <p className="text-xs text-slate-400">{new Date(transaction.createdAt || transaction.timestamp).toLocaleString('vi-VN')}</p>
                                                        </div>
                                                    </div>

                                                    <div className="min-w-[180px] rounded-2xl bg-slate-50 px-4 py-3 text-left lg:text-right">
                                                        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{adminText.userManagement.amountLabel}</div>
                                                        <div className="mt-2 text-xl font-black text-[#6C5CE7]">{formatEthFromWei(transaction.amount)}</div>
                                                        <div className="mt-1 font-mono text-[11px] text-slate-400">{formatWeiString(transaction.amount)} WEI</div>
                                                        <div className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.15em] ${transaction.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                            {transaction.status || commonText.labels.notAvailable}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                                                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{adminText.userManagement.hashLabel}</div>
                                                    <div className="mt-2 break-all font-mono text-xs text-slate-500">
                                                        {transaction.transactionHash || commonText.labels.notAvailable}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 sm:px-8">
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="rounded-2xl bg-[#6C5CE7] px-6 py-3 text-sm font-black text-white shadow-lg shadow-purple-200 transition-all hover:bg-[#5A4AD1]"
                                >
                                    {adminText.userManagement.close}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ label, value, icon }: any) => (
    <div className="flex items-center justify-between rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
        <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
            <p className="text-3xl font-black">{value.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-purple-50 p-4 text-2xl text-[#6C5CE7]">{icon}</div>
    </div>
);

const TabBtn = ({ active, onClick, label }: any) => (
    <button
        onClick={onClick}
        className={`rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${active ? 'bg-[#6C5CE7] text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
    >
        {label}
    </button>
);

export default AdminDashboard;
