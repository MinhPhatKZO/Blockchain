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
import com.chainpay.dto.RecordTransactionRequest;
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
    private SimpMessagingTemplate messagingTemplate;

    @Value("${blockchain.private-key}")
    private String adminPrivateKey;

    @PostMapping("/send")
    public ResponseEntity<?> sendPayment(@RequestBody PaymentRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = auth.getName();

            User currentUser = userRepository.findByUsername(currentUsername)
                    .orElseThrow(() -> new RuntimeException("Khong tim thay nguoi dung!"));

            Transaction tx = paymentService.processPayment(
                    currentUser.getWalletAddress(),
                    request.getToAddress(),
                    request.getAmount().toString());

            String notificationMessage =
                    "TING TING! Ban vua nhan duoc " + request.getAmount() + " WEI tu " + currentUsername;
            messagingTemplate.convertAndSend(
                    "/topic/notifications/" + request.getToAddress(),
                    notificationMessage);

            String responseMessage = tx.getStatus().equals("SUCCESS")
                    ? "Giao dich Blockchain thanh cong!"
                    : "Giao dich that bai (Khong the ket noi node hoac loi Smart Contract)!";

            return ResponseEntity.ok(new PaymentResponse(
                    tx.getTransactionHash(),
                    tx.getStatus(),
                    responseMessage));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Loi giao dich: " + e.getMessage());
        }
    }

    @PostMapping("/record")
    public ResponseEntity<?> recordTransaction(@RequestBody RecordTransactionRequest payload) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = userRepository.findByUsername(auth.getName()).orElseThrow();

            String toAddress = payload.getToAddress();
            String amount = payload.getAmount();
            String txHash = payload.getTransactionHash();

            paymentService.recordExternalPayment(
                    currentUser.getWalletAddress(),
                    toAddress,
                    amount,
                    txHash,
                    payload.getProductId());

            String notificationMessage = "TING TING! Ban vua nhan duoc " + amount + " WEI qua MetaMask!";
            messagingTemplate.convertAndSend("/topic/notifications/" + toAddress, notificationMessage);

            return ResponseEntity.ok("Da ghi nhan lich su giao dich thanh cong!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Loi ghi nhan: " + e.getMessage());
        }
    }

    @GetMapping("/balance/{address}")
    public ResponseEntity<?> getBalance(@PathVariable String address) {
        try {
            BigInteger balanceWei = paymentService.getBalance(address);
            return ResponseEntity.ok(balanceWei.toString());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Loi lay so du: " + e.getMessage());
        }
    }

    @PostMapping("/admin/deposit")
    public ResponseEntity<?> adminDeposit(@RequestParam String amountWei) {
        try {
            BigInteger amount = new BigInteger(amountWei);
            String txHash = contractService.deposit(adminPrivateKey, amount);
            return ResponseEntity.ok("Nap tien thanh cong! Hash: " + txHash);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Loi nap tien: " + e.getMessage());
        }
    }
}
