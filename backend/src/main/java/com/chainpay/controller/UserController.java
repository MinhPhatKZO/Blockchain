package com.chainpay.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chainpay.entity.Transaction;
import com.chainpay.entity.User;
import com.chainpay.repository.TransactionRepository;
import com.chainpay.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    // 1. API lấy thông tin người dùng đang đăng nhập
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        // Lấy username từ Token JWT hiện tại
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        
        // Không trả về password cho an toàn
        user.setPassword(null); 
        return ResponseEntity.ok(user);
    }

    // 2. API lấy lịch sử giao dịch của ví user
    @GetMapping("/history")
    public ResponseEntity<List<Transaction>> getTransactionHistory() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).get();
        
        String wallet = user.getWalletAddress();
        
        // Trả về danh sách giao dịch liên quan đến ví này
        List<Transaction> history = transactionRepository.findByFromAddressOrToAddressOrderByTimestampDesc(wallet, wallet);
        return ResponseEntity.ok(history);
    }
}