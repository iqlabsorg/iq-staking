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
import "./IIQNftStaking.sol";

contract IQNftStaking is IIQNftStaking, EIP712, Multicall, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    /**
     * @dev EIP-712 type hash for staking tokens. Used in the stake function to securely stake tokens.
     * This type hash includes the address of the staker, a nonce for replay protection, and the token IDs to stake.
     */
    bytes32 private constant STAKE_TOKENS_TYPEHASH = keccak256(
        "Stake(address staker,uint256 nonce,uint256[] tokenIds)"
    );

     /**
     * @dev EIP-712 type hash for claiming tokens. Used in the claimTokens function to securely claim staking rewards.
     * This type hash includes the address of the staker, a nonce for replay protection, and the amount of tokens to claim.
     */
    bytes32 private constant CLAIM_TOKENS_TYPEHASH = keccak256(
        "ClaimTokens(address staker,uint256 nonce,uint256 amount)"
    );

    /**
     * @dev EIP-712 type hash for withdrawing tokens. Used in the withdraw function to securely withdraw staked tokens.
     * This type hash includes the address of the staker, a nonce for replay protection, and the token IDs to withdraw.
    */
    bytes32 private constant WITHDRAW_TOKENS_TYPEHASH = keccak256(
        "Withdraw(address staker,uint256 nonce,uint256[] tokenIds)"
    );

    /**
     * @dev EIP-712 type hash for withdrawing reward tokens by the owner. Used in the withdrawRewardTokens function to securely withdraw tokens from the contract.
     * This type hash includes the address of the withdrawer, the amount of tokens to withdraw, and a nonce for replay protection.
     */
    bytes32 private constant WITHDRAW_REWARD_TOKENS_TYPEHASH = keccak256(
        "WithdrawRewardTokens(address withdrawer,uint256 amount,uint256 nonce)"
    );

    /**
     * @dev Nonce counters for each reserver.
     * Used to prevent replay attacks.
    */
    mapping(address => Counters.Counter) private _nonceCounters;

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
     * @dev Indicates total quantity of tokens withdrawed by owner.
     */
    uint256 private _tokensWithdrawedByOwner;

    /**
     * @dev Indicates the status of staking pool.
     */
    bool private _stakingActive;

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

    /**
     * @dev Constructor for the IQStaking contract.
     * @param proofSource Address of the backend that will provide the signature for the reservation.
     * @param nftCollectionAddress ERC721 collection eligible for staking.
    */
    constructor(
        address proofSource,
        address nftCollectionAddress
    ) EIP712("IQNftStaking", "1") {
        if (proofSource == address(0)) revert InvalidProofSourceAddress();
        _proofSource = proofSource;
        _nftCollection = IERC721(nftCollectionAddress);
    }

    /**
     * @inheritdoc IIQNftStaking
     */
    function stake(
        uint256[] calldata tokenIds,
        bytes calldata signature
    ) external nonReentrant {
        // check if staking is active
        if (!_stakingActive) revert StakingNotActive();

        // verify nonce
        uint256 nonce = _useNonce(msg.sender);

        // generate typed data signature for verification
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
            STAKE_TOKENS_TYPEHASH,
            msg.sender,
            nonce,
            keccak256(abi.encodePacked(tokenIds))
        )));

        // verify that signature from backend is correct
        require(_verifySignature(_proofSource, digest, signature));

        // execute staking logic
        for (uint i = 0; i < tokenIds.length; i++) {
            if (_nftCollection.ownerOf(tokenIds[i]) != msg.sender) revert NotTheOwnerOfNft();

            _nftCollection.transferFrom(msg.sender, address(this), tokenIds[i]);

            _stakedTokens[msg.sender].push(tokenIds[i]);
            _tokenOwners[tokenIds[i]] = msg.sender;
        }

        // emit event
        emit Staked(msg.sender, tokenIds, block.timestamp);
    }

    /**
     * @inheritdoc IIQNftStaking
     */
    function claimTokens(
        address staker,
        uint256 amount,
        bytes calldata signature
    ) external {
        // basic checks
        if (amount == 0) revert CantClaimZero();
        if (_totalTokensClaimed + amount > _poolSize) revert InsufficientPoolSize();

        // verify nonce
        uint256 nonce = _useNonce(staker);

        // generate typed data signature for verification
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
            CLAIM_TOKENS_TYPEHASH,
            staker,
            nonce,
            amount
        )));

        // verify that signature from backend is correct
        require(_verifySignature(_proofSource, digest, signature));

        // transfer tokens to staker
        _rewardToken.transfer(staker, amount);

        // execute claim logic
        _claimedTokens[staker] += amount;
        _totalTokensClaimed += amount;

        // emit event
        emit TokensClaimed(staker, amount, block.timestamp);
    }

    /**
     * @inheritdoc IIQNftStaking
     */
    function withdraw(
        uint256[] calldata tokenIds,
        bytes calldata signature
    ) external nonReentrant {
        // check that staker is the owner of the NFTs
        for (uint i = 0; i < tokenIds.length; i++) {
            // check that NFT is owned by this contract currently
            if (_nftCollection.ownerOf(tokenIds[i]) != address(this)) revert NftNotStaked();
            // check that staker is the owner of the NFT
            if (_tokenOwners[tokenIds[i]] != msg.sender) revert NotTheOwnerOfNft();
        }

        // verify nonce
        uint256 nonce = _useNonce(msg.sender);

        // generate typed data signature for verification
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
            WITHDRAW_TOKENS_TYPEHASH,
            msg.sender,
            nonce,
            keccak256(abi.encodePacked(tokenIds))
        )));

        // verify that signature from backend is correct
        require(_verifySignature(_proofSource, digest, signature));

        for (uint i = 0; i < tokenIds.length; i++) {
            // transfer NFT back to staker
            _nftCollection.transferFrom(address(this), msg.sender, tokenIds[i]);
            // remove NFT from staking
            _removeNftFromStaking(msg.sender, tokenIds[i]);
        }

        // emit event
        emit WithdrawStakedTokens(msg.sender, tokenIds, block.timestamp);
    }

    function _removeNftFromStaking(address user, uint256 tokenId) private {
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
     * @inheritdoc IIQNftStaking
     */
    function depositRewardTokens(address rewardTokenAddress, uint256 tokensPoolSize, uint256 rewardRate,
        uint256 rewardFrequency) external onlyOwner {
        if (_poolSize != 0) revert PoolAlreadyFunded();
        if (tokensPoolSize == 0) revert PoolSizeMustBePositive();
        if (rewardRate == 0) revert RewardRateMustBePositive();
        if (rewardFrequency == 0) revert RewardFrequencyMustBePositive();


        _rewardToken = IERC20(rewardTokenAddress);
        _poolSize = tokensPoolSize;
        _rewardRate = rewardRate;
        _rewardFrequency = rewardFrequency;

        _rewardToken.transferFrom(msg.sender, address(this), _poolSize);
        _stakingActive = true;
        emit TokensDeposited(rewardTokenAddress, _poolSize, _rewardRate, _rewardFrequency, block.timestamp);
    }

    /**
     * @inheritdoc IIQNftStaking
     */
    function withdrawRewardTokens(uint256 amount, bytes calldata signature) external onlyOwner {
        if (_stakingActive) revert StakingShouldBeDeactivated();
        if (amount == 0) revert CantWithdrawZero();

        uint256 nonce = _useNonce(msg.sender);

        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
            WITHDRAW_REWARD_TOKENS_TYPEHASH,
            msg.sender,
            amount,
            nonce
        )));

        require(_verifySignature(_proofSource, digest, signature));

        _rewardToken.transfer(msg.sender, amount);

        _tokensWithdrawedByOwner = amount;

        emit TokensWithdrawedByOwner(amount);
    }

    /**
     * @inheritdoc IIQNftStaking
     */
    function deactivateStaking() external onlyOwner {
        if (!_stakingActive) revert StakingNotActive();
        _stakingActive = false;
        emit StakingDeactivated(block.timestamp);
    }

    /**
     * @inheritdoc IIQNftStaking
     */
    function getOwnerOfStakedTokenId(uint256 tokenId) external view returns (address) {
        return _tokenOwners[tokenId];
    }

    /**
     * @inheritdoc IIQNftStaking
     */
    function getStakedNftsByAddress(address staker) external view returns (uint256[] memory) {
        return _stakedTokens[staker];
    }

    /**
     * @inheritdoc IIQNftStaking
     */
    function getClaimedTokensByAddress(address staker) external view returns (uint256) {
        return _claimedTokens[staker];
    }

    /**
     * @inheritdoc IIQNftStaking
     */
    function hasClaimed(address staker) external view returns (bool) {
        return _claimedTokens[staker] != 0;
    }

    /**
     * @inheritdoc IIQNftStaking
     */
    function showMaxPoolSize() public view returns (uint256) {
        return _poolSize;
    }

    /**
     * @inheritdoc IIQNftStaking
     */
    function totalTokensClaimed() external view returns (uint256) {
        return _totalTokensClaimed;
    }

    /**
     * @inheritdoc IIQNftStaking
     */
    function totalTokensLeft() public view returns (uint256) {
        return _poolSize - _totalTokensClaimed - _tokensWithdrawedByOwner;
    }

    /**
     * @inheritdoc IIQNftStaking
     */
    function getRewardRate() public view returns (uint256) {
        return _rewardRate;
    }

    /**
     * @inheritdoc IIQNftStaking
     */
    function getRewardFrequency() public view returns (uint256) {
        return _rewardFrequency;
    }

    /**
     * @inheritdoc IIQNftStaking
     */
    function getRewardTokenAddress() public view returns (address) {
        return address(_rewardToken);
    }

    /**
     * @inheritdoc IIQNftStaking
     */
    function getNftCollectionAddress() public view returns (address) {
        return address(_nftCollection);
    }

    /**
     * @inheritdoc IIQNftStaking
     */
    function isStakingActive() public view returns (bool) {
        return _stakingActive;
    }

    /**
     * @inheritdoc IIQNftStaking
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
