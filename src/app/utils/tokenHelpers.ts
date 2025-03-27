import { Mode } from '../types/modes';
import type { SurfaceStyle } from '../utils/styleProcessors'; 
import { ColorData } from '../types/colors';
import { Theme } from '../types/theme';
import { TokenRegistry } from './tokenRegistry';
import { processTokens, ProcessTokensParams } from '../utils/styleProcessors'; // Adjust import path as needed
const chroma = require('chroma-js');


// Define standard groups that will always be processed (without modifying existing arrays)
const STANDARD_BASE_GROUPS = [
  'Primary', 'Secondary', 'Tertiary', 'Default', 'White', 'Grey', 'Black'
];

/**
 * Expands a single group name to include its variants
 * @param groupName The base group name to expand
 * @returns Array of the base group and its variants
 */
export function expandGroupWithVariants(groupName: string): string[] {
  return [
    groupName,
    `${groupName}-Light`,
    `${groupName}-Dark`
  ];
}

/**
 * Processes tokens with automatic inclusion of base group variants
 * This is a wrapper around processTokens that ensures all variants are included
 */
export function processTokensWithVariants(params: Omit<ProcessTokensParams, 'specificGroups'>): void {
  // Create expanded groups from standard base groups
  const expandedGroups: string[] = [];
  
  // Add all standard groups with their variants
  STANDARD_BASE_GROUPS.forEach(group => {
    expandGroupWithVariants(group).forEach(variant => {
      expandedGroups.push(variant);
    });
  });
  
  // Call processTokens with the expanded groups
  processTokens({
    ...params,
    specificGroups: expandedGroups
  });
}

interface BaseColors {
  surface: string;
  surfaceDim: string;
  surfaceBright: string;
  container: string;
  containerLow: string;
  containerLowest: string;
  containerHigh: string;
  containerHighest: string;
}

interface ModeColorData {
  allShades: Array<{
    hex: string;
    contrastRatio: number;
    textColor: string;
  }>;
}

export interface UniversalBaseTokens {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  tertiary: string;
  tertiaryLight: string;
  tertiaryDark: string;
}

export interface TokenRegistryEntry {
  hex: string;
  name: string;
  mode: string;
  group: string;
}

interface ColorShade {
  hex: string;
  contrastRatio: number;
  textColor: string;
}

interface ColorShade {
  hex: string;
  textColor: string;
}

interface IconColorResult {
  iconColor: string;
  onColor: string;
}

interface ThemeColors {
  primary: ColorShade[];
  secondary: ColorShade[];
  tertiary: ColorShade[];
  error: ColorShade[];
  warning: ColorShade[];
  success: ColorShade[];
  info: ColorShade[];
}


interface ColorShade {
  hex: string;
  textColor: string;
}

interface IconColorResult {
  iconColor: string;
  onColor: string;
}

type ColorTypes = {
  primary: ColorShade[];
  secondary: ColorShade[];
  tertiary: ColorShade[];
  error: ColorShade[];
  warning: ColorShade[];
  success: ColorShade[];
  info: ColorShade[];
}

interface StyleColors {
  surface: string;
  surfaceDim: string;
  surfaceBright: string;
  container: string;
  containerLow: string;
  containerLowest: string;
  containerHigh: string;
  containerHighest: string;
}

interface BackgroundColors {
  surfaces?: string[];
  containers?: string[];
  iconBG?: string;
}

type BackgroundType = 'icon-BG' | 'surfaces' | 'containers';
type ColorType = 'primary' | 'secondary' | 'tertiary' | 'error' | 'warning' | 'success' | 'info';
type StyleType = 'tonal' | 'professional';

// Helper to check if a color is ColorData type
export function isColorData(color: ColorData | string): color is ColorData {
  return typeof color === 'object' && 'baseHex' in color;
}

export function modifyHSL(color: string): string[] {
  const hsl = chroma(color).hsl();
  const currentH = hsl[0];
  const currentS = hsl[1];
  const currentL = hsl[2];

  const newS = Math.max(0, currentS * 0.8);
  const newL = Math.max(0, currentL * 0.65);
  const newColor = chroma.hsl(currentH, newS, newL).hex();
  
  const alphaValues = [0.7, 0.54, 0.38, 0.32, 0.2];
  return alphaValues.map(alpha => {
    const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0');
    return `${newColor}${alphaHex}`;
  });
}

