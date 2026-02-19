
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', onClick, className = '', style }) => {
  const baseStyles = "px-8 py-3 rounded-full font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg";
  
  const variants = {
    primary: "bg-white text-black hover:bg-opacity-90",
    secondary: "bg-transparent border-2 border-white text-white hover:bg-white hover:text-black",
    outline: "border-2 border-white/20 text-white backdrop-blur-md hover:bg-white/10"
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={style}
    >
      {children}
    </button>
  );
};

export default Button;
