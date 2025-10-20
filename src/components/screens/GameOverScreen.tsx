<<<<<<< HEAD
<<<<<<< HEAD
import React from 'react';

type SubmissionState = 'idle' | 'pending' | 'success' | 'error';

interface GameOverScreenProps {
  score: number;
  onPlayAgain: () => void;
  onSubmitScore: () => void;
  submissionState: SubmissionState;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onPlayAgain, onSubmitScore, submissionState }) => {
  
  const getSubmitButtonText = () => {
    switch (submissionState) {
        case 'pending': return 'Submitting...';
        case 'success': return 'Score Submitted!';
        case 'error': return 'Submission Failed';
        default: return 'Submit Score';
    }
  };
  
  const isSubmitDisabled = submissionState === 'pending' || submissionState === 'success' || submissionState === 'error';

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
          disabled={isSubmitDisabled}
          className="bg-green-600/50 text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg hover:bg-green-600/70 transform hover:scale-105 transition-transform border-2 border-white/20 backdrop-blur-sm text-shadow-pop disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-green-600/50"
        >
          {getSubmitButtonText()}
        </button>
      </div>
    </div>
  );
=======
=======
>>>>>>> origin/feat/smart-contracts
import React, { useEffect } from 'react';
import { useWriteContract } from 'wagmi';
import { resetStrikesAbi, resetStrikesAddress } from '../../lib/contracts';

type SubmissionState = 'idle' | 'pending' | 'success' | 'error';

interface GameOverScreenProps {
  score: number;
  onPlayAgain: () => void;
  onSubmitScore: () => void;
  submissionState: SubmissionState;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onPlayAgain, onSubmitScore, submissionState }) => {
  const { data: hash, isPending, writeContract } = useWriteContract();

  const handleResetStrikes = () => {
    writeContract({
      address: resetStrikesAddress,
      abi: resetStrikesAbi,
      functionName: 'resetStrikes',
    });
  };

  useEffect(() => {
    if (hash) {
      // For now, we'll just restart the game. In a real app, you'd wait for the transaction to be mined.
      onPlayAgain();
    }
  }, [hash, onPlayAgain]);
  
  const getSubmitButtonText = () => {
    switch (submissionState) {
        case 'pending': return 'Submitting...';
        case 'success': return 'Score Submitted!';
        case 'error':return 'Submission Failed';
        default: return 'Submit Score';
    }
  };
  
  const isSubmitDisabled = submissionState === 'pending' || submissionState === 'success';

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
          disabled={isSubmitDisabled}
          className="bg-green-600/50 text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg hover:bg-green-600/70 transform hover:scale-105 transition-transform border-2 border-white/20 backdrop-blur-sm text-shadow-pop disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-green-600/50"
        >
          {getSubmitButtonText()}
        </button>
        <button
          onClick={handleResetStrikes}
          disabled={isPending}
          className="bg-purple-600/50 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg hover:bg-purple-600/70 transform hover:scale-105 transition-transform border-2 border-white/20 backdrop-blur-sm text-shadow-pop disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Resetting...' : 'Refresh Strikes'}
        </button>
      </div>
    </div>
  );
>>>>>>> origin/feat/game-updates-and-refactor
};