export function findHotlinkColor(
  surfaces: string[],
  shades: Array<{ hex: string; contrastRatio: number; textColor: string }>,
  isBlueStyle: boolean = false
): { color: string; requiresInvert: boolean } {
  if (isBlueStyle) {
    const blueColor = '#0066CC';
    const meetsContrast = surfaces.every(surface => 
      chroma.contrast(blueColor, surface) >= 4.5
    );
    return meetsContrast 
      ? { color: blueColor, requiresInvert: false }
      : { color: '#000000', requiresInvert: true };
  }

  const firstSurface = surfaces[0];
  const surfaceLuminance = chroma(firstSurface).luminance();
  
  const sortedShades = [...shades].sort((a, b) => {
    return surfaceLuminance < 0.5 
      ? shades.indexOf(a) - shades.indexOf(b)
      : shades.indexOf(b) - shades.indexOf(a);
  });

  for (const shade of sortedShades) {
    if (surfaces.every(surface => chroma.contrast(shade.hex, surface) >= 4.5)) {
      return { color: shade.hex, requiresInvert: false };
    }
  }

  return {
    color: surfaceLuminance < 0.5 ? '#FFFFFF' : '#000000',
    requiresInvert: true
  };
}

export function findButtonColor(
  allShades: Array<{ hex: string; contrastRatio: number; textColor: string }>,
  surfaces: string[],
  mode: Mode,
  style?: SurfaceStyle  // Add this optional parameter
): { buttonColor: string; buttonTextColor: string; halfButtonColor: string; halfButtonTextColor: string } {
  const contrastThresholds = {
    'AA-light': 4.5,
    'AAA-light': 7.1,
    'AA-dark': 4.5,
    'AAA-dark': 7.1
  };

  console.group('Finding Button Colors');
  console.log('Input shades:', allShades.map(shade => shade.hex));
  console.log('Surfaces:', surfaces);
  console.log('Mode:', mode);
  console.log('Style:', style);

  const requiredContrast = contrastThresholds[mode];
  const isDarkMode = mode.includes('dark');
  const surfaceLuminance = chroma(surfaces[0]).luminance();
  
  const sortedShades = [...allShades].sort((a, b) => {
    if (isDarkMode) {
      return chroma(a.hex).luminance() - chroma(b.hex).luminance();
    }
    return chroma(b.hex).luminance() - chroma(a.hex).luminance();
  });

  // Find a suitable button color with sufficient contrast
  const selectedShade = sortedShades.find(shade => 
    surfaces.every(surface => chroma.contrast(shade.hex, surface) >= 3.1)
  ) || sortedShades[0];

  console.log('Selected Shade:', selectedShade);

  // Ensure the button color is a 7-digit hex
  const buttonColor = selectedShade.hex.startsWith('#') 
    ? (selectedShade.hex.length > 7 ? selectedShade.hex.slice(0, 7) : selectedShade.hex)
    : `#${selectedShade.hex}`.slice(0, 7);

  // Create half opacity version with 80 (50% opacity)
  const halfButtonColor = `${buttonColor}80`; // Always use proper 8-digit hex with 50% opacity

  console.log('Button Color:', buttonColor);
  console.log('Half Button Color:', halfButtonColor);

  // Get button text color using findOnSurfaceTextColor for proper contrast
  const buttonTextColor = findOnSurfaceTextColor(allShades, [buttonColor], mode, style);
  // For the half button, also use findOnSurfaceTextColor against all surfaces
  const halfButtonTextColor = findOnSurfaceTextColor(allShades, surfaces, mode, style);

  const result = {
    buttonColor,
    buttonTextColor,
    halfButtonColor,
    halfButtonTextColor
  };
  
  console.log('Final Button Colors:', result);
  console.groupEnd();
  return result;
}

