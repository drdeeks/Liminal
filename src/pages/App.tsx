import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAccount, useConnect, useDisconnect, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { DirectionCard } from '../components/game/DirectionCard';
import { GameOverScreen } from '../components/screens/GameOverScreen';
import { HowToPlayScreen } from '../components/screens/HowToPlayScreen';
import { LeaderboardScreen } from '../components/screens/LeaderboardScreen';
import { CountdownTimer } from '../components/game/CountdownTimer';
import { StrikesDisplay } from '../components/game/StrikesDisplay';

import { SparkleController } from '../components/ui/SparkleController';
import { AtmosphereManager } from '../systems/AtmosphereManager';
import { LiminalBackground } from '../components/ui/LiminalBackground';
import { OverlayNoise } from '../components/ui/OverlayNoise';
import { TemporalBackground } from '../components/ui/TemporalBackground';
import { AudioManager, AudioManagerHandle } from '../systems/AudioManager';
import { Direction, getRandomDirection, GameState } from '../lib/types';
import { base } from 'wagmi/chains';
import { monadTestnet } from '../lib/contracts';
import { parseEther } from 'viem';
import { contracts } from '../lib/contracts';

const INITIAL_STRIKES = 3;
const CARD_INITIAL_TIME_MS = 2000;
const CARD_MIN_TIME_MS = 750;
const SCORE_FOR_MAX_DIFFICULTY = 5000;

