import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuthContextType, User } from '../types';

// Khởi tạo Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    // Hàm giả lập login (chỉ lưu state, còn token đã lưu ở component Login rồi)
    const login = (username: string) => {
        setUser({ username });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook để dùng Context ở các component khác
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};