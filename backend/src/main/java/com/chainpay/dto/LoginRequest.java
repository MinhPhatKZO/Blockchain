package com.chainpay.dto;

public class LoginRequest {
    private String username;
    private String password;

    // Constructor mặc định
    public LoginRequest() {
    }

    // Constructor đầy đủ
    public LoginRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // Getter & Setter thủ công
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}