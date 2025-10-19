import React from 'react';

interface InfoScreenProps {
    onClose: () => void;
}

export const InfoScreen: React.FC<InfoScreenProps> = ({ onClose }) => {
    return (
        <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-black/20 text-white p-8 rounded-2xl shadow-2xl max-w-lg w-[90%] space-y-6 animate-fade-in-scale relative border-2 border-white/20 backdrop-blur-sm"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-3xl font-black text-center mb-2 text-shadow-pop">How to Play</h2>
                
                <div className="space-y-6 text-lg text-shadow-pop">
                    <p><strong>Goal:</strong> Swipe the cards in the correct direction. You get <strong>3 strikes</strong> before the game is over!</p>
                    
                    <div>
                        <h3 className="font-bold text-xl text-shadow-pop">🃏 The Joker Card</h3>
                        <p>When you see a <span className="text-rose-400 font-semibold">RED</span> card, it's a Joker! You must swipe in the <strong>OPPOSITE</strong> direction of the arrow.</p>
                    </div>

                    <div>
                        <h3 className="font-bold text-xl text-shadow-pop">⌨️ Controls</h3>
                        <p>Use your <strong>mouse/finger</strong> to swipe, or use the <strong>arrow keys</strong> on your keyboard.</p>
                    </div>

                    <p>The deeper you go, the less time you'll have. Stay focused.</p>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-3 right-4 text-4xl text-white/70 hover:text-white transition-colors text-shadow-pop"
                    aria-label="Close"
                >
                    &times;
                </button>
            </div>
        </div>
    );
};