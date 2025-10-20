import React from 'react';

interface InfoScreenProps {
  onClose: () => void;
}

export const InfoScreen: React.FC<InfoScreenProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white p-8 rounded-lg max-w-lg text-center">
        <h2 className="text-3xl font-bold mb-4">How to Play</h2>
        <p className="mb-4">
          Swipe in the direction of the arrow. If the card is a Joker, swipe in the opposite direction. You get three strikes. Good luck.
        </p>
        <button
          onClick={onClose}
          className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
