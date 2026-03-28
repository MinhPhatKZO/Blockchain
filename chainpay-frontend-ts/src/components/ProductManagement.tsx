import React from 'react';
import { FaCubes, FaPencilAlt, FaTrashAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface Props {
  products: any[];
  searchTerm: string;
  prodPage: number;
  setProdPage: (p: number) => void;
  onAdd: () => void;
  onEdit: (p: any) => void;
  onDelete: (id: number, name: string) => void;
}

const ProductManagement: React.FC<Props> = ({ products, searchTerm, prodPage, setProdPage, onAdd, onEdit, onDelete }) => {
  const itemsPerPage = 6;
  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const data = filtered.slice((prodPage - 1) * itemsPerPage, prodPage * itemsPerPage);

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-8 animate-in fade-in duration-500 flex flex-col min-h-[600px]">
      <div className="flex justify-between items-center mb-8">
        <div><h3 className="font-black text-slate-900 text-xl">Kho hàng Blockchain</h3><p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Cập nhật giá thực tế lên Ledger</p></div>
        <button onClick={onAdd} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-100">+ Thêm Sản Phẩm</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {data.map(p => (
          <div key={p.id} className="border border-slate-100 rounded-[28px] p-5 group hover:border-[#A29BFE]/50 hover:shadow-xl transition-all duration-300">
            <div className="relative h-44 bg-slate-50 rounded-2xl overflow-hidden mb-4 border border-slate-100">
              <img src={p.imageUrl || 'https://via.placeholder.com/300'} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={p.name} />
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(p)} className="p-2 bg-white rounded-lg text-blue-500 shadow-md"><FaPencilAlt size={12}/></button>
                <button onClick={() => onDelete(p.id, p.name)} className="p-2 bg-white rounded-lg text-red-500 shadow-md"><FaTrashAlt size={12}/></button>
              </div>
            </div>
            <h4 className="font-bold text-slate-800 line-clamp-1">{p.name}</h4>
            <div className="flex justify-between items-end mt-4">
               <p className="text-2xl font-black text-[#6C5CE7]">{p.priceEth} <span className="text-xs text-[#A29BFE]">ETH</span></p>
               <span className="text-[10px] font-mono text-slate-300">ID: {p.id}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-between items-center text-[#6C5CE7] font-bold p-4 bg-slate-50 rounded-2xl">
         <button onClick={() => setProdPage(Math.max(1, prodPage - 1))} disabled={prodPage === 1} className="disabled:opacity-20"><FaChevronLeft /></button>
         <span>Trang {prodPage} / {totalPages}</span>
         <button onClick={() => setProdPage(Math.min(totalPages, prodPage + 1))} disabled={prodPage === totalPages} className="disabled:opacity-20"><FaChevronRight /></button>
      </div>
    </div>
  );
};
export default ProductManagement;