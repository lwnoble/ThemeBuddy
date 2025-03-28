import React, { createContext, useContext, useState, useCallback } from 'react';
import { ColorData } from '../app/types/colors';
import { generateUniqueColorNames } from '../../src/app/utils/color-namer';

const isColorData = (color: any): color is ColorData => {
  return typeof color === 'object' && 
         color !== null &&
         'baseHex' in color && 
         'name' in color && 
         'id' in color &&
         'shadeIndex' in color &&
         'allModes' in color &&
         typeof color.allModes === 'object' &&
         color.allModes !== null &&
         'AA-light' in color.allModes &&
         'AA-dark' in color.allModes &&
         'AAA-light' in color.allModes &&
         'AAA-dark' in color.allModes &&
         Array.isArray(color.allModes['AA-light'].allShades) &&
         Array.isArray(color.allModes['AA-dark'].allShades) &&
         Array.isArray(color.allModes['AAA-light'].allShades) &&
         Array.isArray(color.allModes['AAA-dark'].allShades);
};

interface ColorContextType {
  colors: (string | ColorData)[];
  setColors: (colors: (string | ColorData)[]) => void;
  colorNames: string[];
  setColorNames: (names: string[]) => void;
  allShades: Record<string, ColorData[]>;
  setAllShades: (shades: Record<string, ColorData[]>) => void;
  neutralColors: {
    white: ColorData | null;
    grey: ColorData | null;
    black: ColorData | null;
  };
  setNeutralColors: (colors: {
    white: ColorData | null;
    grey: ColorData | null;
    black: ColorData | null;
  }) => void;
}

const DEFAULT_COLORS = [
  '#FF0000',   // Red
  '#00FF00',   // Green
  '#0000FF',   // Blue
  '#FFFF00',   // Yellow
  '#FF00FF',   // Magenta
  '#00FFFF',   // Cyan
];

const ColorContext = createContext<ColorContextType>({
  colors: DEFAULT_COLORS,
  setColors: () => {},
  colorNames: [],
  setColorNames: () => {},
  allShades: {},
  setAllShades: () => {},
  neutralColors: {
    white: null,
    grey: null,
    black: null
  },
  setNeutralColors: () => {}
});

export function ColorProvider({ children }: { children: React.ReactNode }) {
  const [colors, setColors] = useState<(string | ColorData)[]>(DEFAULT_COLORS);
  const [colorNames, setColorNames] = useState<string[]>([]);
  const [allShades, setAllShades] = useState<Record<string, ColorData[]>>({});
  const [neutralColors, setNeutralColors] = useState<{
    white: ColorData | null;
    grey: ColorData | null;
    black: ColorData | null;
  }>({
    white: null,
    grey: null,
    black: null
  });

  const handleSetColors = useCallback((input: (string | ColorData)[]) => {
    console.group('🎨 ColorContext: Set Colors');
    console.log('Input Colors:', {
      count: input.length,
      inputTypes: input.map(c => typeof c),
      inputColors: input.map(c => 
        typeof c === 'object' && c !== null ? c.baseHex : c
      )
    });
    
    if (input.length === 0) {
      setColors([]);
      setColorNames([]);
      return;
    }

    // Normalize input to ensure consistent type
    const normalizedColors = input.map((color, index) => {
      if (isColorData(color)) {
        console.log(`🎨 ColorContext: Color ${index} is already ColorData:`, JSON.stringify(color, null, 2));
        return color;
      }
      
      const colorName = generateUniqueColorNames([color])[0];
      const normalizedColor: ColorData = {
        id: `${colorName.toLowerCase().replace(/\s+/g, '-')}`,
        baseHex: color,
        name: colorName,
        shadeIndex: 0,  // Use number 0
        allModes: {
          'AA-light': { allShades: [] },
          'AA-dark': { allShades: [] },
          'AAA-light': { allShades: [] },
          'AAA-dark': { allShades: [] }
        }
      };
    
    return normalizedColor;
   });

    const hexColors = normalizedColors.map(cd => 
      isColorData(cd) ? cd.baseHex : cd
    );
    const names = normalizedColors.map(cd => {
      if (isColorData(cd)) {
        return cd.name;
      }
      const colorStr = typeof cd === 'string' ? cd : String(cd);
      return generateUniqueColorNames([colorStr])[0];
    });

    console.log('🎨 ColorContext: Final normalized colors:', JSON.stringify(normalizedColors, null, 2));
    console.log('🎨 ColorContext: Final color names:', names);

    setColors(normalizedColors);
    setColorNames(names);
    console.log('Final Colors:', {
      count: normalizedColors.length,
      hexColors: normalizedColors.map(c => 
        isColorData(c) ? c.baseHex : c
      )
    });
    console.groupEnd();
  
    return normalizedColors;
  }, []);

  const handleSetColorNames = useCallback((input: string[]) => {
    console.log('🎨 ColorContext: Setting color names:', input);
    setColorNames(input);
  }, []);

  const handleSetAllShades = useCallback((shades: Record<string, ColorData[]>) => {
    console.log('🎨 ColorContext: Setting all shades:', JSON.stringify(shades, null, 2));
    setAllShades(shades);
  }, []);

  const handleSetNeutralColors = useCallback((colors: {
    white: ColorData | null;
    grey: ColorData | null;
    black: ColorData | null;
  }) => {
    console.log('🎨 ColorContext: Setting neutral colors:', JSON.stringify(colors, null, 2));
    setNeutralColors(colors);
  }, []);

  return (
    <ColorContext.Provider 
      value={{ 
        colors, 
        setColors: handleSetColors, 
        colorNames, 
        setColorNames: handleSetColorNames,
        allShades,
        setAllShades: handleSetAllShades,
        neutralColors,
        setNeutralColors: handleSetNeutralColors
      }}
    >
      {children}
    </ColorContext.Provider>
  );
}

export function useColors() {
  const context = useContext(ColorContext);
  
  const getHexColors = () => {
    return context.colors.map(color => 
      isColorData(color) ? color.baseHex : color
    );
  };

  const getFullColorData = () => {
    return context.colors.map(color => 
      isColorData(color) ? color : {
        id: `color-${Math.random().toString(36).substr(2, 9)}`,
        baseHex: color,
        name: generateUniqueColorNames([color])[0],
        shadeIndex: "0",
        allModes: {
          'AA-light': {
            allShades: []
          },
          'AA-dark': {
            allShades: []
          },
          'AAA-light': {
            allShades: []
          },
          'AAA-dark': {
            allShades: []
          }
        }
      }
    );
  };

  return {
    ...context,
    colors: getHexColors(),
    fullColorData: getFullColorData(),
    allShades: context.allShades,
    setAllShades: context.setAllShades,
    neutralColors: context.neutralColors,
    setNeutralColors: context.setNeutralColors
  };
}