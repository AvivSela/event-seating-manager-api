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
  render: () => <Input placeholder="Enter your text here" />,
};

export const WithError: Story = {
  render: () => (
    <Input
      placeholder="Enter your text here"
      error="This field is required"
    />
  ),
};

export const Small: Story = {
  render: () => (
    <Input
      placeholder="Small input"
      inputSize="sm"
    />
  ),
};

export const Large: Story = {
  render: () => (
    <Input
      placeholder="Large input"
      inputSize="lg"
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <Input
      placeholder="Disabled input"
      disabled
    />
  ),
};

export const WithType: Story = {
  render: () => (
    <Input
      type="email"
      placeholder="Enter your email"
    />
  ),
};

export const Required: Story = {
  render: () => (
    <Input
      required
      placeholder="Required field"
    />
  ),
}; 