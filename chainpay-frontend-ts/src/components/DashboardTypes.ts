import type { PublicConfig } from '../api';

export interface User {
    id?: number;
    username: string;
    walletAddress: string;
    fullName?: string;
}

export interface ProductSummary {
    id: number;
    name: string;
    imageUrl: string;
    priceEth: string;
    priceWei: string;
}

export interface TransactionHistory {
    id: number;
    fromAddress: string;
    toAddress: string;
    amount: string | number;
    status: string;
    transactionHash: string;
    timestamp: string;
    product?: ProductSummary;
}

export interface PurchaseLocationState {
    prefillAmount?: string;
    prefillAddress?: string;
    productId?: number;
    productName?: string;
    priceEth?: string;
}

export interface DashboardOutletContext {
    currentUser: User | null;
    history: TransactionHistory[];
    publicConfig: PublicConfig | null;
    loading: boolean;
    refreshDashboardData: () => Promise<void>;
}
