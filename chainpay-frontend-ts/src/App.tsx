import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import các trang public
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import ProductDetail from './components/ProductDetail';
import Profile from './components/Profile';

// --- IMPORT THÊM CÁC COMPONENT ADMIN ---
// (Đảm bảo bạn đã tạo 2 file này trong thư mục components nhé)
import AdminRoute from './components/AdminRoute'; 
import AdminDashboard from './components/AdminDashboard'; 

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* --- KHU VỰC PUBLIC (Ai cũng vào được) --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Khu vực User bình thường */}
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        {/* --- KHU VỰC BẢO VỆ DÀNH RIÊNG CHO ADMIN --- */}
        {/* Bất cứ Route nào nằm gọn trong thẻ <AdminRoute> đều sẽ bị kiểm tra Token */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          {/* Sau này bạn có thể thêm các trang quản lý khác ở đây */}
          {/* <Route path="/admin/users" element={<ManageUsers />} /> */}
        </Route>

        {/* Chuyển hướng mặc định khi gõ sai link */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Bắt lỗi 404 cho các link không tồn tại */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;