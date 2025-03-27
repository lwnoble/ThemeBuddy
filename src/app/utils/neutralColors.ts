// src/app/utils/neutralColors.ts
import { ColorData } from '../types/colors';
import { generateAllColorModes, ColorSettings } from './colors';

const chroma = require('chroma-js');

/**
 * Creates a ColorData object for neutral colors (white, grey, black)
 * with properly generated shades and contrast ratios.
 * 
 * @param color Base color hex value
 * @param id Unique identifier for the color
 * @param name Display name for the color
 * @param shadeIndex Index position in the shade array
 * @param settings Color settings for shade generation
 * @returns ColorData object with all modes and shades
 */
export const createNeutralColorData = (
  color: string, 
  id: string, 
  name: string, 
  shadeIndex: number,
  settings: ColorSettings
): ColorData => {
  const modes = generateAllColorModes(color, settings);
  return {
    id,
    baseHex: color,
    name,
    shadeIndex,
    allModes: {
      'AA-light': {
        allShades: [
          {
            hex: '#FFFFFF',
            contrastRatio: chroma.contrast('#FFFFFF', settings.lightMode.textColor.dark),
            textColor: settings.lightMode.textColor.dark
          },
          ...modes['AA-light'].map(shade => ({
            hex: shade.color,
            contrastRatio: shade.contrastRatio,
            textColor: shade.textColor
          })),
          {
            hex: '#121212',
            contrastRatio: chroma.contrast('#121212', settings.lightMode.textColor.light),
            textColor: settings.lightMode.textColor.light
          }
        ]
      },
      'AA-dark': {
        allShades: [
          {
            hex: '#FFFFFF',
            contrastRatio: chroma.contrast('#FFFFFF', settings.darkMode.textColor.dark),
            textColor: settings.darkMode.textColor.dark
          },
          ...modes['AA-dark'].map(shade => ({
            hex: shade.color,
            contrastRatio: shade.contrastRatio,
            textColor: shade.textColor
          })),
          {
            hex: '#121212',
            contrastRatio: chroma.contrast('#121212', settings.darkMode.textColor.light),
            textColor: settings.darkMode.textColor.light
          }
        ]
      },
      'AAA-light': {
        allShades: [
          {
            hex: '#FFFFFF',
            contrastRatio: chroma.contrast('#FFFFFF', settings.lightMode.textColor.dark),
            textColor: settings.lightMode.textColor.dark
          },
          ...modes['AAA-light'].map(shade => ({
            hex: shade.color,
            contrastRatio: shade.contrastRatio,
            textColor: shade.textColor
          })),
          {
            hex: '#121212',
            contrastRatio: chroma.contrast('#121212', settings.lightMode.textColor.light),
            textColor: settings.lightMode.textColor.light
          }
        ]
      },
      'AAA-dark': {
        allShades: [
          {
            hex: '#FFFFFF',
            contrastRatio: chroma.contrast('#FFFFFF', settings.darkMode.textColor.dark),
            textColor: settings.darkMode.textColor.dark
          },
          ...modes['AAA-dark'].map(shade => ({
            hex: shade.color,
            contrastRatio: shade.contrastRatio,
            textColor: shade.textColor
          })),
          {
            hex: '#121212',
            contrastRatio: chroma.contrast('#121212', settings.darkMode.textColor.light),
            textColor: settings.darkMode.textColor.light
          }
        ]
      }
    }
  };
};

/**
 * Default color settings for generating neutral colors
 */
export const defaultNeutralColorSettings: ColorSettings = {
  numberOfShades: 10,
  numberOfColors: 10,
  deltaE: 5,
  lightMode: {
    lightestShade: 95,
    darkestShade: 10,
    maxChroma: 100,
    textColor: {
      light: '#FFFFFF',
      dark: '#121212',
      lightOpacity: 1,
      darkOpacity: 1
    }
  },
  darkMode: {
    lightestShade: 90,
    darkestShade: 5,
    maxChroma: 80,
    textColor: {
      light: '#FFFFFF',
      dark: '#121212',
      lightOpacity: 0.7,
      darkOpacity: 1
    }
  },
  contrastMode: 'AA',
  minContrastRatio: 4.5
};

