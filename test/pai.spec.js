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

const {use, expect} = require("chai");
const {ethers} = require("ethers");
const {solidity, deployContract} = require("ethereum-waffle");
const {getProvider} = require("./setup");

const PAI = require("../build/PAI.json");
const {parseEther} = require("ethers/lib/utils");

use(solidity);

describe("PAI ERC20 smart contract", () => {
  let token;
  let wallet, walletTo;
  let wallets;
  let provider;

  before(async () => {
    provider = await getProvider();
    wallets = provider.getWallets();
    wallet = wallets[0];
    walletTo = wallets[1];
  });

  // parameters to use for our test coin
  const COIN_NAME = "Peso Argentino Intangible";
  const TICKER = "PAI";
  const NUM_DECIMALS = 18;

  /* Deploy a new ERC20 Token before each test */
  beforeEach(async () => {
    token = await deployContract(wallet, PAI);
  });

  it("Correctly sets vanity information", async () => {
    const name = await token.name();
    expect(name).to.equal(COIN_NAME);

    const decimals = await token.decimals();
    expect(decimals).to.equal(NUM_DECIMALS);

    const symbol = await token.symbol();
    expect(symbol).to.equal(TICKER);
  });

  describe("Transfers", () => {
    let walletBalance;

    beforeEach(async () => {
      const amount = parseEther("1000");
      await token.mint(wallet.address, amount);
      walletBalance = await token.balanceOf(wallet.address);
    });

    it("Transfer adds amount to destination account", async () => {
      const transferAmount = parseEther("100");
      const mintAmount = parseEther("7");
      await token.mint(walletTo.address, mintAmount);
      await token.transfer(walletTo.address, transferAmount);
      expect(await token.balanceOf(walletTo.address)).to.equal(
        transferAmount.add(mintAmount)
      );
    });

    it("Transfer emits event", async () => {
      const amount = parseEther("100");

      await expect(token.transfer(walletTo.address, amount))
        .to.emit(token, "Transfer")
        .withArgs(wallet.address, walletTo.address, amount);
    });

    it("Transfer above availability reverts", async () => {
      const amount = parseEther("1007");
      await expect(token.transfer(walletTo.address, amount)).to.be.reverted;
    });

    it("Transfer from empty account reverts", async () => {
      const tokenFromOtherWallet = token.connect(walletTo);
      await expect(tokenFromOtherWallet.transfer(wallet.address, 1)).to.be
        .reverted;
    });
  });

  describe("Minting and Burning", async () => {
    it("Only owner can mint new tokens", async () => {
      const tokenFromNonOwner = token.connect(wallets[1]);
      await expect(tokenFromNonOwner.mint(wallet.address, parseEther("1"))).to
        .be.reverted;

      const mintAmount = parseEther("1");
      const prevBalance = await token.balanceOf(wallet.address);

      await expect(token.mint(wallet.address, mintAmount)).to.not.be.reverted;

      expect(await token.balanceOf(wallet.address)).to.equal(
        prevBalance.add(mintAmount)
      );
    });

    it("Burn decreasess the balance of msg.sender", async () => {
      const mintAmount = parseEther("10");
      const prevBalance = await token.balanceOf(wallet.address);

      await token.mint(wallet.address, mintAmount);
      await expect(token.burn(mintAmount)).not.to.be.reverted;

      expect(await token.balanceOf(wallet.address)).to.be.equal(prevBalance);
    });

    it("Mint emits event", async () => {
      await expect(token.mint(wallets[1].address, parseEther("1")))
        .to.emit(token, "Transfer")
        .withArgs(
          ethers.constants.AddressZero,
          wallets[1].address,
          parseEther("1")
        );
    });

    it("Burn emits event", async () => {
      await token.mint(wallet.address, parseEther("1"));
      await expect(token.burn(parseEther("1")))
        .to.emit(token, "Transfer")
        .withArgs(
          wallet.address,
          ethers.constants.AddressZero,
          parseEther("1")
        );
    });
  });
});
