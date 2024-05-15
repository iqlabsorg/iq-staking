import { task, types } from 'hardhat/config';
import { StakingManager__factory } from '../typechain';
import { verifyContract } from './utils/verify';

task('deploy:staking-manager', 'Deploy the Staking Manager contract')
.addParam('proofSource', 'Address of the backend that will provide the signatures', undefined, types.string, false)
.addParam('deploymentPrice', 'Amount of fee for IQ Staking deployment', undefined, types.string, false)
.addParam('batchTransactionFee', 'Amount of fee for each staked subsequent NFT in a batch', undefined, types.string, false)
.setAction(async ({ proofSource, deploymentPrice, batchTransactionFee }, hre) => {
  const [deployer] = await hre.ethers.getSigners();

  console.log('Deploying...', { proofSource, deploymentPrice, batchTransactionFee });

  await hre.deployments.delete('StakingManager');

  const { address, transactionHash } = await hre.deployments.deploy('StakingManager', {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    from: deployer.address,
    args: [proofSource, deploymentPrice, batchTransactionFee ],
  });
  console.log('StakingManager deploy tx:', transactionHash);
  console.log('StakingManager address:', address);

  await verifyContract(hre, address, [proofSource, deploymentPrice, batchTransactionFee]);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return new StakingManager__factory(deployer).attach(address);
});

//--network amoy deploy:staking-manager --proof-source 0x000 --deployment-price 0 --batch-transaction-fee 0
