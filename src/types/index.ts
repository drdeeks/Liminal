export enum Direction {
  Up,
  Down,
  Left,
  Right,
}

export enum GameState {
  Start,
  Countdown,
  Playing,
  GameOver,
  Leaderboard,
}

export const getOppositeDirection = (dir: Direction): Direction => {
  switch (dir) {
    case Direction.Up: return Direction.Down;
    case Direction.Down: return Direction.Up;
    case Direction.Left: return Direction.Right;
    case Direction.Right: return Direction.Left;
  }
};

export enum AtmosphereStage {
    EARLY,      // 0-100
    THRESHOLD_1, // 100-250
    THRESHOLD_2, // 250-500
    THRESHOLD_3, // 500-1000
    DEEP_LIMINAL // 1000+
}