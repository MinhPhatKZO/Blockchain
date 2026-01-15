package com.chainpay.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.Keys;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;
import org.web3j.utils.Convert;

import java.math.BigInteger;

@Service
public class BlockchainService {
    
    private final Web3j web3j;
    private final Credentials credentials;
    private final String contractAddress;
    
    public BlockchainService(
            @Value("${blockchain.network-url:http://127.0.0.1:7545}") String networkUrl,
            @Value("${blockchain.contract-address:}") String contractAddress,
            @Value("${blockchain.private-key:}") String privateKey) {
        this.web3j = Web3j.build(new HttpService(networkUrl));
        this.contractAddress = contractAddress;
        if (privateKey != null && !privateKey.isEmpty()) {
            this.credentials = Credentials.create(privateKey);
        } else {
            this.credentials = null;
        }
    }
    
    public Web3j getWeb3j() {
        return web3j;
    }
    
    public Credentials getCredentials() {
        return credentials;
    }
    
    public String getContractAddress() {
        return contractAddress;
    }
    
    /**
     * Convert Wei to Ether
     */
    public String weiToEther(BigInteger wei) {
        return Convert.fromWei(wei.toString(), Convert.Unit.ETHER).toPlainString();
    }
    
    /**
     * Convert Ether to Wei
     */
    public BigInteger etherToWei(String ether) {
        return Convert.toWei(ether, Convert.Unit.ETHER).toBigInteger();
    }
    
    /**
     * Validate Ethereum address
     */
    public boolean isValidAddress(String address) {
        if (address == null || address.isEmpty()) {
            return false;
        }
        try {
            Keys.toChecksumAddress(address);
            return address.startsWith("0x") && address.length() == 42;
        } catch (Exception e) {
            return false;
        }
    }
}