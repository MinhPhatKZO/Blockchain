package com.chainpay.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.chainpay.dto.TransactionDTO;
import com.chainpay.entity.Transaction;
import com.chainpay.repository.TransactionRepository;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    public List<TransactionDTO> getHistory(String walletAddress) {
        // Fix: Dùng hàm tìm theo 'from' hoặc 'to' thay vì 'findByWalletAddress' (vì trong DB ko có cột walletAddress ở bảng transaction)
        List<Transaction> transactions = transactionRepository.findByFromAddressOrToAddress(walletAddress, walletAddress);

        return transactions.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private TransactionDTO convertToDTO(Transaction transaction) {
        TransactionDTO dto = new TransactionDTO();
        dto.setFromAddress(transaction.getFromAddress());
        dto.setToAddress(transaction.getToAddress());
        dto.setAmount(transaction.getAmount());
        dto.setHash(transaction.getTransactionHash());
        
        // Fix lỗi: transaction.getStatus() đã là String, không cần gọi .name() nữa
        dto.setStatus(transaction.getStatus()); 
        
        dto.setTimestamp(transaction.getTimestamp());
        return dto;
    }
}