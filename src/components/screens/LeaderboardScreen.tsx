import React, { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { leaderboardAbi, leaderboardAddress } from '../../lib/contracts';
import { base } from 'wagmi/chains';
import { monad } from '../../lib/wagmi';

interface LeaderboardScreenProps {
    onBack: () => void;
}

interface Player {
    address: string;
    score: number;
}

const PAGE_SIZE = 10;

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBack }) => {
    const { chain } = useAccount();
    const [page, setPage] = useState(0);

    const contractAddress = chain?.id === monad.id ? leaderboardAddress[monad.id] : leaderboardAddress[base.id];

    const { data: playerCountData, isLoading: isPlayerCountLoading } = useReadContract({
        address: contractAddress,
        abi: leaderboardAbi,
        functionName: 'getPlayerCount',
    });

    const { data: leaderboardData, isLoading: isLeaderboardLoading } = useReadContract({
        address: contractAddress,
        abi: leaderboardAbi,
        functionName: 'getLeaderboard',
        args: [BigInt(page), BigInt(PAGE_SIZE)],
    });

    const playerCount = playerCountData ? Number(playerCountData) : 0;
    const leaderboard: Player[] = leaderboardData ? (leaderboardData as [string[], bigint[]])[0].map((address, i) => ({
        address,
        score: Number((leaderboardData as [string[], bigint[]])[1][i]),
    })).sort((a, b) => b.score - a.score) : [];

    const loading = isPlayerCountLoading || isLeaderboardLoading;

    return (
        <div className="flex flex-col items-center justify-center text-white text-center animate-fade-in">
            <h1 className="text-6xl font-black mb-8 text-glitter">Leaderboard</h1>
            <div className="w-full max-w-2xl bg-black/20 border-2 border-white/20 backdrop-blur-sm rounded-lg p-6">
                <p className="text-sm text-white/50 mb-4">* Ranking is for the current page only.</p>
                {loading ? (
                    <p className="text-xl">Loading...</p>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th className="p-2">Rank</th>
                                <th className="p-2">Player</th>
                                <th className="p-2">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((player, index) => (
                                <tr key={player.address} className="border-t border-white/10">
                                    <td className="p-2">{page * PAGE_SIZE + index + 1}</td>
                                    <td className="p-2 truncate">{player.address}</td>
                                    <td className="p-2">{player.score}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <div className="flex justify-between w-full max-w-2xl mt-4">
                <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0 || loading}
                    className="bg-black/20 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-black/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={(page + 1) * PAGE_SIZE >= playerCount || loading}
                    className="bg-black/20 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-black/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
            <button
                onClick={onBack}
                className="mt-8 bg-black/20 text-white font-bold py-3 px-8 rounded-lg text-2xl shadow-lg hover:bg-black/40 transform hover:scale-105 transition-transform border-2 border-white/20 backdrop-blur-sm text-shadow-pop"
            >
                Back
            </button>
        </div>
    );
};
