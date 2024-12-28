import { hexToRgb, rgbToHsl } from './colors';

// Base color definitions with more precise hue ranges
const baseColors = [
  // Reds
  { name: 'Scarlet', hueRange: [350, 10], primaryHue: 0 },
  { name: 'Crimson', hueRange: [340, 350], primaryHue: 345 },
  { name: 'Vermilion', hueRange: [10, 30], primaryHue: 20 },
  
  // Oranges
  { name: 'Tangerine', hueRange: [20, 40], primaryHue: 30 },
  { name: 'Coral', hueRange: [10, 30], primaryHue: 20 },
  { name: 'Amber', hueRange: [40, 60], primaryHue: 50 },
  
  // Yellows
  { name: 'Lemon', hueRange: [50, 70], primaryHue: 60 },
  { name: 'Gold', hueRange: [40, 60], primaryHue: 50 },
  
  // Greens
  { name: 'Lime', hueRange: [90, 120], primaryHue: 105 },
  { name: 'Emerald', hueRange: [120, 150], primaryHue: 135 },
  { name: 'Forest', hueRange: [100, 140], primaryHue: 120 },
  { name: 'Sage', hueRange: [70, 100], primaryHue: 85 },
  
  // Blues
  { name: 'Turquoise', hueRange: [170, 190], primaryHue: 180 },
  { name: 'Sky', hueRange: [190, 210], primaryHue: 200 },
  { name: 'Navy', hueRange: [230, 250], primaryHue: 240 },
  { name: 'Azure', hueRange: [210, 230], primaryHue: 220 },
  
  // Purples
  { name: 'Lavender', hueRange: [270, 290], primaryHue: 280 },
  { name: 'Plum', hueRange: [290, 310], primaryHue: 300 },
  { name: 'Indigo', hueRange: [260, 280], primaryHue: 270 }
];

// Lightness descriptors (single word)
const lightnessDescriptors = [
  { range: [90, 100], name: 'Pale' },
  { range: [80, 90], name: 'Light' },
  { range: [70, 80], name: 'Soft' },
  { range: [60, 70], name: 'Muted' },
  { range: [50, 60], name: 'Medium' },
  { range: [40, 50], name: 'Deep' },
  { range: [30, 40], name: 'Rich' },
  { range: [20, 30], name: 'Dark' },
  { range: [0, 20], name: 'Midnight' }
];

// Saturation descriptors (single word)
const saturationDescriptors = [
  { range: [0, 10], name: 'Ashen' },
  { range: [10, 30], name: 'Muted' },
  { range: [30, 50], name: 'Soft' },
  { range: [50, 70], name: 'Vibrant' },
  { range: [70, 90], name: 'Vivid' },
  { range: [90, 100], name: 'Intense' }
];

/**
 * Find the base color for a given hue
 * @param hue Hue value in degrees
 * @returns Base color name
 */
const findBaseColor = (hue: number): string => {
  // Normalize hue to be within 0-360 range
  const normalizedHue = (hue + 360) % 360;
  
  // Find the base color that most closely matches the hue
  const matchedColor = baseColors.reduce((closest, current) => {
    // Special handling for wraparound colors (like red)
    const hueDifference = 
      current.hueRange[0] > current.hueRange[1] 
        ? Math.min(
            Math.abs(normalizedHue - current.primaryHue),
            360 - Math.abs(normalizedHue - current.primaryHue)
          )
        : (normalizedHue >= current.hueRange[0] && normalizedHue < current.hueRange[1])
          ? 0
          : Math.abs(normalizedHue - current.primaryHue);
    
    const closestDifference = 
      closest.difference !== undefined 
        ? closest.difference 
        : Infinity;
    
    return hueDifference < closestDifference
      ? { name: current.name, difference: hueDifference }
      : closest;
  }, {} as { name: string, difference?: number }).name;

  return matchedColor || 'Color';
};

/**
 * Name a color based on its HSL characteristics
 * @param hexColor Hex color code
 * @returns Descriptive color name
 */
export const nameColor = (hexColor: string): string => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return 'Color';

  const hsl = rgbToHsl(rgb);

  // Special case for very low saturation and extreme lightness
  if (hsl.s < 5) {
    if (hsl.l > 95) return 'White';
    if (hsl.l < 5) return 'Black';
    return 'Gray';
  }

  // Find base color by hue
  const baseColor = findBaseColor(hsl.h);

  // Find lightness descriptor
  const lightnessDesc = lightnessDescriptors.find(l => 
    hsl.l >= l.range[0] && hsl.l < l.range[1]
  )?.name || '';

  // Find saturation descriptor
  const saturationDesc = saturationDescriptors.find(s => 
    hsl.s >= s.range[0] && hsl.s < s.range[1]
  )?.name || '';

  // Prefer returning a single descriptor, prioritizing differently
  return lightnessDesc || saturationDesc || baseColor || 'Color';
};

/**
 * Generates unique names for a set of colors
 * @param colors Array of hex color codes
 * @returns Array of unique color names
 */
export const generateUniqueColorNames = (colors: string[]): string[] => {
  const usedNames = new Set<string>();
  
  return colors.map(color => {
    let name = nameColor(color);
    let uniqueName = name;
    let counter = 1;

    // Ensure unique names
    while (usedNames.has(uniqueName)) {
      uniqueName = `${name} ${counter}`;
      counter++;
    }

    usedNames.add(uniqueName);
    return uniqueName;
  });
};