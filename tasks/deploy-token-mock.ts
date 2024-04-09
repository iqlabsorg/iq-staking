import { task, types } from 'hardhat/config';
import { ERC20Mock__factory } from '../typechain';
import { verifyContract } from './utils/verify';

task('deploy:token-mock', 'Deploy the ERC20Mock contract')
.addParam('initialSupply', 'The initial supply of tokens to mint', undefined, types.string)
.setAction(async ({ initialSupply }, hre) => {

  const [deployer] = await hre.ethers.getSigners();

  await hre.deployments.delete('ERC20Mock');

  const initialSupplyWei = hre.ethers.parseEther(initialSupply);

  const { address, transactionHash } = await hre.deployments.deploy('ERC20Mock', {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    from: deployer.address,
    args: [initialSupplyWei],
  });
  console.log('ERC20Mock deploy tx:', transactionHash);
  console.log('ERC20Mock address:', address);

  await verifyContract(hre, address, [initialSupplyWei]);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return new ERC20Mock__factory(deployer).attach(address);
});
