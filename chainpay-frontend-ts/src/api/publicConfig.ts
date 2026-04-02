import axiosClient from './axiosClient';

export interface PublicConfig {
    contractAddress: string;
    storeWalletAddress: string;
    chainId: string;
}

export const fetchPublicConfig = async (): Promise<PublicConfig> => {
    const response = await axiosClient.get<PublicConfig>('/public/config');
    return response.data;
};
