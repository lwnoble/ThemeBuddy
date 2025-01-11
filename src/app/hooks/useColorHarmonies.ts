// src/hooks/useColorHarmonies.ts
import { useState, useEffect } from 'react';
import { generateColorHarmonies } from '../utils/color-harmonies';
import { hexToRgb, rgbToHsl, hslToRgb } from '../utils/colors';

export function useColorHarmonies(palette: string[]) {
  const [harmonies, setHarmonies] = useState<{
    analogous: { primary: string; secondary: string; tertiary: string; } | null;
    monochromatic: { primary: string; secondary: string; tertiary: string; } | null;
    triadic: { primary: string; secondary: string; tertiary: string; } | null;
    splitComplementary: { primary: string; secondary: string; tertiary: string; } | null;
  }>({
    analogous: null,
    monochromatic: null,
    triadic: null,
    splitComplementary: null
  });

  useEffect(() => {
    if (palette.length >= 3) {
      try {
        const results = generateColorHarmonies(palette, hexToRgb, rgbToHsl, hslToRgb);
        setHarmonies({
          analogous: results.find(r => r.type === 'analogous')?.colors || null,
          monochromatic: results.find(r => r.type === 'monochromatic')?.colors || null,
          triadic: results.find(r => r.type === 'triadic')?.colors || null,
          splitComplementary: results.find(r => r.type === 'split-complementary')?.colors || null
        });
      } catch (error) {
        console.error('Error generating color harmonies:', error);
      }
    }
  }, [palette]);

  return harmonies;
}