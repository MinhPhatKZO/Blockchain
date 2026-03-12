package com.chainpay.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chainpay.entity.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByFromAddressOrToAddress(String fromAddress, String toAddress);
    List<Transaction> findByFromAddressOrToAddressOrderByTimestampDesc(String fromAddress, String toAddress);
}