package com.chainpay.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chainpay.entity.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // Tìm giao dịch liên quan đến ví (người gửi HOẶC người nhận)
    List<Transaction> findByFromAddressOrToAddress(String fromAddress, String toAddress);
}