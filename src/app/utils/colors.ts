const chroma = require('chroma-js');

// Import quantize type
type QuantizeResult = {
  palette: () => [number, number, number][];
} | null;

declare const require: any;
const quantize: (pixels: number[][], colorCount: number) => QuantizeResult = require('@lokesh.dhakar/quantize').default;

// Color Space Type Definitions
interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

// Result Types
export interface ColorResult {
  color: string;
  textColor: string;
  contrastRatio: number;
}

// Settings Types
export interface ColorSettings {
  numberOfShades: number;
  numberOfColors: number;
  lightMode: {
    lightestShade: number;
    darkestShade: number;
    maxChroma: number;
    textColor: {
      light: string;
      dark: string;
      lightOpacity: number;
      darkOpacity: number;
    };
  };
  darkMode: {
    lightestShade: number;
    darkestShade: number;
    maxChroma: number;
    textColor: {
      light: string;
      dark: string;
      lightOpacity: number;
      darkOpacity: number;
    };
  };
  contrastMode: 'AA' | 'AAA';
  minContrastRatio: number;
}

function createPixelArray(pixels: Uint8ClampedArray, pixelCount: number, quality: number): [number, number, number][] {
  const pixelArray: [number, number, number][] = [];

  for (let i = 0; i < pixelCount; i += quality) {
    const offset = i * 4;
    const r = pixels[offset + 0];
    const g = pixels[offset + 1];
    const b = pixels[offset + 2];
    const a = pixels[offset + 3];

    // If pixel is mostly opaque and not white
    if (typeof a === 'undefined' || a >= 125) {
      if (!(r > 250 && g > 250 && b > 250)) {
        pixelArray.push([r, g, b]);
      }
    }
  }
  return pixelArray;
}

function validateOptions(options: { colorCount?: number; quality?: number }): { colorCount: number; quality: number } {
  let { colorCount, quality } = options;

  if (typeof colorCount === 'undefined' || !Number.isInteger(colorCount)) {
    colorCount = 10;
  } else if (colorCount === 1) {
    throw new Error('colorCount should be between 2 and 20');
  } else {
    colorCount = Math.max(colorCount, 2);
    colorCount = Math.min(colorCount, 20);
  }

  if (typeof quality === 'undefined' || !Number.isInteger(quality) || quality < 1) {
    quality = 10;
  }

  return { colorCount, quality };
}

// Color Conversion Utilities
export const hexToRgb = (hex: string): RGB | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (rgb: RGB): string => {
  return '#' + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
};

export const rgbToHsl = (rgb: RGB): HSL => {
  let { r, g, b } = rgb;
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { 
    h: h * 360, 
    s: s * 100, 
    l: l * 100 
  };
};

export const hslToRgb = ({ h, s, l }: HSL): RGB => {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
};

