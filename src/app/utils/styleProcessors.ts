import { Mode} from '../types/modes'; 
import { ColorData } from '../types/colors';
import { Theme } from '../types/theme';
import { HarmoniesState } from '../types/colors';
import { updateNavbarVariables } from './navbarStyleConfig';  // Add this import
import type { ModeColorData } from '../types/colors';
import { BackgroundTheme } from '../types/backgrounds';
import { processTokensWithVariants } from '../utils/tokenHelpers'; // Adjust path as needed

const chroma = require('chroma-js');
import { 
  isColorData,
  sendTokensToFigma,
  findButtonColor,
  findTextColor,
  findBorderColor,
  modifyHSL,
  generateQuietSurfaceColor,
  findHotlinkColor,
  updateIconsInFigma,
  findOnSurfaceTextColor
} from '../utils/tokenHelpers';

// Interfaces
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

export type SurfaceStyle = 
  | 'light-tonal' 
  | 'colorful-tonal' 
  | 'dark-tonal' 
  | 'light-professional' 
  | 'grey-professional' 
  | 'dark-professional' 
  | 'colorful-professional';

  interface ProcessStyleParams {
    baseColor: ColorData;
    activeTheme: Theme | null;
    stateColors: ColorData[];
    hotlinkStyle: string;
    safeColors: ColorData[];
    style: SurfaceStyle;
    surfaceColor?: string;
    mode: Mode;  // Now required instead of optional
    groupName?: string;
  }

  export interface ProcessTokensParams {
    baseColor: ColorData;
    activeTheme: Theme | null;
    stateColors: ColorData[];
    hotlinkStyle: string;
    safeColors: ColorData[];
    style: SurfaceStyle;
    harmonies: HarmoniesState;
    modes?: Mode | Mode[]; // Optional parameter for specific modes
    specificGroups?: string[]; // Optional parameter for specific background groups
    themeColors?: {  
      primary: ColorData;
      secondary: ColorData;
      tertiary: ColorData;
      // Add variant colors
      whiteColor: ColorData;
      greyColor: ColorData;
      blackColor: ColorData;
      // Add variant colors
      primaryLight?: ColorData;
      primaryDark?: ColorData;
      secondaryLight?: ColorData;
      secondaryDark?: ColorData;
      tertiaryLight?: ColorData;
      tertiaryDark?: ColorData;
    };
  }

/**
 * Creates a BackgroundTheme object for a specific mode from calculated colors and contrasting values
 * 
 * @param groupName The name of the background group
 * @param mode The current mode (AA-light, AA-dark, AAA-light, AAA-dark)
 * @param baseColor The base color data
 * @param baseColors The calculated surface and container colors
 * @param processedColors Processed colors with text, button, and other variants
 * @param surfaceIconBg The background color for surface icons
 * @param containerIconBg The background color for container icons
 * @param contrastingColors Object containing all contrasting color values
 * @returns BackgroundTheme object with properly structured surface and container data
 */
function createBackgroundDataForMode(
  groupName: string | undefined,
  mode: Mode,
  baseColor: ColorData,
  baseColors: StyleColors,
  processedColors: Record<string, string>,
  surfaceIconBg: string,
  containerIconBg: string,
  contrastingColors: {
    primaryContrastingSurfaces: string;
    primaryContrastingContainers: string;
    secondaryContrastingSurfaces: string;
    secondaryContrastingContainers: string;
    tertiaryContrastingSurfaces: string;
    tertiaryContrastingContainers: string;
    successContrastingSurfaces: string;
    successContrastingContainers: string;
    warningContrastingSurfaces: string;
    warningContrastingContainers: string;
    errorContrastingSurfaces: string;
    errorContrastingContainers: string;
    infoContrastingSurfaces: string;
    infoContrastingContainers: string;
  },
  styleType?: SurfaceStyle // New parameter for style type
): BackgroundTheme {
  // Default to 'unknown-group' if groupName is undefined
  const effectiveGroupName = groupName || 'unknown-group';
  
  return {
    id: effectiveGroupName.toLowerCase().replace(/\s+/g, '-'),
    name: effectiveGroupName,
    baseHex: baseColors.surface,
    shadeIndex: typeof baseColor.shadeIndex === 'string' 
      ? baseColor.shadeIndex 
      : String(baseColor.shadeIndex || '0'),
    backgroundColor: baseColors.surface,
    styleType, // Add the style type
    
    // Add specific surface variants
    surface: baseColors.surface,
    surfaceDim: baseColors.surfaceDim,
    surfaceBright: baseColors.surfaceBright,
    surfaceQuiet: processedColors.quietSurface,
    surfaceDimQuiet: processedColors.quietSurfaceDim || processedColors.quietSurface,
    surfaceBrightQuiet: processedColors.quietSurfaceBright || processedColors.quietSurface,
    
    // Add specific container variants
    container: baseColors.container,
    containerLow: baseColors.containerLow,
    containerLowest: baseColors.containerLowest,
    containerHigh: baseColors.containerHigh,
    containerHighest: baseColors.containerHighest,
    containerQuiet: processedColors.quietContainer,
    containerLowQuiet: processedColors.quietContainerLow || processedColors.quietContainer,
    containerLowestQuiet: processedColors.quietContainerLowest || processedColors.quietContainer,
    containerHighQuiet: processedColors.quietContainerHigh || processedColors.quietContainer,
    containerHighestQuiet: processedColors.quietContainerHighest || processedColors.quietContainer,
    
    surfaces: {
      onColor: processedColors.onSurface,
      onQuiet: processedColors.quietSurface,
      border: processedColors.borderColor,
      button: processedColors.buttonColor,
      buttonText: processedColors.buttonTextColor,
      buttonHalf: processedColors.halfButtonColor,
      iconBg: surfaceIconBg,
      iconPrimary: contrastingColors.primaryContrastingSurfaces,
      iconSecondary: contrastingColors.secondaryContrastingSurfaces,
      iconTertiary: contrastingColors.tertiaryContrastingSurfaces,
      iconSuccess: contrastingColors.successContrastingSurfaces,
      iconWarning: contrastingColors.warningContrastingSurfaces,
      iconError: contrastingColors.errorContrastingSurfaces,
      iconInfo: contrastingColors.infoContrastingSurfaces,
      hotlink: processedColors.surfaceHotlinkColor
    },
    
    containers: {
      onColor: processedColors.onContainers,
      onQuiet: processedColors.quietContainer,
      border: processedColors.containerBorder,
      button: processedColors.containerButton,
      buttonText: processedColors.containerButtonText,
      buttonHalf: processedColors.halfButtonColor, // Using surface's half button color as fallback
      iconBg: containerIconBg,
      iconPrimary: contrastingColors.primaryContrastingContainers,
      iconSecondary: contrastingColors.secondaryContrastingContainers,
      iconTertiary: contrastingColors.tertiaryContrastingContainers,
      iconSuccess: contrastingColors.successContrastingContainers,
      iconWarning: contrastingColors.warningContrastingContainers,
      iconError: contrastingColors.errorContrastingContainers,
      iconInfo: contrastingColors.infoContrastingContainers,
      hotlink: processedColors.containerHotlinkColor
    }
  };
}

// Update the storeBackgroundTheme function with improved groupName handling
function storeBackgroundTheme(theme: BackgroundTheme, mode: Mode): void {
  if (!theme.id) {
    console.warn('Cannot store background theme without an id');
    return;
  }
  
  const groupId = theme.id;
  
  // Initialize the group entry if it doesn't exist
  if (!backgroundThemeStore[groupId]) {
    backgroundThemeStore[groupId] = {};
  }
  
  // Store the theme for this mode
  backgroundThemeStore[groupId][mode] = theme;
  
  // Log that we've stored the theme (can be removed in production)
  console.log(`Stored background theme for ${theme.name} in mode ${mode}`);
  
  // Dispatch an event to notify listeners that the background store has been updated
  window.dispatchEvent(new CustomEvent('backgroundThemeUpdated', {
    detail: {
      groupId,
      mode,
      theme
    }
  }));
}

// Add a new function to get a specific background theme
export function getBackgroundTheme(groupId: string, mode: Mode): BackgroundTheme | null {
  if (!backgroundThemeStore[groupId] || !backgroundThemeStore[groupId][mode]) {
    return null;
  }
  return backgroundThemeStore[groupId][mode];
}

// Make the background theme store exportable
export const getBackgroundThemeStore = (): BackgroundThemeStore => {
  return backgroundThemeStore;
};

// Add a function to check if a background theme exists
export function hasBackgroundTheme(groupId: string, mode: Mode): boolean {
  return !!backgroundThemeStore[groupId] && !!backgroundThemeStore[groupId][mode];
}

// Add a function to get all group IDs
export function getBackgroundGroupIds(): string[] {
  return Object.keys(backgroundThemeStore);
}

// Add a function to get all modes for a specific group
export function getBackgroundModesForGroup(groupId: string): Mode[] {
  if (!backgroundThemeStore[groupId]) {
    return [];
  }
  return Object.keys(backgroundThemeStore[groupId]) as Mode[];
}

/**
 * Stores a background theme for a specific group and mode
 * 
 * @param theme The background theme to store
 * @param mode The mode (AA-light, AA-dark, etc.)
 */

// Utility to store background data for each mode in a central store
// You can define this interface in your types/backgrounds.ts file
interface BackgroundThemeStore {
  [groupId: string]: {
    [mode in Mode]?: BackgroundTheme;
  };
}

// Initialize a central store for all background themes by mode
export const backgroundThemeStore: BackgroundThemeStore = {};



function createVariantColorData(
  baseColor: ColorData, 
  variantIndex: number
): ColorData {
  return {
    ...baseColor,
    baseHex: baseColor.allModes?.['AA-light']?.allShades?.[variantIndex]?.hex || baseColor.baseHex,
    shadeIndex: variantIndex
  };
}

/**
 * Gets a color shade that provides the required contrast against the specified background(s)
 * 
 * @param mode The current mode (AA-light, AA-dark, etc.)
 * @param background Background name or array of background names
 * @param state State color (success, error, warning, info, primary, secondary, tertiary)
 * @param baseColors StyleColors object containing surface and container colors
 * @param activeTheme Current theme with color definitions
 * @param safeColors Array of available ColorData objects
 * @param stateColors Array of state color ColorData (success, error, warning, info)
 * @param requiredContrast Required contrast ratio (default: 3.1)
 * @returns A color hex value with required contrast
 */
/**
 * Gets a color shade that provides the required contrast against the specified background(s)
 * Ensures the return value is always a valid hex string
 */
export function getContrastingShade(
  mode: Mode,
  background: string | string[],
  state: 'success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary' | 'tertiary',
  baseColors: any,
  activeTheme: Theme,
  safeColors: ColorData[],
  stateColors: ColorData[],
  requiredContrast: number = 3.1
): string {
  console.group(`Finding contrasting ${state} shade for ${Array.isArray(background) ? background.join(', ') : background} in ${mode}`);
  
  try {
    // Convert single background to array for consistent processing
    const backgrounds = Array.isArray(background) ? background : [background];
    
    // Expand special background groups if provided
    const expandedBackgrounds = expandBackgroundGroups(backgrounds);
    console.log('Expanded backgrounds:', expandedBackgrounds);
    
    
    // Get the background color values from baseColors
    const backgroundColors = getBackgroundColors(expandedBackgrounds, baseColors);
    console.log('Background colors:', backgroundColors);
    
    // Get state color data based on the state parameter
    const stateColor = getStateColorData(state, activeTheme, safeColors, stateColors);
    if (!stateColor) {
      console.warn(`State color ${state} not found, returning fallback`);
      console.groupEnd();
      return getFallbackStateColor(state);
    }
    
    // Get all shades for the state color in current mode
    const allShades = stateColor.allModes?.[mode]?.allShades || [];
    if (allShades.length === 0) {
      console.warn(`No shades found for ${state} in mode ${mode}, returning fallback`);
      console.groupEnd();
      return getFallbackStateColor(state);
    }
    
    console.log(`Found ${allShades.length} shades for ${state}`);
    
    // Find shade with sufficient contrast against all backgrounds
    const suitableShade = findShadeWithSufficientContrast(allShades, backgroundColors, requiredContrast);
    
    if (suitableShade) {
      console.log(`Found suitable shade: ${suitableShade}`);
      
      // Validate before returning
      if (typeof suitableShade === 'string' && /^#([0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(suitableShade)) {
        console.groupEnd();
        return suitableShade;
      } else {
        console.warn(`Invalid hex color found: ${suitableShade}, using fallback`);
        console.groupEnd();
        return getFallbackStateColor(state);
      }
    }
    
    // If no suitable shade found, adjust a shade to meet contrast requirements
    const adjustedShade = adjustShadeForContrast(allShades, backgroundColors, requiredContrast);
    console.log(`Using adjusted shade: ${adjustedShade}`);
    
    // Validate before returning
    if (typeof adjustedShade === 'string' && /^#([0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(adjustedShade)) {
      console.groupEnd();
      return adjustedShade;
    } else {
      console.warn(`Invalid adjusted hex color: ${adjustedShade}, using fallback`);
      console.groupEnd();
      return getFallbackStateColor(state);
    }
  } catch (error) {
    // Handle any errors gracefully
    console.error(`Error in getContrastingShade for ${state}:`, error);
    console.groupEnd();
    return getFallbackStateColor(state);
  }
}

/**
 * Expands predefined background groups into individual background names
 */
function expandBackgroundGroups(backgrounds: string[]): string[] {
  const SURFACE_GROUP = ['Surface', 'Surface-Dim', 'Surface-Bright'];
  const CONTAINER_GROUP = ['Container', 'Container-Low', 'Container-Lowest', 'Container-High', 'Container-Highest'];
  
  return backgrounds.flatMap(bg => {
    if (bg === 'Surfaces') return SURFACE_GROUP;
    if (bg === 'Containers') return CONTAINER_GROUP;
    return bg;
  });
}

/**
 * Gets background color values from baseColors object
 */
