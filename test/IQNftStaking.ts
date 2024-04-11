import hre from 'hardhat';
import { expect } from 'chai';
import { ethers, run } from 'hardhat';
import { BigNumberish, Signer, formatUnits, id } from 'ethers';
import { IQNftStaking, ERC721Mock, ERC20Mock } from '../typechain';

async function signAndWithdrawTokens(
  nftStaking: IQNftStaking,
  proofSource: Signer,
  withdrawer: Signer,
  amount: BigNumberish,
): Promise<string> {
  const withdrawerAddress = await withdrawer.getAddress();
  const nonce = await nftStaking.nonceCounter(withdrawer);

  const domain = {
    name: 'IQNftStaking',
    version: '1',
    chainId: (await ethers.provider.getNetwork()).chainId,
    verifyingContract: await nftStaking.getAddress(),
  };

  const types = {
    WithdrawRewardTokens: [
      { name: 'withdrawer', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
    ],
  };

  const message = {
    withdrawer: withdrawerAddress,
    amount: amount.toString(),
    nonce: nonce.toString(),
  };

  const signature = await proofSource.signTypedData(domain, types, message);

  await nftStaking.connect(withdrawer).withdrawRewardTokens(amount, signature);

  return signature;
}

async function signAndStakeNfts(
  nftStaking: IQNftStaking,
  proofSource: Signer,
  staker: Signer,
  tokenIds: BigNumberish[],
): Promise<string> {
  const stakerAddress = await staker.getAddress();
  const nonce = await nftStaking.nonceCounter(staker);

  const domain = {
    name: 'IQNftStaking',
    version: '1',
    chainId: (await ethers.provider.getNetwork()).chainId,
    verifyingContract: await nftStaking.getAddress(),
  };

  const types = {
    Stake: [
      { name: 'staker', type: 'address' },
      { name: 'nonce', type: 'uint256' },
      { name: 'tokenIds', type: 'uint256[]' },
    ],
  };

  const message = {
    staker: stakerAddress,
    nonce: nonce.toString(),
    tokenIds: tokenIds,
  };

  const signature = await proofSource.signTypedData(domain, types, message);

  await nftStaking.connect(staker).stake(tokenIds, signature);

  return signature;
}

async function signAndWithdrawNfts(
  nftStaking: IQNftStaking,
  proofSource: Signer,
  staker: Signer,
  tokenIds: BigNumberish[],
): Promise<string> {
  const stakerAddress = await staker.getAddress();
  const nonce = await nftStaking.nonceCounter(staker);

  const domain = {
    name: 'IQNftStaking',
    version: '1',
    chainId: (await ethers.provider.getNetwork()).chainId,
    verifyingContract: await nftStaking.getAddress(),
  };

  const types = {
    Stake: [
      { name: 'staker', type: 'address' },
      { name: 'nonce', type: 'uint256' },
      { name: 'tokenIds', type: 'uint256[]' },
    ],
  };

  const message = {
    staker: stakerAddress,
    nonce: nonce.toString(),
    tokenIds: tokenIds,
  };

  const signature = await proofSource.signTypedData(domain, types, message);

  await nftStaking.connect(staker).withdraw(tokenIds, signature);

  return signature;
}

async function signAndClaimTokens(
  nftStaking: IQNftStaking,
  proofSource: Signer,
  staker: Signer,
  amount: BigNumberish,
): Promise<string> {
  const stakerAddress = await staker.getAddress();
  const nonce = await nftStaking.nonceCounter(staker);

  const domain = {
    name: 'IQNftStaking',
    version: '1',
    chainId: (await ethers.provider.getNetwork()).chainId,
    verifyingContract: await nftStaking.getAddress(),
  };

  const types = {
    ClaimTokens: [
      { name: 'staker', type: 'address' },
      { name: 'nonce', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
  };

  const message = {
    staker: stakerAddress,
    nonce: nonce.toString(),
    amount: amount.toString(),
  };

  const signature = await proofSource.signTypedData(domain, types, message);

  await nftStaking.connect(staker).claimTokens(staker, amount, signature);

  return signature;
}

describe('IQ NFT Staking Contract', function () {

  const POOL_SIZE = ethers.parseEther('100000');
  const REWARD_RATE = ethers.parseEther('100');
  const REWARD_FREQUENCY = 3600;

  let deployer: Signer;
  let proofSource: Signer;
  let poolCreator: Signer;
  let nftStaking: IQNftStaking;
  let nftCollection: ERC721Mock;
  let staker: Signer;


  beforeEach(async function () {
    [deployer, staker, poolCreator, proofSource] = await ethers.getSigners();

    //Deploy ERC721Mock
    nftCollection = (await hre.run('deploy:nft-mock', {
    })) as ERC721Mock;

    //Deploy IQ NFT Staking
    nftStaking = (await run('deploy:nft-staking', {
      proofSource: await proofSource.getAddress(),
      nftCollectionAddress: (await nftCollection.getAddress()).toString(),
    })) as IQNftStaking;
  });

  describe('Deployment & Initialization', function () {
  // Ensure correct deployed and configurations initialization.

    it('Camaping should be deactivated after deployment', async function () {
      expect(await nftStaking.isStakingActive()).to.equal(false);
    });

    it('Pool size should show be zero after deployment', async function () {
      expect(await nftStaking.showMaxPoolSize()).to.equal(0);
      expect(await nftStaking.totalTokensLeft()).to.equal(0);
    });

    it('deactivateStaking should be reverted after deployment', async function () {
      await expect(nftStaking.deactivateStaking()).to.be.revertedWithCustomError(nftStaking, 'StakingNotActive');
    });

    it('getNftCollectionAddress returns right NFT collection', async function () {
      expect(await nftStaking.getNftCollectionAddress()).to.equal(nftCollection);
    });

  });

  describe('Reward Pool Initialization', function () {
  // Ensure correct pool initialization.

    let rewardToken: ERC20Mock;

    beforeEach(async function () {

      //Deploy ERC20Mock and mint pool size to deployer address
      rewardToken = (await hre.run('deploy:token-mock', {
        initialSupply: POOL_SIZE.toString(),
      })) as ERC20Mock;

      //Aprprove tokens for transfering in to reward pool
      await rewardToken.connect(deployer).approve(nftStaking, POOL_SIZE);
    });

    it('depositRewardTokens should deposit tokens correctly', async function () {

      const currentTimestamp = await ethers.provider.getBlock('latest').then(b => b.timestamp);

      await expect(nftStaking.depositRewardTokens(rewardToken, POOL_SIZE, REWARD_RATE, REWARD_FREQUENCY))
    .to.emit(nftStaking, 'TokensDeposited')
    .withArgs(rewardToken, POOL_SIZE, REWARD_RATE, REWARD_FREQUENCY, currentTimestamp+1);

      expect(await nftStaking.getRewardTokenAddress()).to.equal(rewardToken);
      expect(await nftStaking.showMaxPoolSize()).to.equal(POOL_SIZE);
      expect(await nftStaking.totalTokensLeft()).to.equal(POOL_SIZE);
      expect(await nftStaking.getRewardRate()).to.equal(REWARD_RATE);
      expect(await nftStaking.getRewardFrequency()).to.equal(REWARD_FREQUENCY);
      expect(await nftStaking.isStakingActive()).to.equal(true);
    });

    it('depositRewardTokens should prevent deposits once the pool is already funded', async function () {

      await nftStaking.depositRewardTokens(rewardToken, POOL_SIZE, REWARD_RATE, REWARD_FREQUENCY);

      await expect(nftStaking.depositRewardTokens(rewardToken, Math.floor(Math.random() * 10000), REWARD_RATE, REWARD_FREQUENCY))
    .to.revertedWithCustomError(nftStaking, 'PoolAlreadyFunded');
    });

    it('depositRewardTokens should prevent zero tokens funding', async function () {
      await expect(nftStaking.depositRewardTokens(rewardToken, 0, REWARD_RATE, REWARD_FREQUENCY))
    .to.revertedWithCustomError(nftStaking, 'PoolSizeMustBePositive');
    });

    it('depositRewardTokens should prevent zero reward rate', async function () {
      await expect(nftStaking.depositRewardTokens(rewardToken, POOL_SIZE, 0, REWARD_FREQUENCY))
    .to.revertedWithCustomError(nftStaking, 'RewardRateMustBePositive');
    });

    it('depositRewardTokens should prevent zero reward frequency', async function () {
      await expect(nftStaking.depositRewardTokens(rewardToken, POOL_SIZE, REWARD_RATE, 0))
    .to.revertedWithCustomError(nftStaking, 'RewardFrequencyMustBePositive');
    });

    it('deactivateStaking should work after token deposited', async function () {

      await nftStaking.depositRewardTokens(rewardToken, POOL_SIZE, REWARD_RATE, REWARD_FREQUENCY);

      const currentTimestamp = await ethers.provider.getBlock('latest').then(b => b.timestamp);

      await expect(nftStaking.deactivateStaking()).to.emit(nftStaking, 'StakingDeactivated')
      .withArgs(currentTimestamp+1);
      expect(await nftStaking.isStakingActive()).to.equal(false);
    });

    it('withdrawRewardTokens should be withdrawable after campaing deactivated', async function () {
      await nftStaking.connect(deployer).depositRewardTokens(rewardToken, POOL_SIZE, REWARD_RATE, REWARD_FREQUENCY);

      const currentTimestamp = await ethers.provider.getBlock('latest').then(b => b.timestamp);

      await expect(nftStaking.deactivateStaking()).to.emit(nftStaking, 'StakingDeactivated')
        .withArgs(currentTimestamp+1);

      // signAndWithdrawTokens verify that the staking owner can withdraw only the amount of tokens they do not owe.
      // Signature will not be provided, transaction fails if there is a debt.

      await signAndWithdrawTokens(nftStaking, proofSource, deployer, POOL_SIZE);

      //expect(signAndWithdrawTokens(nftStaking, proofSource, deployer, POOL_SIZE).to.emit(nftStaking, 'TokensWithdrawedByOwner').withArgs(POOL_SIZE));
      expect(await nftStaking.totalTokensLeft()).to.equal(0);
    });

    it('withdrawRewardTokens should be rejected if amount = 0', async function () {
      await nftStaking.connect(deployer).depositRewardTokens(rewardToken, POOL_SIZE, REWARD_RATE, REWARD_FREQUENCY);

      const currentTimestamp = await ethers.provider.getBlock('latest').then(b => b.timestamp);

      await expect(nftStaking.deactivateStaking()).to.emit(nftStaking, 'StakingDeactivated')
        .withArgs(currentTimestamp+1);

      // signAndWithdrawTokens verify that the staking owner can withdraw only the amount of tokens they do not owe.
      // Signature will not be provided, transaction fails if there is a debt.

      await expect(signAndWithdrawTokens(nftStaking, proofSource, deployer, 0)).to.be.revertedWithCustomError(nftStaking, 'CantWithdrawZero');
      expect(await nftStaking.totalTokensLeft()).to.equal(POOL_SIZE);
    });

    it('withdrawRewardTokens should be rejected if staking is active', async function () {
      await nftStaking.connect(deployer).depositRewardTokens(rewardToken, POOL_SIZE, REWARD_RATE, REWARD_FREQUENCY);

      // signAndWithdrawTokens verify that the staking owner can withdraw only the amount of tokens they do not owe.
      // Signature will not be provided, transaction fails if there is a debt.

      await expect(signAndWithdrawTokens(nftStaking, proofSource, deployer, 0)).to.be.revertedWithCustomError(nftStaking, 'StakingShouldBeDeactivated');
      expect(await nftStaking.totalTokensLeft()).to.equal(POOL_SIZE);
    });


  });

  describe('NFT Staking & Unstaking Process', function () {
  // Ensure correct NFT staking funcftionality.

    let rewardToken: ERC20Mock;
    let oneNftArray: [1];

    beforeEach(async function () {

      //Deploy ERC20Mock and mint pool size to deployer address
      rewardToken = (await hre.run('deploy:token-mock', {
        initialSupply: POOL_SIZE.toString(),
      })) as ERC20Mock;

      //Aprprove tokens for transfering in to reward pool
      await rewardToken.approve(nftStaking, POOL_SIZE);

      await nftStaking.depositRewardTokens(rewardToken, POOL_SIZE, REWARD_RATE, REWARD_FREQUENCY);

      await nftCollection.mint(staker, 1);
      await nftCollection.mint(staker, 2);


    });

    it('stake should work corretly', async function () {
      await signAndStakeNfts(nftStaking, proofSource, staker, oneNftArray);
    });

});

describe('Tokens Claiming Process', function () {
  // Ensure correct tokens claiming funcftionality.

    let rewardToken: ERC20Mock;

    beforeEach(async function () {

      //Deploy ERC20Mock and mint pool size to deployer address
      rewardToken = (await hre.run('deploy:token-mock', {
        initialSupply: POOL_SIZE.toString(),
      })) as ERC20Mock;

      //Aprprove tokens for transfering in to reward pool
      await rewardToken.approve(nftStaking, POOL_SIZE);

      await nftStaking.depositRewardTokens(rewardToken, POOL_SIZE, REWARD_RATE, REWARD_FREQUENCY);

      await nftCollection.mint(staker, 1);
      await nftCollection.mint(staker, 2);

      // Assume NFTs were staked as part of the operation.
      // Given that staking mechanics and calculations are handled server-side, explicit staking within this context is considered extraneous for testing purposes.
    });

    it('claimTokens should work correctly', async function () {

      let firstClaimedAmount = BigInt(1000);
      let secondClaimedAmount = BigInt(3000);
      let fullClaimedAmount = firstClaimedAmount + secondClaimedAmount;

      // Backend verifies the number of NFTs staked, their staking duration, and calculates the claimable tokens.
      // If the claim exceeds the calculated amount, the signature will not be provided and the transaction will fail.
      expect(await nftStaking.hasClaimed(staker)).to.equal(false);


      //First claim
      await signAndClaimTokens(nftStaking, proofSource, staker, firstClaimedAmount);

      expect(await nftStaking.hasClaimed(staker)).to.equal(true);
      expect(await nftStaking.totalTokensClaimed()).to.equal(firstClaimedAmount);
      expect(await nftStaking.getClaimedTokensByAddress(staker)).to.equal(firstClaimedAmount);
      expect(await nftStaking.totalTokensLeft()).to.equal(POOL_SIZE-firstClaimedAmount);

      //Second claim
      await signAndClaimTokens(nftStaking, proofSource, staker, secondClaimedAmount);

      expect(await nftStaking.hasClaimed(staker)).to.equal(true);
      expect(await nftStaking.totalTokensClaimed()).to.equal(fullClaimedAmount);
      expect(await nftStaking.getClaimedTokensByAddress(staker)).to.equal(fullClaimedAmount);
      expect(await nftStaking.totalTokensLeft()).to.equal(POOL_SIZE-fullClaimedAmount);

      //maxPoolSize should not change after claims
      expect(await nftStaking.showMaxPoolSize()).to.equal(POOL_SIZE);
    });

    it('claimTokens should be rejected if user claim zero tokens', async function () {
      await expect(signAndClaimTokens(nftStaking, proofSource, staker, 0)).to.be
        .revertedWithCustomError(nftStaking, 'CantClaimZero');
    });

    it('claimTokens should be rejected if user claim more tokens than are available in the pool', async function () {

      let moreThanPoolSize = BigInt(1)+POOL_SIZE;

      // Backend verifies the number of NFTs staked, their staking duration, and calculates the claimable tokens.
      // If the claim exceeds the calculated amount, the signature will not be provided and the transaction will fail.
      await expect(signAndClaimTokens(nftStaking, proofSource, staker, moreThanPoolSize)).to.be
        .revertedWithCustomError(nftStaking, 'InsufficientPoolSize');
    });

    it('claimTokens should be rejected if pool is empty', async function () {

      let minimalClaimAmount = BigInt(1);

      //First claim
      await signAndClaimTokens(nftStaking, proofSource, staker, POOL_SIZE);
      expect(await nftStaking.totalTokensLeft()).to.equal(0);

      //Second claim
      await expect(signAndClaimTokens(nftStaking, proofSource, staker, minimalClaimAmount)).to.be
        .revertedWithCustomError(nftStaking, 'InsufficientPoolSize');
    });

});
});
