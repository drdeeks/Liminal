import React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
// FIX: Updated import paths to match the 'src' directory structure.
import { Direction, GameState, AtmosphereStage, getOppositeDirection } from './types';
import { DirectionCard } from './components/game/DirectionCard';
import { Scoreboard } from './components/ui/Scoreboard';
import { GameOverScreen } from './components/screens/GameOverScreen';
import { LeaderboardScreen } from './components/screens/LeaderboardScreen';
import { CountdownTimer } from './components/game/CountdownTimer';
import { InfoScreen } from './components/screens/InfoScreen';
import { StrikesDisplay } from './components/game/StrikesDisplay';
import { InfoIcon } from './components/ui/icons';
import { AtmosphereManager } from './systems/AtmosphereManager';
import { AudioManager, AudioManagerHandle } from './systems/AudioManager';
import { ethers } from 'ethers';
import { LEADERBOARD_CONTRACT_ADDRESS, RESET_STRIKES_CONTRACT_ADDRESS, LEADERBOARD_ABI, RESET_STRIKES_ABI } from './contract-config';

const TOTAL_SCORE_KEY = 'liminalTotalScore';
const JOKER_CHANCE = 0.15; // 15% chance for a joker card
const SWIPE_ANIMATION_DURATION = 300; // ms for the card to fly off-screen

// --- Refined Timing Curve ---
const TIME_START = 2000; // 2.0s at swipe 0
const TIME_MIN = 500;    // 0.5s at swipe 250
const SWIPES_MIN = 250;
// A decay constant chosen to create a smooth, exponential difficulty curve.
// This value is calculated to make the curve feel balanced, closely matching the
// original design's milestone (approx. 1.25s at 50 swipes) while being continuous.
const DECAY_FACTOR = 0.01386;


const getRandomDirection = (): Direction => {
  const directions = [Direction.Up, Direction.Down, Direction.Left, Direction.Right];
  return directions[Math.floor(Math.random() * directions.length)];
};

const getAtmosphereStage = (score: number): AtmosphereStage => {
    if (score >= 1000) return AtmosphereStage.DEEP_LIMINAL;
    if (score >= 500) return AtmosphereStage.THRESHOLD_3;
    if (score >= 250) return AtmosphereStage.THRESHOLD_2;
    if (score >= 100) return AtmosphereStage.THRESHOLD_1;
    return AtmosphereStage.EARLY;
};

