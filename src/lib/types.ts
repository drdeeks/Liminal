export enum GameState {
  Start,
  HowToPlay,
  Countdown,
  Playing,
  GameOver,
  Leaderboard,
}

export enum Direction {
  Up,
  Down,
  Left,
  Right,
}

export enum AtmosphereStage {
  EARLY,
  THRESHOLD_1,
  THRESHOLD_2,
  THRESHOLD_3,
  DEEP_LIMINAL,
}

export const getOppositeDirection = (direction: Direction): Direction => {
  switch (direction) {
    case Direction.Up:
      return Direction.Down;
    case Direction.Down:
      return Direction.Up;
    case Direction.Left:
      return Direction.Right;
    case Direction.Right:
      return Direction.Left;
  }
};

export const getRandomDirection = (): Direction => {
  const directions = [Direction.Up, Direction.Down, Direction.Left, Direction.Right];
  return directions[Math.floor(Math.random() * directions.length)];
};
