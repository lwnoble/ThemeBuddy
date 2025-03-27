import { ColorData, ColorSet } from './colors';
import { SurfaceStyle, HotlinkStyle, ButtonShape, ComponentEffect } from './modes';

// Available theme types
export type ThemeType = 
  | 'analogous' 
  | 'monochromatic' 
  | 'triadic' 
  | 'tetradic' 
  | 'square' 
  | 'diadic' 
  | 'achromatic' 
  | 'split-complementary' 
  | 'custom';

// Theme structure
export interface Theme {
  name: string;
  colors: ColorSet;
  type: ThemeType;
}

// Theme analysis result
export interface ThemeAnalysisResult {
  theme: Theme;
  isValid: boolean;
  reason: ThemeAnalysisReason;
}

// Reasons for theme analysis results
export type ThemeAnalysisReason = 'duplicate' | 'redundant' | 'valid';

// Theme state with persistent styling preferences
export interface ThemeState {
  activeTheme: Theme | null;
  selectedTheme: Theme | null;
  secondaryColor: ColorData | null;
  tertiaryColor: ColorData | null;
  baseColor: ColorData | null;
  // Add variant colors
  primaryLightColor: ColorData | null;
  primaryDarkColor: ColorData | null;
  secondaryLightColor: ColorData | null;
  secondaryDarkColor: ColorData | null;
  tertiaryLightColor: ColorData | null;
  tertiaryDarkColor: ColorData | null;
  // Special background colors
  whiteColor: ColorData | null;
  greyColor: ColorData | null;
  blackColor: ColorData | null;
  // Styling preferences that persist
  surfaceStyle: SurfaceStyle;
  hotlinkStyle: HotlinkStyle;
  buttonShape: ButtonShape;
  componentEffect: ComponentEffect;
}