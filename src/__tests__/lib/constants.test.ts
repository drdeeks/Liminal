import { describe, it, expect } from 'vitest';
import { GAME_CONFIG, DIFFICULTY, ANIMATION, INPUT, HAPTICS, PERFORMANCE } from '../../lib/constants';

describe('constants', () => {
  describe('GAME_CONFIG', () => {
    it('has valid initial strikes', () => {
      expect(GAME_CONFIG.INITIAL_STRIKES).toBe(3);
      expect(GAME_CONFIG.INITIAL_STRIKES).toBeGreaterThan(0);
    });

    it('has valid card timing', () => {
      expect(GAME_CONFIG.CARD_INITIAL_TIME_MS).toBe(1500);
      expect(GAME_CONFIG.CARD_MIN_TIME_MS).toBe(450);
      expect(GAME_CONFIG.CARD_INITIAL_TIME_MS).toBeGreaterThan(GAME_CONFIG.CARD_MIN_TIME_MS);
    });

    it('has valid difficulty progression', () => {
      expect(GAME_CONFIG.SCORE_FOR_MAX_DIFFICULTY).toBe(5000);
      expect(GAME_CONFIG.SCORE_FOR_MAX_DIFFICULTY).toBeGreaterThan(0);
    });

    it('has valid joker probability', () => {
      expect(GAME_CONFIG.JOKER_PROBABILITY).toBe(0.25);
      expect(GAME_CONFIG.JOKER_PROBABILITY).toBeGreaterThanOrEqual(0);
      expect(GAME_CONFIG.JOKER_PROBABILITY).toBeLessThanOrEqual(1);
    });
  });

  describe('ANIMATION', () => {
    it('has positive durations', () => {
      expect(ANIMATION.CARD_SWIPE_DURATION).toBeGreaterThan(0);
      expect(ANIMATION.FLASH_DURATION).toBeGreaterThan(0);
      expect(ANIMATION.SHAKE_DURATION).toBeGreaterThan(0);
    });
  });

  describe('INPUT', () => {
    it('has valid thresholds', () => {
      expect(INPUT.DISTANCE_THRESHOLD).toBe(50);
      expect(INPUT.VELOCITY_THRESHOLD).toBe(0.4);
      expect(INPUT.MIN_SWIPE_DURATION).toBe(50);
    });
  });

  describe('HAPTICS', () => {
    it('has correct pattern', () => {
      expect(HAPTICS.CORRECT).toEqual([50]);
      expect(HAPTICS.INCORRECT).toEqual([100, 50, 100, 50, 100]);
    });
  });
});
