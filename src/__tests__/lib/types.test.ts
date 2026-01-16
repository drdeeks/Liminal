import { describe, it, expect } from 'vitest';
import { Direction, getOppositeDirection, getRandomDirection } from '../../lib/types';

describe('types', () => {
  describe('getOppositeDirection', () => {
    it('returns Down for Up', () => {
      expect(getOppositeDirection(Direction.Up)).toBe(Direction.Down);
    });

    it('returns Up for Down', () => {
      expect(getOppositeDirection(Direction.Down)).toBe(Direction.Up);
    });

    it('returns Right for Left', () => {
      expect(getOppositeDirection(Direction.Left)).toBe(Direction.Right);
    });

    it('returns Left for Right', () => {
      expect(getOppositeDirection(Direction.Right)).toBe(Direction.Left);
    });
  });

  describe('getRandomDirection', () => {
    it('returns a valid direction', () => {
      const direction = getRandomDirection();
      expect([Direction.Up, Direction.Down, Direction.Left, Direction.Right]).toContain(direction);
    });

    it('returns different directions over multiple calls', () => {
      const directions = new Set();
      for (let i = 0; i < 20; i++) {
        directions.add(getRandomDirection());
      }
      expect(directions.size).toBeGreaterThan(1);
    });
  });
});
