// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Multicall.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IIQStaking.sol";

contract IQStaking is IIQStaking, EIP712, Multicall, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    bytes32 private constant RESERVE_TOKENS_TYPEHASH = keccak256(
        "ReserveTokens(address reserver,uint256 nonce,uint256 amount)"
    );

    enum RewardDistribution { Internal, External }

    RewardDistribution public _rewardDistribution;

    /**
     * @dev NFT collection for staking.
     */
    IERC721 private _nftCollection;

    /**
     * @dev ERC20 reward token, that use for reward distribution.
     */
    IERC20 private _rewardToken;

    /**
     * @dev Indicates IQ signer account.
     */
    address private _proofSource;

    /**
     * @dev Indicates maximum pool size.
     */
    uint256 private _poolSize;

    /**
     * @dev Indicates quantity of tokens, that staker get for 1 NFT in staking per 1 tic.
     */
    uint256 private _rewardRate;

    /**
     * @dev Indicates frequency of reward discribution (tics).
     */
    uint256 private _rewardFrequency;

    /**
     * @dev Indicates total quantity of claimed tokens.
     */
    uint256 private _totalTokensClaimed;

    /**
     * @dev Indicates staked tokens by address.
     */
    mapping(address => uint256[]) private _stakedTokens;

    /**
     * @dev Indicates owners of staked tokens.
     */
    mapping(uint256 => address) private _tokenOwners;

    /**
     * @dev Indicates quantity of claimed tokens per address.
     */
    mapping(address => uint256) private _claimedTokens;

    mapping(address => Counters.Counter) private _nonceCounters;




    /**
     * @dev Constructor for the ReserveTokens contract.
     * @param proofSource Address of the backend that will provide the signature for the reservation.
     * @param tokensPoolSize The total amount of tokens that can be reserved.
    */
    constructor(
        address proofSource,
        uint256 tokensPoolSize,
        RewardDistribution rewardDistribution,
        address nftCollectionAddress,
        uint256 rewardRate,
        uint256 rewardFrequency
    ) EIP712("ReserveTokens", "1") {
        if (proofSource == address(0)) revert InvalidProofSourceAddress();
        _proofSource = proofSource;
        _poolSize = tokensPoolSize;
        _rewardDistribution = rewardDistribution;
        _nftCollection = IERC721(nftCollectionAddress);
        _rewardRate = rewardRate;
        _rewardFrequency = rewardFrequency;
    }

    /**
     * @inheritdoc IIQStaking
     */
    function stake(uint256[] calldata tokenIds) external nonReentrant {
        for (uint i = 0; i < tokenIds.length; i++) {
            if (_nftCollection.ownerOf(tokenIds[i]) != msg.sender) revert notTheOwnerOfNFT();
            //if (_tokenOwners[tokenIds[i]] != address(0)) revert TokenAlreadyStaked();

            _nftCollection.transferFrom(msg.sender, address(this), tokenIds[i]);

            _stakedTokens[msg.sender].push(tokenIds[i]);
            _tokenOwners[tokenIds[i]] = msg.sender;
        }
        emit Staked(msg.sender, tokenIds, block.timestamp);
    }

    /**
     * @inheritdoc IIQStaking
     */
    function claimTokens(
        address staker,
        uint256 amount,
        bytes calldata signature
    ) external {
        if (amount == 0) revert CantClaimZero();
        if (_totalTokensClaimed + amount > _poolSize) revert InsufficientPoolSize();

        uint256 nonce = _useNonce(staker);

        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
            RESERVE_TOKENS_TYPEHASH,
            staker,
            nonce,
            amount
        )));

        require(_verifySignature(_proofSource, digest, signature));

        _claimedTokens[staker] = amount;
        _totalTokensClaimed += amount;

        emit TokensClaimed(staker, amount, block.timestamp); //do we need timestamp here?
    }

    /**
     * @inheritdoc IIQStaking
     */
    function withdraw(uint256[] calldata tokenIds) external nonReentrant {
        for (uint i = 0; i < tokenIds.length; i++) {
            if (_tokenOwners[tokenIds[i]] != msg.sender) revert notTheOwnerOfNFT();

            require(_nftCollection.ownerOf(tokenIds[i]) == address(this), "Token is not staked");

            _nftCollection.transferFrom(address(this), msg.sender, tokenIds[i]);

            _removeTokenFromStaking(msg.sender, tokenIds[i]);
        }
        emit WithdrawStakedTokens(msg.sender, tokenIds, block.timestamp);
    }

    function _removeTokenFromStaking(address user, uint256 tokenId) private {
        uint256[] storage stakedTokens = _stakedTokens[user];
        for (uint i = 0; i < stakedTokens.length; i++) {
            if (stakedTokens[i] == tokenId) {
                stakedTokens[i] = stakedTokens[stakedTokens.length - 1];
                stakedTokens.pop();
                break;
            }
        }
        delete _tokenOwners[tokenId];
    }

    /**
     * @inheritdoc IIQStaking
     */
    function setRewardTokenAddress(address rewardTokenAddress) external onlyOwner {
        if (_rewardDistribution == RewardDistribution.External) revert  externalRewardsDisabled();
        _rewardToken = IERC20(rewardTokenAddress);
    }

    /**
     * @inheritdoc IIQStaking
     */
    function depositRewardTokens(uint256 _amount) external onlyOwner {
        if (_rewardDistribution == RewardDistribution.External) revert  externalRewardsDisabled();
        _rewardToken.transferFrom(msg.sender, address(this), _amount);
    }

    /**
     * @inheritdoc IIQStaking
     * @notice DEVELOPMENT IN PROGRESS
     */
    function withdrawRewardTokens(uint256 _amount) external onlyOwner {
        if (_rewardDistribution == RewardDistribution.External) revert  externalRewardsDisabled();
        _rewardToken.transfer(msg.sender, _amount);
    }

    /**
     * @inheritdoc IIQStaking
     */
    function getOwnerOfStakedTokenId(uint256 tokenId) external view returns (address) {
        return _tokenOwners[tokenId];
    }

    /**
     * @inheritdoc IIQStaking
     */
    function getStakedTokensByAddress(address staker) external view returns (uint256[] memory) {
        return _stakedTokens[staker];
    }

    /**
     * @inheritdoc IIQStaking
     */
    function getClaimedTokensByAddress(address staker) external view returns (uint256) {
        return _claimedTokens[staker];
    }

    /**
     * @inheritdoc IIQStaking
     */
    function hasClaimed(address staker) external view returns (bool) {
        return _claimedTokens[staker] != 0;
    }

    /**
     * @inheritdoc IIQStaking
     */
    function showMaxPoolSize() public view returns (uint256) {
        return _poolSize;
    }

    /**
     * @inheritdoc IIQStaking
     */
    function totalTokensClaimed() external view returns (uint256) {
        return _totalTokensClaimed;
    }

    /**
     * @inheritdoc IIQStaking
     */
    function totalTokensLeft() public view returns (uint256) {
        return _poolSize - _totalTokensClaimed;
    }

    /**
     * @inheritdoc IIQStaking
     */
    function getRewardRate() public view returns (uint256) {
        return _rewardRate;
    }

    /**
     * @inheritdoc IIQStaking
     */
    function getRewardFrequency() public view returns (uint256) {
        return _rewardFrequency;
    }

    /**
     * @inheritdoc IIQStaking
     */
    function getRewardTokenAddress() public view returns (address) {
        return address(_rewardToken);
    }

    /**
     * @inheritdoc IIQStaking
     */
    function getNftCollectionAddress() public view returns (address) {
        return address(_nftCollection);
    }

    /**
     * @inheritdoc IIQStaking
     */
    function nonceCounter(address reserver) external view returns (uint256) {
        return _nonceCounters[reserver].current();
    }

    /**
     * @dev Increments the nonce for the reserver and returns the used nonce.
     * @param reserver The address for which the nonce is being incremented.
     * @return The used nonce.
     */
    function _useNonce(address reserver) internal returns (uint256) {
        _nonceCounters[reserver].increment();
        return _nonceCounters[reserver].current() - 1; // Return the used nonce
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