export function findOnSurfaceTextColor(
  allShades: Array<{ hex: string; contrastRatio: number; textColor: string }>,
  surfaces: string[],
  mode: Mode,
  style?: SurfaceStyle
): string {
  console.group(`findOnSurfaceTextColor for style: '${style || 'undefined'}' in mode: '${mode}'`);
  
  const contrastThresholds = {
    'AA-light': 4.5,
    'AAA-light': 7.1,
    'AA-dark': 4.5,
    'AAA-dark': 7.1
  };

  const requiredContrast = contrastThresholds[mode];
  const surfaceLuminance = chroma(surfaces[0]).luminance();
  const isDarkMode = mode.includes('dark');
  
  console.log('Style passed to function:', style);
  console.log('Is style professional?', style?.includes('professional'));
  console.log('Is style tonal?', style?.includes('tonal'));
  console.log('Surface style specific type:', style);
  console.log('Surfaces:', surfaces);
  console.log('Surface luminance:', surfaceLuminance);
  console.log('Is dark mode?', isDarkMode);
  console.log('Required contrast:', requiredContrast);
  console.log('Available shades:', allShades.length ? allShades.map((s, idx) => ({ idx, hex: s.hex })) : 'No shades available');
  
  // Professional styles: choose the proper color based on contrast requirements
  if (style && style.includes('professional')) {
    console.log('Professional style path activated');
    if (isDarkMode) {
      // For dark mode, check if white or black has better contrast
      const whiteContrast = surfaces.map(surface => chroma.contrast('rgba(255,255,255,0.7)', surface));
      const blackContrast = surfaces.map(surface => chroma.contrast('rgba(0,0,0,0.87)', surface));
      
      // Calculate the minimum contrast for each option across all surfaces
      const minWhiteContrast = Math.min(...whiteContrast);
      const minBlackContrast = Math.min(...blackContrast);
      
      console.log('Dark mode professional - min white contrast:', minWhiteContrast);
      console.log('Dark mode professional - min black contrast:', minBlackContrast);
      
      // Return the color with better minimum contrast
      const result = minWhiteContrast >= minBlackContrast ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.87)';
      console.log('Returning professional dark mode color:', result);
      console.groupEnd();
      return result;
    } else {
      // For light mode, check if white or black has better contrast
      const whiteContrast = surfaces.map(surface => chroma.contrast('#FFFFFF', surface));
      const blackContrast = surfaces.map(surface => chroma.contrast('#121212', surface));
      
      // Calculate the minimum contrast for each option across all surfaces
      const minWhiteContrast = Math.min(...whiteContrast);
      const minBlackContrast = Math.min(...blackContrast);
      
      console.log('Light mode professional - min white contrast:', minWhiteContrast);
      console.log('Light mode professional - min black contrast:', minBlackContrast);
      
      // Return the color with better minimum contrast
      const result = minBlackContrast >= minWhiteContrast ? '#121212' : '#FFFFFF';
      console.log('Returning professional light mode color:', result);
      console.groupEnd();
      return result;
    }
  }

  // For light-tonal style, directly use the 7th shade if available
  if (style === 'light-tonal' && allShades.length > 7) {
    console.log('Light-tonal style specific path activated');
    // Make sure the shade has sufficient contrast with all surfaces
    const shade7 = allShades[7];
    console.log('Shade 7 value:', shade7.hex);
    
    // Log the contrast of shade 7 with each surface
    const shade7Contrasts = surfaces.map(surface => {
      const contrast = chroma.contrast(shade7.hex, surface);
      console.log(`Contrast of shade 7 with surface ${surface}: ${contrast.toFixed(2)}`);
      return contrast;
    });
    
    const allSurfacesHaveSufficientContrast = shade7Contrasts.every(contrast => contrast >= 3.1);
    console.log('All surfaces have sufficient contrast with shade 7:', allSurfacesHaveSufficientContrast);
    
    if (allSurfacesHaveSufficientContrast) {
      console.log('Returning shade 7 for light-tonal style:', shade7.hex);
      console.groupEnd();
      return shade7.hex;
    } else {
      console.log('Shade 7 does not have sufficient contrast with all surfaces, continuing to general tonal processing...');
    }
  }

  // For other tonal styles
  if (style && style.includes('tonal')) {
    console.log('General tonal style path activated');
    const shadeSelectionStrategy = (() => {
      if (!style) return [7, 8];
      
      switch (style) {
        case 'light-tonal':
          return [7, 8, 9]; // Added fallback indices
        case 'dark-tonal':
          return [2, 1, 0,];
        case 'colorful-tonal':
          // For colorful-tonal, use multiple indices based on luminance
          return surfaceLuminance < 0.5 
            ? [4, 3, 2, 1, 0] // Dark surface, try lighter shades
            : [7, 9, 8 ];   // Light surface, try darker shades
        default:
          return [5, 6, 7, 8];
      }
    })();
    
    console.log('Shade selection strategy for style:', style, shadeSelectionStrategy);

    // Try to find a shade with proper contrast
    for (const index of shadeSelectionStrategy) {
      const shade = allShades[index];
      if (!shade) {
        console.log(`Shade index ${index} not available, skipping`);
        continue;
      }
      
      console.log(`Checking shade ${index}: ${shade.hex}`);
      
      // Log the contrast of this shade with each surface
      const shadeContrasts = surfaces.map(surface => {
        const contrast = chroma.contrast(shade.hex, surface);
        console.log(`Contrast of shade ${index} with surface ${surface}: ${contrast.toFixed(2)}`);
        return contrast;
      });
      
      const allSurfacesHaveSufficientContrast = shadeContrasts.every(contrast => contrast >= requiredContrast);
      console.log(`All surfaces have sufficient contrast (${requiredContrast}) with shade ${index}:`, allSurfacesHaveSufficientContrast);
      
      if (allSurfacesHaveSufficientContrast) {
        console.log(`Returning shade ${index} for ${style} style:`, shade.hex);
        console.groupEnd();
        return shade.hex;
      }
    }
    
    // Special fallback for colorful-tonal
    if (style === 'colorful-tonal' && allShades.length > 0) {
      console.log('Using special colorful-tonal fallback - trying all shades for at least minimum contrast');
      
      // Try all available shades to find one with at least 3.1 contrast
      for (let i = 0; i < allShades.length; i++) {
        const shade = allShades[i];
        console.log(`Checking shade ${i} for minimum contrast: ${shade.hex}`);
        
        const shadeContrasts = surfaces.map(surface => {
          const contrast = chroma.contrast(shade.hex, surface);
          console.log(`Contrast of shade ${i} with surface ${surface}: ${contrast.toFixed(2)}`);
          return contrast;
        });
        
        const allSurfacesHaveMinimumContrast = shadeContrasts.every(contrast => contrast >= 3.1);
        console.log(`All surfaces have minimum contrast (3.1) with shade ${i}:`, allSurfacesHaveMinimumContrast);
        
        if (allSurfacesHaveMinimumContrast) {
          console.log(`Using shade ${i} as colorful-tonal fallback:`, shade.hex);
          console.groupEnd();
          return shade.hex;
        }
      }
      
      // If no shade has 3.1 contrast, use textColor from a representative shade
      const representativeIndex = surfaceLuminance < 0.5 ? 4 : 7;
      if (allShades[representativeIndex]) {
        console.log(`No shade has minimum contrast, using textColor from shade ${representativeIndex}:`, 
                   allShades[representativeIndex].textColor);
        console.groupEnd();
        return allShades[representativeIndex].textColor;
      }
    }
    
    console.log('No suitable shade found with the required contrast after trying all strategies');
  }

  // Fallback based on surface luminance
  const fallbackColor = surfaceLuminance < 0.5 ? '#FFFFFF' : '#121212';
  console.log(`No suitable color found through style-specific paths. Falling back to ${fallbackColor} based on surface luminance ${surfaceLuminance}`);
  console.groupEnd();
  return fallbackColor;
}

