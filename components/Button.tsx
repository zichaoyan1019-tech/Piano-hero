import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'locked';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = 'rounded-full font-bold transition-all active:scale-95';
  const variants = {
    primary: 'bg-yellow-400 text-black hover:bg-yellow-300',
    secondary: 'bg-white text-black hover:bg-gray-100',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    locked: 'bg-gray-400 text-gray-200 cursor-not-allowed'
  };
  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-6 py-2 text-base',
    lg: 'px-8 py-3 text-xl'
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
