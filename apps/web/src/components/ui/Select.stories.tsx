import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const mockOptions = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' },
  { value: '4', label: 'Disabled Option', disabled: true },
];

const meta = {
  title: 'UI/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <Select
      label="Choose an option"
      placeholder="Select an option"
      options={mockOptions}
    />
  ),
};

export const WithError: Story = {
  render: () => (
    <Select
      label="Required field"
      placeholder="Select an option"
      options={mockOptions}
      error="This field is required"
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select
      label="Disabled select"
      placeholder="Cannot select"
      options={mockOptions}
      disabled
    />
  ),
};

export const Small: Story = {
  render: () => (
    <Select
      label="Small select"
      placeholder="Select an option"
      options={mockOptions}
      size="sm"
    />
  ),
};

export const Large: Story = {
  render: () => (
    <Select
      label="Large select"
      placeholder="Select an option"
      options={mockOptions}
      size="lg"
    />
  ),
};

export const FullWidth: Story = {
  render: () => (
    <Select
      label="Full width select"
      placeholder="Select an option"
      options={mockOptions}
      fullWidth
    />
  ),
}; 