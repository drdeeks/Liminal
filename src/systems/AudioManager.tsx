<<<<<<< HEAD
import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import { AtmosphereStage } from '../types';

interface AudioManagerProps {
    stage: AtmosphereStage;
    multiplier: number;
    isMusicMuted: boolean;
    isSfxMuted: boolean;
    onMilestone: () => void;
}

export interface AudioManagerHandle {
    playCorrectSwipe: () => void;
    playWrongSwipe: () => void;
    playTimeout: () => void;
    unlockAudio: () => void;
}

const crossfadeDuration = 2; // seconds

export const AudioManager = forwardRef<AudioManagerHandle, AudioManagerProps>(
    ({ stage, multiplier, isMusicMuted, isSfxMuted, onMilestone }, ref) => {
        const correctSwipeAudio = useRef<HTMLAudioElement>(null);
        const wrongSwipeAudio = useRef<HTMLAudioElement>(null);
        const timeoutAudio = useRef<HTMLAudioElement>(null);
        const milestoneAudio = useRef<HTMLAudioElement>(null);

        const ambientLayers = {
            [AtmosphereStage.EARLY]: useRef<HTMLAudioElement>(null),
            [AtmosphereStage.THRESHOLD_1]: useRef<HTMLAudioElement>(null),
            [AtmosphereStage.THRESHOLD_2]: useRef<HTMLAudioElement>(null),
            [AtmosphereStage.THRESHOLD_3]: useRef<HTMLAudioElement>(null),
            [AtmosphereStage.DEEP_LIMINAL]: useRef<HTMLAudioElement>(null),
        };
        const tensionAudio = useRef<HTMLAudioElement>(null);
        const [lastPlayedStage, setLastPlayedStage] = useState<AtmosphereStage | null>(null);
        const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
        const [audioLoadErrors, setAudioLoadErrors] = useState<Set<string>>(new Set());

        const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
            const src = e.currentTarget.src;
            if (src && !audioLoadErrors.has(src)) {
                console.warn(`Audio file not found or failed to load: ${src}`);
                setAudioLoadErrors(prev => new Set(prev).add(src));
            }
        };

        useImperativeHandle(ref, () => ({
            unlockAudio: () => {
                if (isAudioUnlocked) return;
                
                const allAudio = [
                    correctSwipeAudio.current,
                    wrongSwipeAudio.current,
                    timeoutAudio.current,
                    milestoneAudio.current,
                    tensionAudio.current,
                    ...Object.values(ambientLayers).map(r => r.current)
                ];

                allAudio.forEach(audioEl => {
                    if (audioEl && !audioLoadErrors.has(audioEl.src)) {
                        audioEl.volume = 0;
                        const promise = audioEl.play();
                        if (promise !== undefined) {
                            promise.then(() => {
                                audioEl.pause();
                                audioEl.currentTime = 0;
                            }).catch(error => {
                                // Expected if user hasn't interacted yet, handled gracefully.
                            });
                        }
                    }
                });
                setIsAudioUnlocked(true);
            },
            playCorrectSwipe: () => {
                if (correctSwipeAudio.current && !isSfxMuted && isAudioUnlocked && !audioLoadErrors.has(correctSwipeAudio.current.src)) {
                    correctSwipeAudio.current.currentTime = 0;
                    correctSwipeAudio.current.playbackRate = 1 + Math.random() * 0.1 - 0.05;
                    correctSwipeAudio.current.play().catch(e => {});
                }
            },
            playWrongSwipe: () => {
                if (wrongSwipeAudio.current && !isSfxMuted && isAudioUnlocked && !audioLoadErrors.has(wrongSwipeAudio.current.src)) {
                    wrongSwipeAudio.current.currentTime = 0;
                    wrongSwipeAudio.current.play().catch(e => {});
                }
            },
            playTimeout: () => {
                if (timeoutAudio.current && !isSfxMuted && isAudioUnlocked && !audioLoadErrors.has(timeoutAudio.current.src)) {
                    timeoutAudio.current.currentTime = 0;
                    timeoutAudio.current.play().catch(e => {});
                }
            },
        }));

        const fade = (audioEl: HTMLAudioElement | null, targetVolume: number, duration: number) => {
             if (!audioEl || audioLoadErrors.has(audioEl.src)) return;
             const startVolume = audioEl.volume;
             const startTime = performance.now();

             const animateFade = (time: number) => {
                const elapsed = (time - startTime) / 1000;
                const progress = Math.min(elapsed / duration, 1);
                const newVolume = startVolume + (targetVolume - startVolume) * progress;
                audioEl.volume = Math.max(0, Math.min(1, newVolume));
                if (progress < 1) {
                    requestAnimationFrame(animateFade);
                } else if (targetVolume === 0) {
                     audioEl.pause();
                }
             };

             if (targetVolume > 0 && audioEl.paused && isAudioUnlocked) {
                audioEl.volume = 0;
                audioEl.play().catch(e => {});
             }
             requestAnimationFrame(animateFade);
        };

        useEffect(() => {
            if (isAudioUnlocked && stage !== lastPlayedStage) {
                 if (lastPlayedStage !== null) {
                    onMilestone();
                    if (milestoneAudio.current && !isSfxMuted && !audioLoadErrors.has(milestoneAudio.current.src)) {
                        milestoneAudio.current.play().catch(e => {});
                    }
                 }
                 setLastPlayedStage(stage);
            }
        }, [stage, isAudioUnlocked, isSfxMuted, onMilestone, lastPlayedStage]);

        useEffect(() => {
            Object.entries(ambientLayers).forEach(([stageKey, audioRef]) => {
                const stageNum = Number(stageKey) as AtmosphereStage;
                const targetVolume = (!isMusicMuted && stageNum === stage) ? 0.3 : 0;
                fade(audioRef.current, targetVolume, crossfadeDuration);
            });
        }, [stage, isMusicMuted, isAudioUnlocked, audioLoadErrors]);

        useEffect(() => {
             const tensionEl = tensionAudio.current;
             if (tensionEl) {
                if (!isMusicMuted && multiplier > 1 && isAudioUnlocked) {
                    const targetVolume = Math.min(0.25, (multiplier - 1) * 0.05);
                    fade(tensionEl, targetVolume, 1);
                } else {
                    fade(tensionEl, 0, 1);
                }
             }
        }, [multiplier, isMusicMuted, isAudioUnlocked, audioLoadErrors]);

        return (
            <>
                <audio ref={correctSwipeAudio} src="/audio/correct.mp3" preload="auto" onError={handleAudioError} />
                <audio ref={wrongSwipeAudio} src="/audio/wrong.mp3" preload="auto" onError={handleAudioError} />
                <audio ref={timeoutAudio} src="/audio/timeout.mp3" preload="auto" onError={handleAudioError} />
                <audio ref={milestoneAudio} src="/audio/milestone.mp3" preload="auto" onError={handleAudioError} />
                <audio ref={ambientLayers[AtmosphereStage.EARLY]} src="/audio/ambient_1_early.mp3" loop preload="auto" onError={handleAudioError} />
                <audio ref={ambientLayers[AtmosphereStage.THRESHOLD_1]} src="/audio/ambient_2_mid.mp3" loop preload="auto" onError={handleAudioError} />
                <audio ref={ambientLayers[AtmosphereStage.THRESHOLD_2]} src="/audio/ambient_2_mid.mp3" loop preload="auto" onError={handleAudioError} />
                <audio ref={ambientLayers[AtmosphereStage.THRESHOLD_3]} src="/audio/ambient_3_deep.mp3" loop preload="auto" onError={handleAudioError} />
                <audio ref={ambientLayers[AtmosphereStage.DEEP_LIMINAL]} src="/audio/ambient_4_critical.mp3" loop preload="auto" onError={handleAudioError} />
                <audio ref={tensionAudio} src="/audio/tension_whitenoise.mp3" loop preload="auto" onError={handleAudioError} />
            </>
        );
    }
