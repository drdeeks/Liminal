import React, { useState, useEffect, useRef } from 'react';

interface CountdownTimerProps {
    duration: number;
    onTimeout: () => void;
    score: number;
    isPaused: boolean;
}

const getTimerColor = (score: number) => {
    if (score > 1000) return 'text-red-500';
    if (score > 500) return 'text-orange-400';
    if (score > 250) return 'text-yellow-300';
    return 'text-white/60';
};

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ duration, onTimeout, score, isPaused }) => {
    const [timeLeft, setTimeLeft] = useState(duration);
    const timerRef = useRef<number | null>(null);
    const timeoutCalled = useRef(false);

    useEffect(() => {
        if (isPaused) {
            if (timerRef.current) clearTimeout(timerRef.current);
            return;
        }

        timeoutCalled.current = false;
        const startTime = Date.now();

        const tick = () => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, duration - elapsed);
            setTimeLeft(remaining);

            if (remaining === 0 && !timeoutCalled.current) {
                onTimeout();
                timeoutCalled.current = true;
            } else if (remaining > 0) {
                timerRef.current = window.setTimeout(tick, 16);
            }
        };

        timerRef.current = window.setTimeout(tick, 0);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [duration, onTimeout, isPaused]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const colorClass = getTimerColor(score);

    return (
        <div className={`absolute top-0 text-3xl font-bold tabular-nums text-shadow-pop transition-colors duration-1000 ${colorClass}`}>
            {(timeLeft / 1000).toFixed(2)}s
        </div>
    );
};