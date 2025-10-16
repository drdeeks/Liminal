import React, { useState, useEffect } from 'react';
import { Sparkle } from './Sparkle';

interface SparkleControllerProps {
    trigger: any;
}

interface SparkleData {
    id: number;
    style: React.CSSProperties;
}

const SPARKLE_COUNT = 10;

export const SparkleController: React.FC<SparkleControllerProps> = ({ trigger }) => {
    const [sparkles, setSparkles] = useState<SparkleData[]>([]);

    useEffect(() => {
        if (trigger) {
            const newSparkles: SparkleData[] = [];
            for (let i = 0; i < SPARKLE_COUNT; i++) {
                newSparkles.push({
                    id: Date.now() + i,
                    style: {
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        transform: `scale(${Math.random()})`,
                        animationDuration: `${Math.random() * 0.5 + 0.5}s`,
                    },
                });
            }
            setSparkles(prev => [...prev, ...newSparkles]);
            setTimeout(() => {
                setSparkles(prev => prev.slice(SPARKLE_COUNT));
            }, 1000);
        }
    }, [trigger]);

    return (
        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
            {sparkles.map(sparkle => (
                <Sparkle key={sparkle.id} style={sparkle.style} />
            ))}
        </div>
    );
};