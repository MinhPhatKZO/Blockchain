package com.chainpay.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class TransactionDTO {
    private Long id;
    private String fromAddress;
    private String toAddress;
    private String amount;
    private String txHash;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;
}