import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container } from './Container';
import { Grid } from './Grid';
import { Stack } from './Stack';

describe('Container', () => {
  it('renders with default props', () => {
    render(
      <Container>
        <div>Content</div>
      </Container>
    );
    const container = screen.getByText('Content').parentElement;
    expect(container).toHaveClass('max-w-screen-lg');
    expect(container).toHaveClass('px-6');
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(
      <Container size="sm">
        <div>Content</div>
      </Container>
    );
    let container = screen.getByText('Content').parentElement;
    expect(container).toHaveClass('max-w-screen-sm');

    rerender(
      <Container size="xl">
        <div>Content</div>
      </Container>
    );
    container = screen.getByText('Content').parentElement;
    expect(container).toHaveClass('max-w-screen-xl');
  });

  it('applies padding classes correctly', () => {
    const { rerender } = render(
      <Container padding="sm">
        <div>Content</div>
      </Container>
    );
    let container = screen.getByText('Content').parentElement;
    expect(container).toHaveClass('px-4');

    rerender(
      <Container padding="lg">
        <div>Content</div>
      </Container>
    );
    container = screen.getByText('Content').parentElement;
    expect(container).toHaveClass('px-8');
  });
});

describe('Grid', () => {
  it('renders with default props', () => {
    render(
      <Grid>
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>
    );
    const grid = screen.getByText('Item 1').parentElement;
    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('grid-cols-1');
  });

  it('applies responsive column classes', () => {
    render(
      <Grid
        cols={{
          sm: 2,
          md: 3,
          lg: 4,
        }}
      >
        <div>Item</div>
      </Grid>
    );
    const grid = screen.getByText('Item').parentElement;
    expect(grid).toHaveClass('sm:grid-cols-2');
    expect(grid).toHaveClass('md:grid-cols-3');
    expect(grid).toHaveClass('lg:grid-cols-4');
  });

  it('applies gap classes correctly', () => {
    render(
      <Grid gap="lg" rowGap="sm" colGap="md">
        <div>Item</div>
      </Grid>
    );
    const grid = screen.getByText('Item').parentElement;
    expect(grid).toHaveClass('gap-8');
    expect(grid).toHaveClass('gap-y-4');
    expect(grid).toHaveClass('gap-x-6');
  });
});

describe('Stack', () => {
  it('renders with default props', () => {
    render(
      <Stack>
        <div>Item 1</div>
        <div>Item 2</div>
      </Stack>
    );
    const stack = screen.getByText('Item 1').parentElement;
    expect(stack).toHaveClass('flex');
    expect(stack).toHaveClass('flex-col');
    expect(stack).toHaveClass('space-y-6');
    expect(stack).toHaveClass('items-stretch');
  });

  it('applies gap classes correctly', () => {
    const { rerender } = render(
      <Stack gap="xs">
        <div>Item</div>
      </Stack>
    );
    let stack = screen.getByText('Item').parentElement;
    expect(stack).toHaveClass('space-y-2');

    rerender(
      <Stack gap="xl">
        <div>Item</div>
      </Stack>
    );
    stack = screen.getByText('Item').parentElement;
    expect(stack).toHaveClass('space-y-12');
  });

  it('applies alignment classes correctly', () => {
    render(
      <Stack align="center">
        <div>Item</div>
      </Stack>
    );
    const stack = screen.getByText('Item').parentElement;
    expect(stack).toHaveClass('items-center');
  });

  it('applies dividers when specified', () => {
    render(
      <Stack dividers>
        <div>Item</div>
      </Stack>
    );
    const stack = screen.getByText('Item').parentElement;
    expect(stack).toHaveClass('divide-y');
    expect(stack).toHaveClass('divide-secondary-200');
  });
}); 