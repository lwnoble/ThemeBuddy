const chroma = require('chroma-js');

// Import quantize type
type QuantizeResult = {
  palette: () => [number, number, number][];
} | null;

declare const require: any;
const quantize: (pixels: number[][], colorCount: number) => QuantizeResult = require('@lokesh.dhakar/quantize').default;

// Color Space Type Definitions
export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
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
  deltaE: number;
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

// Add this after the color conversion utilities
const calculateEffectiveTextColor = (backgroundColor: string, textColor: string, opacity: number): string => {
  return chroma.mix(backgroundColor, textColor, opacity, 'rgb').hex();
};

// Result Interface
export interface ShadeResult {
  color: string;
  textColor: string;
  contrastRatio: number;
}

const adjustColorToMeetContrast = (
  color: string,
  textColor: string,
  textOpacity: number,
  minContrastRatio: number,
  isDarkText: boolean
): string => {
  let n = 0;
  let currentColor = color;
  let effectiveTextColor = calculateEffectiveTextColor(currentColor, textColor, textOpacity);
  let currentContrast = calculateContrastRatio(currentColor, effectiveTextColor);
  
  while (currentContrast < minContrastRatio && n <= 5) {
    n += 0.01;
    // If using dark text, make the background lighter
    // If using light text, make the background darker
    currentColor = isDarkText 
      ? chroma(color).tint(n).hex()
      : chroma(color).darken(n).hex();

    effectiveTextColor = calculateEffectiveTextColor(currentColor, textColor, textOpacity);
    currentContrast = calculateContrastRatio(currentColor, effectiveTextColor);
  }

  return currentColor;
};

export function generateShades(
  baseColor: string,
  settings: ColorSettings,
  mode: 'light' | 'dark',
  minContrastRatio: number
): ShadeResult[] {
  if (!settings || !settings.numberOfShades) {
    console.warn('Invalid settings provided to generateShades');
    return [];
  }

  const modeSettings = mode === 'light' ? settings.lightMode : settings.darkMode;
  
  if (!modeSettings || !modeSettings.textColor) {
    console.warn('Invalid mode settings or text color settings');
    return [];
  }

  const shades: ShadeResult[] = [];
  const { light: lightTextColor, dark: darkTextColor, lightOpacity, darkOpacity } =
    modeSettings.textColor;

  let lastValidColor: string | null = null;
  let lastValidTextColor: string | null = null;
  let lastValidContrast: number | null = null;

  for (let i = 0; i < settings.numberOfShades; i++) {
    try {
      // Calculate lightness for the shade
      const t = i / (settings.numberOfShades - 1);
      const lightness = modeSettings.lightestShade - 
        (t * (modeSettings.lightestShade - modeSettings.darkestShade));

      // Convert base color to the initial shade
      const baseParsedColor = hexToRgb(baseColor);
      if (!baseParsedColor) {
        console.warn(`Invalid base color: ${baseColor}`);
        continue;
      }

      const hsl = rgbToHsl(baseParsedColor);
      const newHsl = { ...hsl, l: lightness };
      const initialColor = rgbToHex(hslToRgb(newHsl));

      // Calculate effective text colors
      const effectiveLightText = calculateEffectiveTextColor(
        initialColor,
        lightTextColor,
        lightOpacity
      );
      const effectiveDarkText = calculateEffectiveTextColor(
        initialColor,
        darkTextColor,
        darkOpacity
      );

      // Get contrast ratios
      const lightContrast = calculateContrastRatio(initialColor, effectiveLightText);
      const darkContrast = calculateContrastRatio(initialColor, effectiveDarkText);

      // Choose initial text color based on better contrast
      const useDarkText = darkContrast > lightContrast;
      
      let finalColor = initialColor;
      let finalTextColor = useDarkText ? effectiveDarkText : effectiveLightText;
      let finalContrast = useDarkText ? darkContrast : lightContrast;

      // For light shades (using dark text)
      if (useDarkText) {
        // If we don't meet contrast and have a previous valid shade, use it
        if (finalContrast < minContrastRatio && lastValidColor && lastValidTextColor && lastValidContrast) {
          finalColor = lastValidColor;
          finalTextColor = lastValidTextColor;
          finalContrast = lastValidContrast;
        }
      }
      // For dark shades (using light text)
      else {
        // Try to darken until we meet contrast
        let n = 0;
        let foundValidColor = false;

        while (n <= 5000 && !foundValidColor) {
          const currentColor = chroma(initialColor).darken(n).hex();
          const effectiveText = calculateEffectiveTextColor(
            currentColor,
            lightTextColor,
            lightOpacity
          );
          const currentContrast = calculateContrastRatio(currentColor, effectiveText);

          if (currentContrast >= minContrastRatio) {
            finalColor = currentColor;
            finalTextColor = effectiveText;
            finalContrast = currentContrast;
            foundValidColor = true;
          }

          n += 0.01;
        }

        // If we couldn't find a valid color and have a previous valid one, use it
        if (!foundValidColor && lastValidColor && lastValidTextColor && lastValidContrast) {
          finalColor = lastValidColor;
          finalTextColor = lastValidTextColor;
          finalContrast = lastValidContrast;
        }
      }

      // Store this color if it meets contrast requirements
      if (finalContrast >= minContrastRatio) {
        lastValidColor = finalColor;
        lastValidTextColor = finalTextColor;
        lastValidContrast = finalContrast;
      }

      shades.push({
        color: finalColor,
        textColor: finalTextColor,
        contrastRatio: Number(finalContrast.toFixed(2))
      });

    } catch (error) {
      console.error('Error generating shade:', error);
    }
  }
  return shades;
}

