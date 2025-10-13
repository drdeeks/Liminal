import React, { useState, useEffect, useRef } from 'react';
import { AtmosphereStage } from '../types';

interface AtmosphereManagerProps {
    stage: AtmosphereStage;
}

interface Particle {
    id: number;
    style: React.CSSProperties;
}

const STAGE_STYLES = {
    [AtmosphereStage.EARLY]: {
        gradient: 'from-blue-600 to-blue-800',
        noiseOpacity: 0,
        patternOpacity: 0,
        vignetteOpacity: 0,
        particleInterval: null,
    },
    [AtmosphereStage.THRESHOLD_1]: {
        gradient: 'from-blue-700 to-purple-900',
        noiseOpacity: 0.05,
        patternOpacity: 0,
        vignetteOpacity: 0.1,
        particleInterval: null,
    },
    [AtmosphereStage.THRESHOLD_2]: {
        gradient: 'from-slate-700 to-purple-900',
        noiseOpacity: 0.07,
        patternOpacity: 0.03,
        vignetteOpacity: 0.2,
        particleInterval: null,
    },
    [AtmosphereStage.THRESHOLD_3]: {
        gradient: 'from-slate-800 via-amber-900/40 to-slate-900',
        noiseOpacity: 0.1,
        patternOpacity: 0.06,
        vignetteOpacity: 0.3,
        particleInterval: 1500, // ms between new particles
    },
    [AtmosphereStage.DEEP_LIMINAL]: {
        gradient: 'from-neutral-900 to-black',
        noiseOpacity: 0.12,
        patternOpacity: 0.08,
        vignetteOpacity: 0.4,
        particleInterval: 800,
    },
};

export const AtmosphereManager: React.FC<AtmosphereManagerProps> = ({ stage }) => {
    const styles = STAGE_STYLES[stage];
    const [particles, setParticles] = useState<Particle[]>([]);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (styles.particleInterval !== null) {
            intervalRef.current = window.setInterval(() => {
                const newParticleId = Date.now() + Math.random();
                const newParticle: Particle = {
                    id: newParticleId,
                    style: {
                        width: `${Math.random() * 2 + 1}px`,
                        height: `${Math.random() * 2 + 1}px`,
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animation: `fade-in-out ${Math.random() * 3 + 2}s forwards`,
                        backgroundColor: stage >= AtmosphereStage.DEEP_LIMINAL ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)',
                    }
                };
                setParticles(prev => [...prev, newParticle]);

                // Clean up the particle after its animation is done
                setTimeout(() => {
                    setParticles(prev => prev.filter(p => p.id !== newParticleId));
                }, (Math.random() * 3 + 2) * 1000);

            }, styles.particleInterval);
        } else {
             // Clear particles when stage drops below threshold
             setParticles([]);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [stage, styles.particleInterval]);


    return (
        <div className="absolute inset-0 -z-10 overflow-hidden">
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} transition-colors duration-[3000ms] ease-in-out`} />

            {/* Geometric Pattern */}
            <div
                className="absolute inset-0 animate-parallax-drift"
                style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-48 0c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7z\' fill=\'%23fff\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
                    opacity: styles.patternOpacity,
                    transition: 'opacity 3s ease-in-out',
                    transform: stage === AtmosphereStage.DEEP_LIMINAL ? 'rotate(0.5deg)' : 'rotate(0)',
                }}
            />

            {/* Noise Filter */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXVpaWl9fX18fHyAgICEhISEhISBgYGCgoKTk5N4eHj+/v7Dw8OhoaGxtbWdnZ2Li4ubm5uVlZWYmJjoyScvAAAAAXRSTlMAQObYZgAAAFBJREFUeNrt1MENACAMQlGbRANDi/s/y3hoP88+A+w4sJ+i0AsxYOLIiBNkxlh33z+w4u1fnMoK8dD9qwnY4+i98+f78fzp35j8/vj98P57+v9/8PDh78/fXz8AAN3aBs5JAAAAAElFTSuQmCC")',
                    opacity: styles.noiseOpacity,
                    transition: 'opacity 3s ease-in-out',
                }}
            />
            
            {/* Particle Effects */}
            {particles.map(particle => (
                 <div key={particle.id} className="absolute rounded-full" style={particle.style} />
            ))}

            {/* Vignette */}
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(circle, transparent 60%, black)`,
                    opacity: styles.vignetteOpacity,
                    transition: 'opacity 3s ease-in-out',
                }}
            />
        </div>
    );
};