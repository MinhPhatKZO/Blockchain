import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    sub: string;
    role: string;
    exp: number;
}

const AdminRoute = () => {
    // Lấy token bạn đã lưu lúc đăng nhập (giả sử bạn lưu ở localStorage)
    const token = localStorage.getItem('token'); 

    if (!token) {
        return <Navigate to="/login" replace />; // Chưa đăng nhập thì về trang Login
    }

    try {
        // Giải mã token để lấy role
        const decoded = jwtDecode<DecodedToken>(token);
        
        // Kiểm tra xem có đúng là Admin không
        if (decoded.role === 'ROLE_ADMIN') {
            return <Outlet />; // Cho phép đi tiếp vào trang Admin
        } else {
            return <Navigate to="/dashboard" replace />; // Dân thường thì quay xe về Dashboard
        }
    } catch (error) {
        // Nếu token bị lỗi/hỏng
        return <Navigate to="/login" replace />;
    }
};

export default AdminRoute;