import React, { useState } from 'react';

interface HowToPlayScreenProps {
  onStart: () => void;
  onCancel: () => void;
}

export const HowToPlayScreen: React.FC<HowToPlayScreenProps> = ({ onStart, onCancel }) => {
  const [understood, setUnderstood] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="bg-gray-900 border-2 border-white/20 text-white p-8 rounded-2xl max-w-lg text-center shadow-2xl animate-fade-in">
        <h2 className="text-4xl font-black mb-6 text-glitter">How to Play</h2>
        <div className="text-lg space-y-4 mb-6 text-left">
          <p>• Swipe, use arrow keys, or click & drag in the direction of the arrow</p>
          <p className="text-rose-400">• <span className="font-bold">Joker cards</span> (red) require the <span className="font-bold">opposite</span> direction</p>
          <p>• You have <span className="font-bold text-red-500">3 strikes</span> before game over</p>
          <p>• Time per card starts at <span className="font-bold text-green-400">1.5s</span> and decreases to <span className="font-bold text-red-400">0.45s</span></p>
        </div>
        <div className="bg-yellow-900/50 border-2 border-yellow-500/50 text-yellow-300 p-4 rounded-lg mb-6">
          <h3 className="font-bold text-xl mb-2">⚠️ Important</h3>
          <p>Scores must be manually submitted from the Game Over screen to appear on the leaderboard.</p>
        </div>
        <div className="flex items-center justify-center mb-6">
          <input 
            type="checkbox" 
            id="understand" 
            checked={understood}
            onChange={(e) => setUnderstood(e.target.checked)}
            className="w-5 h-5 mr-3 cursor-pointer"
          />
          <label htmlFor="understand" className="text-lg font-semibold cursor-pointer">
            I understand
          </label>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={onStart}
            disabled={!understood}
            className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-2xl shadow-lg hover:bg-green-700 transform hover:scale-105 transition-all border-2 border-white/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Start Game
          </button>
          <button
            onClick={onCancel}
            className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg text-2xl shadow-lg hover:bg-red-700 transform hover:scale-105 transition-all border-2 border-white/20"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};
