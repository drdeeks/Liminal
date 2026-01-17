import React, { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import { useAccount, useConnect, useDisconnect, useWriteContract, useWaitForTransactionReceipt, useReadContract, useSwitchChain } from 'wagmi';
import sdk from '@farcaster/miniapp-sdk';
import { motion, AnimatePresence } from 'framer-motion';
import { DirectionCard } from '../components/game/DirectionCard';
import { CountdownTimer } from '../components/game/CountdownTimer';
import { StrikesDisplay } from '../components/game/StrikesDisplay';
import { SparkleController } from '../components/ui/SparkleController';
import { AtmosphereManager } from '../systems/AtmosphereManager';
import { LiminalBackground } from '../components/ui/LiminalBackground';
import { OverlayNoise } from '../components/ui/OverlayNoise';
import { TemporalBackground } from '../components/ui/TemporalBackground';
import { SwipeMask } from '../components/ui/SwipeMask';
import { AudioManager, AudioManagerHandle } from '../systems/AudioManager';
import { Direction, getRandomDirection, GameState } from '../lib/types';
import { GAME_CONFIG, ANIMATION, HAPTICS } from '../lib/constants';
import { base } from 'wagmi/chains';
import { monadTestnet, contracts } from '../lib/contracts';
import { parseEther } from 'viem';
import { ChainSelector } from '../components/ui/ChainSelector';

const HowToPlayScreen = lazy(() => import('../components/screens/HowToPlayScreen').then(m => ({ default: m.HowToPlayScreen })));
const GameOverScreen = lazy(() => import('../components/screens/GameOverScreen').then(m => ({ default: m.GameOverScreen })));
const LeaderboardScreen = lazy(() => import('../components/screens/LeaderboardScreen').then(m => ({ default: m.LeaderboardScreen })));

const INTRO_MESSAGES = [
    "It knows which way you'll turn before you do.",
    "Some say it remembers every mistake you've ever made.",
    "The deeper you go, the less certain direction becomes.",
    "Three chances. Three warnings. Three doors closing.",
    "Time bends differently here—faster with each breath.",
    "The joker always lies, but only when you're watching.",
    "Your score isn't measuring skill. It's measuring something else.",
    "The atmosphere shifts because you've gone too far to return.",
    "Every swipe leaves a trace in the space between decisions.",
    "It rewards precision, but it craves hesitation.",
    "The leaderboard doesn't just track players—it watches them.",
    "Reset your strikes, but you can't reset what it's learned about you.",
    "The music changes when you cross a threshold you can't see.",
    "Opposite means something different at the edges of the game.",
    "Each card is a test. Each test is a doorway. Each doorway narrows.",
];

const App: React.FC = () => {
    const { address, isConnected, chain } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const { switchChain } = useSwitchChain();
    const { data: hash, error: writeError, isPending, writeContract } = useWriteContract();
    const { data: gmrHash, writeContract: writeGmrContract } = useWriteContract();
    const { data: resetStrikesHash, writeContract: writeResetStrikesContract, isPending: isResetStrikesPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
    const { isSuccess: isResetStrikesSuccess, isLoading: isResetStrikesConfirming } = useWaitForTransactionReceipt({ hash: resetStrikesHash });

    const audioManager = useRef<AudioManagerHandle>(null);

    const { data: ethPriceData } = useReadContract({
        address: contracts.base.aggregatorV3.address,
        abi: contracts.base.aggregatorV3.abi,
        functionName: 'latestRoundData',
        chainId: base.id,
    });

    const [gameState, setGameState] = useState<GameState>('menu');
    const [score, setScore] = useState(0);
    const [strikes, setStrikes] = useState<number>(GAME_CONFIG.INITIAL_STRIKES);
    const [gameStartTime, setGameStartTime] = useState<number | null>(null);
    const [currentDirection, setCurrentDirection] = useState(getRandomDirection());
    const [isJoker, setIsJoker] = useState(false);
    const [cardKey, setCardKey] = useState(0);
    const [shake, setShake] = useState(false);
    const [flash, setFlash] = useState(false);
    const [sparkle, setSparkle] = useState(false);
    const [keyboardSwipeOutDirection, setKeyboardSwipeOutDirection] = useState<Direction | null>(null);
    const [cardTimerId] = useState(() => ({ current: null as NodeJS.Timeout | null }));
    const [entranceState, setEntranceState] = useState<'idle' | 'sentence' | 'dimming' | 'countdown'>('idle');
    const [entranceCountdown, setEntranceCountdown] = useState(GAME_CONFIG.CONTINUE_COUNTDOWN_SECONDS);
    const [activeChain, setActiveChain] = useState(chain);
    const [introMessage, setIntroMessage] = useState('');
    const [isScoreSubmitted, setIsScoreSubmitted] = useState(false);

    useEffect(() => {
        if (strikes >= 3 && gameState === 'playing') {
            setGameState('gameOver');
        }
    }, [strikes, gameState]);

    useEffect(() => {
        if (isConfirmed) {
            setIsScoreSubmitted(true);
        }
    }, [isConfirmed]);

    useEffect(() => {
        if (isResetStrikesSuccess) {
            setStrikes(0);
        }
    }, [isResetStrikesSuccess]);

    const [isSdkLoaded, setIsSdkLoaded] = useState(false);

    useEffect(() => {
        const loadSdk = async () => {
            if (sdk && !isSdkLoaded) {
                await sdk.actions.ready();
                setIsSdkLoaded(true);
            }
        };
        loadSdk();
    }, []);

    useEffect(() => {
        if (chain) {
            setActiveChain(chain);
        }
    }, [chain]);

    const currentCardTimeLimit = useMemo(() => {
        const progress = Math.min(score / GAME_CONFIG.SCORE_FOR_MAX_DIFFICULTY, 1);
        return GAME_CONFIG.CARD_INITIAL_TIME_MS - (progress * (GAME_CONFIG.CARD_INITIAL_TIME_MS - GAME_CONFIG.CARD_MIN_TIME_MS));
    }, [score]);

    const handleGenerateNewCard = useCallback(() => {
        if (cardTimerId.current) {
            clearTimeout(cardTimerId.current);
        }
        const isJokerCard = Math.random() < GAME_CONFIG.JOKER_PROBABILITY;
        setIsJoker(isJokerCard);
        setCurrentDirection(getRandomDirection());
        setCardKey(prev => prev + 1);
        setKeyboardSwipeOutDirection(null);
        setGameStartTime(performance.now());
        
        if (gameState === 'playing') {
            const timer = setTimeout(() => {
                handleIncorrectSwipe();
            }, currentCardTimeLimit);
            cardTimerId.current = timer;
        }
    }, [currentCardTimeLimit, gameState]);

    const handleCorrectSwipe = useCallback(() => {
        if (cardTimerId.current) clearTimeout(cardTimerId.current);
        setScore(prev => prev + 1);
        setSparkle(true);
        audioManager.current?.playCorrectSwipe();
        handleGenerateNewCard();
    }, [handleGenerateNewCard]);

    const handleIncorrectSwipe = useCallback(() => {
        if (cardTimerId.current) clearTimeout(cardTimerId.current);
        setStrikes(prev => prev - 1);
        setShake(true);
        if (gameState === 'playing') {
            setFlash(true);
            if (navigator.vibrate) {
                navigator.vibrate(HAPTICS.INCORRECT);
            }
            setTimeout(() => setFlash(false), ANIMATION.FLASH_DURATION);
        }
        audioManager.current?.playWrongSwipe();
        setTimeout(() => setShake(false), ANIMATION.SHAKE_DURATION);
        handleGenerateNewCard();
    }, [handleGenerateNewCard, gameState]);

    const startGame = () => {
        setGameState('howToPlay');
    };

    const handlePlayNow = () => {
        setScore(0);
        setStrikes(GAME_CONFIG.INITIAL_STRIKES);
        setIsScoreSubmitted(false);
        const randomIndex = Math.floor(Math.random() * INTRO_MESSAGES.length);
        setIntroMessage(INTRO_MESSAGES[randomIndex]);
        setEntranceState('sentence');
    };

    const handleCountdownComplete = () => {
        setGameState('playing');
        setGameStartTime(performance.now());
    };

    const handlePlayAgain = () => {
        setScore(0);
        setStrikes(GAME_CONFIG.INITIAL_STRIKES);
        setIsScoreSubmitted(false);
        startGame();
    };

    const handleViewLeaderboard = () => {
        setGameState('leaderboard');
    };

    const handleBackToMenu = () => {
        setGameState('menu');
    };

    const handleGm = () => {
        if (!address || !activeChain) return;
        const contractConfig = activeChain.id === monadTestnet.id ? contracts.monad.gmr : contracts.base.gmr;
        if (!contractConfig.address) {
            console.error(`No GMR contract address found for chain ID ${activeChain.id}`);
            return;
        }

        writeGmrContract({
            address: contractConfig.address,
            abi: contractConfig.abi,
            functionName: 'mint',
            args: [address, parseEther('1')],
            chain: activeChain,
            account: address,
        });
    };

    const handleResetStrikes = () => {
        if (!address || !activeChain) return;
        const contractConfig = activeChain.id === monadTestnet.id ? contracts.monad.resetStrikes : contracts.base.resetStrikes;
        if (!contractConfig.address) {
            console.error(`No ResetStrikes contract address found for chain ID ${activeChain.id}`);
            return;
        }

        let txValue = 0n;
        if (activeChain.id === base.id && ethPriceData) {
            try {
                const [, price, , ,] = ethPriceData as [bigint, bigint, bigint, bigint, bigint];
                if (!price || price <= 0n) {
                    console.error('Invalid ETH price data');
                    return;
                }
                const ethPriceInUsd = Number(price) / 1e8;
                const costInUsd = 0.05;
                const costInEth = costInUsd / ethPriceInUsd;
                
                if (!isFinite(costInEth) || costInEth <= 0) {
                    console.error('Invalid cost calculation');
                    return;
                }
                
                txValue = parseEther(costInEth.toString());
            } catch (error) {
                console.error('Failed to calculate transaction value:', error);
                return;
            }
        }

        writeResetStrikesContract({
            address: contractConfig.address,
            abi: contractConfig.abi,
            functionName: 'resetStrikes',
            args: [],
            value: txValue,
            chain: activeChain,
            account: address,
        });
    };

    const handleContinue = () => {
        setStrikes(GAME_CONFIG.INITIAL_STRIKES);
        setGameState('playing');
        handleGenerateNewCard();
    };

    const handleSubmitScore = useCallback(() => {
        if (!address || !activeChain) {
            return;
        }
        if (!Number.isInteger(score) || score < 0) {
            console.error('Invalid score value:', score);
            return;
        }
        const contractConfig = activeChain.id === monadTestnet.id ? contracts.monad.leaderboard : contracts.base.leaderboard;
        if (!contractConfig.address) {
            console.error(`No leaderboard contract address found for chain ID ${activeChain.id}`);
            return;
        }

        writeContract({
            address: contractConfig.address,
            abi: contractConfig.abi,
            functionName: 'updateScore',
            args: [address, BigInt(score)],
            chain: activeChain,
            account: address,
        });
    }, [address, activeChain, score, writeContract]);

    useEffect(() => {
        if (gameState === 'gameOver') {
            setFlash(false);
        }
    }, [gameState]);

    useEffect(() => {
        if (entranceState === 'sentence') {
            const timer = setTimeout(() => {
                setEntranceState('dimming');
            }, ANIMATION.ENTRANCE_SENTENCE_DURATION);
            return () => clearTimeout(timer);
        } else if (entranceState === 'dimming') {
            setEntranceCountdown(GAME_CONFIG.CONTINUE_COUNTDOWN_SECONDS);
            const countdownInterval = setInterval(() => {
                setEntranceCountdown(prev => {
                    if (prev - 1 <= 0) {
                        setEntranceState('idle');
                        setGameState('playing');
                        handleGenerateNewCard();
                        return 0;
                    }
                    return prev - 1;
                });
            }, ANIMATION.COUNTDOWN_INTERVAL);
            return () => clearInterval(countdownInterval);
        }
    }, [entranceState, handleGenerateNewCard]);

    useEffect(() => {
        return () => {
            if (cardTimerId.current) {
                clearTimeout(cardTimerId.current);
            }
        };
    }, [cardTimerId]);

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
                        {introMessage}
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
                return <HowToPlayScreen onStart={handlePlayNow} onCancel={handleBackToMenu} />;
            case 'playing':
                return (
                    <div className="relative flex flex-col items-center justify-center h-full w-full overflow-hidden bg-black/50 backdrop-blur-sm p-4 rounded-lg max-w-md mx-auto my-auto">
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
                    onPlayAgain={handlePlayAgain}
                    onViewLeaderboard={handleViewLeaderboard}
                    onSubmitScore={handleSubmitScore}
                    isSubmitting={isPending || isConfirming}
                    error={writeError}
                    onResetStrikes={handleResetStrikes}
                    onContinue={handleContinue}
                    isScoreSubmitted={isScoreSubmitted}
                    isResetStrikesSuccess={isResetStrikesSuccess}
                    isResetStrikesPending={isResetStrikesPending || isResetStrikesConfirming}
                />;
            case 'leaderboard':
                return <LeaderboardScreen onBack={handleBackToMenu} />;
            case 'menu':
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full px-4">
                        <h1 className="text-5xl sm:text-7xl font-bold text-white mb-12 title-shadow animate-fade-in">Liminal</h1>
                        {isConnected ? (
                            <div className="flex flex-col items-center w-full max-w-md">
                                <button
                                    className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg text-2xl shadow-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 mb-4"
                                    onClick={startGame}
                                >
                                    Start Game
                                </button>
                                <button
                                    className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg text-2xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 mb-4"
                                    onClick={handleViewLeaderboard}
                                >
                                    Leaderboard
                                </button>
                                <button
                                    className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-lg text-2xl shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-105 mb-4"
                                    onClick={handleGm}
                                >
                                    Say GM
                                </button>
                                <div className="mt-8 w-full">
                                    <ChainSelector activeChain={activeChain} switchChain={switchChain} />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center w-full max-w-md">
                                <button
                                    className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-lg text-2xl shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-105 mb-4"
                                    onClick={() => {
                                        const connector = connectors[0];
                                        if (connector) {
                                            connect({ connector });
                                        } else {
                                            console.warn("No wallet connector available.");
                                        }
                                    }}
                                >
                                    Connect Wallet
                                </button>
                                <button
                                    className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg text-2xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 mb-4"
                                    onClick={handleViewLeaderboard}
                                >
                                    View Leaderboard
                                </button>
                            </div>
                        )}
                    </div>
                );
        }
    };

    const chaos = useMemo(() => Math.min(score / 750, 1), [score]);

    return (
        <SwipeMask>
            <main className={`w-screen h-screen overflow-hidden ${shake ? 'animate-shake' : ''} pt-24`}>
                <LiminalBackground difficulty={1 + chaos * 14} />
                <TemporalBackground phase={chaos * 7} intensity={chaos * 100} />
                <OverlayNoise intensity={chaos * 100} />
                <AtmosphereManager score={score} />
                <SparkleController on={sparkle} onComplete={() => setSparkle(false)} />
                <AudioManager ref={audioManager} isMusicMuted={false} isSfxMuted={false} multiplier={chaos} onMilestone={() => {}} stage={chaos * 5} />

                {flash && <div className="absolute inset-0 z-50 animate-flash-neon pointer-events-none" />}

            <div className="absolute top-0 left-0 right-0 p-4 z-10">
                <div className="flex justify-between items-center text-white text-2xl font-bold bg-black/30 p-4 rounded-lg border-2 border-white/20 backdrop-blur-md w-full max-w-6xl mx-auto">
                    <div className="text-shadow-pop flex-1">
                        <span className="text-white/70 text-lg font-semibold block">SCORE</span>
                        <p data-testid="score" className="text-3xl">{score}</p>
                    </div>
                    <div className="flex-1 flex justify-center">
                        {gameState === 'playing' && (
                            <CountdownTimer
                                startTime={gameStartTime}
                                duration={currentCardTimeLimit}
                                onTimesUp={handleIncorrectSwipe}
                                gameState={gameState}
                            />
                        )}
                    </div>
                    <div className="text-shadow-pop text-right flex-1">
                        {isConnected && address ? (
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-white/50">{activeChain?.name || 'Unknown'}</span>
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                </div>
                                <span className="text-white/90 text-sm font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
                                <button
                                    className="text-white/50 hover:text-white transition-colors text-xs"
                                    onClick={() => disconnect()}
                                >
                                    Disconnect
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-end">
                                <span className="text-white/70 text-lg font-semibold block">STRIKES</span>
                                <p className="text-3xl">{strikes}/3</p>
                            </div>
                        )}
                    </div>
                </div>
                {gameState === 'playing' && (
                    <div className="flex justify-center mt-3">
                        <StrikesDisplay strikes={strikes} />
                    </div>
                )}
            </div>

            <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                    <div className="text-white text-2xl font-bold animate-pulse">Loading...</div>
                </div>
            }>
                {renderGameState()}
            </Suspense>
        </main>
        </SwipeMask>
    );
};

export default App;
