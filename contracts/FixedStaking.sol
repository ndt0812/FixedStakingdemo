// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./tokenTHANG.sol";

contract FixedStaking {
    using SafeMath for uint256;
    ERC20 public token;

    struct Term {
        uint256 duration;
        uint256 interestRate;
    }

    mapping(uint256 => Term) public terms;

    //tokens staked
    mapping(address => mapping(uint256 => uint256)) public staked;
    //Profit amount
    mapping(address => mapping(uint256 => uint256)) public rewards;
    //withdrawn timelinez
    mapping(address => mapping(uint256 => uint256)) public withdrawnFromTs;
    //stake end time
    mapping(address => mapping(uint256 => uint256)) private finishAt;
    //staking timeline
    mapping(address => mapping(uint256 => uint256)) private stakedFromTs;
    //one second earned reward
    mapping(address => mapping(uint256 => uint256)) private rewardPerSecond;
    //the first 10% of duration
    mapping(address => mapping(uint256 => uint256)) private tenPercentDuration;
    // staked - fined
    mapping(address => mapping(uint256 => uint256)) private totalFined;
    //token being hold of user
    mapping(address => mapping(uint256 => uint256)) public tokenBeingHold;

    address public owner;
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

    function termInfo(
        uint256 _termId,
        uint256 _duration,
        uint256 _interestRate
    ) external onlyOwner {
        terms[_termId] = Term(_duration, _interestRate);
    }

    function stake(uint256 _termId, uint256 amount) external {
        require(amount > 0, "amount is <= 0");
        require(token.balanceOf(msg.sender) >= amount, "balance is <= amount");
        require(
            staked[msg.sender][_termId] == 0,
            "The staking is not finish or you have not withdrawn"
        );
        require(
            tokenBeingHold[msg.sender][_termId] == 0,
            "Your token is on hold "
        );
        token.transferFrom(msg.sender, address(this), amount);
        staked[msg.sender][_termId] = amount;
        timeWhenStake(_termId, msg.sender);
        tokenWhenStake(_termId, msg.sender);
    }

    function withdraw(uint256 _termId) external {
        require(staked[msg.sender][_termId] > 0, "You haven't staked yet");
        require(finishAt[msg.sender][_termId] > 0, "The staking has ended");
        withdrawnFromTs[msg.sender][_termId] = block.timestamp;
        tokenBeingHold[msg.sender][_termId] = totalFined[msg.sender][_termId];
        if (finishAt[msg.sender][_termId] <= block.timestamp) {
            getReward(_termId);
            whenWithdrawn(_termId, msg.sender);
        } else {
            if (theFirstTenPercent > block.timestamp) {
                staked[msg.sender][_termId] = 0;
                finishAt[msg.sender][_termId] = 0;
                rewards[msg.sender][_termId] = 0;
            } else {
                token.transfer(msg.sender, totalFined[msg.sender][_termId]);
                whenWithdrawn(_termId, msg.sender);
            }
        }
    }

    function afterOneDay(uint256 _termId, address account) public {
        require(
            staked[account][_termId] == 0,
            "The staking time is not over yet"
        );
        require(
            tokenBeingHold[account][_termId] > 0,
            "Your tokens are not held"
        );
        require(
            (5 minutes + withdrawnFromTs[account][_termId] < block.timestamp),
            "Your token is held for 1 day"
        );
        token.transfer(account, tokenBeingHold[account][_termId]);
        whenWithdrawn(_termId, msg.sender);
    }

    function earnedPerSecond(
        uint256 _termId,
        address account
    ) external view returns (uint256) {
        if (finishAt[account][_termId] <= block.timestamp) {
            return rewards[account][_termId];
        }
        uint256 showRewardPerSecond = rewardPerSecond[account][_termId] *
            (block.timestamp - stakedFromTs[account][_termId]);
        return showRewardPerSecond;
    }

    function whenWithdrawn(uint256 _termId, address account) private {
        staked[account][_termId] = 0;
        finishAt[account][_termId] = 0;
        rewards[account][_termId] = 0;
        fined = 0;
        totalFined[account][_termId] = 0;
        tokenBeingHold[account][_termId] = 0;
    }

    function timeWhenStake(uint256 _termId, address account) private {
        Term storage term = terms[_termId];
        finishAt[account][_termId] = term.duration + block.timestamp;
        stakedFromTs[account][_termId] = block.timestamp;
        tenPercentDuration[account][_termId] = (term.duration * 10) / 100;
        theFirstTenPercent =
            tenPercentDuration[account][_termId] +
            stakedFromTs[account][_termId];
    }

    function tokenWhenStake(uint256 _termId, address account) private {
        Term storage term = terms[_termId];
        rewards[account][_termId] =
            (((staked[account][_termId] * term.interestRate) / 100) *
                term.duration) /
            3.154e7;
        fined = ((staked[account][_termId] * 1) / 100);
        totalFined[account][_termId] = staked[account][_termId] - fined;
        rewardPerSecond[account][_termId] =
            rewards[account][_termId] /
            term.duration;
    }

    function getReward(uint256 _termId) private {
        uint reward = rewards[msg.sender][_termId] +
            staked[msg.sender][_termId];
        token.transfer(msg.sender, reward);
    }
}
