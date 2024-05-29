import hre from 'hardhat';
import { expect } from 'chai';
import { ethers, run } from 'hardhat';
import { BigNumberish, Signer, ZeroAddress, formatUnits, id } from 'ethers';
import { IQNftStaking, ERC721Mock, ERC20Mock, StakingManager } from '../typechain';

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

async function generateWithdrawTokensSignature(
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

  return signature;
}

async function signAndDeactivateStaking(
  nftStaking: IQNftStaking,
  proofSource: Signer,
  deactivator: Signer,
  totalRewardAccrued: BigNumberish,
): Promise<string> {
  const deactivatorAddress = await deactivator.getAddress();
  const nonce = await nftStaking.nonceCounter(deactivator);

  const domain = {
    name: 'IQNftStaking',
    version: '1',
    chainId: (await ethers.provider.getNetwork()).chainId,
    verifyingContract: await nftStaking.getAddress(),
  };

  const types = {
    DeactivateStaking: [
      { name: 'deactivator', type: 'address' },
      { name: 'totalRewardAccrued', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
    ],
  };

  const message = {
    deactivator: deactivatorAddress,
    totalRewardAccrued: totalRewardAccrued.toString(),
    nonce: nonce.toString(),
  };

  const signature = await proofSource.signTypedData(domain, types, message);

  await nftStaking.connect(deactivator).deactivateStaking(totalRewardAccrued, signature);

  return signature;
}

async function generateDeactivateStakingSignature(
  nftStaking: IQNftStaking,
  proofSource: Signer,
  deactivator: Signer,
  totalRewardAccrued: BigNumberish,
): Promise<string> {
  const deactivatorAddress = await deactivator.getAddress();
  const nonce = await nftStaking.nonceCounter(deactivator);

  const domain = {
    name: 'IQNftStaking',
    version: '1',
    chainId: (await ethers.provider.getNetwork()).chainId,
    verifyingContract: await nftStaking.getAddress(),
  };

  const types = {
    DeactivateStaking: [
      { name: 'deactivator', type: 'address' },
      { name: 'totalRewardAccrued', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
    ],
  };

  const message = {
    deactivator: deactivatorAddress,
    totalRewardAccrued: totalRewardAccrued.toString(),
    nonce: nonce.toString(),
  };

  const signature = await proofSource.signTypedData(domain, types, message);

  return signature;
}

async function signAndStakeNfts(
  stakingContract: IQNftStaking,
  stakingManager: StakingManager,
  proofSource: Signer,
  staker: Signer,
  tokenIds: BigNumberish[],
): Promise<string> {
  const stakerAddress = await staker.getAddress();
  const nonce = await stakingManager.nonceCounter(staker);
  const nftStakingAddress = await stakingContract.getAddress();

  const domain = {
    name: 'StakingManager',
    version: '1',
    chainId: (await ethers.provider.getNetwork()).chainId,
    verifyingContract: await stakingManager.getAddress(),
  };

  const types = {
    Stake: [
      { name: 'stakingContract', type: 'address' },
      { name: 'tokenIds', type: 'uint256[]' },
      { name: 'nonce', type: 'uint256' },
    ],
  };

  const tokenIdsArrayString = tokenIds.map((id) => id.toString());

  console.log(stakerAddress);
  console.log(nftStakingAddress)
  console.log('tokenIdsArrayString', tokenIdsArrayString);

  const message = {
    stakingContract: nftStakingAddress,
    tokenIds: tokenIdsArrayString,
    nonce: nonce.toString(),
  };

  const signature = await proofSource.signTypedData(domain, types, message);

  await stakingManager.connect(staker).stake(stakingContract, tokenIdsArrayString, signature);

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
    Withdraw: [
      { name: 'staker', type: 'address' },
      { name: 'nonce', type: 'uint256' },
      { name: 'tokenIds', type: 'uint256[]' },
    ],
  };

  const tokenIdsArrayString = tokenIds.map((id) => id.toString());

  console.log('tokenIdsArrayString', tokenIdsArrayString);

  const message = {
    staker: stakerAddress,
    nonce: nonce.toString(),
    tokenIds: tokenIdsArrayString,
  };

  const signature = await proofSource.signTypedData(domain, types, message);

  await nftStaking.connect(staker).withdraw(tokenIds, signature);

  return signature;
}

async function generateWithdrawNftsSignature(
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
    Withdraw: [
      { name: 'staker', type: 'address' },
      { name: 'nonce', type: 'uint256' },
      { name: 'tokenIds', type: 'uint256[]' },
    ],
  };

  const tokenIdsArrayString = tokenIds.map((id) => id.toString());

  const message = {
    staker: stakerAddress,
    nonce: nonce.toString(),
    tokenIds: tokenIdsArrayString,
  };

  const signature = await proofSource.signTypedData(domain, types, message);

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

async function generateClaimTokensSignature(
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

  return signature;
}

async function generateDeployNftStakingSignature(
  proofSource: Signer,
  deployer: Signer,
  stakingManager: StakingManager,
  nftCtolletion: ERC721Mock,
): Promise<string> {
  const proofSourceAddress = await proofSource.getAddress();
  const nftCtolletionAddress = await nftCtolletion.getAddress();
  const nonce = await stakingManager.nonceCounter(deployer);

  const domain = {
    name: 'StakingManager',
    version: '1',
    chainId: (await ethers.provider.getNetwork()).chainId,
    verifyingContract: await stakingManager.getAddress(),
  };

  const types = {
    DeployNftStaking: [
      { name: 'proofSource', type: 'address' },
      { name: 'nftCollectionAddress', type: 'address' },
      { name: 'nonce', type: 'uint256' },
    ],
  };

  const message = {
    proofSource: proofSourceAddress,
    nftCollectionAddress: nftCtolletionAddress,
    nonce: nonce.toString(),
  };

  const signature = await proofSource.signTypedData(domain, types, message);

  return signature;
}

async function generateStakeNftsSignature(
  nftStaking: IQNftStaking,
  stakingManager: StakingManager,
  proofSource: Signer,
  staker: Signer,
  tokenIds: BigNumberish[],
): Promise<string> {
  const nonce = await stakingManager.nonceCounter(staker);
  const nftStakingAddress = await nftStaking.getAddress();

  const domain = {
    name: 'StakingManager',
    version: '1',
    chainId: (await ethers.provider.getNetwork()).chainId,
    verifyingContract: await stakingManager.getAddress(),
  };

  const types = {
    StakeTokens: [
      { name: 'stakingContract', type: 'address' },
      { name: 'tokenIds', type: 'uint256[]' },
      { name: 'nonce', type: 'uint256' },
    ],
  };

  const tokenIdsArrayString = tokenIds.map((id) => id.toString());

  const message = {
    stakingContract: nftStakingAddress,
    nonce: nonce.toString(),
    tokenIds: tokenIdsArrayString,
  };

  const signature = await proofSource.signTypedData(domain, types, message);

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
  let stakingManager: StakingManager;
  let staker: Signer;


  beforeEach(async function () {
    [deployer, staker, poolCreator, proofSource] = await ethers.getSigners();

    //Deploy ERC721Mock
    nftCollection = (await hre.run('deploy:nft-mock', {
      name: 'Test NFT Collection',
      symbol: 'TNC',
    })) as ERC721Mock;

    stakingManager = (await hre.run('deploy:staking-manager', {
      proofSource: await proofSource.getAddress(),
      deploymentPrice: '0',
      batchTransactionFee : '0',
    })) as StakingManager;

    // Deploy IQ NFT Staking

    nftStaking = (await run('deploy:nft-staking', {
      proofSource: await proofSource.getAddress(),
      stakingManager: await stakingManager.getAddress(),
      nftCollectionAddress: (await nftCollection.getAddress()).toString(),
    })) as IQNftStaking;

    // const signature = await generateDeployNftStakingSignature(proofSource, deployer, stakingManager, nftCollection);
    // const txResponse = await stakingManager.connect(deployer).deployNftStaking(proofSource, nftCollection, signature);
    // const txReceipt = await txResponse.wait();
    // const nftStakingAddress = txReceipt.logs[0].address;
    // const nftStaking = new ethers.Contract(nftStakingAddress, IQNftStaking, deployer) as IQNftStaking;


  });

  describe('Staking Manager Functionality', function () {
    // Ensure correct deployed and configurations initialization.
      it('setDeploymentPrice and setDeploymentPrice works correctly', async function () {
        expect(await stakingManager.getDeploymentPrice()).to.equal(0);
        const newDeploymentPrice = 1000;
        await stakingManager.connect(deployer).setDeploymentPrice(newDeploymentPrice);
        expect(await stakingManager.getDeploymentPrice()).to.equal(newDeploymentPrice);
      });

      it('setBatchTransactionFee and getBatchTransactionFee works correctly', async function () {
        expect(await stakingManager.getBatchTransactionFee()).to.equal(0);
        const newBatchTransactionFee = 20000;
        await stakingManager.connect(deployer).setBatchTransactionFee(newBatchTransactionFee);
        expect(await stakingManager.getBatchTransactionFee()).to.equal(newBatchTransactionFee);
      });

      it('getProofSourceAddress works correctly', async function () {
        expect(await stakingManager.getProofSourceAddress()).to.equal(proofSource);
      });

      it('getBalance works correctly', async function () {
        expect(await stakingManager.getBalance()).to.equal(0);
      });

      it('Staking can be deployed using stakingManager', async function () {
        const signature = await generateDeployNftStakingSignature(proofSource, deployer, stakingManager, nftCollection);
        const txResponse = await stakingManager.connect(deployer).deployNftStaking(proofSource, nftCollection, signature);
        // get transaction receipt
        const txReceipt = await txResponse.wait();
        const nftStakingAddress = txReceipt.logs[0].address;
        await expect(txResponse)
        .to.emit(stakingManager, 'NftStakingDeployed').withArgs(nftStakingAddress, deployer, proofSource, nftCollection)

        console.log(`IQ Nft Staking contract address: ${nftStakingAddress}`);
      });

      it('Reverts deployment if deployer sends not enough ether', async function () {
        //set deployment price
        const newDeploymentPrice = 1000;
        await stakingManager.connect(deployer).setDeploymentPrice(newDeploymentPrice);
        //deploy contract without sending any ether
        const signature = await generateDeployNftStakingSignature(proofSource, deployer, stakingManager, nftCollection);
        expect (stakingManager.connect(deployer).deployNftStaking(proofSource, nftCollection, signature))
          .to.revertedWithCustomError(stakingManager, 'InsufficientEtherSent');
        });

      it('Payment deployment works correctly', async function () {
        //set deployment price
        const newDeploymentPrice = 1000;
        await stakingManager.connect(deployer).setDeploymentPrice(newDeploymentPrice);
        //deploy contract with correct amount of ether
        const signature = await generateDeployNftStakingSignature(proofSource, deployer, stakingManager, nftCollection);
        expect (stakingManager.connect(deployer).deployNftStaking(proofSource, nftCollection, signature, { value: newDeploymentPrice }))
          .to.be.not.reverted;
      });

      it('Contrat balance can be withdrawed by owner to any address', async function () {
        //set deployment price
        const newDeploymentPrice = ethers.parseUnits('7000000', 'wei');
        await stakingManager.connect(deployer).setDeploymentPrice(newDeploymentPrice);
        //deploy contract with correct amount of ether
        const signature = await generateDeployNftStakingSignature(proofSource, deployer, stakingManager, nftCollection);
        await stakingManager.connect(deployer).deployNftStaking(proofSource, nftCollection, signature, { value: newDeploymentPrice })
        //check balance
        expect(await stakingManager.getBalance()).to.equal(newDeploymentPrice);
        //withdraw balance to third-party account
        const userBalanceBeforeWithdrawal = await ethers.provider.getBalance(staker)
        await stakingManager.connect(deployer).withdrawFunds(staker);
        expect(await ethers.provider.getBalance(staker)).to.equal(userBalanceBeforeWithdrawal+newDeploymentPrice)
      });

      it('Zero balance cant be withdrawed', async function () {
        expect (await stakingManager.connect(deployer).withdrawFunds(staker)).to.revertedWithCustomError(stakingManager, "CantWithdrawZero");
      });

      it('withdrawFunds reverts if caller is not owner', async function () {
        const newDeploymentPrice = ethers.parseUnits('7000000', 'wei');
        await stakingManager.connect(deployer).setDeploymentPrice(newDeploymentPrice);
        //deploy contract with correct amount of ether
        const signature = await generateDeployNftStakingSignature(proofSource, deployer, stakingManager, nftCollection);
        await stakingManager.connect(deployer).deployNftStaking(proofSource, nftCollection, signature, { value: newDeploymentPrice })

        await expect(stakingManager.connect(staker).withdrawFunds(staker))
          .to.be.revertedWith("Ownable: caller is not the owner");
      });


    });

  describe('Deployment & Initialization', function () {
  // Ensure correct deployed and configurations initialization.
    it('getStakingManagerAddress should return right address', async function () {
      expect(await nftStaking.getStakingManagerAddress()).to.equal(stakingManager);
    });
    it('Camaping should be deactivated after deployment', async function () {
      expect(await nftStaking.isStakingActive()).to.equal(false);
    });

    it('Pool size should show be zero after deployment', async function () {
      expect(await nftStaking.showMaxPoolSize()).to.equal(0);
      expect(await nftStaking.totalTokensLeft()).to.equal(0);
    });

    it('deactivateStaking should be reverted after deployment', async function () {
      await expect(signAndDeactivateStaking(nftStaking, proofSource, deployer, 1000))
        .to.be.revertedWithCustomError(nftStaking, 'StakingNotActive');
    });

    it('getNftCollectionAddress returns right NFT collection', async function () {
      expect(await nftStaking.getNftCollectionAddress()).to.equal(nftCollection);
    });

    it('getProofSourceAddress returns right address', async function () {
      expect(await nftStaking.getProofSourceAddress()).to.equal(proofSource);
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

    it('stake should not work before tokens deposited to the pool', async function () {
      const signature = await generateStakeNftsSignature(nftStaking, stakingManager, proofSource, staker, [1]);
      await expect(stakingManager.connect(staker).stake(nftStaking, [1], signature)).to.be
      .revertedWithCustomError(nftStaking, 'StakingNotActive');;
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

      await signAndDeactivateStaking(nftStaking, proofSource, deployer, POOL_SIZE);

      expect(await nftStaking.isStakingActive()).to.equal(false);
    });

    it('deactivateStaking should emit StakingDeactivated event', async function () {

      await nftStaking.connect(deployer).depositRewardTokens(rewardToken, POOL_SIZE, REWARD_RATE, REWARD_FREQUENCY) ;
      const signature = await generateDeactivateStakingSignature(nftStaking, proofSource, deployer, POOL_SIZE);
      const currentTimestamp = await ethers.provider.getBlock('latest').then(b => b.timestamp);

      await expect(nftStaking.connect(deployer).deactivateStaking(POOL_SIZE, signature)).to.emit(nftStaking,
      "StakingDeactivated").withArgs(currentTimestamp+1)
    });


    it('withdrawRewardTokens should be withdrawable after campaing deactivated', async function () {
      await nftStaking.connect(deployer).depositRewardTokens(rewardToken, POOL_SIZE, REWARD_RATE, REWARD_FREQUENCY);

      await signAndDeactivateStaking(nftStaking, proofSource, deployer, POOL_SIZE);

      // signAndWithdrawTokens verify that the staking owner can withdraw only the amount of tokens they do not owe.
      // Signature will not be provided, transaction fails if there is a debt.

      await signAndWithdrawTokens(nftStaking, proofSource, deployer, POOL_SIZE);

      expect(await nftStaking.totalTokensLeft()).to.equal(0);
    });

    it('withdrawRewardTokens should emit TokensWithdrawedByOwner event', async function () {
      await nftStaking.connect(deployer).depositRewardTokens(rewardToken, POOL_SIZE, REWARD_RATE, REWARD_FREQUENCY);

      await signAndDeactivateStaking(nftStaking, proofSource, deployer, POOL_SIZE);

      const signature = await generateWithdrawTokensSignature(nftStaking, proofSource, deployer, POOL_SIZE);

      expect(await nftStaking.withdrawRewardTokens(POOL_SIZE, signature)).to.emit(nftStaking, 'TokensWithdrawedByOwner').withArgs(POOL_SIZE);
      expect(await nftStaking.totalTokensLeft()).to.equal(0);
    });

    it('withdrawRewardTokens should be rejected if amount = 0', async function () {
      await nftStaking.connect(deployer).depositRewardTokens(rewardToken, POOL_SIZE, REWARD_RATE, REWARD_FREQUENCY);

      await signAndDeactivateStaking(nftStaking, proofSource, deployer, POOL_SIZE);

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
    let accruedRewards = 1000;
    let firstNft = [1];
    let secondNft = [2];
    let bothNfts = [1, 2];

    beforeEach(async function () {

      //Deploy ERC20Mock and mint pool size to deployer address
      rewardToken = (await hre.run('deploy:token-mock', {
        initialSupply: POOL_SIZE.toString(),
      })) as ERC20Mock;

      //Aprprove tokens for transfering in to reward pool
      await rewardToken.approve(nftStaking, POOL_SIZE);

      await nftStaking.depositRewardTokens(rewardToken, POOL_SIZE, REWARD_RATE, REWARD_FREQUENCY);

      await nftCollection.connect(deployer).mint(staker, 1);
      await nftCollection.connect(staker).approve(nftStaking, 1);
      await nftCollection.connect(deployer).mint(staker, 2);
      await nftCollection.connect(staker).approve(nftStaking, 2);
    });

    it('stake should work only if caller is stakingManager', async function () {
      await expect(nftStaking.connect(staker).stake([1], staker)).to.be
      .revertedWithCustomError(nftStaking, 'CallerIsNotStakingManager');;
    });

    it('stake should emit Staked event correctly', async function () {

      const signature = await generateStakeNftsSignature(nftStaking, stakingManager, proofSource, staker, firstNft);

      const currentTimestamp = await ethers.provider.getBlock('latest').then(b => b.timestamp);

      expect(await stakingManager.connect(staker).stake(nftStaking, firstNft, signature)).to.emit(nftStaking, 'Staked').withArgs(staker, firstNft, currentTimestamp);
    });

    it('stake should work correctly', async function () {

      //fist stake
      const signature = await generateStakeNftsSignature(nftStaking, stakingManager, proofSource, staker, firstNft);
      await stakingManager.connect(staker).stake(nftStaking, firstNft, signature);
      expect(await nftStaking.getStakedNftsByAddress(staker)).to.deep.equal(firstNft);
      expect(await nftStaking.getOwnerOfStakedTokenId(1)).to.equal(staker);

      //second stake
      const secondSignature = await generateStakeNftsSignature(nftStaking, stakingManager, proofSource, staker, secondNft);
      await stakingManager.connect(staker).stake(nftStaking, secondNft, secondSignature);
      expect(await nftStaking.getStakedNftsByAddress(staker)).to.deep.equal(bothNfts);
      expect(await nftStaking.getOwnerOfStakedTokenId(2)).to.equal(staker);
    });

    it('stake should be reverted when double stake the same nft', async function () {
      const firstSignature = await generateStakeNftsSignature(nftStaking, stakingManager, proofSource, staker, firstNft);
      await stakingManager.connect(staker).stake(nftStaking, firstNft, firstSignature);

      const secondSignature = await generateStakeNftsSignature(nftStaking, stakingManager, proofSource, staker, firstNft);

      await expect(stakingManager.connect(staker).stake(nftStaking, firstNft, secondSignature)).to.be
        .revertedWithCustomError(nftStaking, 'NotTheOwnerOfNft');
    });

    it('stake should be reverted if nft is not minted', async function () {
      const signature = await generateStakeNftsSignature(nftStaking, stakingManager, proofSource, staker, [3]);
      await expect(stakingManager.connect(staker).stake(nftStaking, [3], signature)).to.be
        .rejectedWith('ERC721: invalid token ID');
    });

    it('stake should be reverted if user not the owner of nft', async function () {

      await nftCollection.connect(staker).transferFrom(staker, deployer, 1);
      const signature = await generateStakeNftsSignature(nftStaking, stakingManager, proofSource, staker, firstNft);

      await expect(stakingManager.connect(staker).stake(nftStaking, firstNft, signature)).to.be
        .revertedWithCustomError(nftStaking, 'NotTheOwnerOfNft');
    });

    it('stake should not work if staking deactivated', async function () {

      await signAndDeactivateStaking(nftStaking, proofSource, deployer, accruedRewards)
      const signature = await generateStakeNftsSignature(nftStaking, stakingManager, proofSource, staker, firstNft);

      await expect(stakingManager.connect(staker).stake(nftStaking, firstNft, signature)).to.be
        .revertedWithCustomError(nftStaking, 'StakingNotActive');
    });

    it('withdraw should work correctly', async function () {

      //stake nft
      const signature = await generateStakeNftsSignature(nftStaking, stakingManager, proofSource, staker, firstNft);
      await stakingManager.connect(staker).stake(nftStaking, firstNft, signature);

      expect(await nftStaking.getStakedNftsByAddress(staker)).to.deep.equal(firstNft);
      expect(await nftStaking.getOwnerOfStakedTokenId(1)).to.equal(staker);
      //withdraw nft
      await signAndWithdrawNfts(nftStaking, proofSource, staker, firstNft)

      expect(await nftStaking.getStakedNftsByAddress(staker)).to.deep.equal([]);
      expect(await nftStaking.getOwnerOfStakedTokenId(1)).to.equal(ZeroAddress);
    });

    it('withdraw should emit WithdrawStakedTokens correctly', async function () {

      //stake nft
      const stakeSignature = await generateStakeNftsSignature(nftStaking, stakingManager, proofSource, staker, firstNft);
      await stakingManager.connect(staker).stake(nftStaking, firstNft, stakeSignature);

      expect(await nftStaking.getStakedNftsByAddress(staker)).to.deep.equal(firstNft);
      expect(await nftStaking.getOwnerOfStakedTokenId(1)).to.equal(staker);

      //withdraw nft
      const signature = await generateWithdrawNftsSignature(nftStaking, proofSource, staker, firstNft);
      const currentTimestamp = await ethers.provider.getBlock('latest').then(b => b.timestamp);

      expect(await nftStaking.connect(staker).withdraw(firstNft, signature)).to.emit(nftStaking, 'WithdrawStakedTokens').withArgs(staker, firstNft, currentTimestamp+1);

      expect(await nftStaking.getStakedNftsByAddress(staker)).to.deep.equal([]);
      expect(await nftStaking.getOwnerOfStakedTokenId(1)).to.equal(ZeroAddress);
    });

    it('batch withdraw should work corretly', async function () {

      //fist stake
      const signature = await generateStakeNftsSignature(nftStaking, stakingManager, proofSource, staker, firstNft);
      await stakingManager.connect(staker).stake(nftStaking, firstNft, signature);
      expect(await nftStaking.getStakedNftsByAddress(staker)).to.deep.equal(firstNft);
      expect(await nftStaking.getOwnerOfStakedTokenId(1)).to.equal(staker);

      //second stake
      const secondSignature = await generateStakeNftsSignature(nftStaking, stakingManager, proofSource, staker, secondNft);
      await stakingManager.connect(staker).stake(nftStaking, secondNft, secondSignature);
      expect(await nftStaking.getStakedNftsByAddress(staker)).to.deep.equal(bothNfts);
      expect(await nftStaking.getOwnerOfStakedTokenId(2)).to.equal(staker);

      await signAndWithdrawNfts(nftStaking, proofSource, staker, bothNfts)

      expect(await nftStaking.getStakedNftsByAddress(staker)).to.deep.equal([]);
      expect(await nftStaking.getOwnerOfStakedTokenId(1)).to.equal(ZeroAddress);
      expect(await nftStaking.getOwnerOfStakedTokenId(2)).to.equal(ZeroAddress);
    });

    it('withdraw should be reverted if user attempts to withdaw an NFT that is not in the staking', async function () {

      await expect(signAndWithdrawNfts(nftStaking, proofSource, staker, firstNft)).to.be
        .revertedWithCustomError(nftStaking, 'NftNotStaked');

    });

    it('withdraw should fail if user not the owner of NFT', async function () {

      const signature = await generateStakeNftsSignature(nftStaking, stakingManager, proofSource, staker, firstNft);
      await stakingManager.connect(staker).stake(nftStaking, firstNft, signature);

      await expect(signAndWithdrawNfts(nftStaking, proofSource, deployer, firstNft)).to.be
        .revertedWithCustomError(nftStaking, 'NotTheOwnerOfNft');

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

    it('getClaimedDelay should be 1 hour', async function () {
     expect (await nftStaking.getClaimedDelay()).to.be
        .equal(3600);
    });

    it('claimTokens should work correctly', async function () {

      let firstClaimedAmount = BigInt(1000);
      let secondClaimedAmount = BigInt(3000);
      let fullClaimedAmount = firstClaimedAmount + secondClaimedAmount;

      // Backend verifies the number of NFTs staked, their staking duration, and calculates the claimable tokens.
      // If the claim exceeds the calculated amount, the signature will not be provided and the transaction will fail.
      expect(await nftStaking.hasClaimed(staker)).to.equal(false);

      let stakerErc20TokensBalance = await rewardToken.balanceOf(staker);
      expect(stakerErc20TokensBalance).to.equal(0);

      //First claim
      await signAndClaimTokens(nftStaking, proofSource, staker, firstClaimedAmount);

      expect(await nftStaking.hasClaimed(staker)).to.equal(true);
      expect(await nftStaking.totalTokensClaimed()).to.equal(firstClaimedAmount);
      expect(await nftStaking.getClaimedTokensByAddress(staker)).to.equal(firstClaimedAmount);
      expect(await nftStaking.totalTokensLeft()).to.equal(POOL_SIZE-firstClaimedAmount);

      stakerErc20TokensBalance = await rewardToken.balanceOf(staker);
      expect(stakerErc20TokensBalance).to.equal(firstClaimedAmount);

      //Increase time by 3600 seconds (1 hour)
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");

      //Second claim
      await signAndClaimTokens(nftStaking, proofSource, staker, secondClaimedAmount);

      expect(await nftStaking.hasClaimed(staker)).to.equal(true);
      expect(await nftStaking.totalTokensClaimed()).to.equal(fullClaimedAmount);
      expect(await nftStaking.getClaimedTokensByAddress(staker)).to.equal(fullClaimedAmount);
      expect(await nftStaking.totalTokensLeft()).to.equal(POOL_SIZE-fullClaimedAmount);

      stakerErc20TokensBalance = await rewardToken.balanceOf(staker);
      expect(stakerErc20TokensBalance).to.equal(fullClaimedAmount);

      //maxPoolSize should not change after claims
      expect(await nftStaking.showMaxPoolSize()).to.equal(POOL_SIZE);
    });

    it('claimTokens should emit TokensClaimed correctly', async function () {

      let firstClaimedAmount = BigInt(3000);

      // Backend verifies the number of NFTs staked, their staking duration, and calculates the claimable tokens.
      // If the claim exceeds the calculated amount, the signature will not be provided and the transaction will fail.
      expect(await nftStaking.hasClaimed(staker)).to.equal(false);

      let stakerErc20TokensBalance = await rewardToken.balanceOf(staker);
      expect(stakerErc20TokensBalance).to.equal(0);

      const signature = await generateClaimTokensSignature(nftStaking, proofSource, staker, firstClaimedAmount);
      const currentTimestamp = await ethers.provider.getBlock('latest').then(b => b.timestamp);

      expect(await nftStaking.claimTokens(staker, firstClaimedAmount, signature)).to.emit(nftStaking, 'TokensClaimed').withArgs(staker, firstClaimedAmount, currentTimestamp+1);
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

      //Increase time by 3600 seconds (1 hour)
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");

      //Second claim
      await expect(signAndClaimTokens(nftStaking, proofSource, staker, minimalClaimAmount)).to.be
        .revertedWithCustomError(nftStaking, 'InsufficientPoolSize');
    });

    it('claimTokens should be rejected if claim delay not passed', async function () {

      let minimalClaimAmount = BigInt(1);

      //First claim
      await signAndClaimTokens(nftStaking, proofSource, staker, POOL_SIZE);
      expect(await nftStaking.totalTokensLeft()).to.equal(0);

      //Second claim
      await expect(signAndClaimTokens(nftStaking, proofSource, staker, minimalClaimAmount)).to.be
        .revertedWithCustomError(nftStaking, 'ClaimDelayNotPassed');
    });

    it('getLastClaimedTimestamp should work correctly', async function () {

      let firstClaimedAmount = BigInt(3000);

      // Backend verifies the number of NFTs staked, their staking duration, and calculates the claimable tokens.
      // If the claim exceeds the calculated amount, the signature will not be provided and the transaction will fail.
      expect(await nftStaking.hasClaimed(staker)).to.equal(false);

      let stakerErc20TokensBalance = await rewardToken.balanceOf(staker);
      expect(stakerErc20TokensBalance).to.equal(0);

      const signature = await generateClaimTokensSignature(nftStaking, proofSource, staker, firstClaimedAmount);
      const currentTimestamp = await ethers.provider.getBlock('latest').then(b => b.timestamp);

      expect(await nftStaking.claimTokens(staker, firstClaimedAmount, signature)).to.emit(nftStaking, 'TokensClaimed').withArgs(staker, firstClaimedAmount, currentTimestamp+1);

      //check last claimed timestamp for claimer and for third-party address
      expect(await nftStaking.getLastClaimedTimestamp(staker)).to.be.equal(currentTimestamp+1);
      expect(await nftStaking.getLastClaimedTimestamp(deployer)).to.be.equal(0);
    });

});
});
