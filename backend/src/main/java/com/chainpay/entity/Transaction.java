package com.chainpay.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "from_address", nullable = false)
    private String fromAddress;
    
    @Column(name = "to_address", nullable = false)
    private String toAddress;
    
    @Column(nullable = false)
    private BigInteger amount;
    
    @Column(name = "tx_hash", unique = true)
    private String txHash;
    
    @Column(name = "block_number")
    private BigInteger blockNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = TransactionStatus.PENDING;
        }
    }
    
    public enum TransactionStatus {
        PENDING, SUCCESS, FAILED
    }
}