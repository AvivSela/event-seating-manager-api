import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Select } from './Select';

const mockOptions = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3', disabled: true },
];

describe('Select', () => {
  it('renders with label and options', () => {
    render(<Select label="Select option" options={mockOptions} />);
    const select = screen.getByRole('combobox');
    const label = screen.getByText('Select option');
    const options = screen.getAllByRole('option');
    
    expect(select).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(options).toHaveLength(3);
    expect(options[2]).toBeDisabled();
  });

  it('renders with placeholder', () => {
    render(
      <Select
        placeholder="Choose an option"
        options={mockOptions}
      />
    );
    const placeholder = screen.getByRole('option', { name: 'Choose an option' });
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toBeDisabled();
  });

  it('handles disabled state', () => {
    render(
      <Select
        label="Disabled select"
        options={mockOptions}
        disabled
      />
    );
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
    expect(select).toHaveClass('disabled:opacity-50');
  });

  it('shows error message', () => {
    render(
      <Select
        label="Error select"
        options={mockOptions}
        error="Please select an option"
      />
    );
    const errorMessage = screen.getByText('Please select an option');
    const select = screen.getByRole('combobox');
    expect(errorMessage).toBeInTheDocument();
    expect(select).toHaveClass('border-danger-300');
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(
      <Select
        options={mockOptions}
        size="sm"
      />
    );
    let select = screen.getByRole('combobox');
    expect(select).toHaveClass('h-8');

    rerender(
      <Select
        options={mockOptions}
        size="lg"
      />
    );
    select = screen.getByRole('combobox');
    expect(select).toHaveClass('h-12');
  });

  it('applies full width class when specified', () => {
    render(
      <Select
        options={mockOptions}
        fullWidth
      />
    );
    const container = screen.getByRole('combobox').parentElement;
    expect(container).toHaveClass('w-full');
  });
}); 