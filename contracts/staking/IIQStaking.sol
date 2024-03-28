// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IIQStaking {
    error externalRewardsDisabled();
    error InvalidProofSourceAddress();
    error InsufficientPoolSize();
    error TokenAlreadyStaked();
    error notTheOwnerOfNFT();
    error CantClaimZero();

    event TokensClaimed(address indexed staker, uint256 amount, uint256 timestamp);
    event Staked(address indexed staker, uint256[] tokenIds, uint256 timestamp);
    event WithdrawStakedTokens(address indexed staker, uint256[] tokenIds, uint256 timestamp);

    function stake(uint256[] calldata tokenIds) external;
    function claimTokens(address staker, uint256 amount, bytes calldata signature) external;
    function withdraw(uint256[] calldata tokenIds) external;
    function setRewardTokenAddress(address rewardTokenAddress) external;
    function depositRewardTokens(uint256 _amount) external;
    function withdrawRewardTokens(uint256 _amount) external;
    function getOwnerOfStakedTokenId(uint256 tokenId) external view returns (address);
    function getStakedTokensByAddress(address staker) external view returns (uint256[] memory);
    function getClaimedTokensByAddress(address staker) external view returns (uint256);
    function hasClaimed(address staker) external view returns (bool);
    function showMaxPoolSize() external view returns (uint256);
    function totalTokensClaimed() external view returns (uint256);
    function totalTokensLeft() external view returns (uint256);
    function getRewardRate() external view returns (uint256);
    function getRewardFrequency() external view returns (uint256);
    function getRewardTokenAddress() external view returns (address);
    function getNftCollectionAddress() external view returns (address);
    function nonceCounter(address reserver) external view returns (uint256);
}
