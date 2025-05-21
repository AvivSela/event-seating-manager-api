import type { Meta, StoryObj } from '@storybook/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './Card';
import { Button } from './Button';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main content of the card. You can put anything here.</p>
      </CardContent>
      <CardFooter>
        <Button variant="secondary" className="mr-2">Cancel</Button>
        <Button>Submit</Button>
      </CardFooter>
    </Card>
  ),
};

export const Elevated: Story = {
  render: () => (
    <Card variant="elevated" className="w-[350px]">
      <CardHeader>
        <CardTitle>Elevated Card</CardTitle>
        <CardDescription>This card has a shadow</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content with elevated appearance</p>
      </CardContent>
    </Card>
  ),
};

export const Compact: Story = {
  render: () => (
    <Card padding="compact" className="w-[350px]">
      <CardHeader>
        <CardTitle>Compact Card</CardTitle>
        <CardDescription>With less padding</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Compact content</p>
      </CardContent>
    </Card>
  ),
};

export const NoPadding: Story = {
  render: () => (
    <Card padding="none" className="w-[350px]">
      <img
        src="https://via.placeholder.com/350x150"
        alt="Placeholder"
        className="w-full h-[150px] object-cover rounded-t-lg"
      />
      <CardHeader>
        <CardTitle>Media Card</CardTitle>
        <CardDescription>Card with media content</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content after media</p>
      </CardContent>
    </Card>
  ),
}; 