package com.chainpay.controller;

import com.chainpay.entity.Product;
import com.chainpay.entity.Transaction;
import com.chainpay.entity.User;
import com.chainpay.repository.ProductRepository;
import com.chainpay.repository.TransactionRepository;
import com.chainpay.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Sort;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')") // Chỉ Admin mới được vào đây
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private ProductRepository productRepository;

    // --- 1. QUẢN LÝ THỐNG KÊ (STATS) ---
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalTransactions", transactionRepository.count());
        stats.put("totalProducts", productRepository.count());
        return ResponseEntity.ok(stats);
    }

    // --- 2. QUẢN LÝ NGƯỜI DÙNG (USERS) ---
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id)
            .map(user -> {
                userRepository.delete(user);
                return ResponseEntity.ok(Map.of("message", "Đã xóa người dùng thành công"));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // --- 3. QUẢN LÝ SẢN PHẨM (PRODUCTS - CRUD) ---
    
    // Lấy danh sách SP cho Admin
    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productRepository.findAll(Sort.by(Sort.Direction.DESC, "id")));
    }

    // Thêm sản phẩm mới
   @PostMapping("/products")
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        // Nếu FE quên gửi priceWei, Backend sẽ tự tính dựa trên priceEth
        if (product.getPriceWei() == null || product.getPriceWei().isEmpty()) {
            double eth = Double.parseDouble(product.getPriceEth());
            product.setPriceWei(String.format("%.0f", eth * 1e18));
        }
        return ResponseEntity.ok(productRepository.save(product));
    }

    // Cập nhật sản phẩm
    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product details) {
        return productRepository.findById(id).map(p -> {
            p.setName(details.getName());
            p.setDescription(details.getDescription());
            p.setPriceEth(details.getPriceEth());
            p.setPriceWei(details.getPriceWei());
            p.setImageUrl(details.getImageUrl());
            return ResponseEntity.ok(productRepository.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Xóa sản phẩm
    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa sản phẩm khỏi kho!"));
    }

    // --- 4. XEM LỊCH SỬ GIAO DỊCH (TRANSACTIONS) ---
    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        // Bạn có thể dùng Sort.by(Sort.Direction.DESC, "createdAt") nếu muốn tin mới lên đầu
        return ResponseEntity.ok(transactionRepository.findAll());
    }
}