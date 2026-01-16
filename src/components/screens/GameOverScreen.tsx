import React, { useState, useEffect } from 'react';

interface GameOverScreenProps {
  score: number;
  onPlayAgain: () => void;
  onViewLeaderboard: () => void;
  onSubmitScore: () => void;
  isSubmitting: boolean;
  error: Error | null;
  onResetStrikes: () => void;
  onContinue: () => void;
  isScoreSubmitted: boolean;
  isResetStrikesSuccess: boolean;
  isResetStrikesPending: boolean;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ 
  score, 
  onPlayAgain, 
  onViewLeaderboard, 
  onSubmitScore, 
  isSubmitting, 
  error, 
  onResetStrikes, 
  onContinue,
  isScoreSubmitted,
  isResetStrikesSuccess,
  isResetStrikesPending
}) => {
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (isResetStrikesSuccess && countdown === null) {
      setCountdown(3);
    }
  }, [isResetStrikesSuccess, countdown]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleContinue = () => {
    setCountdown(null);
    onContinue();
  };

  return (
    <div className="flex flex-col items-center justify-center text-white text-center animate-fade-in">
      <h1 className="text-5xl sm:text-6xl font-black mb-2 text-glitter">GAME OVER</h1>
      <p className="text-xl sm:text-2xl text-white/70 mb-4 text-shadow-pop">Your Score</p>
      <p className="text-6xl sm:text-8xl font-bold mb-8 text-shadow-pop">{score}</p>
      
      {isResetStrikesSuccess && (
        <div className="mb-6 bg-green-900/50 border-2 border-green-500 rounded-lg p-4 animate-fade-in">
          <p className="text-green-300 font-bold text-lg mb-2">✓ Strikes Reset!</p>
          <p className="text-white/80 text-sm">You can continue playing</p>
        </div>
      )}

      <div className="flex flex-col gap-3 w-full max-w-xs px-4">
        {isResetStrikesSuccess ? (
          <button
            onClick={handleContinue}
            disabled={countdown !== null && countdown > 0}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-4 px-8 rounded-lg text-2xl shadow-lg hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all border-2 border-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {countdown !== null && countdown > 0 ? `Continue (${countdown})` : 'Continue'}
          </button>
        ) : (
          <>
            <button
              onClick={onResetStrikes}
              disabled={isResetStrikesPending}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg hover:from-purple-700 hover:to-purple-800 transform hover:scale-105 transition-all border-2 border-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isResetStrikesPending ? 'Processing...' : 'Reset Strikes (0.05 USD)'}
            </button>
            <button
              onClick={onPlayAgain}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all border-2 border-white/20"
            >
              Play Again
            </button>
          </>
        )}
        
        <button
          onClick={onSubmitScore}
          disabled={isSubmitting || isScoreSubmitted}
          className="bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all border-2 border-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting ? 'Submitting...' : isScoreSubmitted ? '✓ Submitted!' : 'Submit Score'}
        </button>
        
        <button
          onClick={onViewLeaderboard}
          className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg hover:from-yellow-700 hover:to-yellow-800 transform hover:scale-105 transition-all border-2 border-white/20"
        >
          Leaderboard
        </button>
      </div>

      {error && (
        <div className="mt-4 bg-red-900/50 border-2 border-red-500 text-red-200 p-3 rounded-lg max-w-md">
          <p className="font-bold text-sm">Error</p>
          <p className="text-xs">{error.message}</p>
        </div>
      )}
    </div>
  );
};