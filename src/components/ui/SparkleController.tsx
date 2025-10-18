import React, { useState, useEffect } from 'react';
import { Sparkle } from './Sparkle';

interface SparkleControllerProps {
    trigger: any;
}

interface SparkleData {
    id: number;
    style: React.CSSProperties;
}

const SPARKLE_COUNT = 50;

export const SparkleController: React.FC<SparkleControllerProps> = ({ trigger }) => {
    const [sparkles, setSparkles] = useState<SparkleData[]>([]);

    useEffect(() => {
        if (trigger) {
            const newSparkles: SparkleData[] = [];
            for (let i = 0; i < SPARKLE_COUNT; i++) {
                const angle = Math.random() * 2 * Math.PI;
                const radius = Math.random() * 250 + 50;
                newSparkles.push({
                    id: Date.now() + i,
                    style: {
                        top: `calc(50% + ${Math.sin(angle) * radius}px)`,
                        left: `calc(50% + ${Math.cos(angle) * radius}px)`,
                        transform: `scale(${Math.random() * 0.7 + 0.5})`,
                        animationDuration: `${Math.random() * 0.6 + 0.4}s`,
                        animationDelay: `${Math.random() * 0.2}s`,
                    },
                });
            }
            setSparkles(prev => [...prev, ...newSparkles]);
            setTimeout(() => {
                setSparkles(prev => prev.slice(SPARKLE_COUNT));
            }, 1200);
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