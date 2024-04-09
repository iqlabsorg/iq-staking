import hre from 'hardhat';
import { expect } from 'chai';
import { ethers, run } from 'hardhat';
import { BigNumberish, Signer, formatUnits, id } from 'ethers';
import { IQNftStaking, ERC721Mock, ERC20Mock } from '../typechain';
// import { ERC721Mock } from '@iqprotocol/iq-space-protocol/typechain';


describe('IQ NFT Staking Contract', function () {

  const POOL_SIZE = ethers.parseEther('100000');
  const REWARD_RATE = ethers.parseEther('100');
  const REWARD_FREQUENCY = 3600;

  let deployer: Signer;
  let proofSource: Signer;
  let nftStaking: IQNftStaking;
  let nftCollection: ERC721Mock;
  let staker: Signer;


  beforeEach(async function () {
    [deployer, staker, proofSource] = await ethers.getSigners();

    //Deploy ERC721Mock
    nftCollection = (await hre.run('deploy:nft-mock', {
    })) as ERC721Mock;

    //Deploy IQ NFT Staking
    nftStaking = (await run('deploy:nft-staking', {
      proofSource: await proofSource.getAddress(),
      nftCollectionAddress: (await nftCollection.getAddress()).toString(),
      rewardRate: REWARD_RATE.toString(),
      rewardFrequency: REWARD_FREQUENCY.toString(),
    })) as IQNftStaking;

    const deployerAddress = await deployer.getAddress();
  });

  describe('Deployment & Initialization', function () {
    // Ensure correct deployed and configurations initialization.

    it('Camaping should be deactivated after deployment', async function () {
      expect(await nftStaking.isStakingActive()).to.equal(false);
    });

    it('getRewardRate should show actual reward rate', async function () {
      expect(await nftStaking.getRewardRate()).to.equal(REWARD_RATE);
    });

    it('getRewardFrequency should show actual reward frequency', async function () {
      expect(await nftStaking.getRewardFrequency()).to.equal(REWARD_FREQUENCY);
    });

    it('showMaxPoolSize should show be zero', async function () {
      expect(await nftStaking.showMaxPoolSize()).to.equal(0);
    });

  });

  describe('Pool Initialization', function () {

    let rewardToken: ERC20Mock;

    beforeEach(async function () {

      //Deploy ERC20Mock and mint pool size to deployer address
      rewardToken = (await hre.run('deploy:token-mock', {
        initialSupply: POOL_SIZE.toString(),
      })) as ERC20Mock;

      await rewardToken.approve(nftStaking, POOL_SIZE);
    });

    it('depositRewardTokens should deposit tokens correctly', async function () {

      const currentTimestamp = await ethers.provider.getBlock('latest').then(b => b.timestamp);

      await expect(nftStaking.depositRewardTokens(rewardToken, POOL_SIZE))
    .to.emit(nftStaking, 'TokensDeposited')
    .withArgs(rewardToken, POOL_SIZE, currentTimestamp+1);

      expect(await nftStaking.showMaxPoolSize()).to.equal(POOL_SIZE);
      expect(await nftStaking.totalTokensLeft()).to.equal(POOL_SIZE);
      expect(await nftStaking.isStakingActive()).to.equal(true);
    });

    it('depositRewardTokens should prevent deposits once the pool is already funded', async function () {

      await nftStaking.depositRewardTokens(rewardToken, POOL_SIZE);

      await expect(nftStaking.depositRewardTokens(rewardToken, Math.floor(Math.random() * 10000)))
    .to.revertedWithCustomError(nftStaking, 'PoolAlreadyFunded');
    });

    it('depositRewardTokens should prevent zero tokens funding', async function () {

      await expect(nftStaking.depositRewardTokens(rewardToken, 0))
    .to.revertedWithCustomError(nftStaking, 'PoolSizeMustBePositive');

    });


  });
});
