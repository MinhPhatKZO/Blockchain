package com.chainpay.service;

import com.chainpay.entity.User;
import com.chainpay.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public User createUser(String username, String password, String walletAddress) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }
        
        if (walletAddress != null && userRepository.existsByWalletAddress(walletAddress)) {
            throw new RuntimeException("Wallet address already exists");
        }
        
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setWalletAddress(walletAddress);
        
        return userRepository.save(user);
    }
    
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
    
    public User updateWalletAddress(String username, String walletAddress) {
        User user = findByUsername(username);
        if (walletAddress != null && userRepository.existsByWalletAddress(walletAddress)) {
            throw new RuntimeException("Wallet address already exists");
        }
        user.setWalletAddress(walletAddress);
        return userRepository.save(user);
    }
}