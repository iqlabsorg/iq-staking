import { task, types } from 'hardhat/config';
import { ERC721Mock__factory } from '../typechain';
import { verifyContract } from './utils/verify';

task('deploy:nft-mock', 'Deploy the ERC721Mock contract')
.addParam('name', 'name of the mock token', 'TEST', types.string)
.addParam('symbol', 'symbol of the mock token', 'TT', types.string)
.setAction(async ({ name, symbol }, hre) => {
  const [deployer] = await hre.ethers.getSigners();

  console.log('Deploying...', { name, symbol });

  await hre.deployments.delete('ERC721Mock');

  const { address, transactionHash } = await hre.deployments.deploy('ERC721Mock', {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    from: deployer.address,
    args: [name, symbol],
  });
  console.log('ERC721Mock deploy tx:', transactionHash);
  console.log('ERC721Mock address:', address);

  await verifyContract(hre, address, [name, symbol]);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return new ERC721Mock__factory(deployer).attach(address);
});