// Main Color Extraction Function
export const extractDominantColors = async (
  imageUrl: string,
  colorCount: number = 10,
  quality: number = 10
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      try {
        const options = validateOptions({
          colorCount,
          quality
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixelCount = canvas.width * canvas.height;
        const pixelArray = createPixelArray(imageData.data, pixelCount, options.quality);

        // Send array to quantize function which clusters values
        const cmap = quantize(pixelArray, options.colorCount);
        if (!cmap) {
          reject(new Error('Failed to generate palette'));
          return;
        }

        const palette = cmap.palette();
        if (!palette) {
          reject(new Error('Empty palette generated'));
          return;
        }

        // Convert to hex colors
        const colors = palette.map(([r, g, b]: [number, number, number]) => rgbToHex({ r, g, b }));
        resolve(colors);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
};

export const calculateRelativeLuminance = (color: string): number => {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;

  const { r, g, b } = rgb;
  const [rSRGB, gSRGB, bSRGB] = [r, g, b].map(c => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 
      ? sRGB / 12.92 
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rSRGB + 0.7152 * gSRGB + 0.0722 * bSRGB;
};

export const calculateContrastRatio = (color1: string, color2: string): number => {
  const l1 = calculateRelativeLuminance(color1);
  const l2 = calculateRelativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

// WCAG Color Mode Types
export type WCAGMode = 'AA-light' | 'AA-dark' | 'AAA-light' | 'AAA-dark';

// Shade Generation
export const generateShades = (
  baseColor: string,
  settings: ColorSettings,
  mode: 'light' | 'dark',
  minContrastRatio: number
): ColorResult[] => {
  const rgb = hexToRgb(baseColor);
  if (!rgb) return [];

  const modeSettings = mode === 'light' ? settings.lightMode : settings.darkMode;
  const shades: ColorResult[] = [];

  const adjustLightnessForContrast = (hsl: HSL): HSL => {
    let adjustedHsl = { ...hsl };
    let step = mode === 'light' ? -1 : 1;
    let maxTries = 100;
    let tries = 0;

    while (tries < maxTries) {
      const currentColor = rgbToHex(hslToRgb(adjustedHsl));
      const lightContrast = calculateContrastRatio(currentColor, modeSettings.textColor.light);
      const darkContrast = calculateContrastRatio(currentColor, modeSettings.textColor.dark);
      const bestContrast = Math.max(lightContrast, darkContrast);

      if (bestContrast >= minContrastRatio) {
        break;
      }

      adjustedHsl.l = Math.max(0, Math.min(100, adjustedHsl.l + step));
      tries++;
    }

    return adjustedHsl;
  };

  for (let i = 0; i < settings.numberOfShades; i++) {
    const t = i / (settings.numberOfShades - 1);
    // Always go from light to dark, regardless of mode
    let lightness = modeSettings.lightestShade - (t * (modeSettings.lightestShade - modeSettings.darkestShade));

    let hsl = rgbToHsl(rgb);
    hsl.l = lightness;

    if (hsl.s > modeSettings.maxChroma) {
      hsl.s = modeSettings.maxChroma;
    }

    hsl = adjustLightnessForContrast(hsl);
    const color = rgbToHex(hslToRgb(hsl));
    
    const lightContrast = calculateContrastRatio(color, modeSettings.textColor.light);
    const darkContrast = calculateContrastRatio(color, modeSettings.textColor.dark);

    let textColor, contrastRatio;
    if (mode === 'light') {
      if (darkContrast >= minContrastRatio) {
        textColor = modeSettings.textColor.dark;
        contrastRatio = darkContrast;
      } else {
        textColor = modeSettings.textColor.light;
        contrastRatio = lightContrast;
      }
    } else {
      if (lightContrast >= minContrastRatio) {
        textColor = modeSettings.textColor.light;
        contrastRatio = lightContrast;
      } else {
        textColor = modeSettings.textColor.dark;
        contrastRatio = darkContrast;
      }
    }

    shades.push({ color, textColor, contrastRatio });
  }

  return shades;
};

// Generate All Color Modes
export const generateAllColorModes = (
  baseColor: string,
  settings: ColorSettings
): Record<WCAGMode, ColorResult[]> => {
  // Generate shades for all WCAG modes
  const aaLight = generateShades(baseColor, settings, 'light', 4.5);
  const aaDark = generateShades(baseColor, settings, 'dark', 4.5);
  const aaaLight = generateShades(baseColor, settings, 'light', 7.1);
  const aaaDark = generateShades(baseColor, settings, 'dark', 7.1);

  // Rescale shades for AAA modes
  const aaaLightRescaled = rescaleShades(aaaLight, settings, 'light');
  const aaaDarkRescaled = rescaleShades(aaaDark, settings, 'dark');

  return {
    'AA-light': aaLight,
    'AA-dark': aaDark,
    'AAA-light': aaaLightRescaled,
    'AAA-dark': aaaDarkRescaled
  };
};

const rescaleShades = (
  shades: ColorResult[],
  settings: ColorSettings,
  mode: 'light' | 'dark'
): ColorResult[] => {
  // Find the necessary shades
  const modeSettings = mode === 'light' ? settings.lightMode : settings.darkMode;
  const { textColor } = modeSettings;

  const color1 = shades[0];
  const color2 = shades.reverse().find(shade => shade.textColor === textColor.dark);
  const color3 = shades.reverse().find(shade => shade.textColor === textColor.light);
  const color4 = shades[shades.length - 1];

  if (!color2 || !color3) {
    return shades;
  }

  // Count the number of shades with appropriate text color
  const shadesDarkText = shades.filter(shade => shade.textColor === textColor.dark).length;
  const shadesLightText = shades.filter(shade => shade.textColor === textColor.light).length;

  // Rescale the shades using chroma.js
  const rescaledDarkShades = chroma.scale([
    color1.color,
    color2.color,
  ])
  .mode('rgb')
  .colors(shadesDarkText)
  .map((color: string, index: number) => ({
    color,
    textColor: textColor.dark,
    contrastRatio: calculateContrastRatio(color, textColor.dark)
  }));

  const rescaledLightShades = chroma.scale([
    color3.color,
    color4.color
  ])
  .mode('rgb')
  .colors(shadesLightText)
  .map((color: string, index: number) => ({
    color,
    textColor: textColor.light,
    contrastRatio: calculateContrastRatio(color, textColor.light)
  }));

  return [...rescaledDarkShades, ...rescaledLightShades];
};