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
VITE_MONAD_RPC_URL="YOUR_MONAD_RPC_URL" # Used by the frontend

# Private Keys (for testing, use keystore for production)
# If using keystore, these are not needed. If not using keystore, provide them.
MONAD_PRIVATE_KEY="YOUR_MONAD_PRIVATE_KEY"
BASE_PRIVATE_KEY="YOUR_BASE_PRIVATE_KEY"

# Owner address for deployed contracts and sender for Foundry scripts
OWNER_ADDRESS="THE_ADDRESS_THAT_WILL_OWN_THE_CONTRACTS"
SENDER_ADDRESS="THE_ADDRESS_THAT_WILL_SEND_TRANSACTIONS_FOR_DEPLOYMENT"

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
- **OWNER_ADDRESS & SENDER_ADDRESS:** `OWNER_ADDRESS` will receive ownership of the deployed contracts. `SENDER_ADDRESS` is the address that will send transactions for deployment (e.g., your keystore address or the address associated with your private key).
- **ETHERSCAN_API_KEY:** These keys are used by Foundry for contract verification on block explorers. Obtain them from the respective block explorer websites (e.g., Monad Explorer, Basescan).
- **Chain IDs:** Ensure these match the actual chain IDs of the networks you are deploying to.
- **Frontend Contract Addresses (VITE_...):** These environment variables are automatically updated by the `scripts/update-config.js` script after successful contract deployment. You do not need to manually set them in your `.env` file.

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

## Smart Contract Deployment (with Auto-Verification)

The smart contracts are located in the `contracts` directory and are managed with Foundry.

**Important:** Deployment and verification must be performed separately for each target chain (Monad and Base).

### Obtaining Price Feed Addresses

For contracts that rely on external price data (like `ResetStrikes` for ETH/USD conversion), you will need the address of a reliable price feed oracle. Chainlink is a widely used decentralized oracle network that provides these feeds.

To find the correct price feed address for your target network (e.g., Monad Testnet) and asset pair (e.g., ETH/USD):

1.  **Visit Chainlink Documentation:** Go to the official Chainlink documentation website.
2.  **Navigate to Data Feeds:** Look for the "Data Feeds" or "Price Feeds" section.
3.  **Select Network and Asset Pair:** Choose your target network (e.g., Monad Testnet) and the specific asset pair (e.g., ETH/USD) to find the corresponding deployed contract address.

**Example:** For Monad Testnet ETH/USD, you would look for an entry like `ETH / USD` under the Monad section.

### Deployment with a Private Key (Recommended for Quick Testing)

This method uses the `PRIVATE_KEY` environment variable for the target chain.

**Steps:**

1.  **Ensure Environment Variables are Set:**
    Make sure your `.env` file is correctly configured with the `RPC_URL`, `PRIVATE_KEY`, `OWNER_ADDRESS`, and `CHAIN_ID` for the target chain you wish to deploy to.

2.  **Run the Deployment Script:**
    From the `contracts` directory, execute the deployment script for Monad:
    ```bash
    forge script script/Deploy.s.sol:Deploy --rpc-url ${MONAD_RPC_URL} --private-key ${MONAD_PRIVATE_KEY} --broadcast --chain-id ${MONAD_CHAIN_ID} -vvvv --verify
    ```
    The `Deploy.s.sol` script is designed to be chain-agnostic. You can use the same script for different chains by passing the appropriate RPC URL, private key, and chain ID.

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
    forge script script/Deploy.s.sol:Deploy --rpc-url ${MONAD_RPC_URL} --keystore /path/to/your/keystore.json --broadcast --chain-id ${MONAD_CHAIN_ID} -vvvv --verify
    ```
    Replace `/path/to/your/keystore.json` with the actual path to your keystore file. You will be prompted for your keystore password.

### Contract Verification (Post-Deployment)

With the `--verify` flag added to the `forge script` command, contracts will be automatically verified on the block explorer after a successful deployment.

If auto-verification fails for any reason, you can manually verify your contracts using the `forge verify-contract` command. Refer to the Foundry documentation for detailed instructions on manual verification.

### Post-Deployment

After a successful deployment, the `Deploy.s.sol` script will create a `monad-deployed-addresses.json` file in the `contracts` directory. This file contains the addresses of the newly deployed contracts. The `scripts/update-config.js` script will automatically update the `VITE_` prefixed environment variables in `src/lib/contracts.ts` with these new addresses, ensuring the frontend uses the correct contract deployments.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

Liminal is open-source software licensed under the [MIT license](https://opensource.org/licenses/MIT).
