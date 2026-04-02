import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaShoppingCart, FaCubes } from 'react-icons/fa';

import axiosClient from '../api/axiosClient';
import { fetchPublicConfig } from '../api/publicConfig';
import { Product } from './Products';

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [storeWalletAddress, setStoreWalletAddress] = useState('');

    useEffect(() => {
        const loadPageData = async () => {
            try {
                const [productRes, publicConfig] = await Promise.all([
                    axiosClient.get<Product>(`/products/${id}`),
                    fetchPublicConfig()
                ]);

                setProduct(productRes.data);
                setStoreWalletAddress(publicConfig.storeWalletAddress);
            } catch (error) {
                console.error('Loi tai chi tiet san pham:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadPageData();
        }
    }, [id]);

    const handleBuyNow = () => {
        if (!product || !storeWalletAddress) {
            return;
        }

        navigate('/dashboard', {
            state: {
                prefillAmount: product.priceWei,
                prefillAddress: storeWalletAddress,
                productId: product.id,
                productName: product.name,
                priceEth: product.priceEth
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#6C5CE7]/30 border-t-[#6C5CE7] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center font-black text-2xl text-red-500">
                Khong tim thay san pham!
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-20 text-slate-800">
            <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 sm:px-10 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
                <Link to="/products" className="flex items-center gap-2 text-slate-500 hover:text-[#6C5CE7] font-bold transition-colors">
                    <FaArrowLeft /> Tro ve cua hang
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
                            <div className="uppercase tracking-widest text-[#6C5CE7] font-black text-xs mb-3">San pham #{product.id}</div>
                            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 leading-tight">{product.name}</h1>
                            <p className="text-slate-500 mb-8 leading-relaxed font-medium">{product.description}</p>

                            <div className="bg-[#6C5CE7]/5 p-6 rounded-[24px] border border-[#6C5CE7]/20 mb-8">
                                <small className="text-[#6C5CE7] font-bold text-[10px] uppercase tracking-widest block mb-2">Gia thanh toan</small>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="font-black text-5xl text-slate-900 tracking-tighter">{product.priceEth}</span>
                                    <span className="font-bold text-slate-500">ETH</span>
                                </div>
                                <div className="text-xs font-mono text-slate-400 bg-white p-2 rounded-lg border border-slate-200 inline-block">
                                    {product.priceWei} WEI
                                </div>
                            </div>

                            <button
                                onClick={handleBuyNow}
                                disabled={!storeWalletAddress}
                                className="w-full py-4 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] text-white font-bold rounded-xl shadow-lg shadow-[#6C5CE7]/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 text-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                            >
                                <FaShoppingCart /> Mua ngay bang MetaMask
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProductDetail;
