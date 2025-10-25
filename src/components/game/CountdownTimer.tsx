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

    useEffect(() => {
        if (gameState !== 'playing' || startTime === null) {
            setTimeLeft(0);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            return;
        }

        const tick = () => {
            const elapsed = performance.now() - startTime;
            const remaining = Math.max(0, duration - elapsed);
            setTimeLeft(remaining);

            if (remaining > 0) {
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

    const seconds = Math.floor(timeLeft / 1000);
    const milliseconds = Math.floor((timeLeft % 1000) / 10);
    const formattedMilliseconds = milliseconds < 10 ? `0${milliseconds}` : milliseconds;

    return (
        <div className="text-2xl font-bold text-white tabular-nums">
            {gameState !== 'playing' ? '0.00' : `${seconds}:${formattedMilliseconds}`}
        </div>
    );
};
