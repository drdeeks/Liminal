import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();

const addressesPath = path.resolve(__dirname, 'contracts/monad-deployed-addresses.json');
const configPath = path.resolve(__dirname, 'src/contract-config.ts');

const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));

let configContent = fs.readFileSync(configPath, 'utf8');

configContent = configContent.replace(
    /export const LEADERBOARD_CONTRACT_ADDRESS = ".*";/,
    `export const LEADERBOARD_CONTRACT_ADDRESS = "${addresses.leaderboard}";`
);

configContent = configContent.replace(
    /export const RESET_STRIKES_CONTRACT_ADDRESS = ".*";/,
    `export const RESET_STRIKES_CONTRACT_ADDRESS = "${addresses.resetStrikes}";`
);

fs.writeFileSync(configPath, configContent);

console.log('Updated contract addresses in src/contract-config.ts');