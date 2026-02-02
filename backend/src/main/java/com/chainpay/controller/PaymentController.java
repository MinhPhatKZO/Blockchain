package com.chainpay.controller;

import java.math.BigInteger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chainpay.dto.BalanceResponse;
import com.chainpay.dto.PaymentRequest;
import com.chainpay.dto.PaymentResponse;
import com.chainpay.entity.Transaction;
import com.chainpay.service.ChainPayContractService;
import com.chainpay.service.PaymentService;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private ChainPayContractService contractService;

    @PostMapping("/send")
    public ResponseEntity<PaymentResponse> sendPayment(@RequestBody PaymentRequest request) {
        // Lấy thông tin user hiện tại từ Token
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName(); 
        // Trong thực tế, bạn sẽ query DB để lấy ví của user này làm 'fromAddress'
        // Ở đây giả sử 'fromAddress' là ví của người dùng đăng nhập (cần code thêm trong UserDetails)
        String mockFromAddress = "0xYourWalletAddress"; 

        Transaction tx = paymentService.processPayment(
                mockFromAddress, 
                request.getToAddress(), 
                request.getAmount()
        );

        return ResponseEntity.ok(new PaymentResponse(
                tx.getTransactionHash(),
                tx.getStatus(),
                "Request processed"
        ));
    }

    @GetMapping("/balance/{address}")
    public ResponseEntity<BalanceResponse> getBalance(@PathVariable String address) {
        try {
            BigInteger balanceWei = contractService.getBalance(address);
            return ResponseEntity.ok(new BalanceResponse(
                    address,
                    balanceWei.toString(),
                    "WEI"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new BalanceResponse(address, "0", "ERROR"));
        }
    }
}