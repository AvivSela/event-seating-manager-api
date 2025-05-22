import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import { ToastProvider, useToast } from './ToastContext';
import { Button } from './Button';

const meta = {
  title: 'UI/Toast',
  component: ToastProvider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof ToastProvider>;

function ToastDemo() {
  const { addToast } = useToast();

  return (
    <div className="flex flex-col gap-4">
      <Button
        onClick={() => addToast('Success message', 'success')}
      >
        Show Success Toast
      </Button>
      <Button
        onClick={() => addToast('Error message', 'error')}
      >
        Show Error Toast
      </Button>
      <Button
        onClick={() => addToast('Warning message', 'warning')}
      >
        Show Warning Toast
      </Button>
      <Button
        onClick={() => addToast('Info message', 'info')}
      >
        Show Info Toast
      </Button>
    </div>
  );
}

function AutoShowToast({ type, message }: { type: 'success' | 'error' | 'warning' | 'info', message: string }) {
  const { addToast } = useToast();

  useEffect(() => {
    addToast(message, type);
  }, [addToast, message, type]);

  return null;
}

export const Interactive: Story = {
  render: () => <ToastDemo />,
};

export const Success: Story = {
  render: () => (
    <AutoShowToast
      type="success"
      message="Operation completed successfully!"
    />
  ),
};

export const Error: Story = {
  render: () => (
    <AutoShowToast
      type="error"
      message="An error occurred. Please try again."
    />
  ),
};

export const Warning: Story = {
  render: () => (
    <AutoShowToast
      type="warning"
      message="Please save your changes before leaving."
    />
  ),
};

export const Info: Story = {
  render: () => (
    <AutoShowToast
      type="info"
      message="New version available. Please refresh."
    />
  ),
};

export const MultipleToasts: Story = {
  render: () => {
    const { addToast } = useToast();

    useEffect(() => {
      addToast('First notification', 'info');
      setTimeout(() => {
        addToast('Second notification', 'success');
      }, 1000);
      setTimeout(() => {
        addToast('Third notification', 'warning');
      }, 2000);
    }, [addToast]);

    return <div />;
  },
};

export const CustomDuration: Story = {
  render: () => {
    const { addToast } = useToast();

    return (
      <Button
        onClick={() => addToast('This toast will disappear in 2 seconds', 'info', 2000)}
      >
        Show Quick Toast
      </Button>
    );
  },
}; 