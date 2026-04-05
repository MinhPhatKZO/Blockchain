export const dashboardText = {
    page: {
        badge: 'ChainPay Wallet'
    },
    sections: {
        wallet: {
            label: 'Thông tin ví',
            title: 'Thông tin ví',
            description: 'Theo dõi kết nối MetaMask, ví đã đăng ký và cấu hình chain trước khi nạp tiền hoặc giao dịch bằng số dư trong ChainPay.'
        },
        transfer: {
            label: 'Chuyển tiền',
            title: 'Chuyển tiền',
            description: 'Sử dụng số dư đã nạp trong smart contract để mua hàng hoặc chuyển tiền nội bộ tới ví khác.'
        },
        history: {
            label: 'Lịch sử giao dịch',
            title: 'Lịch sử giao dịch',
            description: 'Xem toàn bộ giao dịch mua hàng và chuyển tiền phát sinh từ số dư ChainPay của bạn.'
        }
    },
    wallet: {
        heroBadge: 'Trung tâm ví',
        heroTitle: 'Thông tin ví Web3',
        heroDescription: 'Kết nối MetaMask, đối chiếu ví đã đăng ký và kiểm tra cấu hình mạng ChainPay trước khi nạp tiền vào smart contract.',
        accountTitle: 'Tài khoản',
        accountHint: 'Ví đã đăng ký sẽ được so sánh với tài khoản MetaMask đang hoạt động.',
        chainIdTitle: 'Chain ID',
        chainIdHint: 'Đảm bảo MetaMask đang ở đúng network ChainPay trước khi nạp tiền hoặc giao dịch.',
        registeredTitle: 'Ví đã đăng ký',
        registeredDescription: 'Địa chỉ được backend lưu cho tài khoản hiện tại.',
        registeredEmpty: 'Bạn chưa đăng ký ví.',
        storeTitle: 'Ví của hệ thống',
        storeDescription: 'Địa chỉ nhận thanh toán mặc định của cửa hàng ChainPay.',
        storeEmpty: 'Không tìm thấy cấu hình ví cửa hàng.'
    },
    transfer: {
        sourceTitle: 'Nguồn thanh toán',
        sourceDescription: 'MetaMask đang hoạt động cần trùng với ví đã đăng ký của bạn để dùng được số dư trong smart contract.',
        networkHint: 'Hệ thống sẽ kiểm tra network trước khi mở MetaMask để ký giao dịch trên ChainPay contract.',
        noRegisteredWallet: 'Bạn chưa có ví đã đăng ký.',
        orderTitle: 'Đơn hàng đang thanh toán',
        orderDescription: 'Thông tin này được prefill từ trang chi tiết sản phẩm.',
        paymentTitle: 'Thanh toán đơn hàng',
        transferTitle: 'Chuyển tiền',
        paymentDescription: 'Thanh toán bằng số dư đã nạp trong ChainPay contract tới ví cửa hàng.',
        transferDescription: 'Chuyển WEI nội bộ từ số dư ChainPay tới một địa chỉ ví bất kỳ.',
        storeAddressLabel: 'Địa chỉ cửa hàng',
        receiverAddressLabel: 'Địa chỉ người nhận',
        amountLabel: 'Số tiền (Wei)',
        addressPlaceholder: '0x...',
        amountPlaceholder: 'Nhập số lượng WEI...',
        confirmPayment: 'Xác nhận thanh toán',
        confirmTransaction: 'Xác nhận giao dịch',
        purchaseSuccessTitle: 'Mua hàng thành công',
        transferSuccessTitle: 'Chuyển tiền thành công',
        purchaseSuccessAction: 'Tiếp tục mua sắm',
        transferSuccessAction: 'Tiếp tục giao dịch',
        purchaseSuccessMessage: (productName: string, priceEth: string) =>
            `Bạn đã thanh toán ${productName} bằng ${priceEth} ETH từ số dư ChainPay.`,
        transferSuccessMessage: (amount: string, address: string) =>
            `Bạn đã chuyển ${amount} WEI từ số dư ChainPay tới ví ${address}.`,
        errors: {
            missingMetaMask: 'Vui lòng cài đặt ví MetaMask!',
            missingActiveAccount: 'Không tìm thấy tài khoản MetaMask đang hoạt động.',
            invalidAddress: 'Địa chỉ nhận không hợp lệ.',
            invalidAmount: 'Số tiền thanh toán không hợp lệ.',
            walletMismatch: 'Tài khoản MetaMask hiện tại không trùng với ví đã đăng ký.',
            missingTransactionHash: 'Không nhận được transaction hash từ MetaMask.',
            missingContractAddress: 'Không tìm thấy địa chỉ smart contract của ChainPay.',
            invalidContractAddress: 'Địa chỉ smart contract hiện tại không hợp lệ.',
            rejected: 'Bạn đã từ chối giao dịch trong MetaMask.',
            generic: 'Không thể gửi giao dịch.',
            failedPrefix: 'Giao dịch thất bại: ',
            wrongChain: (chainId: string) => `Vui lòng chuyển MetaMask sang đúng mạng ChainPay (chainId ${chainId}).`
        }
    },
    history: {
        title: 'Lịch sử giao dịch',
        description: 'Tổng hợp các giao dịch mua hàng và chuyển tiền từ số dư ChainPay của tài khoản hiện tại.',
        emptyLoading: 'Đang tải lịch sử giao dịch...',
        empty: 'Chưa có giao dịch nào.',
        emptyHint: 'Khi bạn mua hàng, chuyển tiền hoặc nạp tiền thành công, giao dịch sẽ xuất hiện tại đây.'
    },
    successModal: {
        closeAria: 'Đóng modal'
    }
} as const;
