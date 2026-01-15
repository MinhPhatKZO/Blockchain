package com.chainpay.controller;

import com.chainpay.dto.LoginRequest;
import com.chainpay.dto.LoginResponse;
import com.chainpay.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody LoginRequest registerRequest) {
        // TODO: Implement user registration
        return ResponseEntity.ok("Registration endpoint - to be implemented");
    }
}