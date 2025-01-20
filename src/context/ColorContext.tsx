import React, { createContext, useContext, useState, useCallback } from 'react';
import { ColorData } from '../../src/app/utils/color-harmonies'; // Adjust import path
import { generateUniqueColorNames } from '../../src/app/utils/color-namer'; // Adjust import path


// Type guard to check if a color is a ColorData
const isColorData = (color: any): color is ColorData => {
  return typeof color === 'object' && 
         color !== null &&
         'baseHex' in color && 
         'name' in color && 
         'id' in color;
};

interface ColorContextType {
  colors: (string | ColorData)[];
  setColors: (colors: (string | ColorData)[]) => void;
  colorNames: string[];
  setColorNames: (names: string[]) => void;
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
  setColorNames: () => {}
});

export function ColorProvider({ children }: { children: React.ReactNode }) {
  const [colors, setColors] = useState<(string | ColorData)[]>(DEFAULT_COLORS);
  const [colorNames, setColorNames] = useState<string[]>([]);

  const handleSetColors = useCallback((input: (string | ColorData)[]) => {
    if (input.length === 0) {
      setColors([]);
      setColorNames([]);
      return;
    }

    // Normalize input to ensure consistent type
    const normalizedColors = input.map(color => {
      // If it's already a ColorData, return it
      if (isColorData(color)) {
        return color;
      }
      
      // If it's a string, convert to ColorData
      const colorName = generateUniqueColorNames([color])[0];
      return {
        id: `${colorName.toLowerCase().replace(/\s+/g, '-')}`,
        baseHex: color,
        name: colorName,
        shadeIndex: 0
      };
    });

    // Extract hex colors and names
    const hexColors = normalizedColors.map(cd => 
      isColorData(cd) ? cd.baseHex : cd
    );
    const names = normalizedColors.map(cd => 
      isColorData(cd) ? cd.name : generateUniqueColorNames([cd])[0]
    );

    setColors(normalizedColors);
    setColorNames(names);
  }, []);

  const handleSetColorNames = useCallback((input: string[]) => {
    setColorNames(input);
  }, []);

  return (
    <ColorContext.Provider 
      value={{ 
        colors, 
        setColors: handleSetColors, 
        colorNames, 
        setColorNames: handleSetColorNames 
      }}
    >
      {children}
    </ColorContext.Provider>
  );
}

export function useColors() {
  const context = useContext(ColorContext);
  
  // Helper method to get hex colors
  const getHexColors = () => {
    return context.colors.map(color => 
      isColorData(color) ? color.baseHex : color
    );
  };

  return {
    ...context,
    colors: getHexColors()
  };
}