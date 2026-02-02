package com.chainpay.dto;

import java.math.BigInteger;

public class PaymentRequest {
    private String toAddress;
    private BigInteger amount;
    private String privateKey; // Dùng để ký giao dịch

    public PaymentRequest() {}

    public String getToAddress() { return toAddress; }
    public void setToAddress(String toAddress) { this.toAddress = toAddress; }

    public BigInteger getAmount() { return amount; }
    public void setAmount(BigInteger amount) { this.amount = amount; }

    public String getPrivateKey() { return privateKey; }
    public void setPrivateKey(String privateKey) { this.privateKey = privateKey; }
}