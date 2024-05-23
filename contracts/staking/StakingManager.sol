// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./IIQNftStaking.sol";
import "./IStakingManager.sol";


contract StakingManager is IStakingManager, EIP712, Ownable2Step {
    using Counters for Counters.Counter;

    /**
     * @dev EIP-712 type hash for securely IQNFTStaking deployment.
     * This type hash includes the proofSource address, the nft collection address, and a nonce for replay protection.
     */
    bytes32 private constant DEPLOY_IQ_NFT_STAKING_TYPEHASH = keccak256(
        "DeployNftStaking(address proofSource,address nftCollectionAddress,uint256 nonce)"
    );

    /**
     * @dev EIP-712 type hash for securely tokens staking.
     * This type hash includes the address of the staking contract, the array of tokens to stake, and a nonce for replay protection.
     */
    bytes32 private constant STAKE_TYPEHASH = keccak256(
        "Stake(address stakingContract,uint256[] calldata tokenIds,uint256 nonce)"
    );

    /**
     * @dev Nonce counters for eip712 verification.
     * Used to prevent replay attacks.
    */
    mapping(address => Counters.Counter) private _nonceCounters;

    /**
     * @dev Indicates deployment price of IQ Staking.
     */
    uint256 private _deploymentPrice;

    /**
     * @dev Indicates transaction fee for each staked subsequent NFT in a batch.
     */
    uint256 private _batchTransactionFee;

    /**
     * @dev Stores backend address that will provide the signatures.
     */
    address private _proofSource;

    /**
     * @dev Constructor for the StakingManager contract.
     * @param proofSource Address of the backend that will provide the signature for transaction verifications.
     * @param deploymentPrice Amount of fee for IQ Staking deployment.
     * @param batchTransactionFee Amount of fee for each staked subsequent NFT in a batch.
    */
    constructor(
        address proofSource,
        uint256 deploymentPrice,
        uint256 batchTransactionFee
    ) EIP712("StakingManager", "1") {
        if (proofSource == address(0)) revert InvalidProofSourceAddress();
        _proofSource = proofSource;
        _deploymentPrice = deploymentPrice;
        _batchTransactionFee = batchTransactionFee;
    }

    /**
     * @inheritdoc IStakingManager
     */
    function deployNftStaking(address proofSource, address nftCollectionAddress, bytes calldata signature) payable external returns (address) {
        if (msg.value < _deploymentPrice) revert InsufficientEtherSent();

        uint256 nonce = _useNonce(msg.sender);

        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
            DEPLOY_IQ_NFT_STAKING_TYPEHASH,
            msg.sender,
            nonce,
            proofSource
        )));

        require(_verifySignature(_proofSource, digest, signature));

        IIQNftStaking stakingContract = new IQNftStaking(proofSource, address(this), nftCollectionAddress);
        emit NftStakingDeployed(address(stakingContract), msg.sender, proofSource, nftCollectionAddress);
        return address(stakingContract);
    }

    /**
     * @inheritdoc IStakingManager
     */
    function stake(address stakingContract, uint256[] calldata tokenIds, bytes calldata signature) payable external {

        // verify nonce
        uint256 nonce = _useNonce(msg.sender);

        // generate typed data signature for verification
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
            STAKE_TYPEHASH,
            msg.sender,
            nonce,
            keccak256(abi.encodePacked(tokenIds))
        )));

        // verify that signature from backend is correct
        require(_verifySignature(_proofSource, digest, signature));

        uint256 requiredFee = (tokenIds.length - 1) * _batchTransactionFee;
        if (msg.value < requiredFee) revert InsufficientEtherSent();

        IIQNftStaking(stakingContract).stake(tokenIds, signature);
    }

    /**
     * @inheritdoc IStakingManager
     */
    function withdrawFunds(address payable _to) public onlyOwner {
        uint amount = address(this).balance;
        if(amount > 0) revert CantWithdrawZero();
        (bool sent, ) = _to.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    /**
     * @inheritdoc IStakingManager
     */
    function setDeploymentPrice(uint256 deploymentFee) external onlyOwner {
        _deploymentPrice = deploymentFee;
    }

    /**
     * @inheritdoc IStakingManager
     */
    function setBatchTransactionFee(uint256 batchTransactionFee) external onlyOwner {
        _batchTransactionFee = batchTransactionFee;
    }

    /**
     * @inheritdoc IStakingManager
     */
    function getDeploymentPrice() external view returns (uint256) {
        return _deploymentPrice;
    }

    /**
     * @inheritdoc IStakingManager
     */
     function getBatchTransactionFee() external view returns (uint256) {
        return _batchTransactionFee;
    }

    /**
     * @inheritdoc IStakingManager
     */
     function getProofSourceAddress() external view returns (address) {
        return _proofSource;
    }

     /**
     * @inheritdoc IStakingManager
     */
    function nonceCounter(address user) external view returns (uint256) {
        return _nonceCounters[user].current();
    }

    /**
     * @dev Increments the nonce for the user and returns the used nonce.
     * @param user The address for which the nonce is being incremented.
     * @return The used nonce.
     */
    function _useNonce(address user) internal returns (uint256) {
        _nonceCounters[user].increment();
        return _nonceCounters[user].current() - 1; // Return the used nonce
    }

    /**
     * @dev Verifies the signature for the reservation.
     * @param signer The address that signed the reservation.
     * @param digest The hash of the reservation details.
     * @param signature The signature to verify.
     * @return True if the signature is valid, false otherwise.
     */
    function _verifySignature(
        address signer,
        bytes32 digest,
        bytes memory signature
    ) internal pure returns (bool) {
        return ECDSA.recover(digest, signature) == signer;
    }


}