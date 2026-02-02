package com.chainpay.service;

import com.chainpay.entity.Transaction;
import com.chainpay.entity.TransactionStatus;
import com.chainpay.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDateTime;

@Service
public class PaymentService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private ChainPayContractService contractService;

    @Value("${blockchain.private-key}")
    private String privateKey; 

    // Hàm xử lý thanh toán
    public Transaction processPayment(String fromAddress, String toAddress, BigInteger amountBigInt) {
        Transaction transaction = new Transaction();
        
        // 1. Set thông tin cơ bản
        transaction.setFromAddress(fromAddress);
        transaction.setToAddress(toAddress);
        
        // --- ĐIỂM SỬA QUAN TRỌNG 1: Ép kiểu BigInteger sang BigDecimal ---
        transaction.setAmount(new BigDecimal(amountBigInt));
        
        // --- ĐIỂM SỬA QUAN TRỌNG 2: Lưu status dạng String ---
        transaction.setStatus(TransactionStatus.PENDING.name());
        
        transaction.setTimestamp(LocalDateTime.now());
        
        // Lưu tạm vào DB (trạng thái PENDING)
        transaction = transactionRepository.save(transaction);

        try {
            // Giả lập gọi Blockchain để lấy Hash
            // String txHash = contractService.sendTransaction(...); 
            String txHash = "0x123...mock_hash_" + System.currentTimeMillis(); 

            // --- ĐIỂM SỬA QUAN TRỌNG 3: Dùng hàm alias setTxHash bạn vừa thêm ---
            transaction.setTxHash(txHash);
            
            // Cập nhật trạng thái SUCCESS
            transaction.setStatus(TransactionStatus.SUCCESS.name());
            
            // Cập nhật các trường bổ sung
            transaction.setBlockNumber(BigInteger.valueOf(1001)); 
            transaction.setConfirmedAt(LocalDateTime.now());

        } catch (Exception e) {
            e.printStackTrace();
            transaction.setStatus(TransactionStatus.FAILED.name());
        }

        return transactionRepository.save(transaction);
    }
    
    public boolean isTransactionSuccess(Transaction tx) {
        return TransactionStatus.SUCCESS.name().equals(tx.getStatus());
    }
}