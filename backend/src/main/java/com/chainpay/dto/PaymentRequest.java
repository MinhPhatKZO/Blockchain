package com.chainpay.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigInteger;

@Data
public class PaymentRequest {
    @NotBlank(message = "Recipient address is required")
    private String toAddress;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigInteger amount; // Amount in Wei
}