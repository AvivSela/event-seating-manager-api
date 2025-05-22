import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  render: () => <Button variant="primary">Primary Button</Button>,
};

export const Secondary: Story = {
  render: () => <Button variant="secondary">Secondary Button</Button>,
};

export const Danger: Story = {
  render: () => <Button variant="danger">Delete</Button>,
};

export const Ghost: Story = {
  render: () => <Button variant="ghost">Ghost Button</Button>,
};

export const Small: Story = {
  render: () => <Button size="sm">Small Button</Button>,
};

export const Large: Story = {
  render: () => <Button size="lg">Large Button</Button>,
};

export const FullWidth: Story = {
  render: () => <Button fullWidth>Full Width Button</Button>,
}; 