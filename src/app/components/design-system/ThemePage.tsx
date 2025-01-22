import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useColors } from '../../../context/ColorContext';
import { useColorHarmonies } from '../../hooks/useColorHarmonies';
import { ChevronLeft, Home, Plus } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';
import CollapsiblePanel from './CollapsiblePanel';
import ColorModal from './ColorModal';
import { generateShades, ColorSettings } from '../../utils/colors';
import type { ColorResult } from '../../utils/colors';
import type { ColorData } from '../../utils/color-harmonies';
import { text } from 'stream/consumers';
const chroma = require('chroma-js');

interface ColorSet {
  primary: ColorData | string;
  secondary: ColorData | string;
  tertiary: ColorData | string;
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
  { key: 'splitComplementary', name: 'Split Comp.' }, // Shortened name
  { key: 'custom', name: 'Custom' }
] as const;

const ThemePage: React.FC = () => {
  // Context hooks
  const { setCurrentRoute } = useNavigation();
  const { fullColorData } = useColors();

  // All state declarations
  const [surfaceStyle, setSurfaceStyle] = useState<SurfaceStyle>('light-tonal');
  const [buttonShape, setButtonShape] = useState<ButtonShape>('gently-rounded');
  const [componentEffect, setComponentEffect] = useState<ComponentEffect>('none');
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const [baseColor, setBaseColor] = useState<ColorData | null>(null);

  // Add type guard for ColorData
  function isColorData(color: ColorData | string): color is ColorData {
    return typeof color === 'object' && 'baseHex' in color;
  }

  // Update safeColors to filter out state colors and default grey
const safeColors = useMemo(() => {
  if (!fullColorData || !Array.isArray(fullColorData)) {
    return []; // Remove default grey fallback
  }
  
  return fullColorData
    .filter(color => 
      // Exclude state colors and default grey
      !color.id.startsWith('state-') && 
      !color.id.startsWith('default-')
    )
    .map(color => ({
      ...color,
      allModes: color.allModes || {
        'AA-light': { allShades: [] },
        'AA-dark': { allShades: [] },
        'AAA-light': { allShades: [] },
        'AAA-dark': { allShades: [] }
      }
    }));
}, [fullColorData]);

  // Second: Initialize base color
  useEffect(() => {
    console.log("Initializing base color, current safeColors:", safeColors);
    
    if (!baseColor && safeColors.length > 0) {
      // Find first non-default color
      const nonDefaultColor = safeColors.find(color => !color.id.startsWith('default-'));
      
      if (nonDefaultColor) {
        console.log("Setting initial base color to:", nonDefaultColor);
        const normalizedColor = {
          ...nonDefaultColor,
          shadeIndex: typeof nonDefaultColor.shadeIndex === 'string' 
            ? parseInt(nonDefaultColor.shadeIndex, 10) 
            : nonDefaultColor.shadeIndex,
          allModes: nonDefaultColor.allModes || {
            'AA-light': { allShades: [] },
            'AA-dark': { allShades: [] },
            'AAA-light': { allShades: [] },
            'AAA-dark': { allShades: [] }
          }
        };
        setBaseColor(normalizedColor);
      }
    }
  }, [safeColors]);


  // Color Harmonies
  // Update arrangedColors to ensure we're not including state colors or default grey
const arrangedColors = useMemo(() => {
  console.log("Creating arrangedColors with:", {
    baseColor,
    safeColors
  });
  if (!baseColor) {
    console.log("No base color, returning empty array");
    return [];
  }
  
  // Make sure we're returning an array of ColorData objects
  const normalizedColors = [
    baseColor,
    ...safeColors
      .filter(color => 
        color.baseHex !== baseColor.baseHex &&
        !color.id.startsWith('state-') && 
        !color.id.startsWith('default-')
      )
  ].map(color => {
    const normalized = {
      ...color,
      shadeIndex: typeof color.shadeIndex === 'string' ? parseInt(color.shadeIndex, 10) : color.shadeIndex,
      allModes: color.allModes || {
        'AA-light': { allShades: [] },
        'AA-dark': { allShades: [] },
        'AAA-light': { allShades: [] },
        'AAA-dark': { allShades: [] }
      }
    };
    
    console.log("Normalized color:", normalized);
    return normalized;
  });

  console.log("Final arrangedColors:", normalizedColors);
  return normalizedColors;
}, [baseColor, safeColors.map(color => color.baseHex).join(',')]);
  

  const harmonies = useColorHarmonies(arrangedColors);
  console.log("Generated harmonies:", harmonies);

  useEffect(() => {
    if (!harmonies || !baseColor) return;
  
    try {
      let newThemes: Theme[] = [];
      let newThemeAnalysis: Array<{
        theme: Theme;
        isValid: boolean;
        reason: ThemeAnalysisReason;
      }> = [];
  
      // Add regular harmonies
      for (const { key, name } of harmonyTypes) {
        if (key === 'custom') {
          // Add custom theme with persisted colors
          newThemes.push({
            name: 'Custom',
            colors: {
              primary: customColors[0] || '',
              secondary: customColors[1] || '',
              tertiary: customColors[2] || ''
            },
            type: 'custom'
          });
          continue;
        }
  
        // Explicitly use the current harmonies for this specific harmony type
        const harmonyColors = harmonies[key as keyof typeof harmonies];
        
        console.log(`${name} Harmony for ${baseColor.name}:`, {
          baseColor: baseColor,
          harmonyColors: harmonyColors
        });
  
        if (!harmonyColors) continue;
  
        const processedColors: ColorSet = {
          primary: harmonyColors.primary?.baseHex || baseColor.baseHex,
          secondary: harmonyColors.secondary?.baseHex || baseColor.baseHex,
          tertiary: harmonyColors.tertiary?.baseHex || baseColor.baseHex
        };
  
        const theme: Theme = {
          name,
          colors: processedColors,
          type: key === 'splitComplementary' ? 'split-complementary' : key
        };
  
        // Check for duplicate and redundant colors
        const isValid = checkThemeRedundancy([theme, ...newThemes]).find(t => t.theme === theme)?.isValid || false;
        const reason: ThemeAnalysisReason = isValid ? 'valid' : 'duplicate';
  
        newThemes.push(theme);
        newThemeAnalysis.push({ theme, isValid, reason });
      }
  
      // Add custom theme
      const newCustomTheme: Theme = {
        name: 'Custom',
        colors: {
          primary: customColors[0] || '',
          secondary: customColors[1] || '',
          tertiary: customColors[2] || ''
        },
        type: 'custom'
      };
  
      const hasAllCustomColors = customColors.length === 3 && customColors.every(color => color !== '');
      newThemeAnalysis.push({
        theme: newCustomTheme,
        isValid: hasAllCustomColors,
        reason: hasAllCustomColors ? 'valid' as ThemeAnalysisReason : 'duplicate' as ThemeAnalysisReason
      });
  
      // Only update if there are actual changes
      const hasThemeChanges = 
        themes.length !== newThemes.length || 
        themes.some((theme, index) => 
          theme.colors.primary !== newThemes[index]?.colors.primary ||
          theme.colors.secondary !== newThemes[index]?.colors.secondary ||
          theme.colors.tertiary !== newThemes[index]?.colors.tertiary
        );
  
      if (hasThemeChanges) {
        setThemes(newThemes);
        setThemeAnalysis(newThemeAnalysis);
      }
  
      // Only set active theme if there isn't one
      if (!activeTheme) {
        const validTheme = newThemeAnalysis.find(({ isValid }) => isValid)?.theme;
        if (validTheme) {
          setActiveTheme(validTheme);
          setSelectedTheme(validTheme);
        }
      }
    } catch (error) {
      console.error('Error generating themes:', error);
    }
  }, [harmonies, baseColor, customColors, themes, activeTheme]);

  const checkThemeRedundancy = (themes: Theme[]): Array<{
    theme: Theme;
    isValid: boolean;
    reason: ThemeAnalysisReason;
  }> => {
    console.log('Starting redundancy check');
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
  
      const result = {
        theme,
        isValid: !hasInternalDuplicates && !isRedundant,
        reason: hasInternalDuplicates ? 'duplicate' as ThemeAnalysisReason : 
                isRedundant ? 'redundant' as ThemeAnalysisReason : 
                'valid' as ThemeAnalysisReason
      };
  
      return result;
    });
  };

