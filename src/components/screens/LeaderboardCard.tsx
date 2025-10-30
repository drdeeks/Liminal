import React from 'react';

interface Player {
    address: string;
    score: number;
}

interface LeaderboardCardProps {
    player: Player;
    rank: number;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ player, rank }) => {
    return (
        <div className="w-full bg-black/20 border-2 border-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between mb-4">
            <div className="flex items-center">
                <p className="text-2xl font-bold text-white/50 w-12 text-center">{rank}</p>
                <p className="text-lg font-semibold text-white truncate ml-4">{player.address}</p>
            </div>
            <p className="text-2xl font-bold text-white">{player.score}</p>
        </div>
    );
};
