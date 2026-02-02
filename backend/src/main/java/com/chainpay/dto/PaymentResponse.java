package com.chainpay.dto;

public class PaymentResponse {
    private String transactionHash;
    private String status;
    private String message;

    public PaymentResponse() {}

    public PaymentResponse(String transactionHash, String status, String message) {
        this.transactionHash = transactionHash;
        this.status = status;
        this.message = message;
    }

    public String getTransactionHash() { return transactionHash; }
    public void setTransactionHash(String transactionHash) { this.transactionHash = transactionHash; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}