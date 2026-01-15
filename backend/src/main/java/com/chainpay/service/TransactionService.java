package com.chainpay.service;

import com.chainpay.dto.TransactionDTO;
import com.chainpay.entity.Transaction;
import com.chainpay.entity.User;
import com.chainpay.repository.TransactionRepository;
import com.chainpay.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<TransactionDTO> getTransactionHistory(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        if (user.getWalletAddress() == null || user.getWalletAddress().isEmpty()) {
            return List.of();
        }
        
        List<Transaction> transactions = transactionRepository.findByWalletAddress(user.getWalletAddress());
        
        return transactions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private TransactionDTO convertToDTO(Transaction transaction) {
        return new TransactionDTO(
                transaction.getId(),
                transaction.getFromAddress(),
                transaction.getToAddress(),
                transaction.getAmount().toString(),
                transaction.getTxHash(),
                transaction.getStatus().name(),
                transaction.getCreatedAt(),
                transaction.getConfirmedAt()
        );
    }
}