import React from 'react';

interface WalletConnectPopupProps {
    onConnect: () => void;
    onClose: () => void;
}

export const WalletConnectPopup: React.FC<WalletConnectPopupProps> = ({ onConnect, onClose }) => {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg text-center">
                <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
                <p className="mb-6">Please connect your wallet to play the game and submit your score to the leaderboard.</p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onConnect}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    >
                        Connect
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};