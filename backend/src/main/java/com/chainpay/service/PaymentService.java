package com.chainpay.service;

import com.chainpay.dto.PaymentRequest;
import com.chainpay.dto.PaymentResponse;
import com.chainpay.entity.Transaction;
import com.chainpay.entity.User;
import com.chainpay.repository.TransactionRepository;
import com.chainpay.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web3j.protocol.core.methods.response.TransactionReceipt;

import java.math.BigInteger;
import java.time.LocalDateTime;

@Service
public class PaymentService {
    
    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);
    
    @Autowired
    private ChainPayContractService contractService;
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Transactional
    public PaymentResponse sendPayment(String username, PaymentRequest paymentRequest) {
        // Validate recipient address
        if (!contractService.isValidAddress(paymentRequest.getToAddress())) {
            throw new IllegalArgumentException("Invalid recipient address");
        }
        
        // Get user and validate wallet address
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        if (user.getWalletAddress() == null || user.getWalletAddress().isEmpty()) {
            throw new IllegalStateException("User wallet address not set");
        }
        
        // Note: In production, you should securely retrieve the private key
        // For now, we assume it's stored in user entity or retrieved from a secure vault
        // This is just a placeholder - you need to implement secure key management
        String fromPrivateKey = getPrivateKeyForUser(user);
        
        if (fromPrivateKey == null) {
            throw new IllegalStateException("Private key not available for user");
        }
        
        // Check balance before sending
        try {
            BigInteger balance = contractService.getBalance(user.getWalletAddress());
            if (balance.compareTo(paymentRequest.getAmount()) < 0) {
                throw new IllegalArgumentException("Insufficient balance");
            }
        } catch (Exception e) {
            logger.error("Error checking balance", e);
            throw new RuntimeException("Failed to check balance: " + e.getMessage());
        }
        
        // Create transaction record
        Transaction transaction = new Transaction();
        transaction.setFromAddress(user.getWalletAddress());
        transaction.setToAddress(paymentRequest.getToAddress());
        transaction.setAmount(paymentRequest.getAmount());
        transaction.setStatus(Transaction.TransactionStatus.PENDING);
        transaction = transactionRepository.save(transaction);
        
        try {
            // Send transaction to blockchain
            String txHash = contractService.sendPayment(
                    fromPrivateKey,
                    paymentRequest.getToAddress(),
                    paymentRequest.getAmount()
            );
            
            transaction.setTxHash(txHash);
            
            // Wait for transaction receipt
            TransactionReceipt receipt = contractService.waitForTransactionReceipt(txHash);
            transaction.setBlockNumber(receipt.getBlockNumber());
            
            if (receipt.isStatusOK()) {
                transaction.setStatus(Transaction.TransactionStatus.SUCCESS);
                transaction.setConfirmedAt(LocalDateTime.now());
            } else {
                transaction.setStatus(Transaction.TransactionStatus.FAILED);
            }
            
            transactionRepository.save(transaction);
            
            return new PaymentResponse(
                    txHash,
                    user.getWalletAddress(),
                    paymentRequest.getToAddress(),
                    paymentRequest.getAmount().toString(),
                    transaction.getStatus().name(),
                    "Payment sent successfully"
            );
            
        } catch (Exception e) {
            logger.error("Error sending payment", e);
            transaction.setStatus(Transaction.TransactionStatus.FAILED);
            transactionRepository.save(transaction);
            
            throw new RuntimeException("Failed to send payment: " + e.getMessage());
        }
    }
    
    /**
     * Get user's private key
     * IMPORTANT: This is a placeholder. In production, implement secure key management
     * Options: Hardware Security Module (HSM), Key Management Service (KMS), Encrypted storage
     * 
     * For demo purposes, you can:
     * 1. Store private key in environment variable and map to user
     * 2. Read from secure vault based on user ID
     * 3. Use user's MetaMask (client-side signing) instead of server-side
     */
    private String getPrivateKeyForUser(User user) {
        // TODO: Implement secure key retrieval
        // Example approaches:
        // 1. Environment variable mapping:
        //    return System.getenv("PRIVATE_KEY_FOR_" + user.getUsername());
        // 2. Database encrypted storage (not recommended for production):
        //    return decryptKey(user.getEncryptedPrivateKey());
        // 3. Key Management Service:
        //    return keyManagementService.getKey(user.getId());
        
        // For now, return null - user should use MetaMask for signing transactions
        // In production, implement proper key management
        throw new IllegalStateException(
            "Private key management not implemented. " +
            "Please implement getPrivateKeyForUser() method with secure key storage. " +
            "See DEPLOYMENT_GUIDE.md for implementation options."
        );
    }
    
    public BigInteger getBalance(String address) {
        try {
            return contractService.getBalance(address);
        } catch (Exception e) {
            logger.error("Error getting balance", e);
            throw new RuntimeException("Failed to get balance: " + e.getMessage());
        }
    }
}