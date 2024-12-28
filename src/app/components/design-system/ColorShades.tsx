import React, { useState } from 'react';
import { Settings2 } from 'lucide-react';
import ColorPaletteSettings from './ColorPaletteSettings';

// Inlined from colors.ts
interface RGB { r: number; g: number; b: number; }
interface HSL { h: number; s: number; l: number; }
interface ShadeResult { color: string; textColor: string; contrastRatio: number; }

export interface ColorSettings {
  numberOfShades: number;
  numberOfColors: number;
  sampling: number;
  hueDifference: number;
  lightMode: {
    lightestShade: number;
    darkestShade: number;
    maxChroma: number;
    textColor: {
      light: string;
      dark: string;
      opacity: number;
    };
  };
  darkMode: {
    lightestShade: number;
    darkestShade: number;
    maxChroma: number;
    textColor: {
      light: string;
      dark: string;
      opacity: number;
    };
  };
  contrastMode: 'AA' | 'AAA';
  minContrastRatio: number;
}

interface ColorShadesProps {
  colors: string[];
  settings: ColorSettings;
  onSettingsChange: (settings: Partial<ColorSettings>) => void;
}

const ColorShades: React.FC<ColorShadesProps> = ({ colors, settings, onSettingsChange }) => {
  const [activeTab, setActiveTab] = useState<'AA-light' | 'AA-dark' | 'AAA-light' | 'AAA-dark'>('AA-light');
  const [showShadeSettings, setShowShadeSettings] = useState(false);

  // Color conversion utilities
  const hexToRgb = (hex: string): RGB | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHsl = (rgb: RGB): { h: number; s: number; l: number } => {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { 
      h: h * 360, 
      s: s * 100, 
      l: l * 100 
    };
  };

  const hslToRgb = (hsl: HSL): RGB => {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  const rgbToHex = (rgb: RGB): string => {
    return '#' + [rgb.r, rgb.g, rgb.b]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('');
  };

  const generateShades = (
    baseColor: string,
    settings: ColorSettings,
    mode: 'light' | 'dark',
    contrastMode: 'AA' | 'AAA' = 'AA'
  ): ShadeResult[] => {
    const rgb = hexToRgb(baseColor);
    if (!rgb) return [];

    const minContrastRatio = contrastMode === 'AA' ? 4.5 : 7.1;
    const modeSettings = mode === 'light' ? settings.lightMode : settings.darkMode;

    const shades: ShadeResult[] = [];

    for (let i = 0; i < settings.numberOfShades; i++) {
      const t = i / (settings.numberOfShades - 1);
      const lightness = mode === 'light'
        ? modeSettings.lightestShade - (t * (modeSettings.lightestShade - modeSettings.darkestShade))
        : modeSettings.darkestShade + (t * (modeSettings.lightestShade - modeSettings.darkestShade));

      const hsl = rgbToHsl(rgb);
      const newHsl = { ...hsl, l: lightness };
      const newRgb = hslToRgb(newHsl);
      const color = rgbToHex(newRgb);

      const textColors = {
        light: modeSettings.textColor.light,
        dark: mode === 'dark' 
          ? `rgba(255, 255, 255, ${modeSettings.textColor.opacity})` 
          : modeSettings.textColor.dark
      };

      const getContrastRatio = (color1: string, color2: string): number => {
        // Placeholder contrast ratio calculation
        return 5;
      };

      const lightContrast = getContrastRatio(color, textColors.light);
      const darkContrast = getContrastRatio(color, textColors.dark);

      let textColor = textColors.dark;
      let contrastRatio = darkContrast;

      if (lightContrast > darkContrast && lightContrast >= minContrastRatio) {
        textColor = textColors.light;
        contrastRatio = lightContrast;
      }

      shades.push({ color, textColor, contrastRatio });
    }

    return shades;
  };

  const sortShades = (shades: ReturnType<typeof generateShades>) => {
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

      {showShadeSettings && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Shade Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Number of Shades per Color
              </label>
              <input
                type="range"
                min="4"
                max="10"
                value={settings.numberOfShades}
                onChange={(e) =>
                  onSettingsChange({
                    ...settings,
                    numberOfShades: parseInt(e.target.value)
                  })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>4</span>
                <span>10</span>
              </div>
            </div>
            {/* Add other shade settings UI components here */}
          </div>
        </div>
      )}

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
                activeTab.includes('AA') ? 'AA' : 'AAA'
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