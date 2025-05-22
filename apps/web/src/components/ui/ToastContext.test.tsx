import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastContext';

function TestComponent() {
  const { addToast } = useToast();
  return (
    <button onClick={() => addToast('Test message', 'success')}>
      Show Toast
    </button>
  );
}

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows toast when addToast is called', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Toast'));
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('removes toast when close button is clicked', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Toast'));
    expect(screen.getByText('Test message')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('auto-dismisses toast after default duration', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Toast'));
    expect(screen.getByText('Test message')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000); // Default duration
    });

    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('shows multiple toasts', () => {
    function MultipleToastTest() {
      const { addToast } = useToast();
      return (
        <>
          <button
            onClick={() => addToast('First Toast', 'success')}
          >
            Show First
          </button>
          <button
            onClick={() => addToast('Second Toast', 'error')}
          >
            Show Second
          </button>
        </>
      );
    }

    render(
      <ToastProvider>
        <MultipleToastTest />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show First'));
    fireEvent.click(screen.getByText('Show Second'));

    expect(screen.getByText('First Toast')).toBeInTheDocument();
    expect(screen.getByText('Second Toast')).toBeInTheDocument();
  });

  it('throws error when useToast is used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useToast must be used within a ToastProvider');

    consoleError.mockRestore();
  });
}); 