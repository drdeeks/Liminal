import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StrikesDisplay } from '../../components/game/StrikesDisplay';

describe('StrikesDisplay', () => {
  it('renders nothing when no strikes', () => {
    const { container } = render(<StrikesDisplay strikes={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders one strike when 1 strike', () => {
    render(<StrikesDisplay strikes={1} />);
    const strikes = screen.getAllByText('✗');
    expect(strikes).toHaveLength(1);
  });

  it('renders two strikes when 2 strikes', () => {
    render(<StrikesDisplay strikes={2} />);
    const strikes = screen.getAllByText('✗');
    expect(strikes).toHaveLength(2);
  });

  it('renders three strikes when 3 strikes', () => {
    render(<StrikesDisplay strikes={3} />);
    const strikes = screen.getAllByText('✗');
    expect(strikes).toHaveLength(3);
  });
});
