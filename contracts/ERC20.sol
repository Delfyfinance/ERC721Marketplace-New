// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Token is ERC20 {
    constructor(string memory __name, string memory _ticker)
        public
        ERC20(__name, _ticker)
    {
        _mint(_msgSender(), 1_000_000 * 10**18);
    }
}
