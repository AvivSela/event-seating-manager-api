import React from 'react';
import { cn } from '../../utils/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  label?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, label, error, size = 'md', fullWidth, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 text-sm',
      md: 'h-10 text-base',
      lg: 'h-12 text-lg',
    };

    return (
      <div className={cn('flex flex-col', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={props.id}
            className={cn(
              'mb-1.5 text-sm font-medium text-secondary-900',
              props.disabled && 'opacity-50'
            )}
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'rounded-md border border-secondary-300 bg-white px-3 py-2',
            'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
            'disabled:cursor-not-allowed disabled:bg-secondary-50 disabled:opacity-50',
            error && 'border-danger-300 focus:border-danger-500 focus:ring-danger-500',
            sizeClasses[size],
            fullWidth && 'w-full',
            className
          )}
          {...props}
        >
          {props.placeholder && (
            <option value="" disabled>
              {props.placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-xs text-danger-500">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select }; 