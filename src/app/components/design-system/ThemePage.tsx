import React, { useState, useEffect } from 'react';
import { useColors } from '../../../context/ColorContext';
import { useColorHarmonies } from '../../hooks/useColorHarmonies';
import { ChevronLeft, Home, Plus } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';
import CollapsiblePanel from './CollapsiblePanel';
import ColorModal from './ColorModal';
import { generateShades, ColorSettings } from '../../utils/colors';
import type { ColorResult } from '../../utils/colors';
import { ColorData } from '../../utils/color-harmonies'; // Adjust the import path as needed

interface ColorSet {
  primary: string;
  secondary: string;
  tertiary: string;
}

interface Theme {
  name: string;
  colors: ColorSet;
  type: 'analogous' | 'monochromatic' | 'triadic' | 'tetradic' | 'square' | 'diadic' | 'achromatic' | 'split-complementary' | 'custom';
}

type ThemeAnalysisReason = 'duplicate' | 'redundant' | 'valid';
type SurfaceStyle = 'light-tonal' | 'colorful-tonal' | 'dark-tonal' | 'light-professional' | 'grey-professional' | 'dark-professional' | 'light-glow' | 'dark-glow';
type ButtonShape = 'gently-rounded' | 'amply-rounded' | 'boldly-rounded' | 'square';
type ComponentEffect = 'none' | 'bevel' | 'ridged';

const harmonyTypes = [
  { key: 'analogous', name: 'Analogous' },
  { key: 'monochromatic', name: 'Monochromatic' },
  { key: 'triadic', name: 'Triadic' },
  { key: 'tetradic', name: 'Tetradic' },
  { key: 'square', name: 'Square' },
  { key: 'diadic', name: 'Diadic' },
  { key: 'achromatic', name: 'Achromatic' },
  { key: 'splitComplementary', name: 'Split Complementary' },
  { key: 'custom', name: 'Custom' }
] as const;

const ThemePage: React.FC = () => {
  const { colors, setColors } = useColors();
  const [customMode, setCustomMode] = useState(false);
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [customTheme, setCustomTheme] = useState<Theme | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [activeTheme, setActiveTheme] = useState<Theme | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [themeAnalysis, setThemeAnalysis] = useState<Array<{
    theme: Theme;
    isValid: boolean;
    reason: ThemeAnalysisReason;
  }>>([]);

  // Style states
  const [surfaceStyle, setSurfaceStyle] = useState<SurfaceStyle>('light-tonal');
  const [buttonShape, setButtonShape] = useState<ButtonShape>('gently-rounded');
  const [componentEffect, setComponentEffect] = useState<ComponentEffect>('none');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [baseColor, setBaseColor] = useState<string>('');
  const [shades, setShades] = useState<ColorResult[]>([]);

// Default color settings for shade generation
const defaultColorSettings: ColorSettings = {
  numberOfShades: 9,
  numberOfColors: 5,
  deltaE: 5, // Adding deltaE property with default value
  lightMode: {
    lightestShade: 98,
    darkestShade: 15,
    maxChroma: 100,
    textColor: {
      light: '#FFFFFF',
      dark: '#000000',
      lightOpacity: 1,
      darkOpacity: 0.8
    }
  },
  darkMode: {
    lightestShade: 85,
    darkestShade: 10,
    maxChroma: 100,
    textColor: {
      light: '#FFFFFF',
      dark: '#000000',
      lightOpacity: 0.9,
      darkOpacity: 0.7
    }
  },
  contrastMode: 'AA',
  minContrastRatio: 4.5
};

const safeColors = colors && colors.length > 0
  ? colors.map(color => 
      typeof color === 'object' && 'baseHex' in color 
        ? (color as ColorData).baseHex 
        : color as string
    )
  : ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];

const arrangedColors = baseColor
  ? [baseColor, ...safeColors.filter(color => color !== baseColor)]
  : safeColors;

