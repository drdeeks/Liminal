# Liminal: A Farcaster Mini App

Welcome to Liminal, a fast-paced arcade game that tests your reflexes and pushes you deeper into an atmospheric, ever-changing world. Built as a **Farcaster Mini App**, Liminal offers a seamless gaming experience directly within the Farcaster ecosystem.

The core mechanic is simple: swipe in the correct direction before time runs out. As your score increases, the game's atmosphere shifts, the music intensifies, and the challenges become more complex.

## Features

- **Farcaster Native:** Launch and play Liminal directly from your Farcaster feed.
- **Dynamic Difficulty:** The game's speed and complexity increase as you progress.
- **Atmospheric Experience:** Visuals and audio evolve as you reach new score milestones.
- **Joker Cards:** Occasionally, a "joker" card will appear, requiring you to swipe in the opposite direction.
- **Multiplier System:** The better you perform, the higher your score multiplier.
- **On-Chain Leaderboard:** Compete against other players on a global leaderboard, powered by a secure and transparent smart contract on the Monad Testnet.
- **"Reset Strikes" Power-up:** Made a few mistakes? Use the "Reset Strikes" power-up to get a second chance by paying a small fee in ETH.

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

Create a `.env` file in the root of the project and add the following variables. These are required for deploying and verifying the smart contracts.

```
RPC_URL="https://testnet-rpc.monad.xyz"
PRIVATE_KEY="YOUR_WALLET_PRIVATE_KEY"
ETHERSCAN_API_KEY="YOUR_ETHERSCAN_API_KEY"
```

- `RPC_URL`: The RPC endpoint for the Monad Testnet.
- `PRIVATE_KEY`: The private key of the wallet you'll use for deployment. **(See "Deployment with Keystore" for a more secure option)**.
- `ETHERSCAN_API_KEY`: A placeholder for your block explorer API key. While the variable is named `ETHERSCAN_API_KEY`, Foundry uses it for various explorers.

### 4. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

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

## Smart Contract Deployment

The smart contracts are located in the `contracts` directory and are managed with Foundry. The deployment script handles both deployment and automatic verification on the Monad Testnet.

There are two methods for deploying the contracts:

### Method 1: Deployment with a Private Key (Recommended for Quick Testing)

This method uses the `PRIVATE_KEY` you set in your `.env` file.

**Steps:**

1.  **Ensure Environment Variables are Set:**
    Make sure your `.env` file is correctly configured with your `RPC_URL`, `PRIVATE_KEY`, and `ETHERSCAN_API_KEY`.

2.  **Run the Deployment Script:**
    From the root of the project, run:
    ```bash
    npm run deploy
    ```

This command executes the `forge script` with your private key, deploys the contracts, and automatically verifies them on the block explorer.

### Method 2: Deployment with a Keystore (Recommended for Production)

This method is more secure as it avoids exposing your private key directly in an environment file.

**Steps:**

1.  **Create a Keystore:**
    - If you don't have a Foundry-managed keystore, you can create one by running:
      ```bash
      cd contracts
      cast wallet new
      ```
    - This will generate a new wallet and prompt you to create a password. Note the address of the new wallet.

2.  **Fund Your Wallet:**
    - Make sure the wallet address you just created has enough Monad Testnet ETH to cover the deployment gas fees.

3.  **Set Environment Variables for Keystore:**
    - Create a separate `.env.keystore` file (or similar) or set these variables in your shell:
      ```
      KEYSTORE_PATH="/path/to/your/foundry/keystores/your-keystore-file.json"
      SENDER_ADDRESS="YOUR_WALLET_ADDRESS"
      KEYSTORE_PASSWORD="YOUR_KEYSTORE_PASSWORD"
      ```
    - Replace the placeholder values with your actual keystore path, wallet address, and password.

4.  **Run the Keystore Deployment Script:**
    From the root of the project, run:
    ```bash
    npm run deploy:keystore
    ```

This command uses your keystore file and password to sign and send the deployment transaction, followed by automatic verification.

### Post-Deployment

After a successful deployment, the script will create a `monad-deployed-addresses.json` file in the `contracts` directory. This file contains the addresses of the newly deployed contracts. The `scripts/update-config.js` script will automatically update the frontend configuration with these new addresses.

## License

Liminal is open-source software licensed under the [MIT license](https://opensource.org/licenses/MIT).