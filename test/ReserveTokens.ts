import { expect } from 'chai';
import { ethers, run } from 'hardhat';
import { BigNumberish, Signer } from 'ethers';
import { ReserveTokens } from '../typechain';

async function signAndReserveTokens(
  reserveTokens: ReserveTokens,
  proofSource: Signer,
  receiverAddress: string,
  amount: BigNumberish,
): Promise<string> {
  const nonce = await reserveTokens.nonceCounter(receiverAddress);

  const domain = {
    name: 'ReserveTokens',
    version: '1',
    chainId: (await ethers.provider.getNetwork()).chainId,
    verifyingContract: await reserveTokens.getAddress(),
  };

  const types = {
    ReserveTokens: [
      { name: 'reserver', type: 'address' },
      { name: 'nonce', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
  };

  const message = {
    reserver: receiverAddress,
    nonce: nonce.toString(),
    amount: amount.toString(),
  };

  const signature = await proofSource.signTypedData(domain, types, message);

  await reserveTokens.reserveTokens(receiverAddress, amount, signature);

  return signature;
}

describe('ReserveTokens Contract', function () {
  const RESERVED_AMOUNT = ethers.parseEther('1');
  const POOL_SIZE = ethers.parseEther('1700000');

  let deployer: Signer;
  let proofSource: Signer;
  let reserveTokens: ReserveTokens;
  let receiverAddress: string;
  let receiver: Signer;

  beforeEach(async function () {
    [deployer, proofSource, receiver] = await ethers.getSigners();

    console.log('ProofSourceAddress' + (await proofSource.getAddress()));
    reserveTokens = (await run('deploy:reserve-tokens', {
      proofSource: await proofSource.getAddress(),
      poolSize: POOL_SIZE.toString(),
    })) as ReserveTokens;
    receiverAddress = await receiver.getAddress();
  });

  describe('Reserve Tokens performing', function () {
    describe('reserveTokens', function () {
      it('should allow token reservation with a valid signature', async function () {
        await signAndReserveTokens(reserveTokens, proofSource, receiverAddress, RESERVED_AMOUNT);
        expect(await reserveTokens.hasReserved(receiverAddress)).to.equal(true);
        expect(await reserveTokens.getReservedTokens(receiverAddress)).to.equal(RESERVED_AMOUNT);
      });
      it('reserving tokens with an invalid signature should fail', async function () {
        // Simulate an invalid signature
        const invalidSignature = '0x' + '00'.repeat(65);

        await expect(
          reserveTokens.reserveTokens(receiverAddress, RESERVED_AMOUNT, invalidSignature),
        ).to.be.revertedWith('ECDSA: invalid signature');
      });
      it('should not allow reserving tokens if already reserved', async function () {
        await signAndReserveTokens(reserveTokens, proofSource, receiverAddress, RESERVED_AMOUNT);
        await expect(
          signAndReserveTokens(reserveTokens, proofSource, receiverAddress, RESERVED_AMOUNT),
        ).to.be.revertedWithCustomError(reserveTokens, 'TokensAlreadyReserved');
      });
      it('nonce should increment after a successful reservation', async function () {
        await signAndReserveTokens(reserveTokens, proofSource, receiverAddress, RESERVED_AMOUNT);
        const reservedTokens = await reserveTokens.getReservedTokens(receiverAddress);
        await expect(reservedTokens).to.be.equal(RESERVED_AMOUNT);
      });

      it('should not allow reserving tokens if the pool is empty', async function () {
        const amount = ethers.parseEther('1700001');
        await expect(
          signAndReserveTokens(reserveTokens, proofSource, receiverAddress, amount)
        ).to.be.revertedWithCustomError(reserveTokens, 'InsufficientPoolSize');
      });
    });

    describe('getReservedTokens', function () {
      it('should return the reserved amount for a reserved address', async function () {
        await signAndReserveTokens(reserveTokens, proofSource, receiverAddress, RESERVED_AMOUNT);
        expect(await reserveTokens.getReservedTokens(receiverAddress)).to.equal(RESERVED_AMOUNT);
      });
      it('should return 0 for an address that has not reserved', async function () {
        expect(await reserveTokens.getReservedTokens(receiverAddress)).to.equal(0);
      });
    });

    describe('hasReserved', function () {
      it('should return true for an address that has reserved', async function () {
        await signAndReserveTokens(reserveTokens, proofSource, receiverAddress, RESERVED_AMOUNT);
        expect(await reserveTokens.hasReserved(receiverAddress)).to.equal(true);
      });
      it('should return false for an address that has not reserved', async function () {
        expect(await reserveTokens.hasReserved(receiverAddress)).to.equal(false);
      });
    });

    describe('nonceCounter', function () {
      it('should return 0 for an address that has not reserved', async function () {
        expect(await reserveTokens.nonceCounter(receiverAddress)).to.equal(0);
      });
      it('should return 1 for an address that has reserved', async function () {
        await signAndReserveTokens(reserveTokens, proofSource, receiverAddress, RESERVED_AMOUNT);
        expect(await reserveTokens.nonceCounter(receiverAddress)).to.equal(1);
      });
    });
  });

  describe('totalTokensReserved', function () {
    it('should return the total amount of tokens reserved', async function () {
      await signAndReserveTokens(reserveTokens, proofSource, receiverAddress, RESERVED_AMOUNT);
      expect(await reserveTokens.totalTokensReserved()).to.equal(RESERVED_AMOUNT);
    });

    it('should return 0 if no tokens have been reserved', async function () {
      expect(await reserveTokens.totalTokensReserved()).to.equal(0);
    });
  });

  describe('poolSize', function () {
    it('should return the pool size', async function () {
      expect(await reserveTokens.poolSize()).to.equal(POOL_SIZE);
    });
  });
});
