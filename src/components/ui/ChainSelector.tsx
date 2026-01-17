import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { baseSepolia } from 'wagmi/chains';
import { monadTestnet } from '../../lib/contracts';

interface ChainSelectorProps {
    activeChain: typeof baseSepolia | typeof monadTestnet | undefined;
    switchChain: (params: { chainId: number }) => void;
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({ activeChain, switchChain }) => {
    const [isOpen, setIsOpen] = useState(false);

    const chains = [
        { id: baseSepolia.id, name: 'Base Sepolia', color: 'from-blue-500 to-blue-600' },
        { id: monadTestnet.id, name: 'Monad Testnet', color: 'from-purple-500 to-purple-600' },
    ];

    const selectedChain = chains.find(c => c.id === activeChain?.id);

    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.chain-selector')) setIsOpen(false);
        };
        
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('click', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative w-full chain-selector">
            <div className="text-center mb-2">
                <span className="text-white/70 text-sm font-semibold">NETWORK</span>
            </div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-gradient-to-r ${selectedChain?.color || 'from-gray-600 to-gray-700'} border-2 border-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between text-white font-bold shadow-lg hover:scale-105 transition-all`}
            >
                <span>{selectedChain ? selectedChain.name : 'Select Network'}</span>
                <svg className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-2 w-full bg-black/90 border-2 border-white/20 backdrop-blur-md rounded-lg overflow-hidden z-50 shadow-2xl"
                    >
                        <ul>
                            {chains.map(chain => (
                                <li key={chain.id}>
                                    <button
                                        onClick={() => {
                                            switchChain({ chainId: chain.id });
                                            setIsOpen(false);
                                        }}
                                        className={`w-full p-3 text-left text-white hover:bg-white/10 transition-colors font-semibold ${activeChain?.id === chain.id ? 'bg-white/20' : ''}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{chain.name}</span>
                                            {activeChain?.id === chain.id && <span className="text-green-400">✓</span>}
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};