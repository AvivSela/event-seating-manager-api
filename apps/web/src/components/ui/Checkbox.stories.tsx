import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: () => (
    <Checkbox
      label="Accept terms and conditions"
    />
  ),
};

export const WithError: Story = {
  render: () => (
    <Checkbox
      label="Required checkbox"
      error="This field is required"
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <Checkbox
      label="Disabled checkbox"
      disabled
    />
  ),
};

export const Checked: Story = {
  render: () => (
    <Checkbox
      label="Checked checkbox"
      defaultChecked
    />
  ),
};

export const Indeterminate: Story = {
  render: () => (
    <Checkbox
      label="Indeterminate checkbox"
      indeterminate
    />
  ),
};

export const WithoutLabel: Story = {
  render: () => (
    <Checkbox
      aria-label="Checkbox without visible label"
    />
  ),
}; 