import React from 'react';
import { FaChevronLeft, FaChevronRight, FaPlus, FaTrashAlt } from 'react-icons/fa';

import { adminText, commonText } from '../text';

interface Props {
    products: any[];
    searchTerm: string;
    prodPage: number;
    setProdPage: (page: number) => void;
    onAdd: () => void;
    onEdit: (product: any) => void;
    onDelete: (id: number, name: string) => void;
}

const ProductManagement: React.FC<Props> = ({ products, searchTerm, prodPage, setProdPage, onAdd, onEdit, onDelete }) => {
    const itemsPerPage = 6;
    const filtered = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    const data = filtered.slice((prodPage - 1) * itemsPerPage, prodPage * itemsPerPage);

    return (
        <div className="flex min-h-[600px] flex-col rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm duration-500 animate-in fade-in">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-slate-900">{adminText.productManagement.title}</h3>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">{adminText.productManagement.description}</p>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-600 active:scale-95"
                >
                    <FaPlus size={14} /> {adminText.productManagement.addButton}
                </button>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.map((product) => (
                    <div
                        key={product.id}
                        className="group relative cursor-pointer rounded-[28px] border border-slate-100 bg-white p-4 transition-all duration-300 hover:border-[#6C5CE7]/30 hover:shadow-xl"
                        onClick={() => onEdit(product)}
                    >
                        <div className="relative mb-4 h-48 overflow-hidden rounded-2xl border border-slate-50 bg-slate-50">
                            <img
                                src={product.imageUrl || 'https://via.placeholder.com/300'}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                alt={product.name}
                            />
                            <div className="absolute inset-0 bg-black/5 transition-colors group-hover:bg-transparent" />
                        </div>

                        <h4 className="line-clamp-1 text-lg font-bold text-slate-800">{product.name}</h4>
                        <div className="mt-3 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-tighter text-slate-400">{adminText.productManagement.listedPrice}</p>
                                <p className="text-xl font-black text-[#6C5CE7]">{product.priceEth} <span className="text-xs text-[#A29BFE]">{commonText.labels.eth}</span></p>
                            </div>

                            <button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onDelete(product.id, product.name);
                                }}
                                className="rounded-xl bg-red-50 p-3 text-red-500 shadow-sm transition-all hover:bg-red-500 hover:text-white"
                                title={adminText.productManagement.deleteTitle}
                            >
                                <FaTrashAlt size={14} />
                            </button>
                        </div>

                        <div className="absolute left-6 top-6 rounded-full bg-[#6C5CE7] px-3 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                            {adminText.productManagement.editBadge}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex items-center justify-between rounded-2xl bg-slate-50 p-4 font-bold text-[#6C5CE7]">
                <button onClick={() => setProdPage(Math.max(1, prodPage - 1))} disabled={prodPage === 1} className="rounded-lg p-2 transition-colors hover:bg-white disabled:opacity-20">
                    <FaChevronLeft />
                </button>
                <span className="text-sm">{adminText.productManagement.pageLabel(prodPage, totalPages)}</span>
                <button onClick={() => setProdPage(Math.min(totalPages, prodPage + 1))} disabled={prodPage === totalPages} className="rounded-lg p-2 transition-colors hover:bg-white disabled:opacity-20">
                    <FaChevronRight />
                </button>
            </div>
        </div>
    );
};

export default ProductManagement;
