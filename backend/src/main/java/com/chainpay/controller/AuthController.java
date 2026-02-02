package com.chainpay.controller;

import org.springframework.beans.factory.annotation.Autowired; // Import file DTO đã tạo
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chainpay.dto.JwtAuthResponse;
import com.chainpay.dto.LoginRequest;
import com.chainpay.dto.RegisterRequest;
import com.chainpay.security.JwtTokenProvider;
import com.chainpay.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    // API Đăng ký
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        try {
            return ResponseEntity.ok(authService.register(registerRequest));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API Đăng nhập
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        // 1. Xác thực username/password
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        // 2. Set context
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3. Sinh token
        String jwt = tokenProvider.generateToken(authentication);

        // 4. Trả về Token (Sử dụng JwtAuthResponse từ package dto)
        return ResponseEntity.ok(new JwtAuthResponse(jwt));
    }
}