// Pre-created neutral color data objects
export const white: ColorData = {
  id: 'default-white',
  baseHex: '#FFFFFF',
  name: 'White',
  shadeIndex: 0,
  allModes: {
    'AA-light': {
      allShades: Array(10).fill(null).map((_, i) => ({
        hex: i === 0 ? '#FFFFFF' : i === 9 ? '#F0F0F0' : `#FFFFFF`,
        contrastRatio: 21,
        textColor: '#121212'
      }))
    },
    'AA-dark': {
      allShades: Array(10).fill(null).map((_, i) => ({
        hex: i === 0 ? '#FFFFFF' : i === 9 ? '#F0F0F0' : `#FFFFFF`,
        contrastRatio: 21,
        textColor: '#121212'
      }))
    },
    'AAA-light': {
      allShades: Array(10).fill(null).map((_, i) => ({
        hex: i === 0 ? '#FFFFFF' : i === 9 ? '#F0F0F0' : `#FFFFFF`,
        contrastRatio: 21,
        textColor: '#121212'
      }))
    },
    'AAA-dark': {
      allShades: Array(10).fill(null).map((_, i) => ({
        hex: i === 0 ? '#FFFFFF' : i === 9 ? '#F0F0F0' : `#FFFFFF`,
        contrastRatio: 21,
        textColor: '#121212'
      }))
    }
  }
};

export const grey: ColorData = {
  id: 'default-grey',
  baseHex: '#808080',
  name: 'Grey',
  shadeIndex: 1,
  allModes: {
    'AA-light': {
      allShades: Array(10).fill(null).map((_, i) => ({
        hex: i === 0 ? '#F0F0F0' : i === 9 ? '#202020' : `#${8-i}${8-i}${8-i}${8-i}${8-i}${8-i}`,
        contrastRatio: i < 5 ? 4.5 : 7,
        textColor: i < 5 ? '#121212' : '#FFFFFF'
      }))
    },
    'AA-dark': {
      allShades: Array(10).fill(null).map((_, i) => ({
        hex: i === 0 ? '#F0F0F0' : i === 9 ? '#202020' : `#${8-i}${8-i}${8-i}${8-i}${8-i}${8-i}`,
        contrastRatio: i < 5 ? 4.5 : 7,
        textColor: i < 5 ? '#121212' : '#FFFFFFB3'
      }))
    },
    'AAA-light': {
      allShades: Array(10).fill(null).map((_, i) => ({
        hex: i === 0 ? '#F0F0F0' : i === 9 ? '#202020' : `#${8-i}${8-i}${8-i}${8-i}${8-i}${8-i}`,
        contrastRatio: i < 5 ? 4.5 : 7,
        textColor: i < 5 ? '#121212' : '#FFFFFF'
      }))
    },
    'AAA-dark': {
      allShades: Array(10).fill(null).map((_, i) => ({
        hex: i === 0 ? '#F0F0F0' : i === 9 ? '#202020' : `#${8-i}${8-i}${8-i}${8-i}${8-i}${8-i}`,
        contrastRatio: i < 5 ? 4.5 : 7,
        textColor: i < 5 ? '#121212' : '#FFFFFFB3'
      }))
    }
  }
};

export const black: ColorData = {
  id: 'default-black',
  baseHex: '#121212',
  name: 'Black',
  shadeIndex: 11,
  allModes: {
    'AA-light': {
      allShades: Array(10).fill(null).map((_, i) => ({
        hex: i === 0 ? '#303030' : i === 9 ? '#121212' : `#${1+i}${1+i}${1+i}${1+i}${1+i}${1+i}`,
        contrastRatio: 21,
        textColor: '#FFFFFF'
      }))
    },
    'AA-dark': {
      allShades: Array(10).fill(null).map((_, i) => ({
        hex: i === 0 ? '#303030' : i === 9 ? '#121212' : `#${1+i}${1+i}${1+i}${1+i}${1+i}${1+i}`,
        contrastRatio: 21,
        textColor: '#FFFFFFB3'
      }))
    },
    'AAA-light': {
      allShades: Array(10).fill(null).map((_, i) => ({
        hex: i === 0 ? '#303030' : i === 9 ? '#121212' : `#${1+i}${1+i}${1+i}${1+i}${1+i}${1+i}`,
        contrastRatio: 21,
        textColor: '#FFFFFF'
      }))
    },
    'AAA-dark': {
      allShades: Array(10).fill(null).map((_, i) => ({
        hex: i === 0 ? '#303030' : i === 9 ? '#121212' : `#${1+i}${1+i}${1+i}${1+i}${1+i}${1+i}`,
        contrastRatio: 21,
        textColor: '#FFFFFFB3'
      }))
    }
  }
};
