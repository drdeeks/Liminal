import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAccount, useConnect, useDisconnect, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';

import { DirectionCard } from '../components/game/DirectionCard';
import { GameOverScreen } from '../components/screens/GameOverScreen';
import { HowToPlayScreen } from '../components/screens/HowToPlayScreen';
import { LeaderboardScreen } from '../components/screens/LeaderboardScreen';
import { CountdownTimer } from '../components/game/CountdownTimer';
import { StrikesDisplay } from '../components/game/StrikesDisplay';
import { Scoreboard } from '../components/ui/Scoreboard';
import { SparkleController } from '../components/ui/SparkleController';
import { AtmosphereManager } from '../systems/AtmosphereManager';
import { AudioManager, AudioManagerHandle } from '../systems/AudioManager';
import { Direction, getRandomDirection } from '../lib/types';
import { gmrAbi, gmrAddress, leaderboardAbi, leaderboardAddress, resetStrikesAbi, resetStrikesAddress } from '../lib/contracts';
import { base } from 'wagmi/chains';
import { monad } from '../lib/wagmi';
import sdk from '@farcaster/miniapp-sdk';

type GameState = 'menu' | 'howToPlay' | 'countdown' | 'playing' | 'gameOver' | 'leaderboard';

const INITIAL_STRIKES = 3;
const GAME_DURATION_MS = 30000;

