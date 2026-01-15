# ChainPay Smart Contracts

## Mô tả
Smart Contract cho hệ thống thanh toán P2P trên Ethereum Blockchain.

## Cài đặt

```bash
npm install
```

## Biên dịch

```bash
npm run compile
```

## Test

```bash
npm run test
```

## Deploy

### Deploy lên Ganache (Local)

1. Khởi động Ganache trên port 7545
2. Cập nhật private keys trong `hardhat.config.js`
3. Chạy:
```bash
npm run deploy:ganache
```

### Deploy lên Sepolia Testnet

1. Tạo file `.env` với:
```
INFURA_API_KEY=your_infura_api_key
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key (optional)
```

2. Chạy:
```bash
npm run deploy:sepolia
```

## ABI

Sau khi compile, ABI sẽ được tạo tại: `artifacts/ChainPay.sol/ChainPay.json`

Copy file ABI này để sử dụng trong Backend.