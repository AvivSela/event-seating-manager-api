import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders with label', () => {
    render(<Checkbox label="Accept terms" />);
    const checkbox = screen.getByRole('checkbox');
    const label = screen.getByText('Accept terms');
    expect(checkbox).toBeInTheDocument();
    expect(label).toBeInTheDocument();
  });

  it('handles checked state', () => {
    render(<Checkbox label="Checkbox" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('handles disabled state', () => {
    render(<Checkbox label="Disabled checkbox" disabled />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
    expect(checkbox).toHaveClass('disabled:opacity-50');
  });

  it('shows error message', () => {
    render(<Checkbox label="Error checkbox" error="This field is required" />);
    const errorMessage = screen.getByText('This field is required');
    const checkbox = screen.getByRole('checkbox');
    expect(errorMessage).toBeInTheDocument();
    expect(checkbox).toHaveClass('border-danger-300');
  });

  it('handles indeterminate state', () => {
    render(<Checkbox label="Indeterminate" indeterminate />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveProperty('indeterminate', true);
  });

  it('forwards ref and additional props', () => {
    const testId = 'test-checkbox';
    render(
      <Checkbox
        label="Test checkbox"
        data-testid={testId}
        aria-label="Test checkbox"
      />
    );
    const checkbox = screen.getByTestId(testId);
    expect(checkbox).toHaveAttribute('aria-label', 'Test checkbox');
  });
}); 