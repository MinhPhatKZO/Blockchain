package com.chainpay.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PaymentResponse {
    private String txHash;
    private String fromAddress;
    private String toAddress;
    private String amount;
    private String status;
    private String message;
}