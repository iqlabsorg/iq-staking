import { task, types } from 'hardhat/config';
import { IQNftStaking__factory } from '../typechain';
import { verifyContract } from './utils/verify';

task('deploy:nft-staking', 'Deploy the IQNftStaking contract')
.addParam('proofSource', 'Address of the backend that will provide the signatures', undefined, types.string, false)
.addParam('nftCollectionAddress', 'Address of the NFT collection eligible for staking', undefined, types.string, false)
.setAction(async ({ proofSource, nftCollectionAddress }, hre) => {
  const [deployer] = await hre.ethers.getSigners();

  console.log('Deploying...', { proofSource, nftCollectionAddress });

  await hre.deployments.delete('IQNftStaking');

  const { address, transactionHash } = await hre.deployments.deploy('IQNftStaking', {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    from: deployer.address,
    args: [proofSource, nftCollectionAddress ],
  });
  console.log('IQNftStaking deploy tx:', transactionHash);
  console.log('IQNftStaking address:', address);

  await verifyContract(hre, address, [proofSource, nftCollectionAddress]);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return new IQNftStaking__factory(deployer).attach(address);
});

//--network mumbai deploy:nft-staking --proof-source 0x000 --nft-collection-address 0x000 --reward-rate 000 --reward-frequency 000
