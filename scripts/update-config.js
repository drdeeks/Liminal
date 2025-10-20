import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();

const broadcastPath = path.resolve(__dirname, 'contracts/broadcast/DeployMonad.s.sol/10143/run-latest.json');
const configPath = path.resolve(__dirname, 'src/contract-config.ts');

const broadcast = JSON.parse(fs.readFileSync(broadcastPath, 'utf8'));

let gmrAddress, leaderboardAddress, resetStrikesAddress;

broadcast.transactions.forEach(tx => {
    if (tx.contractName === 'GMR') {
        gmrAddress = tx.contractAddress;
    } else if (tx.contractName === 'Leaderboard') {
        leaderboardAddress = tx.contractAddress;
    } else if (tx.contractName === 'ResetStrikes') {
        resetStrikesAddress = tx.contractAddress;
    }
});

if (!gmrAddress || !leaderboardAddress || !resetStrikesAddress) {
    console.error('Could not find all contract addresses in broadcast file.');
    process.exit(1);
}

let configContent = fs.readFileSync(configPath, 'utf8');

configContent = configContent.replace(
    /(export const GMR_CONTRACT_ADDRESS = )".*";/,
    `$1"${gmrAddress}";`
);

configContent = configContent.replace(
    /(export const LEADERBOARD_CONTRACT_ADDRESS = )".*";/,
    `$1"${leaderboardAddress}";`
);

configContent = configContent.replace(
    /(export const RESET_STRIKES_CONTRACT_ADDRESS = )".*";/,
    `$1"${resetStrikesAddress}";`
);

fs.writeFileSync(configPath, configContent);

console.log('Updated contract addresses in src/contract-config.ts');
