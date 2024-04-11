import { subtask, types } from 'hardhat/config';
import { ERC20Mock__factory } from '../typechain';
import { verifyContract } from './utils/verify';

subtask('deploy:token-mock', 'Deploy the ERC20Mock contract')
.addParam('initialSupply', 'The initial supply of tokens to mint', undefined, types.string)
.addParam('customSigner', 'The wallet to use as the signer', undefined, types.any, true)
.setAction(async ({ initialSupply, customSigner }, hre) => {
  let signer;

  if (!customSigner) {
    const [deployer] = await hre.ethers.getSigners();
    signer = deployer;
  } else {
    signer = customSigner;
  }

  await hre.deployments.delete('ERC20Mock');

  const initialSupplyWei = hre.ethers.parseEther(initialSupply);

  const { address, transactionHash } = await hre.deployments.deploy('ERC20Mock', {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    from: signer.address,
    args: [initialSupplyWei],
  });
  console.log('ERC20Mock deploy tx:', transactionHash);
  console.log('ERC20Mock address:', address);

  await verifyContract(hre, address, [initialSupplyWei]);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return new ERC20Mock__factory(signer).attach(address);
});
