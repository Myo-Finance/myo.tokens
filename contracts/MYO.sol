/*
MIT License

Copyright (c) 2020 Myo.Finance

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

pragma solidity ^0.5.16;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/access/Roles.sol";

contract MYO is ERC20, ERC20Detailed {
    using Roles for Roles.Role;

    Roles.Role private _minters;
    Roles.Role private _gov;

    // addresses and admins are expected to be in strictly increasing order
    // this is to prevent duplicate entries.
    constructor()
        public
        ERC20Detailed("MYO.Finance Governance Token", "MYO", 18)
    {
        _minters.add(msg.sender);
        _gov.add(msg.sender);
    }

    modifier onlyGovernance() {
        require(isGovernor(msg.sender), "MYO/!gov_role");
        _;
    }

    modifier onlyMinter() {
        require(isMinter(msg.sender), "MYO/!minter");
        _;
    }

    function mint(address guy, uint256 amount) external onlyMinter {
        _mint(guy, amount);
    }

    // Not Sure if this should be restricted to minters;
    // burn is called on the msg.sender's holdings.
    // it might be useful to prevent accidents.
    function burn(address guy, uint256 amount) external onlyMinter {
        _burn(guy, amount);
    }

    function addGovernor(address guy) external onlyGovernance {
        require(guy != address(0), "MYO/address_zero");
        if (!_gov.has(guy)) _gov.add(guy);
    }

    function removeGovernor(address guy) external onlyGovernance {
        _gov.remove(guy);
    }

    function isGovernor(address guy) public view returns (bool) {
        return _gov.has(guy);
    }

    function addMinter(address guy) external onlyGovernance {
        require(guy != address(0), "MYO/address_zero");
        if (!_minters.has(guy)) _minters.add(guy);
    }

    function removeMinter(address guy) external onlyGovernance {
        require(guy != address(0), "MYO/address_zero");
        _minters.remove(guy);
    }

    function isMinter(address guy) public view returns (bool) {
        return _minters.has(guy);
    }
}
