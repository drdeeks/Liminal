
import React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Direction, GameState, AtmosphereStage, getOppositeDirection } from '../lib/types';
import { DirectionCard } from '../components/game/DirectionCard';
import { Scoreboard } from '../components/ui/Scoreboard';
import { GameOverScreen } from '../components/screens/GameOverScreen';
import { LeaderboardScreen } from '../components/screens/LeaderboardScreen';
import { CountdownTimer } from '../components/game/CountdownTimer';
import { InfoScreen } from '../components/screens/InfoScreen';
import { StrikesDisplay } from '../components/game/StrikesDisplay';
import { InfoIcon } from '../components/ui/icons';
import { AtmosphereManager } from '../systems/AtmosphereManager';
import { AudioManager, AudioManagerHandle } from '../systems/AudioManager';
import { useAccount, useWriteContract } from 'wagmi';
import { gmAbi, gmAddress } from '../lib/contracts';

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


  const timerId = useRef<number | null>(null);
  const audioManagerRef = useRef<AudioManagerHandle>(null);
  const glitchIntervalRef = useRef<number | null>(null);
  const keydownProcessed = useRef(false);
  const { isConnected } = useAccount();
  const { writeContract } = useWriteContract();

  const handleGm = () => {
    writeContract({
      address: gmAddress,
      abi: gmAbi,
      functionName: 'gm',
    });
  };

  useEffect(() => {
    try {
      const storedTotalScore = localStorage.getItem(TOTAL_SCORE_KEY);
      if (storedTotalScore) setTotalScore(JSON.parse(storedTotalScore));
      
      const storedMusicMute = localStorage.getItem('liminalMusicMuted');
      if (storedMusicMute) setIsMusicMuted(JSON.parse(storedMusicMute));

      const storedSfxMute = localStorage.getItem('liminalSfxMuted');
      if (storedSfxMute) setIsSfxMuted(JSON.parse(storedSfxMute));

    } catch (error) {
      console.error("Failed to load from localStorage", error);
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


  const handleSubmitScore = useCallback(async () => {
    if (submissionState !== 'idle') return;

    setSubmissionState('pending');
    
    // Simulate async on-chain validation
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
        const newTotalScore = totalScore + score;
        setTotalScore(newTotalScore);
        localStorage.setItem(TOTAL_SCORE_KEY, JSON.stringify(newTotalScore));
        setSubmissionState('success');
    } catch (error) {
        console.error("Failed to submit score:", error);
        setSubmissionState('error');
    }
  }, [score, totalScore, submissionState]);
  
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
      keydownProcessed.current = false; // Allow next key press
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
  }, [gameState, cardKey, getCardTime]);

  const handleCorrectSwipe = useCallback(() => {
    if (timerId.current) clearTimeout(timerId.current);
    audioManagerRef.current?.playCorrectSwipe();
    
    const newCorrectSwipes = correctSwipes + 1;
    setCorrectSwipes(newCorrectSwipes);
    
    let currentMultiplier = 1;
    if (newCorrectSwipes > 100) {
      currentMultiplier = 1 + Math.floor((newCorrectSwipes - 100) / 50) + 1;
    }
    setMultiplier(currentMultiplier);
    
    setScore(prev => prev + (1 * currentMultiplier));
    generateNextCard();
  }, [correctSwipes, generateNextCard]);

  const handleIncorrectSwipe = useCallback((isTimeout = false) => {
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
    if (gameState !== GameState.Playing || keydownProcessed.current) return;

    let swipedDirection: Direction | null = null;
    switch (event.key) {
        case 'ArrowUp': swipedDirection = Direction.Up; break;
        case 'ArrowDown': swipedDirection = Direction.Down; break;
        case 'ArrowLeft': swipedDirection = Direction.Left; break;
        case 'ArrowRight': swipedDirection = Direction.Right; break;
        default: return;
    }
    
    event.preventDefault();
    keydownProcessed.current = true; // Prevent multiple key presses for one card

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
    keydownProcessed.current = false;
    setGameState(GameState.Playing);
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
        return <LeaderboardScreen totalScore={totalScore} onBack={() => setGameState(GameState.Start)} />;
      case GameState.Start:
      default:
        return (
          <div className="flex flex-col items-center justify-center text-white text-center animate-fade-in">
            <h1 className="text-8xl font-black mb-4 text-glitter">Liminal</h1>
            <p className="text-2xl mb-12 max-w-md text-shadow-pop">The deeper you go, the more it changes. Three strikes. Good luck.</p>
            <button
              onClick={startGame}
              className="bg-black/20 text-white font-bold py-4 px-10 rounded-lg text-3xl shadow-lg hover:bg-black/40 transform hover:scale-105 transition-transform border-2 border-white/20 backdrop-blur-sm text-shadow-pop"
            >
              Start Game
            </button>
            <button
              onClick={handleGm}
              className="mt-4 bg-blue-600/50 text-white font-bold py-2 px-6 rounded-lg text-xl shadow-lg hover:bg-blue-600/70 transform hover:scale-105 transition-transform border-2 border-white/20 backdrop-blur-sm text-shadow-pop"
            >
              GM
            </button>
          </div>
        );
    }
  };

  const showLeaderboardButton = gameState === GameState.Start || gameState === GameState.GameOver;
  const showInfoButton = gameState === GameState.Start;
  const showAudioControls = gameState === GameState.Start;

  if (!isConnected) {
    return (
      <main className="w-screen h-screen flex flex-col items-center justify-center overflow-hidden relative bg-black">
        <div className="flex flex-col items-center justify-center text-white text-center animate-fade-in">
          <h1 className="text-8xl font-black mb-4 text-glitter">Liminal</h1>
          <p className="text-2xl mb-12 max-w-md text-shadow-pop">Connect your wallet to begin.</p>
          {/* NOTE: The actual connection is handled by the Wagmi provider modal */}
          <button
            onClick={() => {
              // This button is primarily for show, as the modal handles connection.
              // You might want to trigger the modal programmatically here if not already visible.
            }}
            className="bg-black/20 text-white font-bold py-4 px-10 rounded-lg text-3xl shadow-lg hover:bg-black/40 transform hover:scale-105 transition-transform border-2 border-white/20 backdrop-blur-sm text-shadow-pop"
          >
            Connect Wallet
          </button>
        </div>
      </main>
    );
  }

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
      
      {showLeaderboardButton && (
        <button
          onClick={() => setGameState(GameState.Leaderboard)}
          className="absolute top-4 right-4 bg-black/20 text-white font-semibold py-2 px-4 rounded-lg hover:bg-black/40 transition-colors text-shadow-pop border-2 border-white/20 backdrop-blur-sm z-10"
        >
          Leaderboard
        </button>
      )}

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