# ChainPay - Hướng dẫn Triển khai

## Tổng quan

Hướng dẫn từng bước để triển khai hệ thống ChainPay hoàn chỉnh.

## Bước 1: Setup Smart Contract

### 1.1. Cài đặt Ganache (Local)

1. Download và cài đặt Ganache từ https://trufflesuite.com/ganache/
2. Khởi động Ganache trên port 7545
3. Ghi lại private keys của các accounts

### 1.2. Cài đặt Dependencies

```bash
cd contracts
npm install
```

### 1.3. Cấu hình Hardhat

Mở `contracts/hardhat.config.js` và cập nhật private keys:

```javascript
ganache: {
  url: "http://127.0.0.1:7545",
  accounts: [
    "0xYourGanachePrivateKey1",
    "0xYourGanachePrivateKey2"
  ]
}
```

### 1.4. Compile và Test

```bash
npm run compile
npm run test
```

### 1.5. Deploy Smart Contract

**Deploy lên Ganache:**
```bash
npm run deploy:ganache
```

**Deploy lên Sepolia Testnet:**

1. Tạo file `.env` trong thư mục `contracts/`:
```
INFURA_API_KEY=your_infura_api_key
PRIVATE_KEY=your_private_key_with_sepolia_eth
ETHERSCAN_API_KEY=your_etherscan_api_key
```

2. Deploy:
```bash
npm run deploy:sepolia
```

3. **Quan trọng:** Copy contract address từ output và lưu lại để dùng trong Backend

### 1.6. Lấy ABI

Sau khi compile, ABI được tạo tại:
```
contracts/artifacts/ChainPay.sol/ChainPay.json
```

Copy file này để reference nếu cần (Backend sử dụng Web3j dynamic loading).

## Bước 2: Setup Database

### 2.1. Cài đặt PostgreSQL

1. Cài đặt PostgreSQL 12+ nếu chưa có
2. Khởi động PostgreSQL service

### 2.2. Tạo Database

```sql
CREATE DATABASE chainpay;
```

Hoặc sử dụng psql:
```bash
createdb chainpay
```

### 2.3. Tạo User (Optional)

```sql
CREATE USER chainpay_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE chainpay TO chainpay_user;
```

## Bước 3: Setup Backend

### 3.1. Cài đặt Java và Maven

- Java 17+ (OpenJDK hoặc Oracle JDK)
- Maven 3.8+

Kiểm tra:
```bash
java -version
mvn -version
```

### 3.2. Cấu hình Application

Tạo file `backend/src/main/resources/application-local.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/chainpay
    username: postgres
    password: your_password
  
  jpa:
    hibernate:
      ddl-auto: update

blockchain:
  network-url: http://127.0.0.1:7545  # Ganache hoặc https://sepolia.infura.io/v3/YOUR_KEY
  contract-address: 0x...  # Contract address từ bước deploy
  private-key: 0x...  # Private key của account dùng để ký giao dịch
  gas-price: 20000000000
  gas-limit: 3000000

jwt:
  secret: your-secret-key-minimum-256-bits-change-in-production
  expiration: 86400000  # 24 hours
```

**⚠️ QUAN TRỌNG - Private Key Management:**

Hiện tại `PaymentService.getPrivateKeyForUser()` là placeholder. Bạn cần implement một trong các phương án sau:

1. **Environment Variable** (cho demo):
   - Lưu private key trong environment variable
   - Backend đọc từ env khi cần

2. **Database** (không khuyến nghị cho production):
   - Lưu encrypted private keys trong database
   - Decrypt khi cần sử dụng

3. **Key Management Service** (khuyến nghị cho production):
   - AWS KMS, Azure Key Vault, HashiCorp Vault
   - Store keys securely và retrieve khi cần

4. **Hardware Security Module** (best practice):
   - Sử dụng HSM cho key management
   - Keys không bao giờ rời khỏi HSM

### 3.3. Build và Run Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

Backend sẽ chạy tại `http://localhost:8080`

### 3.4. Kiểm tra Backend

```bash
curl http://localhost:8080/api/health
```

Expected response:
```json
{
  "status": "UP",
  "service": "ChainPay Backend"
}
```

### 3.5. Tạo User (Optional - nếu có API register)

Hiện tại chưa có API register. Bạn có thể tạo user trực tiếp trong database:

```sql
INSERT INTO users (username, password, wallet_address, created_at)
VALUES (
  'testuser',
  '$2a$10$...',  -- BCrypt hash của password
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',  -- Optional
  NOW()
);
```

