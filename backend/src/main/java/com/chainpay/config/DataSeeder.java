package com.chainpay.config; // Hoặc package tương ứng của bạn

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.chainpay.entity.Product;
import com.chainpay.repository.ProductRepository;

import java.util.Arrays;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        // Chỉ thêm dữ liệu nếu bảng Product đang trống
        if (productRepository.count() == 0) {
            Product[] products = {
                new Product("iPhone 15 Pro Max 256GB", "Titanium tự nhiên, chip A17 Pro siêu đỉnh từ Apple.", "0.5", "500000000000000000", "https://placehold.co/400x400/1e293b/FFFFFF?text=iPhone+15+Pro+Max"),
                new Product("Samsung Galaxy S24 Ultra", "Tích hợp Galaxy AI đỉnh cao, camera 200MP zoom quang 5x.", "0.45", "450000000000000000", "https://placehold.co/400x400/3b82f6/FFFFFF?text=S24+Ultra"),
                new Product("Google Pixel 8 Pro", "Chụp ảnh AI cực nét, Android thuần mượt mà, màn hình siêu sáng.", "0.4", "400000000000000000", "https://placehold.co/400x400/10b981/FFFFFF?text=Pixel+8+Pro"),
                new Product("Xiaomi 14 Pro", "Ống kính Leica chuyên nghiệp, sạc siêu tốc 120W, hiệu năng khủng.", "0.35", "350000000000000000", "https://placehold.co/400x400/f97316/FFFFFF?text=Xiaomi+14+Pro"),
                new Product("Samsung Galaxy Z Fold5", "Điện thoại gập cao cấp, đa nhiệm nhiều màn hình như PC thu nhỏ.", "0.6", "600000000000000000", "https://placehold.co/400x400/6366f1/FFFFFF?text=Z+Fold5"),
                new Product("ASUS ROG Phone 8", "Quái vật cày game, tản nhiệt buồng hơi, màn hình 165Hz siêu mượt.", "0.42", "420000000000000000", "https://placehold.co/400x400/ef4444/FFFFFF?text=ROG+Phone+8"),
                new Product("OPPO Find X7 Ultra", "Tuyệt tác camera Hasselblad, thiết kế mặt lưng da sang trọng.", "0.38", "380000000000000000", "https://placehold.co/400x400/14b8a6/FFFFFF?text=Find+X7+Ultra"),
                new Product("iPhone 14 128GB", "Sự lựa chọn quốc dân, pin trâu, chụp ảnh thiếu sáng cực tốt.", "0.25", "250000000000000000", "https://placehold.co/400x400/8b5cf6/FFFFFF?text=iPhone+14"),
                new Product("Samsung Galaxy Z Flip5", "Gập vỏ sò thời trang, màn hình phụ Flex Window cực kỳ tiện lợi.", "0.3", "300000000000000000", "https://placehold.co/400x400/ec4899/FFFFFF?text=Z+Flip5"),
                new Product("Nothing Phone (2)", "Mặt lưng trong suốt kèm dải đèn LED Glyph cực chất và độc lạ.", "0.2", "200000000000000000", "https://placehold.co/400x400/0f172a/FFFFFF?text=Nothing+Phone")            };
            productRepository.saveAll(Arrays.asList(products));
            System.out.println("✅ Đã tự động chèn 10 sản phẩm mẫu vào Database!");
        }
    }
}