package com.chainpay.repository;

import com.chainpay.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByFromAddressOrToAddressOrderByCreatedAtDesc(String fromAddress, String toAddress);
    
    @Query("SELECT t FROM Transaction t WHERE t.fromAddress = :address OR t.toAddress = :address ORDER BY t.createdAt DESC")
    List<Transaction> findByWalletAddress(@Param("address") String address);
    
    Optional<Transaction> findByTxHash(String txHash);
}