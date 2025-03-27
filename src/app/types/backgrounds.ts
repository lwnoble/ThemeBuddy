// backgrounds.ts file

import { Mode } from './modes';
import { SurfaceStyle } from '../utils/styleProcessors'; // Import the SurfaceStyle type

export interface BackgroundTheme {
  // Base properties
  id: string;              // Unique identifier for the background
  name: string;            // Display name
  baseHex: string;         // Base hexadecimal color value
  shadeIndex: string;      // Shade index reference
  backgroundColor: string; // The background color
  styleType?: SurfaceStyle; // The style processor type used for this background

  // Additional surface backgrounds
  surface: string;         // Standard surface color
  surfaceDim: string;      // Dimmed surface variant
  surfaceBright: string;   // Bright surface variant
  surfaceQuiet: string;    // Quiet surface variant
  surfaceDimQuiet: string; // Quiet dimmed surface variant
  surfaceBrightQuiet: string; // Quiet bright surface variant

  // Additional container backgrounds
  container: string;         // Standard container color
  containerLow: string;      // Low container variant
  containerLowest: string;   // Lowest container variant
  containerHigh: string;     // High container variant
  containerHighest: string;  // Highest container variant
  containerQuiet: string;    // Quiet container variant
  containerLowQuiet: string; // Quiet low container variant
  containerLowestQuiet: string; // Quiet lowest container variant
  containerHighQuiet: string; // Quiet high container variant
  containerHighestQuiet: string; // Quiet highest container variant

  // Surfaces properties
  surfaces: {
    onColor: string;        // Text color for this background
    onQuiet: string;        // Quiet text variant
    border: string;         // Border color
    button: string;         // Button background color
    buttonText: string;     // Button text color
    buttonHalf: string;     // Half-filled button variant
    iconBg: string;         // Icon background (often transparent)
    iconPrimary: string;    // Primary icon color
    iconSecondary: string;  // Secondary icon color
    iconTertiary: string;   // Tertiary icon color
    iconSuccess: string;    // Success icon color
    iconWarning: string;    // Warning icon color
    iconError: string;      // Error icon color
    iconInfo: string;       // Info icon color
    hotlink: string;        // Hyperlink color
  };

  // Containers properties
  containers: {
    onColor: string;        // Text color for this background
    onQuiet: string;        // Quiet text variant
    border: string;         // Border color
    button: string;         // Button background color
    buttonText: string;     // Button text color
    buttonHalf: string;     // Half-filled button variant
    iconBg: string;         // Icon background (often transparent)
    iconPrimary: string;    // Primary icon color
    iconSecondary: string;  // Secondary icon color
    iconTertiary: string;   // Tertiary icon color
    iconSuccess: string;    // Success icon color
    iconWarning: string;    // Warning icon color
    iconError: string;      // Error icon color
    iconInfo: string;       // Info icon color
    hotlink: string;        // Hyperlink color
  };
}


// Interface for storing background themes by mode
export interface BackgroundThemeStore {
  [groupId: string]: {
    [mode in Mode]?: BackgroundTheme;
  };
}