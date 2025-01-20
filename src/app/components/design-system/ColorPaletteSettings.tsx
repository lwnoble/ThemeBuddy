// ColorPaletteSettings.tsx
import React from 'react';
import { HelpCircle } from 'lucide-react';

interface ColorPaletteSettingsProps {
  deltaE: number;
  onSettingsChange: (settings: {
    deltaE: number;
  }) => void;
}

const ColorPaletteSettings: React.FC<ColorPaletteSettingsProps> = ({
  deltaE,
  onSettingsChange
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium flex items-center gap-2">
            Color Difference (ΔE)
            <HelpCircle className="w-4 h-4 text-gray-400" />
          </label>
          <span className="text-sm text-gray-500">{deltaE}</span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={deltaE}
          onChange={(e) => onSettingsChange({ deltaE: Number(e.target.value) })}
          className="w-full"
        />
        <p className="text-xs text-gray-500">
          Higher values will result in more distinct colors being selected
        </p>
      </div>
    </div>
  );
};

export default ColorPaletteSettings;