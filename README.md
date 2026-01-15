# ChainPay - P2P Payment trên Blockchain

Hệ thống thanh toán P2P (Peer-to-Peer) được xây dựng trên Ethereum Blockchain với Smart Contract, Backend Spring Boot và Frontend ReactJS.

## 🚀 Tính năng

- ✅ Smart Contract Solidity cho P2P Payment
- ✅ Kiểm tra số dư ví
- ✅ Ghi nhận lịch sử giao dịch với Events
- ✅ Backend API với Spring Boot, Spring Security, JWT
- ✅ Tích hợp Web3j để kết nối Blockchain
- ✅ Frontend ReactJS với MetaMask integration
- ✅ Gửi tiền P2P
- ✅ Xem lịch sử giao dịch
- ✅ Kiểm tra số dư

## 📁 Cấu trúc Project

```
blockchain/
├── contracts/          # Smart Contracts (Solidity)
│   ├── ChainPay.sol
│   ├── test/
│   └── scripts/
├── backend/            # Backend Service (Spring Boot)
│   └── src/main/java/com/chainpay/
├── frontend/           # Frontend Application (ReactJS)
│   └── src/
├── API_DOCUMENTATION.md
└── BLOCKCHAIN_DOCUMENTATION.md
```

## 🛠️ Công nghệ sử dụng

### Smart Contract
- **Blockchain:** Ethereum
- **Ngôn ngữ:** Solidity 0.8.20
- **Framework:** Hardhat
- **Môi trường:** Ganache (Local), Sepolia (Testnet)

### Backend
- **Framework:** Spring Boot 3.2.0
- **Security:** Spring Security + JWT
- **Blockchain Integration:** Web3j 4.9.8
- **Database:** PostgreSQL
- **Build Tool:** Maven

### Frontend
- **Framework:** React 18.2.0
- **Router:** React Router 6.20.0
- **HTTP Client:** Axios 1.6.2
- **Blockchain:** Web3 4.3.0
- **Wallet:** MetaMask Integration
- **Build Tool:** Vite 5.0.8

## 📋 Yêu cầu hệ thống

- Node.js 18+
- Java 17+
- Maven 3.8+
- PostgreSQL 12+
- Ganache hoặc Ethereum Testnet access

## 🚀 Cài đặt và Chạy

### 1. Smart Contract

```bash
cd contracts
npm install
npm run compile
npm run test
```

**Deploy lên Ganache:**
```bash
npm run deploy:ganache
```

**Deploy lên Sepolia Testnet:**
```bash
# Set environment variables first
export INFURA_API_KEY=your_key
export PRIVATE_KEY=your_private_key

npm run deploy:sepolia
```

### 2. Backend

```bash
cd backend

# Tạo database PostgreSQL
createdb chainpay

# Cập nhật application.yml với:
# - Database credentials
# - Contract address (sau khi deploy)
# - Blockchain network URL
# - Private key (secure storage recommended)

# Build và run
mvn clean install
mvn spring-boot:run
```

Backend sẽ chạy tại `http://localhost:8080`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại `http://localhost:3000`

## 📝 Cấu hình

### Backend Configuration (`application.yml`)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/chainpay
    username: postgres
    password: your_password

blockchain:
  network-url: http://127.0.0.1:7545  # Ganache hoặc Sepolia endpoint
  contract-address: 0x...  # Contract address sau khi deploy
  private-key: 0x...  # Private key để ký giao dịch

jwt:
  secret: your-secret-key-min-256-bits
  expiration: 86400000
```

## 🧪 Testing

### Smart Contract Tests

```bash
cd contracts
npm run test
```

### Backend API Tests

Sử dụng Postman hoặc curl để test các endpoints. Xem `API_DOCUMENTATION.md` để biết chi tiết.

## 📚 Tài liệu

- [API Documentation](./API_DOCUMENTATION.md) - Chi tiết về các API endpoints
- [Blockchain Documentation](./BLOCKCHAIN_DOCUMENTATION.md) - Mô tả Smart Contract và luồng giao dịch
- [Contracts README](./contracts/README.md) - Hướng dẫn deploy Smart Contract
- [Backend README](./backend/README.md) - Hướng dẫn Backend
- [Frontend README](./frontend/README.md) - Hướng dẫn Frontend

## 🔐 Bảo mật

**Lưu ý quan trọng:**
- Không commit private keys vào git
- Sử dụng environment variables cho sensitive data
- Trong production, sử dụng Key Management Service (KMS) hoặc Hardware Security Module (HSM)
- Hiện tại `PaymentService.getPrivateKeyForUser()` là placeholder - cần implement secure key management

## 🗺️ Luồng hoạt động

1. User đăng nhập qua Frontend
2. Kết nối MetaMask wallet
3. Backend validate và kiểm tra số dư
4. Tạo giao dịch với Web3j
5. Ký và gửi transaction lên Blockchain
6. Chờ confirmation và cập nhật database
7. Hiển thị kết quả cho user

Chi tiết xem [BLOCKCHAIN_DOCUMENTATION.md](./BLOCKCHAIN_DOCUMENTATION.md)

## 🤝 Đóng góp

Project này được tạo cho mục đích học tập và nghiên cứu. Để cải thiện:

1. Implement user registration
2. Thêm secure key management
3. Implement WebSocket cho real-time updates
4. Thêm transaction confirmation tracking
5. Improve error handling và UX

## 📄 License

MIT License

## 👥 Nhóm

Nhóm 1: ChainPay - Web P2P Payment trên Blockchain

---

**Lưu ý:** Đây là project demo/educational. Không sử dụng trong production mà không có security audit đầy đủ.