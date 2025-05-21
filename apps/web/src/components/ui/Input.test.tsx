import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('renders with default variant', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('border-secondary-200');
  });

  it('renders with error state', () => {
    render(<Input error="This field is required" placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    const errorMessage = screen.getByText('This field is required');
    expect(input).toHaveClass('border-danger-300');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass('text-danger-500');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Input inputSize="sm" placeholder="Small input" />);
    let input = screen.getByPlaceholderText('Small input');
    expect(input).toHaveClass('h-8');

    rerender(<Input inputSize="lg" placeholder="Large input" />);
    input = screen.getByPlaceholderText('Large input');
    expect(input).toHaveClass('h-12');
  });

  it('handles disabled state', () => {
    render(<Input disabled placeholder="Disabled input" />);
    const input = screen.getByPlaceholderText('Disabled input');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:opacity-50');
  });

  it('forwards additional props', () => {
    render(<Input data-testid="test-input" type="email" required />);
    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toBeRequired();
  });
}); 