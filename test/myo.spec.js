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

const { use, expect } = require('chai');
const {ethers} = require('ethers');
const { solidity, deployContract } = require('ethereum-waffle');
const { getProvider } = require('./setup')

const MYOContract = require('../build/MYO.json');

use(solidity);

describe('MYO ERC20 Smart Contract', () => {

    const parseEther = ethers.utils.parseEther; 
    const formatEther = ethers.utils.formatEther;
    const BN = ethers.BigNumber;
    
    let provider;
    let wallets, wallet, walletTo;

    before(async () => {
        provider = await getProvider(); 
        wallets = provider.getWallets();
        [wallet, walletTo] = wallets;
    });

    let token;
    beforeEach(async () => {
        token = await deployContract(wallet, MYOContract);
    });

    describe("Administration", () => {

        it("Allows minter role to mint new tokens", async () => {
            const amount = parseEther("1000");
            await token.mint(wallet.address, amount); 
            expect(await token.balanceOf(wallet.address))
                .to.eq(amount);
        });

        it("Does not allow non-minter role to mint tokens", async () => {
            const amount = parseEther("1000");
            const tokenFromNonMinter = token.connect(wallets[1]);
            await expect(tokenFromNonMinter.mint(wallets[1].address, amount))
                .to.be.revertedWith("MYO/!minter");
        });

        it("Allows goverment to add and remove governance accounts", async () => {
            // Add
            await expect(token.addGovernor(wallets[1].address)).not.to.be.reverted;
            expect(await token.isGovernor(wallets[1].address)).to.be.true;

            // Remove
            await expect(token.removeGovernor(wallets[1].address)).not.to.be.reverted;
            expect(await token.isGovernor(wallets[1].address)).to.be.false;
        });

        it("Allows goverment to add and remove minter accounts", async () => {
            // Add
            await expect(token.addMinter(wallets[1].address)).not.to.be.reverted;
            expect(await token.isMinter(wallets[1].address)).to.be.true;

            // Remove
            await expect(token.removeMinter(wallets[1].address)).not.to.be.reverted;
            expect(await token.isMinter(wallets[1].address)).to.be.false;
        });

        it("Forbids non-goverment to add or remove governance accounts", async () => {
            const tokenFromNonGovernance = token.connect(wallets[1]);

            await expect(tokenFromNonGovernance.addGovernor(wallets[2].address)).to.be.reverted;
            expect(await token.isMinter(wallets[2].address)).to.be.false;

            await expect(tokenFromNonGovernance.removeGovernor(wallets[2].address)).to.be.reverted;
        });

        it("Forbids non-goverment to add or remove minter accounts", async () => {
            const tokenFromNonGovernance = token.connect(wallets[1]);

            await expect(tokenFromNonGovernance.addMinter(wallets[2].address)).to.be.reverted;
            expect(await token.isGovernor(wallets[2].address)).to.be.false;

            await expect(tokenFromNonGovernance.removeMinter(wallets[2].address)).to.be.reverted;
        });
    });

    describe("Token Transfer", () => {

        it('Transfer adds amount to destination account', async () => {
            await token.mint(wallet.address, BN.from(7));
            await token.transfer(walletTo.address, 7);
            expect(await token.balanceOf(walletTo.address)).to.equal(7);
        });

        it('Transfer emits event', async () => {
            await token.mint(wallet.address, BN.from(7));
            await expect(token.transfer(walletTo.address, 7))
                .to.emit(token, 'Transfer')
                .withArgs(wallet.address, walletTo.address, 7);
        });

        it('Can not transfer above availability', async () => {
            await expect(token.transfer(walletTo.address, ethers.utils.parseEther("1007")))
                .to.be.reverted;
        });

        it('Can not transfer from empty account', async () => {
            const tokenFromOtherWallet = token.connect(walletTo);
            await expect(tokenFromOtherWallet.transfer(wallet.address, 1))
                .to.be.reverted;
        });
    })
});