import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaCubes, FaShoppingCart } from 'react-icons/fa';

import { axiosClient, fetchPublicConfig } from '../api';
import { commonText, productsText } from '../text';
import { Product } from './Products';

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [storeWalletAddress, setStoreWalletAddress] = useState('');

    useEffect(() => {
        const loadPageData = async () => {
            try {
                const [productResponse, publicConfig] = await Promise.all([
                    axiosClient.get<Product>(`/products/${id}`),
                    fetchPublicConfig()
                ]);

                setProduct(productResponse.data);
                setStoreWalletAddress(publicConfig.storeWalletAddress);
            } catch (error) {
                console.error(error);
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

        navigate('/dashboard/transfer', {
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
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#6C5CE7]/30 border-t-[#6C5CE7]"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex min-h-screen items-center justify-center text-2xl font-black text-red-500">
                {productsText.detail.notFound}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans text-slate-800">
            <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-md sm:px-10">
                <Link to="/products" className="flex items-center gap-2 font-bold text-slate-500 transition-colors hover:text-[#6C5CE7]">
                    <FaArrowLeft /> {productsText.detail.backToStore}
                </Link>
                <div className="rounded-xl bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] p-2.5 text-white shadow-lg">
                    <FaCubes size={20} />
                </div>
            </nav>

            <main className="mx-auto max-w-4xl px-6 py-10 sm:px-10">
                <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="flex items-center justify-center border-r border-slate-100 bg-slate-50 p-8">
                            <img src={product.imageUrl} alt={product.name} className="w-full max-w-sm rounded-[24px] shadow-lg" />
                        </div>
                        <div className="flex flex-col justify-center p-8 sm:p-10">
                            <div className="mb-3 text-xs font-black uppercase tracking-widest text-[#6C5CE7]">{productsText.detail.productCode(product.id)}</div>
                            <h1 className="mb-4 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">{product.name}</h1>
                            <p className="mb-8 font-medium leading-relaxed text-slate-500">{product.description}</p>

                            <div className="mb-8 rounded-[24px] border border-[#6C5CE7]/20 bg-[#6C5CE7]/5 p-6">
                                <small className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#6C5CE7]">{productsText.detail.priceTitle}</small>
                                <div className="mb-2 flex items-baseline gap-2">
                                    <span className="text-5xl font-black tracking-tighter text-slate-900">{product.priceEth}</span>
                                    <span className="font-bold text-slate-500">{commonText.labels.eth}</span>
                                </div>
                                <div className="inline-block rounded-lg border border-slate-200 bg-white p-2 font-mono text-xs text-slate-400">
                                    {product.priceWei} {commonText.labels.wei}
                                </div>
                            </div>

                            <button
                                onClick={handleBuyNow}
                                disabled={!storeWalletAddress}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] py-4 text-lg font-bold text-white shadow-lg shadow-[#6C5CE7]/30 transition-all hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                            >
                                <FaShoppingCart /> {commonText.actions.buyNowWithMetaMask}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProductDetail;
