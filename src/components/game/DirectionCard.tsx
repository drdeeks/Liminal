import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Direction, getOppositeDirection } from '../../lib/types';
import { ArrowUpIcon, ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon } from '../ui/icons';
import { INPUT, ANIMATION, HAPTICS } from '../../lib/constants';

interface DirectionCardProps {
  direction: Direction;
  keyProp: number;
  onCorrectSwipe: () => void;
  onIncorrectSwipe: () => void;
  isJoker: boolean;
  score: number;
  keyboardSwipeOutDirection: Direction | null;
}

const directionMap = {
  [Direction.Up]: <ArrowUpIcon />,
  [Direction.Down]: <ArrowDownIcon />,
  [Direction.Left]: <ArrowLeftIcon />,
  [Direction.Right]: <ArrowRightIcon />,
};

const DirectionCardMemoized = React.memo<DirectionCardProps>(({ 
  direction, 
  keyProp, 
  onCorrectSwipe, 
  onIncorrectSwipe, 
  isJoker, 
  score, 
  keyboardSwipeOutDirection 
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isIncorrect, setIsIncorrect] = useState(false);
  const [swipeOutDirection, setSwipeOutDirection] = useState<Direction | null>(null);
  
  const startPos = useRef({ x: 0, y: 0 });
  const startTime = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosition({ x: 0, y: 0 });
    setIsDragging(false);
    setIsConfirmed(false);
    setIsIncorrect(false);
    setSwipeOutDirection(null);
  }, [keyProp]);

  useEffect(() => {
    if (keyboardSwipeOutDirection !== null) {
      const targetDirection = isJoker ? getOppositeDirection(direction) : direction;
      if (keyboardSwipeOutDirection === targetDirection) {
        setIsConfirmed(true);
        setSwipeOutDirection(keyboardSwipeOutDirection);
        const timer = setTimeout(onCorrectSwipe, ANIMATION.CARD_SWIPE_DURATION);
        return () => clearTimeout(timer);
      } else {
        if (navigator.vibrate) navigator.vibrate(HAPTICS.INCORRECT);
        setIsIncorrect(true);
        const timer = setTimeout(() => {
          setIsIncorrect(false);
          onIncorrectSwipe();
        }, ANIMATION.INCORRECT_FLASH_DURATION);
        return () => clearTimeout(timer);
      }
    }
  }, [keyboardSwipeOutDirection, direction, isJoker, onCorrectSwipe, onIncorrectSwipe]);

  const getCoords = (e: React.TouchEvent | React.MouseEvent | MouseEvent | TouchEvent) => {
    if ('touches' in e && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
  };

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (swipeOutDirection !== null) return;
    e.preventDefault();
    setIsDragging(true);
    const { x, y } = getCoords(e);
    startPos.current = { x, y };
    startTime.current = performance.now();
    if (cardRef.current) cardRef.current.style.transition = 'none';
  };

  const handleDragMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!isDragging || swipeOutDirection !== null) return;
    const { x, y } = getCoords(e);
    setPosition({ x: x - startPos.current.x, y: y - startPos.current.y });
  }, [isDragging, swipeOutDirection]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging || swipeOutDirection !== null) return;
    setIsDragging(false);

    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.3s ease-out, box-shadow 1s ease-in-out';
    }

    const duration = performance.now() - startTime.current;
    const distance = Math.sqrt(position.x ** 2 + position.y ** 2);
    const velocity = distance / duration;

    if (distance > INPUT.DISTANCE_THRESHOLD || (velocity > INPUT.VELOCITY_THRESHOLD && duration > INPUT.MIN_SWIPE_DURATION)) {
      const angle = Math.atan2(position.y, position.x) * 180 / Math.PI;
      let swipedDirection: Direction;

      if (angle >= -45 && angle < 45) swipedDirection = Direction.Right;
      else if (angle >= 45 && angle < 135) swipedDirection = Direction.Down;
      else if (angle >= 135 || angle < -135) swipedDirection = Direction.Left;
      else swipedDirection = Direction.Up;

      const targetDirection = isJoker ? getOppositeDirection(direction) : direction;

      if (swipedDirection === targetDirection) {
        if (navigator.vibrate) navigator.vibrate(HAPTICS.CORRECT);
        setIsConfirmed(true);
        setSwipeOutDirection(swipedDirection);
        setTimeout(onCorrectSwipe, ANIMATION.CARD_SWIPE_DURATION);
      } else {
        if (navigator.vibrate) navigator.vibrate(HAPTICS.INCORRECT);
        setIsIncorrect(true);
        setTimeout(() => {
          setIsIncorrect(false);
          onIncorrectSwipe();
        }, ANIMATION.INCORRECT_FLASH_DURATION);
        setPosition({ x: 0, y: 0 });
      }
    } else {
      setPosition({ x: 0, y: 0 });
    }
  }, [isDragging, position, direction, isJoker, onCorrectSwipe, onIncorrectSwipe, swipeOutDirection]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => handleDragMove(e);
    const handleMouseUp = () => handleDragEnd();
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleDragMove(e);
    };
    const handleTouchEnd = () => handleDragEnd();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const getShadow = () => {
    const length = Math.min(20 + score / 20, 80);
    const progress = Math.min(score / 2000, 1);
    const r = 180 * progress + 75 * (progress > 0.5 ? (progress - 0.5) * 2 : 0);
    const g = 80 * progress - 20 * (progress > 0.5 ? (progress - 0.5) * 2 : 0);
    const b = 20 * progress - 20 * (progress > 0.5 ? (progress - 0.5) * 2 : 0);
    const opacity = 0.5 + progress * 0.45;
    return `0px ${length}px ${length * 1.5}px -${length / 3}px rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const getTransform = () => {
    if (swipeOutDirection !== null) {
      const transforms = {
        [Direction.Up]: 'translateY(-150%) rotate(-15deg) scale(0.6)',
        [Direction.Down]: 'translateY(150%) rotate(15deg) scale(0.6)',
        [Direction.Left]: 'translateX(-150%) rotate(-15deg) scale(0.6)',
        [Direction.Right]: 'translateX(150%) rotate(15deg) scale(0.6)',
      };
      return transforms[swipeOutDirection];
    }
    const rotation = position.x * 0.05;
    return `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`;
  };

  const cardColor = isJoker ? 'bg-rose-500' : 'bg-teal-600';
  const feedbackClass = isConfirmed ? 'animate-correct-flash' : isIncorrect ? 'animate-incorrect-flash' : '';
  const transitionStyle = isDragging ? 'none' : 
    swipeOutDirection !== null ? `transform ${ANIMATION.CARD_SWIPE_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity ${ANIMATION.CARD_SWIPE_DURATION * 0.8}ms ease-out` :
    'transform 0.3s ease-out, box-shadow 1s ease-in-out';

  return (
    <div
      ref={cardRef}
      className={`select-none w-64 h-80 sm:w-80 sm:h-96 ${cardColor} rounded-2xl border-2 border-white/20 flex items-center justify-center cursor-grab active:cursor-grabbing ${feedbackClass}`}
      style={{
        transform: getTransform(),
        opacity: swipeOutDirection !== null ? 0 : 1,
        transition: transitionStyle,
        boxShadow: getShadow(),
        willChange: 'transform, opacity',
      }}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
    >
      <div className="drop-shadow-lg">{directionMap[direction]}</div>
    </div>
  );
}, (prev, next) => 
  prev.direction === next.direction &&
  prev.keyProp === next.keyProp &&
  prev.isJoker === next.isJoker &&
  prev.score === next.score &&
  prev.keyboardSwipeOutDirection === next.keyboardSwipeOutDirection
);

export const DirectionCard = DirectionCardMemoized;