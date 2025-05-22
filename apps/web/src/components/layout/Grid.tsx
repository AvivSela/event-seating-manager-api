import React from 'react';
import { cn } from '../../utils/cn';

type Cols = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type ResponsiveCols = Cols | { sm?: Cols; md?: Cols; lg?: Cols; xl?: Cols };

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: ResponsiveCols;
  gap?: 'none' | 'sm' | 'md' | 'lg';
  rowGap?: 'none' | 'sm' | 'md' | 'lg';
  colGap?: 'none' | 'sm' | 'md' | 'lg';
}

const gapClasses = {
  none: 'gap-0',
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
};

const rowGapClasses = {
  none: 'gap-y-0',
  sm: 'gap-y-4',
  md: 'gap-y-6',
  lg: 'gap-y-8',
};

const colGapClasses = {
  none: 'gap-x-0',
  sm: 'gap-x-4',
  md: 'gap-x-6',
  lg: 'gap-x-8',
};

function getColsClass(cols: Cols, breakpoint: string = '') {
  const prefix = breakpoint ? `${breakpoint}:` : '';
  return `${prefix}grid-cols-${cols}`;
}

function getResponsiveCols(cols: ResponsiveCols) {
  if (typeof cols === 'number') {
    return getColsClass(cols);
  }

  return cn(
    cols.sm && getColsClass(cols.sm, 'sm'),
    cols.md && getColsClass(cols.md, 'md'),
    cols.lg && getColsClass(cols.lg, 'lg'),
    cols.xl && getColsClass(cols.xl, 'xl')
  );
}

export function Grid({
  children,
  className,
  cols = 1,
  gap,
  rowGap,
  colGap,
  ...props
}: GridProps) {
  return (
    <div
      className={cn(
        'grid',
        getResponsiveCols(cols),
        gap && gapClasses[gap],
        rowGap && rowGapClasses[rowGap],
        colGap && colGapClasses[colGap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
} 