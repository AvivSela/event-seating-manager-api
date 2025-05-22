import React from 'react';
import { cn } from '../../utils/cn';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  indeterminate?: boolean;
  label?: string;
  error?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, indeterminate, label, error, ...props }, ref) => {
    const checkboxRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate ?? false;
      }
    }, [indeterminate]);

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            ref={(element) => {
              checkboxRef.current = element;
              if (typeof ref === 'function') {
                ref(element);
              } else if (ref) {
                ref.current = element;
              }
            }}
            className={cn(
              'h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500',
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

Checkbox.displayName = 'Checkbox';

export { Checkbox }; 