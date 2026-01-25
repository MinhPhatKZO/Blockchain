// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ChainPay
 * @dev Smart Contract for P2P Payment on Ethereum Blockchain
 */
contract ChainPay {
    // Mapping to store balances
    mapping(address => uint256) private balances;
    
    // Event to log transactions
    event PaymentSent(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 timestamp,
        bytes32 transactionHash
    );
    
    event Deposit(address indexed account, uint256 amount, uint256 timestamp);
    event Withdraw(address indexed account, uint256 amount, uint256 timestamp);
    
    /**
     * @dev Deposit funds to the contract
     */
    function deposit() public payable {
        require(msg.value > 0, "Amount must be greater than 0");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @dev Send payment from sender to recipient
     * @param to Recipient address
     * @param amount Amount to send (in Wei)
     */
    function sendPayment(address to, uint256 amount) public {
        require(to != address(0), "Invalid recipient address");
        require(to != msg.sender, "Cannot send to yourself");
        require(amount > 0, "Amount must be greater than 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        balances[to] += amount;
        
        bytes32 txHash = keccak256(abi.encodePacked(msg.sender, to, amount, block.timestamp));
        
        emit PaymentSent(msg.sender, to, amount, block.timestamp, txHash);
    }
    
    /**
     * @dev Get balance of an address
     * @param account Address to check balance
     * @return Balance in Wei
     */
    function getBalance(address account) public view returns (uint256) {
        return balances[account];
    }
    
    /**
     * @dev Get sender's own balance
     * @return Balance in Wei
     */
    function myBalance() public view returns (uint256) {
        return balances[msg.sender];
    }
    
    /**
     * @dev Withdraw funds from contract
     * @param amount Amount to withdraw (in Wei)
     */
    function withdraw(uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit Withdraw(msg.sender, amount, block.timestamp);
    }
}