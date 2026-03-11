package com.chainpay.service;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.chainpay.entity.Transaction;
import com.chainpay.entity.TransactionStatus;
import com.chainpay.repository.TransactionRepository;

@Service
public class PaymentService {

    @Autowired
    private TransactionRepository transactionRepository;

    // Nếu bạn chưa tạo file ChainPayContractService, hãy comment dòng này lại để tránh lỗi đỏ
    // @Autowired
    // private ChainPayContractService contractService;

    // --- HÀM XỬ LÝ THANH TOÁN ---
    // Sửa: Nhận String amount để khớp với Controller, sau đó tự convert sang BigInteger
    public Transaction processPayment(String fromAddress, String toAddress, String amountStr) {
        
        // 1. Convert String sang BigInteger
        BigInteger amountBigInt = new BigInteger(amountStr);

        Transaction transaction = new Transaction();
        transaction.setFromAddress(fromAddress);
        transaction.setToAddress(toAddress);
        transaction.setAmount(new BigDecimal(amountBigInt)); // Lưu vào DB dưới dạng Decimal
        transaction.setStatus(TransactionStatus.PENDING.name());
        transaction.setTimestamp(LocalDateTime.now());
        
        // Lưu trạng thái PENDING trước
        transaction = transactionRepository.save(transaction);

        try {
            // --- LOGIC BLOCKCHAIN ---
            // Sau này bạn sẽ mở comment dòng dưới để gọi Smart Contract thật
            // String txHash = contractService.sendPayment(privateKey, toAddress, amountBigInt);
            
            // Hiện tại giả lập Hash để test luồng
            String txHash = "0xMockHash_" + System.currentTimeMillis(); 
            
            transaction.setTxHash(txHash);
            transaction.setStatus(TransactionStatus.SUCCESS.name());
            transaction.setBlockNumber(BigInteger.valueOf(12345)); // Giả lập block
            transaction.setConfirmedAt(LocalDateTime.now());

        } catch (Exception e) {
            e.printStackTrace();
            transaction.setStatus(TransactionStatus.FAILED.name());
        }

        return transactionRepository.save(transaction);
    }

    // --- HÀM LẤY SỐ DƯ ---
    public BigInteger getBalance(String address) throws Exception {
        // Nếu chưa có ContractService, trả về số dư giả định để test Frontend
        // return contractService.getBalance(address);
        
        return new BigInteger("1000000000000000000"); // Giả lập 1 ETH
    }
}