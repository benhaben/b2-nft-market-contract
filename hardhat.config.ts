import { extendEnvironment, HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-abi-exporter";
import "@nomicfoundation/hardhat-verify";
import "hardhat-spdx-license-identifier"
import { logger } from "./scripts/utilities/log";
import { config as dotEnvConfig } from "dotenv";
import path from "path";
import "@ericxstone/hardhat-blockscout-verify";
import {SOLIDITY_VERSION, EVM_VERSION} from "@ericxstone/hardhat-blockscout-verify";

if (process.env.NODE_ENV) {
  const pathOfEnv = path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`);
  logger.debug(`pathOfEnv: ${pathOfEnv}`);
  dotEnvConfig({ path: pathOfEnv });
}else{
  dotEnvConfig()
}

if (process.env.NODE_ENV === "l2") {
  process.env.HARDHAT_NETWORK = "l2"
}

require("./scripts/tasks");
console.log(`${process.env.ETHERSCAN_API_KEY}`)
const config: HardhatUserConfig = {
  abiExporter: [
    {
      runOnCompile: true,
      clear: true,
      flat: true,
      path: "./abi/pretty",
      pretty: true
    },
    {
      runOnCompile: true,
      clear: true,
      flat: true,
      path: "./abi/ugly",
      pretty: false
    }
  ],
  sourcify: {
    enabled: false
  },
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          evmVersion: "paris",
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  networks: {
    l2: {
      url: `${process.env.L2_URL}`,
      // PRIVATE_KEY loaded from .env file
      accounts: [`0x${process.env.PRIVATE_KEY}`]
    },
    goerli: {
      // Ankr's Public RPC URL https://rpc.ankr.com/eth_goerli
      url: "https://api-goerli.etherscan.io/api",
      // PRIVATE_KEY loaded from .env file
      accounts: [`0x${process.env.PRIVATE_KEY}`]
    },
    mainnet: {
      url: `${process.env.L2_URL}`,
      // PRIVATE_KEY loaded from .env file
      accounts: [`0x${process.env.PRIVATE_KEY}`]
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD"
  },
  spdxLicenseIdentifier: {
    overwrite: false,
    runOnCompile: true,
  },
  etherscan: {
    apiKey: `${process.env.ETHERSCAN_API_KEY}`, // Your Etherscan API key
  },
  blockscoutVerify: {
    blockscoutURL: `${process.env.B_URL}`,
    contracts: {
      "B2NFTFactory": {
        compilerVersion: "v0.8.20+commit.a1b79de6", // checkout enum SOLIDITY_VERSION
        optimization: true,
        evmVersion: "shanghai", // checkout enum EVM_VERSION
        optimizationRuns: 200,
      },
    },
  },
};
export default config;
