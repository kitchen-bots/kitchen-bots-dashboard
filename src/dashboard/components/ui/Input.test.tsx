import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Input } from './Input';

describe('Input Component', () => {
  it('renders correctly', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('handles user input', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Input placeholder="Enter text" onChange={handleChange} />);
    
    const input = screen.getByPlaceholderText('Enter text');
    await user.type(input, 'Hello');
    
    expect(input).toHaveValue('Hello');
    expect(handleChange).toHaveBeenCalled();
  });

  it('displays error state correctly', () => {
    render(<Input placeholder="Enter text" error />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toHaveClass('border-destructive');
  });

  it('renders left icon if provided', () => {
    render(
      <Input
        placeholder="Enter text"
        leftIcon={<span data-testid="left-icon">Left</span>}
      />
    );
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });
});
