import React, { FC } from 'react';

const Sparkle: FC<{ id: string; x: number; y: number; size: number }> = ({ id, x, y, size }) => {
  return (
    <svg
      id={id}
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: 'absolute',
        top: y,
        left: x,
        pointerEvents: 'none',
        transform: 'translate(-50%, -50%)',
      }}
    >
        <path d="M80 0L96.5685 63.4315L160 80L96.5685 96.5685L80 160L63.4315 96.5685L0 80L63.4315 63.4315L80 0Z" fill="url(#sparkle-gradient)"/>
        <defs>
            <radialGradient id="sparkle-gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(80 80) rotate(90) scale(80)">
                <stop stopColor="white"/>
                <stop offset="1" stopColor="white" stopOpacity="0"/>
            </radialGradient>
        </defs>
    </svg>
  );
};

export default Sparkle;
