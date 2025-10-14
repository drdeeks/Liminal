# Liminal

Liminal is a fast-paced arcade game that tests your reflexes and pushes you deeper into an atmospheric, ever-changing world. The core mechanic is simple: swipe in the correct direction before time runs out. As your score increases, the game's atmosphere shifts, the music intensifies, and the challenges become more complex.

## Features

- **Dynamic Difficulty:** The game's speed and complexity increase as you progress, providing a continuous challenge.
- **Atmospheric Experience:** The game's visuals and audio evolve as you reach new score milestones, creating an immersive and captivating experience.
- **Joker Cards:** Occasionally, a "joker" card will appear, requiring you to swipe in the opposite direction.
- **Multiplier System:** The better you perform, the higher your score multiplier, rewarding you for your skill.
- **On-Chain Leaderboard:** Compete against other players and see how your score stacks up on the global leaderboard, powered by a secure and transparent smart contract.
- **"Reset Strikes" Power-up:** Made a few mistakes? Use the "Reset Strikes" power-up to get a second chance by paying a small fee in ETH.

## How to Play

1.  **Connect Your Wallet:** Click the "Connect Wallet" button to connect your MetaMask wallet.
2.  **Start the Game:** Click the "Start Game" button to begin.
3.  **Swipe:** Swipe the cards in the direction they indicate.
4.  **Joker Cards:** If a joker card appears, swipe in the opposite direction.
5.  **Strikes:** You have three strikes. If you make a mistake or run out of time, you'll lose a strike.
6.  **Game Over:** The game ends when you lose all three strikes.
7.  **Submit Your Score:** After the game ends, you can submit your score to the on-chain leaderboard.
8.  **Reset Strikes:** If you have strikes and your wallet is connected, you can use the "Reset Strikes" power-up to reset your strikes to zero.

## Getting Started

To get started with Liminal, you'll need to have Node.js, npm, and Foundry installed.

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/liminal.git
    ```
2.  **Install Frontend Dependencies:**
    ```bash
    npm install
    ```
3.  **Install Smart Contract Dependencies:**
    ```bash
    cd contracts
    forge install
    cd ..
    ```
4.  **Create a Keystore:**
    -   If you don't have a keystore, you can create one by running the following command from the `contracts` directory:
        ```bash
        cd contracts
        cast wallet new
        ```
    -   This will generate a new private key and an address. Follow the prompts to create a password for your keystore.
5.  **Deploy the Smart Contracts to Monad Testnet:**
    -   Run the deployment script from the `contracts` directory, replacing `my-keystore-name` with the name of your keystore account:
        ```bash
        cd contracts
        forge script script/DeployMonad.s.sol --rpc-url monad --account my-keystore-name --broadcast
        ```
    -   This will deploy the contracts to the Monad Testnet. The script will also create a `monad-deployed-addresses.json` file in the `contracts` directory with the new contract addresses.
6.  **Verify the Smart Contracts:**
    -   After deploying, you can verify each contract on the Monad block explorer using the following command:
        ```bash
        forge verify-contract <contract-address> <contract-path>:<contract-name> --chain-id 10143 --verifier sourcify --verifier-url https://sourcify-api-monad.blockvision.org
        ```
7.  **Update Frontend Configuration:**
    - You will need to manually update the frontend configuration with the new contract addresses from the `monad-deployed-addresses.json` file.
6.  **Run the Game:**
    ```bash
    npm run dev
    ```

## Smart Contracts

The smart contracts are organized in the `contracts` directory, following a standard Foundry project structure:

-   `src/`: Contains the core smart contract source code (`Counter.sol`, `Leaderboard.sol`, `ResetStrikes.sol`).
-   `script/`: Contains the deployment scripts (`DeployMonad.s.sol`).
-   `test/`: Contains the tests for the smart contracts.
-   `lib/`: Contains third-party libraries, such as OpenZeppelin contracts.

The main contracts are:
-   **Leaderboard Contract:** This contract stores the leaderboard data and allows users to submit their scores.
-   **"Reset Strikes" Contract:** This contract allows users to reset their strikes by paying a small fee in ETH.

### Deployment and Verification

The smart contracts can be deployed to the Monad Testnet by running the `forge script` command from within the `contracts` directory. The `DeployMonad.s.sol` script handles both the deployment and automatic verification of the contracts.

## Contributing

We welcome contributions to Liminal! If you'd like to contribute, please fork the repository and submit a pull request.

## License

Liminal is open-source software licensed under the [MIT license](https://opensource.org/licenses/MIT).