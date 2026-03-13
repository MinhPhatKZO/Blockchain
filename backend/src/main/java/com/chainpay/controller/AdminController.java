package com.chainpay.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping; // Thêm DeleteMapping và PathVariable
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable; // Đảm bảo bạn đã có entity này
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController; // Đảm bảo bạn đã có repository này

import com.chainpay.entity.Transaction;
import com.chainpay.entity.User;
import com.chainpay.repository.TransactionRepository;
import com.chainpay.repository.UserRepository;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    /**
     * API 1: Lấy danh sách tất cả tài khoản
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    /**
     * API 2: Lấy số liệu thống kê tổng quan
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalUsers = userRepository.count();
        stats.put("totalUsers", totalUsers);
        
        // Thống kê tổng số giao dịch từ database
        long totalTransactions = transactionRepository.count();
        stats.put("totalTransactions", totalTransactions);
        
        return ResponseEntity.ok(stats);
    }

    /**
     * API 3: Xóa người dùng hệ thống
     * Lưu ý: Trong thực tế nên dùng cơ chế "Soft Delete" (khóa tài khoản) 
     * thay vì xóa vĩnh viễn khỏi DB để giữ lịch sử giao dịch.
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id)
            .map(user -> {
                userRepository.delete(user);
                return ResponseEntity.ok().body(Map.of("message", "Đã xóa người dùng thành công"));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * API 4: Lấy toàn bộ lịch sử giao dịch của hệ thống
     * Hiển thị danh sách cho Admin kiểm soát dòng tiền
     */
    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        // Sắp xếp giao dịch mới nhất lên đầu (nếu repository có hỗ trợ)
        List<Transaction> transactions = transactionRepository.findAll(); 
        return ResponseEntity.ok(transactions);
    }
}