import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

interface WalletConnectProps {
    onAddressChange?: (address: string) => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onAddressChange }) => {
    const [account, setAccount] = useState<string | null>(null);
    const [error, setError] = useState<string>('');

    // Hàm lấy đối tượng ethereum an toàn
    const getEthereum = () => (window as any).ethereum;

    useEffect(() => {
        const checkConnection = async () => {
            const ethereum = getEthereum();
            if (ethereum) {
                try {
                    const web3 = new Web3(ethereum);
                    const accounts = await web3.eth.getAccounts();
                    if (accounts.length > 0) {
                        handleAccountChange(accounts[0]);
                    }
                } catch (err) {
                    console.error("Lỗi tự động kết nối:", err);
                }

                // Lắng nghe sự kiện đổi ví
                ethereum.on('accountsChanged', (accounts: string[]) => {
                    if (accounts.length > 0) {
                        handleAccountChange(accounts[0]);
                    } else {
                        setAccount(null);
                    }
                });
            }
        };

        checkConnection();
        
        return () => {
            const ethereum = getEthereum();
            if (ethereum && ethereum.removeListener) {
                ethereum.removeListener('accountsChanged', handleAccountChange);
            }
        };
    // eslint-disable-next-line
    }, []);

    const handleAccountChange = (newAccount: string) => {
        setAccount(newAccount);
        if (onAddressChange) {
            onAddressChange(newAccount);
        }
    };

    const connectWallet = async () => {
        setError('');
        const ethereum = getEthereum();
        if (ethereum) {
            try {
                await ethereum.request({ method: 'eth_requestAccounts' });
                const web3 = new Web3(ethereum);
                const accounts = await web3.eth.getAccounts();
                
                if (accounts.length > 0) {
                    handleAccountChange(accounts[0]);
                }
            } catch (err: any) {
                if (err.code === 4001) {
                    setError('Bạn đã từ chối kết nối!');
                } else {
                    setError('Lỗi kết nối: ' + err.message);
                }
                console.error(err);
            }
        } else {
            setError('Vui lòng cài đặt MetaMask!');
        }
    };

    return (
        <div className="mb-3">
            {error && <div className="alert alert-danger p-2 small">{error}</div>}
            
            {account ? (
                <div className="alert alert-success d-flex align-items-center justify-content-between p-2">
                    <div className="d-flex flex-column" style={{overflow: 'hidden'}}>
                        <small className="text-muted" style={{fontSize: '0.75rem'}}>Ví đã kết nối:</small>
                        <strong style={{fontSize: '0.9rem', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'}}>
                            {account.substring(0, 6)}...{account.substring(account.length - 4)}
                        </strong>
                    </div>
                    <span className="badge bg-success ms-2">Active</span>
                </div>
            ) : (
                <button type="button" onClick={connectWallet} className="btn btn-outline-warning w-100 fw-bold">
                    🦊 Kết nối MetaMask
                </button>
            )}
        </div>
    );
};

export default WalletConnect;