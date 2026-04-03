export const walletText = {
    connect: {
        connectedLabel: 'Ví đã kết nối:',
        connectButton: 'Kết nối MetaMask',
        installMetaMask: 'Vui lòng cài đặt MetaMask!',
        rejected: 'Bạn đã từ chối kết nối!',
        errorPrefix: 'Lỗi kết nối: '
    },
    notification: {
        connected: (walletAddress: string) => `WebSocket Connected: ${walletAddress}`,
        newAlertPrefix: 'THÔNG BÁO MỚI:\n',
        websocketError: 'WebSocket Error:'
    }
} as const;
