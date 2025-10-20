# Smart Contracts

This directory contains the smart contracts for the Liminal game.

## Setup

1.  Install [Foundry](https://getfoundry.sh/).
2.  Install the dependencies:
    ```bash
    forge install
    ```

## Compiling

To compile the contracts, run the following command:
```bash
forge build
```

## Deploying

To deploy the contracts, you will need to have a `.env` file in this directory with the following variables:

```
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### GMR Contract

To deploy the `GMR` contract, run the following command:

```bash
forge create --rpc-url <your_rpc_url> --private-key $PRIVATE_KEY src/GMR.sol:GMR --etherscan-api-key $ETHERSCAN_API_KEY --verify
```

### ResetStrikes Contract

To deploy the `ResetStrikes` contract, run the following command:

```bash
forge create --rpc-url <your_rpc_url> --private-key $PRIVATE_KEY src/ResetStrikes.sol:ResetStrikes --constructor-args <initial_cost> --etherscan-api-key $ETHERSCAN_API_KEY --verify
```

Replace `<your_rpc_url>` with the RPC URL of the network you are deploying to, and `<initial_cost>` with the initial cost for resetting strikes (in wei).

## Updating the Frontend

After deploying the contracts, you will need to update the contract addresses in `src/lib/contracts.ts`.

1.  Open `src/lib/contracts.ts`.
2.  Replace `'0xYourGmContractAddress'` with the address of your deployed `GMR` contract.
3.  Replace `'0xYourResetStrikesContractAddress'` with the address of your deployed `ResetStrikes` contract.