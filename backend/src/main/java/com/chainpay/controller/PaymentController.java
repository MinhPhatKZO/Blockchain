package com.chainpay.controller;

import java.math.BigInteger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate; 
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.chainpay.dto.BalanceResponse;
import com.chainpay.dto.PaymentRequest;
import com.chainpay.dto.PaymentResponse;
import com.chainpay.entity.Transaction;
import com.chainpay.entity.User;
import com.chainpay.repository.UserRepository;
import com.chainpay.service.ChainPayContractService;
import com.chainpay.service.PaymentService;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChainPayContractService contractService;

    // Lấy Private Key Admin để dùng cho API nạp tiền
    @Value("${blockchain.private-key}")
    private String adminPrivateKey;

    // Inject công cụ gửi tin nhắn WebSocket
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // --- 1. API GỬI TIỀN (REAL-TIME BLOCKCHAIN) ---
    @PostMapping("/send")
    public ResponseEntity<?> sendPayment(@RequestBody PaymentRequest request) {
        try {
            // A. Lấy thông tin người gửi từ Token
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = auth.getName(); 
            
            User currentUser = userRepository.findByUsername(currentUsername)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
            
            String fromAddress = currentUser.getWalletAddress();

            // B. Gọi Service xử lý giao dịch (BLOCKCHAIN THẬT)
            // Lưu ý: Lúc này PaymentService đã gọi ChainPayContractService
            Transaction tx = paymentService.processPayment(
                    fromAddress, 
                    request.getToAddress(), 
                    request.getAmount().toString() 
            );

            // C. --- BẮN THÔNG BÁO REAL-TIME (WebSocket) ---
            String notificationMessage = "TING TING! Bạn vừa nhận được " + request.getAmount() + " WEI từ " + currentUsername;
            
            // Gửi đến kênh riêng của người nhận: /topic/notifications/{địa_chỉ_ví}
            messagingTemplate.convertAndSend(
                "/topic/notifications/" + request.getToAddress(), 
                notificationMessage
            );

            // D. Trả về kết quả
            return ResponseEntity.ok(new PaymentResponse(
                    tx.getTransactionHash(),
                    tx.getStatus(),
                    "Giao dịch Blockchain thành công!"
            ));
        } catch (Exception e) {
            e.printStackTrace(); // In lỗi ra Console để dễ debug
            return ResponseEntity.badRequest().body("Lỗi giao dịch: " + e.getMessage());
        }
    }

    // --- 2. API XEM SỐ DƯ (TRÊN BLOCKCHAIN) ---
    @GetMapping("/balance/{address}")
    public ResponseEntity<BalanceResponse> getBalance(@PathVariable String address) {
        try {
            // Gọi xuống Blockchain thật để lấy số dư trong Contract
            BigInteger balanceWei = paymentService.getBalance(address);
            return ResponseEntity.ok(new BalanceResponse(
                    address,
                    balanceWei.toString(),
                    "WEI"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new BalanceResponse(address, "0", "ERROR: " + e.getMessage()));
        }
    }

    // --- 3. [MỚI] API ADMIN NẠP TIỀN VÀO CONTRACT (DEPOSIT) ---
    // Gọi API này để nạp tiền vào két sắt Contract khi bị hết tiền
    @PostMapping("/admin/deposit")
    public ResponseEntity<?> adminDeposit(@RequestParam String amountWei) {
        try {
            BigInteger amount = new BigInteger(amountWei);
            String txHash = contractService.deposit(adminPrivateKey, amount);
            return ResponseEntity.ok("Nạp tiền thành công! Hash: " + txHash);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi nạp tiền: " + e.getMessage());
        }
    }
}