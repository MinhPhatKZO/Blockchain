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
        // FIX LỖI 1: Gọi đúng hàm tìm kiếm 2 chiều (người gửi hoặc người nhận)
        // thay vì 'findByWalletAddress' không tồn tại
        List<Transaction> transactions = transactionRepository.findByFromAddressOrToAddress(walletAddress, walletAddress);

        return transactions.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private TransactionDTO convertToDTO(Transaction transaction) {
        TransactionDTO dto = new TransactionDTO();
        dto.setFromAddress(transaction.getFromAddress());
        dto.setToAddress(transaction.getToAddress());
        dto.setAmount(transaction.getAmount());
        
        // Lấy hash
        dto.setHash(transaction.getTransactionHash());
        
        // FIX LỖI 2: transaction.getStatus() đã là String, không gọi .name() nữa
        dto.setStatus(transaction.getStatus()); 
        
        dto.setTimestamp(transaction.getTimestamp());
        return dto;
    }
}