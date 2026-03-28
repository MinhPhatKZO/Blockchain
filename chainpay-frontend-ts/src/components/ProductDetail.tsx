import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Product } from './Products';
import { FaArrowLeft, FaShoppingCart, FaCubes } from 'react-icons/fa';

// THAY ĐỊA CHỈ NÀY BẰNG ĐỊA CHỈ VÍ CỦA ADMIN/CỬA HÀNG NHẬN TIỀN
const STORE_WALLET_ADDRESS = "0x598BFc69F5BD97Fd8fa7E6E524FD13b42DBaa838"; // Địa chỉ ví của cửa hàng (Admin) - Thay bằng địa chỉ thật của bạn

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axiosClient.get<Product>(`/products/${id}`);
                setProduct(res.data);
            } catch (error) {
                console.error("Lỗi tải chi tiết:", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProduct();
    }, [id]);

    const handleBuyNow = () => {
        if (!product) return;
        // Chuyển hướng về Dashboard, gửi kèm giá Wei và địa chỉ cửa hàng
        navigate('/dashboard', { 
            state: { 
                prefillAmount: product.priceWei, 
                prefillAddress: STORE_WALLET_ADDRESS,
                productId: product.id,
                productName: product.name,
                priceEth: product.priceEth
            } 
        });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#6C5CE7]/30 border-t-[#6C5CE7] rounded-full animate-spin"></div></div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center font-black text-2xl text-red-500">Không tìm thấy sản phẩm!</div>;

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-20 text-slate-800">
            <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 sm:px-10 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
                <Link to="/products" className="flex items-center gap-2 text-slate-500 hover:text-[#6C5CE7] font-bold transition-colors">
                    <FaArrowLeft /> Trở về cửa hàng
                </Link>
                <div className="bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] p-2.5 rounded-xl text-white shadow-lg">
                    <FaCubes size={20} />
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 sm:px-10 py-10">
                <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="p-8 bg-slate-50 flex items-center justify-center border-r border-slate-100">
                            <img src={product.imageUrl} alt={product.name} className="w-full max-w-sm rounded-[24px] shadow-lg" />
                        </div>
                        <div className="p-8 sm:p-10 flex flex-col justify-center">
                            <div className="uppercase tracking-widest text-[#6C5CE7] font-black text-xs mb-3">Sản phẩm #{product.id}</div>
                            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 leading-tight">{product.name}</h1>
                            <p className="text-slate-500 mb-8 leading-relaxed font-medium">{product.description}</p>
                            
                            <div className="bg-[#6C5CE7]/5 p-6 rounded-[24px] border border-[#6C5CE7]/20 mb-8">
                                <small className="text-[#6C5CE7] font-bold text-[10px] uppercase tracking-widest block mb-2">Giá thanh toán</small>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="font-black text-5xl text-slate-900 tracking-tighter">{product.priceEth}</span>
                                    <span className="font-bold text-slate-500">ETH</span>
                                </div>
                                <div className="text-xs font-mono text-slate-400 bg-white p-2 rounded-lg border border-slate-200 inline-block">
                                    {product.priceWei} WEI
                                </div>
                            </div>

                            <button onClick={handleBuyNow} className="w-full py-4 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] text-white font-bold rounded-xl shadow-lg shadow-[#6C5CE7]/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 text-lg">
                                <FaShoppingCart /> Mua Ngay bằng MetaMask
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProductDetail;