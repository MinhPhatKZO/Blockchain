# ChainPay Blockchain Documentation

## Tổng quan

ChainPay là hệ thống thanh toán P2P (Peer-to-Peer) được xây dựng trên nền tảng Ethereum Blockchain. Hệ thống cho phép người dùng gửi tiền trực tiếp từ ví này sang ví khác thông qua Smart Contract, đảm bảo tính minh bạch và không thể thay đổi.

## Công nghệ sử dụng

- **Blockchain:** Ethereum
- **Môi trường phát triển:** Ganache (Local), Sepolia (Testnet)
- **Ngôn ngữ Smart Contract:** Solidity 0.8.20
- **Backend Integration:** Web3j 4.9.8

## Smart Contract

### ChainPay.sol

Smart Contract chính của hệ thống ChainPay.

#### Các chức năng chính:

1. **deposit()** - Nạp tiền vào contract
   - Cho phép người dùng gửi ETH vào contract
   - Cập nhật số dư trong mapping
   - Emit event Deposit

2. **sendPayment(address to, uint256 amount)** - Gửi tiền P2P
   - Gửi tiền từ người gửi đến người nhận
   - Kiểm tra số dư đủ
   - Kiểm tra địa chỉ hợp lệ
   - Cập nhật số dư cả hai bên
   - Emit event PaymentSent với transaction hash

3. **getBalance(address account)** - Kiểm tra số dư
   - Trả về số dư của một địa chỉ cụ thể (tính bằng Wei)

4. **myBalance()** - Lấy số dư của người gọi
   - Trả về số dư của msg.sender

5. **withdraw(uint256 amount)** - Rút tiền
   - Rút tiền từ contract về ví cá nhân
   - Kiểm tra số dư đủ
   - Chuyển ETH về ví người gọi

#### Events:

- **PaymentSent** - Được emit khi có giao dịch thành công
  ```solidity
  event PaymentSent(
      address indexed from,
      address indexed to,
      uint256 amount,
      uint256 timestamp,
      bytes32 transactionHash
  );
  ```

- **Deposit** - Được emit khi có nạp tiền
  ```solidity
  event Deposit(address indexed account, uint256 amount, uint256 timestamp);
  ```

- **Withdraw** - Được emit khi có rút tiền
  ```solidity
  event Withdraw(address indexed account, uint256 amount, uint256 timestamp);
  ```

## Luồng giao dịch trên Blockchain

### 1. Quy trình gửi tiền P2P

```
User (Frontend)
    │
    │ 1. Nhập địa chỉ người nhận và số tiền
    ▼
Frontend (React + MetaMask)
    │
    │ 2. Gửi request đến Backend API
    ▼
Backend (Spring Boot)
    │
    │ 3. Validate dữ liệu (địa chỉ, số dư)
    │ 4. Kiểm tra số dư trong Smart Contract
    │ 5. Tạo giao dịch với Web3j
    ▼
Web3j Library
    │
    │ 6. Ký giao dịch bằng private key
    │ 7. Gửi raw transaction lên blockchain
    ▼
Ethereum Network (Ganache/Sepolia)
    │
    │ 8. Validators xác minh giao dịch
    │ 9. Thực thi Smart Contract function
    │ 10. Cập nhật state trong contract
    │ 11. Emit event
    ▼
Blockchain State Updated
    │
    │ 12. Trả về transaction hash
    ▼
Backend
    │
    │ 13. Lưu transaction vào database (off-chain)
    │ 14. Chờ transaction receipt
    │ 15. Cập nhật status (SUCCESS/FAILED)
    ▼
Frontend
    │
    │ 16. Hiển thị kết quả cho user
    ▼
User nhận thông báo thành công/thất bại
```

### 2. Chi tiết các bước

#### Bước 1-2: User tương tác với Frontend
- User đăng nhập và kết nối MetaMask
- Nhập địa chỉ người nhận và số tiền
- Frontend validate địa chỉ Ethereum format

#### Bước 3-4: Backend validation
- Kiểm tra địa chỉ hợp lệ (độ dài, format)
- Kiểm tra số dư trong Smart Contract bằng cách gọi `getBalance()`
- Validate số tiền gửi <= số dư

#### Bước 5-7: Tạo và ký giao dịch
- Backend sử dụng Web3j để encode function call `sendPayment(address, uint256)`
- Ký giao dịch bằng private key của người gửi
- Tạo raw transaction với nonce, gas price, gas limit

#### Bước 8-11: Thực thi trên Blockchain
- Giao dịch được broadcast lên mạng Ethereum
- Miners/Validators xác minh và thêm vào block
- Smart Contract function `sendPayment()` được thực thi:
  - Kiểm tra số dư đủ (revert nếu không đủ)
  - Trừ số tiền từ người gửi
  - Cộng số tiền cho người nhận
  - Emit event PaymentSent

#### Bước 12-15: Xử lý kết quả
- Backend nhận transaction hash
- Lưu giao dịch vào PostgreSQL với status PENDING
- Chờ transaction receipt (polling hoặc WebSocket)
- Cập nhật status dựa trên receipt.status

#### Bước 16: Thông báo cho User
- Frontend nhận response từ Backend
- Hiển thị transaction hash và link đến Etherscan
- Hiển thị trạng thái giao dịch

## Cách hoạt động của Smart Contract

### State Variables

```solidity
mapping(address => uint256) private balances;
```

Mapping lưu trữ số dư của mỗi địa chỉ trong contract. Khi người dùng deposit, số dư tăng. Khi gửi tiền, số dư người gửi giảm và người nhận tăng.

### Security Features

1. **Access Control:** Sử dụng `msg.sender` để xác định người gọi function
2. **Balance Check:** Kiểm tra số dư trước khi cho phép giao dịch
3. **Address Validation:** Kiểm tra địa chỉ không phải zero address
4. **Self-transfer Prevention:** Không cho phép gửi tiền cho chính mình

### Gas Optimization

- Sử dụng `indexed` trong events để tối ưu gas khi filter
- Sử dụng mappings thay vì arrays cho O(1) lookup
- Compiler optimization với 200 runs

## Deployment

### Ganache (Local Development)

1. Khởi động Ganache trên port 7545
2. Copy private keys từ Ganache vào `hardhat.config.js`
3. Chạy: `npm run deploy:ganache`
4. Copy contract address vào `application.yml`

### Sepolia Testnet

1. Lấy Sepolia ETH từ faucet
2. Tạo Infura account và lấy API key
3. Set environment variables:
   ```
   INFURA_API_KEY=your_key
   PRIVATE_KEY=your_private_key
   ```
4. Chạy: `npm run deploy:sepolia`
5. Copy contract address vào `application.yml`

## Tích hợp với Backend

### Web3j Integration

Backend sử dụng Web3j để tương tác với Smart Contract:

1. **Connection:** Kết nối đến Ethereum node qua HTTP
2. **Function Encoding:** Encode function calls thành bytecode
3. **Transaction Signing:** Ký giao dịch bằng private key
4. **Transaction Sending:** Gửi raw transaction lên blockchain
5. **Event Listening:** Lắng nghe events từ contract (optional)

### Contract Address và ABI

- **Contract Address:** Lưu trong `application.yml` sau khi deploy
- **ABI:** Được generate khi compile contract, copy vào resources nếu cần

## Best Practices

1. **Private Key Management:** Không lưu private key trong code. Sử dụng environment variables hoặc secure vault
2. **Error Handling:** Xử lý đầy đủ các lỗi từ blockchain (revert, out of gas, etc.)
3. **Gas Estimation:** Estimate gas trước khi gửi transaction
4. **Transaction Confirmation:** Chờ đủ confirmations trước khi coi là thành công
5. **Event Logging:** Lưu events vào database để query nhanh hơn

## Troubleshooting

### Transaction bị revert
- Kiểm tra số dư đủ
- Kiểm tra địa chỉ hợp lệ
- Kiểm tra gas limit đủ

### Không kết nối được blockchain
- Kiểm tra network URL đúng
- Kiểm tra node đang chạy
- Kiểm tra firewall/network

### Balance không cập nhật
- Đợi transaction được confirm
- Kiểm tra transaction receipt status
- Verify transaction trên Etherscan

## Tài liệu tham khảo

- [Solidity Documentation](https://docs.soliditylang.org/)
- [Web3j Documentation](https://docs.web3j.io/)
- [Ethereum Developer Resources](https://ethereum.org/en/developers/)
- [MetaMask Documentation](https://docs.metamask.io/)