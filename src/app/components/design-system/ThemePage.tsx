import React, { useState, useEffect } from 'react';
import { useColors } from '../../../context/ColorContext';
import { useColorHarmonies } from '../../hooks/useColorHarmonies';

interface ThemePageProps {}

// Theme interfaces
interface ColorSet {
  primary: string;
  secondary: string;
  tertiary: string;
}

interface Theme {
  name: string;
  colors: ColorSet;
  type: string;
}

const ThemePage: React.FC<ThemePageProps> = () => {
  const { colors } = useColors();
  const harmonies = useColorHarmonies(colors);
  
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

  useEffect(() => {
    if (harmonies.analogous || harmonies.monochromatic || harmonies.triadic || harmonies.splitComplementary) {
      const newThemes: Theme[] = [];

      if (harmonies.analogous) {
        newThemes.push({
          name: 'Modern',
          colors: harmonies.analogous,
          type: 'analogous'
        });
      }

      if (harmonies.monochromatic) {
        newThemes.push({
          name: 'Professional',
          colors: harmonies.monochromatic,
          type: 'monochromatic'
        });
      }

      if (harmonies.triadic) {
        newThemes.push({
          name: 'Vibrant',
          colors: harmonies.triadic,
          type: 'triadic'
        });
      }

      if (harmonies.splitComplementary) {
        newThemes.push({
          name: 'Dynamic',
          colors: harmonies.splitComplementary,
          type: 'split-complementary'
        });
      }

      setThemes(newThemes);
      if (!selectedTheme && newThemes.length > 0) {
        setSelectedTheme(newThemes[0]);
      }
    }
  }, [harmonies]);

  const renderColorSwatch = (color: string, label: string) => (
    <div className="space-y-2">
      <div 
        className="w-full h-24 rounded-lg shadow-sm cursor-pointer transition-transform hover:scale-105"
        style={{ backgroundColor: color }}
        onClick={() => navigator.clipboard.writeText(color)}
      />
      <div className="text-center">
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-gray-500">{color}</div>
      </div>
    </div>
  );

  const renderThemeCard = (theme: Theme) => (
    <div 
      key={theme.name}
      className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
        selectedTheme?.name === theme.name 
          ? 'border-purple-500 bg-purple-50'
          : 'border-gray-200 hover:border-purple-200'
      }`}
      onClick={() => setSelectedTheme(theme)}
    >
      <h3 className="text-lg font-semibold mb-4">{theme.name}</h3>
      <div className="grid grid-cols-3 gap-4">
        {renderColorSwatch(theme.colors.primary, '')}
        {renderColorSwatch(theme.colors.secondary, '')}
        {renderColorSwatch(theme.colors.tertiary, '')}
      </div>
      <p className="mt-4 text-sm text-gray-600 capitalize">{theme.type.replace('-', ' ')} Harmony</p>
    </div>
  );

  const renderThemeDetails = (theme: Theme) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{theme.name} Theme</h2>
        <span className="text-sm text-gray-600 capitalize">{theme.type.replace('-', ' ')} Harmony</span>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Primary</h3>
            <div 
              className="w-full h-32 rounded-lg shadow-md cursor-pointer transition-transform hover:scale-105"
              style={{ backgroundColor: theme.colors.primary }}
              onClick={() => navigator.clipboard.writeText(theme.colors.primary)}
            />
            <div className="text-sm text-gray-600">{theme.colors.primary}</div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Usage</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Main brand color</li>
              <li>• Primary buttons</li>
              <li>• Key UI elements</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Secondary</h3>
            <div 
              className="w-full h-32 rounded-lg shadow-md cursor-pointer transition-transform hover:scale-105"
              style={{ backgroundColor: theme.colors.secondary }}
              onClick={() => navigator.clipboard.writeText(theme.colors.secondary)}
            />
            <div className="text-sm text-gray-600">{theme.colors.secondary}</div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Usage</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Accent elements</li>
              <li>• Secondary buttons</li>
              <li>• Highlights</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Tertiary</h3>
            <div 
              className="w-full h-32 rounded-lg shadow-md cursor-pointer transition-transform hover:scale-105"
              style={{ backgroundColor: theme.colors.tertiary }}
              onClick={() => navigator.clipboard.writeText(theme.colors.tertiary)}
            />
            <div className="text-sm text-gray-600">{theme.colors.tertiary}</div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Usage</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Supporting elements</li>
              <li>• Backgrounds</li>
              <li>• Decorative elements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-12">
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Theme Options</h2>
        <div className="grid grid-cols-2 gap-6">
          {themes.map(theme => renderThemeCard(theme))}
        </div>
      </section>

      {selectedTheme && (
        <section className="space-y-6">
          {renderThemeDetails(selectedTheme)}
        </section>
      )}
    </div>
  );
};

export default ThemePage;