Hoặc implement register endpoint (TODO trong AuthController).

## Bước 4: Setup Frontend

### 4.1. Cài đặt Node.js

- Node.js 18+
- npm hoặc yarn

### 4.2. Cài đặt Dependencies

```bash
cd frontend
npm install
```

### 4.3. Cấu hình

Đảm bảo `frontend/vite.config.js` có proxy đúng:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true
  }
}
```

### 4.4. Cài đặt MetaMask

1. Cài đặt MetaMask extension trong browser
2. Tạo hoặc import wallet
3. Kết nối với network phù hợp:
   - **Ganache:** Thêm Custom Network với RPC URL: `http://127.0.0.1:7545`
   - **Sepolia:** Chọn Sepolia Test Network

### 4.5. Run Frontend

```bash
npm run dev
```

Frontend sẽ chạy tại `http://localhost:3000`

## Bước 5: Test hệ thống

### 5.1. Test Flow cơ bản

1. **Đăng nhập:**
   - Mở `http://localhost:3000`
   - Đăng nhập với user đã tạo
   - Nhận JWT token

2. **Kết nối MetaMask:**
   - Click "MetaMask" tab
   - Click "Connect MetaMask"
   - Approve connection trong MetaMask

3. **Kiểm tra số dư:**
   - Click "Balance" tab
   - Xem số dư trong MetaMask và Contract

4. **Gửi Payment:**
   - Click "Send Payment" tab
   - Nhập địa chỉ người nhận
   - Nhập số tiền (ETH)
   - Click "Send Payment"
   - Approve transaction trong MetaMask (nếu cần)
   - Chờ confirmation

5. **Xem lịch sử:**
   - Click "Transaction History" tab
   - Xem danh sách giao dịch

### 5.2. Test với Postman/curl

Xem `API_DOCUMENTATION.md` cho các ví dụ API calls.

## Troubleshooting

### Backend không kết nối được Blockchain

- Kiểm tra network URL đúng
- Kiểm tra Ganache/Sepolia node đang chạy
- Kiểm tra contract address đúng
- Kiểm tra private key đúng format (bắt đầu với 0x)

### Frontend không kết nối được Backend

- Kiểm tra Backend đang chạy tại port 8080
- Kiểm tra CORS configuration
- Kiểm tra proxy trong vite.config.js

### MetaMask connection issues

- Kiểm tra MetaMask extension đã cài đặt
- Kiểm tra network đúng (Ganache/Sepolia)
- Refresh page và thử lại
- Check browser console cho errors

### Transaction bị revert

- Kiểm tra số dư đủ
- Kiểm tra địa chỉ hợp lệ (42 chars, bắt đầu 0x)
- Kiểm tra gas limit đủ
- Kiểm tra contract address đúng

### Database connection issues

- Kiểm tra PostgreSQL đang chạy
- Kiểm tra database credentials
- Kiểm tra database đã được tạo
- Check application logs cho errors

## Production Deployment Considerations

### 1. Security

- ✅ Sử dụng HTTPS
- ✅ Thay đổi JWT secret mạnh
- ✅ Implement rate limiting
- ✅ Validate và sanitize inputs
- ✅ Use secure key management (KMS/HSM)
- ✅ Enable CORS cho domain cụ thể
- ✅ Use environment variables cho configs

### 2. Performance

- ✅ Database connection pooling
- ✅ Caching cho frequent queries
- ✅ Index database tables
- ✅ Optimize Smart Contract gas usage
- ✅ Use CDN cho Frontend static assets

### 3. Monitoring

- ✅ Logging (ELK stack, CloudWatch)
- ✅ Error tracking (Sentry)
- ✅ Transaction monitoring (Etherscan API)
- ✅ Health check endpoints
- ✅ Metrics collection (Prometheus, Grafana)

### 4. Scalability

- ✅ Load balancing cho Backend
- ✅ Database replication
- ✅ Use message queue cho async operations
- ✅ Consider using IPFS cho large data
- ✅ Optimize blockchain calls

## Support

Nếu gặp vấn đề, kiểm tra:
1. Logs trong Backend console
2. Browser console cho Frontend errors
3. Ganache logs cho blockchain transactions
4. PostgreSQL logs cho database issues

Xem thêm:
- [API Documentation](./API_DOCUMENTATION.md)
- [Blockchain Documentation](./BLOCKCHAIN_DOCUMENTATION.md)
- [README](./README.md)