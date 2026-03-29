import React from 'react';
import { FaTrashAlt, FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa';

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
        <div>
          <h3 className="font-black text-slate-900 text-xl">Kho hàng Blockchain</h3>
          <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Quản lý và cập nhật sản phẩm</p>
        </div>
        <button 
          onClick={onAdd} 
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 transition-all active:scale-95"
        >
          <FaPlus size={14}/> Thêm Sản Phẩm
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
        {data.map(p => (
          <div 
            key={p.id} 
            className="group relative border border-slate-100 rounded-[28px] p-4 bg-white hover:border-[#6C5CE7]/30 hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => onEdit(p)} // Nhấn vào cả card để sửa
          >
            {/* Image Section */}
            <div className="relative h-48 bg-slate-50 rounded-2xl overflow-hidden mb-4 border border-slate-50">
              <img src={p.imageUrl || 'https://via.placeholder.com/300'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
            </div>

            {/* Info Section */}
            <h4 className="font-bold text-slate-800 text-lg line-clamp-1">{p.name}</h4>
            <div className="flex justify-between items-center mt-3">
               <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Giá niêm yết</p>
                  <p className="text-xl font-black text-[#6C5CE7]">{p.priceEth} <span className="text-xs text-[#A29BFE]">ETH</span></p>
               </div>
               
               {/* Nút xóa tách biệt */}
               <button 
                onClick={(e) => {
                  e.stopPropagation(); // Ngăn không cho sự kiện click vào card (onEdit) chạy
                  onDelete(p.id, p.name);
                }}
                className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                title="Xóa sản phẩm"
               >
                 <FaTrashAlt size={14}/>
               </button>
            </div>

            {/* Edit Badge (Chỉ hiện khi hover) */}
            <div className="absolute top-6 left-6 bg-[#6C5CE7] text-white text-[10px] px-3 py-1 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                CLICK ĐỂ SỬA
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-between items-center text-[#6C5CE7] font-bold p-4 bg-slate-50 rounded-2xl">
         <button onClick={() => setProdPage(Math.max(1, prodPage - 1))} disabled={prodPage === 1} className="p-2 disabled:opacity-20 hover:bg-white rounded-lg transition-colors"><FaChevronLeft /></button>
         <span className="text-sm">Trang {prodPage} / {totalPages}</span>
         <button onClick={() => setProdPage(Math.min(totalPages, prodPage + 1))} disabled={prodPage === totalPages} className="p-2 disabled:opacity-20 hover:bg-white rounded-lg transition-colors"><FaChevronRight /></button>
      </div>
    </div>
  );
};

export default ProductManagement;