export function generateQuietSurfaceColor(
  surfaceColor: string,
  colorToMixWith: string,
  requiredContrast: number
): string {
  console.group('GENERATING QUIET SURFACE COLOR');
  console.log('SURFACE COLOR:', surfaceColor);
  console.log('COLOR TO MIX WITH:', colorToMixWith);
  console.log('REQUIRED CONTRAST:', requiredContrast);
  
  let n = 1;
  let lastValidN = null;

  while (n > 0) {
    const newColor = chroma.mix(surfaceColor, colorToMixWith, n, 'rgb').hex();
    const contrastRatio = chroma.contrast(surfaceColor, newColor);
    
    console.log(`N: ${n.toFixed(2)}, NEW COLOR: ${newColor}, CONTRAST RATIO: ${contrastRatio.toFixed(2)}`);
    
    if (contrastRatio <= requiredContrast) {
      lastValidN = n;
      console.log(`FOUND VALID N: ${lastValidN} (CONTRAST: ${contrastRatio.toFixed(2)})`);
      break;
    }
    n = n - 0.01;
  }

  const result = lastValidN !== null
    ? chroma.mix(surfaceColor, colorToMixWith, lastValidN + .01, 'rgb').hex()
    : surfaceColor;
    
  console.log('FINAL N VALUE:', lastValidN !== null ? (lastValidN + 0.01).toFixed(2) : 'NULL');
  console.log('FINAL RESULT:', result);
  
  if (lastValidN !== null) {
    const finalContrast = chroma.contrast(
      surfaceColor, 
      chroma.mix(surfaceColor, colorToMixWith, lastValidN + .01, 'rgb').hex()
    );
    console.log('FINAL CONTRAST WITH SURFACE:', finalContrast.toFixed(2));
    console.log('FINAL CONTRAST WITH TEXT:', chroma.contrast(colorToMixWith, result).toFixed(2));
  } else {
    console.log('USING FALLBACK (ORIGINAL SURFACE COLOR)');
  }
  
  console.groupEnd();
  
  return result;
}

