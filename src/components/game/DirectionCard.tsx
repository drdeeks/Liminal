import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Direction, getOppositeDirection } from '../../lib/types';
import { ArrowUpIcon, ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon } from '../ui/icons';

interface DirectionCardProps {
  direction: Direction;
  keyProp: number;
  onCorrectSwipe: () => void;
  onIncorrectSwipe: () => void;
  isJoker: boolean;
  score: number;
  keyboardSwipeOutDirection: Direction | null;
}

const DISTANCE_THRESHOLD = 50; // Minimum pixels to register by distance
const VELOCITY_THRESHOLD = 0.4; // Minimum pixels/ms to register by speed
const MIN_SWIPE_DURATION = 50; // ms, to prevent accidental tiny fast movements
const SWIPE_ANIMATION_DURATION = 300; // ms for the card to fly off-screen

const directionMap = {
  [Direction.Up]: <ArrowUpIcon />,
  [Direction.Down]: <ArrowDownIcon />,
  [Direction.Left]: <ArrowLeftIcon />,
  [Direction.Right]: <ArrowRightIcon />,
};

export const DirectionCard: React.FC<DirectionCardProps> = ({ direction, keyProp, onCorrectSwipe, onIncorrectSwipe, isJoker, score, keyboardSwipeOutDirection }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isIncorrect, setIsIncorrect] = useState(false);
    const [swipeOutDirection, setSwipeOutDirection] = useState<Direction | null>(null);
    const startPos = useRef({ x: 0, y: 0 });
    const startTime = useRef<number>(0);
    const cardRef = useRef<HTMLDivElement>(null);

    // Reset internal state when a new card is shown
    useEffect(() => {
        setPosition({ x: 0, y: 0 });
        setIsDragging(false);
        setIsConfirmed(false);
        setIsIncorrect(false);
        setSwipeOutDirection(null);
    }, [keyProp]);

    // Trigger swipe-out animation from keyboard input
    useEffect(() => {
      if (keyboardSwipeOutDirection !== null) {
        const targetDirection = isJoker ? getOppositeDirection(direction) : direction;
        if (keyboardSwipeOutDirection === targetDirection) {
          setIsConfirmed(true);
          setSwipeOutDirection(keyboardSwipeOutDirection);
          setTimeout(onCorrectSwipe, SWIPE_ANIMATION_DURATION);
        } else {
          setIsIncorrect(true);
          setTimeout(onIncorrectSwipe, 150);
        }
      }
    }, [keyboardSwipeOutDirection, direction, isJoker, onCorrectSwipe, onIncorrectSwipe]);

    const getCoords = (e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement> | MouseEvent) => {
        if ('touches' in e && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
    };

    const handleDragStart = (e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
        if (swipeOutDirection !== null) return; // Prevent interaction during swipe-out
        e.preventDefault();
        setIsDragging(true);
        const { x, y } = getCoords(e);
        startPos.current = { x, y };
        startTime.current = performance.now();
        if (cardRef.current) {
            cardRef.current.style.transition = 'none'; // Allow instant following
        }
    };

    const handleDragMove = useCallback((e: TouchEvent | MouseEvent) => {
        if (!isDragging || swipeOutDirection !== null) return;
        const { x, y } = getCoords(e as unknown as React.TouchEvent<HTMLDivElement>);
        const deltaX = x - startPos.current.x;
        const deltaY = y - startPos.current.y;
        setPosition({ x: deltaX, y: deltaY });
    }, [isDragging, swipeOutDirection]);

    const handleDragEnd = useCallback(() => {
        if (!isDragging || swipeOutDirection !== null) return;
        setIsDragging(false);

        if (cardRef.current) {
            cardRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-in, box-shadow 1s ease-in-out, border-color 0.2s ease-out';
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime.current;
        
        const deltaX = position.x;
        const deltaY = position.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const velocity = distance / duration;

        const isSwipeByDistance = distance > DISTANCE_THRESHOLD;
        const isSwipeByVelocity = velocity > VELOCITY_THRESHOLD && duration > MIN_SWIPE_DURATION;

        if (isSwipeByDistance || isSwipeByVelocity) {
            const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
            let swipedDirection: Direction;

            if (angle >= -45 && angle < 45) {
                swipedDirection = Direction.Right;
            } else if (angle >= 45 && angle < 135) {
                swipedDirection = Direction.Down;
            } else if (angle >= 135 || angle < -135) {
                swipedDirection = Direction.Left;
            } else {
                swipedDirection = Direction.Up;
            }

            const targetDirection = isJoker ? getOppositeDirection(direction) : direction;

            if (swipedDirection === targetDirection) {
                if (navigator.vibrate) {
                    const hapticDuration = Math.round(Math.max(40, Math.min(100, 40 + (velocity - VELOCITY_THRESHOLD) * 50)));
                    navigator.vibrate(hapticDuration);
                }
                setIsConfirmed(true);
                setSwipeOutDirection(swipedDirection);
                setTimeout(onCorrectSwipe, SWIPE_ANIMATION_DURATION);
            } else {
                if (navigator.vibrate) {
                    navigator.vibrate([70, 50, 70]);
                }
                setIsIncorrect(true);
                setTimeout(onIncorrectSwipe, 150);
                setPosition({ x: 0, y: 0 }); 
            }
        } else {
             setPosition({ x: 0, y: 0 });
        }
    }, [isDragging, position, direction, isJoker, onCorrectSwipe, onIncorrectSwipe, swipeOutDirection]);
    
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => handleDragMove(e);
        const handleMouseUp = () => handleDragEnd();
        const handleTouchMove = (e: TouchEvent) => {
            if (isDragging) {
                e.preventDefault();
                handleDragMove(e);
            }
        };
        const handleTouchEnd = () => handleDragEnd();

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
            window.addEventListener('touchcancel', handleTouchEnd);
        }
        
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [isDragging, handleDragMove, handleDragEnd]);

    const getShadowStyle = () => {
        const shadowLength = Math.min(20 + score / 20, 80);
        let r = 0, g = 0, b = 0;
        let opacity = 0.5;

        if (score < 500) {
            const progress = score / 500;
            opacity = 0.5 + progress * 0.15;
        } else if (score < 1000) {
            const progress = (score - 500) / 500;
            r = 0 + progress * 180;
            g = 0 + progress * 80;
            b = 0 + progress * 20;
            opacity = 0.65 + progress * 0.15;
        } else {
            const progress = Math.min((score - 1000) / 1000, 1);
            r = 180 + progress * 75;
            g = 80 - progress * 20;
            b = 20 - progress * 20;
            opacity = 0.8 + progress * 0.15;
        }
        
        const shadowColor = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${opacity})`;
        return `0px ${shadowLength}px ${shadowLength * 1.5}px -${shadowLength / 3}px ${shadowColor}`;
    };

    const getTransform = () => {
      if (swipeOutDirection !== null) {
        let translatePart = '';
        switch (swipeOutDirection) {
          case Direction.Up: translatePart = 'translateY(-150%) rotate(-15deg)'; break;
          case Direction.Down: translatePart = 'translateY(150%) rotate(15deg)'; break;
          case Direction.Left: translatePart = 'translateX(-150%) rotate(-15deg)'; break;
          case Direction.Right: translatePart = 'translateX(150%) rotate(15deg)'; break;
        }
        return `${translatePart} scale(0.6)`;
      }
      const rotation = position.x * 0.05;
      return `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`;
    };

    const cardColor = isJoker ? 'bg-rose-500' : 'bg-teal-600';
    const feedbackClass = isConfirmed ? 'animate-correct-flash' : isIncorrect ? 'animate-incorrect-flash' : '';
    
    const transitionStyle = isDragging ? 'none' : 
        swipeOutDirection !== null ? `transform ${SWIPE_ANIMATION_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity ${SWIPE_ANIMATION_DURATION * 0.8}ms ease-out` :
        'transform 0.3s ease-out, box-shadow 1s ease-in-out, border-color 0.2s ease-out';

    return (
        <div
            ref={cardRef}
            key={keyProp}
            className={`select-none w-64 h-80 sm:w-80 sm:h-96 ${cardColor} rounded-2xl border-2 border-white/20 flex items-center justify-center cursor-grab active:cursor-grabbing ${feedbackClass}`}
            style={{ 
                transform: getTransform(),
                opacity: swipeOutDirection !== null ? 0 : 1,
                transition: transitionStyle,
                boxShadow: getShadowStyle(),
                willChange: 'transform, opacity',
            }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
        >
            <div className="drop-shadow-lg">
              {directionMap[direction]}
            </div>
        </div>
    );
};
