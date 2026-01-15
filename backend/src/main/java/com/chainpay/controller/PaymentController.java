package com.chainpay.controller;

import com.chainpay.dto.BalanceResponse;
import com.chainpay.dto.PaymentRequest;
import com.chainpay.dto.PaymentResponse;
import com.chainpay.service.PaymentService;
import com.chainpay.service.TransactionService;
import com.chainpay.service.UserService;
import com.chainpay.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.math.BigInteger;

@RestController
@RequestMapping("/payment")
@CrossOrigin(origins = "*")
public class PaymentController {
    
    @Autowired
    private PaymentService paymentService;
    
    @Autowired
    private TransactionService transactionService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    @PostMapping("/send")
    public ResponseEntity<?> sendPayment(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody PaymentRequest paymentRequest) {
        try {
            String username = extractUsernameFromToken(token);
            PaymentResponse response = paymentService.sendPayment(username, paymentRequest);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/balance")
    public ResponseEntity<?> getBalance(@RequestHeader("Authorization") String token) {
        try {
            String username = extractUsernameFromToken(token);
            com.chainpay.entity.User user = userService.findByUsername(username);
            
            if (user.getWalletAddress() == null || user.getWalletAddress().isEmpty()) {
                return ResponseEntity.badRequest().body("Wallet address not set");
            }
            
            BigInteger balance = paymentService.getBalance(user.getWalletAddress());
            BalanceResponse response = new BalanceResponse(
                    user.getWalletAddress(),
                    balance.toString(),
                    convertWeiToEther(balance)
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/balance/{address}")
    public ResponseEntity<?> getBalanceByAddress(@PathVariable String address) {
        try {
            BigInteger balance = paymentService.getBalance(address);
            BalanceResponse response = new BalanceResponse(
                    address,
                    balance.toString(),
                    convertWeiToEther(balance)
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/history")
    public ResponseEntity<?> getTransactionHistory(@RequestHeader("Authorization") String token) {
        try {
            String username = extractUsernameFromToken(token);
            return ResponseEntity.ok(transactionService.getTransactionHistory(username));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
    
    private String extractUsernameFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        UserDetails userDetails = userDetailsService.loadUserByUsername(jwtUtil.extractUsername(token));
        if (!jwtUtil.validateToken(token, userDetails)) {
            throw new RuntimeException("Invalid token");
        }
        return jwtUtil.extractUsername(token);
    }
    
    private String convertWeiToEther(BigInteger wei) {
        // Convert Wei to Ether (1 Ether = 10^18 Wei)
        java.math.BigDecimal ether = new java.math.BigDecimal(wei)
                .divide(new java.math.BigDecimal("1000000000000000000"), 18, java.math.RoundingMode.HALF_UP);
        return ether.toPlainString();
    }
}