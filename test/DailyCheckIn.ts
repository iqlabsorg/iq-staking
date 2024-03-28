import { expect } from 'chai';
import { ethers, run } from 'hardhat';
import { BigNumberish, Signer, formatUnits, id } from 'ethers';
import { DailyCheckIn, DailyCheckIn__factory } from '../typechain';

describe('DailyCheckIn Contract', function () {
  let deployer: Signer;
  let dailyCheckIn: DailyCheckIn;
  let user1: Signer;
  let user2: Signer;

  beforeEach(async function () {
    [deployer, user1, user2] = await ethers.getSigners();

    dailyCheckIn = (await run('deploy:daily-checks', {})) as DailyCheckIn;

    const deployerAddress = await deployer.getAddress();
    const dailyCheckInAddress = await dailyCheckIn.getAddress();
  });

  describe('Camaping conditions', function () {
    it('Camaping should be active after deployment', async function () {
      expect(await dailyCheckIn.isCampaignOver()).to.equal(false);
    });

    it('should allow the owner to take a snap and stop campaing', async function () {
      await dailyCheckIn.connect(deployer).takeSnap();
      await expect(dailyCheckIn.connect(user1).dailyCheck()).to.be.revertedWithCustomError(
        dailyCheckIn,
        'CampaignOver',
      );
    });

    it('only owner can take a snap', async function () {
      await expect(dailyCheckIn.connect(user1).takeSnap()).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('should indicate whether the campaign is over', async function () {
      expect(await dailyCheckIn.isCampaignOver()).to.be.false;
      await dailyCheckIn.connect(deployer).takeSnap();
      expect(await dailyCheckIn.isCampaignOver()).to.be.true;
    });

    it('should revert dailyCheck() after the campaign is over', async function () {
      await dailyCheckIn.connect(deployer).takeSnap();
      await expect(dailyCheckIn.connect(user1).dailyCheck()).to.be.revertedWithCustomError(
        dailyCheckIn,
        'CampaignOver',
      );
    });
  });

  describe('dailyCheck performing', function () {
    it('dailyCheck should emit address and timestamp', async function () {
      const nextTimestamp = (await ethers.provider.getBlock('latest').then(b => b.timestamp)) + 1;
      await expect(dailyCheckIn.connect(user1).dailyCheck())
        .to.emit(dailyCheckIn, 'Checked')
        .withArgs(await user1.getAddress(), nextTimestamp);
    });

    it('dailyCheck should work again after 24 hours', async function () {
      await dailyCheckIn.connect(user1).dailyCheck();
      await ethers.provider.send('evm_increaseTime', [24 * 3600 + 1]);
      await ethers.provider.send('evm_mine');
      await expect(dailyCheckIn.connect(user1).dailyCheck()).to.be.not.reverted;
    });

    it('dailyCheck should not work before 24h timeout', async function () {
      await dailyCheckIn.connect(user1).dailyCheck();
      await expect(dailyCheckIn.connect(user1).dailyCheck()).to.be.revertedWithCustomError(
        dailyCheckIn,
        'CheckInTooSoon',
      );
    });

    it('nextCheckInTime returns 0 for the new users', async function () {
      const nextCheckInTime = await dailyCheckIn.getNextCheckInTime(user2.address);
      expect(nextCheckInTime).to.equal(0);
    });

    it('nextCheckInTime should correctly calculate time', async function () {
      await dailyCheckIn.connect(user1).dailyCheck();
      const nextCheckInTime = await dailyCheckIn.getNextCheckInTime(user1.address);
      const currentTimestamp = await ethers.provider.getBlock('latest').then(b => b.timestamp);
      //should be +24h
      expect(nextCheckInTime).to.equal(currentTimestamp + 24 * 3600);
    });

    it('lastCheckTimestamp returns 0 for the new users', async function () {
      const lastCheckTimestamp = await dailyCheckIn.showLastCheckTimestamp(user2.address);
      expect(lastCheckTimestamp).to.equal(0);
    });

    it('lastCheckIn updaes correctly after a successful daily check', async function () {
      await dailyCheckIn.connect(user1).dailyCheck();
      const lastCheckInTime = await dailyCheckIn.showLastCheckTimestamp(user1.address);
      expect(lastCheckInTime).to.be.greaterThan(0);
    });
    it('lastCheckTimestamp should return correct timestamp', async function () {
      await dailyCheckIn.connect(user1).dailyCheck();
      const lastCheckTimestamp = await dailyCheckIn.showLastCheckTimestamp(user1.address);
      const currentTimestamp = await ethers.provider.getBlock('latest').then(b => b.timestamp);
      expect(lastCheckTimestamp).to.equal(currentTimestamp);
    });
  });
});
