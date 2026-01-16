import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StrikesDisplay } from '../../components/game/StrikesDisplay';

describe('StrikesDisplay', () => {
  it('renders nothing when no strikes used', () => {
    const { container } = render(<StrikesDisplay strikes={3} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders one strike when 2 remaining', () => {
    render(<StrikesDisplay strikes={2} />);
    const strikes = screen.getAllByText('✗');
    expect(strikes).toHaveLength(1);
  });

  it('renders two strikes when 1 remaining', () => {
    render(<StrikesDisplay strikes={1} />);
    const strikes = screen.getAllByText('✗');
    expect(strikes).toHaveLength(2);
  });

  it('renders three strikes when 0 remaining', () => {
    render(<StrikesDisplay strikes={0} />);
    const strikes = screen.getAllByText('✗');
    expect(strikes).toHaveLength(3);
  });
});