const harmonies = useColorHarmonies(arrangedColors);

  // Initialize baseColor
  useEffect(() => {
  if (!baseColor && safeColors.length > 0) {
    setBaseColor(safeColors[0]);
  }
  }, [safeColors, baseColor]);


  // Generate shades when baseColor changes
  useEffect(() => {
    if (baseColor) {
      const generatedShades = generateShades(
        baseColor,
        defaultColorSettings,
        'light',
        4.5 // AA compliance ratio
      );
      console.log('Generated shades:', generatedShades);
      setShades(generatedShades);
    }
  }, [baseColor]);

  // Theme generation effect
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PLUGIN_READY') {
        window.parent.postMessage({
          pluginMessage: { type: 'INIT_PLUGIN' }
        }, '*');
      }
    };

    window.addEventListener('message', handleMessage);

    try {
      let newThemes: Theme[] = [];

      for (const { key, name } of harmonyTypes) {
        const harmonyColors = harmonies[key as keyof typeof harmonies];
        
        if (!harmonyColors) continue;

        const processedColors: ColorSet = {
          primary: harmonies[key as keyof typeof harmonies]?.primary?.baseHex || '#000000',
          secondary: harmonies[key as keyof typeof harmonies]?.secondary?.baseHex || '#000000',
          tertiary: harmonies[key as keyof typeof harmonies]?.tertiary?.baseHex || '#000000'
        };

        newThemes.push({
          name,
          colors: processedColors,
          type: key === 'splitComplementary' ? 'split-complementary' : key
        });
      }

      const checkThemeRedundancy = (themes: Theme[]): Array<{
        theme: Theme;
        isValid: boolean;
        reason: ThemeAnalysisReason;
      }> => {
        const seenSignatures = new Set<string>();
        
        return themes.map(theme => {
          const colorValues = Object.values(theme.colors);
          const uniqueColors = new Set(colorValues);
          const hasInternalDuplicates = uniqueColors.size !== colorValues.length;
          const colorSignature = colorValues.sort().join(',');
          const isRedundant = seenSignatures.has(colorSignature);

          if (!isRedundant) {
            seenSignatures.add(colorSignature);
          }
      
          const isValid = !hasInternalDuplicates && !isRedundant;
      
          return {
            theme,
            isValid,
            reason: hasInternalDuplicates ? 'duplicate' : 
                    isRedundant ? 'redundant' : 'valid'
          };
        });
      };

      const analyzedThemes = checkThemeRedundancy(newThemes);
      setThemes(newThemes);
      setThemeAnalysis(analyzedThemes);

      if (!activeTheme) {
        const validTheme = analyzedThemes.find(({ isValid }) => isValid);
        if (validTheme) {
          setActiveTheme(validTheme.theme);
          setSelectedTheme(validTheme.theme);
        }
      }
    } catch (error) {
      console.error('Error generating themes:', error);
      setThemes([]);
      setSelectedTheme(null);
      setThemeAnalysis([]);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [harmonies, customTheme]);

  const { setCurrentRoute } = useNavigation();

  const handleBack = () => {
    setCurrentRoute({
      id: 'home',
      title: 'Design System',
      path: '/',
      icon: Home
    });
  };

  const handleBaseColorSelect = (color: string) => {
    setBaseColor(color);
  };

  const handleButtonShapeChange = (shape: ButtonShape) => {
    const borderRadiusMap: Record<ButtonShape, number> = {
      'gently-rounded': 8,
      'amply-rounded': 16,
      'boldly-rounded': 32,
      'square': 0
    };

    const borderRadius = borderRadiusMap[shape];

    window.parent.postMessage({
      pluginMessage: {
        type: 'update-design-token',
        collection: 'System-Styles',
        variable: 'Button-border-radius',
        value: borderRadius
      }
    }, '*');

    setButtonShape(shape);
  };

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme);
    setActiveTheme(theme);

    // Send theme colors to Figma
    Object.entries(theme.colors).forEach(([position, color]) => {
      window.parent.postMessage({
        pluginMessage: {
          type: 'update-design-token',
          collection: 'System-Colors',
          variable: `${position}-color`,
          value: color
        }
      }, '*');
    });
  };
  
  const handleCustomColorSelect = (color: string) => {
    if (!customColors.includes(color)) {
      const newCustomColors = [...customColors, color].slice(0, 3);
      setCustomColors(newCustomColors);
      
      const customThemeColors: ColorSet = {
        primary: newCustomColors[0] || '',
        secondary: newCustomColors[1] || '',
        tertiary: newCustomColors[2] || ''
      };
  
      const newCustomTheme: Theme = {
        name: 'Custom Theme',
        colors: customThemeColors,
        type: 'custom'
      };
  
      setCustomTheme(newCustomTheme);
      if (!activeTheme) {
        setActiveTheme(newCustomTheme);
      }
      setSelectedTheme(newCustomTheme);
    }
  };
  
  const handleRemoveCustomColor = (colorToRemove: string) => {
    const newCustomColors = customColors.filter(color => color !== colorToRemove);
    setCustomColors(newCustomColors);
  
    if (newCustomColors.length > 0) {
      const customThemeColors: ColorSet = {
        primary: newCustomColors[0] || '',
        secondary: newCustomColors[1] || '',
        tertiary: newCustomColors[2] || ''
      };
  
      const updatedCustomTheme: Theme = {
        name: 'Custom Theme',
        colors: customThemeColors,
        type: 'custom'
      };
  
      setCustomTheme(updatedCustomTheme);
      if (activeTheme?.type === 'custom') {
        setActiveTheme(updatedCustomTheme);
      }
      setSelectedTheme(updatedCustomTheme);
    } else {
      setCustomTheme(null);
      if (activeTheme?.type === 'custom') {
        setActiveTheme(null);
      }
      setSelectedTheme(null);
    }
  };
  
  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '0.5';
      e.target.style.outline = '2px solid white';
      e.target.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
    }
  };
  
  const handleDragEnd = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '';
      e.target.style.outline = '';
      e.target.style.boxShadow = '';
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.target instanceof HTMLElement) {
      e.target.style.outline = '2px solid white';
      e.target.style.outlineOffset = '2px';
    }
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.style.outline = '';
      e.target.style.outlineOffset = '';
    }
  };
  
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    
    if (!activeTheme || dragIndex === dropIndex) return;
  
    const colors = Object.entries(activeTheme.colors)
    .filter(([_, value]) => value !== undefined)
    .map(([_, color]) => {
      // If color is a ColorData object, extract its baseHex
      return typeof color === 'object' && 'baseHex' in color 
        ? (color as ColorData).baseHex 
        : color as string;
    });
  
    const draggedColor = colors[dragIndex];
    const newColors = [...colors];
    newColors.splice(dragIndex, 1);
    newColors.splice(dropIndex, 0, draggedColor);
  
    const newThemeColors: ColorSet = {
      primary: newColors[0] || '',
      secondary: newColors[1] || '',
      tertiary: newColors[2] || ''
    };
  
    const updatedTheme: Theme = {
      ...activeTheme,
      colors: newThemeColors
    };
  
    setActiveTheme(updatedTheme);
    if (activeTheme.type === 'custom') {
      setCustomTheme(updatedTheme);
      setCustomColors(newColors);
    }

    // Send updated theme colors to Figma after drag and drop
    Object.entries(newThemeColors).forEach(([position, color]) => {
      window.parent.postMessage({
        pluginMessage: {
          type: 'update-design-token',
          collection: 'System-Colors',
          variable: `${position}-color`,
          value: color
        }
      }, '*');
    });
  
    if (e.target instanceof HTMLElement) {
      e.target.style.outline = '';
      e.target.style.outlineOffset = '';
    }
  };

  return (
    <div className="bg-white">
      <main className="max-w-sm mx-auto p-4">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-xl">Back</span>
        </button>

        <div className="space-y-4">
          <CollapsiblePanel title="Theme Color Settings">
            <div className="space-y-6">
              <button
                onClick={() => setCustomMode(!customMode)}
                className={`px-6 py-3 rounded-xl text-lg font-medium ${
                  customMode
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {customMode ? 'View Harmonies' : 'Custom Colors'}
              </button>

              {/* Base Color Selection */}
              {!customMode && (
                <div>
                  <h3 className="text-sm font-medium mb-3">Base Color</h3>
                  <div className="grid grid-cols-5 gap-3">
                    {safeColors.map((color, index) => (
                      <button
                        key={`base-${color}-${index}`}
                        onClick={() => handleBaseColorSelect(color)}
                        className={`group relative aspect-square rounded-xl transition-transform hover:scale-105 ${
                          color === baseColor ? 'ring-2 ring-purple-500' : ''
                        }`}
                      >
                        <div
                          className="w-full h-full rounded-xl"
                          style={{ backgroundColor: color }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Available Themes */}
              {!customMode && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Available Themes:</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {themeAnalysis.map(({ theme, isValid, reason }) => (
                      <div
                        key={theme.name}
                        onClick={() => isValid && handleThemeSelect(theme)}
                        className={`p-4 rounded-xl transition-all flex flex-col h-[160px] ${
                          activeTheme?.name === theme.name
                            ? 'bg-purple-50 border-2 border-purple-500'
                            : isValid
                              ? 'border border-gray-200 hover:border-purple-200 cursor-pointer'
                              : 'border border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="mb-3">
                          <h4 className="text-base font-medium">{theme.name}</h4>
                        </div>
                        <div className="flex gap-2 mb-3">
                          {[
                            theme.colors.primary,
                            theme.colors.secondary,
                            theme.colors.tertiary
                          ].map((color, index) => (
                            <div
                              key={index}
                              className="flex-1 h-12 rounded-lg"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <div className="h-6 flex items-center justify-center">
                          {!isValid && (
                            <span className="text-xs text-gray-500">
                              {reason === 'duplicate' && 'Has duplicate colors'}
                              {reason === 'redundant' && 'Combo already exists'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              )}

              {/* Custom Mode UI */}
              {customMode && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Available Colors:</h3>
                    <div className="grid grid-cols-5 gap-3">
                      {safeColors.map((color, index) => (
                        <button
                          key={`${color}-${index}`}
                          onClick={() => handleCustomColorSelect(color)}
                          className="group relative aspect-square rounded-xl transition-transform hover:scale-105"
                        >
                          <div
                            className="w-full h-full rounded-xl"
                            style={{ backgroundColor: color }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="w-6 h-6 text-white drop-shadow-md" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {customColors.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-4">Selected Colors:</h3>
                      <div className="grid grid-cols-5 gap-3">
                        {customColors.map((color, index) => (
                          <button
                            key={`custom-${color}-${index}`}
                            onClick={() => handleRemoveCustomColor(color)}
                            className="group relative aspect-square rounded-xl transition-transform hover:scale-105"
                          >
                            <div
                              className="w-full h-full rounded-xl"
                              style={{ backgroundColor: color }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-20 rounded-xl">
                              <span className="text-white font-medium">Remove</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CollapsiblePanel>

          {/* Active Theme Colors */}
          {activeTheme && (
            <CollapsiblePanel title="Active Theme Colors">
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Harmony: {activeTheme.name}</span>
                </div>

                <div className="space-y-3">
                  {Object.entries(activeTheme.colors).map(([position, color], index) => (
                    <div key={position} className="flex items-center gap-3">
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        className="w-24 h-12 rounded-lg cursor-move"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-medium capitalize">{position}</span>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-gray-500">
                  Drag and drop colors to change their classified levels.
                </p>
              </div>
            </CollapsiblePanel>
          )}

          {/* Surface Styling */}
          <CollapsiblePanel title="Surface Styling">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Tonal</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSurfaceStyle('light-tonal')}
                    className={`px-6 py-3 rounded-xl ${
                      surfaceStyle === 'light-tonal' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                    }`}
                  >
                    Light Tonal
                  </button>
                  <button
                    onClick={() => setSurfaceStyle('colorful-tonal')}
                    className={`px-6 py-3 rounded-xl ${
                      surfaceStyle === 'colorful-tonal' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                    }`}
                  >
                    Colorful Tonal
                  </button>
                  <button
                    onClick={() => setSurfaceStyle('dark-tonal')}
                    className={`px-6 py-3 rounded-xl ${
                      surfaceStyle === 'dark-tonal' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                    }`}
                  >
                    Dark Tonal
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Corporate</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSurfaceStyle('light-professional')}
                    className={`px-6 py-3 rounded-xl ${
                      surfaceStyle === 'light-professional' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                    }`}
                  >
                    Light Professional
                  </button>
                  <button
                    onClick={() => setSurfaceStyle('grey-professional')}
                    className={`px-6 py-3 rounded-xl ${
                      surfaceStyle === 'grey-professional' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                    }`}
                  >
                    Grey Professional
                  </button>
                  <button
                    onClick={() => setSurfaceStyle('dark-professional')}
                    className={`px-6 py-3 rounded-xl ${
                      surfaceStyle === 'dark-professional' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                    }`}
                  >
                    Dark Professional
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Modern</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSurfaceStyle('light-glow')}
                    className={`px-6 py-3 rounded-xl ${
                      surfaceStyle === 'light-glow' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                    }`}
                  >
                    Light Glow
                  </button>
                  <button
                    onClick={() => setSurfaceStyle('dark-glow')}
                    className={`px-6 py-3 rounded-xl ${
                      surfaceStyle === 'dark-glow' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                    }`}
                  >
                    Dark Glow
                  </button>
                </div>
              </div>
            </div>
          </CollapsiblePanel>

          {/* Button Shape Panel */}
          <CollapsiblePanel title="Button Shape">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleButtonShapeChange('gently-rounded')}
                className={`px-6 py-3 rounded-xl ${
                  buttonShape === 'gently-rounded' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                Gently Rounded
              </button>
              <button
                onClick={() => handleButtonShapeChange('amply-rounded')}
                className={`px-6 py-3 rounded-xl ${
                  buttonShape === 'amply-rounded' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                Amply Rounded
              </button>
              <button
                onClick={() => handleButtonShapeChange('boldly-rounded')}
                className={`px-6 py-3 rounded-xl ${
                  buttonShape === 'boldly-rounded' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                Boldly Rounded
              </button>
              <button
                onClick={() => handleButtonShapeChange('square')}
                className={`px-6 py-3 rounded-xl ${
                  buttonShape === 'square' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                Square
              </button>
            </div>
          </CollapsiblePanel>

          {/* Component Effects */}
          <CollapsiblePanel title="Component Effects">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setComponentEffect('none')}
                className={`px-6 py-3 rounded-xl ${
                  componentEffect === 'none' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                None
              </button>
              <button
                onClick={() => setComponentEffect('bevel')}
                className={`px-6 py-3 rounded-xl ${
                  componentEffect === 'bevel' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                Bevel
              </button>
              <button
                onClick={() => setComponentEffect('ridged')}
                className={`px-6 py-3 rounded-xl ${
                  componentEffect === 'ridged' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                Ridged
              </button>
            </div>
          </CollapsiblePanel>
        </div>
      </main>
      
      {/* Color Selection Modal */}
      <ColorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableColors={safeColors}
        selectedColors={customColors}
        onColorSelect={handleCustomColorSelect}
        onColorRemove={handleRemoveCustomColor}
      />
    </div>
  );
};

export default ThemePage;