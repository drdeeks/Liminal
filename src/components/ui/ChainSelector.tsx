import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base } from 'wagmi/chains';
import { monadTestnet } from '../../lib/contracts';

interface ChainSelectorProps {
    activeChain: typeof base | typeof monadTestnet | undefined;
    switchChain: (params: { chainId: number }) => void;
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({ activeChain, switchChain }) => {
    const [isOpen, setIsOpen] = useState(false);

    const chains = [
        { id: base.id, name: 'Base' },
        { id: monadTestnet.id, name: 'Monad' },
    ];

    const selectedChain = chains.find(c => c.id === activeChain?.id);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-48 bg-black/20 border-2 border-white/20 backdrop-blur-sm rounded-lg p-2 flex items-center justify-between text-white"
            >
                <span>{selectedChain ? selectedChain.name : 'Select Chain'}</span>
                <svg className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-2 w-48 bg-black/20 border-2 border-white/20 backdrop-blur-sm rounded-lg overflow-hidden"
                    >
                        <ul>
                            {chains.map(chain => (
                                <li key={chain.id}>
                                    <button
                                        onClick={() => {
                                            switchChain({ chainId: chain.id });
                                            setIsOpen(false);
                                        }}
                                        className="w-full p-2 text-left text-white hover:bg-white/10"
                                    >
                                        {chain.name}
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