type SubmissionState = 'idle' | 'pending' | 'success' | 'error';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.Start);
  const [score, setScore] = useState(0);
  const [correctSwipes, setCorrectSwipes] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [currentDirection, setCurrentDirection] = useState<Direction>(getRandomDirection());
  const [isJoker, setIsJoker] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [cardKey, setCardKey] = useState(0);
  const [isInfoVisible, setInfoVisible] = useState(false);
  const [atmosphereStage, setAtmosphereStage] = useState<AtmosphereStage>(AtmosphereStage.EARLY);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [isSfxMuted, setIsSfxMuted] = useState(false);
  const [showGlitch, setShowGlitch] = useState(false);
  const [keyboardSwipeOutDirection, setKeyboardSwipeOutDirection] = useState<Direction | null>(null);
  const [wallet, setWallet] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [leaderboardContract, setLeaderboardContract] = useState<ethers.Contract | null>(null);
  const [resetStrikesContract, setResetStrikesContract] = useState<ethers.Contract | null>(null);
  const [gameId, setGameId] = useState(0);


  const timerId = useRef<number | null>(null);
  const audioManagerRef = useRef<AudioManagerHandle>(null);
  const glitchIntervalRef = useRef<number | null>(null);
  const swipeProcessed = useRef(false);

  useEffect(() => {
    const storedTotalScore = localStorage.getItem(TOTAL_SCORE_KEY);
    if (storedTotalScore) {
        try {
            setTotalScore(JSON.parse(storedTotalScore));
        } catch (e) {
            console.error("Failed to parse total score from localStorage", e);
        }
    }

    const storedMusicMute = localStorage.getItem('liminalMusicMuted');
    if (storedMusicMute) {
        try {
            setIsMusicMuted(JSON.parse(storedMusicMute));
        } catch (e) {
            console.error("Failed to parse music mute setting from localStorage", e);
        }
    }

    const storedSfxMute = localStorage.getItem('liminalSfxMuted');
    if (storedSfxMute) {
        try {
            setIsSfxMuted(JSON.parse(storedSfxMute));
        } catch (e) {
            console.error("Failed to parse SFX mute setting from localStorage", e);
        }
    }
  }, []);

  const triggerGlitch = useCallback((force = false) => {
    // Only trigger if in the right stage and by random chance, or if forced
    if (atmosphereStage === AtmosphereStage.DEEP_LIMINAL && (force || Math.random() < 0.3)) {
        setShowGlitch(true);
        setTimeout(() => setShowGlitch(false), 200);
    }
  }, [atmosphereStage]);

  useEffect(() => {
    if (atmosphereStage === AtmosphereStage.DEEP_LIMINAL) {
        glitchIntervalRef.current = window.setInterval(() => {
            // Low chance for a random, ambient glitch
            if (Math.random() < 0.1) {
                triggerGlitch(true); // Force trigger for ambient glitches
            }
        }, 3000); // Check every 3 seconds
    }

    return () => {
        if (glitchIntervalRef.current) {
            clearInterval(glitchIntervalRef.current);
        }
    };
  }, [atmosphereStage, triggerGlitch]);

  const connectWallet = useCallback(async () => {
    if (window.ethereum) {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();

            const leaderboard = new ethers.Contract(LEADERBOARD_CONTRACT_ADDRESS, LEADERBOARD_ABI, signer);
            const resetStrikes = new ethers.Contract(RESET_STRIKES_CONTRACT_ADDRESS, RESET_STRIKES_ABI, signer);

            setWallet(provider);
            setSigner(signer);
            setLeaderboardContract(leaderboard);
            setResetStrikesContract(resetStrikes);
        } catch (error: any) {
            if (error.code === 4001) {
                alert("Wallet connection request was rejected. Please approve the connection in your wallet to continue.");
            } else {
                console.error("Failed to connect wallet", error);
            }
        }
    } else {
        alert("Please install MetaMask!");
    }
  }, []);

  const handleSubmitScore = useCallback(async () => {
    if (submissionState !== 'idle' || !leaderboardContract) return;

    setSubmissionState('pending');
    
    try {
        const tx = await leaderboardContract.submitScore(score, gameId);
        await tx.wait();

        const newTotalScore = totalScore + score;
        setTotalScore(newTotalScore);
        localStorage.setItem(TOTAL_SCORE_KEY, JSON.stringify(newTotalScore));
        setSubmissionState('success');
    } catch (error) {
        console.error("Failed to submit score:", error);
        setSubmissionState('error');
    }
  }, [score, totalScore, submissionState, leaderboardContract, gameId]);
  
  const getCardTime = useCallback(() => {
    if (correctSwipes >= SWIPES_MIN) {
      return TIME_MIN;
    }

    // Uses a smooth exponential decay curve for a more balanced and continuous
    // difficulty progression, removing the "corners" of the previous linear segments.
    // The time decreases from TIME_START and asymptotically approaches TIME_MIN.
    const timeRange = TIME_START - TIME_MIN;
    const decay = Math.exp(-DECAY_FACTOR * correctSwipes);
    
    return timeRange * decay + TIME_MIN;
  }, [correctSwipes]);

  const handleGameOver = useCallback(() => {
    if (timerId.current) clearTimeout(timerId.current);
    setSubmissionState('idle'); // Allow submission
    setGameState(GameState.GameOver);
  }, []);

  const generateNextCard = useCallback(() => {
      triggerGlitch();
      swipeProcessed.current = false; // Allow next swipe
      setKeyboardSwipeOutDirection(null); // Reset keyboard swipe trigger
      setCurrentDirection(getRandomDirection());
      setIsJoker(Math.random() < JOKER_CHANCE);
      setCardKey(prev => prev + 1);
  }, [triggerGlitch]);

  useEffect(() => {
      const newStage = getAtmosphereStage(score);
      setAtmosphereStage(newStage);
  }, [score]);

  useEffect(() => {
    if (gameState === GameState.Playing) {
      if (timerId.current) clearTimeout(timerId.current);
      const duration = getCardTime();
      timerId.current = window.setTimeout(() => handleIncorrectSwipe(true), duration);
    } else {
      if (timerId.current) clearTimeout(timerId.current);
    }
    return () => {
      if (timerId.current) clearTimeout(timerId.current);
    };
  }, [gameState, cardKey, getCardTime, handleIncorrectSwipe]);

  const handleCorrectSwipe = useCallback(() => {
    if (swipeProcessed.current) return;
    swipeProcessed.current = true;
    if (timerId.current) clearTimeout(timerId.current);
    audioManagerRef.current?.playCorrectSwipe();
    
    const newCorrectSwipes = correctSwipes + 1;
    setCorrectSwipes(newCorrectSwipes);
    
    // FIX: Simplified and corrected multiplier logic.
    // The multiplier increases by 1 for every 50 correct swipes.
    // e.g., 0-49 -> 1x, 50-99 -> 2x, 100-149 -> 3x
    const newMultiplier = 1 + Math.floor(newCorrectSwipes / 50);
    setMultiplier(newMultiplier);
    
    setScore(prev => prev + (1 * newMultiplier));
    generateNextCard();
  }, [correctSwipes, generateNextCard]);

  const handleIncorrectSwipe = useCallback((isTimeout = false) => {
    if (swipeProcessed.current) return;
    swipeProcessed.current = true;
    if (timerId.current) clearTimeout(timerId.current);
    audioManagerRef.current?.playWrongSwipe();

    const newStrikes = strikes + 1;
    setStrikes(newStrikes);
    
    if (newStrikes >= 3) {
      handleGameOver();
    } else {
      generateNextCard();
    }
  }, [strikes, handleGameOver, generateNextCard]);
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (gameState !== GameState.Playing || swipeProcessed.current) return;

    let swipedDirection: Direction | null = null;
    switch (event.key) {
        case 'ArrowUp': swipedDirection = Direction.Up; break;
        case 'ArrowDown': swipedDirection = Direction.Down; break;
        case 'ArrowLeft': swipedDirection = Direction.Left; break;
        case 'ArrowRight': swipedDirection = Direction.Right; break;
        default: return;
    }
    
    event.preventDefault();
    swipeProcessed.current = true; // Prevent multiple key presses for one card

    const targetDirection = isJoker ? getOppositeDirection(currentDirection) : currentDirection;
    
    if (swipedDirection === targetDirection) {
        setKeyboardSwipeOutDirection(swipedDirection);
        setTimeout(handleCorrectSwipe, SWIPE_ANIMATION_DURATION);
    } else {
        handleIncorrectSwipe();
    }
  }, [gameState, isJoker, currentDirection, handleCorrectSwipe, handleIncorrectSwipe]);

  useEffect(() => {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
          window.removeEventListener('keydown', handleKeyDown);
      };
  }, [handleKeyDown]);


  const startGame = () => {
    audioManagerRef.current?.unlockAudio();
    setScore(0);
    setCorrectSwipes(0);
    setStrikes(0);
    setMultiplier(1);
    setCurrentDirection(getRandomDirection());
    setIsJoker(false);
    setSubmissionState('idle');
    setCardKey(prev => prev + 1);
    swipeProcessed.current = false;
    setGameState(GameState.Playing);
    setGameId(prevGameId => prevGameId + 1); // Use a simple counter for unique game IDs
  };
  
  const toggleMusicMute = () => {
    const newMuteState = !isMusicMuted;
    setIsMusicMuted(newMuteState);
    localStorage.setItem('liminalMusicMuted', JSON.stringify(newMuteState));
  };

  const toggleSfxMute = () => {
      const newMuteState = !isSfxMuted;
      setIsSfxMuted(newMuteState);
      localStorage.setItem('liminalSfxMuted', JSON.stringify(newMuteState));
  };

  const [resetStrikesState, setResetStrikesState] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  const handleResetStrikes = useCallback(async () => {
    if (!resetStrikesContract || resetStrikesState === 'pending') return;

    setResetStrikesState('pending');
    try {
        const price = await resetStrikesContract.price();
        const tx = await resetStrikesContract.resetStrikes({ value: price });
        await tx.wait();
        setStrikes(0);
        setResetStrikesState('success');
        alert('Strikes reset successfully!');
    } catch (error) {
        console.error("Failed to reset strikes:", error);
        setResetStrikesState('error');
        alert('Failed to reset strikes. Please try again.');
    }
  }, [resetStrikesContract, resetStrikesState]);
  
  const renderGameState = () => {
    switch (gameState) {
      case GameState.Playing:
        return (
          <div className="flex flex-col items-center justify-center h-full w-full">
            <Scoreboard score={score} multiplier={multiplier} />
            <div className={`flex flex-col items-center justify-center ${showGlitch ? 'animate-glitch' : ''}`}>
                <div className="relative w-full flex flex-col items-center justify-start pt-32 h-96">
                    <StrikesDisplay strikes={strikes} />
                    <CountdownTimer duration={getCardTime()} key={cardKey} score={score} />
                </div>
                <div className="relative">
                  <DirectionCard 
                    direction={currentDirection} 
                    keyProp={cardKey}
                    onCorrectSwipe={handleCorrectSwipe}
                    onIncorrectSwipe={handleIncorrectSwipe}
                    isJoker={isJoker}
                    score={score}
                    keyboardSwipeOutDirection={keyboardSwipeOutDirection}
                  />
                </div>
            </div>
          </div>
        );
      case GameState.GameOver:
        return <GameOverScreen score={score} onPlayAgain={startGame} onSubmitScore={handleSubmitScore} submissionState={submissionState} />;
      case GameState.Leaderboard:
        return <LeaderboardScreen onBack={() => setGameState(GameState.Start)} />;
      case GameState.Start:
      default:
        return (
          <div className="flex flex-col items-center justify-center text-white text-center animate-fade-in">
            <h1 className="text-8xl font-black mb-4 text-glitter">Liminal</h1>
            <p className="text-2xl mb-12 max-w-md text-shadow-pop">The deeper you go, the more it changes. Three strikes. Good luck.</p>
            <div className="flex gap-4">
                <button
                onClick={startGame}
                className="bg-black/20 text-white font-bold py-4 px-10 rounded-lg text-3xl shadow-lg hover:bg-black/40 transform hover:scale-105 transition-transform border-2 border-white/20 backdrop-blur-sm text-shadow-pop"
                >
                Start Game
                </button>
                {wallet && strikes > 0 && (
                    <button
                        onClick={handleResetStrikes}
                        className="bg-black/20 text-white font-bold py-4 px-10 rounded-lg text-xl shadow-lg hover:bg-black/40 transform hover:scale-105 transition-transform border-2 border-white/20 backdrop-blur-sm text-shadow-pop"
                    >
                        Reset Strikes (0.0001 ETH)
                    </button>
                )}
            </div>
          </div>
        );
    }
  };

  const showLeaderboardButton = gameState === GameState.Start || gameState === GameState.GameOver;
  const showInfoButton = gameState === GameState.Start;
  const showAudioControls = gameState === GameState.Start;

  useEffect(() => {
    // Attempt to connect wallet on component mount
    connectWallet();
  }, []);

  return (
    <main className="w-screen h-screen flex flex-col items-center justify-center overflow-hidden relative bg-black">
      <AtmosphereManager stage={atmosphereStage} />
      <AudioManager 
        ref={audioManagerRef} 
        stage={atmosphereStage} 
        multiplier={multiplier} 
        isMusicMuted={isMusicMuted} 
        isSfxMuted={isSfxMuted}
        onMilestone={() => triggerGlitch(true)} 
      />

      {isInfoVisible && <InfoScreen onClose={() => setInfoVisible(false)} />}
      
        <div className="absolute top-4 right-4 z-10 flex gap-2">
            {showLeaderboardButton && (
                <button
                onClick={() => setGameState(GameState.Leaderboard)}
                className="bg-black/20 text-white font-semibold py-2 px-4 rounded-lg hover:bg-black/40 transition-colors text-shadow-pop border-2 border-white/20 backdrop-blur-sm"
                >
                Leaderboard
                </button>
            )}
            {!wallet && (
                <button
                onClick={connectWallet}
                className="bg-black/20 text-white font-semibold py-2 px-4 rounded-lg hover:bg-black/40 transition-colors text-shadow-pop border-2 border-white/20 backdrop-blur-sm"
                >
                Connect Wallet
                </button>
            )}
      </div>


      <div className="absolute top-4 left-4 z-10 flex gap-2">
        {showInfoButton && (
            <button
            onClick={() => setInfoVisible(true)}
            className="text-white p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors border-2 border-white/20 backdrop-blur-sm"
            aria-label="How to play"
            >
            <InfoIcon />
            </button>
        )}
        {showAudioControls && (
            <>
                <button onClick={toggleMusicMute} className="text-white p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors border-2 border-white/20 backdrop-blur-sm">
                    {isMusicMuted ? '🎵 OFF' : '🎵 ON'}
                </button>
                <button onClick={toggleSfxMute} className="text-white p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors border-2 border-white/20 backdrop-blur-sm">
                    {isSfxMuted ? '🔊 OFF' : '🔊 ON'}
                </button>
            </>
        )}
      </div>

      {renderGameState()}
    </main>
  );
}