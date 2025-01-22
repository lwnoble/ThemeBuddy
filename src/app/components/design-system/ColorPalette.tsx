import React, { useEffect, useState } from 'react';
import { ChevronLeft, Settings2 } from 'lucide-react';
import { ColorSwatch } from './ColorSwatch';
import ShadeSettings from './ShadeSettings';
import { useColors } from '../../../context/ColorContext';
import { generateUniqueColorNames } from '../../utils/color-namer';
import { generateAllColorModes, ColorSettings, rgbToHex } from '../../utils/colors';
import { ColorData } from '../../utils/color-harmonies';

const ColorThief = require('colorthief');
const chroma = require('chroma-js');

type WCAGMode = 'AA-light' | 'AA-dark' | 'AAA-light' | 'AAA-dark';

const stateColors = {
  Error: "#DC3C3F",
  Success: "#56B356",
  Warning: "#F8C437",
  Info: "#0E8AF7"
};

interface ColorPaletteProps {
  imageFile?: File;
  imageUrl?: string;
  onBack?: () => void;
}

const findClosestAccessibleShade = (baseColor: string, shades: Array<{color: string, contrastRatio: number}>): string => {
  let minDeltaE = Infinity;
  let closestShade = baseColor;

  shades.forEach(shade => {
    const deltaE = chroma.deltaE(baseColor, shade.color);
    if (deltaE < minDeltaE) {
      minDeltaE = deltaE;
      closestShade = shade.color;
    }
  });

  return closestShade;
};

