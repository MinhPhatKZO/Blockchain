export const adminText = {
    dashboard: {
        loading: 'Đang tải dữ liệu Blockchain...',
        logout: 'Đăng xuất',
        stats: {
            users: 'Thành viên',
            products: 'Sản phẩm',
            transactions: 'Giao dịch'
        },
        tabs: {
            users: 'Người dùng',
            products: 'Sản phẩm',
            transactions: 'Giao dịch'
        },
        searchPlaceholder: 'Tìm kiếm nhanh...',
        productModal: {
            editTitle: 'Sửa sản phẩm',
            createTitle: 'Thêm sản phẩm',
            nameLabel: 'Tên sản phẩm',
            namePlaceholder: 'iPhone 15 Pro...',
            priceLabel: 'Giá (ETH)',
            pricePlaceholder: '0.5',
            imageUrlLabel: 'URL ảnh',
            imageUrlPlaceholder: 'https://...',
            descriptionLabel: 'Mô tả',
            descriptionPlaceholder: 'Mô tả sản phẩm...'
        },
        alerts: {
            missingNameAndPrice: 'Vui lòng điền tên và giá!',
            updateSuccess: 'Cập nhật sản phẩm thành công!',
            createSuccess: 'Thêm sản phẩm mới thành công!',
            serverErrorPrefix: 'Lỗi Server: ',
            serverErrorFallback: 'Hãy kiểm tra log ở IntelliJ!',
            deleteFailed: 'Không thể xóa sản phẩm!'
        },
        defaults: {
            description: 'Chưa có mô tả',
            imageUrl: 'https://via.placeholder.com/300'
        },
        confirmations: {
            deleteProduct: (name: string) => `Xóa sản phẩm "${name}"?`
        }
    },
    productManagement: {
        title: 'Kho hàng Blockchain',
        description: 'Quản lý và cập nhật sản phẩm',
        addButton: 'Thêm Sản Phẩm',
        listedPrice: 'Giá niêm yết',
        deleteTitle: 'Xóa sản phẩm',
        editBadge: 'CLICK ĐỂ SỬA',
        pageLabel: (page: number, totalPages: number) => `Trang ${page} / ${totalPages}`
    },
    userManagement: {
        title: 'Danh sách Users',
        chartTitle: 'Lưu lượng giao dịch (ETH)'
    },
    transactionLedger: {
        title: 'Sổ cái giao dịch hệ thống',
        activity: 'Hoạt động',
        txHash: 'Mã Hash (TxHash)',
        value: 'Giá trị (ETH)',
        timeStatus: 'Thời gian / Trạng thái',
        from: 'Từ',
        to: 'Đến',
        pageLabel: (page: number, totalPages: number, total: number) => `Trang ${page} / ${totalPages} (Tổng ${total})`
    }
} as const;
