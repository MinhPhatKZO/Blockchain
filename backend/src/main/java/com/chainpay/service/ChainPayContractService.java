package com.chainpay.service;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.RawTransaction;
import org.web3j.crypto.TransactionEncoder;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.response.EthCall;
import org.web3j.protocol.core.methods.response.EthGetTransactionReceipt;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.utils.Numeric;

@Service
public class ChainPayContractService {
    
    private static final Logger logger = LoggerFactory.getLogger(ChainPayContractService.class);
    
    @Autowired
    private BlockchainService blockchainService;
    
    @Value("${blockchain.gas-price}")
    private BigInteger gasPrice;
    
    @Value("${blockchain.gas-limit}")
    private BigInteger gasLimit;
    
    // --- 1. Gửi Token/Ether (Chuyển tiền nội bộ trong Contract) ---
    public String sendPayment(String fromPrivateKey, String toAddress, BigInteger amount) throws Exception {
        Credentials credentials = Credentials.create(fromPrivateKey);
        Web3j web3j = blockchainService.getWeb3j();
        String contractAddress = blockchainService.getContractAddress();
        
        // Tạo hàm sendPayment(address to, uint256 amount)
        List<Type> inputParameters = Arrays.<Type>asList(new Address(toAddress), new Uint256(amount));

        Function function = new Function(
                "sendPayment",
                inputParameters,
                Collections.emptyList()
        );
        
        String encodedFunction = FunctionEncoder.encode(function);
        
        BigInteger nonce = web3j.ethGetTransactionCount(
                credentials.getAddress(), DefaultBlockParameterName.LATEST).send().getTransactionCount();
        
        long chainId = web3j.ethChainId().send().getChainId().longValue();
        
        RawTransaction rawTransaction = RawTransaction.createTransaction(
                nonce,
                gasPrice,
                gasLimit,
                contractAddress,
                encodedFunction
        );
        
        byte[] signedMessage = TransactionEncoder.signMessage(rawTransaction, chainId, credentials);
        String hexValue = Numeric.toHexString(signedMessage);
        
        EthSendTransaction ethSendTransaction = web3j.ethSendRawTransaction(hexValue).send();
        
        if (ethSendTransaction.hasError()) {
            throw new RuntimeException("Transaction failed: " + ethSendTransaction.getError().getMessage());
        }
        
        return ethSendTransaction.getTransactionHash();
    }
    
    // --- 2. Lấy số dư (Trong Contract) ---
    public BigInteger getBalance(String address) throws Exception {
        Web3j web3j = blockchainService.getWeb3j();
        String contractAddress = blockchainService.getContractAddress();
        
        Function function = new Function(
                "getBalance",
                Arrays.<Type>asList(new Address(address)),
                Arrays.asList(new TypeReference<Uint256>() {})
        );
        
        String encodedFunction = FunctionEncoder.encode(function);
        
        EthCall response = web3j.ethCall(
                org.web3j.protocol.core.methods.request.Transaction.createEthCallTransaction(null, contractAddress, encodedFunction),
                DefaultBlockParameterName.LATEST
        ).send();
        
        if (response.hasError()) {
            throw new RuntimeException("Error calling contract: " + response.getError().getMessage());
        }
        
        String value = response.getValue();
        List<Type> decoded = FunctionReturnDecoder.decode(value, function.getOutputParameters());
        
        if (decoded.isEmpty()) {
            return BigInteger.ZERO;
        }
        
        return (BigInteger) decoded.get(0).getValue();
    }
    
    // --- 3. [QUAN TRỌNG] Nạp tiền vào Contract (Deposit) ---
    // Hàm này dùng để Admin nạp ETH từ ví ngoài vào quỹ của Contract
    public String deposit(String privateKey, BigInteger amountWei) throws Exception {
        Credentials credentials = Credentials.create(privateKey);
        Web3j web3j = blockchainService.getWeb3j();
        String contractAddress = blockchainService.getContractAddress();

        // Hàm deposit() không có tham số input
        Function function = new Function(
                "deposit",
                Collections.emptyList(),
                Collections.emptyList()
        );

        String encodedFunction = FunctionEncoder.encode(function);

        BigInteger nonce = web3j.ethGetTransactionCount(
                credentials.getAddress(), DefaultBlockParameterName.LATEST).send().getTransactionCount();

        long chainId = web3j.ethChainId().send().getChainId().longValue();

        // CHÚ Ý: Tham số amountWei được đưa vào field "value" của Transaction
        RawTransaction rawTransaction = RawTransaction.createTransaction(
                nonce,
                gasPrice,
                gasLimit,
                contractAddress,
                amountWei, // <--- Gửi kèm tiền ETH thật vào đây
                encodedFunction
        );

        byte[] signedMessage = TransactionEncoder.signMessage(rawTransaction, chainId, credentials);
        String hexValue = Numeric.toHexString(signedMessage);

        EthSendTransaction ethSendTransaction = web3j.ethSendRawTransaction(hexValue).send();

        if (ethSendTransaction.hasError()) {
            throw new RuntimeException("Deposit failed: " + ethSendTransaction.getError().getMessage());
        }

        return ethSendTransaction.getTransactionHash();
    }

    // --- 4. Tiện ích ---
    public boolean isValidAddress(String address) {
        return address != null && address.matches("^0x[a-fA-F0-9]{40}$");
    }

    public TransactionReceipt waitForTransactionReceipt(String txHash) throws Exception {
        Web3j web3j = blockchainService.getWeb3j();
        Optional<TransactionReceipt> receiptOptional = Optional.empty();
        
        int attempts = 0;
        int sleepDuration = 1000;
        int maxAttempts = 30;

        while (attempts < maxAttempts) {
            EthGetTransactionReceipt receiptResponse = web3j.ethGetTransactionReceipt(txHash).send();
            receiptOptional = receiptResponse.getTransactionReceipt();

            if (receiptOptional.isPresent()) {
                return receiptOptional.get();
            }

            Thread.sleep(sleepDuration);
            attempts++;
        }

        throw new RuntimeException("Transaction receipt not found after waiting");
    }
}