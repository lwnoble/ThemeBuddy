import React from 'react';
import { HelpCircle } from 'lucide-react';
import Slider from 'rc-slider';
import { rgbToHsl, hslToRgb, hexToRgb, rgbToHex } from '../../utils/colors';
import 'rc-slider/assets/index.css';

interface ColorSettings {
  numberOfColors: number;
}

interface ColorPaletteSettingsProps {
  settings: ColorSettings;
  onSettingsChange: (settings: Partial<ColorSettings>) => void;
}

const ColorPaletteSettings: React.FC<ColorPaletteSettingsProps> = ({
  settings,
  onSettingsChange
}) => {
  return (
    <div className="settings mb-8 bg-white rounded-lg shadow-md p-4">
      <div className="space-y-6">
        {/* Number of Colors */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-small flex items-center">
              Number of Colors
              <span 
                className="ml-2 text-gray-500 cursor-help" 
                title="Choose how many distinct colors are extracted from the image"
              >
                <HelpCircle className="w-4 h-4" />
              </span>
            </label>
          </div>
          <input
            type="range"
            min={3}
            max={10}
            value={settings.numberOfColors}
            onChange={(e) => onSettingsChange({ 
              numberOfColors: parseInt(e.target.value)
            })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>3</span>
            <span>{settings.numberOfColors}</span>
            <span>10</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteSettings;