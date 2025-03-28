// Navigation Types
export interface Route {
  id: string;
  title: string;
  path: string;
}

export interface ColorModeSettings {
  lightestShade: number; // 0-100
  darkestShade: number; // 0-100
  maxChroma: number; // 0-100
  textColor: {
    light: string;
    dark: string;
  };
}

export interface ColorSettings {
  numberOfShades: number;
  numberOfColors: number;
  sampling: number;
  imageUrl?: string;
  hueDifference: number;
  lightMode: ColorModeSettings;
  darkMode: ColorModeSettings;
  contrastMode: 'AA' | 'AAA';
  minContrastRatio: number;
}

// Plugin Message Types
export type PluginMessage = 
  | { type: 'generate-design-system'; name: string; settings: DesignSystemSettings }
  | { type: 'notify'; message: string }
  | { type: 'create-styles'; colors: ColorPalette }
  | { type: 'export-theme'; format: 'css' | 'json' };

// Color Types
export interface ColorPalette {
  primary: ColorShades;
  secondary: ColorShades;
  neutral: ColorShades;
  success: ColorShades;
  warning: ColorShades;
  error: ColorShades;
  info: ColorShades;
}

export interface ColorShades {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

// Theme Types
export interface ThemeSettings {
  darkMode: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

export interface ColorSetting {
  hex: string;
  opacity: number;
}

// Design System Settings
export interface DesignSystemSettings {
  name: string;
  generationMethod: string;
  imageFile: File | null | undefined;
  imageUrl?: string;
  mood?: string;
}