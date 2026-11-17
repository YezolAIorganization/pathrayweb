import React from 'react';
import type { SurfaceMode } from '../../lib/useSurfaceMode';

/* --- GLASS / SURFACE CARD --- */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  surface?: SurfaceMode;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  surface = 'dark',
  elevated = false,
  className = '',
  children,
  ...props
}) => {
  const surfaceStyles: Record<SurfaceMode, string> = {
    dark: `glass-dark text-white ${elevated ? 'shadow-glass' : ''}`,
    light: `bg-white border border-navy-100 text-midnight ${elevated ? 'shadow-card' : ''}`,
    lite: `glass-lite border border-navy-700 text-white`,
  };

  return (
    <div
      className={`rounded-[20px] p-5 transition-colors duration-200 ${surfaceStyles[surface]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/* --- BUTTON --- */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-sora font-semibold rounded-[12px] transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants = {
    primary: 'bg-cyan text-midnight hover:bg-cyan-bright shadow-sm',
    secondary: 'bg-navy text-white border border-navy-500 hover:bg-navy-700',
    ghost: 'bg-transparent text-navy-300 hover:text-white hover:bg-white/5',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-2 min-h-[36px]',
    md: 'text-sm px-5 py-3 min-h-[44px]',
    lg: 'text-base px-6 py-3.5 min-h-[52px]',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

/* --- STATUS / FUNDING BADGE --- */
interface BadgeProps {
  tone?: 'cyan' | 'success' | 'warning' | 'error' | 'neutral';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ tone = 'neutral', children }) => {
  const tones = {
    cyan: 'bg-cyan/15 text-cyan-bright border-cyan/30',
    success: 'bg-emerald-500/15 text-success-dark border-emerald-500/30',
    warning: 'bg-amber-500/15 text-warning-dark border-amber-500/30',
    error: 'bg-red-500/15 text-error-dark border-red-500/30',
    neutral: 'bg-white/10 text-navy-100 border-white/15',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

/* --- SELECTABLE CHIP (For Quick Check) --- */
interface ChipProps {
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const ChoiceChip: React.FC<ChipProps> = ({ selected = false, onClick, children }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-full text-sm font-medium border text-left transition-all cursor-pointer min-h-11 ${
        selected
          ? 'bg-cyan text-midnight border-cyan font-semibold shadow-sm'
          : 'bg-white/5 text-navy-100 border-white/15 hover:border-cyan/50 hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );
};

/* --- TEXT INPUT --- */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextInput: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-medium text-navy-300 uppercase tracking-wider">
        {label}
      </label>
      <input
        className={`w-full rounded-[12px] bg-navy-900/90 border px-4 py-3 text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-cyan min-h-[46px] ${
          error ? 'border-error-dark' : 'border-white/15'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-error-dark">{error}</span>}
    </div>
  );
};