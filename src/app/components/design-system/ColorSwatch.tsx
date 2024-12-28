import React from 'react';

interface ColorSwatchProps {
  color: string;
  size?: 'small' | 'large';
  showText?: boolean;
  textColor?: string;
  contrastRatio?: number;
  onClick?: () => void;
  onDoubleClick?: () => void;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  size = 'small',
  showText = false,
  textColor,
  contrastRatio,
  onClick,
  onDoubleClick
}) => {
  return (
    <div
      className={`
        rounded-lg cursor-pointer transition-transform hover:scale-105 
        ${size === 'large' ? 'w-16 h-16' : 'w-10 h-10'}
      `}
      style={{ backgroundColor: color }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {showText && textColor && (
        <div className="h-full flex flex-col items-center justify-center">
          <span style={{ color: textColor }}>Aa</span>
          {contrastRatio && (
            <span 
              className="text-xs mt-1" 
              style={{ color: textColor }}
            >
              {contrastRatio.toFixed(1)}:1
            </span>
          )}
        </div>
      )}
    </div>
  );
};