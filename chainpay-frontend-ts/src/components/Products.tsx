import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaBoxOpen } from 'react-icons/fa';

import axiosClient from '../api/axiosClient';
import { commonText, productsText } from '../text';
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axiosClient.get<Product[]>('/products');
                setProducts(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans text-slate-800">
            <Navbar />

            <main className="mx-auto max-w-7xl px-6 py-10 sm:px-10">
                <div className="mb-10">
                    <h2 className="mb-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{productsText.list.title}</h2>
                    <p className="max-w-2xl text-lg text-slate-500">{productsText.list.description}</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center gap-4 py-20 text-center">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#6C5CE7]/20 border-t-[#6C5CE7]"></div>
                        <span className="animate-pulse font-bold text-slate-400">{productsText.list.loading}</span>
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-[32px] border border-slate-200 bg-white p-16 text-center shadow-sm">
                        <div className="mb-4 rounded-full bg-slate-50 p-6">
                            <FaBoxOpen size={48} className="text-slate-300" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-slate-700">{productsText.list.emptyTitle}</h3>
                        <p className="text-slate-500">{productsText.list.emptyDescription}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {products.map((product) => (
                            <div key={product.id} className="group flex flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                <div className="overflow-hidden p-4 pb-0">
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="h-52 w-full rounded-[24px] object-cover shadow-sm transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex flex-grow flex-col justify-between gap-4 p-6">
                                    <div>
                                        <h3 className="mb-1 truncate text-lg font-black text-slate-900" title={product.name}>
                                            {product.name}
                                        </h3>
                                        <p className="line-clamp-2 text-sm text-slate-500">
                                            {product.description}
                                        </p>
                                    </div>
                                    <div className="mt-auto">
                                        <div className="mb-4 flex items-baseline gap-1.5 rounded-xl border border-[#6C5CE7]/10 bg-gradient-to-r from-[#6C5CE7]/5 to-transparent p-3">
                                            <span className="text-2xl font-black text-[#6C5CE7]">{product.priceEth}</span>
                                            <span className="text-sm font-bold uppercase tracking-wider text-slate-500">{commonText.labels.eth}</span>
                                        </div>
                                        <Link
                                            to={`/products/${product.id}`}
                                            className="group/btn flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 font-bold text-white shadow-md transition-all duration-300 hover:bg-[#6C5CE7] hover:shadow-lg hover:shadow-[#6C5CE7]/30"
                                        >
                                            {commonText.actions.viewDetails}
                                            <FaArrowRight className="transition-transform group-hover/btn:translate-x-1" size={14} />
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
