import type { Meta, StoryObj } from '@storybook/react';
import { Radio } from './Radio';

const meta = {
  title: 'UI/Radio',
  component: Radio,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof Radio>;

export const Default: Story = {
  render: () => (
    <div className="space-y-2">
      <Radio
        name="option"
        value="1"
        label="Option 1"
      />
      <Radio
        name="option"
        value="2"
        label="Option 2"
      />
      <Radio
        name="option"
        value="3"
        label="Option 3"
      />
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <Radio
      name="error-example"
      label="Required option"
      error="Please select an option"
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="space-y-2">
      <Radio
        name="disabled"
        label="Disabled option"
        disabled
      />
      <Radio
        name="disabled"
        label="Disabled checked option"
        disabled
        defaultChecked
      />
    </div>
  ),
};

export const Checked: Story = {
  render: () => (
    <Radio
      name="checked"
      label="Checked option"
      defaultChecked
    />
  ),
};

export const WithoutLabel: Story = {
  render: () => (
    <Radio
      name="no-label"
      aria-label="Radio without visible label"
    />
  ),
}; 