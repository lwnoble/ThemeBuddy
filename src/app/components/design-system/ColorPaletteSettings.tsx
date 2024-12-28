import React from 'react';
import { HelpCircle } from 'lucide-react';
import { ColorSettings } from '../../utils/colors';

interface ColorPaletteSettingsProps {
  settings: ColorSettings;
  onSettingsChange: (settings: Partial<ColorSettings>) => void;
}

const ColorPaletteSettings: React.FC<ColorPaletteSettingsProps> = ({ 
  settings, 
  onSettingsChange 
}) => {
  return (
    <div className="mb-8 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Color Palette Settings</h2>
      
      <div className="space-y-6">
        {/* Number of Colors */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-lg font-medium flex items-center">
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
            min="3"
            max="10"
            value={settings.numberOfColors}
            onChange={(e) => onSettingsChange({ 
              numberOfColors: parseInt(e.target.value) 
            })}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>3</span>
            <span>{settings.numberOfColors}</span>
            <span>10</span>
          </div>
        </div>

        {/* Number of Shades */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-lg font-medium flex items-center">
              Number of Shades
              <span 
                className="ml-2 text-gray-500 cursor-help" 
                title="Choose how many shades are generated for each color"
              >
                <HelpCircle className="w-4 h-4" />
              </span>
            </label>
          </div>
          <input
            type="range"
            min="3"
            max="10"
            value={settings.numberOfShades}
            onChange={(e) => onSettingsChange({ 
              numberOfShades: parseInt(e.target.value) 
            })}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>3</span>
            <span>{settings.numberOfShades}</span>
            <span>10</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteSettings;