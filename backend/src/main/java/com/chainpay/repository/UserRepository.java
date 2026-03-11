package com.chainpay.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chainpay.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByWalletAddress(String walletAddress);
}