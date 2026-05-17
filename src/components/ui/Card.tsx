import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, children, onClick, ...props }: React.HTMLAttributes<HTMLDivElement> & { className?: string, children?: React.ReactNode, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800", 
        onClick && "cursor-pointer active:scale-[0.98] transition-transform",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
