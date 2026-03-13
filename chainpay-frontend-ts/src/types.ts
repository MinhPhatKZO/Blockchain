// ==================== CONTEXT TYPES (Cho Auth & MetaMask) ====================

// Định nghĩa kiểu cho User - Nâng cấp thêm role và thông tin định danh
export interface User {
    username: string;
    fullName?: string;
    walletAddress?: string;
    role?: 'USER' | 'ADMIN'; // Thêm role để bẻ lái giao diện
}
  
// Định nghĩa kiểu cho Context Auth
export interface AuthContextType {
    user: User | null;
    login: (token: string, userData: User) => void; // Cập nhật để nhận token và user
    logout: () => void;
}
  
// Định nghĩa kiểu cho Context MetaMask
export interface MetaMaskContextType {
    account: string | null;
    isConnected: boolean;
    connectWallet: () => Promise<void>;
    web3: any; 
}

// ==================== API DATA MODELS (Cho Login, Register, Payment) ====================

// Khớp với LoginRequest & RegisterRequest bên Java
export interface AuthRequest {
    username?: string;
    password?: string;
    fullName?: string;
    walletAddress?: string;
}

// Khớp với LoginResponse bên Java
export interface AuthResponse {
    accessToken: string;
    tokenType: string;
    user?: User; // Backend thường trả kèm thông tin user cơ bản
}

// Khớp với PaymentRequest bên Java
export interface PaymentRequest {
    toAddress: string;
    amount: string; 
}

// Khớp với PaymentResponse bên Java
export interface PaymentResponse {
    transactionHash: string;
    status: string;
    message: string;
}

// Khớp với BalanceResponse bên Java
export interface BalanceResponse {
    address: string;
    balance: string;
    currency: string;
}

// ==================== ADMIN SPECIFIC MODELS (Mới bổ sung) ====================

// Dùng cho trang Admin Dashboard thống kê
export interface AdminStats {
    totalUsers: number;
    totalTransactions?: number;
    totalVolume?: string;
}

// Dùng cho bảng danh sách User trong Admin
export interface UserDTO {
    id: number;
    username: string;
    fullName: string;
    walletAddress: string;
    role: string;
}