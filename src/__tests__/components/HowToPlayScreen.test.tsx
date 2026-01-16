import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HowToPlayScreen } from '../../components/screens/HowToPlayScreen';

describe('HowToPlayScreen', () => {
  it('renders title and instructions', () => {
    render(<HowToPlayScreen onStart={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('How to Play')).toBeInTheDocument();
    expect(screen.getByText(/arrow keys/i)).toBeInTheDocument();
  });

  it('has disabled start button initially', () => {
    render(<HowToPlayScreen onStart={vi.fn()} onCancel={vi.fn()} />);
    const startButton = screen.getByRole('button', { name: /start game/i });
    expect(startButton).toBeDisabled();
  });

  it('enables start button when checkbox is checked', () => {
    render(<HowToPlayScreen onStart={vi.fn()} onCancel={vi.fn()} />);
    const checkbox = screen.getByRole('checkbox');
    const startButton = screen.getByRole('button', { name: /start game/i });
    
    fireEvent.click(checkbox);
    expect(startButton).not.toBeDisabled();
  });

  it('calls onStart when start button clicked', () => {
    const onStart = vi.fn();
    render(<HowToPlayScreen onStart={onStart} onCancel={vi.fn()} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);
    
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when back button clicked', () => {
    const onCancel = vi.fn();
    render(<HowToPlayScreen onStart={vi.fn()} onCancel={onCancel} />);
    
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);
    
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
