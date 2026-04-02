const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    ganache: {
      url: process.env.CHAINPAY_RPC_URL || process.env.GANACHE_RPC_URL,
      accounts: (process.env.CHAINPAY_ADMIN_PRIVATE_KEY || process.env.GANACHE_PRIVATE_KEY)
        ? [process.env.CHAINPAY_ADMIN_PRIVATE_KEY || process.env.GANACHE_PRIVATE_KEY]
        : []
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
