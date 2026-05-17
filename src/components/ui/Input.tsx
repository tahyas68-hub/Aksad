import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
        <input
          ref={ref}
          className={cn(
            "flex w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 transition-colors",
            "focus-visible:outline-none focus-visible:border-indigo-500 dark:focus-visible:border-indigo-400 focus-visible:bg-white dark:focus-visible:bg-gray-950 focus-visible:ring-4 focus-visible:ring-indigo-500/10 dark:focus-visible:ring-indigo-400/10",
            error && "border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/10",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-rose-500">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
