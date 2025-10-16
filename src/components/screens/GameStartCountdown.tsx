import React, { useState, useEffect } from 'react';

interface GameStartCountdownProps {
    onFinish: () => void;
}

export const GameStartCountdown: React.FC<GameStartCountdownProps> = ({ onFinish }) => {
    const [count, setCount] = useState(3);

    useEffect(() => {
        if (count > 0) {
            const timer = setTimeout(() => setCount(count - 1), 1000);
            return () => clearTimeout(timer);
        } else if (count === 0) {
            const timer = setTimeout(() => {
                onFinish();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [count, onFinish]);

    const renderContent = () => {
        if (count > 0) {
            return <div className="text-9xl font-black text-white text-shadow-pop animate-ping">{count}</div>;
        }
        return <div className="text-9xl font-black text-white text-shadow-pop animate-pulse">START!</div>;
    };

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent z-50">
            {renderContent()}
        </div>
    );
};