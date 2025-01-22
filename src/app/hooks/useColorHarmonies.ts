import { useState, useEffect, useCallback } from 'react';
import { generateColorHarmonies, ColorData, ColorHarmony } from '../utils/color-harmonies';
import { hexToRgb, rgbToHsl, hslToRgb } from '../utils/colors';
import { generateUniqueColorNames } from '../utils/color-namer';

interface HarmoniesState {
  analogous: ColorHarmony | null;
  monochromatic: ColorHarmony | null;
  triadic: ColorHarmony | null;
  tetradic: ColorHarmony | null;
  square: ColorHarmony | null;
  diadic: ColorHarmony | null;
  achromatic: ColorHarmony | null;
  splitComplementary: ColorHarmony | null;
}

export function useColorHarmonies(
  baseColors: (() => (string | ColorData)[]) | (string | ColorData)[]
) {
  // Handle both function and array inputs
  const getBaseColors = useCallback(() => {
    return typeof baseColors === 'function' ? baseColors() : baseColors;
  }, [baseColors]);

  // Process base colors into ColorData
  const processedBaseColors = useCallback(() => {
    const colors = getBaseColors();
    return colors.map(color => {
      // If already ColorData, return as-is
      if (typeof color === 'object' && 'baseHex' in color) {
        return {
          ...color,
          shadeIndex: typeof color.shadeIndex === 'string' 
            ? parseInt(color.shadeIndex) 
            : color.shadeIndex
        };
      }
      
      // If string, convert to ColorData
      const colorName = generateUniqueColorNames([color])[0];
      return {
        id: `${colorName.toLowerCase().replace(/\s+/g, '-')}`,
        baseHex: color as string,
        name: colorName,
        shadeIndex: 0,
        allModes: {
          'AA-light': { 
            allShades: []
          },
          'AA-dark': { 
            allShades: []
          },
          'AAA-light': { 
            allShades: []
          },
          'AAA-dark': { 
            allShades: []
          }
        }
      };
    });
  }, [getBaseColors]);

  const [harmonies, setHarmonies] = useState<HarmoniesState>({
    analogous: null,
    monochromatic: null,
    triadic: null,
    tetradic: null,
    square: null,
    diadic: null,
    achromatic: null,
    splitComplementary: null
  });

  useEffect(() => {
    const colors = processedBaseColors();

    console.log('Processed base colors:', colors);

    if (!colors || colors.length < 1) {
      console.warn('Invalid inputs provided');
      return;
    }

    try {
      const baseColor = colors[0];
      const palette = colors;
      
      console.log('Base color:', baseColor);
      console.log('Palette:', palette);

      const results = generateColorHarmonies(
        baseColor,
        palette,
        hexToRgb,
        rgbToHsl,
        hslToRgb
      );

      const newHarmonies = {
        analogous: results.find(r => r.type === 'analogous')?.colors || null,
        monochromatic: results.find(r => r.type === 'monochromatic')?.colors || null,
        triadic: results.find(r => r.type === 'triadic')?.colors || null,
        tetradic: results.find(r => r.type === 'tetradic')?.colors || null,
        square: results.find(r => r.type === 'square')?.colors || null,
        diadic: results.find(r => r.type === 'diadic')?.colors || null,
        achromatic: results.find(r => r.type === 'achromatic')?.colors || null,
        splitComplementary: results.find(r => r.type === 'split-complementary')?.colors || null
      };

      // Only update if there are actual changes
      setHarmonies(prev => {
        const hasChanges = Object.keys(newHarmonies).some(
          key => {
            const prevColor = prev[key as keyof HarmoniesState]?.primary?.baseHex;
            const newColor = newHarmonies[key as keyof HarmoniesState]?.primary?.baseHex;
            return prevColor !== newColor;
          }
        );
        
        return hasChanges ? newHarmonies : prev;
      });
    } catch (error) {
      console.error('Error generating color harmonies:', error);
    }
  }, [processedBaseColors]);

  return harmonies;
}