export function findTextColor(
  allShades: Array<{ hex: string; contrastRatio: number; textColor: string }>,
  surfaces: string[],
  minContrastRatio: number,
  mode: Mode,
  style?: SurfaceStyle
): string {
  const contrastThresholds = {
    'AA-light': 4.5,
    'AAA-light': 7.1,
    'AA-dark': 4.5,
    'AAA-dark': 7.1
  };

  const actualContrastRatio = contrastThresholds[mode];
  const surfaceLuminance = chroma(surfaces[0]).luminance();
  
  // Professional styles: use neutral colors
  if (style && style.includes('professional')) {
    return mode.includes('dark') 
      ? 'rgba(255,255,255,0.7)' 
      : 'rgba(0,0,0,0.87)';
  }

  // Tonal styles with specific shade selection logic
  if (style && style.includes('tonal')) {
    // Find the shade with the closest contrast to the required threshold
    let bestShade = null;
    let smallestContrastDifference = Infinity;

    // Different selection strategies based on tonal style and surface luminance
    const shadeSelectionStrategy = (() => {
      if (!style) return [7, 8];
      
      switch (style) {
        case 'light-tonal':
          return [7, 8];
        case 'dark-tonal':
          return [1, 0];
        case 'colorful-tonal':
          return surfaceLuminance < 0.5 ? [1, 0] : [7, 9];
        default:
          return [7, 8];
      }
    })();

    for (const index of shadeSelectionStrategy) {
      const shade = allShades[index];
      if (!shade) continue;

      const surfaceContrasts = surfaces.map(surface => 
        chroma.contrast(shade.hex, surface)
      );

      // Check if ALL surfaces meet at least minimum contrast
      const allMeetMinimumContrast = surfaceContrasts.every(contrast => contrast >= 3.1);
      
      // Calculate the absolute difference from the required contrast
      const avgContrast = surfaceContrasts.reduce((a, b) => a + b, 0) / surfaceContrasts.length;
      const contrastDifference = Math.abs(avgContrast - actualContrastRatio);

      if (allMeetMinimumContrast && contrastDifference < smallestContrastDifference) {
        bestShade = shade.hex;
        smallestContrastDifference = contrastDifference;
      }
    }

    if (bestShade) return bestShade;
  }

  // Fallback for other cases
  return surfaceLuminance < 0.5 
    ? '#FFFFFF' 
    : '#121212';
}


export function findBorderColor(
  surfaceColors: string[],
  textColor: string,
  targetContrastRatio: number
): string {
  console.group('FINDING BORDER COLOR');
  console.log('SURFACES:', surfaceColors);
  console.log('TEXT COLOR:', textColor);
  console.log('TARGET CONTRAST RATIO:', targetContrastRatio);
  
  let n = 1;
  let lastValidN = null;

  // Start from full text color and reduce until we find a value
  // that has LESS than the target contrast with all surfaces
  while (n > 0) {
    const mixedColor = chroma.mix(surfaceColors[0], textColor, n, 'rgb').hex();
    
    // Calculate the minimum contrast with any surface
    const minContrast = Math.min(...surfaceColors.map(surface => 
      chroma.contrast(mixedColor, surface)
    ));
    
    console.log(`N: ${n.toFixed(2)}, MIXED COLOR: ${mixedColor}, MIN CONTRAST: ${minContrast.toFixed(2)}`);
    
    // We want to find the point where contrast goes BELOW the target
    // (this matches the quiet surface function logic)
    if (minContrast <= targetContrastRatio) {
      lastValidN = n;
      console.log(`FOUND VALID N: ${lastValidN} (CONTRAST: ${minContrast.toFixed(2)})`);
      break;
    }
    
    n = n - 0.01;
  }

  // If we couldn't find a value that goes below the target contrast,
  // use the original text color
  if (lastValidN === null) {
    console.log('NO VALID MIX FOUND, USING ORIGINAL TEXT COLOR');
    console.groupEnd();
    return textColor;
  }
  
  // Add a small amount back to ensure we're just at or above the target contrast
  const result = chroma.mix(surfaceColors[0], textColor, lastValidN + 0.01, 'rgb').hex();
  
  console.log('FINAL N VALUE:', (lastValidN + 0.01).toFixed(2));
  console.log('FINAL BORDER COLOR:', result);
  
  // Log the final contrasts
  surfaceColors.forEach((surface, index) => {
    const finalContrast = chroma.contrast(result, surface);
    console.log(`FINAL CONTRAST WITH SURFACE ${index}: ${finalContrast.toFixed(2)}`);
  });
  
  console.groupEnd();
  return result;
}

