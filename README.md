# Liminal: A Farcaster Mini App

Welcome to Liminal, a fast-paced arcade game that tests your reflexes and pushes you deeper into an atmospheric, ever-changing world. Built as a **Farcaster Mini App**, Liminal offers a seamless gaming experience directly within the Farcaster ecosystem.

The core mechanic is simple: swipe in the correct direction before time runs out. As your score increases, the game's atmosphere shifts, the music intensifies, and the challenges become more complex.

## Features

- **Farcaster Native:** Launch and play Liminal directly from your Farcaster feed.
- **Dynamic Difficulty:** The game's speed and complexity (card timing) increase, and visuals scale in intensity as you progress.
- **Atmospheric Experience:** Visuals and audio evolve as you reach new score milestones.
- **Joker Cards:** Occasionally, a "joker" card will appear, requiring you to swipe in the opposite direction.
- **Scoring:** Earn 1 point for each correct swipe. Your total score accumulates across games on the leaderboard.
- **On-Chain Leaderboard:** Compete against other players on a global leaderboard, powered by a secure and transparent smart contract on the Monad Testnet and Base.
- **"Reset Strikes" Power-up:** Made a few mistakes? Use the "Reset Strikes" power-up to get a second chance by paying a small fee (0.05 USD equivalent) in ETH.

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)
- [Foundry](https://getfoundry.sh/)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/liminal.git
cd liminal
```

### 2. Install Dependencies

This project is a monorepo with a frontend application and smart contracts.

**Frontend Dependencies:**

```bash
npm install
```

**Smart Contract Dependencies:**

```bash
cd contracts
forge install
cd ..
```

### 3. Set Up Environment Variables

Create a `.env` file in the root of the project and add the following variables. These are required for deploying and verifying the smart contracts, and for the frontend to interact with them.

```
# RPC URLs for your networks
MONAD_RPC_URL="YOUR_MONAD_RPC_URL"
BASE_RPC_URL="YOUR_BASE_RPC_URL"

# Private Keys (for testing, use keystore for production)
# If using keystore, these are not needed.
MONAD_PRIVATE_KEY="YOUR_MONAD_PRIVATE_KEY"
BASE_PRIVATE_KEY="YOUR_BASE_PRIVATE_KEY"

# Owner address for deployed contracts
OWNER_ADDRESS="THE_ADDRESS_THAT_WILL_OWN_THE_CONTRACTS"

# Etherscan-compatible API Keys for contract verification
MONAD_ETHERSCAN_API_KEY="YOUR_MONAD_ETHERSCAN_API_KEY"
BASE_ETHERSCAN_API_KEY="YOUR_BASE_ETHERSCAN_API_KEY"

# Chain IDs for your networks
MONAD_CHAIN_ID="10143" # Example Monad Testnet Chain ID
BASE_CHAIN_ID="84532"  # Example Base Sepolia Chain ID
```

**Important Notes on Environment Variables:**
- **RPC URLs:** Obtain these from your chosen RPC provider for Monad and Base.
- **Private Keys:** For production deployments, it is highly recommended to use a **keystore** for enhanced security. See "Smart Contract Deployment" for details.
- **OWNER_ADDRESS:** This address will receive ownership of the deployed contracts, allowing you to manage them.
- **ETHERSCAN_API_KEY:** These keys are used by Foundry for contract verification on block explorers. Obtain them from the respective block explorer websites (e.g., Monad Explorer, Basescan).
- **Chain IDs:** Ensure these match the actual chain IDs of the networks you are deploying to.

### 4. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`. You will need to expose this locally running application to a public URL (e.g., using `cloudflared` or `ngrok`) for Farcaster clients to access it.

## Farcaster Mini App Configuration

### Updating Account Association

To associate this Mini App with your Farcaster account, you need to update the `accountAssociation` field in the manifest file.

1.  **Navigate to the Manifest File:**
    Open `public/.well-known/farcaster.json`.

2.  **Generate a New Association:**
    - Go to the [Farcaster Mini App Manifest Tool](https://farcaster.xyz/~/developers/new) in Warpcast.
    - Enter your domain (e.g., `your-app-name.vercel.app`) and follow the instructions to generate a new `accountAssociation` object.

3.  **Update the Manifest:**
    - Copy the generated `accountAssociation` object.
    - Paste it into `public/.well-known/farcaster.json`, replacing the existing one.

### Asset Configuration

The Farcaster frame and Mini App use specific image assets. Ensure these are correctly configured:
-   `public/index.html`: The `<meta property="fc:frame:image" ... />` tag should point to your main frame image (e.g., `/liminal-assets/hero.png`).
-   `public/.well-known/farcaster.json`: This file contains `imageUrl`, `iconUrl`, and `splashImageUrl` for both the `frame` and `miniapp` configurations. These should point to your local assets (e.g., `/liminal-assets/hero.png`, `/liminal-assets/icon.png`, `/liminal-assets/splash.png`).

## Smart Contract Deployment

The smart contracts are located in the `contracts` directory and are managed with Foundry.

**Important:** Deployment and verification must be performed separately for each target chain (Monad and Base).

### Deployment with a Private Key (Recommended for Quick Testing)

This method uses the `PRIVATE_KEY` environment variable for the target chain.

**Steps:**

1.  **Ensure Environment Variables are Set:**
    Make sure your `.env` file is correctly configured with the `RPC_URL`, `PRIVATE_KEY`, `OWNER_ADDRESS`, and `CHAIN_ID` for the target chain you wish to deploy to.

2.  **Run the Deployment Script:**
    From the `contracts` directory, execute the deployment script for Monad:
    ```bash
    forge script script/DeployMonad.s.sol:DeployMonad --rpc-url ${MONAD_RPC_URL} --private-key ${MONAD_PRIVATE_KEY} --broadcast --chain-id ${MONAD_CHAIN_ID} -vvvv
    ```
    For Base, you would need a similar script (e.g., `DeployBase.s.sol`) or modify `DeployMonad.s.sol` to be chain-agnostic and pass the appropriate RPC URL, private key, and chain ID.

### Deployment with a Keystore (Recommended for Production)

This method is more secure as it avoids exposing your private key directly in an environment file.

**Steps:**

11. **Create a Keystore:**
    - If you don't have a Foundry-managed keystore, you can create one by running:
      ```bash
      cd contracts
      cast wallet new
      ```
    - This will generate a new wallet and prompt you to create a password. Note the address of the new wallet.

12. **Fund Your Wallet:**
    - Make sure the wallet address you just created has enough ETH for the target chain to cover the deployment gas fees.

13. **Set Environment Variables for Keystore:**
    - Ensure `OWNER_ADDRESS` is set in your `.env` file.
    - When running the `forge script` command, you will be prompted for your keystore password.

14. **Run the Keystore Deployment Script:**
    From the `contracts` directory, execute the deployment script for Monad using your keystore:
    ```bash
    forge script script/DeployMonad.s.sol:DeployMonad --rpc-url ${MONAD_RPC_URL} --keystore /path/to/your/keystore.json --broadcast --chain-id ${MONAD_CHAIN_ID} -vvvv
    ```
    Replace `/path/to/your/keystore.json` with the actual path to your keystore file. You will be prompted for your keystore password.

### Contract Verification (Post-Deployment)

After successful deployment, you **must manually verify** your contracts using the `forge verify-contract` command. This is a separate step from deployment.

**For Monad:**

```bash
forge verify-contract \
    <GMR_CONTRACT_ADDRESS> \
    src/GMR.sol:GMR \
    --chain ${MONAD_CHAIN_ID} \
    --verifier etherscan \
    --etherscan-api-key ${MONAD_ETHERSCAN_API_KEY} \
    --watch

forge verify-contract \
    <LEADERBOARD_CONTRACT_ADDRESS> \
    src/Leaderboard.sol:Leaderboard \
    --chain ${MONAD_CHAIN_ID} \
    --verifier etherscan \
    --etherscan-api-key ${MONAD_ETHERSCAN_API_KEY} \
    --watch

forge verify-contract \
    <RESETSTRIKES_CONTRACT_ADDRESS> \
    src/ResetStrikes.sol:ResetStrikes \
    --chain ${MONAD_CHAIN_ID} \
    --constructor-args $(cast abi encode "constructor(uint256)" <RESET_STRIKES_COST_VALUE>) \
    --verifier etherscan \
    --etherscan-api-key ${MONAD_ETHERSCAN_API_KEY} \
    --watch
```

**For Base:**

```bash
forge verify-contract \
    <GMR_CONTRACT_ADDRESS> \
    src/GMR.sol:GMR \
    --chain ${BASE_CHAIN_ID} \
    --verifier etherscan \
    --etherscan-api-key ${BASE_ETHERSCAN_API_KEY} \
    --watch

forge verify-contract \
    <LEADERBOARD_CONTRACT_ADDRESS> \
    src/Leaderboard.sol:Leaderboard \
    --chain ${BASE_CHAIN_ID} \
    --verifier etherscan \
    --etherscan-api-key ${BASE_ETHERSCAN_API_KEY} \
    --watch

forge verify-contract \
    <RESETSTRIKES_CONTRACT_ADDRESS> \
    src/ResetStrikes.sol:ResetStrikes \
    --chain ${BASE_CHAIN_ID} \
    --constructor-args $(cast abi encode "constructor(uint256)" <RESET_STRIKES_COST_VALUE>) \
    --verifier etherscan \
    --etherscan-api-key ${BASE_ETHERSCAN_API_KEY} \
    --watch
```

**Important:**
- Replace `<GMR_CONTRACT_ADDRESS>`, `<LEADERBOARD_CONTRACT_ADDRESS>`, `<RESETSTRIKES_CONTRACT_ADDRESS>` with the actual addresses of your deployed contracts.
- Replace `<RESET_STRIKES_COST_VALUE>` with the exact `uint256` value used for the `ResetStrikes` constructor during deployment (e.g., `7500000000000000` for `0.0075 ether`).
- Ensure your `MONAD_ETHERSCAN_API_KEY` and `BASE_ETHERSCAN_API_KEY` environment variables are correctly set.
- For alternative verifiers (Socialscan, Sourcify), adjust the `--verifier` and `--verifier-url` flags as per the Monad documentation.

### Post-Deployment

After a successful deployment, the script will create a `monad-deployed-addresses.json` file in the `contracts` directory. This file contains the addresses of the newly deployed contracts. The `scripts/update-config.js` script will automatically update the frontend configuration with these new addresses.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

Liminal is open-source software licensed under the [MIT license](https://opensource.org/licenses/MIT).
