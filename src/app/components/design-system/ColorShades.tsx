import React, { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { generateShades, ColorSettings, ColorResult } from '../../utils/colors';

interface ColorShadesProps {
  colors: string[];
  settings: ColorSettings;
  onSettingsChange: (settings: Partial<ColorSettings>) => void;
}

const ColorShades: React.FC<ColorShadesProps> = ({ colors, settings, onSettingsChange }) => {
  const [activeTab, setActiveTab] = useState<'AA-light' | 'AA-dark' | 'AAA-light' | 'AAA-dark'>('AA-light');
  const [showShadeSettings, setShowShadeSettings] = useState(false);

  const sortShades = (shades: ColorResult[]) => {
    return [...shades].sort((a, b) => {
      const getLightness = (color: string) => {
        const rgb = parseInt(color.slice(1), 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = (rgb >> 0) & 0xff;
        return (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
      };
      return getLightness(b.color) - getLightness(a.color);
    });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        {['AA-light', 'AA-dark', 'AAA-light', 'AAA-dark'].map((tab) => (
          <button
            key={tab}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent hover:text-gray-600'
            }`}
            onClick={() => setActiveTab(tab as typeof activeTab)}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Shade Settings */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Color Shades</h2>
        <button
          onClick={() => setShowShadeSettings(!showShadeSettings)}
          className={`p-2 rounded-lg transition-colors ${
            showShadeSettings
              ? 'bg-purple-100 text-purple-600'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Settings2 className="w-6 h-6" />
        </button>
      </div>

      {/* Color Shades */}
      <div className="space-y-6">
        {colors.map((color, colorIndex) => (
          <div key={colorIndex} className="space-y-6">
            <h3 className="text-lg font-semibold">Color {colorIndex + 1}</h3>
            <div className="grid grid-cols-10 gap-2">
              {sortShades(generateShades(
                color, 
                settings, 
                activeTab.includes('light') ? 'light' : 'dark',
                activeTab.includes('AA') ? 4.5 : 7.1
              )).map((shade, shadeIndex) => (
                <div
                  key={`${colorIndex}-${shadeIndex}`}
                  className="w-8 h-8 rounded flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                  style={{
                    backgroundColor: shade.color,
                    color: shade.textColor
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(shade.color);
                  }}
                >
                  Aa
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorShades;