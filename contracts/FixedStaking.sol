// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./tokenTHANG.sol";

contract FixedStaking {
    using SafeMath for uint256;
    ERC20 public token;

    //tokens staked
    mapping(address => uint256) public staked;
    //Profit amount
    mapping(address => uint256) public rewards;
    //withdrawn timelinez
    mapping(address => uint256) public withdrawnFromTs;
    //stake end time
    mapping(address => uint256) private finishAt;
    //staking timeline
    mapping(address => uint256) private stakedFromTs;
    //one second earned reward
    mapping(address => uint256) private rewardPerSecond;
    //the first 10% of duration
    mapping(address => uint256) private tenPercentDuration;
    // staked - fined
    mapping(address => uint256) private totalFined;
    //token being hold of user
    mapping(address => uint256) public tokenBeingHold;

    address public owner;
    uint256 public duration;
    uint256 private theFirstTenPercent;
    uint256 private fined;

    constructor(address _token) {
        owner = msg.sender;
        token = ERC20(_token);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "you are not Owner");
        _;
    }

    function setDuration(uint256 _duration) external onlyOwner {
        duration = _duration;
    }

    function stake(uint256 amount) external {
        require(amount > 0, "amount is <= 0");
        require(token.balanceOf(msg.sender) >= amount, "balance is <= amount");
        require(duration > 0, "you must set duration");
        require(
            staked[msg.sender] == 0,
            "The staking is not finish or you have not withdrawn"
        );
        require(tokenBeingHold[msg.sender] == 0, "Your token is on hold ");
        token.transferFrom(msg.sender, address(this), amount);
        staked[msg.sender] = amount;
        timeWhenStake(msg.sender);
        tokenWhenStake(msg.sender);
    }

    function withdrawn() external {
        require(staked[msg.sender] > 0, "You haven't staked yet");
        require(finishAt[msg.sender] > 0, "The staking has ended");
        withdrawnFromTs[msg.sender] = block.timestamp;
        tokenBeingHold[msg.sender] = totalFined[msg.sender];
        if (finishAt[msg.sender] <= block.timestamp) {
            getReward();
            whenWithdrawn(msg.sender);
        } else {
            if (theFirstTenPercent > block.timestamp) {
                staked[msg.sender] = 0;
                finishAt[msg.sender] = 0;
                rewards[msg.sender] = 0;
            } else {
                token.transfer(msg.sender, totalFined[msg.sender]);
                whenWithdrawn(msg.sender);
            }
        }
    }

    function afterOneDay(address account) public {
        require(staked[account] == 0, "The staking time is not over yet");
        require(tokenBeingHold[account] > 0, "Your tokens are not held");
        require(
            (5 minutes + withdrawnFromTs[account] < block.timestamp),
            "Your token is held for 1 day"
        );
        token.transfer(account, tokenBeingHold[account]);
        whenWithdrawn(msg.sender);
    }

    function earnedPerSecond(address account) external view returns (uint256) {
        require(duration > 0, "You must set duration first!");
        require(rewards[account] > 0, "You are not staking yet");
        if (finishAt[account] <= block.timestamp) {
            return rewards[account];
        }
        uint256 showRewardPerSecond = rewardPerSecond[account] *
            (block.timestamp - stakedFromTs[account]);
        return showRewardPerSecond;
    }

    function whenWithdrawn(address account) private {
        staked[account] = 0;
        finishAt[account] = 0;
        rewards[account] = 0;
        fined = 0;
        totalFined[account] = 0;
        tokenBeingHold[account] = 0;
    }

    function timeWhenStake(address account) private {
        finishAt[account] = duration + block.timestamp;
        stakedFromTs[account] = block.timestamp;
        tenPercentDuration[account] = (duration * 10) / 100;
        theFirstTenPercent =
            tenPercentDuration[account] +
            stakedFromTs[account];
    }

    function tokenWhenStake(address account) private {
        rewards[account] = (((staked[account] * 7) / 100) * duration) / 3.154e7;
        fined = ((staked[account] * 1) / 100);
        totalFined[account] = staked[account] - fined;
        rewardPerSecond[account] = rewards[account] / duration;
    }

    function getReward() private {
        uint reward = rewards[msg.sender] + staked[msg.sender];
        token.transfer(msg.sender, reward);
    }
}
