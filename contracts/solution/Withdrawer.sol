//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Withdrawer {
    function withdraw(IERC20 erc20) public {
        erc20.transfer(msg.sender, erc20.balanceOf(address(this)));
    }
}