const App: React.FC = () => {
    const { address, isConnected, chain } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const { data: hash, error: writeError, isPending, writeContract } = useWriteContract();
    const { data: gmrHash, writeContract: writeGmrContract } = useWriteContract();
    const { data: resetStrikesHash, writeContract: writeResetStrikesContract } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    const audioManager = useRef<AudioManagerHandle>(null);

    const { data: ethPriceData } = useReadContract({
        address: chain?.id === monadTestnet.id ? contracts.monad.aggregatorV3.address : contracts.base.aggregatorV3.address,
        abi: chain?.id === monadTestnet.id ? contracts.monad.aggregatorV3.abi : contracts.base.aggregatorV3.abi,
        functionName: 'latestRoundData',
        chainId: chain?.id,
    });

    useEffect(() => {
        if (ethPriceData) {
            console.log('ethPriceData', ethPriceData);
        }
    }, [ethPriceData]);

    useEffect(() => {
        const storedHighScore = localStorage.getItem('gmr-high-score');
        if (storedHighScore) {
            setHighScore(parseInt(storedHighScore, 10));
        }
    }, []);

    const [gameState, setGameState] = useState<GameState>('menu');
    const [score, setScore] = useState(0);
    const [strikes, setStrikes] = useState(INITIAL_STRIKES);
    const [highScore, setHighScore] = useState(0);
    const [gameStartTime, setGameStartTime] = useState<number | null>(null);
    const [currentDirection, setCurrentDirection] = useState(getRandomDirection());
    const [isJoker, setIsJoker] = useState(false);
    const [cardKey, setCardKey] = useState(0);
    const [shake, setShake] = useState(false);
    const [flash, setFlash] = useState(false);
    const [sparkle, setSparkle] = useState(false);
    const [keyboardSwipeOutDirection, setKeyboardSwipeOutDirection] = useState<Direction | null>(null);
    const [multiplier, setMultiplier] = useState(1);
    const [consecutiveCorrectSwipes, setConsecutiveCorrectSwipes] = useState(0);
    const [cardTimerId, setCardTimerId] = useState<NodeJS.Timeout | null>(null);
    const [entranceState, setEntranceState] = useState<'idle' | 'sentence' | 'dimming' | 'countdown'>('idle');
    const [entranceCountdown, setEntranceCountdown] = useState(3);

    const currentCardTimeLimit = useMemo(() => {
        const progress = Math.min(score / SCORE_FOR_MAX_DIFFICULTY, 1);
        return CARD_INITIAL_TIME_MS - (progress * (CARD_INITIAL_TIME_MS - CARD_MIN_TIME_MS));
    }, [score]);

    const handleGenerateNewCard = useCallback(() => {
        if (cardTimerId) {
            clearTimeout(cardTimerId);
        }
        const isJokerCard = Math.random() < 0.25;
        setIsJoker(isJokerCard);
        setCurrentDirection(getRandomDirection());
        setCardKey(prev => prev + 1);
        setKeyboardSwipeOutDirection(null);
        setGameStartTime(performance.now()); // Set gameStartTime when a new card is generated
        
        if (gameState === 'playing') {
            const timer = setTimeout(() => {
                handleIncorrectSwipe();
            }, currentCardTimeLimit);
            setCardTimerId(timer);
        }
    }, [cardTimerId, currentCardTimeLimit, gameState]);

    const handleCorrectSwipe = useCallback(() => {
        if (cardTimerId) clearTimeout(cardTimerId);
        setScore(prev => prev + multiplier);
        setSparkle(true);
        const newConsecutive = consecutiveCorrectSwipes + 1;
        setConsecutiveCorrectSwipes(newConsecutive);
        if (newConsecutive % 5 === 0) {
            setMultiplier(prev => prev + 1);
        }
        audioManager.current?.playCorrectSwipe();
        handleGenerateNewCard();
    }, [cardTimerId, handleGenerateNewCard, multiplier, consecutiveCorrectSwipes]);

    const handleIncorrectSwipe = useCallback(() => {
        if (cardTimerId) clearTimeout(cardTimerId);
        const newStrikes = strikes - 1;
        setStrikes(newStrikes);
        setShake(true);
        setMultiplier(1);
        setConsecutiveCorrectSwipes(0);

        if (newStrikes <= 0) {
            setGameState('gameOver');
        } else {
            if (gameState === 'playing') {
                setFlash(true);
                setTimeout(() => setFlash(false), 300);
            }
            audioManager.current?.playWrongSwipe();
            setTimeout(() => setShake(false), 500);
            handleGenerateNewCard();
        }
    }, [cardTimerId, handleGenerateNewCard, gameState, strikes]);

    const startGame = () => {
        setEntranceState('sentence');
    };

    const handleStartGame = () => {
        setScore(0);
        setStrikes(INITIAL_STRIKES);
        setGameState('playing'); // Directly start playing after entrance sequence
    };

    const handleCountdownComplete = () => {
        setGameState('playing');
        setGameStartTime(performance.now());
    };

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
        const contractConfig = chain.id === monadTestnet.id ? contracts.monad.gmr : contracts.base.gmr;
        if (!contractConfig.address) {
            console.error(`No GMR contract address found for chain ID ${chain.id}`);
            return;
        }

        writeGmrContract({
            address: contractConfig.address,
            abi: contractConfig.abi,
            functionName: 'mint',
            args: [address, parseEther('1')],
            chainId: chain.id,
            account: address,
        });
    };

    const handleResetStrikes = () => {
        if (!address || !chain) return;
        const contractConfig = chain.id === monadTestnet.id ? contracts.monad.resetStrikes : contracts.base.resetStrikes;
        if (!contractConfig.address) {
            console.error(`No ResetStrikes contract address found for chain ID ${chain.id}`);
            return;
        }

        let txValue = 0n;
        if (chain.id === base.id && ethPriceData) {
            const [, price, , ,] = ethPriceData as [bigint, bigint, bigint, bigint, bigint];
            const ethPriceInUsd = Number(price) / 1e8;
            const costInUsd = 0.05;
            const costInEth = costInUsd / ethPriceInUsd;
            txValue = parseEther(costInEth.toString());
        }

        writeResetStrikesContract({
            address: contractConfig.address,
            abi: contractConfig.abi,
            functionName: 'resetStrikes',
            args: [],
            value: txValue,
            chainId: chain.id,
            account: address,
        });
    };

    const handleSubmitScore = useCallback(() => {
        console.log('handleSubmitScore called');
        if (!address || !chain) {
            console.log('handleSubmitScore: Missing address or chain', { address, chain });
            return;
        }
        const contractConfig = chain.id === monadTestnet.id ? contracts.monad.leaderboard : contracts.base.leaderboard;
        if (!contractConfig.address) {
            console.error(`No leaderboard contract address found for chain ID ${chain.id}`);
            return;
        }
        console.log('handleSubmitScore: Submitting score', { score, contractConfig });

        writeContract({
            address: contractConfig.address,
            abi: contractConfig.abi,
            functionName: 'submitScore',
            args: [BigInt(score)],
            chainId: chain.id,
            account: address,
        });
    }, [address, chain, score, writeContract]);

    useEffect(() => {
        if (strikes <= 0) {
            setGameState('gameOver');
            if (score > highScore) {
                setHighScore(score);
                localStorage.setItem('gmr-high-score', score.toString());
            }
            console.log('Game Over triggered. GameState:', 'gameOver');
        }
    }, [strikes, score, highScore]);

    useEffect(() => {
        if (gameState === 'gameOver') {
            setFlash(false);
        }
    }, [gameState]);

    useEffect(() => {
        if (flash) {
            const timer = setTimeout(() => {
                setFlash(false);
            }, 300); // Same duration as the animation
            return () => clearTimeout(timer);
        }
    }, [flash]);

    useEffect(() => {
        if (entranceState === 'sentence') {
            const timer = setTimeout(() => {
                setEntranceState('dimming');
            }, 3000); // Display sentence for 3 seconds
            return () => clearTimeout(timer);
        } else if (entranceState === 'dimming') {
            setEntranceCountdown(3);
            const countdownInterval = setInterval(() => {
                setEntranceCountdown(prev => {
                    if (prev - 1 <= 0) {
                        clearInterval(countdownInterval);
                        setEntranceState('idle');
                        setGameState('playing');
                        setFlash(true); // Trigger neon flash on game start
                        setTimeout(() => setFlash(false), 300); // Reset flash after 300ms
                        handleGenerateNewCard(); // Start the game automatically
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(countdownInterval);
        }
    }, [entranceState]);

    useEffect(() => {
        return () => {
            if (cardTimerId) {
                clearTimeout(cardTimerId);
            }
        };
    }, [gameState, cardTimerId]);

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
        if (entranceState === 'sentence') {
            return (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-50 transition-opacity duration-1000">
                    <p className="text-white text-4xl text-center entrance-sentence-fade-out">
                        The Length of the Liminal is unknown.
                        <br />
                        The End, has never been discovered.
                    </p>
                </div>
            );
        } else if (entranceState === 'dimming') {
            return (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50 transition-opacity duration-1000">
                    <p className="text-white text-8xl font-bold animate-pulse">{entranceCountdown}</p>
                </div>
            );
        }

        switch (gameState) {
            case 'howToPlay':
                return <HowToPlayScreen onStart={handleStartGame} onCancel={handleBackToMenu} />;
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

    const gameIntensity = useMemo(() => {
        return Math.min(score / 1000, 1);
    }, [score]);

    return (
        <main className={`w-screen h-screen overflow-hidden ${shake ? 'animate-shake' : ''}`}>
            <LiminalBackground difficulty={1 + gameIntensity * 9} intensity={gameIntensity} />
            <OverlayNoise intensity={gameIntensity} />
            <TemporalBackground phase={gameIntensity * 5} intensity={gameIntensity} />
            <AtmosphereManager score={score} />
            <SparkleController on={sparkle} onComplete={() => setSparkle(false)} />
            <AudioManager ref={audioManager} isMusicMuted={false} isSfxMuted={false} multiplier={gameIntensity} onMilestone={() => {}} stage={gameIntensity * 5} />

            {flash && <div className="absolute inset-0 z-50 animate-flash-neon pointer-events-none"></div>}

            <div className="absolute top-0 left-0 right-0 p-4 z-10">
                <div className="flex justify-between items-center text-white text-2xl font-bold bg-black/20 p-3 rounded-lg border-2 border-white/20 backdrop-blur-sm w-full">
                    <div className="text-shadow-pop">
                        <span className="text-white/70 text-lg font-semibold">SCORE</span>
                        <p data-testid="score">{score}</p>
                    </div>
                    <div className="flex-grow flex justify-center">
                        <CountdownTimer
                            startTime={gameStartTime}
                            duration={currentCardTimeLimit}
                            onTimesUp={handleIncorrectSwipe}
                            gameState={gameState}
                        />
                    </div>
                    <div className="text-shadow-pop text-right">
                        <span className="text-white/70 text-lg font-semibold">MULTIPLIER</span>
                        <p>{multiplier}x</p>
                    </div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 mt-2">
                    {gameState !== 'gameOver' && <StrikesDisplay key={gameState} strikes={strikes} />}
                </div>
            </div>

            {renderGameState()}
        </main>
    );
};

export default App;