function findIconColor(
  colors: ThemeColors,
  backgroundType: BackgroundType,
  backgrounds: BackgroundColors,
  mode: Mode,
  style: StyleType,
  colorType: ColorType
): IconColorResult {
  console.group(`Finding Icon Color for ${colorType}`);
  console.log('Inputs:', { 
    backgroundType, 
    backgrounds, 
    mode, 
    style, 
    colorType,
    colors: JSON.stringify(colors, null, 2)
  });

  // Determine which backgrounds to test against
  let backgroundsToTest: string[];
  
  if (backgroundType === 'icon-BG' && backgrounds.iconBG) {
    backgroundsToTest = [backgrounds.iconBG];
  } else if (backgroundType === 'surfaces' && backgrounds.surfaces) {
    backgroundsToTest = backgrounds.surfaces;
  } else if (backgroundType === 'containers' && backgrounds.containers) {
    backgroundsToTest = backgrounds.containers;
  } else {
    console.error(`Invalid background type or missing background values for type: ${backgroundType}`);
    throw new Error(`Invalid background type or missing background values for type: ${backgroundType}`);
  }

  console.log('Backgrounds to test:', backgroundsToTest);

  const surfaceLuminance = chroma(backgroundsToTest[0]).luminance();
  const shades = colors[colorType];
  
  console.log('Shades:', shades);
  console.log('Surface Luminance:', surfaceLuminance);

  const CONTRAST_THRESHOLD = 3.1;
  
  if (!shades || shades.length === 0) {
    console.warn(`No shades found for color type: ${colorType}`);
    console.groupEnd();
    return {
      iconColor: '#ffffff',
      onColor: surfaceLuminance >= 0.5 ? '#000000' : '#ffffff'
    };
  }

  // If shades exist, use the middle shade (index 5) or the first available shade
  const selectedShadeIndex = shades.length > 5 ? 5 : 0;
  const iconColor = shades[selectedShadeIndex].hex;

  // Determine the onColor
  const onColor = shades[selectedShadeIndex].textColor;

  console.log('Selected Icon Color:', iconColor);
  console.log('Selected On Color:', onColor);

  console.groupEnd();
  return { iconColor, onColor };
}

interface IconColors {
  iconBG: string;
  iconSuccess: string;
  iconError: string;
  iconWarning: string;
  iconInfo: string;
  iconPrimary: string;
  iconSecondary: string;
  iconTertiary: string;
  containerIconBG: string;
  containerIconSuccess: string;
  containerIconError: string;
  containerIconWarning: string;
  containerIconInfo: string;
  containerIconPrimary: string;
  containerIconSecondary: string;
  containerIconTertiary: string;
}

function processAllIconColors(
  colors: ThemeColors,
  backgrounds: BackgroundColors,
  mode: Mode,
  style: StyleType
): IconColors {
  // Process surface icons
  const surfaceIcons = {
    iconSuccess: findIconColor(colors, 'surfaces', backgrounds, mode, style, 'success').iconColor,
    iconError: findIconColor(colors, 'surfaces', backgrounds, mode, style, 'error').iconColor,
    iconWarning: findIconColor(colors, 'surfaces', backgrounds, mode, style, 'warning').iconColor,
    iconInfo: findIconColor(colors, 'surfaces', backgrounds, mode, style, 'info').iconColor,
    iconPrimary: findIconColor(colors, 'surfaces', backgrounds, mode, style, 'primary').iconColor,
    iconSecondary: findIconColor(colors, 'surfaces', backgrounds, mode, style, 'secondary').iconColor,
    iconTertiary: findIconColor(colors, 'surfaces', backgrounds, mode, style, 'tertiary').iconColor,
  };

  // Process container icons
  const containerIcons = {
    containerIconSuccess: findIconColor(colors, 'containers', backgrounds, mode, style, 'success').iconColor,
    containerIconError: findIconColor(colors, 'containers', backgrounds, mode, style, 'error').iconColor,
    containerIconWarning: findIconColor(colors, 'containers', backgrounds, mode, style, 'warning').iconColor,
    containerIconInfo: findIconColor(colors, 'containers', backgrounds, mode, style, 'info').iconColor,
    containerIconPrimary: findIconColor(colors, 'containers', backgrounds, mode, style, 'primary').iconColor,
    containerIconSecondary: findIconColor(colors, 'containers', backgrounds, mode, style, 'secondary').iconColor,
    containerIconTertiary: findIconColor(colors, 'containers', backgrounds, mode, style, 'tertiary').iconColor,
  };

  // Process icon backgrounds
  const iconBackgrounds = {
    iconBG: backgrounds.iconBG || '#FFFFFF',
    containerIconBG: backgrounds.iconBG || '#FFFFFF',
  };

  return {
    ...surfaceIcons,
    ...containerIcons,
    ...iconBackgrounds
  };
}

