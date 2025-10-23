import React, { FC, useEffect, useState } from 'react';
import Sparkle from './Sparkle';

interface SparkleControllerProps {
    on: boolean;
    onComplete: () => void;
}

const SPARKLE_COUNT = 8;
const SPARKLE_DURATION = 800;

const SparkleController: FC<SparkleControllerProps> = ({ on, onComplete }) => {
    const [sparkles, setSparkles] = useState<{ id: string; x: number; y: number; size: number }[]>([]);

    useEffect(() => {
        if (on) {
            const newSparkles = Array.from({ length: SPARKLE_COUNT }).map(() => ({
                id: `sparkle-${Math.random()}`,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 20 + 10,
            }));
            setSparkles(newSparkles);
            const timer = setTimeout(() => {
                setSparkles([]);
                onComplete();
            }, SPARKLE_DURATION);
            return () => clearTimeout(timer);
        }
    }, [on, onComplete]);

    return (
        <div className="absolute inset-0 pointer-events-none">
            {sparkles.map(({ id, x, y, size }) => (
                <Sparkle key={id} id={id} x={x} y={y} size={size} />
            ))}
        </div>
    );
};

export { SparkleController };
