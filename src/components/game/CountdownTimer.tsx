import React, { useState, useEffect, useRef } from 'react';

interface CountdownTimerProps {
    startTime: number;
    duration: number;
    onTimesUp: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ startTime, duration, onTimesUp }) => {
    const [timeLeft, setTimeLeft] = useState(duration);
    const animationFrameId = useRef<number>();

    useEffect(() => {
        const tick = () => {
            const elapsed = performance.now() - startTime;
            const remaining = Math.max(0, duration - elapsed);
            setTimeLeft(remaining);

            if (remaining > 0) {
                animationFrameId.current = requestAnimationFrame(tick);
            } else {
                onTimesUp();
            }
        };

        animationFrameId.current = requestAnimationFrame(tick);

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [startTime, duration, onTimesUp]);

    return (
        <div className="text-2xl font-bold text-white tabular-nums">
            {(timeLeft / 1000).toFixed(2)}
        </div>
    );
};
