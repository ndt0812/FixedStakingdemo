// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract tokenTHANG is ERC20 {
    constructor() ERC20("THANG", "THA") {
        _mint(msg.sender, 1_000_000_000 * 10 ** uint256(18));
    }
}