export type WCAGMode = 'AA-light' | 'AA-dark' | 'AAA-light' | 'AAA-dark';

// Add this helper function
const getOptimizedDarkTextColor = (
  color: string,
  darkText: string,
  minContrastRatio: number
): string => {
  let n = 0;
  let currentColor = color;
  let lastValidColor = color;
  let currentContrast = calculateContrastRatio(currentColor, darkText);

  while (currentContrast >= minContrastRatio) {
    lastValidColor = currentColor;
    n += 0.01;
    currentColor = chroma(color).darken(n).hex();
    currentContrast = calculateContrastRatio(currentColor, darkText);
  }

  // Go back one step to get the darkest color that still meets contrast
  return lastValidColor;
};

const rescaleShades = (
  shades: ShadeResult[],
  settings: ColorSettings,
  mode: 'AA-light' | 'AA-dark' | 'AAA-light' | 'AAA-dark',
  minContrastRatio: number
): ShadeResult[] => {
  console.log('Starting rescale with:', { mode, minContrastRatio });
  console.log('Initial shades:', shades);

  const modeSettings = mode.startsWith('AA-light') ? settings.lightMode : settings.darkMode;
  const { textColor } = modeSettings;

  const shadesCopy = [...shades];
  // Create a reversed copy for finding transition points
  const reversedShades = [...shades].reverse();

  const color1 = shades[0]; // Lightest shade
  // Extract shades for conditional checks
  const shade4 = shades[4].color;
  const shade5 = shades[5].color;
  const shade6 = shades[6].color;

  // Find color2 index and get color3 as next color
  const color2Index = reversedShades.findIndex(shade => shade.textColor === textColor.dark);
  if (color2Index === -1 || color2Index === reversedShades.length - 1) {
    console.log('Could not find valid transition points');
    return shades;
  }

  const color2 = reversedShades[color2Index];
  const color3 = reversedShades[color2Index - 1];
  const color4 = shades[shades.length - 1]; // Darkest shade

  console.log('Found transition colors:', {
    color1: color1?.color,
    color2: color2?.color,
    color3: color3?.color,
    color4: color4?.color
  });

  if (!color2 || !color3) {
    console.log('Could not find transition points, returning original shades');
    return shades;
  }

  // Optimize color2
  const optimizedColor2 = getOptimizedDarkTextColor(
    color2.color,
    calculateEffectiveTextColor(
      color2.color,
      textColor.dark,
      textColor.darkOpacity
    ),
    minContrastRatio
  );
  console.log('Optimized color2:', optimizedColor2);

  // Calculate number of shades
  const darkTextShades = 5;
  const lightTextShades = 5;
  console.log('Shade counts:', { darkTextShades, lightTextShades });



  let rescaledDarkShades: ShadeResult[];
  let rescaledLightShades: ShadeResult[];

  if (!mode.startsWith('AA-light') || (mode.startsWith('AA-light') && color2Index >= 5)) {
    // Not AA light mode, or AA light mode with color2 in the first 5 shades
    rescaledDarkShades = chroma.scale([
      color1.color,
      optimizedColor2
    ])
    .colors(darkTextShades)
    .map((color: string) => ({
      color,
      textColor: calculateEffectiveTextColor(
        color,
        textColor.dark,
        textColor.darkOpacity
      ),
      contrastRatio: calculateContrastRatio(color, calculateEffectiveTextColor(
        color,
        textColor.dark,
        textColor.darkOpacity
      ))
    }));
  } else if(mode.startsWith('AA-light') && color2Index == 4){
    // AA light mode with color2 after the first 5 shades
    if (
      Math.abs(chroma.deltaE(shade4, shade5)) > 8
    ) {
      // Shades 4, 5, and 6 are very similar
      rescaledDarkShades = chroma.scale([
        color1.color,
        shade4
      ])
      .colors(4)
      .map((color: string) => ({
        color,
        textColor: calculateEffectiveTextColor(
          color,
          textColor.dark,
          textColor.darkOpacity
        ),
        contrastRatio: calculateContrastRatio(color, calculateEffectiveTextColor(
          color,
          textColor.dark,
          textColor.darkOpacity
        ))
      }));
      rescaledDarkShades.push({
        color: shade5,
        textColor: calculateEffectiveTextColor(
          shade5,
          textColor.dark,
          textColor.darkOpacity
        ),
        contrastRatio: calculateContrastRatio(shade5, calculateEffectiveTextColor(
          shade5,
          textColor.dark,
          textColor.darkOpacity
        ))
      });
    } else {
      // Shade 4 is different, but 5 and 6 are very close
      rescaledDarkShades = chroma.scale([
        color1.color,
        shade4
      ])
      .colors(5)
      .map((color: string) => ({
        color,
        textColor: calculateEffectiveTextColor(
          color,
          textColor.dark,
          textColor.darkOpacity
        ),
        contrastRatio: calculateContrastRatio(color, calculateEffectiveTextColor(
          color,
          textColor.dark,
          textColor.darkOpacity
        ))
      }));
    } 
  } else {
    if (
      Math.abs(chroma.deltaE(shade4, shade5)) > 8 &&
      Math.abs(chroma.deltaE(shade5, shade6)) > 8
    ) {
      // All shades are very different
      rescaledDarkShades = chroma.scale([
        color1.color,
        shade4
      ])
      .colors(3)
      .map((color: string) => ({
        color,
        textColor: calculateEffectiveTextColor(
          color,
          textColor.dark,
          textColor.darkOpacity
        ),
        contrastRatio: calculateContrastRatio(color, calculateEffectiveTextColor(
          color,
          textColor.dark,
          textColor.darkOpacity
        ))
      }));
      rescaledDarkShades.push({
        color: shade5,
        textColor: calculateEffectiveTextColor(
          shade5,
          textColor.dark,
          textColor.darkOpacity
        ),
        contrastRatio: calculateContrastRatio(shade5, calculateEffectiveTextColor(
          shade5,
          textColor.dark,
          textColor.darkOpacity
        ))
      });
      rescaledDarkShades.push({
        color: shade6,
        textColor: calculateEffectiveTextColor(
          shade6,
          textColor.dark,
          textColor.darkOpacity
        ),
        contrastRatio: calculateContrastRatio(shade6, calculateEffectiveTextColor(
          shade6,
          textColor.dark,
          textColor.darkOpacity
        ))
      });
    } else if (
        Math.abs(chroma.deltaE(shade4, shade5)) > 8 &&
        Math.abs(chroma.deltaE(shade5, shade6)) < 8
      ) {
      // Shades 4, 5, and 6 are very similar
      rescaledDarkShades = chroma.scale([
        color1.color,
        shade4
      ])
      .colors(4)
      .map((color: string) => ({
        color,
        textColor: calculateEffectiveTextColor(
          color,
          textColor.dark,
          textColor.darkOpacity
        ),
        contrastRatio: calculateContrastRatio(color, calculateEffectiveTextColor(
          color,
          textColor.dark,
          textColor.darkOpacity
        ))
      }));
      rescaledDarkShades.push({
        color: shade5,
        textColor: calculateEffectiveTextColor(
          shade5,
          textColor.dark,
          textColor.darkOpacity
        ),
        contrastRatio: calculateContrastRatio(shade5, calculateEffectiveTextColor(
          shade5,
          textColor.dark,
          textColor.darkOpacity
        ))
      });  
    }  else {
      // Shade 4 is different, but 5 and 6 are very close
      rescaledDarkShades = chroma.scale([
        color1.color,
        shade4
      ])
      .colors(5)
      .map((color: string) => ({
        color,
        textColor: calculateEffectiveTextColor(
          color,
          textColor.dark,
          textColor.darkOpacity
        ),
        contrastRatio: calculateContrastRatio(color, calculateEffectiveTextColor(
          color,
          textColor.dark,
          textColor.darkOpacity
        ))
      }));
    }
  }


  // Rescale light shades
  rescaledLightShades = chroma.scale([
    color3.color,
    color4.color
  ])
  .colors(lightTextShades)
  .map((color: string) => ({
    color,
    textColor: calculateEffectiveTextColor(
      color,
      textColor.light,
      textColor.lightOpacity
    ),
    contrastRatio: calculateContrastRatio(color, calculateEffectiveTextColor(
      color,
      textColor.light,
      textColor.lightOpacity
    ))
  }));

  const result = [...rescaledDarkShades, ...rescaledLightShades];
  console.log('Final rescaled results:', result);

  return result;
};

