export const productsText = {
    list: {
        title: 'Khám Phá Sản Phẩm',
        description: 'Sở hữu những vật phẩm kỹ thuật số độc quyền thanh toán hoàn toàn bằng Ethereum trên không gian Web3.',
        loading: 'Đang kết nối tới cửa hàng...',
        emptyTitle: 'Chưa có sản phẩm nào',
        emptyDescription: 'Cửa hàng hiện tại đang trống. Bạn hãy quay lại sau nhé!'
    },
    detail: {
        notFound: 'Không tìm thấy sản phẩm!',
        backToStore: 'Trở về cửa hàng',
        productCode: (id: number) => `Sản phẩm #${id}`,
        priceTitle: 'Giá thanh toán'
    }
} as const;
