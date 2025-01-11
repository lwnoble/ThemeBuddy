import { hexToRgb, rgbToHsl, hslToRgb, calculateContrastRatio } from './colors';
import { moodColorMap } from './color-mood-data';

export const detectMoodsFromText = (text: string): { mood: string; colors: string[] }[] => {
  const words = text.toLowerCase().split(/\s+/);
  const detectedMoods: { mood: string; colors: string[] }[] = [];

  words.forEach(word => {
    for (const [mood, colors] of Object.entries(moodColorMap)) {
      if (word === mood.toLowerCase()) {
        detectedMoods.push({ mood, colors });
        break;
      }
    }
  });

  return detectedMoods;
};

export interface ColorResult {
  color: string;
  textColor: string;
  contrastRatio: number;
}

export const generateColorPalette = (detectedMoods: { mood: string; colors: string[] }[]): ColorResult[] => {
  if (detectedMoods.length === 0) {
    return [];
  }
  // Select a random color from the first detected mood
  const moodColors = detectedMoods[0].colors;
  const randomIndex = Math.floor(Math.random() * moodColors.length);
  const baseColor = moodColors[randomIndex];
  
  // Randomly choose between monochromatic and analogous
  const isMonochromatic = Math.random() < 0.5;
  
  return isMonochromatic 
    ? generateMonochromaticColors(baseColor, 5)
    : generateAnalogousColors(baseColor, 5);
};

const generateAnalogousColors = (baseColor: string, count: number): ColorResult[] => {
  const baseRgb = hexToRgb(baseColor);
  if (!baseRgb) return [];

  const baseHsl = rgbToHsl(baseRgb);
  const results: ColorResult[] = [];

  for (let i = 0; i < count; i++) {
    const hue = (baseHsl.h + (i - Math.floor(count / 2)) * 30 + 360) % 360;
    const adjustedHsl = { ...baseHsl, h: hue };
    const rgb = hslToRgb(adjustedHsl);
    const hex = rgbToHex(rgb);
    const textColor = getContrastingTextColor(hex);
    const contrastRatio = calculateContrastRatio(hex, textColor);

    results.push({ color: hex, textColor, contrastRatio });
  }

  return results;
};

const generateMonochromaticColors = (baseColor: string, count: number): ColorResult[] => {
  const baseRgb = hexToRgb(baseColor);
  if (!baseRgb) return [];

  const baseHsl = rgbToHsl(baseRgb);
  const results: ColorResult[] = [];

  // Calculate lightness values that distribute across the range
  const lightnessValues = Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    // Interpolate between 10 and 90 lightness
    return Math.max(10, Math.min(90, baseHsl.l + (t - 0.5) * 80));
  });

  // Generate colors with same hue, varying lightness
  for (const lightness of lightnessValues) {
    const adjustedHsl = { 
      h: baseHsl.h, 
      s: baseHsl.s, 
      l: lightness 
    };
    const rgb = hslToRgb(adjustedHsl);
    const hex = rgbToHex(rgb);
    const textColor = getContrastingTextColor(hex);
    const contrastRatio = calculateContrastRatio(hex, textColor);

    results.push({ color: hex, textColor, contrastRatio });
  }

  return results;
};

const getContrastingTextColor = (backgroundColor: string): string => {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return '#000000';

  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  return '#' + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
}