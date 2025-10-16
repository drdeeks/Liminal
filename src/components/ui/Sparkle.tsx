import React from 'react';

interface SparkleProps {
    style: React.CSSProperties;
}

export const Sparkle: React.FC<SparkleProps> = ({ style }) => {
    return <div className="sparkle" style={style} />;
};