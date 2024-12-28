import quantize from '@lokesh.dhakar/quantize';

// Color Space Interfaces
interface RGB { r: number; g: number; b: number; }
interface HSL { h: number; s: number; l: number; }

// Result Interface
export interface ShadeResult {
  color: string;
  textColor: string;
  contrastRatio: number;
}

// Color Settings Interface
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

// Color Conversion Utilities
export const rgbToHex = (rgb: RGB): string => {
  return '#' + [rgb.r, rgb.g, rgb.b]
    .map(x => Math.round(x).toString(16).padStart(2, '0'))
    .join('');
};

export const hexToRgb = (hex: string): RGB | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHsl = (rgb: RGB): HSL => {
  let r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
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

  return { h: h * 360, s: s * 100, l: l * 100 };
};

export const hslToRgb = (hsl: HSL): RGB => {
  const h = hsl.h / 360, s = hsl.s / 100, l = hsl.l / 100;
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

  return { r: r * 255, g: g * 255, b: b * 255 };
};

export const calculateContrastRatio = (color1: string, color2: string): number => {
  const luminance1 = calculateRelativeLuminance(color1);
  const luminance2 = calculateRelativeLuminance(color2);

  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  return (lighter + 0.05) / (darker + 0.05);
};

export const calculateRelativeLuminance = (color: string): number => {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;

  const { r, g, b } = rgb;
  const [rSRGB, gSRGB, bSRGB] = [r, g, b].map(c => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rSRGB + 0.7152 * gSRGB + 0.0722 * bSRGB;
};

// Color Extraction Function
export const extractDominantColors = (
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  numberOfColors: number = 5
): string[] => {
  console.log('Extracting dominant colors...');
  console.log('Image dimensions:', width, 'x', height);
  console.log('Number of colors:', numberOfColors);

  const pixelCount = width * height;
  console.log('Pixel count:', pixelCount);

  try {
    const pixelArray = createPixelArray(imageData, pixelCount);
    console.log('Pixel array created, length:', pixelArray.length);

    if (!Array.isArray(pixelArray) || pixelArray.length === 0) {
      console.error('Invalid pixel array:', pixelArray);
      return [];
    }

    const cmap = quantize(pixelArray as [number, number, number][], numberOfColors);
    const palette = cmap ? cmap.palette() : [];
    console.log('Palette extracted:', palette);

    return palette.map(rgb => rgbToHex({ r: rgb[0], g: rgb[1], b: rgb[2] }));
  } catch (error) {
    console.error('Error in color extraction:', error);
    return [];
  }
};

function createPixelArray(imageData: Uint8ClampedArray, pixelCount: number): [number, number, number][] {
  console.log('Creating pixel array...');
  console.log('ImageData length:', imageData.length);
  console.log('Expected pixel count:', pixelCount);

  const pixels: [number, number, number][] = [];
  for (let i = 0; i < pixelCount; i++) {
    const offset = i * 4;
    const r = imageData[offset];
    const g = imageData[offset + 1];
    const b = imageData[offset + 2];
    const a = imageData[offset + 3];

    // If pixel is mostly opaque and not white
    if (typeof a === 'undefined' || a >= 125) {
      if (!(r > 250 && g > 250 && b > 250)) {
        pixels.push([r, g, b]);
      }
    }
  }

  console.log('Pixel array created, length:', pixels.length);
  return pixels;
}

// Color Shade Generation Function
export const generateShades = (
  baseColor: string,
  settings: ColorSettings,
  mode: 'light' | 'dark',
  contrastMode: 'AA' | 'AAA' = 'AA'
): ShadeResult[] => {
  const modeSettings = mode === 'light' ? settings.lightMode : settings.darkMode;
  const minContrastRatio = contrastMode === 'AA' ? 4.5 : 7;

  const shades: ShadeResult[] = [];

  for (let i = 0; i < settings.numberOfShades; i++) {
    const t = i / (settings.numberOfShades - 1);
    const lightness = mode === 'light'
      ? modeSettings.lightestShade - (t * (modeSettings.lightestShade - modeSettings.darkestShade))
      : modeSettings.darkestShade + (t * (modeSettings.lightestShade - modeSettings.darkestShade));

    const hsl = rgbToHsl(hexToRgb(baseColor)!);
    const newHsl = { ...hsl, l: lightness };
    const shadeColor = rgbToHex(hslToRgb(newHsl));

    const lightTextColor = modeSettings.textColor.light;
    const darkTextColor = modeSettings.textColor.dark;

    const lightContrast = calculateContrastRatio(shadeColor, lightTextColor);
    const darkContrast = calculateContrastRatio(shadeColor, darkTextColor);

    let textColor, contrastRatio;

    if (lightContrast >= minContrastRatio && lightContrast >= darkContrast) {
      textColor = lightTextColor;
      contrastRatio = lightContrast;
    } else if (darkContrast >= minContrastRatio) {
      textColor = darkTextColor;
      contrastRatio = darkContrast;
    } else {
      // If neither contrast is sufficient, choose the better one
      if (lightContrast > darkContrast) {
        textColor = lightTextColor;
        contrastRatio = lightContrast;
      } else {
        textColor = darkTextColor;
        contrastRatio = darkContrast;
      }
    }

    shades.push({
      color: shadeColor,
      textColor,
      contrastRatio
    });
  }

  return shades;
};