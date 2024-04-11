import { HardhatUserConfig } from 'hardhat/config';
import '@typechain/hardhat';
import 'hardhat-deploy';
import '@nomicfoundation/hardhat-chai-matchers';
import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-verify';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-gas-reporter';
import * as dotenv from 'dotenv';

const env = dotenv.config();

// import tasks here';
import './tasks/deploy-nft-staking';
import './tasks/deploy-nft-mock';
import './tasks/deploy-token-mock';



const DEPLOYMENT_PRIVATE_KEY = env.parsed?.DEPLOYMENT_PRIVATE_KEY;
const accounts = DEPLOYMENT_PRIVATE_KEY ? [DEPLOYMENT_PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  gasReporter: {
    enabled: Boolean(process.env.REPORT_GAS),
    currency: 'USD',
  },
  namedAccounts: {
    deployer: 0,
  },
  networks: {
    ethereum: {
      url: `https://rpc.ankr.com/eth/${env.parsed?.ANKR_PROJECT_KEY}`,
      accounts,
      timeout: 40000,
    },
    sepolia: {
      url: `https://rpc.ankr.com/eth_sepolia/${env.parsed?.ANKR_PROJECT_KEY}`,
      accounts,
      timeout: 40000,
    },
    mumbai: {
      url: `https://rpc.ankr.com/polygon_mumbai/${env.parsed?.ANKR_PROJECT_KEY}`,
      accounts,
      timeout: 40000,
    },
    polygon: {
      url: `https://rpc.ankr.com/polygon/${env.parsed?.ANKR_PROJECT_KEY}`,
      accounts,
      timeout: 40000,
    },
  },
  etherscan: {
    apiKey: env.parsed?.ETHERSCAN_API_KEY,
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: false,
  },
  gasReporter: {
    enabled: env.parsed?.REPORT_GAS !== undefined,
    currency: 'USD',
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
    // cache: './node_modules/@openzeppelin/contracts-upgradeable',
  },
  external: {
    contracts: [
      {
        artifacts: 'node_modules/@iqprotocol/iq-space-protocol/artifacts',
        deploy: 'node_modules/@iqprotocol/iq-space-protocol/deploy',
      },
    ],
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v6',
  },
};

export default config;
