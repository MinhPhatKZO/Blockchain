package com.chainpay.controller;

import java.math.BigInteger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate; 
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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

    @Autowired

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
            String responseMessage = tx.getStatus().equals("SUCCESS") 
                    ? "Giao dịch Blockchain thành công!" 
                    : "Giao dịch thất bại (Không thể kết nối Ganache hoặc lỗi Smart Contract)!";
                    
            return ResponseEntity.ok(new PaymentResponse(
                    tx.getTransactionHash(),
                    tx.getStatus(),
                    responseMessage
            ));
        } catch (Exception e) {
            e.printStackTrace(); // In lỗi ra Console để dễ debug
            return ResponseEntity.badRequest().body("Lỗi giao dịch: " + e.getMessage());
        }
    }

    // --- API MỚI: LƯU LỊCH SỬ GIAO DỊCH TỪ METAMASK ---
    @PostMapping("/record")
    public ResponseEntity<?> recordTransaction(@RequestBody java.util.Map<String, String> payload) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = userRepository.findByUsername(auth.getName()).orElseThrow();
            
            String toAddress = payload.get("toAddress");
            String amount = payload.get("amount");
            String txHash = payload.get("transactionHash");

            // Lưu vào DB
            paymentService.recordExternalPayment(currentUser.getWalletAddress(), toAddress, amount, txHash);

            // Bắn thông báo Real-time cho người nhận
            String notificationMessage = "TING TING! Bạn vừa nhận được " + amount + " WEI qua MetaMask!";
            messagingTemplate.convertAndSend("/topic/notifications/" + toAddress, notificationMessage);

            return ResponseEntity.ok("Đã ghi nhận lịch sử giao dịch thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi ghi nhận: " + e.getMessage());
        }
    }

    // --- 2. API XEM SỐ DƯ (TRÊN BLOCKCHAIN) ---
    @GetMapping("/balance/{address}")
    public ResponseEntity<?> getBalance(@PathVariable String address) {
        try {
            // Gọi xuống Blockchain thật để lấy số dư trong Contract
            BigInteger balanceWei = paymentService.getBalance(address);
            return ResponseEntity.ok(balanceWei.toString());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy số dư: " + e.getMessage());
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