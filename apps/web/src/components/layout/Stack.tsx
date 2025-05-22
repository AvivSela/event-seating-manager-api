import React from 'react';
import { cn } from '../../utils/cn';

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  dividers?: boolean;
}

const gapClasses = {
  none: 'space-y-0',
  xs: 'space-y-2',
  sm: 'space-y-4',
  md: 'space-y-6',
  lg: 'space-y-8',
  xl: 'space-y-12',
};

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

export function Stack({
  children,
  className,
  gap = 'md',
  align = 'stretch',
  dividers = false,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col',
        gapClasses[gap],
        alignClasses[align],
        dividers && [
          'divide-y divide-secondary-200',
          'dark:divide-secondary-700',
        ],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
} 