const ColorPalette: React.FC<ColorPaletteProps> = ({ imageFile, imageUrl, onBack }) => {
  const { setColors: setContextColors, setColorNames: setContextColorNames } = useColors();
  const [colors, setColors] = useState<string[]>([]);
  const [colorNames, setColorNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showShadeSettings, setShowShadeSettings] = useState(false);
  const [activeWCAGMode, setActiveWCAGMode] = useState<WCAGMode>('AA-light');
  const [colorSettings, setColorSettings] = useState<ColorSettings>({
    numberOfShades: 10,
    numberOfColors: 10,
    deltaE: 5,
    lightMode: {
      lightestShade: 95,
      darkestShade: 10,
      maxChroma: 100,
      textColor: {
        light: '#FFFFFF',
        dark: '#121212',
        lightOpacity: 1,
        darkOpacity: 1
      }
    },
    darkMode: {
      lightestShade: 90,
      darkestShade: 5,
      maxChroma: 80,
      textColor: {
        light: '#FFFFFF',
        dark: '#121212',
        lightOpacity: 0.7,
        darkOpacity: 1
      }
    },
    contrastMode: 'AA',
    minContrastRatio: 4.5
  });

  useEffect(() => {
    const extractColors = async () => {
        console.log('Extracting colors...'); // Add this line
      setIsLoading(true);
      setError(null);
      
      try {
        let imgUrl: string;
        if (imageFile) {
          imgUrl = URL.createObjectURL(imageFile);
        } else if (imageUrl) {
          imgUrl = imageUrl;
        } else {
          throw new Error('No image source provided');
        }

        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imgUrl;
        });

        const colorThief = ColorThief.default ? new ColorThief.default() : new ColorThief();
        const dominantColor = colorThief.getColor(img);
        const palette = colorThief.getPalette(img, 9);
        
        const hexColors = [
          rgbToHex({ r: dominantColor[0], g: dominantColor[1], b: dominantColor[2] }),
          ...palette.map(([r, g, b]: number[]) => {
            return rgbToHex({ r, g, b });
          })
        ];

        // Generate all color modes for each color
        const colorModesWithAccessibleShades = hexColors.map(color => {
          const modes = generateAllColorModes(color, colorSettings);
          const aaLightShades = modes['AA-light'];
          
          // Find the closest accessible shade in AA-light mode
          const accessibleShade = findClosestAccessibleShade(color, aaLightShades);
          
          return {
            originalColor: color,
            modes: modes,
            accessibleShade: accessibleShade
          };
        });

      
          // Create color data for extracted colors
        const extractedColorData: ColorData[] = colorModesWithAccessibleShades.map((colorInfo, index) => {
          return {
            id: `extracted-color-${index + 1}`,
            baseHex: colorInfo.accessibleShade,
            name: generateUniqueColorNames([colorInfo.accessibleShade])[0],
            shadeIndex: colorInfo.modes['AA-light'].findIndex(
              shade => shade.color === colorInfo.accessibleShade
            ),
            allModes: {
              'AA-light': {
                allShades: colorInfo.modes['AA-light'].map(shade => ({
                  hex: shade.color,
                  contrastRatio: shade.contrastRatio,
                  textColor: shade.textColor
                }))
              },
              'AA-dark': {
                allShades: colorInfo.modes['AA-dark'].map(shade => ({
                  hex: shade.color,
                  contrastRatio: shade.contrastRatio,
                  textColor: shade.textColor
                }))
              },
              'AAA-light': {
                allShades: colorInfo.modes['AAA-light'].map(shade => ({
                  hex: shade.color,
                  contrastRatio: shade.contrastRatio,
                  textColor: shade.textColor
                }))
              },
              'AAA-dark': {
                allShades: colorInfo.modes['AAA-dark'].map(shade => ({
                  hex: shade.color,
                  contrastRatio: shade.contrastRatio,
                  textColor: shade.textColor
                }))
              }
            }
          };
        });

        // Generate and add neutral grey shades
        const neutralModes = generateAllColorModes('#808080', colorSettings);
        const neutralShades = neutralModes['AA-light'];

        // Neutral color generation
        const neutralColorData: ColorData = {
          id: 'default-grey',
          baseHex: '#808080',
          name: 'Default Grey',
          shadeIndex: neutralModes['AA-light'].findIndex(
            shade => shade.color === '#808080'
          ),
          allModes: {
            'AA-light': {
              allShades: neutralModes['AA-light'].map(shade => ({
                hex: shade.color,
                contrastRatio: shade.contrastRatio,
                textColor: shade.textColor
              }))
            },
            'AA-dark': {
              allShades: neutralModes['AA-dark']?.map(shade => ({
                hex: shade.color,
                contrastRatio: shade.contrastRatio,
                textColor: shade.textColor
              })) || []
            },
            'AAA-light': {
              allShades: neutralModes['AAA-light']?.map(shade => ({
                hex: shade.color,
                contrastRatio: shade.contrastRatio,
                textColor: shade.textColor
              })) || []
            },
            'AAA-dark': {
              allShades: neutralModes['AAA-dark']?.map(shade => ({
                hex: shade.color,
                contrastRatio: shade.contrastRatio,
                textColor: shade.textColor
              })) || []
            }
          }
        };

        // State color generation
        const stateColorData: ColorData[] = Object.entries(stateColors).map(([name, color]) => {
          const modes = generateAllColorModes(color, colorSettings);
          
          return {
            id: `state-color-${name.toLowerCase()}`,
            baseHex: color,
            name: name,
            shadeIndex: Math.floor(modes['AA-light'].length / 2),
            allModes: {
              'AA-light': {
                allShades: modes['AA-light'].map(shade => ({
                  hex: shade.color,
                  contrastRatio: shade.contrastRatio,
                  textColor: shade.textColor
                }))
              },
              'AA-dark': {
                allShades: modes['AA-dark'].map(shade => ({
                  hex: shade.color,
                  contrastRatio: shade.contrastRatio,
                  textColor: shade.textColor
                }))
              },
              'AAA-light': {
                allShades: modes['AAA-light'].map(shade => ({
                  hex: shade.color,
                  contrastRatio: shade.contrastRatio,
                  textColor: shade.textColor
                }))
              },
              'AAA-dark': {
                allShades: modes['AAA-dark'].map(shade => ({
                  hex: shade.color,
                  contrastRatio: shade.contrastRatio,
                  textColor: shade.textColor
                }))
              }
            }
          };
        });

        // Combine all color data
        const allColorData = [...extractedColorData, neutralColorData, ...stateColorData];

        // Filter colors for display (excluding default-grey and state colors)
        const displayColors = extractedColorData.map(cd => cd.baseHex);
        const displayColorNames = extractedColorData.map(cd => cd.name);

        // Update state with filtered colors for rendering
        setColors(displayColors);
        setColorNames(displayColorNames);

        // Log all color data being set to context
        console.log('All Color Data Being Set:', JSON.stringify(allColorData, null, 2));

        // Update context with all color data (including default-grey and state colors)
        setContextColors(allColorData);
        setContextColorNames(allColorData.map(cd => cd.name));

        if (imageFile) {
          URL.revokeObjectURL(imgUrl);
        }
        } catch (err) {
        console.error('Error extracting colors:', err);
        setError('Failed to extract colors from image');
        } finally {
        setIsLoading(false);
        }
        };

        if (imageFile || imageUrl) {
        extractColors();
        }
        }, [imageFile, imageUrl, setContextColors, setContextColorNames]);
          
  const WCAGModeSelector = () => (
    <div className="flex space-x-4 border-b border-gray-200 mb-6">
      {(['AA-light', 'AA-dark', 'AAA-light', 'AAA-dark'] as const).map((mode) => (
        <button
          key={mode}
          className={`pb-2 border-b-2 transition-colors ${
            activeWCAGMode === mode
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent hover:text-gray-600'
          }`}
          onClick={() => setActiveWCAGMode(mode)}
        >
          {mode.replace('-', ' ')}
        </button>
      ))}
    </div>
  );

  const renderColorShades = (color: string) => {
    try {
      const modes = generateAllColorModes(color, colorSettings);
      const shades = modes[activeWCAGMode];
      
      return shades.map((shade, index) => (
        <div
          key={index}
          className="w-20 h-24 rounded flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform"
          style={{ backgroundColor: shade.color }}
          onClick={() => navigator.clipboard.writeText(shade.color)}
        >
          <span style={{ color: shade.textColor }}>Aa</span>
          <span className="text-xs mt-1" style={{ color: shade.textColor }}>
            {shade.contrastRatio.toFixed(2)}:1
          </span>
        </div>
      ));
    } catch (err) {
      console.error('Error generating shades:', err);
      return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center mb-8">
        <button 
          onClick={onBack} 
          className="flex items-center text-purple-500 hover:text-purple-600"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span>Back</span>
        </button>
      </div>

      <div className="space-y-8">

        {/* Main Color Display */}
        <section>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto" />
              <p className="mt-4 text-gray-600">Extracting colors...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          ) : colors.length > 0 ? (
            <div>
              <div className="grid grid-cols-5 gap-4">
                {colors.filter((_, index) => colorNames[index] && !colorNames[index].startsWith('Default'))
                  .map((color, index) => (
                    <div key={index} className="text-center flex flex-col items-center">
                      <ColorSwatch
                        color={color}
                        size="small"
                        onClick={() => {
                          navigator.clipboard.writeText(color);
                        }}
                      />
                      <p className="mt-2 text-xs font-medium">{colorNames[index]}</p>
                      <p className="text-xs text-gray-500">{color}</p>
                    </div>
                  ))}
              </div>
              <p className="text-sm text-gray-500 text-center mt-4">
                Click any color to copy its hex value
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No colors available</p>
            </div>
          )}
        </section>

        {/* Shade Settings and Display */}
        {colors.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Shade Settings</h2>
              <button
                onClick={() => setShowShadeSettings(!showShadeSettings)}
                className={`p-2 rounded transition-colors ${
                  showShadeSettings ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100'
                }`}
              >
                <Settings2 className="w-6 h-6" />
              </button>
            </div>

            {showShadeSettings && (
              <ShadeSettings
                numberOfShades={colorSettings.numberOfShades}
                maxLightnessLight={colorSettings.lightMode.lightestShade}
                maxLightnessDark={colorSettings.darkMode.lightestShade}
                maxDarknessLight={colorSettings.lightMode.darkestShade}
                maxDarknessDark={colorSettings.darkMode.darkestShade}
                maxChromaLight={colorSettings.lightMode.maxChroma}
                maxChromaDark={colorSettings.darkMode.maxChroma}
                lightModeTextColor={colorSettings.lightMode.textColor}
                darkModeTextColor={colorSettings.darkMode.textColor}
                onSettingsChange={settings => setColorSettings(prev => ({
                  ...prev,
                  ...settings
                }))}
              />
            )}

            <div className="space-y-8">
              <WCAGModeSelector />
              {colors.map((color, colorIndex) => (
                <div key={colorIndex} className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {colorNames[colorIndex]}
                  </h3>
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                    {renderColorShades(color)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Neutral Colors */}
        {colors.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xl font-bold">Neutral Colors</h2>
            <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
              <div
                className="w-20 h-24 rounded flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #e5e7eb' }}
                onClick={() => navigator.clipboard.writeText('#FFFFFF')}
              >
                <span className="text-black">Aa</span>
                <span className="text-xs mt-1 text-black">White</span>
              </div>
              {renderColorShades('#808080')}
              <div
                className="w-20 h-24 rounded flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                style={{ backgroundColor: '#000000' }}
                onClick={() => navigator.clipboard.writeText('#000000')}
              >
                <span className="text-white">Aa</span>
                <span className="text-xs mt-1 text-white">Black</span>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ColorPalette;