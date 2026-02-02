package com.chainpay.dto;

public class BalanceResponse {
    private String address;
    private String balance;
    private String currency;

    public BalanceResponse() {}

    // Constructor này fix lỗi "applied to given types"
    public BalanceResponse(String address, String balance, String currency) {
        this.address = address;
        this.balance = balance;
        this.currency = currency;
    }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getBalance() { return balance; }
    public void setBalance(String balance) { this.balance = balance; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
}