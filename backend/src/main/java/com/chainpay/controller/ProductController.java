package com.chainpay.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.chainpay.entity.Product;
import com.chainpay.repository.ProductRepository;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*") // Quan trọng để Frontend React có thể gọi API
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    /**
     * 🟢 Lấy danh sách tất cả sản phẩm
     * Dùng để hiển thị ở trang chủ (Storefront)
     */
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        try {
            List<Product> products = productRepository.findAll();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 🔵 Lấy chi tiết một sản phẩm theo ID
     * Dùng khi người dùng click vào xem chi tiết để chuẩn bị thanh toán
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(product -> ResponseEntity.ok(product))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 🔍 Tìm kiếm sản phẩm theo tên (Optional - Thêm cho xịn)
     * Giúp người dùng lọc nhanh sản phẩm trên giao diện
     */
    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String name) {
        // Lưu ý: Để dùng cái này bạn cần thêm method findByNameContaining trong Repository
        // Tạm thời nếu chưa có bạn có thể bỏ qua hoặc dùng stream filter
        List<Product> products = productRepository.findAll().stream()
                .filter(p -> p.getName().toLowerCase().contains(name.toLowerCase()))
                .toList();
        return ResponseEntity.ok(products);
    }
}