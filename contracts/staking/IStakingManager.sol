// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IQNftStaking.sol";

interface IStakingManager {

    /**
     * @notice Thrown when an attempt is made to withdraw funds from empty contract.
     */
    error CantWithdrawZero();

    /**
     * @notice Thrown when an attempt is made to send insufficient amount of ether to cover the fees.
     */
    error InsufficientEtherSent();

    /**
     * @notice Thrown when the address for proof verification is invalid.
     */
    error InvalidProofSourceAddress();

    /**
     * @notice Emitted when user deploy IQ NFT Staking.
     */
    event NftStakingDeployed(address indexed stakingContract, address indexed owner, address proofSource, address nftCollectionAddress);

    /**
     * @dev Deploy IQNftStaking contract.
     * @param proofSource Backend address.
     * @param nftCollectionAddress ERC721 collection address.
     * @param signature eip712 signature.
     * @return Deployed contract address.
     */
    function deployNftStaking(address proofSource, address nftCollectionAddress, bytes calldata signature) payable external returns (address);

    /**
     * @dev Stake tokens in a specified staking contract.
     * @param stakingContract Address of the staking contract.
     * @param tokenIds Array of token IDs.
     * @param signature Backend signature.
     */
    function stake(address stakingContract, uint256[] calldata tokenIds, bytes calldata signature) payable external;

    /**
     * @dev Withdraw contract funds to a specified address.
     * @param _to Address to withdraw funds to.
     */
    function withdrawFunds(address payable _to) external;

    /**
     * @dev Set the deployment fee.
     * @param deploymentFee New deployment fee.
     */
    function setDeploymentPrice(uint256 deploymentFee) external;

    /**
     * @dev Set the batch transaction fee.
     * @param batchTransactionFee New batch transaction fee.
     */
    function setBatchTransactionFee(uint256 batchTransactionFee) external;

    /**
     * @dev Get the current deployment price.
     * @return Deployment price.
     */
    function getDeploymentPrice() external view returns (uint256);

    /**
     * @dev Get the current batch transaction fee.
     * @return Batch transaction fee.
     */
    function getBatchTransactionFee() external view returns (uint256);

    /**
     * @dev Get the proof source address.
     * @return Proof source address.
     */
    function getProofSourceAddress() external view returns (address);

    /**
     * @dev Get the current nonce for a user.
     * @param user User address.
     * @return Current nonce.
     */
    function nonceCounter(address user) external view returns (uint256);
}