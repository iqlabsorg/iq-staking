# IQ NFT Staking

**IQNftStaking.sol** is a smart contract designed for IQ NFT Staking platform with a focus on enhancing user experience through efficient gas optimization and secure reward distribution. This contract is built on the assumption of a web 2.5 architecture, where an API handles stake earnings calculation, ensuring a seamless staking process for users.

## Running the Repository

- **Clone the Repository**: `git clone https://github.com/iqlabsorg/iq-staking.git`
- **Setup dependencies**: Navigate to the repository directory and run: `cd iq-staking`, `yarn install` & `yarn compile`
- **Execute Tests**: To run tests use: `yarn hardhat test`
- **Deploying the Staking Contract**:
Fill **.env** and use the following command:  
`yarn hardhat deploy:nft-staking --network *** --proof-source 0x000 --nft-collection-address 0x000`  
Where `***` is the network name, and `0x000` corresponds to the proof source and ERC721 collection address.

## Staking Requirements

- **ERC721 NFTs**: Only ERC721-compliant NFTs can be used for staking. Ensure that the NFTs you intend to stake adhere to the ERC721 standard.

## Reward Token

- **ERC20 Compatibility**: Accepts ERC20 tokens as rewards, ensuring compatibility with various digital assets.
- **Transparent Reward Distribution**: Rewards stakers based on exact earnings of their staked NFTs during the staking period.

## Reward Rate & Frequency

- **Customizable Parameters**: Stakers earn rewards based on `rewardRate` and `rewardFrequency` parameters set during the `depositRewardTokens` function call.
- **Fair Reward Distribution**: Rewards are accrued at the specified rate and frequency, ensuring fairness and transparency.

## Staking Owner User Flow

- **Activation Process**: Contract activation involves deploying with parameters like proofSource (backend for EIP712 signatures) and nftCollectionAddress (eligible ERC721 collection).
- **Deposit Funds**: Owners deposit funds through `depositRewardTokens` function with parameters including `rewardTokenAddress`, `tokensPoolSize`, `rewardRate`, and `rewardFrequency`.
- **Deactivation Process**: Upon deactivating the staking pool with `deactivateStaking`, tokens earned by users become locked for security. Owners can withdraw only remaining tokens to maintain fairness and prevent excess withdrawal.

## Staker User Flow

- **Staking Process**: Stakers stake their NFTs, becoming eligible for rewards based on predefined parameters.
- **Claiming Rewards**: Stakers can claim accrued rewards at any time, ensuring up-to-date and fair reward distributions.
- **Withdrawing Staked NFTs**: Stakers can withdraw their staked NFTs at any time.
