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
import './tasks/deploy-staking-manager';



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
    amoy: {
      url: `https://polygon-amoy.g.alchemy.com/v2/${env.parsed?.ALCHEMY_URL}`,
      accounts,
      timeout: 40000,
    },
    ancient8Testnet: {
      url: 'https://rpcv2-testnet.ancient8.gg',
      accounts,
      timeout: 40000,
    },
    arbitrumOne: {
      url: `https://arb-mainnet.g.alchemy.com/v2/${env.parsed?.ALCHEMY_URL}`,
      accounts,
      timeout: 40000,
    },
    arbitrumSepolia: {
      url: `https://arb-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_URL}`,
      accounts,
      timeout: 40000,
    },
  },
  etherscan: {
    apiKey: {
      arbitrumOne: env.parsed?.ETHERSCAN_API_KEY_ARB,
      amoy: env.parsed?.ETHERSCAN_API_KEY_POLYGON,
      arbitrumSepolia: env.parsed?.ETHERSCAN_API_KEY_ARB,
    },
    customChains: [
      {
        network: 'arbitrumSepolia',
        chainId: 421614,
        urls: {
          apiURL: 'https://api-sepolia.arbiscan.io/api',
          browserURL: 'https://sepolia.arbiscan.io/',
        }
      },
      {
        network: "ancient8Testnet",
        chainId: 28122024,
        urls: {
          apiURL: "https://scanv2-testnet.ancient8.gg/api/",
          browserURL: "https://scanv2-testnet.ancient8.gg/"
        }
      },
      {
        network: "amoy",
        chainId: 80002,
        urls: {
          apiURL: 'https://api-amoy.polygonscan.com/api',
          browserURL: 'https://amoy.polygonscan.com',
        }
      },
      {
        network: "arbitrumOne",
        chainId: 42161,
        urls: {
          apiURL: 'https://api.arbiscan.io/api',
          browserURL: 'https://arbiscan.io',
        }
      }
    ]
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
