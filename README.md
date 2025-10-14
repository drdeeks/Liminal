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
4.  **Deploy the Smart Contracts:**
    -   Create a `.env` file in the `contracts` directory and add the following:
        ```
        PRIVATE_KEY=<your-private-key>
        RPC_URL=<your-rpc-url>
        ETHERSCAN_API_KEY=<your-etherscan-api-key>
        ```
    -   Run the deployment script:
        ```bash
        npm run deploy
        ```
        This will deploy the contracts and automatically update the frontend configuration with the new contract addresses.
5.  **Verify the Smart Contracts:**
    -   After deploying the contracts, you can verify them on Etherscan by running the following command for each contract:
        ```bash
        cd contracts
        forge verify-contract --chain-id <chain-id> <contract-address> <contract-name> --etherscan-api-key $ETHERSCAN_API_KEY
        cd ..
        ```
6.  **Run the Game:**
    ```bash
    npm run dev
    ```

## Smart Contracts

The smart contract source code is located in the `contracts/src` directory. The contracts are managed and deployed using Foundry.

-   **Leaderboard Contract:** This contract stores the leaderboard data and allows users to submit their scores.
-   **"Reset Strikes" Contract:** This contract allows users to reset their strikes by paying a small fee in ETH.

### Deployment and Verification

The smart contracts can be deployed by running the `npm run deploy` command. This command executes the `Deploy.s.sol` script in the `contracts/script` directory and then runs the `scripts/update-config.js` script to update the frontend configuration. After deployment, the contracts can be verified on Etherscan by running the `forge verify-contract` command.

## Contributing

We welcome contributions to Liminal! If you'd like to contribute, please fork the repository and submit a pull request.

## License

Liminal is open-source software licensed under the [MIT license](https://opensource.org/licenses/MIT).