export {
  findIconColor,
  processAllIconColors,
  type IconColorResult,
  type IconColors,
  type ThemeColors,
  type BackgroundColors,
  type BackgroundType,
  type Mode,
  type ColorType,
  type StyleType
};

interface IconColors {
  iconBG: string;
  iconSuccess: string;
  iconError: string;
  iconWarning: string;
  iconInfo: string;
  iconPrimary: string;
  iconSecondary: string;
  iconTertiary: string;
  containerIconBG: string;
  containerIconSuccess: string;
  containerIconError: string;
  containerIconWarning: string;
  containerIconInfo: string;
  containerIconPrimary: string;
  containerIconSecondary: string;
  containerIconTertiary: string;
}

const processedTokens = new Set<string>();

/**
 * Directly updates icon values in Figma, bypassing the regular token mapping process
 * This ensures icon values are properly sent even if there are issues with the regular process
 */
export function updateIconsInFigma(mode: Mode, groupName: string, iconValues: Record<string, string>) {
  console.log(`Directly updating icon values for ${groupName} in mode ${mode}`);
  
  // Helper function to validate hex colors
  const isValidHexColor = (color: any): boolean => {
    return typeof color === 'string' && 
           /^#([0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(color);
  };
  
  // Send each icon value directly to Figma
  Object.entries(iconValues).forEach(([iconName, colorValue]) => {
    if (isValidHexColor(colorValue)) {
      console.log(`Sending ${iconName}: ${colorValue}`);
      
      window.parent.postMessage({
        pluginMessage: {
          type: 'update-design-token',
          collection: 'Modes',
          group: `Backgrounds/${groupName}`,
          mode: mode,
          variable: iconName,
          value: colorValue
        }
      }, '*');
    } else {
      console.warn(`Invalid color value for ${iconName}: ${colorValue}`);
    }
  });
}

// Fixed mapToFigmaTokenNames function with Container-Button-Half using 8-digit hex
export function mapToFigmaTokenNames(baseColors: any) {
  // Simple console log of the input
  console.log("mapToFigmaTokenNames input keys:", Object.keys(baseColors));
  
  // Fix Container-Button-Half to use halfButtonColor instead of reusing containerButton
  const result = {
    'Surface': baseColors.surface,
    'Surface-Dim': baseColors.surfaceDim,
    'Surface-Bright': baseColors.surfaceBright,
    'On-Surface': baseColors.onSurface,
    'Surface-Quiet': baseColors.quietSurface,
    'Surface-Dim-Quiet': baseColors.quietSurfaceDim,
    'Surface-Bright-Quiet': baseColors.quietSurfaceBright,
    'Surface-Border': baseColors.borderColor,
    'Surface-Button': baseColors.buttonColor,
    'Surface-On-Button': baseColors.buttonTextColor,
    'Surface-Button-Half': baseColors.halfButtonColor,  // This is correct
    'Surface-Hotlink': baseColors.surfaceHotlinkColor,
    'Container': baseColors.container,
    'Container-Low': baseColors.containerLow,
    'Container-Lowest': baseColors.containerLowest,
    'Container-High': baseColors.containerHigh,
    'Container-Highest': baseColors.containerHighest,
    'On-Container': baseColors.onContainers,
    'Container-Quiet': baseColors.quietContainer,
    'Container-Low-Quiet': baseColors.quietContainerLow,
    'Container-Lowest-Quiet': baseColors.quietContainerLowest,
    'Container-High-Quiet': baseColors.quietContainerHigh,
    'Container-Highest-Quiet': baseColors.quietContainerHighest,
    'Container-Border': baseColors.containerBorder,
    'Container-Button': baseColors.containerButton,
    'Container-On-Button': baseColors.containerButtonText,
    'Container-Button-Half': baseColors.containerButton 
      ? `${baseColors.containerButton}80` 
      : 'undefined80',
    'Container-Hotlink': baseColors.containerHotlinkColor,
    'Dropdown-Color-1': baseColors.dropColor1,
    'Dropdown-Color-2': baseColors.dropColor2,
    'Dropdown-Color-3': baseColors.dropColor3,
    'Dropdown-Color-4': baseColors.dropColor4,
    'Dropdown-Color-5': baseColors.dropColor5,
    groupName: baseColors.groupName
  };
  
  // Simple log of the result
  console.log("mapToFigmaTokenNames output keys:", Object.keys(result));
  
  return result;
}

