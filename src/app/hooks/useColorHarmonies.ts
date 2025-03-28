import { useEffect, useMemo } from 'react';
import {  HarmoniesState, ColorData  } from '../types/colors';
import { generateColorHarmonies } from '../utils/color-harmonies';
import { hexToRgb, rgbToHsl, hslToRgb, RGB, HSL } from '../utils/colors';

export function useColorHarmonies(
  baseColors: ColorData[],
  setHarmonies: (harmonies: HarmoniesState) => void,
  initialHarmonies: HarmoniesState
): void {
  // Safely process base colors input
  const processedBaseColors = useMemo(() => {
    console.group('Processing Base Colors');
    console.log('Input Base Colors:', baseColors.map(color => ({
      hex: color.baseHex,
      id: color.id,
      shadeIndex: color.shadeIndex
    })));

    if (!Array.isArray(baseColors) || baseColors.length === 0) {
      console.warn("Invalid or empty base colors array");
      console.groupEnd();
      return [];
    }

    const processed = baseColors.map(color => {
      if (!color || typeof color !== 'object') {
        console.warn("Invalid color object", color);
        return null;
      }

      try {
        const processedColor = {
          ...color,
          shadeIndex: typeof color.shadeIndex === 'string' 
            ? parseInt(color.shadeIndex, 10) 
            : (typeof color.shadeIndex === 'number' ? color.shadeIndex : 0),
          allModes: color.allModes || {
            'AA-light': { allShades: [] },
            'AA-dark': { allShades: [] },
            'AAA-light': { allShades: [] },
            'AAA-dark': { allShades: [] }
          }
        };

        console.log('Processed Color:', {
          hex: processedColor.baseHex,
          id: processedColor.id,
          shadeIndex: processedColor.shadeIndex,
          allModes: Object.keys(processedColor.allModes)
        });

        return processedColor;
      } catch (error) {
        console.error("Error processing color:", error);
        return null;
      }
    }).filter((color): color is ColorData => color !== null);

    console.log('Final Processed Base Colors:', processed.map(color => ({
      hex: color.baseHex,
      id: color.id,
      shadeIndex: color.shadeIndex
    })));
    
    console.groupEnd();
    return processed;
  }, [baseColors]);

  useEffect(() => {
    console.group('Color Harmonies Generation');
    console.log('Processed Base Colors:', processedBaseColors.map(color => ({
      hex: color.baseHex,
      id: color.id,
      shadeIndex: color.shadeIndex
    })));

    if (processedBaseColors.length === 0) {
      console.warn('No processed base colors available');
      setHarmonies(initialHarmonies);
      console.groupEnd();
      return;
    }

    try {
      const baseColor = processedBaseColors[0];
      console.log('Base Color for Harmony Generation:', {
        hex: baseColor.baseHex,
        id: baseColor.id,
        shadeIndex: baseColor.shadeIndex
      });
      
      // Wrap color conversion functions with error handling and default values
      const safeHexToRgb = (hex: string): RGB => {
        try {
          const result = hexToRgb(hex);
          if (!result) {
            throw new Error(`Invalid hex color: ${hex}`);
          }
          return result;
        } catch (error) {
          console.error(`Error converting hex to RGB: ${hex}`, error);
          return { r: 0, g: 0, b: 0 };
        }
      };

      const safeRgbToHsl = (rgb: RGB): HSL => {
        try {
          const result = rgbToHsl(rgb);
          if (!result) {
            throw new Error(`Invalid RGB color: ${JSON.stringify(rgb)}`);
          }
          return result;
        } catch (error) {
          console.error('Error converting RGB to HSL:', error);
          return { h: 0, s: 0, l: 0 };
        }
      };

      const safeHslToRgb = (rgb: RGB): RGB => {
        try {
          const hsl = rgbToHsl(rgb);
          return hslToRgb(hsl);
        } catch (error) {
          console.error('Error in HSL to RGB conversion:', error);
          return rgb;
        }
      };

      console.log('Generating harmonies with palette size:', processedBaseColors.length);
      
      const results = generateColorHarmonies(
        baseColor,
        processedBaseColors,
        safeHexToRgb,
        safeRgbToHsl,
        safeHslToRgb
      );
      
      // ENHANCED LOGGING FOR HARMONY COLORS
      console.log('Detailed Harmony Colors:', {
        totalHarmoniesGenerated: results.length,
        harmonies: results.map(harmony => ({
          type: harmony.type,
          primary: {
            hex: harmony.colors.primary.baseHex,
            id: harmony.colors.primary.id,
            shadeIndex: harmony.colors.primary.shadeIndex
          },
          secondary: {
            hex: harmony.colors.secondary.baseHex,
            id: harmony.colors.secondary.id,
            shadeIndex: harmony.colors.secondary.shadeIndex
          },
          tertiary: {
            hex: harmony.colors.tertiary.baseHex,
            id: harmony.colors.tertiary.id,
            shadeIndex: harmony.colors.tertiary.shadeIndex
          }
        }))
      });
      
      // Specifically highlight triadic harmony
      const triadicHarmony = results.find(r => r.type === 'triadic');
      if (triadicHarmony) {
        console.log('TRIADIC HARMONY DETAILS:', {
          primary: {
            hex: triadicHarmony.colors.primary.baseHex,
            id: triadicHarmony.colors.primary.id,
            shadeIndex: triadicHarmony.colors.primary.shadeIndex
          },
          secondary: {
            hex: triadicHarmony.colors.secondary.baseHex,
            id: triadicHarmony.colors.secondary.id,
            shadeIndex: triadicHarmony.colors.secondary.shadeIndex
          },
          tertiary: {
            hex: triadicHarmony.colors.tertiary.baseHex,
            id: triadicHarmony.colors.tertiary.id,
            shadeIndex: triadicHarmony.colors.tertiary.shadeIndex
          }
        });
      } else {
        console.warn('NO TRIADIC HARMONY FOUND');
      }

      console.log('Generated Harmony Results:', {
        type: typeof results,
        isArray: Array.isArray(results),
        length: results ? results.length : 'N/A',
        details: Array.isArray(results) 
          ? results.map(r => ({
              type: r.type,
              primary: {
                hex: r.colors?.primary?.baseHex,
                id: r.colors?.primary?.id
              },
              secondary: {
                hex: r.colors?.secondary?.baseHex,
                id: r.colors?.secondary?.id
              },
              tertiary: {
                hex: r.colors?.tertiary?.baseHex,
                id: r.colors?.tertiary?.id
              }
            }))
          : 'Not an array'
      });

      if (!Array.isArray(results)) {
        console.error('Invalid results from generateColorHarmonies');
        setHarmonies(initialHarmonies);
        console.groupEnd();
        return;
      }

      const newHarmonies: HarmoniesState = {
        triadic: results.find(r => r.type === 'triadic')?.colors || null,
        analogous: results.find(r => r.type === 'analogous')?.colors || null,
        monochromatic: results.find(r => r.type === 'monochromatic')?.colors || null,
        tetradic: results.find(r => r.type === 'tetradic')?.colors || null,
        square: results.find(r => r.type === 'square')?.colors || null,
        diadic: results.find(r => r.type === 'diadic')?.colors || null,
        achromatic: results.find(r => r.type === 'achromatic')?.colors || null,
        splitComplementary: results.find(r => r.type === 'split-complementary')?.colors || null
      };

      console.log('Final Harmonies State:', {
        analogous: newHarmonies.analogous ? {
          primary: newHarmonies.analogous.primary.baseHex,
          secondary: newHarmonies.analogous.secondary.baseHex,
          tertiary: newHarmonies.analogous.tertiary.baseHex
        } : null,
        triadic: newHarmonies.triadic ? {
          primary: newHarmonies.triadic.primary.baseHex,
          secondary: newHarmonies.triadic.secondary.baseHex,
          tertiary: newHarmonies.triadic.tertiary.baseHex
        } : null
      });

      setHarmonies(newHarmonies);
      console.groupEnd();
    } catch (error) {
      console.error('Error generating color harmonies:', error);
      setHarmonies(initialHarmonies);
      console.groupEnd();
    }
  }, [processedBaseColors, setHarmonies, initialHarmonies]);
}

