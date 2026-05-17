import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full relative">
        {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
        <div className="relative w-full">
            <select
            ref={ref}
            className={cn(
                "flex w-full appearance-none rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 px-4 py-3 pr-10 text-sm text-gray-900 dark:text-gray-100 transition-colors",
                "focus-visible:outline-none focus-visible:border-indigo-500 dark:focus-visible:border-indigo-400 focus-visible:bg-white dark:focus-visible:bg-gray-950 focus-visible:ring-4 focus-visible:ring-indigo-500/10 dark:focus-visible:ring-indigo-400/10",
                error && "border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/10",
                "disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
            >
            {children}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        {error && <span className="text-xs text-rose-500">{error}</span>}
      </div>
    );
  }
);
Select.displayName = "Select";
