import { RGB, HSL } from './colors';
import { ColorResult } from './colors';
<<<<<<< HEAD
import { ColorData } from '../types/colors';
export { ColorData };
const chroma = require('chroma-js');

// Remove the local ColorData interface definition
// No other changes needed
  
=======
const chroma = require('chroma-js');

>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
interface Shade {
    hex: string;
    textColor: string;
    contrastRatio: number;
  }
<<<<<<< HEAD
=======
  
  
  export interface ColorData {
    id: string;
    name: string;
    baseHex: string;
    shadeIndex: number;
    allModes: {
      'AA-light': { allShades: Array<{
        hex: string;
        contrastRatio: number;
        textColor: string;
      }> };
      'AA-dark': { allShades: Array<{
        hex: string;
        contrastRatio: number;
        textColor: string;
      }> };
      'AAA-light': { allShades: Array<{
        hex: string;
        contrastRatio: number;
        textColor: string;
      }> };
      'AAA-dark': { allShades: Array<{
        hex: string;
        contrastRatio: number;
        textColor: string;
      }> };
    };
  }
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe

export interface ColorHarmony {
  primary: ColorData;
  secondary: ColorData;
  tertiary: ColorData;
}

export function migrateColorData(oldData: any): ColorData {
    const createShades = (shades: any[]): Shade[] => {
      return shades.map(shade => ({
        hex: shade.hex,
        textColor: shade.textColor,
        contrastRatio: shade.contrastRatio
      }));
    };
  
    return {
      id: oldData.id,
      name: oldData.name,
      baseHex: oldData.baseHex,
      shadeIndex: typeof oldData.shadeIndex === 'string' 
        ? parseInt(oldData.shadeIndex) 
        : (oldData.shadeIndex || 0),
      allModes: {
        'AA-light': {
          allShades: createShades(oldData.allShades || [])
        },
        'AA-dark': {
          allShades: createShades(oldData.allShades || [])
        },
        'AAA-light': {
          allShades: createShades(oldData.allShades || [])
        },
        'AAA-dark': {
          allShades: createShades(oldData.allShades || [])
        }
      }
    };
  }

export interface ColorHarmony {
  primary: ColorData;
  secondary: ColorData;
  tertiary: ColorData;
}

export interface HarmonyResult {
    type: 'analogous' | 'monochromatic' | 'triadic' | 'tetradic' | 'square' | 'diadic' | 'achromatic' | 'split-complementary' | 'random';
    colors: {
      primary: ColorData;
      secondary: ColorData;
      tertiary: ColorData;
    };
  }
  
// Helper to find the closest color in palette to a target HSL
function findClosestColorData(
    targetHSL: HSL, 
    palette: ColorData[], 
    hexToRgb: (hex: string) => RGB | null, 
    rgbToHsl: (rgb: RGB) => HSL,
    allowSimilarHue: boolean = false
): ColorData {
    let closestColor = palette[0];
    let minDistance = Number.MAX_VALUE;
  
    palette.forEach(colorData => {
        const rgb = hexToRgb(colorData.baseHex);
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
            closestColor = colorData;
        }
    });
  
    return closestColor;
}

function areColorsSufficientlyDistinct(colors: string[], minDelta: number = 8): boolean {
  if (colors.length < 2) return true;

  // Check pairwise deltas
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const delta = chroma.deltaE(colors[i], colors[j]);
      if (delta < minDelta) {
        return false;
      }
    }
  }

  return true;
}

