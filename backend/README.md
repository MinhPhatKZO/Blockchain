# ChainPay Backend

Backend service cho hệ thống thanh toán P2P ChainPay.

## Công nghệ

- Java 17
- Spring Boot 3.2.0
- Spring Security + JWT
- Web3j 4.9.8
- PostgreSQL
- Maven

## Cài đặt

### 1. Yêu cầu

- Java 17+
- Maven 3.8+
- PostgreSQL 12+

### 2. Database Setup

Tạo database:

```sql
CREATE DATABASE chainpay;
```

### 3. Configuration

Tạo file `application-local.yml` hoặc set environment variables:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/chainpay
    username: postgres
    password: your_password

blockchain:
  network-url: http://127.0.0.1:7545  # Ganache hoặc Sepolia endpoint
  contract-address: 0x...  # Địa chỉ Smart Contract sau khi deploy
  private-key: 0x...  # Private key để ký giao dịch

jwt:
  secret: your-secret-key-min-256-bits
  expiration: 86400000
```

### 4. Build và Run

```bash
mvn clean install
mvn spring-boot:run
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký (TODO)

### Payment

- `POST /api/payment/send` - Gửi tiền P2P
- `GET /api/payment/balance` - Kiểm tra số dư (của user hiện tại)
- `GET /api/payment/balance/{address}` - Kiểm tra số dư theo địa chỉ
- `GET /api/payment/history` - Lấy lịch sử giao dịch

### Health

- `GET /api/health` - Health check

## API Documentation

Xem file `API_DOCUMENTATION.md` để biết chi tiết về request/response format.