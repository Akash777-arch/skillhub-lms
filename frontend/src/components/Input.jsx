import React, { forwardRef } from 'react';

export const Input = forwardRef(({ 
  label, 
  error, 
  disabled, 
  id, 
  className = '', 
  ...props 
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        disabled={disabled}
        className={`
          w-full px-4 py-2.5 bg-slate-900 border rounded-lg text-text-primary placeholder:text-text-muted transition-colors
          focus:outline-none focus:ring-2 focus:border-transparent
          ${error 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-slate-700 focus:ring-violet-500'}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-900/50' : ''}
        `}
        {...props}
      />
      {error && (
        <span className="text-sm text-red-400 mt-1">{error}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