function generateMonochromatic(baseColor: ColorData): ColorHarmony {
    // Get the available shades from AA-light mode
    const shades = baseColor.allModes['AA-light'].allShades;
    if (!shades || shades.length === 0) {
        console.warn('No shades available for monochromatic harmony');
        return {
            primary: baseColor,
            secondary: baseColor,
            tertiary: baseColor
        };
    }

    const currentIndex = baseColor.shadeIndex;
    let secondaryIndex: number;
    let tertiaryIndex: number;

    switch (currentIndex) {
        case 1:
            secondaryIndex = 3;
            tertiaryIndex = 6;
            break;
        case 2:
            secondaryIndex = 0;
            tertiaryIndex = 6;
            break;
        case 3:
            secondaryIndex = 1;
            tertiaryIndex = 6;
            break;
        case 4:
            secondaryIndex = 2;
            tertiaryIndex = 7;
            break;
        case 5:
            secondaryIndex = 2;
            tertiaryIndex = 7;
            break;
        case 6:
            secondaryIndex = 2;
            tertiaryIndex = 8;
            break;
        case 7:
            secondaryIndex = 2;
            tertiaryIndex = 5;
            break;
        case 8:
            secondaryIndex = 3;
            tertiaryIndex = 5;
            break;
        default:
            secondaryIndex = 3;
            tertiaryIndex = 7;
    }

    // Create secondary and tertiary colors with new shade indices
    const secondary: ColorData = {
        ...baseColor,
        shadeIndex: secondaryIndex,
        baseHex: shades[secondaryIndex].hex
    };

    const tertiary: ColorData = {
        ...baseColor,
        shadeIndex: tertiaryIndex,
        baseHex: shades[tertiaryIndex].hex
    };

    return {
        primary: baseColor,
        secondary: secondary,
        tertiary: tertiary
    };
}

