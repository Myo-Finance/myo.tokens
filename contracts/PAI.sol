pragma solidity ^0.5.16;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";

contract PAI is ERC20, ERC20Detailed, Ownable {
  constructor() public ERC20Detailed("Peso Argentino Intangible", "PAI", 18) {}

  function mint(address guy, uint256 amount) external {
    require(guy != address(0), "!zero_address");
    _mint(guy, amount);
  }

  function burn(uint256 amount) external {
      _burn(msg.sender, amount);
  }
}