import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CountdownTimer } from '../../components/game/CountdownTimer';

describe('CountdownTimer', () => {
  it('renders 0.00 when not playing', () => {
    render(
      <CountdownTimer
        startTime={null}
        duration={1500}
        onTimesUp={vi.fn()}
        gameState="menu"
      />
    );
    expect(screen.getByText('0.00')).toBeInTheDocument();
  });

  it('renders time when playing', () => {
    const startTime = performance.now();
    render(
      <CountdownTimer
        startTime={startTime}
        duration={1500}
        onTimesUp={vi.fn()}
        gameState="playing"
      />
    );
    const timer = screen.getByText(/\d+\.\d{2}s/);
    expect(timer).toBeInTheDocument();
  });

  it('shows green color when time > 50%', () => {
    const startTime = performance.now();
    const { container } = render(
      <CountdownTimer
        startTime={startTime}
        duration={1500}
        onTimesUp={vi.fn()}
        gameState="playing"
      />
    );
    const timer = container.querySelector('.text-green-400');
    expect(timer).toBeInTheDocument();
  });
});