function getBackgroundColors(backgrounds: string[], baseColors: any): string[] {
  const backgroundColors: string[] = [];
  
  // Map background names to their actual properties in baseColors
  const bgMap: Record<string, string> = {
    'Surface': 'surface',
    'Surface-Dim': 'surfaceDim',
    'Surface-Bright': 'surfaceBright',
    'Container': 'container',
    'Container-Low': 'containerLow',
    'Container-Lowest': 'containerLowest',
    'Container-High': 'containerHigh',
    'Container-Highest': 'containerHighest',
    'Surface-Icon-BG': 'surface' // Fallback to standard surface
  };
  
  for (const bg of backgrounds) {
    // Check if the background is already a valid hex color
    if (/^#([0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(bg)) {
      // If it's already a hex color, use it directly
      backgroundColors.push(bg);
      continue;
    }

    // If it's a named background, look it up in baseColors
    const propertyName = bgMap[bg];
    if (propertyName && baseColors[propertyName]) {
      backgroundColors.push(baseColors[propertyName]);
    } else {
      console.warn(`Background ${bg} not found in baseColors, treating as direct color value`);
      // Instead of using a fallback, use the background name directly as a potential color value
      // This will allow hex colors to work directly
      backgroundColors.push(bg);
    }
  }
  
  return backgroundColors;
}


/**
 * Gets color data for the specified state from theme, safeColors, or stateColors
 */
function getStateColorData(
  state: 'success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary' | 'tertiary',
  activeTheme: Theme,
  safeColors: ColorData[],
  stateColors: ColorData[]
): ColorData | null {
  console.group(`Getting State Color Data for ${state}`);
  
  // For primary, secondary, tertiary - use activeTheme colors
  if (state === 'primary' || state === 'secondary' || state === 'tertiary') {
    const themeColor = activeTheme.colors[state];
    console.log(`Theme ${state} color:`, themeColor);
    
    // If it's already a complete ColorData object, return it
    if (isColorData(themeColor)) {
      console.log(`Returning theme ${state} color directly`);
      console.groupEnd();
      return themeColor;
    }
    
    // If not, try to find a matching color in safeColors
    const matchedColor = safeColors.find(color => color.baseHex === themeColor);
    
    console.log(`Matched ${state} color in safeColors:`, matchedColor);
    console.groupEnd();
    return matchedColor || null;
  }
  
  // For state colors (success, error, warning, info)
  const stateColor = stateColors.find(color => 
    color.id.toLowerCase() === state.toLowerCase() || 
    color.name.toLowerCase() === state.toLowerCase()
  );
  
  if (stateColor) {
    console.log(`Found ${state} color in stateColors:`, stateColor);
    console.groupEnd();
    return stateColor;
  }
  
  console.warn(`No ${state} color found`);
  console.groupEnd();
  return null;
}

// Helper function to get the appropriate style processor based on style
// In styleProcessors.ts
export function getStyleProcessor(style: SurfaceStyle) {
  switch (style) {
    case 'light-tonal':
      return processLightTonalStyle;
    case 'dark-tonal':
      return processDarkTonalStyle;
    case 'colorful-tonal':
      return processColorfulTonalStyle;
    case 'light-professional':
      return processProfessionalLightStyle;
    case 'grey-professional':
      return processProfessionalGreyStyle;
    case 'dark-professional':
      return processProfessionalDarkStyle;
    case 'colorful-professional':
      return processColorfulProfessionalStyle;
    default:
      return null;
  }
}
/**
 * Finds the most appropriate shade with sufficient contrast by iterating through indexes
 * For dark backgrounds, iterates through indexes 0, 1, 2, etc. until contrast fails
 */
function findShadeWithSufficientContrast(
  shades: { hex: string; name?: string }[],
  backgroundColors: string[],
  requiredContrast: number
): string | null {
  console.log(`Finding shade with sufficient contrast among ${shades.length} shades`);
  
  // First check if any background is dark
  const hasDarkBackground = backgroundColors.some(bg => chroma(bg).luminance() < 0.5);
  console.log(`Has dark background: ${hasDarkBackground}`);
  
  if (hasDarkBackground) {
    // For dark backgrounds, start from index 0 and move up
    let lastValidShade: string | null = null;
    
    for (let i = 0; i < shades.length; i++) {
      const shade = shades[i];
      let hasEnoughContrast = true;
      
      // Check contrast against each background
      for (const bg of backgroundColors) {
        const contrast = chroma.contrast(shade.hex, bg);
        console.log(`Shade index ${i} (${shade.hex}) contrast with ${bg}: ${contrast.toFixed(2)}`);
        
        if (contrast < requiredContrast) {
          hasEnoughContrast = false;
          break;
        }
      }
      
      if (hasEnoughContrast) {
        // Save this index and continue checking
        lastValidShade = shade.hex;
      } else if (lastValidShade) {
        // We've found a shade that fails, return the last valid one
        console.log(`Selected last valid shade: ${lastValidShade}`);
        return lastValidShade;
      }
    }
    
    // If we've gone through all indexes and all meet contrast, return the last one
    if (lastValidShade) {
      console.log(`All shades meet contrast requirements. Selected last: ${lastValidShade}`);
      return lastValidShade;
    }
  } else {
    // For light backgrounds, check each shade as normal
    for (const shade of shades) {
      let hasEnoughContrast = true;
      
      for (const bg of backgroundColors) {
        const contrast = chroma.contrast(shade.hex, bg);
        if (contrast < requiredContrast) {
          hasEnoughContrast = false;
          break;
        }
      }
      
      if (hasEnoughContrast) {
        return shade.hex;
      }
    }
  }
  
  return null;
}

/**
 * Adjusts a shade to meet contrast requirements
 */
function adjustShadeForContrast(
  shades: { hex: string; name?: string }[],
  backgroundColors: string[],
  requiredContrast: number
): string {
  // Start with the best shade
  const bestShade = findBestShade(shades, backgroundColors);
  
  // Loop through backgrounds and adjust until we have enough contrast
  for (const bg of backgroundColors) {
    let adjustedColor = bestShade;
    let contrast = chroma.contrast(adjustedColor, bg);
    let attempts = 0;
    
    // Adjust lightness or darkness to increase contrast
    while (contrast < requiredContrast && attempts < 10) {
      const bgLuminance = chroma(bg).luminance();
      
      if (bgLuminance > 0.5) {
        // Dark shade on light background
        adjustedColor = chroma(adjustedColor).darken(0.2).hex();
      } else {
        // Light shade on dark background
        adjustedColor = chroma(adjustedColor).brighten(0.2).hex();
      }
      
      contrast = chroma.contrast(adjustedColor, bg);
      attempts++;
    }
    
    // If we found a color with enough contrast, return it
    if (contrast >= requiredContrast) {
      return adjustedColor;
    }
  }
  
  // If we couldn't find a suitable adjustment, brighten or darken based on background
  const avgBgLuminance = backgroundColors.reduce(
    (sum, bg) => sum + chroma(bg).luminance(), 
    0
  ) / backgroundColors.length;
  
  return avgBgLuminance > 0.5 
    ? chroma(bestShade).darken(1).hex() 
    : chroma(bestShade).brighten(1).hex();
}

/**
 * Finds the best shade based on contrast with backgrounds
 */
function findBestShade(
  shades: { hex: string; name?: string }[],
  backgroundColors: string[]
): string {
  let bestShade = shades[0].hex;
  let bestAverageContrast = 0;
  
  for (const shade of shades) {
    let totalContrast = 0;
    
    for (const bg of backgroundColors) {
      totalContrast += chroma.contrast(shade.hex, bg);
    }
    
    const averageContrast = totalContrast / backgroundColors.length;
    
    if (averageContrast > bestAverageContrast) {
      bestAverageContrast = averageContrast;
      bestShade = shade.hex;
    }
  }
  
  return bestShade;
}


/**
 * Gets a fallback state color
 */
function getFallbackStateColor(state: string): string {
  const fallbacks: Record<string, string> = {
    'success': '#2e7d32',
    'error': '#d32f2f',
    'warning': '#ed6c02',
    'info': '#0288d1',
    'primary': '#1976d2',
    'secondary': '#9c27b0',
    'tertiary': '#00796b'
  };
  
  return fallbacks[state] || '#000000';
}

// Helper function to process style colors
function processStyleColors(
  baseColors: StyleColors,
  baseColor: ColorData,
  mode: Mode,
  hotlinkStyle: string,
  modeColorData: ModeColorData,
  style?: SurfaceStyle  // This optional parameter exists but wasn't being passed
): Record<string, string> {
  const contrastRequirement = mode.includes('AAA') ? 7.1 : 4.5;
  const safeAllShades = modeColorData.allShades || [];
  const surfaces = [baseColors.surface, baseColors.surfaceDim, baseColors.surfaceBright];
  const containers = [
    baseColors.container,
    baseColors.containerLow,
    baseColors.containerLowest,
    baseColors.containerHigh,
    baseColors.containerHighest
  ];

  // Button colors
  const { buttonColor: containerButton, buttonTextColor: containerButtonText } =  findButtonColor(safeAllShades, containers, mode);
  const { 
    buttonColor, 
    buttonTextColor, 
    halfButtonColor, 
    halfButtonTextColor 
  } = findButtonColor(safeAllShades, surfaces, mode, style);
  
  // Text colors - ONLY ADDING STYLE PARAMETER TO THESE TWO CALLS
  const onSurface = findOnSurfaceTextColor(safeAllShades, surfaces, mode, style); // Add style parameter here
  const onContainers = findOnSurfaceTextColor(safeAllShades, containers, mode, style); // Add style parameter here

  // Border colors
  const borderColor = findBorderColor(surfaces, onSurface, 3.1);
  const containerBorder = findBorderColor(containers, onContainers, 3.1);

  // Drop shadow colors
  const dropColors = modifyHSL(baseColors.surface);
  const [dropColor1, dropColor2, dropColor3, dropColor4, dropColor5] = dropColors;

  // Quiet surface colors - Keeping as is since it works
  const textColor = findTextColor(safeAllShades, surfaces, contrastRequirement, mode, style);
  const quietSurface = generateQuietSurfaceColor(baseColors.surface, textColor, contrastRequirement);
  const quietSurfaceDim = generateQuietSurfaceColor(baseColors.surfaceDim, textColor, contrastRequirement);
  const quietSurfaceBright = generateQuietSurfaceColor(baseColors.surfaceBright, textColor, contrastRequirement);
  const quietContainer = generateQuietSurfaceColor(baseColors.container, onContainers, contrastRequirement);
  const quietContainerLow = generateQuietSurfaceColor(baseColors.containerLow, onContainers, contrastRequirement);
  const quietContainerLowest = generateQuietSurfaceColor(baseColors.containerLowest, onContainers, contrastRequirement);
  const quietContainerHigh = generateQuietSurfaceColor(baseColors.containerHigh, onContainers, contrastRequirement);
  const quietContainerHighest = generateQuietSurfaceColor(baseColors.containerHighest, onContainers, contrastRequirement);

  // Hotlink colors
  const surfaceHotlink = findHotlinkColor(surfaces, safeAllShades, hotlinkStyle === 'blue');
  const containerHotlink = findHotlinkColor(containers, safeAllShades, hotlinkStyle === 'blue');

  return {
    ...baseColors,
    onSurface,
    onContainers,
    borderColor,
    containerBorder,
    buttonColor,
    buttonTextColor,
    halfButtonColor,
    halfButtonTextColor,
    containerButton,
    containerButtonText,
    quietSurface,
    quietSurfaceDim,
    quietSurfaceBright,
    quietContainer,
    quietContainerLow,
    quietContainerLowest,
    quietContainerHigh,
    quietContainerHighest,
    surfaceHotlinkColor: surfaceHotlink.color,
    containerHotlinkColor: containerHotlink.color,
    dropColor1,
    dropColor2,
    dropColor3,
    dropColor4,
    dropColor5
  };
}

