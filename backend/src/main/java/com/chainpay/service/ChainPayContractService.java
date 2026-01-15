package com.chainpay.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.protocol.Web3j;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.EthCall;
import org.web3j.protocol.core.methods.response.EthGetTransactionReceipt;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.crypto.TransactionEncoder;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class ChainPayContractService {
    
    private static final Logger logger = LoggerFactory.getLogger(ChainPayContractService.class);
    
    @Autowired
    private BlockchainService blockchainService;
    
    @Value("${blockchain.gas-price}")
    private BigInteger gasPrice;
    
    @Value("${blockchain.gas-limit}")
    private BigInteger gasLimit;
    
    /**
     * Send payment from one address to another
     */
    public String sendPayment(String fromPrivateKey, String toAddress, BigInteger amount) throws Exception {
        Credentials credentials = Credentials.create(fromPrivateKey);
        Web3j web3j = blockchainService.getWeb3j();
        String contractAddress = blockchainService.getContractAddress();
        
        // Build the function call
        Function function = new Function(
                "sendPayment",
                Arrays.asList(new Address(toAddress), new Uint256(amount)),
                Collections.emptyList()
        );
        
        String encodedFunction = FunctionEncoder.encode(function);
        
        // Get nonce
        BigInteger nonce = web3j.ethGetTransactionCount(
                credentials.getAddress(), DefaultBlockParameterName.LATEST).send().getTransactionCount();
        
        // Get chain ID
        long chainId = web3j.ethChainId().send().getChainId().longValue();
        
        // Create raw transaction
        org.web3j.crypto.RawTransaction rawTransaction = org.web3j.crypto.RawTransaction.createTransaction(
                nonce,
                gasPrice,
                gasLimit,
                contractAddress,
                encodedFunction
        );
        
        // Sign and send transaction
        byte[] signedMessage = org.web3j.crypto.TransactionEncoder.signMessage(rawTransaction, chainId, credentials);
        String hexValue = Numeric.toHexString(signedMessage);
        
        EthSendTransaction ethSendTransaction = web3j.ethSendRawTransaction(hexValue).send();
        
        if (ethSendTransaction.hasError()) {
            throw new RuntimeException("Transaction failed: " + ethSendTransaction.getError().getMessage());
        }
        
        String txHash = ethSendTransaction.getTransactionHash();
        logger.info("Transaction sent: {}", txHash);
        
        return txHash;
    }
    
    /**
     * Get balance of an address
     */
    public BigInteger getBalance(String address) throws Exception {
        Web3j web3j = blockchainService.getWeb3j();
        String contractAddress = blockchainService.getContractAddress();
        
        Function function = new Function(
                "getBalance",
                Arrays.asList(new Address(address)),
                Arrays.asList(new TypeReference<Uint256>() {})
        );
        
        String encodedFunction = FunctionEncoder.encode(function);
        
        EthCall response = web3j.ethCall(
                Transaction.createEthCallTransaction(null, contractAddress, encodedFunction),
                DefaultBlockParameterName.LATEST
        ).send();
        
        if (response.hasError()) {
            throw new RuntimeException("Error calling contract: " + response.getError().getMessage());
        }
        
        String value = response.getValue();
        List<Type<?>> decoded = FunctionReturnDecoder.decode(value, function.getOutputParameters());
        
        if (decoded.isEmpty()) {
            return BigInteger.ZERO;
        }
        
        return (BigInteger) decoded.get(0).getValue();
    }
    
    /**
     * Wait for transaction receipt
     */
    public TransactionReceipt waitForTransactionReceipt(String txHash) throws Exception {
        Web3j web3j = blockchainService.getWeb3j();
        
        Optional<TransactionReceipt> receipt;
        int attempts = 0;
        int maxAttempts = 30;
        
        do {
            EthGetTransactionReceipt receiptResponse = web3j.ethGetTransactionReceipt(txHash).send();
            receipt = receiptResponse.getTransactionReceipt();
            attempts++;
            
            if (attempts >= maxAttempts) {
                throw new RuntimeException("Transaction receipt not found after " + maxAttempts + " attempts");
            }
            
            if (!receipt.isPresent()) {
                Thread.sleep(2000); // Wait 2 seconds before retrying
            }
        } while (!receipt.isPresent());
        
        return receipt.get();
    }
    
    /**
     * Check if address is valid
     */
    public boolean isValidAddress(String address) {
        return blockchainService.isValidAddress(address);
    }
}