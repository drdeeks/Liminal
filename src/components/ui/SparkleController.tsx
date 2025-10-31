import React, { FC, useEffect, useState, useMemo } from 'react';
import Sparkle from './Sparkle';

interface SparkleControllerProps {
    on: boolean;
    onComplete: () => void;
}

const SPARKLE_COUNT = 12; // Increased for a richer effect
const SPARKLE_DURATION = 1200; // Increased for a longer, more graceful animation

const SparkleController: FC<SparkleControllerProps> = ({ on, onComplete }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const sparkles = useMemo(() => {
        return Array.from({ length: SPARKLE_COUNT }).map((_, i) => ({
            id: `sparkle-${i}`,
            x: Math.random() * 100, // Use percentages for responsive positioning
            y: Math.random() * 100,
            size: Math.random() * 25 + 10,
            delay: Math.random() * SPARKLE_DURATION, // Stagger the animations
        }));
    }, []);

    useEffect(() => {
        if (on) {
            setIsPlaying(true);
            const timer = setTimeout(() => {
                setIsPlaying(false);
                onComplete();
            }, SPARKLE_DURATION);
            return () => clearTimeout(timer);
        }
    }, [on, onComplete]);

    return (
        <div className={`absolute inset-0 pointer-events-none overflow-hidden ${isPlaying ? 'animate-sparkle-fade-in' : 'opacity-0'}`}>
            {sparkles.map(({ id, x, y, size, delay }) => (
                <div
                    key={id}
                    className="absolute animate-sparkle-move"
                    style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        animationDelay: `${delay}ms`,
                    }}
                >
                    <Sparkle id={id} x={0} y={0} size={size} />
                </div>
            ))}
        </div>
    );
};

export { SparkleController };