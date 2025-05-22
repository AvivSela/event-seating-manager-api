import React from 'react';
import { cn } from '../../utils/cn';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="radio"
            ref={ref}
            className={cn(
              'h-4 w-4 border-secondary-300 text-primary-600 focus:ring-primary-500',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-danger-300',
              className
            )}
            {...props}
          />
        </div>
        {(label || error) && (
          <div className="ml-2">
            {label && (
              <label
                htmlFor={props.id}
                className={cn(
                  'text-sm font-medium text-secondary-900',
                  props.disabled && 'opacity-50'
                )}
              >
                {label}
              </label>
            )}
            {error && (
              <p className="mt-1 text-xs text-danger-500">{error}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

export { Radio }; 