export function sendTokensToFigma(mode: Mode, tokens: any, groupName: string) {
  console.log("Tokens received in sendTokensToFigma:", Object.keys(tokens).filter(key => key.includes("Icon")));
  const registry = TokenRegistry.getInstance();

  console.group(`Sending tokens to Figma for ${groupName} in mode ${mode}`);


  // Helper function to validate hex colors
  const isValidHexColor = (color: any): boolean => {
    return typeof color === 'string' && 
           /^#([0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(color);
  };

  // Register valid tokens
  Object.entries(tokens).forEach(([colorKey, colorValue]) => {
    if (isValidHexColor(colorValue)) {
      const registryKey = `${groupName}-${mode}-${colorKey}`;
      registry.registerToken(registryKey, {
        hex: colorValue as string,
        name: colorKey,
        mode: mode,
        group: groupName
      });
    } else if (colorValue !== undefined && colorValue !== null) {
      console.warn(`Invalid color value for ${colorKey}: ${colorValue} (type: ${typeof colorValue})`);
    }
  });

  // Map tokens to Figma-friendly names
  const mappedTokens = mapToFigmaTokenNames(tokens);

  // Set to track processed tokens to avoid duplicates
  const processedTokens = new Set<string>();

  // Send valid tokens to Figma
  Object.entries(mappedTokens).forEach(([tokenName, value]) => {
    // Skip the groupName entry
    if (tokenName === 'groupName') return;

    // Validate the color value
    if (!isValidHexColor(value)) {
      console.warn(`Skipping invalid color for ${tokenName}: ${value} (type: ${typeof value})`);
      return;
    }

    const uniqueKey = `${mode}-${groupName}-${tokenName}`;
    
    // Check if this exact token update has been processed recently
    if (processedTokens.has(uniqueKey)) {
      console.log(`Skipping duplicate token update: ${uniqueKey}`);
      return;
    }

    // Add to processed tokens
    processedTokens.add(uniqueKey);

    // Clear the processed tokens set periodically to allow future updates
    setTimeout(() => {
      processedTokens.delete(uniqueKey);
    }, 1000); // 1 second cooldown

    const colorValue = value as string;
    
    console.log(`Sending token: ${tokenName} = ${colorValue} to group Backgrounds/${groupName}`);
    
    window.parent.postMessage({
      pluginMessage: {
        type: 'update-design-token',
        collection: 'Modes',
        group: `Backgrounds/${groupName}`,
        mode: mode,
        variable: tokenName,
        value: colorValue
      }
    }, '*');
  });

  // New logic for Container-Icon-BG and Surface-Icon-BG
  const containerIconBG = tokens['Container-Icon-BG'];
  const surfaceIconBG = tokens['Surface-Icon-BG'];

  // Function to handle message padding for icon backgrounds
  const handleMessagePadding = (iconBGColor: string, iconBGType: 'Container' | 'Surface') => {
    console.log(`Handling ${iconBGType} Icon BG: ${iconBGColor}`);

    // Send message to Figma to update the Message Padding
    window.parent.postMessage({
      pluginMessage: {
        type: 'update-design-token',
        collection: 'Modes',
        group: `Backgrounds/${groupName}`,
        mode: mode,
        variable: `${iconBGType}-Message-Padding`,
        value: iconBGColor === '#00000000' 
          ? '0' 
          : 'ref:Sizing and Spacing/Default/Sizing-1'
      }
    }, '*');

    console.log(`Updated ${iconBGType}-Message-Padding for ${groupName} in mode ${mode}`);
  };

  // Process Container Message Padding
  if (containerIconBG) {
    handleMessagePadding(containerIconBG, 'Container');
  }

  // Process Surface Message Padding
  if (surfaceIconBG) {
    handleMessagePadding(surfaceIconBG, 'Surface');
  }

  console.groupEnd();
}