function generateAnalogous(
    color: ColorData, 
    palette: ColorData[], 
    hexToRgb: (hex: string) => RGB | null, 
    rgbToHsl: (rgb: RGB) => HSL
): ColorHarmony {
    const baseRgb = hexToRgb(color.baseHex);
    if (!baseRgb) throw new Error('Invalid base color');
    
    const baseHsl = rgbToHsl(baseRgb);
    
    const offsetVariations = [
        { secondary: -30, tertiary: 30 },
        { secondary: -45, tertiary: 45 },
        { secondary: -60, tertiary: 60 }
    ];

    for (const variation of offsetVariations) {
        const potentialSecondaryHsl = { 
            ...baseHsl, 
            h: (baseHsl.h + variation.secondary + 360) % 360 
        };
        const potentialTertiaryHsl = { 
            ...baseHsl, 
            h: (baseHsl.h + variation.tertiary) % 360 
        };

        const secondaryColor = findClosestColorData(
            potentialSecondaryHsl, 
            palette, 
            hexToRgb, 
            rgbToHsl, 
            true
        );
        const tertiaryColor = findClosestColorData(
            potentialTertiaryHsl, 
            palette, 
            hexToRgb, 
            rgbToHsl, 
            true
        );

<<<<<<< HEAD
        const secondary: ColorData = {
            ...secondaryColor
            // No shadeIndex assignment to preserve original shadeIndex
        };
        
        const tertiary: ColorData = {
            ...tertiaryColor
            // No shadeIndex assignment to preserve original shadeIndex
=======
        // Create new ColorData objects with the same shade index
        const secondary: ColorData = {
            ...secondaryColor,
            shadeIndex: color.shadeIndex
        };

        const tertiary: ColorData = {
            ...tertiaryColor,
            shadeIndex: color.shadeIndex
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
        };

        // Check color distinctiveness using baseHex values
        const colors = [
            color.baseHex,
            secondary.baseHex,
            tertiary.baseHex
        ];

        if (areColorsSufficientlyDistinct(colors)) {
            return {
                primary: color,
                secondary: secondary,
                tertiary: tertiary
            };
        }
    }

    // If no distinct colors found, return the base color for all
    return {
        primary: color,
        secondary: color,
        tertiary: color
    };
}

function generateTriadic(
    color: ColorData, 
    palette: ColorData[], 
    hexToRgb: (hex: string) => RGB | null, 
    rgbToHsl: (rgb: RGB) => HSL
): ColorHarmony {
    const baseRgb = hexToRgb(color.baseHex);
    if (!baseRgb) throw new Error('Invalid base color');
    
    const baseHsl = rgbToHsl(baseRgb);
    
    // Try multiple offset variations for triadic harmony
    const offsetVariations = [
        { secondary: 120, tertiary: 240 },
        { secondary: 135, tertiary: 225 },
        { secondary: 105, tertiary: 255 }
    ];

    for (const variation of offsetVariations) {
        const secondaryHsl = { ...baseHsl, h: (baseHsl.h + variation.secondary) % 360 };
        const tertiaryHsl = { ...baseHsl, h: (baseHsl.h + variation.tertiary) % 360 };

        const secondaryColor = findClosestColorData(
            secondaryHsl, 
            palette, 
            hexToRgb, 
            rgbToHsl, 
            true
        );
        const tertiaryColor = findClosestColorData(
            tertiaryHsl, 
            palette, 
            hexToRgb, 
            rgbToHsl, 
            true
        );

        // Create new ColorData objects with the same shade index
        const secondary: ColorData = {
<<<<<<< HEAD
            ...secondaryColor
            // No shadeIndex assignment to preserve original shadeIndex
        };
        
        const tertiary: ColorData = {
            ...tertiaryColor
            // No shadeIndex assignment to preserve original shadeIndex
=======
            ...secondaryColor,
            shadeIndex: color.shadeIndex
        };

        const tertiary: ColorData = {
            ...tertiaryColor,
            shadeIndex: color.shadeIndex
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
        };

        // Check color distinctiveness using baseHex values
        const colors = [
            color.baseHex,
            secondary.baseHex,
            tertiary.baseHex
        ];

        if (areColorsSufficientlyDistinct(colors)) {
            return {
                primary: color,
                secondary: secondary,
                tertiary: tertiary
            };
        }
    }

    // If no distinct colors found, return the base color for all
    return {
        primary: color,
        secondary: color,
        tertiary: color
    };
}

function generateSplitComplementary(
    color: ColorData, 
    palette: ColorData[], 
    hexToRgb: (hex: string) => RGB | null, 
    rgbToHsl: (rgb: RGB) => HSL
): ColorHarmony {
    const baseRgb = hexToRgb(color.baseHex);
    if (!baseRgb) throw new Error('Invalid base color');
    
    const baseHsl = rgbToHsl(baseRgb);
    
    // Generate target HSL values for split complementary (150° from base)
    const secondaryHsl = { ...baseHsl, h: (baseHsl.h + 150) % 360 };

    const secondaryColor = findClosestColorData(
        secondaryHsl, 
        palette, 
        hexToRgb, 
        rgbToHsl, 
        true
    );

    // Create white color data for tertiary
    const tertiaryColor: ColorData = {
        id: 'white',
        name: 'White',
        baseHex: '#FFFFFF',
        shadeIndex: 0,
        allModes: {
            'AA-light': { allShades: [] },
            'AA-dark': { allShades: [] },
            'AAA-light': { allShades: [] },
            'AAA-dark': { allShades: [] }
        }
    };

    return {
        primary: color,
        secondary: secondaryColor,
        tertiary: tertiaryColor
    };
}

function generateTetradic(
    color: ColorData, 
    palette: ColorData[], 
    hexToRgb: (hex: string) => RGB | null, 
    rgbToHsl: (rgb: RGB) => HSL
): ColorHarmony {
    const baseRgb = hexToRgb(color.baseHex);
    if (!baseRgb) throw new Error('Invalid base color');
    
    const baseHsl = rgbToHsl(baseRgb);
    
    // For tetradic, we'll use 90° and 180° intervals
    const secondaryHsl = { ...baseHsl, h: (baseHsl.h + 90) % 360 };
    const tertiaryHsl = { ...baseHsl, h: (baseHsl.h + 180) % 360 };

    const secondaryColor = findClosestColorData(
        secondaryHsl, 
        palette, 
        hexToRgb, 
        rgbToHsl, 
        true
    );
    const tertiaryColor = findClosestColorData(
        tertiaryHsl, 
        palette, 
        hexToRgb, 
        rgbToHsl, 
        true
    );

<<<<<<< HEAD
    // Create new ColorData objects while preserving their original shade indices
    const secondary: ColorData = {
        ...secondaryColor
        // No shadeIndex assignment to preserve original shadeIndex
    };

    const tertiary: ColorData = {
        ...tertiaryColor
        // No shadeIndex assignment to preserve original shadeIndex
    };

    // After creating secondary and tertiary objects
    console.group('Color Harmony Shade Indices');
    console.log('Primary color shadeIndex:', color.shadeIndex);
    console.log('Secondary color shadeIndex before:', secondaryColor.shadeIndex);
    console.log('Secondary color shadeIndex after:', secondary.shadeIndex);
    console.log('Tertiary color shadeIndex before:', tertiaryColor.shadeIndex);
    console.log('Tertiary color shadeIndex after:', tertiary.shadeIndex);
    console.groupEnd();

=======
    // Create new ColorData objects with the same shade index
    const secondary: ColorData = {
        ...secondaryColor,
        shadeIndex: color.shadeIndex
    };

    const tertiary: ColorData = {
        ...tertiaryColor,
        shadeIndex: color.shadeIndex
    };

>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
    return {
        primary: color,
        secondary: secondary,
        tertiary: tertiary
    };
<<<<<<< HEAD


=======
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
}


function generateSquare(
    color: ColorData, 
    palette: ColorData[], 
    hexToRgb: (hex: string) => RGB | null, 
    rgbToHsl: (rgb: RGB) => HSL
): ColorHarmony {
    const baseRgb = hexToRgb(color.baseHex);
    if (!baseRgb) throw new Error('Invalid base color');
    
    const baseHsl = rgbToHsl(baseRgb);
    
    // For square harmony, colors are 90° and 180° apart
    const secondaryHsl = { ...baseHsl, h: (baseHsl.h + 90) % 360 };
    const tertiaryHsl = { ...baseHsl, h: (baseHsl.h + 180) % 360 };

    const secondaryColor = findClosestColorData(
        secondaryHsl, 
        palette, 
        hexToRgb, 
        rgbToHsl, 
        true
    );
    const tertiaryColor = findClosestColorData(
        tertiaryHsl, 
        palette, 
        hexToRgb, 
        rgbToHsl, 
        true
    );

    // Create new ColorData objects with the same shade index
    const secondary: ColorData = {
<<<<<<< HEAD
        ...secondaryColor
        // No shadeIndex assignment to preserve original shadeIndex
    };

    const tertiary: ColorData = {
        ...tertiaryColor
        // No shadeIndex assignment to preserve original shadeIndex
=======
        ...secondaryColor,
        shadeIndex: color.shadeIndex
    };

    const tertiary: ColorData = {
        ...tertiaryColor,
        shadeIndex: color.shadeIndex
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
    };

    return {
        primary: color,
        secondary: secondary,
        tertiary: tertiary
    };
}

function generateDiadic(
    color: ColorData, 
    palette: ColorData[], 
    hexToRgb: (hex: string) => RGB | null, 
    rgbToHsl: (rgb: RGB) => HSL
): ColorHarmony {
    const baseRgb = hexToRgb(color.baseHex);
    if (!baseRgb) throw new Error('Invalid base color');
    
    const baseHsl = rgbToHsl(baseRgb);
    
    // For diadic, use complement (180°) and a variant of the base
    const complementHsl = { ...baseHsl, h: (baseHsl.h + 180) % 360 };
    const variantHsl = { ...baseHsl, s: Math.max(30, baseHsl.s - 30) };

    const secondaryColor = findClosestColorData(
        complementHsl, 
        palette, 
        hexToRgb, 
        rgbToHsl, 
        true
    );
    const tertiaryColor = findClosestColorData(
        variantHsl, 
        palette, 
        hexToRgb, 
        rgbToHsl, 
        true
    );

    // Create new ColorData objects with the same shade index
    const secondary: ColorData = {
<<<<<<< HEAD
        ...secondaryColor
        // No shadeIndex assignment to preserve original shadeIndex
    };
    
    const tertiary: ColorData = {
        ...tertiaryColor
        // No shadeIndex assignment to preserve original shadeIndex
=======
        ...secondaryColor,
        shadeIndex: color.shadeIndex
    };

    const tertiary: ColorData = {
        ...tertiaryColor,
        shadeIndex: color.shadeIndex
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
    };

    return {
        primary: color,
        secondary: secondary,
        tertiary: tertiary
    };
}

function generateAchromatic(baseColor: ColorData): ColorHarmony {
    // Create white ColorData for secondary
    const whiteColor: ColorData = {
        id: 'white',
        name: 'White',
        baseHex: '#FFFFFF',
        shadeIndex: 0,
        allModes: {
            'AA-light': { allShades: [] },
            'AA-dark': { allShades: [] },
            'AAA-light': { allShades: [] },
            'AAA-dark': { allShades: [] }
        }
    };

    // Create dark ColorData for tertiary
    const darkColor: ColorData = {
        id: 'dark',
        name: 'Dark',
        baseHex: '#121212',
        shadeIndex: 0,
        allModes: {
            'AA-light': { allShades: [] },
            'AA-dark': { allShades: [] },
            'AAA-light': { allShades: [] },
            'AAA-dark': { allShades: [] }
        }
    };

    return {
        primary: baseColor,
        secondary: whiteColor,
        tertiary: darkColor
    };
}


export function generateColorHarmonies(
    color: ColorData,
    palette: ColorData[],
    hexToRgb: (hex: string) => RGB | null,
    rgbToHsl: (rgb: RGB) => HSL,
<<<<<<< HEAD
    hslToRgb: (rgb: RGB) => RGB
=======
    hslToRgb: (hsl: HSL) => RGB
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
): HarmonyResult[] {
    console.log('Generating harmonies for:', color);
    console.log('Palette:', palette);

    if (!color || !color.name || !color.baseHex) {
        console.error('Invalid color object:', color);
        return [];
    }

    if (!palette || palette.length < 3) {
        console.error('Invalid palette:', palette);
        return [];
    }

    const allHarmonies: HarmonyResult[] = [];

<<<<<<< HEAD

    try {
        allHarmonies.push({
            type: 'triadic',
            colors: generateTriadic(color, palette, hexToRgb, rgbToHsl)
        });
    } catch (error) {
        console.error('Error generating triadic harmony:', error);
    }

=======
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
    try {
        allHarmonies.push({
            type: 'monochromatic',
            colors: generateMonochromatic(color)
        });
    } catch (error) {
        console.error('Error generating monochromatic harmony:', error);
    }

    try {
        allHarmonies.push({
            type: 'analogous',
            colors: generateAnalogous(color, palette, hexToRgb, rgbToHsl)
        });
    } catch (error) {
        console.error('Error generating analogous harmony:', error);
    }

    try {
        allHarmonies.push({
<<<<<<< HEAD
=======
            type: 'triadic',
            colors: generateTriadic(color, palette, hexToRgb, rgbToHsl)
        });
    } catch (error) {
        console.error('Error generating triadic harmony:', error);
    }

    try {
        allHarmonies.push({
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
            type: 'tetradic',
            colors: generateTetradic(color, palette, hexToRgb, rgbToHsl)
        });
    } catch (error) {
        console.error('Error generating tetradic harmony:', error);
    }

    try {
        allHarmonies.push({
            type: 'square',
            colors: generateSquare(color, palette, hexToRgb, rgbToHsl)
        });
    } catch (error) {
        console.error('Error generating square harmony:', error);
    }

    try {
        allHarmonies.push({
            type: 'diadic',
            colors: generateDiadic(color, palette, hexToRgb, rgbToHsl)
        });
    } catch (error) {
        console.error('Error generating diadic harmony:', error);
    }

    try {
        allHarmonies.push({
            type: 'achromatic',
            colors: generateAchromatic(color)  // Remove palette parameter
        });
    } catch (error) {
        console.error('Error generating achromatic harmony:', error);
    }

    try {
        allHarmonies.push({
            type: 'split-complementary',
            colors: generateSplitComplementary(color, palette, hexToRgb, rgbToHsl)
        });
    } catch (error) {
        console.error('Error generating split complementary harmony:', error);
    }

<<<<<<< HEAD
    // Add this after all harmonies are created but before the return
    console.group('Generated Harmony Shade Indices');
    allHarmonies.forEach(harmony => {
    console.log(`${harmony.type} harmony:`, {
        primary: harmony.colors.primary.shadeIndex,
        secondary: harmony.colors.secondary.shadeIndex,
        tertiary: harmony.colors.tertiary.shadeIndex
    });
    });
    console.groupEnd();

=======
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
    return allHarmonies.filter(harmony => 
        harmony.colors.primary && 
        (harmony.colors.secondary || harmony.colors.tertiary)  // Keep harmonies that have at least primary and one other color
    );
}