// Cache for storing pre-generated shades
const shadesCache: Record<string, Record<WCAGMode, ShadeResult[]>> = {};

export const generateAllColorModes = (
  baseColor: string,
  settings: ColorSettings
): Record<WCAGMode, ShadeResult[]> => {
  if (shadesCache[baseColor]) {
    return shadesCache[baseColor];
  }
  const aaLight = generateShades(baseColor, settings, 'light', 4.5);
  const aaDark = generateShades(baseColor, settings, 'dark', 4.5);
  const aaaLight = generateShades(baseColor, settings, 'light', 7.1);
  const aaaDark = generateShades(baseColor, settings, 'dark', 7.1);

  const aaLightRescaled = rescaleShades(aaLight, settings, 'AA-light', 4.5);
  const aaDarkRescaled = rescaleShades(aaDark, settings, 'AA-dark', 4.5);
  const aaaLightRescaled = rescaleShades(aaaLight, settings, 'AAA-light', 7.1);
  const aaaDarkRescaled = rescaleShades(aaaDark, settings, 'AAA-dark', 7.1);

 // Create the result object
 const result = {
  'AA-light': aaLightRescaled,
  'AA-dark': aaDarkRescaled,
  'AAA-light': aaaLightRescaled,
  'AAA-dark': aaaDarkRescaled
};

// Cache the result
shadesCache[baseColor] = result;

return result;
};

