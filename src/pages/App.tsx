import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAccount, useConnect, useDisconnect, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { GameCountdown } from '../components/screens/GameCountdown';
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
import { Direction, getRandomDirection } from '../lib/types';
import { gmrAbi, gmrAddress, leaderboardAbi, leaderboardAddress, resetStrikesAbi, resetStrikesAddress } from '../lib/contracts';
import { base } from 'wagmi/chains';
import { monad } from '../lib/wagmi';
import { parseEther } from 'viem';
import sdk, { useMiniAppContext } from '@farcaster/miniapp-sdk';
import aggregatorV3InterfaceAbi from '../abis/AggregatorV3Interface.json';

type GameState = 'menu' | 'howToPlay' | 'countdown' | 'playing' | 'gameOver' | 'leaderboard';

const INITIAL_STRIKES = 3;
const GAME_DURATION_MS = 30000;
const CARD_INITIAL_TIME_MS = 2000; // 2.0 seconds
const CARD_MIN_TIME_MS = 750;     // 0.75 seconds
const SCORE_FOR_MAX_DIFFICULTY = 5000; // Score at which card time reaches its minimum

const App: React.FC = () => {
    const { address, isConnected, chain } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const { data: hash, error: writeError, isPending, writeContract } = useWriteContract();
    const { data: gmrHash, writeContract: writeGmrContract } = useWriteContract();
    const { data: resetStrikesHash, writeContract: writeResetStrikesContract } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    const { fid, username, displayName, pfpUrl } = useMiniAppContext();
    console.log('Farcaster Context:', { fid, username, displayName, pfpUrl });

    const ethUsdPriceFeedAddress = '0x4aDC67696bA383F43DD60A9eA083f33224687279'; // Base ETH/USD

    const { data: ethPriceData } = useReadContract({
        address: ethUsdPriceFeedAddress,
        abi: aggregatorV3InterfaceAbi,
        functionName: 'latestRoundData',
        chainId: base.id,
    });

    console.log('ethPriceData', ethPriceData);

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
    const [multiplier, setMultiplier] = useState(1);
    const [cardTimerId, setCardTimerId] = useState<NodeJS.Timeout | null>(null);

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
        
        if (gameState === 'playing') { // Only set timer if game is playing
            const timer = setTimeout(() => {
                handleIncorrectSwipe();
            }, currentCardTimeLimit);
            setCardTimerId(timer);
        }
    }, [cardTimerId, handleIncorrectSwipe, currentCardTimeLimit, gameState]);

    const handleCorrectSwipe = useCallback(() => {
        if (cardTimerId) clearTimeout(cardTimerId);
        setScore(prev => prev + 1);
        setSparkle(true);
        audioManager.current?.playCorrectSwipe();
        handleGenerateNewCard();
    }, [cardTimerId, handleGenerateNewCard]);

    const handleIncorrectSwipe = useCallback(() => {
        if (cardTimerId) clearTimeout(cardTimerId);
        setStrikes(prev => prev - 1);
        setShake(true);
        audioManager.current?.playWrongSwipe();
        setTimeout(() => setShake(false), 500);
        handleGenerateNewCard();
    }, [cardTimerId, handleGenerateNewCard]);

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

        let txValue = 0n;
        if (chain.id === base.id && ethPriceData) {
            const [, price, , ,] = ethPriceData as [bigint, bigint, bigint, bigint, bigint];
            const ethPriceInUsd = Number(price) / 1e8; // The price has 8 decimals
            const costInUsd = 0.05;
            const costInEth = costInUsd / ethPriceInUsd;
            txValue = parseEther(costInEth.toString());
        }

        writeResetStrikesContract({
            address: contractAddress,
            abi: resetStrikesAbi,
            functionName: 'resetStrikes',
            args: [],
            value: txValue,
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
        // Clear timer on unmount or when game state is not 'playing'
        return () => {
            if (cardTimerId) {
                clearTimeout(cardTimerId);
            }
        };
    }, [gameState, cardTimerId]);

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
    return <GameCountdown onComplete={handleCountdownComplete} />;
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
            <LiminalBackground difficulty={1 + gameIntensity * 9} intensity={gameIntensity} />
            <OverlayNoise intensity={gameIntensity} />
            <TemporalBackground phase={gameIntensity * 5} intensity={gameIntensity} />
            <AtmosphereManager score={score} />
            <SparkleController on={sparkle} onComplete={() => setSparkle(false)} />
            <AudioManager ref={audioManager} isMusicMuted={false} isSfxMuted={false} multiplier={gameIntensity} onMilestone={() => {}} stage={gameIntensity * 5} />

            <div className="absolute top-0 left-0 right-0 p-4 z-10">
                <div className="flex justify-between items-center text-white text-2xl font-bold bg-black/20 p-3 rounded-lg border-2 border-white/20 backdrop-blur-sm w-full">
                    <div className="text-shadow-pop">
                        <span className="text-white/70 text-lg font-semibold">SCORE</span>
                        <p data-testid="score">{score}</p>
                    </div>
                    {gameState === 'playing' && gameStartTime && (
                        <CountdownTimer
                            startTime={gameStartTime}
                            duration={GAME_DURATION_MS}
                            onTimesUp={handleTimesUp}
                        />
                    )}
                    <div className="text-shadow-pop text-right">
                        <span className="text-white/70 text-lg font-semibold">MULTIPLIER</span>
                        <p>{multiplier}x</p>
                    </div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 mt-2">
                    <StrikesDisplay strikes={strikes} />
                </div>
            </div>

            {renderGameState()}
        </main>
    );
};

export default App;
