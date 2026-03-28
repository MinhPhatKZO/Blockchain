import React, { useState, useEffect } from 'react';
import { FaInfoCircle, FaCheckCircle, FaCopy, FaWallet, FaEthereum } from 'react-icons/fa';
import Navbar from '../components/Navbar'; // Đảm bảo đường dẫn này đúng

interface UserData {
    id: number | string;
    fullName?: string;
    username: string;
    walletAddress?: string;
}

const ProfilePage: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);
    const [balance] = useState<string>("0"); // TODO: Lấy từ context/api
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                setCurrentUser(JSON.parse(userStr));
            } catch (error) {
                console.error("Lỗi parse user từ localStorage:", error);
            }
        }
    }, []);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20 text-slate-800 selection:bg-[#6C5CE7] selection:text-white">
            <Navbar />

            {/* Container chính - Căn giữa màn hình */}
            <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-10">
                
                {currentUser ? (
                    <div className="flex flex-col gap-8">
                        
                        {/* 🌟 THẺ HỒ SƠ CHÍNH */}
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden relative">
                            {/* Ảnh bìa (Cover Banner) */}
                            <div className="h-32 sm:h-40 bg-gradient-to-r from-[#6C5CE7] via-[#8e7bfa] to-[#a29bfe]"></div>
                            
                            <div className="px-6 sm:px-10 pb-8 relative">
                                {/* Avatar & Badge ID */}
                                <div className="flex justify-between items-end -mt-12 sm:-mt-16 mb-6">
                                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full p-1.5 shadow-md">
                                        <div className="w-full h-full bg-gradient-to-br from-[#6C5CE7]/10 to-[#6C5CE7]/20 text-[#6C5CE7] rounded-full flex items-center justify-center font-black text-4xl sm:text-5xl">
                                            {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : (currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U')}
                                        </div>
                                    </div>
                                    <div className="mb-2 sm:mb-4">
                                        <span className="bg-white text-slate-600 px-4 py-2 rounded-xl font-mono font-bold text-sm shadow-sm border border-slate-100 flex items-center gap-2">
                                            <FaInfoCircle className="text-slate-400" /> ID: #{currentUser.id || 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                {/* Tên User */}
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                        {currentUser.fullName || currentUser.username || 'Chưa cập nhật tên'}
                                    </h1>
                                    <p className="text-slate-500 font-medium mt-1">@{currentUser.username}</p>
                                </div>
                            </div>
                        </div>

                        {/* 🌟 THÔNG TIN VÍ & TÀI SẢN */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Card: Địa chỉ ví */}
                            <div className="bg-white p-6 sm:p-8 rounded-[32px] shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                                        <FaWallet size={18} />
                                    </div>
                                    <h2 className="font-bold text-slate-800 text-lg">Ví Liên Kết</h2>
                                </div>

                                {currentUser.walletAddress ? (
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group relative overflow-hidden">
                                        <div className="flex justify-between items-center mb-3 relative z-10">
                                            <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Địa chỉ Metamask</span>
                                            <button 
                                                onClick={() => copyToClipboard(currentUser.walletAddress!)} 
                                                className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-[#6C5CE7] text-slate-500 hover:text-[#6C5CE7] px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                                                title="Copy địa chỉ ví"
                                            >
                                                {copied ? <><FaCheckCircle className="text-emerald-500" /> Đã chép</> : <><FaCopy /> Copy</>}
                                            </button>
                                        </div>
                                        <div className="font-mono text-sm text-slate-700 break-all leading-relaxed relative z-10">
                                            {currentUser.walletAddress}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-orange-50 text-orange-600 p-4 rounded-2xl border border-orange-100 text-sm font-medium flex items-center gap-2">
                                        <FaInfoCircle /> Bạn chưa liên kết ví Web3.
                                    </div>
                                )}
                            </div>

                            {/* Card: Số dư */}
                            <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-6 sm:p-8 rounded-[32px] shadow-lg text-white relative overflow-hidden group">
                                {/* Họa tiết background cho ngầu */}
                                <div className="absolute -right-6 -top-6 text-white/5 group-hover:scale-110 transition-transform duration-500">
                                    <FaEthereum size={180} />
                                </div>

                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-white/10 backdrop-blur-sm text-emerald-400 rounded-2xl flex items-center justify-center border border-white/10">
                                            <FaEthereum size={20} />
                                        </div>
                                        <h2 className="font-bold text-slate-200 text-lg">Số Dư Contract</h2>
                                    </div>

                                    <div>
                                        <p className="text-slate-400 font-medium text-sm mb-1 uppercase tracking-wider">Khả dụng</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-black text-4xl sm:text-5xl text-white tracking-tight">{balance}</span>
                                            <span className="font-bold text-slate-400 text-lg">WEI</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                ) : (
                    // Trạng thái Loading
                    <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                        <div className="w-12 h-12 border-4 border-[#6C5CE7]/20 border-t-[#6C5CE7] rounded-full animate-spin mb-4"></div>
                        <h3 className="text-lg font-bold text-slate-700">Đang tải hồ sơ...</h3>
                        <p className="text-slate-500 text-sm mt-1">Vui lòng đợi một chút nhé</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProfilePage;