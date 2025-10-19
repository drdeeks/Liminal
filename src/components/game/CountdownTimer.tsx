import React, { useState, useEffect, useRef } from 'react';

interface CountdownTimerProps {
    duration: number;
    key: number;
    score: number;
}

const getTimerColor = (score: number) => {
    if (score > 1000) return 'text-red-500';
    if (score > 500) return 'text-orange-400';
    if (score > 250) return 'text-yellow-300';
    return 'text-white/60';
};

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ duration, key, score }) => {
    const [timeLeft, setTimeLeft] = useState(duration);
    const frameId = useRef<number | null>(null);
    const startTime = useRef<number | null>(null);

    useEffect(() => {
        startTime.current = performance.now();

        const animate = (now: number) => {
            if (!startTime.current) return;
            const elapsed = now - startTime.current;
            const newTimeLeft = Math.max(0, duration - elapsed);
            setTimeLeft(newTimeLeft);

            if (newTimeLeft > 0) {
                frameId.current = requestAnimationFrame(animate);
            }
        };

        frameId.current = requestAnimationFrame(animate);

        return () => {
            if (frameId.current) {
                cancelAnimationFrame(frameId.current);
            }
        };
    }, [duration, key]);

    const colorClass = getTimerColor(score);

    return (
        <div className={`absolute top-0 text-3xl font-bold tabular-nums text-shadow-pop transition-colors duration-1000 ${colorClass}`}>
            {(timeLeft / 1000).toFixed(2)}s
        </div>
    );
};