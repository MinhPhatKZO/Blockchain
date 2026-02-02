package com.chainpay.service;

import com.chainpay.dto.LoginRequest;
import com.chainpay.dto.RegisterRequest;
import com.chainpay.entity.User;
import com.chainpay.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // Cần cấu hình Bean này trong SecurityConfig

    // Xử lý Đăng ký
    public User register(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username đã tồn tại!");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setFullName(request.getFullName());
        user.setWalletAddress(request.getWalletAddress());
        // Mã hóa mật khẩu trước khi lưu
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        return userRepository.save(user);
    }
    
    // (Lưu ý: Phần xử lý Đăng nhập sẽ thực hiện ở Controller kết hợp với AuthenticationManager)
}