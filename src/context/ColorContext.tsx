// src/context/ColorContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface ColorContextType {
  colors: string[];
  setColors: (colors: string[]) => void;
  colorNames: string[];
  setColorNames: (names: string[]) => void;
}

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export function ColorProvider({ children }: { children: React.ReactNode }) {
  const [colors, setColors] = useState<string[]>([]);
  const [colorNames, setColorNames] = useState<string[]>([]);

  return (
    <ColorContext.Provider value={{ colors, setColors, colorNames, setColorNames }}>
      {children}
    </ColorContext.Provider>
  );
}

export function useColors() {
  const context = useContext(ColorContext);
  if (context === undefined) {
    throw new Error('useColors must be used within a ColorProvider');
  }
  return context;
}