// ==================== CONTEXT TYPES (Cho Auth & MetaMask) ====================

// Định nghĩa kiểu cho User
export interface User {
    username: string;
}
  
// Định nghĩa kiểu cho Context Auth
export interface AuthContextType {
    user: User | null;
    login: (username: string) => void;
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