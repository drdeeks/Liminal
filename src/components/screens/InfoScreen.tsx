import React from 'react';

interface InfoScreenProps {
    onBack: () => void;
}

export const InfoScreen: React.FC<InfoScreenProps> = ({ onBack }) => {
    return (
        <div className="flex flex-col items-center justify-center text-white text-center animate-fade-in w-full max-w-4xl mx-auto">
            <h1 className="text-6xl font-black mb-8 text-glitter">Info</h1>
            <div className="w-full bg-black/20 border-2 border-white/20 backdrop-blur-sm rounded-lg p-6">
                <p className="text-xl">This is the info screen. Content will be added later.</p>
            </div>
            <button
                onClick={onBack}
                className="mt-8 bg-black/20 text-white font-bold py-3 px-8 rounded-lg text-2xl shadow-lg hover:bg-black/40 transform hover:scale-105 transition-transform border-2 border-white/20 backdrop-blur-sm text-shadow-pop"
            >
                Back
            </button>
        </div>
    );
};