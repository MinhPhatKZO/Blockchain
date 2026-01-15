# ChainPay API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication

Tất cả các API endpoints (trừ `/auth/login` và `/auth/register`) yêu cầu JWT token trong header:

```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Authentication

#### POST `/auth/login`
Đăng nhập và nhận JWT token.

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "user123",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "message": "Invalid username or password"
}
```

---

### 2. Payment

#### POST `/payment/send`
Gửi tiền P2P từ ví của user hiện tại đến địa chỉ khác.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "toAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": "1000000000000000000"
}
```

**Lưu ý:** `amount` phải là giá trị Wei (1 ETH = 10^18 Wei)

**Response (200 OK):**
```json
{
  "txHash": "0x1234567890abcdef...",
  "fromAddress": "0x...",
  "toAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": "1000000000000000000",
  "status": "SUCCESS",
  "message": "Payment sent successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "Insufficient balance"
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "Invalid recipient address"
}
```

---

#### GET `/payment/balance`
Lấy số dư của user hiện tại từ Smart Contract.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "balance": "5000000000000000000",
  "balanceInEther": "5.0"
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "Wallet address not set"
}
```

---

#### GET `/payment/balance/{address}`
Lấy số dư của một địa chỉ cụ thể từ Smart Contract.

**Path Parameters:**
- `address` (string): Địa chỉ Ethereum

**Response (200 OK):**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "balance": "5000000000000000000",
  "balanceInEther": "5.0"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "message": "Error: Failed to get balance"
}
```

---

#### GET `/payment/history`
Lấy lịch sử giao dịch của user hiện tại.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "fromAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "toAddress": "0x1234567890123456789012345678901234567890",
    "amount": "1000000000000000000",
    "txHash": "0xabcdef1234567890...",
    "status": "SUCCESS",
    "createdAt": "2024-01-01T12:00:00",
    "confirmedAt": "2024-01-01T12:01:00"
  },
  {
    "id": 2,
    "fromAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "toAddress": "0x9876543210987654321098765432109876543210",
    "amount": "2000000000000000000",
    "txHash": "0x...",
    "status": "PENDING",
    "createdAt": "2024-01-01T13:00:00",
    "confirmedAt": null
  }
]
```

**Response (200 OK) - Empty:**
```json
[]
```

---

### 3. Health Check

#### GET `/health`
Kiểm tra trạng thái của service.

**Response (200 OK):**
```json
{
  "status": "UP",
  "service": "ChainPay Backend"
}
```

---

## Error Codes

- `400 Bad Request` - Request không hợp lệ (thiếu thông tin, định dạng sai, số dư không đủ)
- `401 Unauthorized` - Thiếu hoặc token không hợp lệ
- `500 Internal Server Error` - Lỗi server (kết nối blockchain, database, etc.)

## Notes

1. Tất cả số tiền được tính bằng **Wei** (1 ETH = 10^18 Wei)
2. Địa chỉ Ethereum phải bắt đầu với `0x` và có độ dài 42 ký tự
3. Transaction hash có thể được sử dụng để xem chi tiết trên Etherscan
4. JWT token có thời hạn 24 giờ (mặc định)