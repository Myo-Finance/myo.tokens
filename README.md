# PAI and MYO Tokens Suitable for Optimistic Rollup 

These are L2-compatible smart contracts for Myo.Finance ERC20 tokens (PAI: Peso Argentino Intangible), and MYO (governance and value extraction token). This repo is using Waffle framework for smart contract testing and will test the contracts in both EVM and OVM.

### Prerequisites
```
node v11.10.1
```

## Set up

To start out, clone this example repo

```bash
git clone https://github.com/Myo-Finance/myo.tokens.git
```
Now, enter the repository

```bash
cd myo.tokens
```
Install all dependencies

```bash
yarn install
```
To build contracts and run tests in the EVM:

```bash
yarn all:evm
```
To build contracts and run tests in the OVM:

```bash
yarn all:ovm
```

## Optimism Rollup
These contracts can be compiled to both L1 (EVM) or Optimism L2 (OVM). For More info on Optimism go to 
[Twitter](https://twitter.com/optimismPBC) or [check the docs](https://docs.optimism.io)!

## Troubleshooting

Something not working? Create a Github Issue](https://github.com/Myo-Finance/myo.tokens/issues).
