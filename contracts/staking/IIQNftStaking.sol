// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IIQNftStaking {

    /**
     * @dev Thrown when the address for proof verification is invalid.
     */
    error InvalidProofSourceAddress();

    /**
     * @dev Thrown when the pool size is insufficient for a new staking action.
     */
    error InsufficientPoolSize();

    /**
     * @dev Thrown when trying to stake a token that is already staked.
     */
    error TokenAlreadyStaked();

    /**
     * @dev Thrown when the caller is not the owner of the NFT they are trying to stake.
     */
    error NotTheOwnerOfNft();

    /**
     * @dev Thrown when an attempt is made to withdraw a token that is not staked.
     */
    error NftNotStaked();

    /**
     * @dev Thrown when a user attempts to claim zero tokens.
     */
    error CantClaimZero();

    /**
     * @dev Thrown when a user attempts to withdraw zero tokens.
     */
    error CantWithdrawZero();

    /**
     * @dev Thrown when deployer tries to withdraw reward tokens when pool still active.
     */
    error StakingShouldBeDeactivated();

    /**
     * @dev Thrown when a staking-related action is attempted while staking is not active.
     */
    error StakingNotActive();

    /**
     * @dev Thrown when a user attempts to withdraw nfts that are not staked.
     */
    error UserHasNoStakedNfts();

    /**
     * @notice Thrown when an attempt is made to deposit tokens into the staking pool after tokens have already been deposited.
     */
    error PoolAlreadyFunded();

    /**
     * @notice Emitted when a staker claims their reward tokens.
     * @param staker The address of the staker claiming tokens.
     * @param amount The amount of tokens claimed.
     * @param timestamp The timestamp when the claim occurred.
     */
    event TokensClaimed(address indexed staker, uint256 amount, uint256 timestamp);

    /**
     * @notice Emitted when a staker stakes their tokens.
     * @param staker The address of the staker.
     * @param tokenIds The array of token IDs that were staked.
     * @param timestamp The timestamp when the staking occurred.
     */
    event Staked(address indexed staker, uint256[] tokenIds, uint256 timestamp);

    /**
     * @notice Emitted when a staker withdraws their staked tokens.
     * @param staker The address of the staker withdrawing tokens.
     * @param tokenIds The array of token IDs that were withdrawn.
     * @param timestamp The timestamp when the withdrawal occurred.
     */
    event WithdrawStakedTokens(address indexed staker, uint256[] tokenIds, uint256 timestamp);

    /**
     * @notice Emitted when tokens are deposited into the reward pool.
     * @param rewardTokenAddress The adress of reward token.
     * @param amount The amount of tokens deposited.
     * @param timestamp The timestamp when the deposit occurred.
     */
    event TokensDeposited(address rewardTokenAddress, uint256 amount, uint256 timestamp);

    /**
     * @notice Emitted when staking is deactivated.
     * @param timestamp The timestamp when staking was deactivated.
     */
    event StakingDeactivated(uint256 timestamp);

     /**
     * @notice Emitted when reward tokens was withdrawed by staking pool owner.
     * @param amount The amount of tokens withdrawed.
     */
    event TokensWithdrawedByOwner(uint256 amount);

    /**
     * @dev Allows a user to stake NFTs by providing an array of token IDs.
     * @param tokenIds The array of token IDs to stake.
     * @param signature The signature verifying the stake.
     */
    function stake(uint256[] calldata tokenIds, bytes calldata signature) external;

    /**
     * @dev Allows a staker to claim their reward tokens.
     * @param staker The address of the staker claiming tokens.
     * @param amount The amount of tokens to be claimed.
     * @param signature The signature verifying the claim.
     */
    function claimTokens(address staker, uint256 amount, bytes calldata signature) external;

    /**
     * @dev Allows a staker to withdraw their staked NFTs by providing an array of token IDs.
     * @param tokenIds The array of token IDs to withdraw.
     * @param signature The signature verifying the withdrawal.
     */
    function withdraw(uint256[] calldata tokenIds, bytes calldata signature) external;

    /**
     * @dev Set reward pool address, pool size and deposit rewards tokens.
     * @param rewardTokenAddress Address of ERC20 reward token.
     * @param tokensPoolSize Quantity of reward tokens in staking pool.
     * @notice Full amount should be deposited in 1 transaction.
     */
    function depositRewardTokens(address rewardTokenAddress, uint256 tokensPoolSize) external;

    /**
     * @dev Allows the withdrawal of reward tokens from the pool.
     * @param amount The amount of reward tokens to withdraw.
     * @param signature The signature verifying the claim.
     * @notice Pool should be deactivated to perform.
     */
    function withdrawRewardTokens(uint256 amount, bytes calldata signature) external;

    /**
     * @dev Deactivates staking, preventing any new stakes.
     * @notice Can be called only by staking owner.
     */
    function deactivateStaking() external;

    /**
     * @dev Returns the owner address of the specified staked token ID.
     * @param tokenId The token ID being queried.
     * @return The address of the owner of the specified staked token.
     */
    function getOwnerOfStakedTokenId(uint256 tokenId) external view returns (address);

    /**
     * @dev Returns an array of token IDs staked by a specified address.
     * @param staker The address of the staker.
     * @return An array of token IDs staked by the specified address.
     */
    function getStakedNftsByAddress(address staker) external view returns (uint256[] memory);

    /**
     * @dev Returns the total amount of tokens claimed by a specified address.
     * @param staker The address of the staker.
     * @return The total amount of tokens claimed by the specified address.
     */
    function getClaimedTokensByAddress(address staker) external view returns (uint256);

    /**
     * @dev Checks if the specified address has claimed their tokens.
     * @param staker The address to check.
     * @return True if the specified address has claimed their tokens, false otherwise.
     */
    function hasClaimed(address staker) external view returns (bool);

    /**
     * @dev Returns the maximum size of the reward pool.
     * @return The maximum size of the reward pool in tokens.
     */
    function showMaxPoolSize() external view returns (uint256);

    /**
     * @dev Returns the total amount of tokens claimed from the pool.
     * @return The total amount of tokens that have been claimed.
     */
    function totalTokensClaimed() external view returns (uint256);

    /**
     * @dev Returns the total amount of tokens left in the reward pool.
     * @return The total amount of unclaimed tokens left in the pool.
     */
    function totalTokensLeft() external view returns (uint256);

    /**
     * @dev Returns the reward rate for staking.
     * @return The rate at which rewards are generated for staking.
     */
    function getRewardRate() external view returns (uint256);

    /**
     * @dev Returns the frequency at which rewards are calculated and can be claimed.
     * @return The frequency (in seconds) of reward calculation and availability.
     */
    function getRewardFrequency() external view returns (uint256);

    /**
     * @dev Returns the address of the reward token contract.
     * @return The contract address of the reward token.
     */
    function getRewardTokenAddress() external view returns (address);

    /**
     * @dev Returns the address of the NFT collection associated with this staking contract.
     * @return The contract address of the NFT collection.
     */
    function getNftCollectionAddress() external view returns (address);

    /**
     * @dev Checks if staking is currently active.
     * @return True if staking is active, false otherwise.
     */
    function isStakingActive() external view returns (bool);

    /**
     * @dev Returns the nonce counter for a given address, which can be used to prevent replay attacks.
     * @param reserver The address for which the nonce counter is being queried.
     * @return The current nonce for the given address.
     */
    function nonceCounter(address reserver) external view returns (uint256);

}