=======
import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import { AtmosphereStage } from '../lib/types';

interface AudioManagerProps {
    stage: AtmosphereStage;
    multiplier: number;
    isMusicMuted: boolean;
    isSfxMuted: boolean;
    onMilestone: () => void;
}

export interface AudioManagerHandle {
    playCorrectSwipe: () => void;
    playWrongSwipe: () => void;
    unlockAudio: () => void;
}

const crossfadeDuration = 2; // seconds

export const AudioManager = forwardRef<AudioManagerHandle, AudioManagerProps>(
    ({ stage, multiplier, isMusicMuted, isSfxMuted, onMilestone }, ref) => {
        const correctSwipeAudio = useRef<HTMLAudioElement>(null);
        const wrongSwipeAudio = useRef<HTMLAudioElement>(null);
        const milestoneAudio = useRef<HTMLAudioElement>(null);

        const ambientLayers = {
            [AtmosphereStage.EARLY]: useRef<HTMLAudioElement>(null),
            [AtmosphereStage.THRESHOLD_1]: useRef<HTMLAudioElement>(null),
            [AtmosphereStage.THRESHOLD_2]: useRef<HTMLAudioElement>(null),
            [AtmosphereStage.THRESHOLD_3]: useRef<HTMLAudioElement>(null),
            [AtmosphereStage.DEEP_LIMINAL]: useRef<HTMLAudioElement>(null),
        };
        const tensionAudio = useRef<HTMLAudioElement>(null);
        const [lastPlayedStage, setLastPlayedStage] = useState<AtmosphereStage | null>(null);
        const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
        const [audioLoadErrors, setAudioLoadErrors] = useState<Set<string>>(new Set());

        const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
            const src = e.currentTarget.src;
            if (src && !audioLoadErrors.has(src)) {
                console.warn(`Audio file not found or failed to load: ${src}`);
                setAudioLoadErrors(prev => new Set(prev).add(src));
            }
        };

        useImperativeHandle(ref, () => ({
            unlockAudio: () => {
                if (isAudioUnlocked) return;
                
                const allAudio = [
                    correctSwipeAudio.current,
                    wrongSwipeAudio.current,
                    milestoneAudio.current,
                    tensionAudio.current,
                    ...Object.values(ambientLayers).map(r => r.current)
                ];

                allAudio.forEach(audioEl => {
                    if (audioEl && !audioLoadErrors.has(audioEl.src)) {
                        audioEl.volume = 0;
                        const promise = audioEl.play();
                        if (promise !== undefined) {
                            promise.then(() => {
                                audioEl.pause();
                                audioEl.currentTime = 0;
                            }).catch(error => {
                                // Expected if user hasn't interacted yet, handled gracefully.
                            });
                        }
                    }
                });
                setIsAudioUnlocked(true);
            },
            playCorrectSwipe: () => {
                if (correctSwipeAudio.current && !isSfxMuted && isAudioUnlocked && !audioLoadErrors.has(correctSwipeAudio.current.src)) {
                    correctSwipeAudio.current.currentTime = 0;
                    correctSwipeAudio.current.playbackRate = 1 + Math.random() * 0.1 - 0.05;
                    correctSwipeAudio.current.play().catch(e => {});
                }
            },
            playWrongSwipe: () => {
                if (wrongSwipeAudio.current && !isSfxMuted && isAudioUnlocked && !audioLoadErrors.has(wrongSwipeAudio.current.src)) {
                    wrongSwipeAudio.current.currentTime = 0;
                    wrongSwipeAudio.current.play().catch(e => {});
                }
            },
        }));

        const fade = (audioEl: HTMLAudioElement | null, targetVolume: number, duration: number) => {
             if (!audioEl || audioLoadErrors.has(audioEl.src)) return;
             const startVolume = audioEl.volume;
             const startTime = performance.now();

             const animateFade = (time: number) => {
                const elapsed = (time - startTime) / 1000;
                const progress = Math.min(elapsed / duration, 1);
                const newVolume = startVolume + (targetVolume - startVolume) * progress;
                audioEl.volume = Math.max(0, Math.min(1, newVolume));
                if (progress < 1) {
                    requestAnimationFrame(animateFade);
                } else if (targetVolume === 0) {
                     audioEl.pause();
                }
             };

             if (targetVolume > 0 && audioEl.paused && isAudioUnlocked) {
                audioEl.volume = 0;
                audioEl.play().catch(e => {});
             }
             requestAnimationFrame(animateFade);
        };

        useEffect(() => {
            if (isAudioUnlocked && stage !== lastPlayedStage) {
                 if (lastPlayedStage !== null) {
                    onMilestone();
                    if (milestoneAudio.current && !isSfxMuted && !audioLoadErrors.has(milestoneAudio.current.src)) {
                        milestoneAudio.current.play().catch(e => {});
                    }
                 }
                 setLastPlayedStage(stage);
            }
        }, [stage, isAudioUnlocked, isSfxMuted, onMilestone, lastPlayedStage]);

        useEffect(() => {
            Object.entries(ambientLayers).forEach(([stageKey, audioRef]) => {
                const stageNum = Number(stageKey) as AtmosphereStage;
                const targetVolume = (!isMusicMuted && stageNum === stage) ? 0.3 : 0;
                fade(audioRef.current, targetVolume, crossfadeDuration);
            });
        }, [stage, isMusicMuted, isAudioUnlocked, audioLoadErrors]);

        useEffect(() => {
             const tensionEl = tensionAudio.current;
             if (tensionEl) {
                if (!isMusicMuted && multiplier > 1 && isAudioUnlocked) {
                    const targetVolume = Math.min(0.25, (multiplier - 1) * 0.05);
                    fade(tensionEl, targetVolume, 1);
                } else {
                    fade(tensionEl, 0, 1);
                }
             }
        }, [multiplier, isMusicMuted, isAudioUnlocked, audioLoadErrors]);

        return (
            <>
                <audio ref={correctSwipeAudio} src="/audio/correct.mp3" preload="auto" onError={handleAudioError} />
                <audio ref={wrongSwipeAudio} src="/audio/wrong.mp3" preload="auto" onError={handleAudioError} />
                <audio ref={milestoneAudio} src="/audio/milestone.mp3" preload="auto" onError={handleAudioError} />
                <audio ref={ambientLayers[AtmosphereStage.EARLY]} src="/audio/ambient_1_early.mp3" loop preload="auto" onError={handleAudioError} />
                <audio ref={ambientLayers[AtmosphereStage.THRESHOLD_1]} src="/audio/ambient_2_mid.mp3" loop preload="auto" onError={handleAudioError} />
                <audio ref={ambientLayers[AtmosphereStage.THRESHOLD_2]} src="/audio/ambient_2_mid.mp3" loop preload="auto" onError={handleAudioError} />
                <audio ref={ambientLayers[AtmosphereStage.THRESHOLD_3]} src="/audio/ambient_3_deep.mp3" loop preload="auto" onError={handleAudioError} />
                <audio ref={ambientLayers[AtmosphereStage.DEEP_LIMINAL]} src="/audio/ambient_4_critical.mp3" loop preload="auto" onError={handleAudioError} />
                <audio ref={tensionAudio} src="/audio/tension_whitenoise.mp3" loop preload="auto" onError={handleAudioError} />
            </>
        );
    }
>>>>>>> origin/feat/game-updates-and-refactor
);