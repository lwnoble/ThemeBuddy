import { useState, useEffect } from 'react';
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
  baseColors: string[] | ColorData[]
) {
  // Convert input to ColorData if needed
  const processedBaseColors: ColorData[] = baseColors.map(color => {
    // If already ColorData, return as-is
    if (typeof color === 'object' && 'baseHex' in color) {
      return color;
    }
    
    // If string, convert to ColorData
    const colorName = generateUniqueColorNames([color])[0];
    return {
      id: `${colorName.toLowerCase().replace(/\s+/g, '-')}`,
      baseHex: color,
      name: colorName,
      shadeIndex: 0
    };
  });

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
    if (!processedBaseColors || processedBaseColors.length < 1) {
      console.warn('Invalid inputs provided');
      return;
    }

    try {
      // Use the first color as the base color
      const baseColor = processedBaseColors[0];
      
      // Generate a palette from the input colors
      const palette = processedBaseColors;
      
      // Generate shades for all colors
      const allShades: Record<string, ColorData[]> = {};
      palette.forEach(color => {
        // You might want to generate shades using your color generation utility
        allShades[color.name] = [color]; // Placeholder - replace with actual shade generation
      });

      const results = generateColorHarmonies(
        baseColor,
        palette,
        allShades,
        hexToRgb,
        rgbToHsl,
        hslToRgb
      );

      setHarmonies({
        analogous: results.find(r => r.type === 'analogous')?.colors || null,
        monochromatic: results.find(r => r.type === 'monochromatic')?.colors || null,
        triadic: results.find(r => r.type === 'triadic')?.colors || null,
        tetradic: results.find(r => r.type === 'tetradic')?.colors || null,
        square: results.find(r => r.type === 'square')?.colors || null,
        diadic: results.find(r => r.type === 'diadic')?.colors || null,
        achromatic: results.find(r => r.type === 'achromatic')?.colors || null,
        splitComplementary: results.find(r => r.type === 'split-complementary')?.colors || null
      });
    } catch (error) {
      console.error('Error generating color harmonies:', error);
    }
  }, [processedBaseColors]);

  return harmonies;
}