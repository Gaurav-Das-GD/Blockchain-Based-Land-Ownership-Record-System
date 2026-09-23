import type { HardhatUserConfig } from "hardhat/config";
import HardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  plugins: [HardhatToolboxMochaEthers],
  networks: {
    sepolia: {
      type: "http",
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545",
    },
  },
};

export default config;