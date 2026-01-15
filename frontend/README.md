# ChainPay Frontend

Frontend application cho hệ thống thanh toán P2P ChainPay sử dụng ReactJS.

## Công nghệ

- React 18.2.0
- React Router 6.20.0
- Axios 1.6.2
- Web3 4.3.0
- MetaMask Integration
- Vite 5.0.8

## Cài đặt

### 1. Yêu cầu

- Node.js 18+
- npm hoặc yarn

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Chạy development server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

### 4. Build production

```bash
npm run build
```

## Cấu trúc

```
frontend/
├── src/
│   ├── components/       # React components
│   │   ├── MetaMaskConnect.jsx
│   │   ├── SendPayment.jsx
│   │   ├── TransactionHistory.jsx
│   │   ├── BalanceCheck.jsx
│   │   └── PrivateRoute.jsx
│   ├── contexts/         # React contexts
│   │   ├── AuthContext.jsx
│   │   └── MetaMaskContext.jsx
│   ├── pages/            # Page components
│   │   ├── Login.jsx
│   │   └── Dashboard.jsx
│   ├── App.jsx           # Main App component
│   └── main.jsx          # Entry point
└── package.json
```

## Tính năng

- Đăng nhập / Xác thực JWT
- Kết nối MetaMask wallet
- Gửi tiền P2P
- Xem lịch sử giao dịch
- Kiểm tra số dư

## Cấu hình

Đảm bảo backend API đang chạy tại `http://localhost:8080` hoặc cập nhật proxy trong `vite.config.js`.