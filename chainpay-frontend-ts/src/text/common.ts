export const commonText = {
    brand: {
        appName: 'ChainPay',
        wallet: 'Wallet',
        store: 'Store',
        admin: 'Admin'
    },
    labels: {
        eth: 'ETH',
        wei: 'WEI',
        metamask: 'MetaMask',
        chainId: 'Chain ID',
        network: 'Mạng',
        walletAddress: 'Địa chỉ ví',
        storeWallet: 'Ví cửa hàng',
        registeredWallet: 'Ví đã đăng ký',
        auto: 'Tự động',
        active: 'Hoạt động',
        notAvailable: 'N/A'
    },
    actions: {
        logout: 'Đăng Xuất',
        cancel: 'Hủy',
        save: 'Lưu lại',
        copy: 'Sao chép',
        copied: 'Đã chép',
        closeAria: 'Đóng modal',
        continueShopping: 'Tiếp tục mua sắm',
        continueTransaction: 'Tiếp tục giao dịch',
        backToStore: 'Trở về cửa hàng',
        buyNowWithMetaMask: 'Mua ngay bằng MetaMask',
        viewDetails: 'Xem Chi Tiết'
    },
    prompts: {
        confirmLogout: 'Bạn có chắc chắn muốn đăng xuất?'
    },
    errors: {
        authProviderRequired: 'useAuth must be used within an AuthProvider'
    },
    states: {
        loading: 'Đang tải...',
        loadingData: 'Đang tải dữ liệu...',
        processing: 'Đang xử lý...',
        noData: 'Chưa có dữ liệu.'
    },
    modal: {
        successBadge: 'ChainPay Success'
    },
    user: {
        empty: 'Chưa có thông tin',
        usernamePrefix: '@',
        system: 'Hệ thống'
    }
} as const;
