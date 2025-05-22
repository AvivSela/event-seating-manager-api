import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Radio } from './Radio';

describe('Radio', () => {
  it('renders with label', () => {
    render(<Radio label="Option 1" />);
    const radio = screen.getByRole('radio');
    const label = screen.getByText('Option 1');
    expect(radio).toBeInTheDocument();
    expect(label).toBeInTheDocument();
  });

  it('handles checked state', () => {
    render(<Radio label="Radio option" />);
    const radio = screen.getByRole('radio');
    expect(radio).not.toBeChecked();
    fireEvent.click(radio);
    expect(radio).toBeChecked();
  });

  it('handles disabled state', () => {
    render(<Radio label="Disabled radio" disabled />);
    const radio = screen.getByRole('radio');
    expect(radio).toBeDisabled();
    expect(radio).toHaveClass('disabled:opacity-50');
  });

  it('shows error message', () => {
    render(<Radio label="Error radio" error="Please select an option" />);
    const errorMessage = screen.getByText('Please select an option');
    const radio = screen.getByRole('radio');
    expect(errorMessage).toBeInTheDocument();
    expect(radio).toHaveClass('border-danger-300');
  });

  it('forwards ref and additional props', () => {
    const testId = 'test-radio';
    render(
      <Radio
        label="Test radio"
        data-testid={testId}
        aria-label="Test radio"
      />
    );
    const radio = screen.getByTestId(testId);
    expect(radio).toHaveAttribute('aria-label', 'Test radio');
  });
}); 