// src/app/types/colors.ts
import { Mode } from './modes';

export interface ColorShade {
  hex: string;
  contrastRatio: number;
  textColor: string;
}

export interface ModeColorData {
  allShades: ColorShade[];
}

export interface ColorData {
  id: string;
  name: string;
  baseHex: string;
  shadeIndex: number;
  allModes: {
    'AA-light': { 
      allShades: Array<{
        hex: string;
        contrastRatio: number;
        textColor: string;
      }> 
    };
    'AA-dark': { 
      allShades: Array<{
        hex: string;
        contrastRatio: number;
        textColor: string;
      }> 
    };
    'AAA-light': { 
      allShades: Array<{
        hex: string;
        contrastRatio: number;
        textColor: string;
      }> 
    };
    'AAA-dark': { 
      allShades: Array<{
        hex: string;
        contrastRatio: number;
        textColor: string;
      }> 
    };
  };
  metadata?: {
    source?: string;
    harmonyType?: string;
    generatedAt?: string;
    updatedAt?: string;
    draggedAt?: string;
  };
}

export interface ColorHarmony {
  primary: ColorData;
  secondary: ColorData;
  tertiary: ColorData;
}

export interface HarmoniesState {
  analogous: ColorHarmony | null;
  monochromatic: ColorHarmony | null;
  triadic: ColorHarmony | null;
  tetradic: ColorHarmony | null;
  square: ColorHarmony | null;
  diadic: ColorHarmony | null;
  achromatic: ColorHarmony | null;
  splitComplementary: ColorHarmony | null;
}

export interface ColorSet {
  primary: ColorData | string;
  secondary: ColorData | string;
  tertiary: ColorData | string;
}

// Type guard
export function isColorData(color: ColorData | string): color is ColorData {
  return typeof color === 'object' && 'baseHex' in color;
}