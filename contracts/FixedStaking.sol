// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FixedStaking is ERC20 {
    mapping(address => uint256) public staked;
    mapping(address => uint256) public finishAt;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public duration;

    uint256 private fined;
    uint256 private totalFined;

    constructor() ERC20("THANG", "THA") {
        _mint(msg.sender, 500_000_000 * 10 ** uint256(18));
    }

    function setDuration(uint256 _duration) external {
        duration[msg.sender] = _duration;
    }

    function stake(uint256 amount) external {
        require(amount > 0, "amount is <= 0");
        require(balanceOf(msg.sender) >= amount, "balance is <= amount");
        require(duration[msg.sender] > 0, "you must set duration");
        _transfer(msg.sender, address(this), amount);
        finishAt[msg.sender] = duration[msg.sender] + block.timestamp;
        staked[msg.sender] += amount;
        rewards[msg.sender] =
            (((staked[msg.sender] * 7) / 100) * duration[msg.sender]) /
            3.154e7;
        fined = ((staked[msg.sender] * 1) / 100);
        totalFined = staked[msg.sender] - fined;
    }

    function unstake() public {
        require(finishAt[msg.sender] > 0, "The staking is not finish yet");
        if (finishAt[msg.sender] <= block.timestamp) {
            _mint(msg.sender, rewards[msg.sender]);
            _transfer(address(this), msg.sender, staked[msg.sender]);
            staked[msg.sender] -= staked[msg.sender];
            duration[msg.sender] -= duration[msg.sender];
            finishAt[msg.sender] -= finishAt[msg.sender];
            rewards[msg.sender] -= rewards[msg.sender];
            fined -= fined;
            totalFined -= totalFined;
        } else {
            _transfer(address(this), msg.sender, totalFined);
            staked[msg.sender] -= staked[msg.sender];
            duration[msg.sender] -= duration[msg.sender];
            finishAt[msg.sender] -= finishAt[msg.sender];
            totalFined -= totalFined;
            rewards[msg.sender] -= rewards[msg.sender];
            fined -= fined;
        }
    }
}
