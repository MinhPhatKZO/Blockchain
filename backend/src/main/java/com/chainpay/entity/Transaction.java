package com.chainpay.entity;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDateTime;

import jakarta.persistence.Column; // Import thêm cái này
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fromAddress;
    private String toAddress;
    private BigDecimal amount;

    @Column(name = "transaction_hash", unique = true)
    private String transactionHash;

    private String status; // Lưu status dưới dạng String

    private LocalDateTime timestamp;
    
    // Thêm các trường mới để khớp với PaymentService
    private BigInteger blockNumber;
    private LocalDateTime confirmedAt;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }

    // Constructor
    public Transaction() {}
    

    // --- MANUAL GETTERS & SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFromAddress() { return fromAddress; }
    public void setFromAddress(String fromAddress) { this.fromAddress = fromAddress; }

    public String getToAddress() { return toAddress; }
    public void setToAddress(String toAddress) { this.toAddress = toAddress; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    // Getter/Setter cho hash (khớp với cả 2 cách gọi)
    public String getTransactionHash() { return transactionHash; }
    public void setTransactionHash(String transactionHash) { this.transactionHash = transactionHash; }
    // Thêm alias này để fix lỗi code cũ gọi setTxHash
    public void setTxHash(String txHash) { this.transactionHash = txHash; } 
    public String getTxHash() { return transactionHash; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public BigInteger getBlockNumber() { return blockNumber; }
    public void setBlockNumber(BigInteger blockNumber) { this.blockNumber = blockNumber; }

    public LocalDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(LocalDateTime confirmedAt) { this.confirmedAt = confirmedAt; 
        
    }
}