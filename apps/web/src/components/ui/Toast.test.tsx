import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toast, ToastContainer } from './Toast';

describe('Toast', () => {
  it('renders with message and type', () => {
    render(
      <Toast
        id="1"
        message="Test message"
        type="success"
        onDismiss={() => {}}
      />
    );

    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-success-50');
  });

  it('calls onDismiss when close button is clicked', () => {
    const onDismiss = vi.fn();
    render(
      <Toast
        id="1"
        message="Test message"
        type="error"
        onDismiss={onDismiss}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onDismiss).toHaveBeenCalledWith('1');
  });

  it('auto-dismisses after duration', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(
      <Toast
        id="1"
        message="Test message"
        type="info"
        duration={3000}
        onDismiss={onDismiss}
      />
    );

    vi.advanceTimersByTime(2999);
    expect(onDismiss).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onDismiss).toHaveBeenCalledWith('1');

    vi.useRealTimers();
  });

  it('renders different types with correct styles', () => {
    const { rerender } = render(
      <Toast
        id="1"
        message="Test message"
        type="success"
        onDismiss={() => {}}
      />
    );
    expect(screen.getByRole('alert')).toHaveClass('bg-success-50');

    rerender(
      <Toast
        id="1"
        message="Test message"
        type="error"
        onDismiss={() => {}}
      />
    );
    expect(screen.getByRole('alert')).toHaveClass('bg-danger-50');

    rerender(
      <Toast
        id="1"
        message="Test message"
        type="warning"
        onDismiss={() => {}}
      />
    );
    expect(screen.getByRole('alert')).toHaveClass('bg-warning-50');

    rerender(
      <Toast
        id="1"
        message="Test message"
        type="info"
        onDismiss={() => {}}
      />
    );
    expect(screen.getByRole('alert')).toHaveClass('bg-info-50');
  });
});

describe('ToastContainer', () => {
  it('renders children in a portal', () => {
    render(
      <ToastContainer>
        <div data-testid="toast-child">Test Child</div>
      </ToastContainer>
    );

    const container = screen.getByTestId('toast-child').parentElement;
    expect(container).toHaveClass('fixed');
    expect(container).toHaveClass('right-0');
    expect(container).toHaveClass('top-4');
  });
}); 