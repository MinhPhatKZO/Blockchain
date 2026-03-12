package com.chainpay.service;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.protocol.core.methods.response.TransactionReceipt;

import com.chainpay.entity.Transaction;
import com.chainpay.entity.TransactionStatus;
import com.chainpay.repository.TransactionRepository;

@Service
public class PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    @Autowired
    private TransactionRepository transactionRepository;

    // 1. Mở khóa Service giao tiếp Blockchain
    @Autowired
    private ChainPayContractService contractService;

    // 2. Lấy Private Key của Admin từ file application.yml để ký giao dịch
    @Value("${blockchain.private-key}")
    private String adminPrivateKey;

    // --- HÀM XỬ LÝ THANH TOÁN (DỮ LIỆU THẬT) ---
    public Transaction processPayment(String fromAddress, String toAddress, String amountStr) {
        
        BigInteger amountBigInt = new BigInteger(amountStr);

        Transaction transaction = new Transaction();
        transaction.setFromAddress(fromAddress);
        transaction.setToAddress(toAddress);
        transaction.setAmount(new BigDecimal(amountBigInt)); 
        transaction.setStatus(TransactionStatus.PENDING.name());
        transaction.setTimestamp(LocalDateTime.now());
        
        // Lưu DB trạng thái PENDING trước khi ném lên Blockchain
        transaction = transactionRepository.save(transaction);

        try {
            logger.info("Bắt đầu xử lý giao dịch thực tế lên Blockchain...");
            
            // --- LOGIC BLOCKCHAIN THẬT ---
            // 1. Gửi lệnh chuyển tiền vào Smart Contract
            String txHash = contractService.sendPayment(adminPrivateKey, toAddress, amountBigInt);
            
            // 2. Chờ Smart Contract xác nhận (Đã bao gồm check lỗi Revert ở bước trước)
            TransactionReceipt receipt = contractService.waitForTransactionReceipt(txHash);
            
            // 3. Cập nhật dữ liệu thật từ Ganache vào Database
            transaction.setTxHash(txHash);
            transaction.setStatus(TransactionStatus.SUCCESS.name());
            transaction.setBlockNumber(receipt.getBlockNumber()); // Số Block thật
            transaction.setConfirmedAt(LocalDateTime.now());
            
            logger.info("Giao dịch hoàn tất 100%. Hash: {}", txHash);

        } catch (Exception e) {
            logger.error("Lỗi giao dịch Blockchain: ", e);
            transaction.setStatus(TransactionStatus.FAILED.name());
            // Nếu bạn có cột lưu lý do lỗi, có thể thêm: transaction.setErrorMessage(e.getMessage());
        }

        return transactionRepository.save(transaction);
    }

    // --- HÀM LẤY SỐ DƯ (DỮ LIỆU THẬT) ---
    public BigInteger getBalance(String address) throws Exception {
        // Trực tiếp gọi xuống mapping `balances` của Smart Contract
        return contractService.getBalance(address);
    }
    
    // --- HÀM GHI NHẬN GIAO DỊCH TỪ METAMASK ---
    public Transaction recordExternalPayment(String fromAddress, String toAddress, String amountStr, String txHash) {
        Transaction tx = new Transaction();
        tx.setFromAddress(fromAddress);
        tx.setToAddress(toAddress);
        tx.setAmount(new BigDecimal(amountStr));
        tx.setStatus(TransactionStatus.SUCCESS.name()); // Mặc định thành công vì MetaMask đã xử lý xong
        tx.setTxHash(txHash);
        tx.setTimestamp(LocalDateTime.now());
        tx.setConfirmedAt(LocalDateTime.now());
        
        return transactionRepository.save(tx);
    }
}