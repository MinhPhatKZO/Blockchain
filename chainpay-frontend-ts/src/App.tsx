import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import AdminDashboard from './components/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import Dashboard from './components/Dashboard';
import DashboardHistory from './components/DashboardHistory';
import DashboardTransfer from './components/DashboardTransfer';
import DashboardWallet from './components/DashboardWallet';
import Login from './components/Login';
import ProductDetail from './components/ProductDetail';
import Products from './components/Products';
import Profile from './components/Profile';
import Register from './components/Register';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/dashboard" element={<Dashboard />}>
                    <Route index element={<Navigate to="history" replace />} />
                    <Route path="wallet" element={<DashboardWallet />} />
                    <Route path="transfer" element={<DashboardTransfer />} />
                    <Route path="history" element={<DashboardHistory />} />
                </Route>
                <Route path="/profile" element={<Profile />} />

                <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                </Route>

                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
