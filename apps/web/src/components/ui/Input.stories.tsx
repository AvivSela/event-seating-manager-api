import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter your text here',
  },
};

export const WithError: Story = {
  args: {
    placeholder: 'Enter your text here',
    error: 'This field is required',
  },
};

export const Small: Story = {
  args: {
    placeholder: 'Small input',
    inputSize: 'sm',
  },
};

export const Large: Story = {
  args: {
    placeholder: 'Large input',
    inputSize: 'lg',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const WithType: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email',
  },
};

export const Required: Story = {
  args: {
    required: true,
    placeholder: 'Required field',
  },
}; 