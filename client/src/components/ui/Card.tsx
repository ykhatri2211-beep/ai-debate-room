import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: 'cyan' | 'indigo' | 'violet' | 'none';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glow = 'none',
  interactive = false,
  ...props
}) => {
  const glowStyles = {
    none: '',
    cyan: 'hover:shadow-glow-cyan hover:border-cyan-500/40',
    indigo: 'hover:shadow-glow-indigo hover:border-indigo-500/40',
    violet: 'hover:shadow-glow-violet hover:border-violet-500/40',
  };

  const interactiveStyles = interactive
    ? 'cursor-pointer transition-all duration-300 hover:-translate-y-0.5'
    : '';

  return (
    <div
      className={`glass-panel rounded-2xl p-5 border border-slate-800/80 shadow-card-subtle ${glowStyles[glow]} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
