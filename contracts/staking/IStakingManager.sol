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
     * @dev Set new staking manager for staking contract.
     * @param stakingContract Address of the staking contract.
     * @param stakingManager New staking manager address.
     */
    function setStakingManager(address stakingContract, address stakingManager) external;

    /**
     * @dev Sets and activates the individual batch transaction fee for the specified staking contract.
     * @param stakingContract The address of the staking contract.
     * @param batchTransactionFee The individual batch transaction fee to be set for the specified staking contract.
     */
    function setIndividualContractBatchTransactionFee(address stakingContract, uint256 batchTransactionFee) external;

    /**
     * @dev Deactivates the individual batch transaction fee for the specified staking contract.
     * @param stakingContract The address of the staking contract.
     */
    function deactivateIndividualContractBatchTransactionFee(address stakingContract) external;

    /**
     * @dev Returns whether the individual batch transaction fee is active for the specified contract.
     * @param stakingContract The address of the staking contract.
     * @return True if the individual batch transaction fee is active, false otherwise.
     */
    function isBatchTransactionFeeActive(address stakingContract) external view returns (bool);

    /**
     * @dev Returns the individual batch transaction fee for the specified contract.
     * @param stakingContract The address of the staking contract.
     * @return The individual batch transaction fee.
     */
    function getIndividualBatchTransactionFee(address stakingContract) external view returns (uint256);

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
     * @dev Get contract Balance.
     * @return Actual contract balance.
     */
    function getBalance() external view returns (uint256);

    /**
     * @dev Get the current nonce for a user.
     * @param user User address.
     * @return Current nonce.
     */
    function nonceCounter(address user) external view returns (uint256);
}