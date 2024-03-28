import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { pause } from './pause';

export const verifyContract = async (hre: HardhatRuntimeEnvironment, address: string, constructorArguments: any) => {
  if (hre.network.name !== 'hardhat') {
    await pause(10000);

    try {
      await hre.run('verify:verify', {
        address,
        constructorArguments,
      });
      return;
    } catch (error) {
      console.error('Verification failed:', error);
    }
  }
};
