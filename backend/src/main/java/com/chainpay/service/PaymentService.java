package com.chainpay.service;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.protocol.core.methods.response.TransactionReceipt;

import com.chainpay.entity.Transaction;
import com.chainpay.entity.TransactionStatus;
import com.chainpay.repository.ProductRepository;
import com.chainpay.repository.TransactionRepository;

@Service
public class PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ChainPayContractService contractService;

    @Value("${blockchain.private-key}")
    private String adminPrivateKey;

    public Transaction processPayment(String fromAddress, String toAddress, String amountStr) {
        BigInteger amountBigInt = new BigInteger(amountStr);

        Transaction transaction = new Transaction();
        transaction.setFromAddress(fromAddress);
        transaction.setToAddress(toAddress);
        transaction.setAmount(new BigDecimal(amountBigInt));
        transaction.setStatus(TransactionStatus.PENDING.name());
        transaction.setTimestamp(LocalDateTime.now());

        transaction = transactionRepository.save(transaction);

        try {
            logger.info("Bat dau xu ly giao dich len Blockchain...");

            String txHash = contractService.sendPayment(adminPrivateKey, toAddress, amountBigInt);
            TransactionReceipt receipt = contractService.waitForTransactionReceipt(txHash);

            transaction.setTxHash(txHash);
            transaction.setStatus(TransactionStatus.SUCCESS.name());
            transaction.setBlockNumber(receipt.getBlockNumber());
            transaction.setConfirmedAt(LocalDateTime.now());

            logger.info("Giao dich hoan tat. Hash: {}", txHash);
        } catch (Exception e) {
            logger.error("Loi giao dich Blockchain:", e);
            transaction.setStatus(TransactionStatus.FAILED.name());
        }

        return transactionRepository.save(transaction);
    }

    public BigInteger getBalance(String address) throws Exception {
        return contractService.getBalance(address);
    }

    public Transaction recordExternalPayment(
            String fromAddress,
            String toAddress,
            String amountStr,
            String txHash,
            Long productId) {
        Transaction tx = new Transaction();
        tx.setFromAddress(fromAddress);
        tx.setToAddress(toAddress);
        tx.setAmount(new BigDecimal(amountStr));
        tx.setStatus(TransactionStatus.SUCCESS.name());
        tx.setTxHash(txHash);
        tx.setTimestamp(LocalDateTime.now());
        tx.setConfirmedAt(LocalDateTime.now());

        if (productId != null) {
            var product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Khong tim thay san pham phu hop!"));

            if (product.getPriceWei() == null || product.getPriceWei().isBlank()) {
                throw new RuntimeException("San pham chua duoc cau hinh gia Wei!");
            }

            BigInteger expectedAmount = new BigInteger(product.getPriceWei());
            BigInteger actualAmount = new BigInteger(amountStr);
            if (!expectedAmount.equals(actualAmount)) {
                throw new RuntimeException("So tien thanh toan khong khop voi gia san pham!");
            }

            tx.setProductId(product.getId());
        }

        return transactionRepository.save(tx);
    }
}
