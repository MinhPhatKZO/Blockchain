package com.chainpay.entity;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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

    private String status;
    private LocalDateTime timestamp;
    
    private BigInteger blockNumber;
    private LocalDateTime confirmedAt;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }

    public Transaction() {}

    // Getters
    public Long getId() { return id; }
    public String getFromAddress() { return fromAddress; }
    public String getToAddress() { return toAddress; }
    public BigDecimal getAmount() { return amount; }
    public String getTransactionHash() { return transactionHash; }
    public String getTxHash() { return transactionHash; } // Alias
    public String getStatus() { return status; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public LocalDateTime getCreatedAt() { return timestamp; } // Alias
    public BigInteger getBlockNumber() { return blockNumber; }
    public LocalDateTime getConfirmedAt() { return confirmedAt; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setFromAddress(String fromAddress) { this.fromAddress = fromAddress; }
    public void setToAddress(String toAddress) { this.toAddress = toAddress; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public void setTransactionHash(String transactionHash) { this.transactionHash = transactionHash; }
    public void setTxHash(String txHash) { this.transactionHash = txHash; } // Alias
    public void setStatus(String status) { this.status = status; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public void setBlockNumber(BigInteger blockNumber) { this.blockNumber = blockNumber; }
    public void setConfirmedAt(LocalDateTime confirmedAt) { this.confirmedAt = confirmedAt; }

    // Thêm cột lưu ID
    //Chỗ này sửa db: thêm cột product_id vào bảng transactions để lưu ID sản phẩm đã mua
    @Column(name = "product_id")
    private Long productId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
}