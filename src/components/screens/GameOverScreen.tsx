import React from 'react';

type SubmissionState = 'idle' | 'pending' | 'success' | 'error';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onPlayAgain: () => void;
  onViewLeaderboard: () => void;
  onSubmitScore: () => void;
  isSubmitting: boolean;
  isSuccess: boolean;
  error: Error | null;
  onResetStrikes: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, highScore, onPlayAgain, onViewLeaderboard, onSubmitScore, isSubmitting, isSuccess, error, onResetStrikes }) => {
  return (
    <div className="flex flex-col items-center justify-center text-white text-center animate-fade-in-scale">
      <h1 className="text-6xl font-black mb-2 text-glitter">GAME OVER</h1>
      <p className="text-2xl text-white/70 mb-6 text-shadow-pop">Your Score</p>
      <p className="text-8xl font-bold mb-10 text-shadow-pop">{score}</p>
      <div className="flex flex-col gap-4 w-64">
        <button
          onClick={onPlayAgain}
          className="bg-black/20 text-white font-bold py-4 px-10 rounded-lg text-2xl shadow-lg hover:bg-black/40 transform hover:scale-105 transition-transform border-2 border-white/20 backdrop-blur-sm text-shadow-pop"
        >
          Play Again
        </button>
        <button
          onClick={onSubmitScore}
          disabled={isSubmitting || isSuccess}
          className="bg-green-600/50 text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg hover:bg-green-600/70 transform hover:scale-105 transition-transform border-2 border-white/20 backdrop-blur-sm text-shadow-pop disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-green-600/50"
        >
          {isSubmitting ? 'Submitting...' : isSuccess ? 'Score Submitted!' : 'Submit Score'}
        </button>
        <button
            onClick={onViewLeaderboard}
            className="bg-blue-600/50 text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg hover:bg-blue-600/70 transform hover:scale-105 transition-transform border-2 border-white/20 backdrop-blur-sm text-shadow-pop"
        >
            Leaderboard
        </button>
        {score === 0 && (
        <button
            onClick={onResetStrikes}
            className="bg-purple-600/50 text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg hover:bg-purple-600/70 transform hover:scale-105 transition-transform border-2 border-white/20 backdrop-blur-sm text-shadow-pop"
        >
            Reset Strikes
        </button>
        )}
      </div>
    </div>
  );
};