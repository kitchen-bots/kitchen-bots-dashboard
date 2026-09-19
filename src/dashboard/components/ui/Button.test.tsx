import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';
import { describe, it, expect, vi } from 'vitest';

describe('Button', () => {
  it('renders correctly with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles clicks', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    await userEvent.click(screen.getByRole('button', { name: /click me/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', async () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('displays loading spinner and is disabled when isLoading is true', async () => {
    const handleClick = vi.fn();
    render(<Button isLoading onClick={handleClick}>Loading State</Button>);
    
    // Using aria-label for the loading spinner
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toBeInTheDocument();
    
    // Text should still be in the DOM for width preservation, but invisible to users structurally (opacity-0).
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    
    await userEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
