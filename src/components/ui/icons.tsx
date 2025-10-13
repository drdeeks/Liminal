import React from 'react';

const iconProps = {
  className: "w-24 h-24 sm:w-32 sm:h-32",
  strokeWidth: "2.5",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "white",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export const ArrowUpIcon: React.FC = React.memo(() => (
  <svg {...iconProps}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
));

export const ArrowDownIcon: React.FC = React.memo(() => (
  <svg {...iconProps}>
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </svg>
));

export const ArrowLeftIcon: React.FC = React.memo(() => (
  <svg {...iconProps}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
));

export const ArrowRightIcon: React.FC = React.memo(() => (
  <svg {...iconProps}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
));

export const InfoIcon: React.FC = React.memo(() => (
    <svg 
        className="w-7 h-7"
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
));