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
    amount: string; // BigInteger bên Java nên để String ở đây để tránh lỗi số lớn
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