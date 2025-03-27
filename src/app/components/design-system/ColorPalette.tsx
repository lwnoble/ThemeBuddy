<<<<<<< HEAD
import React, { useEffect, useState, useRef } from 'react';
=======
import React, { useEffect, useState } from 'react';
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
import { ChevronLeft, Settings2 } from 'lucide-react';
import { ColorSwatch } from './ColorSwatch';
import ShadeSettings from './ShadeSettings';
import { useColors } from '../../../context/ColorContext';
import { generateUniqueColorNames } from '../../utils/color-namer';
import { generateAllColorModes, ColorSettings, rgbToHex } from '../../utils/colors';
<<<<<<< HEAD
import { ColorData } from '../../types/colors';
import { createNeutralColorData } from '../../utils/neutralColors';
=======
import { ColorData } from '../../utils/color-harmonies';
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe

const ColorThief = require('colorthief');
const chroma = require('chroma-js');

type WCAGMode = 'AA-light' | 'AA-dark' | 'AAA-light' | 'AAA-dark';

const stateColors = {
  Error: "#DC3C3F",
  Success: "#56B356",
  Warning: "#F8C437",
  Info: "#0E8AF7"
};

export interface ColorPaletteProps {
  imageFile: File | null | undefined;
  imageUrl?: string;
  onBack?: () => void;
  onColorExtractionComplete?: () => void;
<<<<<<< HEAD
  onColorStylesGenerated?: (styles: any) => void;
=======
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
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

<<<<<<< HEAD
/**
 * Reorders the extracted colors to move high luminance colors to the end
 * @param extractedColors Array of extracted color data
 * @returns Reordered array of color data
 */
function reorderColorsByLuminance(extractedColors: ColorData[]): ColorData[] {
  // Make a copy of the array to avoid mutating the original
  const reorderedColors = [...extractedColors];
  
  let highLuminanceCount = 0;
  let needsReordering = true;
  
  // Check if reordering is needed
  while (needsReordering && reorderedColors.length > 0) {
    // Check the luminance of the first color
    const firstColor = reorderedColors[0];
    const luminance = chroma(firstColor.baseHex).luminance();
    
    if (luminance >= 0.9) {
      console.log(`Moving high luminance color (${firstColor.baseHex}, luminance: ${luminance.toFixed(2)}) to the end`);
      
      // Remove the first color and add it to the end
      const highLuminanceColor = reorderedColors.shift();
      if (highLuminanceColor) {
        reorderedColors.push(highLuminanceColor);
        highLuminanceCount++;
      }
      
      // Safety check - prevent infinite loop if all colors have high luminance
      if (highLuminanceCount >= extractedColors.length) {
        console.warn('All colors have high luminance, stopping reordering');
        break;
      }
    } else {
      // First color has acceptable luminance, no need to continue
      console.log(`First color (${firstColor.baseHex}) has acceptable luminance: ${luminance.toFixed(2)}`);
      needsReordering = false;
    }
  }
  
  return reorderedColors;
}

=======
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
const ColorPalette: React.FC<ColorPaletteProps> = ({ 
  imageFile, 
  imageUrl, 
  onBack,
<<<<<<< HEAD
  onColorExtractionComplete,
  onColorStylesGenerated
}) => {
  const [shadesRendered, setShadesRendered] = useState(false);
  const { setColors, setColorNames, setNeutralColors } = useColors();
  const [colors, setLocalColors] = useState<string[]>([]);
  const [colorNames, setLocalColorNames] = useState<string[]>([]);
=======
  onColorExtractionComplete 
}) => {
  const [shadesRendered, setShadesRendered] = useState(false);
  const { setColors: setContextColors, setColorNames: setContextColorNames } = useColors();
  const [colors, setColors] = useState<string[]>([]);
  const [colorNames, setColorNames] = useState<string[]>([]);
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showShadeSettings, setShowShadeSettings] = useState(false);
  const [activeWCAGMode, setActiveWCAGMode] = useState<WCAGMode>('AA-light');
  const extractionCompleteRef = useRef(false);
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
<<<<<<< HEAD
      if (!imageFile && !imageUrl) {
        console.log('No image source provided to ColorPalette');
        return;
      }

      console.log('Starting color extraction in ColorPalette');
      setIsLoading(true);
      setError(null);

      let imgUrl = '';
      
      if (imageFile) {
        imgUrl = URL.createObjectURL(imageFile);
      } else if (imageUrl) {
        imgUrl = imageUrl;
      } else {
        setError('No image source provided');
        setIsLoading(false);
        return;
      }
      
      try {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imgUrl;
        });

        console.log('Image loaded, extracting colors...');
        const colorThief = ColorThief.default ? new ColorThief.default() : new ColorThief();
        const dominantColor = colorThief.getColor(img);
        const palette = colorThief.getPalette(img, 9);
        
        const hexColors = [
          rgbToHex({ r: dominantColor[0], g: dominantColor[1], b: dominantColor[2] }),
          ...palette.map(([r, g, b]: number[]) => rgbToHex({ r, g, b }))
        ];

        console.log('Extracted colors:', hexColors);

        // Create color data objects for context
        const extractedColorData: ColorData[] = hexColors.map((color, index) => {
          const modes = generateAllColorModes(color, colorSettings);
          const aaLightShades = modes['AA-light'];
          const accessibleShade = findClosestAccessibleShade(color, aaLightShades);
          
          return {
            id: `extracted-color-${index + 1}`,
            baseHex: accessibleShade,
            name: generateUniqueColorNames([accessibleShade])[0],
            shadeIndex: modes['AA-light'].findIndex(
              shade => shade.color === accessibleShade
            ),
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

        console.log('Extracted color data before reordering:', extractedColorData.map(c => c.baseHex));

        // Reorder the colors to move high luminance colors to the end
        const reorderedColorData = reorderColorsByLuminance(extractedColorData);
        console.log('Reordered color data:', reorderedColorData.map(c => c.baseHex));

        // Create neutral grey data
        const neutralModes = generateAllColorModes('#808080', colorSettings);
        const neutralColorData: ColorData = {
          id: 'default-grey',
          baseHex: '#808080',
          name: 'Default Grey',
          shadeIndex: 1,
          allModes: {
            'AA-light': {
              allShades: [
                {
                  hex: '#FFFFFF',
                  contrastRatio: chroma.contrast('#FFFFFF', colorSettings.lightMode.textColor.dark),
                  textColor: colorSettings.lightMode.textColor.dark
                },
                ...neutralModes['AA-light'].map(shade => ({
                  hex: shade.color,
                  contrastRatio: shade.contrastRatio,
                  textColor: shade.textColor
                })),
                {
                  hex: '#121212',
                  contrastRatio: chroma.contrast('#121212', colorSettings.lightMode.textColor.light),
                  textColor: colorSettings.lightMode.textColor.light
                }
              ]
            },
            'AA-dark': {
              allShades: [
                {
                  hex: '#FFFFFF',
                  contrastRatio: chroma.contrast('#FFFFFF', colorSettings.darkMode.textColor.dark),
                  textColor: colorSettings.darkMode.textColor.dark
                },
                ...neutralModes['AA-dark'].map(shade => ({
                  hex: shade.color,
                  contrastRatio: shade.contrastRatio,
                  textColor: shade.textColor
                })),
                {
                  hex: '#121212',
                  contrastRatio: chroma.contrast('#121212', colorSettings.darkMode.textColor.light),
                  textColor: colorSettings.darkMode.textColor.light
                }
              ]
            },
            'AAA-light': {
              allShades: [
                {
                  hex: '#FFFFFF',
                  contrastRatio: chroma.contrast('#FFFFFF', colorSettings.lightMode.textColor.dark),
                  textColor: colorSettings.lightMode.textColor.dark
                },
                ...neutralModes['AAA-light'].map(shade => ({
                  hex: shade.color,
                  contrastRatio: shade.contrastRatio,
                  textColor: shade.textColor
                })),
                {
                  hex: '#121212',
                  contrastRatio: chroma.contrast('#121212', colorSettings.lightMode.textColor.light),
                  textColor: colorSettings.lightMode.textColor.light
                }
              ]
            },
            'AAA-dark': {
              allShades: [
                {
                  hex: '#FFFFFF',
                  contrastRatio: chroma.contrast('#FFFFFF', colorSettings.darkMode.textColor.dark),
                  textColor: colorSettings.darkMode.textColor.dark
                },
                ...neutralModes['AAA-dark'].map(shade => ({
                  hex: shade.color,
                  contrastRatio: shade.contrastRatio,
                  textColor: shade.textColor
                })),
                {
                  hex: '#121212',
                  contrastRatio: chroma.contrast('#121212', colorSettings.darkMode.textColor.light),
                  textColor: colorSettings.darkMode.textColor.light
                }
              ]
            }
          }
        };  

        // Create neutral colors data (white, grey, black)
        const createNeutralColorData = (color: string, id: string, name: string, shadeIndex: number): ColorData => {
          const modes = generateAllColorModes(color, colorSettings);
          return {
            id,
            baseHex: color,
            name,
            shadeIndex,
            allModes: {
              'AA-light': {
                allShades: [
                  {
                    hex: '#FFFFFF',
                    contrastRatio: chroma.contrast('#FFFFFF', colorSettings.lightMode.textColor.dark),
                    textColor: colorSettings.lightMode.textColor.dark
                  },
                  ...modes['AA-light'].map(shade => ({
                    hex: shade.color,
                    contrastRatio: shade.contrastRatio,
                    textColor: shade.textColor
                  })),
                  {
                    hex: '#121212',
                    contrastRatio: chroma.contrast('#121212', colorSettings.lightMode.textColor.light),
                    textColor: colorSettings.lightMode.textColor.light
                  }
                ]
              },
              'AA-dark': {
                allShades: [
                  {
                    hex: '#FFFFFF',
                    contrastRatio: chroma.contrast('#FFFFFF', colorSettings.darkMode.textColor.dark),
                    textColor: colorSettings.darkMode.textColor.dark
                  },
                  ...modes['AA-dark'].map(shade => ({
                    hex: shade.color,
                    contrastRatio: shade.contrastRatio,
                    textColor: shade.textColor
                  })),
                  {
                    hex: '#121212',
                    contrastRatio: chroma.contrast('#121212', colorSettings.darkMode.textColor.light),
                    textColor: colorSettings.darkMode.textColor.light
                  }
                ]
              },
              'AAA-light': {
                allShades: [
                  {
                    hex: '#FFFFFF',
                    contrastRatio: chroma.contrast('#FFFFFF', colorSettings.lightMode.textColor.dark),
                    textColor: colorSettings.lightMode.textColor.dark
                  },
                  ...modes['AAA-light'].map(shade => ({
                    hex: shade.color,
                    contrastRatio: shade.contrastRatio,
                    textColor: shade.textColor
                  })),
                  {
                    hex: '#121212',
                    contrastRatio: chroma.contrast('#121212', colorSettings.lightMode.textColor.light),
                    textColor: colorSettings.lightMode.textColor.light
                  }
                ]
              },
              'AAA-dark': {
                allShades: [
                  {
                    hex: '#FFFFFF',
                    contrastRatio: chroma.contrast('#FFFFFF', colorSettings.darkMode.textColor.dark),
                    textColor: colorSettings.darkMode.textColor.dark
                  },
                  ...modes['AAA-dark'].map(shade => ({
                    hex: shade.color,
                    contrastRatio: shade.contrastRatio,
                    textColor: shade.textColor
                  })),
                  {
                    hex: '#121212',
                    contrastRatio: chroma.contrast('#121212', colorSettings.darkMode.textColor.light),
                    textColor: colorSettings.darkMode.textColor.light
                  }
                ]
              }
            }
          };
        };

        const whiteColorData = createNeutralColorData('#FFFFFF', 'default-white', 'White', 0);
        const greyColorData = createNeutralColorData('#808080', 'default-grey', 'Grey', 1);
        const blackColorData = createNeutralColorData('#121212', 'default-black', 'Black', 9);
        
        // Add this line to store them in the ColorContext
        setNeutralColors({
          white: whiteColorData,
          grey: greyColorData,
          black: blackColorData
        });

        // Create state colors data
        const stateColorData: ColorData[] = Object.entries(stateColors).map(([name, color]) => {
          const modes = generateAllColorModes(color, colorSettings);
          
          return {
            id: `state-color-${name.toLowerCase()}`,
            baseHex: color,
            name: name,
            shadeIndex: 5,
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

        // Combine all color data - use reorderedColorData instead of extractedColorData
        const allColorData = [...reorderedColorData, neutralColorData, ...stateColorData];

        console.log('Setting color data to context');
        setColors(allColorData);
        setColorNames(allColorData.map(cd => cd.name));

        // Update local state for UI - use reorderedColorData instead of extractedColorData
        setLocalColors(reorderedColorData.map(cd => cd.baseHex));
        setLocalColorNames(reorderedColorData.map(cd => cd.name));
        setShadesRendered(true); 

        // Signal completion
        console.log('Color extraction complete, calling callback');
        if (onColorExtractionComplete) {
          onColorExtractionComplete();
        }

      } catch (err) {
        console.error('Error in color extraction:', err);
        setError('Failed to extract colors from image');
      } finally {
        setIsLoading(false);
      }
    };

    if (imageFile || imageUrl) {
      extractColors();
    }
  }, [imageFile, imageUrl, colorSettings, onColorExtractionComplete, setColors, setColorNames, setNeutralColors]);

  // Add effect to check when both colors and shades are ready
  useEffect(() => {
    if (!isLoading && colors.length > 0 && shadesRendered && !extractionCompleteRef.current) {
      console.log('All conditions met for color extraction completion');
      console.log({
        isLoading,
        colorsLength: colors.length,
        shadesRendered,
        extractionComplete: extractionCompleteRef.current
      });
      
      // Short timeout to ensure all state updates are processed
      setTimeout(() => {
        if (onColorExtractionComplete) {
          console.log('Calling onColorExtractionComplete');
          onColorExtractionComplete();
        }
      }, 100);
    }
  }, [isLoading, colors.length, shadesRendered, onColorExtractionComplete]);

=======
      console.log('Starting color extraction');
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

       // After all color processing is complete
       console.log('Color extraction successful');
       setColors(displayColors);
       setColorNames(displayColorNames);
       setContextColors(allColorData);
       setContextColorNames(allColorData.map(cd => cd.name));
     } catch (err) {
       console.error('Error extracting colors:', err);
       setError('Failed to extract colors from image');
     } finally {
       console.log('Setting loading to false in ColorPalette');
       setIsLoading(false);
     }
   };

   if (imageFile || imageUrl) {
     extractColors();
   }
 }, [imageFile, imageUrl, setContextColors, setContextColorNames]);

   // Add effect to check when both colors and shades are ready
   useEffect(() => {
    if (!isLoading && colors.length > 0 && shadesRendered && onColorExtractionComplete) {
      onColorExtractionComplete();
    }
  }, [isLoading, colors.length, shadesRendered, onColorExtractionComplete]);

>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
          
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
      
      const renderedShades = shades.map((shade, index) => (
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

      // After shades are rendered, set the flag
      if (!shadesRendered && renderedShades.length > 0) {
        setShadesRendered(true);
      }

      return renderedShades;
<<<<<<< HEAD
    } catch (err) {
      console.error('Error generating shades:', err);
      return null;
    }
=======
      } catch (err) {
      console.error('Error generating shades:', err);
      return null;
}
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
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