export function processLightTonalStyle(params: ProcessStyleParams): void {
  const { baseColor, hotlinkStyle, groupName, mode, activeTheme, safeColors, stateColors } = params;
  
  // Validate required parameters
  if (!groupName) {
    console.warn('No group name provided for processLightTonalStyle');
    return;
  }
  
  if (!activeTheme || !safeColors || !stateColors) {
    console.error('Missing required parameters for calculating contrasting colors');
    return;
  }

  // Check if we're processing Default-related variables
  const isProcessingDefault = groupName.includes('Default');
  const isLightMode = mode.includes('light');

  console.group(`Processing Light Tonal Style for ${groupName}`);
  
  console.log(`Processing mode: ${mode} for group: ${groupName}`);
    
  const baseMix = baseColor.allModes?.[mode]?.allShades[5]?.hex || baseColor.baseHex;
  const baseColors: StyleColors = mode.includes('light') 
    ? {
        // Light mode colors
        surface: chroma.mix('white', baseMix, 0.07, 'rgb').hex(),
        surfaceDim: chroma.mix(chroma.mix('white', baseMix, 0.07, 'rgb').hex(), 'black', 0.07).hex(),
        surfaceBright: chroma.mix(chroma.mix('white', baseMix, 0.07, 'rgb').hex(), 'white', 0.05).hex(),
        container: chroma.mix('white', baseMix, 0.07, 'rgb').hex(),
        containerLow: chroma.mix('white', baseMix, 0.04, 'rgb').hex(),
        containerLowest: chroma.mix('white', baseMix, 0.02, 'rgb').hex(),
        containerHigh: chroma.mix('white', baseMix, 0.11, 'rgb').hex(),
        containerHighest: chroma.mix('white', baseMix, 0.14, 'rgb').hex()
      }
    : {
        // Dark mode colors 
        surface: chroma.mix('#121212', baseMix, 0.08).hex(),
        surfaceDim: chroma.mix('#121212', baseMix, 0.05).hex(),
        surfaceBright: chroma(chroma.mix('#121212', baseMix, 0.10).hex()).brighten(0.2).hex(),
        container: chroma.mix('#121212', baseMix, 0.08).hex(),
        containerLow: chroma.mix('#121212', baseMix, 0.05).hex(),
        containerLowest: '#000000',
        containerHigh: chroma(chroma.mix('#121212', baseMix, 0.10).hex()).brighten(0.3).hex(),
        containerHighest: chroma(chroma.mix('#121212', baseMix, 0.10).hex()).brighten(0.4).hex()
      };

  const processedColors = processStyleColors(
    baseColors,
    baseColor,
    mode,
    hotlinkStyle,
    baseColor.allModes[mode],
    'light-tonal'  // Explicitly pass 'light-tonal' as the style
  );

  // Define arrays for surface and container backgrounds
  const surfaces = ['Surface', 'Surface-Dim', 'Surface-Bright'];
  const containers = ['Container', 'Container-Low', 'Container-Lowest', 'Container-High', 'Container-Highest'];

  // Set transparent values for icon backgrounds
  const surfaceIconBg = '#00000000';
  const containerIconBg = '#00000000';

  // Update baseColors to include the transparent icon backgrounds for contrast calculations
  const iconBaseColors = {
    ...baseColors,
    'surface-icon-bg': surfaceIconBg,
    'container-icon-bg': containerIconBg
  };

  // Calculate contrasting colors for primary with proper contrast requirement (3.1)
  const primaryContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'primary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  const primaryContrastingContainers = getContrastingShade(
    mode,
    containers,
    'primary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  // Calculate contrasting colors for secondary
  const secondaryContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'secondary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  const secondaryContrastingContainers = getContrastingShade(
    mode,
    containers,
    'secondary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  // Calculate contrasting colors for tertiary
  const tertiaryContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'tertiary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  const tertiaryContrastingContainers = getContrastingShade(
    mode,
    containers,
    'tertiary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  // Calculate contrasting colors for success
  const successContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'success',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  const successContrastingContainers = getContrastingShade(
    mode,
    containers,
    'success',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  // Calculate contrasting colors for warning
  const warningContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'warning',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  const warningContrastingContainers = getContrastingShade(
    mode,
    containers,
    'warning',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  // Calculate contrasting colors for error
  const errorContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'error',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  const errorContrastingContainers = getContrastingShade(
    mode,
    containers,
    'error',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  // Calculate contrasting colors for info
  const infoContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'info',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  const infoContrastingContainers = getContrastingShade(
    mode,
    containers,
    'info',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  // Collect all the contrasting colors into an object for the createBackgroundDataForMode function
  const contrastingColors = {
    primaryContrastingSurfaces,
    primaryContrastingContainers,
    secondaryContrastingSurfaces,
    secondaryContrastingContainers,
    tertiaryContrastingSurfaces,
    tertiaryContrastingContainers,
    successContrastingSurfaces,
    successContrastingContainers,
    warningContrastingSurfaces,
    warningContrastingContainers,
    errorContrastingSurfaces,
    errorContrastingContainers,
    infoContrastingSurfaces,
    infoContrastingContainers
  };

  // Create and store the background data
  try {
    const backgroundData = createBackgroundDataForMode(
      groupName,
      mode,
      baseColor,
      baseColors,
      processedColors,
      surfaceIconBg,
      containerIconBg,
      contrastingColors,
      'light-tonal' // Pass the styleType for this processor
    );
    
    // Store the background data in the central store
    storeBackgroundTheme(backgroundData, mode);
    
    console.log(`Successfully created and stored background data for ${groupName}`);
  } catch (error) {
    console.error('Error creating background data:', error);
    // Continue with normal processing even if background data creation fails
  }

  // Add all colors to processedColors using the exact same variable names
  // that already exist in Figma
  const allColors = {
    ...processedColors,
    
    // Add transparent icon backgrounds
    'Surface-Icon-BG': surfaceIconBg,
    'Container-Icon-BG': containerIconBg,
    
    // Primary contrasting colors - using the existing token names
    'Surface-Icon-Primary': primaryContrastingSurfaces,
    'Container-Icon-Primary': primaryContrastingContainers,
    
    // Secondary contrasting colors - using the existing token names
    'Surface-Icon-Secondary': secondaryContrastingSurfaces,
    'Container-Icon-Secondary': secondaryContrastingContainers,
    
    // Tertiary contrasting colors - using the existing token names
    'Surface-Icon-Tertiary': tertiaryContrastingSurfaces,
    'Container-Icon-Tertiary': tertiaryContrastingContainers,
    
    // State contrasting colors - using the existing token names
    'Surface-Icon-Success': successContrastingSurfaces,
    'Container-Icon-Success': successContrastingContainers,
    
    'Surface-Icon-Warning': warningContrastingSurfaces,
    'Container-Icon-Warning': warningContrastingContainers,
    
    'Surface-Icon-Error': errorContrastingSurfaces,
    'Container-Icon-Error': errorContrastingContainers,

    'Surface-Icon-Info': infoContrastingSurfaces,
    'Container-Icon-Info': infoContrastingContainers
  };

  // Log the final colors for debugging
  console.log("Final allColors object:", allColors);
  console.log("Icon keys in allColors:", Object.keys(allColors).filter(key => key.includes("Icon")));

  // Send all colors to Figma in a single call using the normal process
  sendTokensToFigma(mode, allColors, groupName);

  // Create explicit icon value mapping for direct update
  const iconValues = {
    'Surface-Icon-BG': surfaceIconBg,
    'Container-Icon-BG': containerIconBg,
    'Surface-Icon-Primary': primaryContrastingSurfaces,
    'Container-Icon-Primary': primaryContrastingContainers,
    'Surface-Icon-Secondary': secondaryContrastingSurfaces,
    'Container-Icon-Secondary': secondaryContrastingContainers,
    'Surface-Icon-Tertiary': tertiaryContrastingSurfaces,
    'Container-Icon-Tertiary': tertiaryContrastingContainers,
    'Surface-Icon-Success': successContrastingSurfaces,
    'Container-Icon-Success': successContrastingContainers,
    'Surface-Icon-Warning': warningContrastingSurfaces,
    'Container-Icon-Warning': warningContrastingContainers,
    'Surface-Icon-Error': errorContrastingSurfaces,
    'Container-Icon-Error': errorContrastingContainers,
    'Surface-Icon-Info': infoContrastingSurfaces,
    'Container-Icon-Info': infoContrastingContainers
  };

  // Also directly update the icons to ensure they get through
  updateIconsInFigma(mode, groupName, iconValues);

  // Update navbar variables only when processing Default-related items
  if (isProcessingDefault) {
    updateNavbarVariables('processLightTonalStyle', true);
  }

  // Update page backgrounds when processing Default in light mode
  if (isProcessingDefault && isLightMode) {
    // Send message to update all page backgrounds to Surface-Border color
    window.parent.postMessage({
      pluginMessage: {
        type: 'update-page-backgrounds',
        color: processedColors.borderColor // Use the border color instead of surfaceDim
      }
    }, '*');
  }

  console.groupEnd();
}

export function processDarkTonalStyle(params: ProcessStyleParams): void {
  const { baseColor, hotlinkStyle, groupName, mode, activeTheme, safeColors, stateColors } = params;
  
  // Validate required parameters
  if (!groupName) {
    console.warn('No group name provided for processDarkTonalStyle');
    return;
  }
  
  if (!activeTheme || !safeColors || !stateColors) {
    console.error('Missing required parameters for calculating contrasting colors');
    return;
  }

  // Check if we're processing Default-related variables
  const isProcessingDefault = groupName.includes('Default');

  console.group(`Processing Dark Tonal Style for ${groupName}`);
  
  console.log(`Processing mode: ${mode} for group: ${groupName}`);
    
  const baseMix = baseColor.allModes?.[mode]?.allShades[5]?.hex || baseColor.baseHex;
  const baseColors: StyleColors = mode.includes('light') 
    ? {
        // Light mode colors
        surface: chroma.mix('#121212', baseMix, 0.08).hex(),
        surfaceDim: chroma.mix('#121212', baseMix, 0.05).hex(),
        surfaceBright: chroma(chroma.mix('#121212', baseMix, 0.10).hex()).brighten(.2).hex(),
        container: chroma.mix('#121212', baseMix, 0.08).hex(),
        containerLow: chroma.mix('#121212', baseMix, 0.05).hex(),
        containerLowest: '#000000',
        containerHigh: chroma(chroma.mix('#121212', baseMix, 0.10).hex()).brighten(.3).hex(),
        containerHighest: chroma(chroma.mix('#121212', baseMix, 0.10).hex()).brighten(.4).hex(),
      }
    : {
        // Dark mode colors
        surface: chroma.mix('#121212', baseMix, 0.08).hex(),
        surfaceDim: chroma.mix('#121212', baseMix, 0.05).hex(),
        surfaceBright: chroma(chroma.mix('#121212', baseMix, 0.10).hex()).brighten(0.2).hex(),
        container: chroma.mix('#121212', baseMix, 0.08).hex(),
        containerLow: chroma.mix('#121212', baseMix, 0.05).hex(),
        containerLowest: '#000000',
        containerHigh: chroma(chroma.mix('#121212', baseMix, 0.10).hex()).brighten(0.3).hex(),
        containerHighest: chroma(chroma.mix('#121212', baseMix, 0.10).hex()).brighten(0.4).hex()
      };

  const processedColors = processStyleColors(
    baseColors,
    baseColor,
    mode,
    hotlinkStyle,
    baseColor.allModes[mode],
    'dark-tonal'  // Explicitly pass 'dark-tonal' as the style
  );
    
  // Define arrays for surface and container backgrounds
  const surfaces = ['Surface', 'Surface-Dim', 'Surface-Bright'];
  const containers = ['Container', 'Container-Low', 'Container-Lowest', 'Container-High', 'Container-Highest'];

  // Set transparent values for icon backgrounds
  const surfaceIconBg = '#00000000';
  const containerIconBg = '#00000000';

  // Calculate contrasting colors for primary with proper contrast requirement (3.1)
  const primaryContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'primary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  const primaryContrastingContainers = getContrastingShade(
    mode,
    containers,
    'primary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  // Calculate contrasting colors for secondary
  const secondaryContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'secondary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  const secondaryContrastingContainers = getContrastingShade(
    mode,
    containers,
    'secondary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  // Calculate contrasting colors for tertiary
  const tertiaryContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'tertiary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  const tertiaryContrastingContainers = getContrastingShade(
    mode,
    containers,
    'tertiary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  // Calculate contrasting colors for success
  const successContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'success',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  const successContrastingContainers = getContrastingShade(
    mode,
    containers,
    'success',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  // Calculate contrasting colors for warning
  const warningContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'warning',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  const warningContrastingContainers = getContrastingShade(
    mode,
    containers,
    'warning',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  // Calculate contrasting colors for error
  const errorContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'error',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  const errorContrastingContainers = getContrastingShade(
    mode,
    containers,
    'error',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  // Calculate contrasting colors for info
  const infoContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'info',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  const infoContrastingContainers = getContrastingShade(
    mode,
    containers,
    'info',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  // Collect all the contrasting colors into an object for the createBackgroundDataForMode function
  const contrastingColors = {
    primaryContrastingSurfaces,
    primaryContrastingContainers,
    secondaryContrastingSurfaces,
    secondaryContrastingContainers,
    tertiaryContrastingSurfaces,
    tertiaryContrastingContainers,
    successContrastingSurfaces,
    successContrastingContainers,
    warningContrastingSurfaces,
    warningContrastingContainers,
    errorContrastingSurfaces,
    errorContrastingContainers,
    infoContrastingSurfaces,
    infoContrastingContainers
  };

  // Create and store the background data
  try {
    const backgroundData = createBackgroundDataForMode(
      groupName,
      mode,
      baseColor,
      baseColors,
      processedColors,
      surfaceIconBg,
      containerIconBg,
      contrastingColors,
      'dark-tonal' // Pass the styleType for this processor
      
    );
    
    // Store the background data in the central store
    storeBackgroundTheme(backgroundData, mode);
    
    console.log(`Successfully created and stored background data for ${groupName}`);
  } catch (error) {
    console.error('Error creating background data:', error);
    // Continue with normal processing even if background data creation fails
  }

  // Add all colors to processedColors using the exact same variable names
  // that already exist in Figma
  const allColors = {
    ...processedColors,
    
    // Add transparent icon backgrounds
    'Surface-Icon-BG': surfaceIconBg,
    'Container-Icon-BG': containerIconBg,
    
    // Primary contrasting colors - using the existing token names
    'Surface-Icon-Primary': primaryContrastingSurfaces,
    'Container-Icon-Primary': primaryContrastingContainers,
    
    // Secondary contrasting colors - using the existing token names
    'Surface-Icon-Secondary': secondaryContrastingSurfaces,
    'Container-Icon-Secondary': secondaryContrastingContainers,
    
    // Tertiary contrasting colors - using the existing token names
    'Surface-Icon-Tertiary': tertiaryContrastingSurfaces,
    'Container-Icon-Tertiary': tertiaryContrastingContainers,
    
    // State contrasting colors - using the existing token names
    'Surface-Icon-Success': successContrastingSurfaces,
    'Container-Icon-Success': successContrastingContainers,
    
    'Surface-Icon-Warning': warningContrastingSurfaces,
    'Container-Icon-Warning': warningContrastingContainers,
    
    'Surface-Icon-Error': errorContrastingSurfaces,
    'Container-Icon-Error': errorContrastingContainers,
        
    'Surface-Icon-Info': infoContrastingSurfaces,
    'Container-Icon-Info': infoContrastingContainers
  };

  // Send all colors to Figma in a single call using the normal process
  sendTokensToFigma(mode, allColors, groupName);

  // Create explicit icon value mapping for direct update
  const iconValues = {
    'Surface-Icon-BG': surfaceIconBg,
    'Container-Icon-BG': containerIconBg,
    'Surface-Icon-Primary': primaryContrastingSurfaces,
    'Container-Icon-Primary': primaryContrastingContainers,
    'Surface-Icon-Secondary': secondaryContrastingSurfaces,
    'Container-Icon-Secondary': secondaryContrastingContainers,
    'Surface-Icon-Tertiary': tertiaryContrastingSurfaces,
    'Container-Icon-Tertiary': tertiaryContrastingContainers,
    'Surface-Icon-Success': successContrastingSurfaces,
    'Container-Icon-Success': successContrastingContainers,
    'Surface-Icon-Warning': warningContrastingSurfaces,
    'Container-Icon-Warning': warningContrastingContainers,
    'Surface-Icon-Error': errorContrastingSurfaces,
    'Container-Icon-Error': errorContrastingContainers,
    'Surface-Icon-Info': infoContrastingSurfaces,
    'Container-Icon-Info': infoContrastingContainers
  };

  // Also directly update the icons to ensure they get through
  updateIconsInFigma(mode, groupName, iconValues);

  // Update navbar variables only when processing Default-related items
  if (isProcessingDefault) {
    updateNavbarVariables('processDarkTonalStyle', true);
  }
  
  console.groupEnd();
}

// Special implementation for processColorfulTonalStyle
export function processColorfulTonalStyle(params: ProcessStyleParams): void {
  // Extract all required parameters
  const { baseColor, hotlinkStyle, groupName, mode, activeTheme, safeColors, stateColors } = params;
  
  // Validate required parameters
  if (!groupName) {
    console.warn('No group name provided for processColorfulTonalStyle');
    return;
  }
  
  if (!activeTheme || !safeColors || !stateColors) {
    console.error('Missing required parameters for calculating contrasting colors');
    return;
  }

  console.group(`Processing Colorful Tonal Style for ${groupName}`);
  const isProcessingDefault = groupName.includes('Default');

  console.log(`Processing mode: ${mode} for group: ${groupName}`);
    
  const baseMix = baseColor.baseHex;
  const baseLuminance = chroma(baseMix).luminance();
  const lighten1 = baseLuminance >= 0.5 ? 0.08 : 0.06;
  const lighten2 = baseLuminance >= 0.5 ? 0.11 : 0.09;

  const baseColors: StyleColors = mode.includes('light') 
    ? {
        // Light mode colors
        surface: baseMix,
        surfaceDim: chroma.mix(baseMix, 'black', 0.08).hex(),
        surfaceBright: chroma(baseMix).brighten(.1).hex(),
        container: baseMix,
        containerLow: chroma.mix(baseMix, 'black', 0.04, 'rgb').hex(),
        containerLowest: chroma.mix(baseMix, 'black', 0.07, 'rgb').hex(),
        containerHigh: chroma.mix(baseMix, 'white', lighten1, 'rgb').hex(),
        containerHighest: chroma.mix(baseMix, 'white', lighten2, 'rgb').hex()
      }
    : {
        // Dark mode colors
        surface: chroma.mix('#121212', baseMix, 0.08).hex(),
        surfaceDim: chroma.mix('#121212', baseMix, 0.05).hex(),
        surfaceBright: chroma(chroma.mix('#121212', baseMix, 0.10).hex()).brighten(0.2).hex(),
        container: chroma.mix('#121212', baseMix, 0.08).hex(),
        containerLow: chroma.mix('#121212', baseMix, 0.05).hex(),
        containerLowest: '#000000',
        containerHigh: chroma(chroma.mix('#121212', baseMix, 0.10).hex()).brighten(0.3).hex(),
        containerHighest: chroma(chroma.mix('#121212', baseMix, 0.10).hex()).brighten(0.4).hex()
      };

  // Get base processed colors
  const processedColors = processStyleColors(
    baseColors,
    baseColor,
    mode,
    hotlinkStyle,
    baseColor.allModes[mode],
    'colorful-tonal'  // Explicitly pass 'colorful-tonal' as the style
  );

  // Special handling for Surface-Icon-BG and Container-Icon-BG in colorful tonal style
  // Determine the proper background colors based on primary color shade
  const primaryColorShades = baseColor.allModes?.[mode]?.allShades || [];
  const shadeIndex = typeof baseColor.shadeIndex === 'string'
    ? parseInt(baseColor.shadeIndex, 10)
    : (baseColor.shadeIndex || 0);
  
  // Set Surface-Icon-BG based on shade index
  let surfaceIconBg;
  if (shadeIndex >= 0 && shadeIndex <= 4) {
    // Use lightest shade (shade 0) for light primary colors
    surfaceIconBg = primaryColorShades[0]?.hex || baseColors.surface;
  } else {
    // Use 9th shade for darker primary colors (or the last available shade)
    const lastIndex = primaryColorShades.length - 1;
    surfaceIconBg = primaryColorShades[Math.min(9, lastIndex)]?.hex || baseColors.surface;
  }

  // Set Container-Icon-BG based on shade index
  let containerIconBg;
  if (shadeIndex >= 0 && shadeIndex <= 4) {
    // Use lightest shade (shade 0) for light primary colors
    containerIconBg = primaryColorShades[0]?.hex || baseColors.container;
  } else {
    // Use 9th shade for darker primary colors (or the last available shade)
    const lastIndex = primaryColorShades.length - 1;
    containerIconBg = primaryColorShades[Math.min(9, lastIndex)]?.hex || baseColors.container;
  }
  
  // Create custom colors objects with special backgrounds for contrast calculations
  const iconSurfaceColors = {
    ...baseColors,
    'surface-icon-bg': surfaceIconBg
  };
  
  const iconContainerColors = {
    ...baseColors,
    'container-icon-bg': containerIconBg
  };
  
  // Calculate contrasting colors using the special backgrounds with 3.1 contrast requirement
  // Primary colors
  const primaryContrastingSurfaces = getContrastingShade(
    mode,
    surfaceIconBg, 
    'primary',
    iconSurfaceColors, // Use the custom surface icon bg colors
    activeTheme,
    safeColors,
    stateColors,
    3.1 // Specify contrast requirement
  );

  const primaryContrastingContainers = getContrastingShade(
    mode,
    containerIconBg, 
    'primary',
    iconContainerColors, // Use the custom container icon bg colors
    activeTheme,
    safeColors,
    stateColors,
    3.1 // Specify contrast requirement
  );

  // Secondary colors
  const secondaryContrastingSurfaces = getContrastingShade(
    mode,
    surfaceIconBg, 
    'secondary',
    iconSurfaceColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  const secondaryContrastingContainers = getContrastingShade(
    mode,
    containerIconBg, 
    'secondary',
    iconContainerColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  // Tertiary colors
  const tertiaryContrastingSurfaces = getContrastingShade(
    mode,
    surfaceIconBg, 
    'tertiary',
    iconSurfaceColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  const tertiaryContrastingContainers = getContrastingShade(
    mode,
    containerIconBg, 
    'tertiary',
    iconContainerColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  // Success state colors
  const successContrastingSurfaces = getContrastingShade(
    mode,
    surfaceIconBg, 
    'success',
    iconSurfaceColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  const successContrastingContainers = getContrastingShade(
    mode,
    containerIconBg, 
    'success',
    iconContainerColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  // Warning state colors
  const warningContrastingSurfaces = getContrastingShade(
    mode,
    surfaceIconBg, 
    'warning',
    iconSurfaceColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  const warningContrastingContainers = getContrastingShade(
    mode,
    containerIconBg, 
    'warning',
    iconContainerColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  // Error state colors
  const errorContrastingSurfaces = getContrastingShade(
    mode,
    surfaceIconBg, 
    'error',
    iconSurfaceColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  const errorContrastingContainers = getContrastingShade(
    mode,
    containerIconBg, 
    'error',
    iconContainerColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  // Calculate contrasting colors for info
  const infoContrastingSurfaces = getContrastingShade(
    mode,
    containerIconBg, 
    'info',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  const infoContrastingContainers = getContrastingShade(
    mode,
    containerIconBg, 
    'info',
    baseColors,
    activeTheme,
    safeColors,
    stateColors,
    3.1
  );

  // Collect all the contrasting colors into an object for the createBackgroundDataForMode function
  const contrastingColors = {
    primaryContrastingSurfaces,
    primaryContrastingContainers,
    secondaryContrastingSurfaces,
    secondaryContrastingContainers,
    tertiaryContrastingSurfaces,
    tertiaryContrastingContainers,
    successContrastingSurfaces,
    successContrastingContainers,
    warningContrastingSurfaces,
    warningContrastingContainers,
    errorContrastingSurfaces,
    errorContrastingContainers,
    infoContrastingSurfaces,
    infoContrastingContainers
  };

  // Create and store the background data
  try {
    const backgroundData = createBackgroundDataForMode(
      groupName,
      mode,
      baseColor,
      baseColors,
      processedColors,
      surfaceIconBg,
      containerIconBg,
      contrastingColors,
    'colorful-tonal' // Pass the styleType for this processor
    );
    
    // Store the background data in the central store
    storeBackgroundTheme(backgroundData, mode);
    
    console.log(`Successfully created and stored background data for ${groupName}`);
  } catch (error) {
    console.error('Error creating background data:', error);
    // Continue with normal processing even if background data creation fails
  }

  // Add all colors to processedColors using the exact same variable names
  // that already exist in Figma
  const allColors = {
    ...processedColors,
    
    // Add the special icon backgrounds
    'Surface-Icon-BG': surfaceIconBg,
    'Container-Icon-BG': containerIconBg,
    
    // Primary contrasting colors
    'Surface-Icon-Primary': primaryContrastingSurfaces,
    'Container-Icon-Primary': primaryContrastingContainers,
    
    // Secondary contrasting colors
    'Surface-Icon-Secondary': secondaryContrastingSurfaces,
    'Container-Icon-Secondary': secondaryContrastingContainers,
    
    // Tertiary contrasting colors
    'Surface-Icon-Tertiary': tertiaryContrastingSurfaces,
    'Container-Icon-Tertiary': tertiaryContrastingContainers,
    
    // State contrasting colors
    'Surface-Icon-Success': successContrastingSurfaces,
    'Container-Icon-Success': successContrastingContainers,
    
    'Surface-Icon-Warning': warningContrastingSurfaces,
    'Container-Icon-Warning': warningContrastingContainers,
    
    'Surface-Icon-Error': errorContrastingSurfaces,
    'Container-Icon-Error': errorContrastingContainers,
        
    'Surface-Icon-Info': infoContrastingSurfaces,
    'Container-Icon-Info': infoContrastingContainers
  };

  // Create explicit icon value mapping for direct update
  const iconValues = {
    'Surface-Icon-BG': surfaceIconBg,
    'Container-Icon-BG': containerIconBg,
    'Surface-Icon-Primary': primaryContrastingSurfaces,
    'Container-Icon-Primary': primaryContrastingContainers,
    'Surface-Icon-Secondary': secondaryContrastingSurfaces,
    'Container-Icon-Secondary': secondaryContrastingContainers,
    'Surface-Icon-Tertiary': tertiaryContrastingSurfaces,
    'Container-Icon-Tertiary': tertiaryContrastingContainers,
    'Surface-Icon-Success': successContrastingSurfaces,
    'Container-Icon-Success': successContrastingContainers,
    'Surface-Icon-Warning': warningContrastingSurfaces,
    'Container-Icon-Warning': warningContrastingContainers,
    'Surface-Icon-Error': errorContrastingSurfaces,
    'Container-Icon-Error': errorContrastingContainers,
    'Surface-Icon-Info': infoContrastingSurfaces,
    'Container-Icon-Info': infoContrastingContainers
  };

  // Also directly update the icons to ensure they get through
  updateIconsInFigma(mode, groupName, iconValues);

  // Send all colors to Figma in a single call
  sendTokensToFigma(mode, allColors, groupName);

  // Update navbar variables if processing default
  if (isProcessingDefault) {
    updateNavbarVariables('processColorfulTonalStyle', true);
  }
  
  console.groupEnd();
}

// COMPLETE EXAMPLE: processProfessionalLightStyle with all contrasting colors
// This can be used as a template for other style processors

export function processProfessionalLightStyle(params: ProcessStyleParams): void {
  // Extract all required parameters
  const { baseColor, hotlinkStyle, groupName, mode, activeTheme, safeColors, stateColors } = params;
  
  // Validate required parameters
  if (!groupName) {
    console.warn('No group name provided for processProfessionalLightStyle');
    return;
  }
  
  if (!activeTheme || !safeColors || !stateColors) {
    console.error('Missing required parameters for calculating contrasting colors');
    return;
  }

  console.group(`Processing Professional Light Style for ${groupName}`);
  const isProcessingDefault = groupName.includes('Default');

  console.log(`Processing mode: ${mode} for group: ${groupName}`);
    
  const baseColors: StyleColors = mode.includes('light') 
    ? {
        // Light mode colors
        surface: '#ffffff',
        surfaceDim: chroma.mix('#ffffff', 'black', 0.05).hex(),
        surfaceBright: '#ffffff',
        container: '#ffffff',
        containerLow: '#ffffff',
        containerLowest: '#ffffff',
        containerHigh: '#ffffff',
        containerHighest: '#ffffff'
      }
    : {
        // Dark mode colors
        surface: '#121212',
        surfaceDim: chroma.mix('#121212', 'black', 0.05).hex(),
        surfaceBright: chroma('#121212').brighten(0.2).hex(),
        container: '#121212',
        containerLow: chroma.mix('#121212', 'black', 0.05).hex(),
        containerLowest: '#000000',
        containerHigh: chroma('#121212').brighten(0.3).hex(),
        containerHighest: chroma('#121212').brighten(0.4).hex()
      };

  // Get base processed colors
  const processedColors = processStyleColors(
    baseColors,
    baseColor,
    mode,
    hotlinkStyle,
    baseColor.allModes[mode],
    'light-professional' // Hard-code the style
  );

  // Define arrays for surface and container backgrounds
  const surfaces = ['Surface', 'Surface-Dim', 'Surface-Bright'];
  const containers = ['Container', 'Container-Low', 'Container-Lowest', 'Container-High', 'Container-Highest'];

  // Set transparent values for icon backgrounds
  const surfaceIconBg = '#00000000';
  const containerIconBg = '#00000000';

  // Calculate contrasting colors for primary
  const primaryContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'primary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const primaryContrastingContainers = getContrastingShade(
    mode,
    containers,
    'primary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );
  
  const secondaryContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'secondary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const secondaryContrastingContainers = getContrastingShade(
    mode,
    containers,
    'secondary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const tertiaryContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'tertiary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const tertiaryContrastingContainers = getContrastingShade(
    mode,
    containers,
    'tertiary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const successContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'success',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const successContrastingContainers = getContrastingShade(
    mode,
    containers,
    'success',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const warningContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'warning',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const warningContrastingContainers = getContrastingShade(
    mode,
    containers,
    'warning',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );
 
  const errorContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'error',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const errorContrastingContainers = getContrastingShade(
    mode,
    containers,
    'error',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const infoContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'info',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const infoContrastingContainers = getContrastingShade(
    mode,
    containers,
    'info',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  // Collect all the contrasting colors into an object for the createBackgroundDataForMode function
  const contrastingColors = {
    primaryContrastingSurfaces,
    primaryContrastingContainers,
    secondaryContrastingSurfaces,
    secondaryContrastingContainers,
    tertiaryContrastingSurfaces,
    tertiaryContrastingContainers,
    successContrastingSurfaces,
    successContrastingContainers,
    warningContrastingSurfaces,
    warningContrastingContainers,
    errorContrastingSurfaces,
    errorContrastingContainers,
    infoContrastingSurfaces,
    infoContrastingContainers
  };

  // Create and store the background data
  try {
    const backgroundData = createBackgroundDataForMode(
      groupName,
      mode,
      baseColor,
      baseColors,
      processedColors,
      surfaceIconBg,
      containerIconBg,
      contrastingColors,
      'light-professional' // Style type
    );
    
    // Store the background data in the central store
    storeBackgroundTheme(backgroundData, mode);
    
    console.log(`Successfully created and stored background data for ${groupName}`);
  } catch (error) {
    console.error('Error creating background data:', error);
    // Continue with normal processing even if background data creation fails
  }

  // Combine all colors into a final object
  const allColors = {
    ...processedColors,
    
    // Add transparent icon backgrounds
    'Surface-Icon-BG': surfaceIconBg,
    'Container-Icon-BG': containerIconBg,
    
    // Primary contrasting colors - using the existing token names
    'Surface-Icon-Primary': primaryContrastingSurfaces,
    'Container-Icon-Primary': primaryContrastingContainers,
    
    // Secondary contrasting colors - using the existing token names
    'Surface-Icon-Secondary': secondaryContrastingSurfaces,
    'Container-Icon-Secondary': secondaryContrastingContainers,
    
    // Tertiary contrasting colors - using the existing token names
    'Surface-Icon-Tertiary': tertiaryContrastingSurfaces,
    'Container-Icon-Tertiary': tertiaryContrastingContainers,
    
    // State contrasting colors - using the existing token names
    'Surface-Icon-Success': successContrastingSurfaces,
    'Container-Icon-Success': successContrastingContainers,
    
    'Surface-Icon-Warning': warningContrastingSurfaces,
    'Container-Icon-Warning': warningContrastingContainers,
    
    'Surface-Icon-Error': errorContrastingSurfaces,
    'Container-Icon-Error': errorContrastingContainers,

    'Surface-Icon-Info': infoContrastingSurfaces,
    'Container-Icon-Info': infoContrastingContainers,
    
    // Original contrasting colors
    primaryContrastingSurfaces,
    primaryContrastingContainers,
    secondaryContrastingSurfaces,
    secondaryContrastingContainers,
    tertiaryContrastingSurfaces,
    tertiaryContrastingContainers,
    successContrastingSurfaces,
    successContrastingContainers,
    warningContrastingSurfaces,
    warningContrastingContainers,
    errorContrastingSurfaces,
    errorContrastingContainers,
    infoContrastingSurfaces,
    infoContrastingContainers
  };

  // Send the final colors to Figma in a single call
  sendTokensToFigma(mode, allColors, groupName);

  // Create explicit icon value mapping for direct update
  const iconValues = {
    'Surface-Icon-BG': surfaceIconBg,
    'Container-Icon-BG': containerIconBg,
    'Surface-Icon-Primary': primaryContrastingSurfaces,
    'Container-Icon-Primary': primaryContrastingContainers,
    'Surface-Icon-Secondary': secondaryContrastingSurfaces,
    'Container-Icon-Secondary': secondaryContrastingContainers,
    'Surface-Icon-Tertiary': tertiaryContrastingSurfaces,
    'Container-Icon-Tertiary': tertiaryContrastingContainers,
    'Surface-Icon-Success': successContrastingSurfaces,
    'Container-Icon-Success': successContrastingContainers,
    'Surface-Icon-Warning': warningContrastingSurfaces,
    'Container-Icon-Warning': warningContrastingContainers,
    'Surface-Icon-Error': errorContrastingSurfaces,
    'Container-Icon-Error': errorContrastingContainers,
    'Surface-Icon-Info': infoContrastingSurfaces,
    'Container-Icon-Info': infoContrastingContainers
  };

  // Also directly update the icons to ensure they get through
  updateIconsInFigma(mode, groupName, iconValues);

  // Update navbar variables if processing default
  if (isProcessingDefault) {
    updateNavbarVariables('processProfessionalLightStyle', true);
  }
  
  console.groupEnd();
}

export function processProfessionalGreyStyle(params: ProcessStyleParams): void {
  const { baseColor, hotlinkStyle, groupName, mode, activeTheme, safeColors, stateColors } = params;
  
  if (!groupName) {
    console.warn('No group name provided for processProfessionalGreyStyle');
    return;
  }

  console.group(`Processing Professional Grey Style for ${groupName}`);
  const isProcessingDefault = groupName.includes('Default');

  if (!activeTheme || !safeColors || !stateColors) {
    console.error('Missing required parameters for calculating contrasting colors');
    return;
  }

  console.log(`Processing mode: ${mode} for group: ${groupName}`);
    
  const baseMix = baseColor.allModes?.[mode]?.allShades[5]?.hex || baseColor.baseHex;
  const baseColors: StyleColors = mode.includes('light')
    ? {
        // Light mode colors
        surface: '#fafafa',
        surfaceDim: chroma.mix(chroma.mix('white', baseMix, 0.03, 'rgb').desaturate(2).hex(), 'black', 0.05).hex(),
        surfaceBright: '#ffffff',
        container: '#ffffff',
        containerLow: chroma.mix(chroma.mix('white', baseMix, 0.03, 'rgb').desaturate(2).hex(), 'black', 0.05).hex(),
        containerLowest: chroma.mix(chroma.mix('white', baseMix, 0.03, 'rgb').desaturate(2).hex(), 'black', 0.07).hex(),
        containerHigh: '#ffffff',
        containerHighest: '#ffffff'
      }
    : {
        // Dark mode colors
        surface: chroma.mix('#121212', baseMix, 0.08).hex(),
        surfaceDim: chroma.mix('#121212', baseMix, 0.05).hex(),
        surfaceBright: chroma(chroma.mix('#121212', baseMix, 0.10).hex()).brighten(0.2).hex(),
        container: chroma.mix('#121212', baseMix, 0.08).hex(),
        containerLow: chroma.mix('#121212', baseMix, 0.05).hex(),
        containerLowest: '#000000',
        containerHigh: chroma(chroma.mix('#121212', baseMix, 0.10).hex()).brighten(0.3).hex(),
        containerHighest: chroma(chroma.mix('#121212', baseMix, 0.10).hex()).brighten(0.4).hex()
      };

  const processedColors = processStyleColors(
    baseColors,
    baseColor,
    mode,
    hotlinkStyle,
    baseColor.allModes[mode],
    'grey-professional' // Hard-code the style
  );

  // Define arrays for surface and container backgrounds
  const surfaces = ['Surface', 'Surface-Dim', 'Surface-Bright'];
  const containers = ['Container', 'Container-Low', 'Container-Lowest', 'Container-High', 'Container-Highest'];

  // Set transparent values for icon backgrounds
  const surfaceIconBg = '#00000000';
  const containerIconBg = '#00000000';

  // Calculate contrasting colors for primary
  const primaryContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'primary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const primaryContrastingContainers = getContrastingShade(
    mode,
    containers,
    'primary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );
  
  const secondaryContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'secondary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const secondaryContrastingContainers = getContrastingShade(
    mode,
    containers,
    'secondary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const tertiaryContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'tertiary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const tertiaryContrastingContainers = getContrastingShade(
    mode,
    containers,
    'tertiary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const successContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'success',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const successContrastingContainers = getContrastingShade(
    mode,
    containers,
    'success',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const warningContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'warning',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const warningContrastingContainers = getContrastingShade(
    mode,
    containers,
    'warning',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );
 
  const errorContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'error',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const errorContrastingContainers = getContrastingShade(
    mode,
    containers,
    'error',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const infoContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'info',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const infoContrastingContainers = getContrastingShade(
    mode,
    containers,
    'info',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  // Collect all the contrasting colors into an object for the createBackgroundDataForMode function
  const contrastingColors = {
    primaryContrastingSurfaces,
    primaryContrastingContainers,
    secondaryContrastingSurfaces,
    secondaryContrastingContainers,
    tertiaryContrastingSurfaces,
    tertiaryContrastingContainers,
    successContrastingSurfaces,
    successContrastingContainers,
    warningContrastingSurfaces,
    warningContrastingContainers,
    errorContrastingSurfaces,
    errorContrastingContainers,
    infoContrastingSurfaces,
    infoContrastingContainers
  };

  // Create and store the background data
  try {
    const backgroundData = createBackgroundDataForMode(
      groupName,
      mode,
      baseColor,
      baseColors,
      processedColors,
      surfaceIconBg,
      containerIconBg,
      contrastingColors,
      'grey-professional' // Style type
    );
    
    // Store the background data in the central store
    storeBackgroundTheme(backgroundData, mode);
    
    console.log(`Successfully created and stored background data for ${groupName}`);
  } catch (error) {
    console.error('Error creating background data:', error);
    // Continue with normal processing even if background data creation fails
  }

  // Combine all colors into a final object
  const allColors = {
    ...processedColors,
    
    // Add transparent icon backgrounds
    'Surface-Icon-BG': surfaceIconBg,
    'Container-Icon-BG': containerIconBg,
    
    // Primary contrasting colors - using the existing token names
    'Surface-Icon-Primary': primaryContrastingSurfaces,
    'Container-Icon-Primary': primaryContrastingContainers,
    
    // Secondary contrasting colors - using the existing token names
    'Surface-Icon-Secondary': secondaryContrastingSurfaces,
    'Container-Icon-Secondary': secondaryContrastingContainers,
    
    // Tertiary contrasting colors - using the existing token names
    'Surface-Icon-Tertiary': tertiaryContrastingSurfaces,
    'Container-Icon-Tertiary': tertiaryContrastingContainers,
    
    // State contrasting colors - using the existing token names
    'Surface-Icon-Success': successContrastingSurfaces,
    'Container-Icon-Success': successContrastingContainers,
    
    'Surface-Icon-Warning': warningContrastingSurfaces,
    'Container-Icon-Warning': warningContrastingContainers,
    
    'Surface-Icon-Error': errorContrastingSurfaces,
    'Container-Icon-Error': errorContrastingContainers,

    'Surface-Icon-Info': infoContrastingSurfaces,
    'Container-Icon-Info': infoContrastingContainers,
    
    // Original contrasting colors
    primaryContrastingSurfaces,
    primaryContrastingContainers,
    secondaryContrastingSurfaces,
    secondaryContrastingContainers,
    tertiaryContrastingSurfaces,
    tertiaryContrastingContainers,
    successContrastingSurfaces,
    successContrastingContainers,
    warningContrastingSurfaces,
    warningContrastingContainers,
    errorContrastingSurfaces,
    errorContrastingContainers,
    infoContrastingSurfaces,
    infoContrastingContainers
  };

  // Send the final colors to Figma in a single call
  sendTokensToFigma(mode, allColors, groupName);

  // Create explicit icon value mapping for direct update
  const iconValues = {
    'Surface-Icon-BG': surfaceIconBg,
    'Container-Icon-BG': containerIconBg,
    'Surface-Icon-Primary': primaryContrastingSurfaces,
    'Container-Icon-Primary': primaryContrastingContainers,
    'Surface-Icon-Secondary': secondaryContrastingSurfaces,
    'Container-Icon-Secondary': secondaryContrastingContainers,
    'Surface-Icon-Tertiary': tertiaryContrastingSurfaces,
    'Container-Icon-Tertiary': tertiaryContrastingContainers,
    'Surface-Icon-Success': successContrastingSurfaces,
    'Container-Icon-Success': successContrastingContainers,
    'Surface-Icon-Warning': warningContrastingSurfaces,
    'Container-Icon-Warning': warningContrastingContainers,
    'Surface-Icon-Error': errorContrastingSurfaces,
    'Container-Icon-Error': errorContrastingContainers,
    'Surface-Icon-Info': infoContrastingSurfaces,
    'Container-Icon-Info': infoContrastingContainers
  };

  // Also directly update the icons to ensure they get through
  updateIconsInFigma(mode, groupName, iconValues);

  // Update navbar variables if processing default
  if (isProcessingDefault) {
    updateNavbarVariables('processProfessionalGreyStyle', true);
  }
  
  console.groupEnd();
}

export function processProfessionalDarkStyle(params: ProcessStyleParams): void {
  const { baseColor, hotlinkStyle, groupName, mode, activeTheme, safeColors, stateColors } = params;
  
  if (!groupName) {
    console.warn('No group name provided for processProfessionalDarkStyle');
    return;
  }

  console.group(`Processing Professional Dark Style for ${groupName}`);
  const isProcessingDefault = groupName.includes('Default');

  if (!activeTheme || !safeColors || !stateColors) {
    console.error('Missing required parameters for calculating contrasting colors');
    return;
  }

  console.log(`Processing mode: ${mode} for group: ${groupName}`);
    
  const baseMix = '#121212'
  const baseColors: StyleColors = mode.includes('light')
    ? {
        // Light mode colors
        surface: '#121212',
        surfaceDim: chroma.mix('#121212', 'black', 0.30).hex(),
        surfaceBright: chroma('#121212').brighten(.1).hex(),
        container: '#ffffff',
        containerLow: '#ffffff',
        containerLowest: '#ffffff',
        containerHigh: '#ffffff',
        containerHighest: '#ffffff'
      }
    : {
        // Dark mode colors
        surface: '#121212',
        surfaceDim: chroma.mix('#121212', 'black', 0.30).hex(),
        surfaceBright: chroma('#121212').brighten(.1).hex(),
        container: chroma.mix('#121212', baseMix, 0.08).hex(),
        containerLow: chroma.mix('#121212', baseMix, 0.05).hex(),
        containerLowest: '#000000',
        containerHigh: chroma(chroma.mix('#121212', baseMix, 0.10).hex()).brighten(0.3).hex(),
        containerHighest: chroma(chroma.mix('#121212', baseMix, 0.10).hex()).brighten(0.4).hex()

      };

  // Define arrays for surface and container backgrounds
  const surfaces = ['Surface', 'Surface-Dim', 'Surface-Bright'];
  const containers = ['Container', 'Container-Low', 'Container-Lowest', 'Container-High', 'Container-Highest'];

  // Set transparent values for icon backgrounds
  const surfaceIconBg = '#00000000';
  const containerIconBg = '#00000000';

  const processedColors = processStyleColors(
    baseColors,
    baseColor,
    mode,
    hotlinkStyle,
    baseColor.allModes[mode],
    'dark-professional' // Hard-code the style
  );

  // Calculate contrasting colors for primary
  const primaryContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'primary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const primaryContrastingContainers = getContrastingShade(
    mode,
    containers,
    'primary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );
  
  const secondaryContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'secondary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const secondaryContrastingContainers = getContrastingShade(
    mode,
    containers,
    'secondary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const tertiaryContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'tertiary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const tertiaryContrastingContainers = getContrastingShade(
    mode,
    containers,
    'tertiary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const successContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'success',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const successContrastingContainers = getContrastingShade(
    mode,
    containers,
    'success',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const warningContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'warning',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const warningContrastingContainers = getContrastingShade(
    mode,
    containers,
    'warning',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );
 
  const errorContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'error',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const errorContrastingContainers = getContrastingShade(
    mode,
    containers,
    'error',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const infoContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'info',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const infoContrastingContainers = getContrastingShade(
    mode,
    containers,
    'info',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  // Collect all the contrasting colors into an object for the createBackgroundDataForMode function
  const contrastingColors = {
    primaryContrastingSurfaces,
    primaryContrastingContainers,
    secondaryContrastingSurfaces,
    secondaryContrastingContainers,
    tertiaryContrastingSurfaces,
    tertiaryContrastingContainers,
    successContrastingSurfaces,
    successContrastingContainers,
    warningContrastingSurfaces,
    warningContrastingContainers,
    errorContrastingSurfaces,
    errorContrastingContainers,
    infoContrastingSurfaces,
    infoContrastingContainers
  };

  // Create and store the background data
  try {
    const backgroundData = createBackgroundDataForMode(
      groupName,
      mode,
      baseColor,
      baseColors,
      processedColors,
      surfaceIconBg,
      containerIconBg,
      contrastingColors,
      'dark-professional' // Style type
    );
    
    // Store the background data in the central store
    storeBackgroundTheme(backgroundData, mode);
    
    console.log(`Successfully created and stored background data for ${groupName}`);
  } catch (error) {
    console.error('Error creating background data:', error);
    // Continue with normal processing even if background data creation fails
  }

  // Combine all colors into a final object
  const allColors = {
    ...processedColors,
    
    // Add transparent icon backgrounds
    'Surface-Icon-BG': surfaceIconBg,
    'Container-Icon-BG': containerIconBg,
    
    // Primary contrasting colors - using the existing token names
    'Surface-Icon-Primary': primaryContrastingSurfaces,
    'Container-Icon-Primary': primaryContrastingContainers,
    
    // Secondary contrasting colors - using the existing token names
    'Surface-Icon-Secondary': secondaryContrastingSurfaces,
    'Container-Icon-Secondary': secondaryContrastingContainers,
    
    // Tertiary contrasting colors - using the existing token names
    'Surface-Icon-Tertiary': tertiaryContrastingSurfaces,
    'Container-Icon-Tertiary': tertiaryContrastingContainers,
    
    // State contrasting colors - using the existing token names
    'Surface-Icon-Success': successContrastingSurfaces,
    'Container-Icon-Success': successContrastingContainers,
    
    'Surface-Icon-Warning': warningContrastingSurfaces,
    'Container-Icon-Warning': warningContrastingContainers,
    
    'Surface-Icon-Error': errorContrastingSurfaces,
    'Container-Icon-Error': errorContrastingContainers,

    'Surface-Icon-Info': infoContrastingSurfaces,
    'Container-Icon-Info': infoContrastingContainers,
    
    // Original contrasting colors
    primaryContrastingSurfaces,
    primaryContrastingContainers,
    secondaryContrastingSurfaces,
    secondaryContrastingContainers,
    tertiaryContrastingSurfaces,
    tertiaryContrastingContainers,
    successContrastingSurfaces,
    successContrastingContainers,
    warningContrastingSurfaces,
    warningContrastingContainers,
    errorContrastingSurfaces,
    errorContrastingContainers,
    infoContrastingSurfaces,
    infoContrastingContainers
  };

  // Send the final colors to Figma in a single call
  sendTokensToFigma(mode, allColors, groupName);

  // Create explicit icon value mapping for direct update
  const iconValues = {
    'Surface-Icon-BG': surfaceIconBg,
    'Container-Icon-BG': containerIconBg,
    'Surface-Icon-Primary': primaryContrastingSurfaces,
    'Container-Icon-Primary': primaryContrastingContainers,
    'Surface-Icon-Secondary': secondaryContrastingSurfaces,
    'Container-Icon-Secondary': secondaryContrastingContainers,
    'Surface-Icon-Tertiary': tertiaryContrastingSurfaces,
    'Container-Icon-Tertiary': tertiaryContrastingContainers,
    'Surface-Icon-Success': successContrastingSurfaces,
    'Container-Icon-Success': successContrastingContainers,
    'Surface-Icon-Warning': warningContrastingSurfaces,
    'Container-Icon-Warning': warningContrastingContainers,
    'Surface-Icon-Error': errorContrastingSurfaces,
    'Container-Icon-Error': errorContrastingContainers,
    'Surface-Icon-Info': infoContrastingSurfaces,
    'Container-Icon-Info': infoContrastingContainers
  };

  // Also directly update the icons to ensure they get through
  updateIconsInFigma(mode, groupName, iconValues);

  // Update navbar variables if processing default
  if (isProcessingDefault) {
    updateNavbarVariables('processProfessionalDarkStyle', true);
  }
  
  console.groupEnd();
}

export function processColorfulProfessionalStyle(params: ProcessStyleParams): void {
  const { baseColor, hotlinkStyle, groupName, mode, activeTheme, safeColors, stateColors } = params;
  
  if (!groupName) {
    console.warn('No group name provided for processColorfulProfessionalStyle');
    return;
  }

  console.group(`Processing Colorful Professional Style for ${groupName}`);
  const isProcessingDefault = groupName.includes('Default');

  if (!activeTheme || !safeColors || !stateColors) {
    console.error('Missing required parameters for calculating contrasting colors');
    return;
  }

  console.log(`Processing mode: ${mode} for group: ${groupName}`);
    
  const baseMix = baseColor.allModes?.[mode]?.allShades[5]?.hex || baseColor.baseHex;
  const baseColors: StyleColors = mode.includes('light')
    ? {
        // Light mode colors
        surface: baseMix,
        surfaceDim: chroma.mix(baseMix, 'black', 0.05).hex(),
        surfaceBright: '#ffffff',
        container: '#ffffff',
        containerLow: '#ffffff',
        containerLowest: '#ffffff',
        containerHigh: '#ffffff',
        containerHighest: '#ffffff'
      }
    : {
        // Dark mode colors
        surface: '#121212',
        surfaceDim: chroma.mix('#121212', baseMix, 0.30).hex(),
        surfaceBright: chroma('#121212').brighten(.1).hex(),
        container: '#ffffff',
        containerLow: '#ffffff',
        containerLowest: '#ffffff',
        containerHigh: '#ffffff',
        containerHighest: '#ffffff'
      };

  // Define arrays for surface and container backgrounds
  const surfaces = ['Surface', 'Surface-Dim', 'Surface-Bright'];
  const containers = ['Container', 'Container-Low', 'Container-Lowest', 'Container-High', 'Container-Highest'];

  // Set transparent values for icon backgrounds
  const surfaceIconBg = '#00000000';
  const containerIconBg = '#00000000';

  const processedColors = processStyleColors(
    baseColors,
    baseColor,
    mode,
    hotlinkStyle,
    baseColor.allModes[mode],
    'colorful-professional' // Add the style parameter
  );

  // Calculate contrasting colors for primary
  const primaryContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'primary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const primaryContrastingContainers = getContrastingShade(
    mode,
    containers,
    'primary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );
  
  const secondaryContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'secondary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const secondaryContrastingContainers = getContrastingShade(
    mode,
    containers,
    'secondary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const tertiaryContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'tertiary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const tertiaryContrastingContainers = getContrastingShade(
    mode,
    containers,
    'tertiary',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const successContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'success',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const successContrastingContainers = getContrastingShade(
    mode,
    containers,
    'success',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const warningContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'warning',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const warningContrastingContainers = getContrastingShade(
    mode,
    containers,
    'warning',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );
 
  const errorContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'error',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const errorContrastingContainers = getContrastingShade(
    mode,
    containers,
    'error',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const infoContrastingSurfaces = getContrastingShade(
    mode,
    surfaces,
    'info',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  const infoContrastingContainers = getContrastingShade(
    mode,
    containers,
    'info',
    baseColors,
    activeTheme,
    safeColors,
    stateColors
  );

  // Collect all the contrasting colors into an object for the createBackgroundDataForMode function
  const contrastingColors = {
    primaryContrastingSurfaces,
    primaryContrastingContainers,
    secondaryContrastingSurfaces,
    secondaryContrastingContainers,
    tertiaryContrastingSurfaces,
    tertiaryContrastingContainers,
    successContrastingSurfaces,
    successContrastingContainers,
    warningContrastingSurfaces,
    warningContrastingContainers,
    errorContrastingSurfaces,
    errorContrastingContainers,
    infoContrastingSurfaces,
    infoContrastingContainers
  };

  // Create and store the background data
  try {
    const backgroundData = createBackgroundDataForMode(
      groupName,
      mode,
      baseColor,
      baseColors,
      processedColors,
      surfaceIconBg,
      containerIconBg,
      contrastingColors,
        'colorful-professional' // Style type
    );
    
    // Store the background data in the central store
    storeBackgroundTheme(backgroundData, mode);
    
    console.log(`Successfully created and stored background data for ${groupName}`);
  } catch (error) {
    console.error('Error creating background data:', error);
    // Continue with normal processing even if background data creation fails
  }

  // Combine all colors into a final object
  const allColors = {
    ...processedColors,
    
    // Add transparent icon backgrounds
    'Surface-Icon-BG': surfaceIconBg,
    'Container-Icon-BG': containerIconBg,
    
    // Primary contrasting colors - using the existing token names
    'Surface-Icon-Primary': primaryContrastingSurfaces,
    'Container-Icon-Primary': primaryContrastingContainers,
    
    // Secondary contrasting colors - using the existing token names
    'Surface-Icon-Secondary': secondaryContrastingSurfaces,
    'Container-Icon-Secondary': secondaryContrastingContainers,
    
    // Tertiary contrasting colors - using the existing token names
    'Surface-Icon-Tertiary': tertiaryContrastingSurfaces,
    'Container-Icon-Tertiary': tertiaryContrastingContainers,
    
    // State contrasting colors - using the existing token names
    'Surface-Icon-Success': successContrastingSurfaces,
    'Container-Icon-Success': successContrastingContainers,
    
    'Surface-Icon-Warning': warningContrastingSurfaces,
    'Container-Icon-Warning': warningContrastingContainers,
    
    'Surface-Icon-Error': errorContrastingSurfaces,
    'Container-Icon-Error': errorContrastingContainers,

    'Surface-Icon-Info': infoContrastingSurfaces,
    'Container-Icon-Info': infoContrastingContainers,
    
    // Original contrasting colors
    primaryContrastingSurfaces,
    primaryContrastingContainers,
    secondaryContrastingSurfaces,
    secondaryContrastingContainers,
    tertiaryContrastingSurfaces,
    tertiaryContrastingContainers,
    successContrastingSurfaces,
    successContrastingContainers,
    warningContrastingSurfaces,
    warningContrastingContainers,
    errorContrastingSurfaces,
    errorContrastingContainers,
    infoContrastingSurfaces,
    infoContrastingContainers
  };

  // Send the final colors to Figma in a single call
  sendTokensToFigma(mode, allColors, groupName);

  // Create explicit icon value mapping for direct update
  const iconValues = {
    'Surface-Icon-BG': surfaceIconBg,
    'Container-Icon-BG': containerIconBg,
    'Surface-Icon-Primary': primaryContrastingSurfaces,
    'Container-Icon-Primary': primaryContrastingContainers,
    'Surface-Icon-Secondary': secondaryContrastingSurfaces,
    'Container-Icon-Secondary': secondaryContrastingContainers,
    'Surface-Icon-Tertiary': tertiaryContrastingSurfaces,
    'Container-Icon-Tertiary': tertiaryContrastingContainers,
    'Surface-Icon-Success': successContrastingSurfaces,
    'Container-Icon-Success': successContrastingContainers,
    'Surface-Icon-Warning': warningContrastingSurfaces,
    'Container-Icon-Warning': warningContrastingContainers,
    'Surface-Icon-Error': errorContrastingSurfaces,
    'Container-Icon-Error': errorContrastingContainers,
    'Surface-Icon-Info': infoContrastingSurfaces,
    'Container-Icon-Info': infoContrastingContainers
  };

  // Also directly update the icons to ensure they get through
  updateIconsInFigma(mode, groupName, iconValues);

  // Update navbar variables if processing default
  if (isProcessingDefault) {
    updateNavbarVariables('processColorfulProfessionalStyle', true);
  }
  
  console.groupEnd();
}

// Main processTokens function with enhanced support for selective processing
export const processTokens = (params: ProcessTokensParams) => {
  console.log('PROCESS TOKENS FUNCTION CALLED');
  console.group('Process Tokens');
  
  const { 
    baseColor, 
    activeTheme, 
    stateColors, 
    hotlinkStyle, 
    safeColors, 
    style, 
    harmonies,
    modes,
    specificGroups,
    themeColors  // New parameter
  } = params;

  // Use themeColors for processing if available
  const effectiveSafeColors = [...safeColors];
  
  // Log that we're using the theme colors
  if (themeColors) {
    console.log('Using theme colors in processTokens:', {
      primary: themeColors.primary.baseHex,
      secondary: themeColors.secondary.baseHex,
      tertiary: themeColors.tertiary.baseHex
    });
  }
  // Determine which modes to process
  const modesToProcess: Mode[] = modes 
    ? (Array.isArray(modes) ? modes : [modes])
    : ['AA-light', 'AA-dark']; // Default to processing only AA modes

  // Additional validation
  if (!baseColor || !activeTheme) {
    console.warn('Insufficient data for token processing');
    console.groupEnd();
    return;
  }

  const DEFAULT_PROCESSORS = {
    'light-tonal': {
      processor: processLightTonalStyle,
      name: 'Light Tonal Style'
    },
    'dark-tonal': {
      processor: processDarkTonalStyle,
      name: 'Dark Tonal Style'
    },
    'colorful-tonal': {
      processor: processColorfulTonalStyle,
      name: 'Colorful Tonal Style'
    },
    'light-professional': {
      processor: processProfessionalLightStyle,
      name: 'Light Professional Style'
    },
    'grey-professional': {
      processor: processProfessionalGreyStyle,
      name: 'Grey Professional Style'
    },
    'dark-professional': {
      processor: processProfessionalDarkStyle,
      name: 'Dark Professional Style'
    },
    'colorful-professional': {
      processor: processColorfulProfessionalStyle,
      name: 'Colorful Professional Style'
    }
  };

  // Determine the default processor based on the overall style
  const defaultProcessorConfig = DEFAULT_PROCESSORS[style] || DEFAULT_PROCESSORS['light-tonal'];
  const defaultProcessor = defaultProcessorConfig.processor;

  // Color variations to process
  const COLOR_VARIATIONS = [
    { key: 'default', name: 'Default', processor: defaultProcessor },
    { 
      key: 'white', 
      name: 'White', 
      processor: style.includes('tonal') ? processColorfulTonalStyle : processProfessionalLightStyle 
    },
    { 
      key: 'black', 
      name: 'Black', 
      processor: style.includes('tonal') ? processDarkTonalStyle : processProfessionalDarkStyle 
    },
    { 
      key: 'grey', 
      name: 'Grey', 
      processor: style.includes('tonal') ? processColorfulTonalStyle : processProfessionalGreyStyle 
    },
    { 
      key: 'primary', 
      name: 'Primary', 
      processor: style.includes('tonal') ? processColorfulTonalStyle : processColorfulProfessionalStyle 
    },
    { 
      key: 'primary-light', 
      name: 'Primary-Light', 
      processor: style.includes('tonal') ? processColorfulTonalStyle : processColorfulProfessionalStyle 
    },
    { 
      key: 'primary-dark', 
      name: 'Primary-Dark', 
      processor: style.includes('tonal') ? processColorfulTonalStyle : processColorfulProfessionalStyle 
    },
    { 
      key: 'secondary', 
      name: 'Secondary',

      processor: style.includes('tonal') ? processColorfulTonalStyle : processColorfulProfessionalStyle 
    },
    { 
      key: 'secondary-light', 
      name: 'Secondary-Light', 
      processor: style.includes('tonal') ? processColorfulTonalStyle : processColorfulProfessionalStyle 
    },
    { 
      key: 'secondary-dark', 
      name: 'Secondary-Dark', 
      processor: style.includes('tonal') ? processColorfulTonalStyle : processColorfulProfessionalStyle 
    },
    { 
      key: 'tertiary', 
      name: 'Tertiary', 
      processor: style.includes('tonal') ? processColorfulTonalStyle : processColorfulProfessionalStyle 
    },
    { 
      key: 'tertiary-light', 
      name: 'Tertiary-Light', 
      processor: style.includes('tonal') ? processColorfulTonalStyle : processColorfulProfessionalStyle 
    },
    { 
      key: 'tertiary-dark', 
      name: 'Tertiary-Dark', 
      processor: style.includes('tonal') ? processColorfulTonalStyle : processColorfulProfessionalStyle 
    }
  ];

  // Filter variations if specific groups were requested
  const variationsToProcess = specificGroups 
    ? COLOR_VARIATIONS.filter(variation => specificGroups.includes(variation.name))
    : COLOR_VARIATIONS;

  if (specificGroups) {
    console.log(`Processing only specific groups: ${specificGroups.join(', ')}`);
  }

  // Helper functions remain the same
  function getLightDarkIndices(baseIndex: number) {
    // Calculate the correct index value
    let index = baseIndex;
    if (baseIndex === 0) {
      index = 1;  // For index 0, return index 1
    } else if (baseIndex === 9) {
      index = 8;  // For index 9, return index 8
    }
  
    // Now determine the lightIndex (one less than index, but not less than 0)
    const lightIndex = Math.max(0, index - 1);
    
    // And determine the darkIndex (one more than index, but not more than 9)
    const darkIndex = Math.min(9, index + 1);
    
    // Return the calculated indices
    return { index, lightIndex, darkIndex };
  }

  function getMonochromaticShades(
    baseColor: ColorData,
    style: SurfaceStyle
  ) {
    const allShades = baseColor.allModes?.['AA-light']?.allShades || [];
    const totalShades = allShades.length;
    
    if (totalShades === 0) {
      console.warn('No shades found in baseColor for monochromatic calculation');
      return {
        secondaryIndex: 3,
        tertiaryIndex: 7,
        secondaryLight: baseColor.baseHex,
        secondaryDark: baseColor.baseHex,
        tertiaryLight: baseColor.baseHex,
        tertiaryDark: baseColor.baseHex
      };
    }
    
    // Get the base shade index for primary
    const primaryShadeIndex = typeof baseColor.shadeIndex === 'string' 
      ? parseInt(baseColor.shadeIndex, 10) 
      : (baseColor.shadeIndex || 5);
    
    // Get the primary indices using getLightDarkIndices
    const primaryIndices = getLightDarkIndices(primaryShadeIndex);
    
    // These are the indices we'll avoid using - the primary family
    const reservedIndices = [
      primaryIndices.index,       // Primary
      primaryIndices.lightIndex,  // Primary-Light
      primaryIndices.darkIndex    // Primary-Dark
    ];
    
    // Available indices are all those not used by primary, and not index 9
    const availableIndices = Array.from(Array(totalShades).keys())
      .filter(index => {
        // Don't use indices that are already used for primary
        if (reservedIndices.includes(index)) return false;
        
        // Reserve shade 9 as requested
        if (index === 9) return false;
        
        return true;
      });
    
    console.log('Primary uses indices:', reservedIndices);
    console.log('Available indices for secondary/tertiary:', availableIndices);
    
    // If we don't have enough available indices, use fallbacks
    if (availableIndices.length < 2) {  // We just need at least 2 indices (one for secondary, one for tertiary)
      console.warn('Limited available shade indices for monochromatic calculation, adapting...');
      
      // Try to find an index for secondary that's not used by primary and not 9
      let secondaryIndex = 3; // Default fallback
      for (let i = 1; i < 9; i++) {
        if (!reservedIndices.includes(i)) {
          secondaryIndex = i;
          break;
        }
      }
      
      // For tertiary, find another available index
      let tertiaryIndex = 7; // Default fallback
      for (let i = 1; i < 9; i++) {
        if (i !== secondaryIndex && !reservedIndices.includes(i)) {
          tertiaryIndex = i;
          break;
        }
      }
      
      // Now that we have the base indices, calculate light and dark variants using getLightDarkIndices
      const secondaryIndices = getLightDarkIndices(secondaryIndex);
      const tertiaryIndices = getLightDarkIndices(tertiaryIndex);
      
      // Get the hex values for all the variants
      return {
        secondaryIndex,
        tertiaryIndex,
        secondaryLight: allShades[secondaryIndices.lightIndex]?.hex || baseColor.baseHex,
        secondaryDark: allShades[secondaryIndices.darkIndex]?.hex || baseColor.baseHex,
        tertiaryLight: allShades[tertiaryIndices.lightIndex]?.hex || baseColor.baseHex,
        tertiaryDark: allShades[tertiaryIndices.darkIndex]?.hex || baseColor.baseHex
      };
    }
    
    // We have enough indices, distribute them in a balanced way
    
    // For secondary, pick from the first half of available indices
    const secondaryIndex = availableIndices[Math.floor(availableIndices.length / 4)];
    
    // Apply getLightDarkIndices to get the light and dark variants for secondary
    const secondaryIndices = getLightDarkIndices(secondaryIndex);
    
    // For tertiary, pick from the second half of available indices
    const tertiaryIndex = availableIndices[Math.floor(availableIndices.length * 3 / 4)];
    
    // Apply getLightDarkIndices to get the light and dark variants for tertiary
    const tertiaryIndices = getLightDarkIndices(tertiaryIndex);
    
    console.log('Secondary will use base index:', secondaryIndex);
    console.log('Secondary indices:', secondaryIndices);
    console.log('Tertiary will use base index:', tertiaryIndex);
    console.log('Tertiary indices:', tertiaryIndices);
    
    // Return the indices and hex values
    return {
      secondaryIndex, 
      tertiaryIndex,
      secondaryLight: allShades[secondaryIndices.lightIndex]?.hex || baseColor.baseHex,
      secondaryDark: allShades[secondaryIndices.darkIndex]?.hex || baseColor.baseHex,
      tertiaryLight: allShades[tertiaryIndices.lightIndex]?.hex || baseColor.baseHex,
      tertiaryDark: allShades[tertiaryIndices.darkIndex]?.hex || baseColor.baseHex
    };
  }

 /**
 * Determines if a color is primarily yellow or orange
 * @param hex The hex color to check
 * @returns boolean True if the color is in yellow/orange range
 */
function isYellowOrOrange(hex: string): boolean {
  try {
    const color = chroma(hex);
    const hue = color.get('hsl.h');
    
    // Yellow/orange hue range (roughly 20-60 degrees in HSL)
    return (hue >= 20 && hue <= 60);
  } catch (error) {
    console.warn('Error determining if color is yellow/orange:', error);
    return false;
  }
}


/**
 * Gets the light and dark indices based on the base index and color properties
 * @param baseIndex The base shade index
 * @param baseHex The hex color value
 * @returns Object with light and dark indices
 */
function getVariantIndices(baseIndex: number, baseHex: string): { lightIndex: number, darkIndex: number } {
  // Handle the boundary cases
  if (baseIndex === 0) {
    // Can't go lighter than 0, so light = 1, dark = 2
    return {
      lightIndex: 1,
      darkIndex: 2
    };
  } else if (baseIndex === 9) {
    // Can't go darker than 9, so light = 8, dark = 7
    return {
      lightIndex: 8,
      darkIndex: 7
    };
  } else if (isYellowOrOrange(baseHex) && baseIndex === 4) {
    // Special handling for yellow/orange at index 4
    return {
      lightIndex: 3,
      darkIndex: 2
    };
  } else {
    // Normal case: Light = index-1, Dark = index+1
    return {
      lightIndex: baseIndex - 1,
      darkIndex: baseIndex + 1
    };
  }
}

  // Process each variation for each specified mode
modesToProcess.forEach(mode => {
  console.group(`Processing mode: ${mode}`);
  
  variationsToProcess.forEach(variation => {
    console.group(`Processing variation: ${variation.name}`);

    // Get the correct color for this variation
    let baseColorForVariation: ColorData;

    switch (variation.key) {
      case 'default':
        baseColorForVariation = baseColor;
        break;
        
      case 'white':
        // Copy the base color to maintain existing structure
        baseColorForVariation = {
          ...baseColor,
          id: 'white',
          name: 'White',
          baseHex: '#ffffff',
          shadeIndex: 1
        };
        break;
        
      case 'black':
        // Copy the base color to maintain existing structure
        baseColorForVariation = {
          ...baseColor,
          id: 'black',
          name: 'Black',
          baseHex: '#000000',
          shadeIndex: 11
        };
        break;
        
      case 'grey':
        // Find default-grey color data if available
        const defaultGrey = safeColors.find(color => color.id === 'default-grey');
        
        if (defaultGrey) {
          // Use the default-grey with shade index 1
          baseColorForVariation = { 
            ...defaultGrey,
            shadeIndex: 1
          };
          
          // Check if we have the correct shade and set the baseHex
          if (defaultGrey.allModes?.[mode]?.allShades?.[1]?.hex) {
            baseColorForVariation.baseHex = defaultGrey.allModes[mode].allShades[1].hex;
          } else {
            baseColorForVariation.baseHex = '#808080';
          }
        } else {
          // Fallback to using base color structure with grey hex
          baseColorForVariation = {
            ...baseColor,
            id: 'grey',
            name: 'Grey',
            baseHex: '#808080',
            shadeIndex: 1
          };
        }
        break;
        // Primary color case implementations
        case 'primary': {
        console.group('Primary Color Selection');
        
        // Get the primary color directly
        const primaryColor = isColorData(activeTheme.colors.primary)
          ? activeTheme.colors.primary
          : safeColors.find(color => color.baseHex === activeTheme.colors.primary) || baseColor;
        
        // Use the base color directly without any transformations
        baseColorForVariation = primaryColor;
        
        console.log(`Primary: Using direct color ${primaryColor.baseHex}`);
        console.groupEnd();
        break;
      }

      case 'primary-light': {
        // Get the primary color directly
        const primaryColor = isColorData(activeTheme.colors.primary)
          ? activeTheme.colors.primary
          : safeColors.find(color => color.baseHex === activeTheme.colors.primary) || baseColor;
        
        // Get the actual shade index (no default fallback to 5)
        const baseIndex = typeof primaryColor.shadeIndex === 'string' 
          ? parseInt(primaryColor.shadeIndex, 10) 
          : primaryColor.shadeIndex;
        
        if (baseIndex !== undefined && baseIndex !== null) {
          // Get the proper light index based on our rules
          const { lightIndex } = getVariantIndices(baseIndex, primaryColor.baseHex);
          const allShades = primaryColor.allModes['AA-light']?.allShades || [];
          
          if (allShades.length > 0 && allShades[lightIndex]) {
            // Get the shade at the light index
            const primaryLightHex = allShades[lightIndex].hex;
            baseColorForVariation = { 
              ...primaryColor, 
              baseHex: primaryLightHex,
              shadeIndex: lightIndex  // Explicitly set the shadeIndex to the light index
            };
            
            console.log(`Primary-Light: Using lightIndex ${lightIndex} from base index ${baseIndex}`);
            
            // Log special handling cases
            if (baseIndex === 0) {
              console.log(`Special handling: Using index+1 for shade 0`);
            } else if (isYellowOrOrange(primaryColor.baseHex) && baseIndex === 4) {
              console.log(`Special handling: Yellow/orange shade 4 uses index-1`);
            } else if (baseIndex === 9) {
              console.log(`Special handling: Using index-2 for shade 9`);
            }
          } else {
            // No shade at that index, use base color
            baseColorForVariation = { 
              ...primaryColor,
              shadeIndex: baseIndex  // Preserve the original base index
            };
            console.log(`Primary-Light: No shade at index ${lightIndex}, using base color`);
          }
        } else {
          // No shade index, use base color
          baseColorForVariation = primaryColor;
          console.log(`Primary-Light: No shade index defined, using base color`);
        }
        break;
      }

      case 'primary-dark': {
        // Get the primary color directly
        const primaryColor = isColorData(activeTheme.colors.primary)
          ? activeTheme.colors.primary
          : safeColors.find(color => color.baseHex === activeTheme.colors.primary) || baseColor;
        
        // Get the actual shade index (no default fallback to 5)
        const baseIndex = typeof primaryColor.shadeIndex === 'string' 
          ? parseInt(primaryColor.shadeIndex, 10) 
          : primaryColor.shadeIndex;
        
        if (baseIndex !== undefined && baseIndex !== null) {
          // Get the proper dark index based on our rules
          const { darkIndex } = getVariantIndices(baseIndex, primaryColor.baseHex);
          const allShades = primaryColor.allModes['AA-light']?.allShades || [];
          
          if (allShades.length > 0 && allShades[darkIndex]) {
            // Get the shade at the dark index
            const primaryDarkHex = allShades[darkIndex].hex;
            baseColorForVariation = { 
              ...primaryColor, 
              baseHex: primaryDarkHex,
              shadeIndex: darkIndex  // Explicitly set the shadeIndex to the dark index
            };
            
            console.log(`Primary-Dark: Using darkIndex ${darkIndex} from base index ${baseIndex}`);
            
            // Log special handling cases
            if (baseIndex === 0) {
              console.log(`Special handling: Using index+2 for shade 0`);
            } else if (isYellowOrOrange(primaryColor.baseHex) && baseIndex === 4) {
              console.log(`Special handling: Yellow/orange shade 4 uses index-2 for dark variant`);
            } else if (baseIndex === 9) {
              console.log(`Special handling: Using index-1 for shade 9`);
            }
          } else {
            // No shade at that index, use base color
            baseColorForVariation = { 
              ...primaryColor,
              shadeIndex: baseIndex  // Preserve the original base index
            };
            console.log(`Primary-Dark: No shade at index ${darkIndex}, using base color`);
          }
        } else {
          // No shade index, use base color
          baseColorForVariation = primaryColor;
          console.log(`Primary-Dark: No shade index defined, using base color`);
        }
        break;
      }
      // Secondary color cases - using the exact same pattern as Primary and Secondary
      case 'secondary': {
        console.group('Secondary Color Selection');
        
        // Get the secondary color directly
        const secondaryColor = isColorData(activeTheme.colors.secondary)
          ? activeTheme.colors.secondary
          : safeColors.find(color => color.baseHex === activeTheme.colors.secondary) || baseColor;
        
        // Use the base color directly without any transformations
        baseColorForVariation = secondaryColor;
        
        console.log(`Secondary: Using direct color ${secondaryColor.baseHex}`);
        console.groupEnd();
        break;
      }

      // Implementation for secondary-light
      
      case 'secondary-light': {
        // Get the secondary color directly
        const secondaryColor = isColorData(activeTheme.colors.secondary)
          ? activeTheme.colors.secondary
          : safeColors.find(color => color.baseHex === activeTheme.colors.secondary) || baseColor;
        
        // Get the actual shade index (no default fallback to 5)
        const baseIndex = typeof secondaryColor.shadeIndex === 'string' 
          ? parseInt(secondaryColor.shadeIndex, 10) 
          : secondaryColor.shadeIndex;
        
        if (baseIndex !== undefined && baseIndex !== null) {
          // Get the proper light index based on our rules
          const { lightIndex } = getVariantIndices(baseIndex, secondaryColor.baseHex);
          const allShades = secondaryColor.allModes['AA-light']?.allShades || [];
          
          if (allShades.length > 0 && allShades[lightIndex]) {
            // Get the shade at the light index
            const secondaryLightHex = allShades[lightIndex].hex;
            baseColorForVariation = { 
              ...secondaryColor, 
              baseHex: secondaryLightHex,
              shadeIndex: lightIndex  // Explicitly set the shadeIndex to the light index
            };
            
            console.log(`secondary-Light: Using lightIndex ${lightIndex} from base index ${baseIndex}`);

          } else {
            // No shade at that index, use base color
            baseColorForVariation = { 
              ...secondaryColor,
              shadeIndex: baseIndex  // Preserve the original base index
            };
            console.log(`secondary-Light: No shade at index ${lightIndex}, using base color`);
          }
        } else {
          // No shade index, use base color
          baseColorForVariation = secondaryColor;
          console.log(`secondary-Light: No shade index defined, using base color`);
        }
        break;
      }

      case 'secondary-dark': {
        // Get the secondary color directly
        const secondaryColor = isColorData(activeTheme.colors.secondary)
          ? activeTheme.colors.secondary
          : safeColors.find(color => color.baseHex === activeTheme.colors.secondary) || baseColor;
        
        // Get the actual shade index (no default fallback to 5)
        const baseIndex = typeof secondaryColor.shadeIndex === 'string' 
          ? parseInt(secondaryColor.shadeIndex, 10) 
          : secondaryColor.shadeIndex;
        
        if (baseIndex !== undefined && baseIndex !== null) {
          // Get the proper dark index based on our rules
          const { darkIndex } = getVariantIndices(baseIndex, secondaryColor.baseHex);
          const allShades = secondaryColor.allModes['AA-light']?.allShades || [];
          
          if (allShades.length > 0 && allShades[darkIndex]) {
            // Get the shade at the dark index
            const secondaryDarkHex = allShades[darkIndex].hex;
            baseColorForVariation = { 
              ...secondaryColor, 
              baseHex: secondaryDarkHex,
              shadeIndex: darkIndex  // Explicitly set the shadeIndex to the dark index
            };
            
            console.log(`secondary-Dark: Using darkIndex ${darkIndex} from base index ${baseIndex}`);
            
            // Log special handling cases
            if (baseIndex === 0) {
              console.log(`Special handling: Using index+2 for shade 0`);
            } else if (isYellowOrOrange(secondaryColor.baseHex) && baseIndex === 4) {
              console.log(`Special handling: Yellow/orange shade 4 uses index-2 for dark variant`);
            } else if (baseIndex === 9) {
              console.log(`Special handling: Using index-1 for shade 9`);
            }
          } else {
            // No shade at that index, use base color
            baseColorForVariation = { 
              ...secondaryColor,
              shadeIndex: baseIndex  // Preserve the original base index
            };
            console.log(`secondary-Dark: No shade at index ${darkIndex}, using base color`);
          }
        } else {
          // No shade index, use base color
          baseColorForVariation = secondaryColor;
          console.log(`secondary-Dark: No shade index defined, using base color`);
        }
        break;
      }

      // Base case for tertiary color - matching primary pattern
      case 'tertiary': {
        console.group('Tertiary Color Selection');
        
        // Get the tertiary color directly
        const tertiaryColor = isColorData(activeTheme.colors.tertiary)
          ? activeTheme.colors.tertiary
          : safeColors.find(color => color.baseHex === activeTheme.colors.tertiary) || baseColor;
        
        // Use the base color directly without any transformations
        baseColorForVariation = tertiaryColor;
        
        console.log(`Tertiary: Using direct color ${tertiaryColor.baseHex}`);
        console.groupEnd();
        break;
      }

      // Implementation for tertiary-light
      case 'tertiary-light': {
        // Check if we have triadic harmony data
        if (harmonies && harmonies.triadic && harmonies.triadic.tertiary) {
          // Get tertiary color from triadic harmony
          const tertiaryColor = harmonies.triadic.tertiary;
          
          // Get the shade index from the harmony
          const baseIndex = typeof tertiaryColor.shadeIndex === 'string'
            ? parseInt(tertiaryColor.shadeIndex, 10)
            : tertiaryColor.shadeIndex;
          
          console.log(`Tertiary-Light: Using harmony shade index ${baseIndex}`);
          
          // Get the proper light index based on our rules
          const { lightIndex } = getVariantIndices(baseIndex, tertiaryColor.baseHex);
          console.log(`Tertiary-Light: Calculated light index: ${lightIndex}`);
          
          // Get the light shade from the color's shade array
          const allShades = tertiaryColor.allModes?.['AA-light']?.allShades || [];
          if (allShades.length > 0 && allShades[lightIndex]) {
            // Get the shade at the light index
            const tertiaryLightHex = allShades[lightIndex].hex;
            baseColorForVariation = { 
              ...tertiaryColor, 
              baseHex: tertiaryLightHex,
              shadeIndex: lightIndex  // Explicitly set the shadeIndex to the light index
            };
            
            console.log(`Tertiary-Light: Using color ${tertiaryLightHex} from shade index ${lightIndex}`);
          } else {
            // If no shade at that index, use the base color
            baseColorForVariation = { 
              ...tertiaryColor,
              shadeIndex: baseIndex  // Preserve the original base index
            };
            console.log(`Tertiary-Light: No shade at index ${lightIndex}, using base color ${tertiaryColor.baseHex}`);
          }
        } else {
          // Fallback to using the tertiary color from activeTheme
          const tertiaryColor = isColorData(activeTheme.colors.tertiary)
            ? activeTheme.colors.tertiary
            : safeColors.find(color => color.baseHex === activeTheme.colors.tertiary) || baseColor;
          
          console.log(`Tertiary-Light: No harmony data found, using theme tertiary color ${tertiaryColor.baseHex}`);
          baseColorForVariation = tertiaryColor;
        }
        break;
      }

      

      // Implementation for tertiary-dark
      case 'tertiary-dark': {
        // Check if we have triadic harmony data
        if (harmonies && harmonies.triadic && harmonies.triadic.tertiary) {
          // Get tertiary color from triadic harmony
          const tertiaryColor = harmonies.triadic.tertiary;
          
          // Get the shade index from the harmony
          const baseIndex = typeof tertiaryColor.shadeIndex === 'string'
            ? parseInt(tertiaryColor.shadeIndex, 10)
            : tertiaryColor.shadeIndex;
          
          console.log(`Tertiary-Dark: Using harmony shade index ${baseIndex}`);
          
          // Get the proper dark index based on our rules
          const { darkIndex } = getVariantIndices(baseIndex, tertiaryColor.baseHex);
          console.log(`Tertiary-Dark: Calculated dark index: ${darkIndex}`);
          
          // Get the dark shade from the color's shade array
          const allShades = tertiaryColor.allModes?.['AA-light']?.allShades || [];
          if (allShades.length > 0 && allShades[darkIndex]) {
            // Get the shade at the dark index
            const tertiaryDarkHex = allShades[darkIndex].hex;
            baseColorForVariation = { 
              ...tertiaryColor, 
              baseHex: tertiaryDarkHex,
              shadeIndex: darkIndex  // Explicitly set the shadeIndex to the dark index
            };
            
            console.log(`Tertiary-Dark: Using color ${tertiaryDarkHex} from shade index ${darkIndex}`);
          } else {
            // If no shade at that index, use the base color
            baseColorForVariation = { 
              ...tertiaryColor,
              shadeIndex: baseIndex  // Preserve the original base index
            };
            console.log(`Tertiary-Dark: No shade at index ${darkIndex}, using base color ${tertiaryColor.baseHex}`);
          }
        } else {
          // Fallback to using the tertiary color from activeTheme
          const tertiaryColor = isColorData(activeTheme.colors.tertiary)
            ? activeTheme.colors.tertiary
            : safeColors.find(color => color.baseHex === activeTheme.colors.tertiary) || baseColor;
          
          console.log(`Tertiary-Dark: No harmony data found, using theme tertiary color ${tertiaryColor.baseHex}`);
          baseColorForVariation = tertiaryColor;
        }
        break;
      }
        default:
          baseColorForVariation = baseColor;
      }

      try {
        variation.processor({
          baseColor: baseColorForVariation,
          activeTheme,
          stateColors,
          hotlinkStyle,
          safeColors,
          style,
          mode, // Pass the current mode being processed
          groupName: variation.name
        });
        
        console.log(`Successfully processed ${variation.name} using ${variation.processor.name} for mode ${mode}`);
      } catch (error) {
        console.error(`Error processing ${variation.name} for mode ${mode}:`, error);
      }

      console.groupEnd();
    });

    console.groupEnd(); // End mode group
  });

  console.groupEnd(); // End process tokens group
};

