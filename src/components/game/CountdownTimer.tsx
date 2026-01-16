import React, { useState, useEffect, useRef } from 'react';
import { GameState } from '../../lib/types';

interface CountdownTimerProps {
    startTime: number | null;
    duration: number;
    onTimesUp: () => void;
    gameState: GameState;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ startTime, duration, onTimesUp, gameState }) => {
    const [timeLeft, setTimeLeft] = useState(duration);
    const animationFrameId = useRef<number>();
    const hasCalledTimesUp = useRef(false);

    useEffect(() => {
        if (gameState !== 'playing' || startTime === null) {
            setTimeLeft(duration);
            hasCalledTimesUp.current = false;
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            return;
        }

        hasCalledTimesUp.current = false;

        const tick = () => {
            const elapsed = performance.now() - startTime;
            const remaining = Math.max(0, duration - elapsed);
            setTimeLeft(remaining);

            if (remaining <= 0 && !hasCalledTimesUp.current) {
                hasCalledTimesUp.current = true;
                onTimesUp();
            } else if (remaining > 0) {
                animationFrameId.current = requestAnimationFrame(tick);
            }
        };

        animationFrameId.current = requestAnimationFrame(tick);

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [startTime, duration, onTimesUp, gameState]);

    const seconds = (timeLeft / 1000).toFixed(2);
    const progress = duration > 0 ? (timeLeft / duration) * 100 : 0;
    const colorClass = progress > 50 ? 'text-green-400' : progress > 25 ? 'text-yellow-400' : 'text-red-500';

    return (
        <div className="flex flex-col items-center">
            <div className={`text-3xl font-bold tabular-nums ${colorClass} transition-colors duration-200`}>
                {gameState !== 'playing' ? '0.00' : `${seconds}s`}
            </div>
            <div className="w-32 h-1 bg-white/20 rounded-full mt-1 overflow-hidden">
                <div 
                    className={`h-full ${progress > 50 ? 'bg-green-400' : progress > 25 ? 'bg-yellow-400' : 'bg-red-500'} transition-all duration-100`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};
