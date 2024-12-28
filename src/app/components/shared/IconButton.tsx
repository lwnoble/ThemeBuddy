import React from 'react';

interface IconButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({ 
  icon: Icon, 
  label, 
  onClick, 
  className = '' 
}) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-full hover:bg-gray-100 ${className}`}
      aria-label={label}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
};