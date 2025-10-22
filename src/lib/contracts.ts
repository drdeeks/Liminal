import { Abi } from 'viem';
import leaderboardAbiJson from '../abis/Leaderboard.json';
import gmrAbiJson from '../abis/GMR.json';
import resetStrikesAbiJson from '../abis/ResetStrikes.json';

export const leaderboardAbi = leaderboardAbiJson as Abi;
export const gmrAbi = gmrAbiJson as Abi;
export const resetStrikesAbi = resetStrikesAbiJson as Abi;

export const leaderboardAddress = {
    8453: '0x1A62D2024A45D982fAb2A4F4aF7617300B819448' as `0x${string}`,
    10143: '0x1A62D2024A45D982fAb2A4F4aF7617300B819448' as `0x${string}`,
};

export const gmrAddress = {
    8453: '0x1A62D2024A45D982fAb2A4F4aF7617300B819448' as `0x${string}`,
    10143: '0x1A62D2024A45D982fAb2A4F4aF7617300B819448' as `0x${string}`,
};

export const resetStrikesAddress = {
    8453: '0x1A62D2024A45D982fAb2A4F4aF7617300B819448' as `0x${string}`,
    10143: '0x1A62D2024A45D982fAb2A4F4aF7617300B819448' as `0x${string}`,
};
