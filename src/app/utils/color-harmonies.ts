import { RGB, HSL } from './colors';
import { ColorResult } from './colors';

export interface ColorData {
  id: string;          // e.g., "crimson-red-5"
  baseHex: string;     // The actual hex color
  name: string;        // e.g., "Crimson Red"
  shadeIndex: number;  // 0-9 indicating which shade it is
}

export interface ColorHarmony {
  primary: ColorData;
  secondary: ColorData;
  tertiary: ColorData;
}

interface HarmonyResult {
  type: 'analogous' | 'monochromatic' | 'triadic' | 'tetradic' | 'square' | 'diadic' | 'achromatic' | 'split-complementary';
  colors: ColorHarmony;
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

function generateMonochromatic(color: ColorData, allShades: Record<string, ColorData[]>): ColorHarmony {
    const colorShades = allShades[color.name];
    if (!colorShades) {
        console.warn(`No shades found for color ${color.name}`);
        return { primary: color, secondary: color, tertiary: color };
    }

    const currentIndex = color.shadeIndex;
    let secondaryIndex: number;
    let tertiaryIndex: number;

    // Use the specific shade selection logic based on the current shade index
    switch (currentIndex) {
        case 1:
            secondaryIndex = 3;
            tertiaryIndex = 7;
            break;
        case 2:
            secondaryIndex = 0;
            tertiaryIndex = 7;
            break;
        case 3:
            secondaryIndex = 1;
            tertiaryIndex = 8;
            break;
        case 4:
            secondaryIndex = 2;
            tertiaryIndex = 8;
            break;
        case 5:
            secondaryIndex = 3;
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
            tertiaryIndex = 6;
            break;
        default:
            secondaryIndex = 3;
            tertiaryIndex = 7;
    }

    return {
        primary: color,
        secondary: colorShades[secondaryIndex],
        tertiary: colorShades[tertiaryIndex]
    };
}

function generateAnalogous(
    color: ColorData, 
    palette: ColorData[], 
    allShades: Record<string, ColorData[]>,
    hexToRgb: (hex: string) => RGB | null, 
    rgbToHsl: (rgb: RGB) => HSL
): ColorHarmony {
    const baseRgb = hexToRgb(color.baseHex);
    if (!baseRgb) throw new Error('Invalid base color');
    
    const baseHsl = rgbToHsl(baseRgb);
    
    // Generate target HSL values for analogous colors
    const secondaryHsl = { ...baseHsl, h: (baseHsl.h - 30 + 360) % 360 }; // -30°
    const tertiaryHsl = { ...baseHsl, h: (baseHsl.h + 30) % 360 };        // +30°

    const secondaryColor = findClosestColorData(secondaryHsl, palette, hexToRgb, rgbToHsl, true);
    const tertiaryColor = findClosestColorData(tertiaryHsl, palette, hexToRgb, rgbToHsl, true);

    return {
        primary: color,
        secondary: allShades[secondaryColor.name][color.shadeIndex],
        tertiary: allShades[tertiaryColor.name][color.shadeIndex]
    };
}

function generateTriadic(
    color: ColorData, 
    palette: ColorData[], 
    allShades: Record<string, ColorData[]>,
    hexToRgb: (hex: string) => RGB | null, 
    rgbToHsl: (rgb: RGB) => HSL
): ColorHarmony {
    const baseRgb = hexToRgb(color.baseHex);
    if (!baseRgb) throw new Error('Invalid base color');
    
    const baseHsl = rgbToHsl(baseRgb);
    
    // Generate target HSL values for triadic colors (120° apart)
    const secondaryHsl = { ...baseHsl, h: (baseHsl.h + 120) % 360 };
    const tertiaryHsl = { ...baseHsl, h: (baseHsl.h + 240) % 360 };

    const secondaryColor = findClosestColorData(secondaryHsl, palette, hexToRgb, rgbToHsl, true);
    const tertiaryColor = findClosestColorData(tertiaryHsl, palette, hexToRgb, rgbToHsl, true);

    return {
        primary: color,
        secondary: allShades[secondaryColor.name][color.shadeIndex],
        tertiary: allShades[tertiaryColor.name][color.shadeIndex]
    };
}

function generateSplitComplementary(
    color: ColorData, 
    palette: ColorData[], 
    allShades: Record<string, ColorData[]>,
    hexToRgb: (hex: string) => RGB | null, 
    rgbToHsl: (rgb: RGB) => HSL
): ColorHarmony {
    const baseRgb = hexToRgb(color.baseHex);
    if (!baseRgb) throw new Error('Invalid base color');
    
    const baseHsl = rgbToHsl(baseRgb);
    
    // Generate target HSL values for split complementary (150° and 210° from base)
    const secondaryHsl = { ...baseHsl, h: (baseHsl.h + 150) % 360 };
    const tertiaryHsl = { ...baseHsl, h: (baseHsl.h + 210) % 360 };

    const secondaryColor = findClosestColorData(secondaryHsl, palette, hexToRgb, rgbToHsl, true);
    const tertiaryColor = findClosestColorData(tertiaryHsl, palette, hexToRgb, rgbToHsl, true);

    return {
        primary: color,
        secondary: allShades[secondaryColor.name][color.shadeIndex],
        tertiary: allShades[tertiaryColor.name][color.shadeIndex]
    };
}

function generateTetradic(
    color: ColorData, 
    palette: ColorData[], 
    allShades: Record<string, ColorData[]>,
    hexToRgb: (hex: string) => RGB | null, 
    rgbToHsl: (rgb: RGB) => HSL
): ColorHarmony {
    const baseRgb = hexToRgb(color.baseHex);
    if (!baseRgb) throw new Error('Invalid base color');
    
    const baseHsl = rgbToHsl(baseRgb);
    
    // For tetradic, colors are 90° apart
    const secondaryHsl = { ...baseHsl, h: (baseHsl.h + 90) % 360 };
    const tertiaryHsl = { ...baseHsl, h: (baseHsl.h + 180) % 360 };

    const secondaryColor = findClosestColorData(secondaryHsl, palette, hexToRgb, rgbToHsl, true);
    const tertiaryColor = findClosestColorData(tertiaryHsl, palette, hexToRgb, rgbToHsl, true);

    return {
        primary: color,
        secondary: allShades[secondaryColor.name][color.shadeIndex],
        tertiary: allShades[tertiaryColor.name][color.shadeIndex]
    };
}

function generateSquare(
    color: ColorData, 
    palette: ColorData[], 
    allShades: Record<string, ColorData[]>,
    hexToRgb: (hex: string) => RGB | null, 
    rgbToHsl: (rgb: RGB) => HSL
): ColorHarmony {
    const baseRgb = hexToRgb(color.baseHex);
    if (!baseRgb) throw new Error('Invalid base color');
    
    const baseHsl = rgbToHsl(baseRgb);
    
    // For square harmony, colors are 90° apart
    const secondaryHsl = { ...baseHsl, h: (baseHsl.h + 90) % 360 };
    const tertiaryHsl = { ...baseHsl, h: (baseHsl.h + 180) % 360 };

    const secondaryColor = findClosestColorData(secondaryHsl, palette, hexToRgb, rgbToHsl, true);
    const tertiaryColor = findClosestColorData(tertiaryHsl, palette, hexToRgb, rgbToHsl, true);

    return {
        primary: color,
        secondary: allShades[secondaryColor.name][color.shadeIndex],
        tertiary: allShades[tertiaryColor.name][color.shadeIndex]
    };
}

function generateDiadic(
    color: ColorData, 
    palette: ColorData[], 
    allShades: Record<string, ColorData[]>,
    hexToRgb: (hex: string) => RGB | null, 
    rgbToHsl: (rgb: RGB) => HSL
): ColorHarmony {
    const baseRgb = hexToRgb(color.baseHex);
    if (!baseRgb) throw new Error('Invalid base color');
    
    const baseHsl = rgbToHsl(baseRgb);
    
    // For diadic, use complement (180°) and a variant of the base
    const complementHsl = { ...baseHsl, h: (baseHsl.h + 180) % 360 };
    const variantHsl = { ...baseHsl, s: Math.max(30, baseHsl.s - 30) };

    const secondaryColor = findClosestColorData(complementHsl, palette, hexToRgb, rgbToHsl, true);
    const tertiaryColor = findClosestColorData(variantHsl, palette, hexToRgb, rgbToHsl, true);

    return {
        primary: color,
        secondary: allShades[secondaryColor.name][color.shadeIndex],
        tertiary: allShades[tertiaryColor.name][color.shadeIndex]
    };
}

function generateAchromatic(
    color: ColorData, 
    palette: ColorData[], 
    allShades: Record<string, ColorData[]>
): ColorHarmony {
    const colorShades = allShades[color.name];
    if (!colorShades) {
        console.warn(`No shades found for color ${color.name}`);
        return { primary: color, secondary: color, tertiary: color };
    }

    // For achromatic, use lightest and darkest shades
    return {
        primary: color,
        secondary: colorShades[0],  // Lightest shade
        tertiary: colorShades[9]    // Darkest shade
    };
}

export function generateColorHarmonies(
    color: ColorData,
    palette: ColorData[],
    allShades: Record<string, ColorData[]>,
    hexToRgb: (hex: string) => RGB | null,
    rgbToHsl: (rgb: RGB) => HSL,
    hslToRgb: (hsl: HSL) => RGB
): HarmonyResult[] {
    if (!color || !palette || palette.length < 3) {
        throw new Error('Invalid inputs for harmony generation');
    }

    return [
        {
            type: 'analogous',
            colors: generateAnalogous(color, palette, allShades, hexToRgb, rgbToHsl)
        },
        {
            type: 'monochromatic',
            colors: generateMonochromatic(color, allShades)
        },
        {
            type: 'triadic',
            colors: generateTriadic(color, palette, allShades, hexToRgb, rgbToHsl)
        },
        {
            type: 'tetradic',
            colors: generateTetradic(color, palette, allShades, hexToRgb, rgbToHsl)
        },
        {
            type: 'square',
            colors: generateSquare(color, palette, allShades, hexToRgb, rgbToHsl)
        },
        {
            type: 'diadic',
            colors: generateDiadic(color, palette, allShades, hexToRgb, rgbToHsl)
        },
        {
            type: 'achromatic',
            colors: generateAchromatic(color, palette, allShades)
        },
        {
            type: 'split-complementary',
            colors: generateSplitComplementary(color, palette, allShades, hexToRgb, rgbToHsl)
        }
    ];
}