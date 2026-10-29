import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'cyan' | 'violet';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-950 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-indigo focus:ring-indigo-500 border border-indigo-400/30',
    cyan:
      'bg-cyan-600 hover:bg-cyan-500 text-white shadow-glow-cyan focus:ring-cyan-500 border border-cyan-400/30',
    violet:
      'bg-violet-600 hover:bg-violet-500 text-white shadow-glow-violet focus:ring-violet-500 border border-violet-400/30',
    secondary:
      'bg-navy-800 hover:bg-navy-750 text-slate-200 border border-slate-700/60 focus:ring-slate-500 hover:border-slate-600',
    outline:
      'bg-transparent hover:bg-white/5 text-slate-300 border border-slate-700 hover:text-white hover:border-slate-500 focus:ring-indigo-500',
    danger:
      'bg-rose-600/90 hover:bg-rose-500 text-white shadow-md focus:ring-rose-500 border border-rose-400/30',
    ghost:
      'bg-transparent hover:bg-white/5 text-slate-400 hover:text-slate-200 border-none focus:ring-slate-500',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};
