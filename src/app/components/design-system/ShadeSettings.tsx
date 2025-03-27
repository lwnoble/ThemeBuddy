import React from 'react';
import { HelpCircle } from 'lucide-react';
import { rgbToHsl, hslToRgb, hexToRgb, rgbToHex } from '../../utils/colors';

export interface ShadeSettingsProps {
  numberOfShades: number;
  maxLightnessLight: number;
  maxLightnessDark: number;
  maxDarknessLight: number;
  maxDarknessDark: number;
  maxChromaLight: number;
  maxChromaDark: number;
  lightModeTextColor: {
    light: string;
    dark: string;
    lightOpacity: number;
    darkOpacity: number;
  };
  darkModeTextColor: {
    light: string;
    dark: string;
    lightOpacity: number;
    darkOpacity: number;
  };
  onSettingsChange: (settings: Partial<ShadeSettingsProps>) => void;
}

const ShadeSettings: React.FC<ShadeSettingsProps> = ({
  numberOfShades,
  maxLightnessLight,
  maxLightnessDark,
  maxDarknessLight,
  maxDarknessDark,
  maxChromaLight,
  maxChromaDark,
  lightModeTextColor,
  darkModeTextColor,
  onSettingsChange
}) => {
  const renderSetting = (
    title: string,
    lightValue: number,
    darkValue: number,
    lightOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    darkOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    lightMin: number,
    lightMax: number,
    darkMin: number,
    darkMax: number
  ) => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label className="text-lg font-medium">{title}</label>
        <HelpCircle className="w-5 h-5 text-gray-700" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Light mode:</label>
          <input
            type="number"
            value={lightValue}
            onChange={lightOnChange}
            className="w-full p-2 border border-gray-300 rounded"
            min={lightMin}
            max={lightMax}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Dark mode:</label>
          <input
            type="number"
            value={darkValue}
            onChange={darkOnChange}
            className="w-full p-2 border border-gray-300 rounded"
            min={darkMin}
            max={darkMax}
          />
        </div>
      </div>
    </div>
  );

  const renderColorInput = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    isLightText: boolean
  ) => {
    const enforceConstraint = (color: string) => {
      const rgb = hexToRgb(color);
      if (!rgb) return color;
      const hsl = rgbToHsl(rgb);
      if (isLightText && hsl.l < 90) {
        hsl.l = 90;
      } else if (!isLightText && hsl.l > 10) {
        hsl.l = 10;
      }
      return rgbToHex(hslToRgb(hsl));
    };

    const handleColorChange = (newColor: string) => {
      const constrainedColor = enforceConstraint(newColor);
      onChange(constrainedColor);
    };
    return (
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1">{label}</label>
        <div className="flex items-center">
          <input
            type="color"
            value={value}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer mr-2"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => handleColorChange(e.target.value)}
            className="flex-1 p-1 border border-gray-300 rounded"
          />
        </div>
      </div>
    );
  };

  const renderOpacityInput = (
    label: string,
    value: number,
    onChange: (value: number) => void,
    isDarkMode: boolean
  ) => {
    const minOpacity = 0.6;
    const maxOpacity = isDarkMode ? 0.7 : 1;

    const handleOpacityChange = (newValue: number) => {
      const constrainedValue = Math.min(Math.max(newValue, minOpacity), maxOpacity);
      onChange(constrainedValue);
    };

    return (
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1">{label}</label>
        <input
          type="range"
          min={60}
          max={isDarkMode ? 70 : 100}
          value={value * 100}
          onChange={(e) => handleOpacityChange(parseInt(e.target.value) / 100)}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
        />
        <div className="text-sm text-gray-600 mt-1">{Math.round(value * 100)}%</div>
      </div>
    );
  };

  return (
    <div className="settings bg-white p-6 rounded-lg shadow-md">

      {renderSetting(
        "Max Lightness",
        maxLightnessLight,
        maxLightnessDark,
        (e) => onSettingsChange({ maxLightnessLight: parseFloat(e.target.value) }),
        (e) => onSettingsChange({ maxLightnessDark: parseFloat(e.target.value) }),
        95,  // min value for light mode
        100, // max value for light mode
        0,   // min value for dark mode
        90   // max value for dark mode
      )}

      {renderSetting(
        "Max Darkness",
        maxDarknessLight,
        maxDarknessDark,
        (e) => onSettingsChange({ maxDarknessLight: parseFloat(e.target.value) }),
        (e) => onSettingsChange({ maxDarknessDark: parseFloat(e.target.value) }),
        5,   // min value for light mode
        50,  // max value for light mode
        0,   // min value for dark mode
        50   // max value for dark mode
      )}

      {renderSetting(
        "Max Chroma",
        maxChromaLight,
        maxChromaDark,
        (e) => onSettingsChange({ maxChromaLight: parseFloat(e.target.value) }),
        (e) => onSettingsChange({ maxChromaDark: parseFloat(e.target.value) }),
        0,   // min value for light mode
        100, // max value for light mode
        0,   // min value for dark mode
        100  // max value for dark mode
      )}

      <div className="mt-8">
        <h3 className="text-md font-semibold mb-4">Text Color Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-regular mb-2">Light Mode</h4>
            {renderColorInput(
              "Light Text Color",
              lightModeTextColor.light,
              (value) => onSettingsChange({
                lightModeTextColor: { ...lightModeTextColor, light: value }
              }),
              true
            )}
            {renderOpacityInput(
              "Light Text Opacity",
              lightModeTextColor.lightOpacity,
              (value) => onSettingsChange({
                lightModeTextColor: { ...lightModeTextColor, lightOpacity: value }
              }),
              false
            )}
            {renderColorInput(
              "Dark Text Color",
              lightModeTextColor.dark,
              (value) => onSettingsChange({
                lightModeTextColor: { ...lightModeTextColor, dark: value }
              }),
              false
            )}
            {renderOpacityInput(
              "Dark Text Opacity",
              lightModeTextColor.darkOpacity,
              (value) => onSettingsChange({
                lightModeTextColor: { ...lightModeTextColor, darkOpacity: value }
              }),
              false
            )}
          </div>
          <div>
            <h4 className="text-md font-medium mb-2">Dark Mode</h4>
            {renderColorInput(
              "Light Text Color",
              darkModeTextColor.light,
              (value) => onSettingsChange({
                darkModeTextColor: { ...darkModeTextColor, light: value }
              }),
              true
            )}
            {renderOpacityInput(
              "Light Text Opacity",
              darkModeTextColor.lightOpacity,
              (value) => onSettingsChange({
                darkModeTextColor: { ...darkModeTextColor, lightOpacity: value }
              }),
              true
            )}
            {renderColorInput(
              "Dark Text Color",
              darkModeTextColor.dark,
              (value) => onSettingsChange({
                darkModeTextColor: { ...darkModeTextColor, dark: value }
              }),
              false
            )}
            {renderOpacityInput(
              "Dark Text Opacity",
              darkModeTextColor.darkOpacity,
              (value) => onSettingsChange({
                darkModeTextColor: { ...darkModeTextColor, darkOpacity: value }
              }),
              true
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShadeSettings;