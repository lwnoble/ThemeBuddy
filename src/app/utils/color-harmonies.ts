// src/utils/color-harmonies.ts
import { RGB, HSL } from './colors';

interface ColorHarmony {
  primary: string;
  secondary: string;
  tertiary: string;
}

interface HarmonyResult {
  type: 'analogous' | 'monochromatic' | 'triadic' | 'tetradic' | 'square' | 'diadic' | 'achromatic' | 'split-complementary';
  colors: ColorHarmony;
}

// Helper to find the closest color in palette to a target HSL
function findClosestColor(
    targetHSL: HSL, 
    palette: string[], 
    hexToRgb: (hex: string) => RGB | null, 
    rgbToHsl: (rgb: RGB) => HSL,
    allowSimilarHue: boolean = false // New parameter to control hue similarity
  ): string {
    let closestColor = palette[0];
    let minDistance = Number.MAX_VALUE;
  
    palette.forEach(color => {
      const rgb = hexToRgb(color);
      if (!rgb) return;
      
      const hsl = rgbToHsl(rgb);
      
      // Calculate hue difference
      let hueDiff = Math.abs(targetHSL.h - hsl.h);
      if (hueDiff > 180) hueDiff = 360 - hueDiff;
      
      // If we're not allowing similar hues and the colors are too close in hue, skip this color
      if (!allowSimilarHue && hueDiff < 15) {
        return;
      }
  
      const distance = Math.sqrt(
        Math.pow(hueDiff * 1.5, 2) + // Weight hue more heavily
        Math.pow(targetHSL.s - hsl.s, 2) +
        Math.pow(targetHSL.l - hsl.l, 2)
      );
  
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = color;
      }
    });
  
    return closestColor;
  }

// Generate analogous harmony
function generateAnalogous(baseColor: string, palette: string[], hexToRgb: (hex: string) => RGB | null, rgbToHsl: (rgb: RGB) => HSL, hslToRgb: (hsl: HSL) => RGB): ColorHarmony {
    const baseRgb = hexToRgb(baseColor);
    if (!baseRgb) throw new Error('Invalid base color');
    
    const baseHsl = rgbToHsl(baseRgb);
    
    // Generate target HSL values for analogous colors (30° apart)
    const secondaryHsl = { ...baseHsl, h: (baseHsl.h + 30) % 360 };
    const tertiaryHsl = { ...baseHsl, h: (baseHsl.h - 30 + 360) % 360 };
  
    return {
      primary: baseColor,
      secondary: findClosestColor(secondaryHsl, palette, hexToRgb, rgbToHsl, false), // Avoid similar hues
      tertiary: findClosestColor(tertiaryHsl, palette, hexToRgb, rgbToHsl, false) // Avoid similar hues
    };
  }

// Generate monochromatic harmony
function generateMonochromatic(baseColor: string, palette: string[], hexToRgb: (hex: string) => RGB | null, rgbToHsl: (rgb: RGB) => HSL): ColorHarmony {
    const baseRgb = hexToRgb(baseColor);
    if (!baseRgb) throw new Error('Invalid base color');
    
    const baseHsl = rgbToHsl(baseRgb);
  
    // Find colors with very similar hue
    const similarHueColors = palette
      .map(color => {
        const rgb = hexToRgb(color);
        if (!rgb) return null;
        const hsl = rgbToHsl(rgb);
        const hueDiff = Math.abs(hsl.h - baseHsl.h);
        const isVerySimilarHue = hueDiff < 10; // Strict hue matching
        
        return isVerySimilarHue ? { color, hsl } : null;
      })
      .filter((item): item is { color: string; hsl: HSL } => item !== null)
      .sort((a, b) => a.hsl.l - b.hsl.l); // Sort by lightness
  
    // Get lighter colors (excluding the very lightest)
    const lighterColors = similarHueColors.filter(item => item.hsl.l > baseHsl.l).slice(0, -1);
    
    // Randomly select from lighter colors
    const getRandomColor = (colors: typeof similarHueColors) => {
      if (colors.length === 0) return null;
      const randomIndex = Math.floor(Math.random() * colors.length);
      return colors[randomIndex].color;
    };
  
    const secondary = getRandomColor(lighterColors) || findClosestColor(
      { ...baseHsl, l: Math.min(baseHsl.l + 20, 85) },
      palette,
      hexToRgb,
      rgbToHsl,
      true
    );
  
    const remainingLighterColors = lighterColors.filter(item => item.color !== secondary);
    const tertiary = getRandomColor(remainingLighterColors) || findClosestColor(
      { ...baseHsl, l: Math.min(baseHsl.l + 40, 90) },
      palette,
      hexToRgb,
      rgbToHsl,
      true
    );
  
    return {
      primary: baseColor,
      secondary,
      tertiary
    };
  }

// Generate triadic harmony
function generateTriadic(baseColor: string, palette: string[], hexToRgb: (hex: string) => RGB | null, rgbToHsl: (rgb: RGB) => HSL): ColorHarmony {
  const baseRgb = hexToRgb(baseColor);
  if (!baseRgb) throw new Error('Invalid base color');
  
  const baseHsl = rgbToHsl(baseRgb);
  
  // Generate target HSL values for triadic colors (120° apart)
  const secondaryHsl = { ...baseHsl, h: (baseHsl.h + 120) % 360 };
  const tertiaryHsl = { ...baseHsl, h: (baseHsl.h + 240) % 360 };

  return {
    primary: baseColor,
    secondary: findClosestColor(secondaryHsl, palette, hexToRgb, rgbToHsl),
    tertiary: findClosestColor(tertiaryHsl, palette, hexToRgb, rgbToHsl)
  };
}

// Generate split-complementary harmony
function generateSplitComplementary(baseColor: string, palette: string[], hexToRgb: (hex: string) => RGB | null, rgbToHsl: (rgb: RGB) => HSL): ColorHarmony {
  const baseRgb = hexToRgb(baseColor);
  if (!baseRgb) throw new Error('Invalid base color');
  
  const baseHsl = rgbToHsl(baseRgb);
  
  // Generate target HSL values for split complementary (150° and 210° from base)
  const secondaryHsl = { ...baseHsl, h: (baseHsl.h + 150) % 360 };
  const tertiaryHsl = { ...baseHsl, h: (baseHsl.h + 210) % 360 };

  return {
    primary: baseColor,
    secondary: findClosestColor(secondaryHsl, palette, hexToRgb, rgbToHsl),
    tertiary: findClosestColor(tertiaryHsl, palette, hexToRgb, rgbToHsl)
  };
}

// Generate tetradic harmony
function generateTetradic(baseColor: string, palette: string[], hexToRgb: (hex: string) => RGB | null, rgbToHsl: (rgb: RGB) => HSL): ColorHarmony {
  const baseRgb = hexToRgb(baseColor);
  if (!baseRgb) throw new Error('Invalid base color');
  
  const baseHsl = rgbToHsl(baseRgb);
  
  // For tetradic, colors are 90° apart
  const secondaryHsl = { ...baseHsl, h: (baseHsl.h + 90) % 360 };
  const tertiaryHsl = { ...baseHsl, h: (baseHsl.h + 180) % 360 };

  return {
    primary: baseColor,
    secondary: findClosestColor(secondaryHsl, palette, hexToRgb, rgbToHsl),
    tertiary: findClosestColor(tertiaryHsl, palette, hexToRgb, rgbToHsl)
  };
}

// Generate square harmony
function generateSquare(baseColor: string, palette: string[], hexToRgb: (hex: string) => RGB | null, rgbToHsl: (rgb: RGB) => HSL): ColorHarmony {
  const baseRgb = hexToRgb(baseColor);
  if (!baseRgb) throw new Error('Invalid base color');
  
  const baseHsl = rgbToHsl(baseRgb);
  
  // For square harmony, colors are 90° apart
  const secondaryHsl = { ...baseHsl, h: (baseHsl.h + 90) % 360 };
  const tertiaryHsl = { ...baseHsl, h: (baseHsl.h + 270) % 360 };

  return {
    primary: baseColor,
    secondary: findClosestColor(secondaryHsl, palette, hexToRgb, rgbToHsl),
    tertiary: findClosestColor(tertiaryHsl, palette, hexToRgb, rgbToHsl)
  };
}

// Generate diadic harmony
function generateDiadic(baseColor: string, palette: string[], hexToRgb: (hex: string) => RGB | null, rgbToHsl: (rgb: RGB) => HSL): ColorHarmony {
  const baseRgb = hexToRgb(baseColor);
  if (!baseRgb) throw new Error('Invalid base color');
  
  const baseHsl = rgbToHsl(baseRgb);
  
  // For diadic, use complement (180°) and a variant of the base
  const complementHsl = { ...baseHsl, h: (baseHsl.h + 180) % 360 };
  const variantHsl = { ...baseHsl, s: Math.max(30, baseHsl.s - 30) }; // Desaturated variant

  return {
    primary: baseColor,
    secondary: findClosestColor(complementHsl, palette, hexToRgb, rgbToHsl),
    tertiary: findClosestColor(variantHsl, palette, hexToRgb, rgbToHsl)
  };
}

// Generate achromatic harmony
function generateAchromatic(baseColor: string, palette: string[], hexToRgb: (hex: string) => RGB | null, rgbToHsl: (rgb: RGB) => HSL): ColorHarmony {
  const baseRgb = hexToRgb(baseColor);
  if (!baseRgb) throw new Error('Invalid base color');
  
  const baseHsl = rgbToHsl(baseRgb);
  
  // For achromatic, maintain hue but reduce saturation drastically
  const secondaryHsl = { ...baseHsl, s: 5, l: Math.min(90, baseHsl.l + 30) };
  const tertiaryHsl = { ...baseHsl, s: 5, l: Math.max(10, baseHsl.l - 30) };

  return {
    primary: baseColor,
    secondary: findClosestColor(secondaryHsl, palette, hexToRgb, rgbToHsl),
    tertiary: findClosestColor(tertiaryHsl, palette, hexToRgb, rgbToHsl)
  };
}

// Main function to generate all harmonies
export function generateColorHarmonies(palette: string[], hexToRgb: (hex: string) => RGB | null, rgbToHsl: (rgb: RGB) => HSL, hslToRgb: (hsl: HSL) => RGB): HarmonyResult[] {
  if (palette.length < 3) {
    throw new Error('Palette must contain at least 3 colors');
  }

  const sortedPalette = [...palette].sort((a, b) => {
    const rgbA = hexToRgb(a);
    const rgbB = hexToRgb(b);
    if (!rgbA || !rgbB) return 0;
    
    const brightnessA = (rgbA.r * 299 + rgbA.g * 587 + rgbA.b * 114) / 1000;
    const brightnessB = (rgbB.r * 299 + rgbB.g * 587 + rgbB.b * 114) / 1000;
    
    return brightnessB - brightnessA;
  });

  const baseColor = sortedPalette[0];

  return [
    {
      type: 'analogous',
      colors: generateAnalogous(baseColor, palette, hexToRgb, rgbToHsl, hslToRgb)
    },
    {
      type: 'monochromatic',
      colors: generateMonochromatic(baseColor, palette, hexToRgb, rgbToHsl)
    },
    {
      type: 'triadic',
      colors: generateTriadic(baseColor, palette, hexToRgb, rgbToHsl)
    },
    {
      type: 'tetradic',
      colors: generateTetradic(baseColor, palette, hexToRgb, rgbToHsl)
    },
    {
      type: 'square',
      colors: generateSquare(baseColor, palette, hexToRgb, rgbToHsl)
    },
    {
      type: 'diadic',
      colors: generateDiadic(baseColor, palette, hexToRgb, rgbToHsl)
    },
    {
      type: 'achromatic',
      colors: generateAchromatic(baseColor, palette, hexToRgb, rgbToHsl)
    },
    {
      type: 'split-complementary',
      colors: generateSplitComplementary(baseColor, palette, hexToRgb, rgbToHsl)
    }
  ];
}