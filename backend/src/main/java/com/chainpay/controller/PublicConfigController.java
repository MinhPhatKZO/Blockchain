package com.chainpay.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chainpay.service.BlockchainService;

@RestController
@RequestMapping("/api/public")
public class PublicConfigController {

    private final BlockchainService blockchainService;

    @Value("${blockchain.store-wallet-address:}")
    private String configuredStoreWalletAddress;

    public PublicConfigController(BlockchainService blockchainService) {
        this.blockchainService = blockchainService;
    }

    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("contractAddress", defaultString(blockchainService.getContractAddress()));
        config.put("storeWalletAddress", resolveStoreWalletAddress());
        config.put("chainId", defaultString(blockchainService.getChainId()));
        return ResponseEntity.ok(config);
    }

    private String resolveStoreWalletAddress() {
        if (configuredStoreWalletAddress != null && !configuredStoreWalletAddress.isBlank()) {
            return configuredStoreWalletAddress;
        }

        if (blockchainService.getCredentials() != null) {
            return blockchainService.getCredentials().getAddress();
        }

        return "";
    }

    private String defaultString(String value) {
        return value == null ? "" : value;
    }
}