const App: React.FC = () => {
    const { address, isConnected, chain } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const { data: hash, error: writeError, isPending, writeContract } = useWriteContract();
    const { data: gmrHash, writeContract: writeGmrContract } = useWriteContract();
    const { data: resetStrikesHash, writeContract: writeResetStrikesContract } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    const [gameState, setGameState] = useState<GameState>('menu');
    const [score, setScore] = useState(0);
    const [strikes, setStrikes] = useState(INITIAL_STRIKES);
    const [highScore, setHighScore] = useState(0);
    const [gameStartTime, setGameStartTime] = useState<number | null>(null);
    const [currentDirection, setCurrentDirection] = useState(getRandomDirection());
    const [isJoker, setIsJoker] = useState(false);
    const [cardKey, setCardKey] = useState(0);
    const [shake, setShake] = useState(false);
    const [sparkle, setSparkle] = useState(false);
    const [keyboardSwipeOutDirection, setKeyboardSwipeOutDirection] = useState<Direction | null>(null);

    const audioManager = useRef<AudioManagerHandle>(null);

    const handleGenerateNewCard = useCallback(() => {
        const isJokerCard = Math.random() < 0.25;
        setIsJoker(isJokerCard);
        setCurrentDirection(getRandomDirection());
        setCardKey(prev => prev + 1);
        setKeyboardSwipeOutDirection(null);
    }, []);

    const handleCorrectSwipe = useCallback(() => {
        setScore(prev => prev + 100);
        setSparkle(true);
        audioManager.current?.playCorrectSwipe();
        handleGenerateNewCard();
    }, [handleGenerateNewCard]);

    const handleIncorrectSwipe = useCallback(() => {
        setStrikes(prev => prev - 1);
        setShake(true);
        audioManager.current?.playWrongSwipe();
        setTimeout(() => setShake(false), 500);
        handleGenerateNewCard();
    }, [handleGenerateNewCard]);

    const startGame = () => {
        setGameState('howToPlay');
    };

    const handleStartGame = () => {
        setScore(0);
        setStrikes(INITIAL_STRIKES);
        setGameState('countdown');
    };

    const handleCountdownComplete = () => {
        setGameState('playing');
        setGameStartTime(performance.now());
    };

    const handleTimesUp = useCallback(() => {
        setGameState('gameOver');
        if (score > highScore) {
            setHighScore(score);
        }
    }, [score, highScore]);

    const handlePlayAgain = () => {
        startGame();
    };

    const handleViewLeaderboard = () => {
        setGameState('leaderboard');
    };

    const handleBackToMenu = () => {
        setGameState('menu');
    };

    const handleGm = () => {
        if (!address || !chain) return;
        const contractAddress = chain.id === monad.id ? gmrAddress[monad.id] : gmrAddress[base.id];
        if (!contractAddress) {
            console.error(`No GMR contract address found for chain ID ${chain.id}`);
            return;
        }

        writeGmrContract({
            address: contractAddress,
            abi: gmrAbi,
            functionName: 'gm',
            args: [],
        });
    };

    const handleResetStrikes = () => {
        if (!address || !chain) return;
        const contractAddress = chain.id === monad.id ? resetStrikesAddress[monad.id] : resetStrikesAddress[base.id];
        if (!contractAddress) {
            console.error(`No ResetStrikes contract address found for chain ID ${chain.id}`);
            return;
        }

        writeResetStrikesContract({
            address: contractAddress,
            abi: resetStrikesAbi,
            functionName: 'resetStrikes',
            args: [],
        });
    };

    const handleSubmitScore = useCallback(() => {
        if (!address || !chain) return;
        const contractAddress = chain.id === monad.id ? leaderboardAddress[monad.id] : leaderboardAddress[base.id];
        if (!contractAddress) {
            console.error(`No leaderboard contract address found for chain ID ${chain.id}`);
            return;
        }

        writeContract({
            address: contractAddress,
            abi: leaderboardAbi,
            functionName: 'updateScore',
            args: [BigInt(score)],
        });
    }, [address, chain, score, writeContract]);

    useEffect(() => {
        if (strikes <= 0) {
            setGameState('gameOver');
        }
    }, [strikes]);

    useEffect(() => {
        sdk.actions.ready();
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (gameState !== 'playing') return;

            let swipedDir: Direction | null = null;
            switch (event.key) {
                case 'ArrowUp': swipedDir = Direction.Up; break;
                case 'ArrowDown': swipedDir = Direction.Down; break;
                case 'ArrowLeft': swipedDir = Direction.Left; break;
                case 'ArrowRight': swipedDir = Direction.Right; break;
                default: return;
            }

            if (swipedDir !== null) {
                setKeyboardSwipeOutDirection(swipedDir);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState]);

    const renderGameState = () => {
        switch (gameState) {
            case 'howToPlay':
                return <HowToPlayScreen onStart={handleStartGame} onCancel={handleBackToMenu} />;
            case 'countdown':
                return (
                    <div className="flex flex-col items-center justify-center h-full">
                      <AnimatePresence>
                        <motion.div
                          key="countdown"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.5, ease: 'easeInOut' }}
                          className="text-white text-6xl font-bold"
                        >
                            Get Ready...
                        </motion.div>
                      </AnimatePresence>
                    </div>
                );
            case 'playing':
                return (
                    <div className="relative flex flex-col items-center justify-center h-full w-full overflow-hidden">
                        <AnimatePresence>
                            <motion.div
                                key={cardKey}
                                initial={{ scale: 0.8, y: 100, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.8, x: '100vw', opacity: 0 }}
                                transition={{ duration: 0.35, ease: 'easeOut' }}
                                className="absolute"
                            >
                                <DirectionCard
                                    keyProp={cardKey}
                                    direction={currentDirection}
                                    onCorrectSwipe={handleCorrectSwipe}
                                    onIncorrectSwipe={handleIncorrectSwipe}
                                    isJoker={isJoker}
                                    score={score}
                                    keyboardSwipeOutDirection={keyboardSwipeOutDirection}
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                );
            case 'gameOver':
                return <GameOverScreen
                    score={score}
                    highScore={highScore}
                    onPlayAgain={handlePlayAgain}
                    onViewLeaderboard={handleViewLeaderboard}
                    onSubmitScore={handleSubmitScore}
                    isSubmitting={isPending || isConfirming}
                    isSuccess={isConfirmed}
                    error={writeError}
                    onResetStrikes={handleResetStrikes}
                />;
            case 'leaderboard':
                return <LeaderboardScreen onBack={handleBackToMenu} />;
            case 'menu':
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full">
                        <h1 className="text-6xl font-bold text-white mb-8 title-shadow">Liminal</h1>
                        {isConnected ? (
                            <div className="flex flex-col items-center">
                                <p className="text-white text-lg mb-4">Welcome, {address?.slice(0, 6)}...{address?.slice(-4)}</p>
                                <button
                                    className="px-8 py-4 bg-green-500 text-white font-bold rounded-lg text-2xl shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105"
                                    onClick={startGame}
                                >
                                    Start Game
                                </button>
                                <button
                                    className="mt-4 px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow hover:bg-gray-700 transition-colors"
                                    onClick={() => disconnect()}
                                >
                                    Disconnect
                                </button>
                                <button
                                    className="mt-4 px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow hover:bg-purple-700 transition-colors"
                                    onClick={handleGm}
                                >
                                    Say GM
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col space-y-2">
                                {connectors.map((connector) => (
                                    <button
                                        key={connector.uid}
                                        className="px-8 py-4 bg-blue-500 text-white font-bold rounded-lg text-2xl shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-105"
                                        onClick={() => connect({ connector })}
                                    >
                                        Connect Wallet
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <main className={`w-screen h-screen overflow-hidden ${shake ? 'animate-shake' : ''}`}>
            <AtmosphereManager score={score} />
            <SparkleController on={sparkle} onComplete={() => setSparkle(false)} />
            <AudioManager ref={audioManager} isMusicMuted={false} isSfxMuted={false} multiplier={0} onMilestone={() => {}} stage={0} />

            <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center">
                <Scoreboard score={score} />
                {gameState === 'playing' && gameStartTime && (
                    <CountdownTimer
                        startTime={gameStartTime}
                        duration={GAME_DURATION_MS}
                        onTimesUp={handleTimesUp}
                    />
                )}
                <StrikesDisplay strikes={strikes} />
            </div>

            {renderGameState()}
        </main>
    );
};

export default App;
