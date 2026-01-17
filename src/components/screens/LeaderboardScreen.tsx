import React, { useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { leaderboardAbi, leaderboardAddress } from '../../lib/contracts';
import { baseSepolia } from 'wagmi/chains';
import { monadTestnet } from '../../lib/contracts';
import { LeaderboardCard } from './LeaderboardCard';

interface LeaderboardScreenProps {
    onBack: () => void;
}

interface Player {
    address: string;
    score: number;
}

const PAGE_SIZE = 10;

const SkeletonCard = () => (
    <div className="w-full bg-black/20 border-2 border-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between mb-4 animate-pulse">
        <div className="flex items-center">
            <div className="h-8 w-12 bg-white/10 rounded-md"></div>
            <div className="h-6 w-48 bg-white/10 rounded-md ml-4"></div>
        </div>
        <div className="h-8 w-20 bg-white/10 rounded-md"></div>
    </div>
);

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBack }) => {
    const { chain } = useAccount();
    const [page, setPage] = useState(0);

    const contractAddress = chain?.id === monadTestnet.id ? leaderboardAddress[monadTestnet.id] : leaderboardAddress[baseSepolia.id];

    const { data: playerCountData, isLoading: isPlayerCountLoading, error: playerCountError } = useReadContract({
        address: contractAddress,
        abi: leaderboardAbi,
        functionName: 'getPlayerCount',
        query: { enabled: !!contractAddress },
    });

    const { data: leaderboardData, isLoading: isLeaderboardLoading, error: leaderboardError } = useReadContract({
        address: contractAddress,
        abi: leaderboardAbi,
        functionName: 'getLeaderboard',
        args: [BigInt(page), BigInt(PAGE_SIZE)],
        query: { enabled: !!contractAddress },
    });

    const playerCount = playerCountData ? Number(playerCountData) : 0;
    const leaderboard: Player[] = leaderboardData ? (() => {
        const entries = leaderboardData as readonly { user: `0x${string}`; score: bigint; }[];
        return entries.map((entry) => {
            if (entry.score > Number.MAX_SAFE_INTEGER) {
                console.warn(`Score ${entry.score} exceeds MAX_SAFE_INTEGER, precision may be lost`);
            }
            return {
                address: entry.user,
                score: Number(entry.score),
            };
        }).sort((a, b) => b.score - a.score);
    })() : [];

    const loading = isPlayerCountLoading || isLeaderboardLoading;
    const error = playerCountError || leaderboardError;

    return (
        <div className="flex flex-col items-center justify-center text-white text-center animate-fade-in w-full max-w-4xl mx-auto px-4">
            <h1 className="text-4xl sm:text-6xl font-black mb-8 text-glitter">Leaderboard</h1>
            {error && (
                <div className="w-full bg-red-900/50 border-2 border-red-500 text-red-200 p-4 rounded-lg mb-4">
                    <p className="font-bold">Error loading leaderboard</p>
                    <p className="text-sm">{error.message}</p>
                </div>
            )}
            <div className="w-full bg-black/30 border-2 border-white/20 backdrop-blur-md rounded-lg p-6">
                {loading ? (
                    <div>
                        {[...Array(PAGE_SIZE)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : leaderboard.length > 0 ? (
                    <div>
                        {leaderboard.map((player, index) => (
                            <LeaderboardCard key={player.address} player={player} rank={page * PAGE_SIZE + index + 1} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-2xl font-bold mb-4">The leaderboard is empty.</p>
                        <p className="text-lg text-white/70">Be the first to set a score!</p>
                    </div>
                )}
            </div>
            <div className="flex justify-between items-center w-full mt-4">
                <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0 || loading}
                    className="bg-black/30 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-black/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    Previous
                </button>
                <p className="text-white/70 font-semibold">Page {page + 1}</p>
                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={(page + 1) * PAGE_SIZE >= playerCount || loading}
                    className="bg-black/30 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-black/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    Next
                </button>
            </div>
            <button
                onClick={onBack}
                className="mt-8 bg-black/30 text-white font-bold py-3 px-8 rounded-lg text-2xl shadow-lg hover:bg-black/50 transform hover:scale-105 transition-all border-2 border-white/20 backdrop-blur-md text-shadow-pop"
            >
                Back to Menu
            </button>
        </div>
    );
};
