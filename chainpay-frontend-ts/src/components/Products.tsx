import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { FaArrowRight, FaBoxOpen } from 'react-icons/fa';
import Navbar from '../components/Navbar';

export interface Product {
    id: number;
    name: string;
    description: string;
    priceEth: string;
    priceWei: string;
    imageUrl: string;
}

const Products: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axiosClient.get<Product[]>('/products');
                setProducts(res.data);
            } catch (error) {
                console.error("Lỗi tải sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-20 text-slate-800">
            {/* Gọi Component Navbar dùng chung vào đây */}
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 sm:px-10 py-10">
                {/* Header Section */}
                <div className="mb-10">
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">Khám Phá Sản Phẩm</h2>
                    <p className="text-slate-500 text-lg max-w-2xl">Sở hữu những vật phẩm kỹ thuật số độc quyền thanh toán hoàn toàn bằng Ethereum trên không gian Web3.</p>
                </div>

                {loading ? (
                    <div className="text-center py-20 flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-[#6C5CE7]/20 border-t-[#6C5CE7] rounded-full animate-spin"></div>
                        <span className="font-bold text-slate-400 animate-pulse">Đang kết nối tới cửa hàng...</span>
                    </div>
                ) : products.length === 0 ? (
                    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-16 flex flex-col items-center justify-center text-center">
                        <div className="bg-slate-50 p-6 rounded-full mb-4">
                            <FaBoxOpen size={48} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">Chưa có sản phẩm nào</h3>
                        <p className="text-slate-500">Cửa hàng hiện tại đang trống. Bạn hãy quay lại sau nhé!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <div key={product.id} className="bg-white rounded-[32px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 overflow-hidden group flex flex-col">
                                <div className="overflow-hidden p-4 pb-0">
                                    <img 
                                        src={product.imageUrl} 
                                        alt={product.name} 
                                        className="w-full h-52 object-cover rounded-[24px] group-hover:scale-105 transition-transform duration-500 shadow-sm" 
                                    />
                                </div>
                                <div className="p-6 flex flex-col flex-grow justify-between gap-4">
                                    <div>
                                        <h3 className="font-black text-slate-900 text-lg mb-1 truncate" title={product.name}>
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-slate-500 line-clamp-2">
                                            {product.description}
                                        </p>
                                    </div>
                                    <div className="mt-auto">
                                        <div className="bg-gradient-to-r from-[#6C5CE7]/5 to-transparent p-3 rounded-xl border border-[#6C5CE7]/10 mb-4 flex items-baseline gap-1.5">
                                            <span className="font-black text-2xl text-[#6C5CE7]">{product.priceEth}</span>
                                            <span className="font-bold text-slate-500 text-sm uppercase tracking-wider">ETH</span>
                                        </div>
                                        <Link 
                                            to={`/products/${product.id}`} 
                                            className="group/btn w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 hover:bg-[#6C5CE7] text-white font-bold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#6C5CE7]/30"
                                        >
                                            Xem Chi Tiết
                                            <FaArrowRight className="group-hover/btn:translate-x-1 transition-transform" size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Products;