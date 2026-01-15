package com.chainpay.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BalanceResponse {
    private String address;
    private String balance; // Balance in Wei
    private String balanceInEther; // Balance in Ether
}