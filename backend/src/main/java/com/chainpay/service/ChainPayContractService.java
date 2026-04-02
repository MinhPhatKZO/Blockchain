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
            throw new RuntimeException("Giao dịch bị từ chối ngay khi gửi: " + ethSendTransaction.getError().getMessage());
        }
        
        logger.info("Đã gửi giao dịch sendPayment. Hash: {}", ethSendTransaction.getTransactionHash());
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
            throw new RuntimeException("Lỗi khi đọc Smart Contract: " + response.getError().getMessage());
        }
        
        String value = response.getValue();
        List<Type> decoded = FunctionReturnDecoder.decode(value, function.getOutputParameters());
        
        if (decoded.isEmpty()) {
            return BigInteger.ZERO;
        }
        
        return (BigInteger) decoded.get(0).getValue();
    }
    
    // --- 3. [QUAN TRỌNG] Nạp tiền vào Contract (Deposit) ---
    public String deposit(String privateKey, BigInteger amountWei) throws Exception {
        Credentials credentials = Credentials.create(privateKey);
        Web3j web3j = blockchainService.getWeb3j();
        String contractAddress = blockchainService.getContractAddress();

        Function function = new Function("deposit", Collections.emptyList(), Collections.emptyList());
        String encodedFunction = FunctionEncoder.encode(function);

        BigInteger nonce = web3j.ethGetTransactionCount(
                credentials.getAddress(), DefaultBlockParameterName.LATEST).send().getTransactionCount();

        long chainId = web3j.ethChainId().send().getChainId().longValue();

        RawTransaction rawTransaction = RawTransaction.createTransaction(
                nonce,
                gasPrice,
                gasLimit,
                contractAddress,
                amountWei,
                encodedFunction
        );

        byte[] signedMessage = TransactionEncoder.signMessage(rawTransaction, chainId, credentials);
        String hexValue = Numeric.toHexString(signedMessage);

        EthSendTransaction ethSendTransaction = web3j.ethSendRawTransaction(hexValue).send();

        if (ethSendTransaction.hasError()) {
            throw new RuntimeException("Lỗi khi Deposit: " + ethSendTransaction.getError().getMessage());
        }

        logger.info("Đã gửi giao dịch deposit. Hash: {}", ethSendTransaction.getTransactionHash());
        return ethSendTransaction.getTransactionHash();
    }

    // --- 4. Tiện ích ---
    public boolean isValidAddress(String address) {
        return address != null && address.matches("^0x[a-fA-F0-9]{40}$");
    }

    // [ĐÃ NÂNG CẤP BẢO MẬT]
    public TransactionReceipt waitForTransactionReceipt(String txHash) throws Exception {
        Web3j web3j = blockchainService.getWeb3j();
        Optional<TransactionReceipt> receiptOptional = Optional.empty();
        
        int attempts = 0;
        int sleepDuration = 1000;
        int maxAttempts = 30;

        logger.info("Đang chờ xác nhận giao dịch trên Blockchain...");

        while (attempts < maxAttempts) {
            EthGetTransactionReceipt receiptResponse = web3j.ethGetTransactionReceipt(txHash).send();
            receiptOptional = receiptResponse.getTransactionReceipt();

            if (receiptOptional.isPresent()) {
                TransactionReceipt receipt = receiptOptional.get();
                
                // 🛑 Kiểm tra xem Smart Contract có báo lỗi (Revert) không
                if (!receipt.isStatusOK()) {
                    throw new RuntimeException("Giao dịch bị từ chối (Revert) bởi Smart Contract! Hãy kiểm tra lại số dư hoặc điều kiện.");
                }
                
                logger.info("Giao dịch thành công tại Block: {}", receipt.getBlockNumber());
                return receipt;
            }

            Thread.sleep(sleepDuration);
            attempts++;
        }

        throw new RuntimeException("Timeout: Không tìm thấy giao dịch sau " + maxAttempts + " giây.");
    }
}