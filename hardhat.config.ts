import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { config as dotenvConfig } from "dotenv"

dotenvConfig();

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: {
        mnemonic: process.env.MNEMONIC || ""
      },
      gasPrice: 20000000000, // 20 gwei
    }
  },
};

export default config;