let darkTextColor = '#121212';
let darkTextOpacity = 1;

// Helper function to calculate text color based on background and target contrast
function getTextColorWithContrast(background: string, targetContrast: number): string {
  let textColor = darkTextColor;
  let n = darkTextOpacity;
  let stepSize = 0.01;

  while (chroma.contrast(chroma.mix(background, textColor, n), background) > targetContrast && n > 0) {
    stepSize = stepSize + stepSize;
    n = n - stepSize;
  }

  n = Math.min(n + stepSize, 1);
  return chroma.mix(background, textColor, n).hex();
}

// Helper function to find a button color with sufficient contrast
function findButtonColor(allShades: any[], surfaces: string[]): { buttonColor: string, buttonTextColor: string } {
  for (let i = 2; i < allShades.length; i++) {
    const candidate = allShades[i]; // Assuming this is the hex color string
    if (surfaces.every(surface => chroma.contrast(candidate, surface) >= 3.1)) {
      return { buttonColor: candidate, buttonTextColor: '#FFFFFF' }; // You might need to adjust how to determine text color
    }
  }
  return { buttonColor: allShades[2], buttonTextColor: '#FFFFFF' };
}

// New method to handle surface style changes
const handleSurfaceStyleChange = useCallback((style: SurfaceStyle) => {
  console.log("Surface style change called with:", style);
  console.log("Current baseColor:", baseColor);
  
  setSurfaceStyle(style);

  // Simplified check
  if (!baseColor || !baseColor.allModes) {
    console.log("Early return due to missing baseColor or allModes");
    return;
  }

  let surfaceTokens: Array<{ name: string, value: string }> = [];

  if (style === 'light-tonal') {
    const baseMix = baseColor.baseHex;
    console.log("Generating light tonal surfaces with baseMix:", baseMix);

    const surface = chroma.mix('white', baseMix, 0.07, 'rgb').hex();
    const surfaceDim = chroma.mix(surface, 'black', 0.07).hex();
    const surfaceBright = chroma.mix(surface, 'white', 0.05).hex();
    const surfaceContainerLow = chroma.mix('white', baseMix, 0.04, 'rgb').hex();
    const surfaceContainerLowest = chroma.mix('white', baseMix, 0.02, 'rgb').hex();
    const surfaceContainerHigh = chroma.mix('white', baseMix, 0.11, 'rgb').hex();
    const surfaceContainerHighest = chroma.mix('white', baseMix, 0.14, 'rgb').hex();

    const buttonColor = chroma(baseMix).darken().hex();
    const buttonTextColor = chroma.contrast(buttonColor, '#FFFFFF') > 4.5 ? '#FFFFFF' : '#000000';

    surfaceTokens = [
      { name: 'Surface', value: surface },
      { name: 'Surface-Dim', value: surfaceDim },
      { name: 'Surface-Bright', value: surfaceBright },
      { name: 'Surface-Container', value: surface },
      { name: 'Surface-Container-Low', value: surfaceContainerLow },
      { name: 'Surface-Container-Lowest', value: surfaceContainerLowest },
      { name: 'Surface-Container-High', value: surfaceContainerHigh },
      { name: 'Surface-Container-Highest', value: surfaceContainerHighest },
      { name: 'Button', value: buttonColor },
      { name: 'On-Button', value: buttonTextColor }
    ];

    console.log("Generated surface tokens:", surfaceTokens);

    // Send each token to Figma with updated mode
    surfaceTokens.forEach(token => {
      console.log("Sending token to Figma:", token);
      window.parent.postMessage({
        pluginMessage: {
          type: 'update-design-token',
          collection: 'Tones',          // Collection name (not the full path)
          group: 'Default',             // Group name
          mode: 'AA-light',             // Mode name
          variable: token.name,         // The variable name you want to update
          value: token.value            // The new value for the variable
        }
      }, '*');
    });
  }

  console.log('Surface style tokens updated:', surfaceTokens);
}, [baseColor]);

  // Navigation handler
  const handleBack = () => {
    setCurrentRoute({
      id: 'home',
      title: 'Design System',
      path: '/',
      icon: Home
    });
  };

  const handleButtonShapeChange = (shape: ButtonShape) => {
    const borderRadiusMap: Record<ButtonShape, number> = {
      'gently-rounded': 8,
      'amply-rounded': 16,
      'boldly-rounded': 32,
      'square': 0
    };
  
    const borderRadius = borderRadiusMap[shape];
  
    // First update Figma
    window.parent.postMessage({
      pluginMessage: {
        type: 'update-design-token',
        collection: 'System-Styles',
        variable: 'Button-border-radius',
        value: borderRadius
      }
    }, '*');
  
    // Then update local state
    setButtonShape(shape);
  };

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme);
    setActiveTheme(theme);
  
    Object.entries(theme.colors).forEach(([position, color]) => {
      const colorHex = isColorData(color) ? color.baseHex : color;
      window.parent.postMessage({
        pluginMessage: {
          type: 'update-design-token',
          collection: 'System-Colors',
          variable: `${position}-color`,
          value: colorHex
        }
      }, '*');
    });
  };

  // Transform safeColors to hex strings for the modal
  const modalColors = useMemo(() => 
    safeColors.map(colorData => colorData.baseHex),
    [safeColors]
  );

  // Add this to your handlers section
  const handleBaseColorSelect = useCallback((colorData: ColorData) => {
    console.log('--- Base Color Selection ---');
    console.log('New base color:', colorData.baseHex);
    
    // Prevent unnecessary updates if the base color is the same
    if (baseColor?.baseHex === colorData.baseHex) return;
  
    // Update base color
    setBaseColor(colorData);
  }, [baseColor]);
  
  // Custom color handlers using hex strings
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
        name: 'Custom',
        colors: customThemeColors,
        type: 'custom'
      };
  
      setCustomTheme(newCustomTheme);
      
      // Only activate the theme if we have all three colors
      if (newCustomColors.length === 3) {
        setActiveTheme(newCustomTheme);
        setSelectedTheme(newCustomTheme);
        
        // Update Figma with the new theme colors
        Object.entries(customThemeColors).forEach(([position, color]) => {
          window.parent.postMessage({
            pluginMessage: {
              type: 'update-design-token',
              collection: 'System-Colors',
              variable: `${position}-color`,
              value: color
            }
          }, '*');
        });
      }
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
  
 // Update handleDrop for drag and drop functionality
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    
    if (!activeTheme || dragIndex === dropIndex) return;

    const colors = Object.entries(activeTheme.colors)
      .filter(([_, value]) => value !== undefined)
      .map(([_, color]) => isColorData(color) ? color.baseHex : color);

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
    setSelectedTheme(updatedTheme);

    Object.entries(newThemeColors).forEach(([position, color]) => {
      const colorHex = isColorData(color) ? color.baseHex : color;
      window.parent.postMessage({
        pluginMessage: {
          type: 'update-design-token',
          collection: 'System-Colors',
          variable: `${position}-color`,
          value: colorHex
        }
      }, '*');
    });

    if (e.target instanceof HTMLElement) {
      e.target.style.outline = '';
      e.target.style.outlineOffset = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-sm mx-auto bg-white shadow-md rounded-xl p-6">
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
    {/* Base Color Selection */}
    <div>
      <h3 className="text-sm font-medium mb-3">Base Color</h3>
      <div className="grid grid-cols-5 gap-3">
        {safeColors
          .filter(colorData => !colorData.id.startsWith('default-'))
          .map((colorData) => {
            // Normalize the color data to ensure correct types
            const normalizedColorData: ColorData = {
              ...colorData,
              shadeIndex: typeof colorData.shadeIndex === 'string' 
                ? parseInt(colorData.shadeIndex, 10) 
                : colorData.shadeIndex,
              allModes: colorData.allModes || {
                'AA-light': { allShades: [] },
                'AA-dark': { allShades: [] },
                'AAA-light': { allShades: [] },
                'AAA-dark': { allShades: [] }
              }
            };
            
            return (
              <button
                key={normalizedColorData.id}
                onClick={() => handleBaseColorSelect(normalizedColorData)}
                className={`group relative aspect-square rounded-xl transition-transform hover:scale-105 ${
                  baseColor?.baseHex === normalizedColorData.baseHex 
                    ? 'ring-2 ring-purple-500' 
                    : ''
                }`}
              >
                <div
                  className="w-full h-full rounded-xl"
                  style={{ backgroundColor: normalizedColorData.baseHex }}
                  title={normalizedColorData.name}
                />
              </button>
            );
          })}
      </div>
    </div>

    {/* Available Themes */}
    <div>
      <h3 className="text-lg font-medium mb-4">Available Themes:</h3>
      <div className="grid grid-cols-2 gap-3">
        {themeAnalysis.map(({ theme, isValid, reason }) => {
          const isCustom = theme.type === 'custom';
          const hasAllCustomColors = isCustom && 
            customColors.length === 3 && 
            customColors.every(color => color !== '');
          const isClickable = (isCustom && hasAllCustomColors) || (!isCustom && isValid);
          
          return (
            <div
              key={`${theme.name}-${theme.type}`}
              onClick={() => isClickable && handleThemeSelect(theme)}
              className={`p-4 rounded-xl transition-all flex flex-col h-[160px] relative ${
                activeTheme?.name === theme.name
                  ? 'bg-purple-50 border-2 border-purple-500'
                  : isClickable
                    ? 'border border-gray-200 hover:border-purple-200 cursor-pointer'
                    : 'border border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="mb-3 flex justify-between items-center">
                <h4 className="text-base font-medium">{theme.name}</h4>
                {isCustom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsModalOpen(true);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-5 h-5 text-gray-600" />
                  </button>
                )}
              </div>
              <div className="flex gap-2 mb-3">
                {isCustom ? (
                  // Custom theme color swatches
                  <>
                    {customColors.length > 0 ? (
                      customColors.map((color, index) => (
                        <div
                          key={index}
                          className="flex-1 h-12 rounded-lg"
                          style={{ backgroundColor: color }}
                        />
                      ))
                    ) : (
                      Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={index}
                          className="flex-1 h-12 rounded-lg border-2 border-dashed border-gray-200"
                        />
                      ))
                    )}
                  </>
                ) : (
                  // Regular theme color swatches
                  Object.entries(theme.colors).map(([key, color], index) => {
                    const colorHex = typeof color === 'object' ? color.baseHex : color;
                    return (
                      <div
                        key={`${key}-${index}`}
                        className="flex-1 h-12 rounded-lg"
                        style={{ backgroundColor: colorHex }}
                      />
                    );
                  })
                )}
              </div>
              <div className="h-6 flex items-center justify-center">
                {!isValid && !isCustom && (
                  <span className="text-xs text-gray-500">
                    {reason === 'duplicate' ? 'Has duplicate colors' : 'Combo already exists'}
                  </span>
                )}
                {isCustom && (
                  <span className="text-xs text-gray-500">
                    {customColors.length === 3 
                      ? 'Click to activate custom theme' 
                      : 'Click + to add custom colors'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
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
                onClick={() => handleSurfaceStyleChange('light-tonal')}
                className={`px-6 py-3 rounded-xl ${
                  surfaceStyle === 'light-tonal' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                Light Tonal
              </button>
              <button
                onClick={() => handleSurfaceStyleChange('colorful-tonal')}
                className={`px-6 py-3 rounded-xl ${
                  surfaceStyle === 'colorful-tonal' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                Colorful Tonal
              </button>
              <button
                onClick={() => handleSurfaceStyleChange('dark-tonal')}
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

          {/* Button Shape */}
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
      </div>

      {/* Color Selection Modal */}
      <ColorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableColors={modalColors}
        selectedColors={customColors}
        onColorSelect={handleCustomColorSelect}
        onColorRemove={handleRemoveCustomColor}
      />
    </div>
  );
};

export default ThemePage;