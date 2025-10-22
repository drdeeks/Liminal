import React, { FC, useEffect, useState } from 'react';

interface AtmosphereManagerProps {
    score: number;
}

const AtmosphereManager: FC<AtmosphereManagerProps> = ({ score }) => {
    const [gradientStyle, setGradientStyle] = useState({});

    useEffect(() => {
        const getGradient = () => {
            let colorStops = 'from-gray-800 to-gray-900';
            if (score > 1000) {
                colorStops = 'from-red-500/30 via-purple-500/20 to-gray-900';
            } else if (score > 500) {
                colorStops = 'from-orange-500/30 via-yellow-500/20 to-gray-900';
            } else if (score > 250) {
                colorStops = 'from-blue-500/30 via-teal-500/20 to-gray-900';
            }
            return `bg-gradient-to-br ${colorStops}`;
        };
        setGradientStyle(getGradient());
    }, [score]);

    return (
        <div className={`absolute inset-0 -z-10 transition-all duration-[3000ms] ease-in-out ${gradientStyle}`} />
    );
};

export { AtmosphereManager };
