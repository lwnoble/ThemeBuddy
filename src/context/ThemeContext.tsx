import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { ColorData, HarmoniesState } from '../app/types/colors';
import { Theme, ThemeState } from '../app/types/theme';
import { SurfaceStyle, HotlinkStyle, ButtonShape, ComponentEffect } from '../app/types/modes';

import { white, grey, black } from '../app/utils/neutralColors';

// Theme Action Types
type ThemeAction = 
  | { type: 'SET_THEME'; payload: { theme: Theme; secondaryColor: ColorData | null; tertiaryColor: ColorData | null } }
  | { type: 'SET_BASE_COLOR'; payload: ColorData }
  | { type: 'INITIALIZE_THEME'; payload: { colors: ColorData[], harmonies: HarmoniesState } }
  | { type: 'SET_SURFACE_STYLE'; payload: SurfaceStyle }
  | { type: 'SET_HOTLINK_STYLE'; payload: HotlinkStyle }
  | { type: 'SET_BUTTON_SHAPE'; payload: ButtonShape }
  | { type: 'SET_COMPONENT_EFFECT'; payload: ComponentEffect }
  | { type: 'UPDATE_NEUTRAL_COLORS'; payload: { whiteColor: ColorData, greyColor: ColorData, blackColor: ColorData } };

// Update initialThemeState to use default ColorData objects:
// Remove this line that's causing the error
// const { white, grey, black } = getNeutralColors();

// Update initialThemeState with proper shade indices
const initialThemeState: ThemeState = {
  activeTheme: null,
  selectedTheme: null,
  secondaryColor: null,
  tertiaryColor: null,
  baseColor: null,
  // Initialize variant colors as null
  primaryLightColor: null,
  primaryDarkColor: null,
  secondaryLightColor: null,
  secondaryDarkColor: null,
  tertiaryLightColor: null,
  tertiaryDarkColor: null,
  // Initialize with default neutral colors with proper shade indices
  whiteColor: white,
  greyColor: grey,
  blackColor: black,
  // Set default values for style preferences
  surfaceStyle: 'light-tonal',
  hotlinkStyle: 'tonal',
  buttonShape: 'gently-rounded',
  componentEffect: 'none'
};

const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  console.group('Theme Reducer');
  console.log('Current State:', {
    baseColor: state.baseColor?.baseHex,
    activeThemeName: state.activeTheme?.name,
    selectedThemeName: state.selectedTheme?.name,
    surfaceStyle: state.surfaceStyle,
    hotlinkStyle: state.hotlinkStyle,
    buttonShape: state.buttonShape,
    componentEffect: state.componentEffect
  });
  console.log('Incoming Action:', action.type);

  try {
    switch (action.type) {
      case 'INITIALIZE_THEME': {
        const { colors, harmonies } = action.payload;
        
        // Validate colors array
        if (!colors || !Array.isArray(colors) || colors.length === 0) {
          console.warn('No valid colors provided for initialization');
          return state;
        }
        
        // Just set the base color and return - theme will be set later when harmonies are ready
        const baseColor = colors[0];
        if (!baseColor) {
          console.warn('Invalid base color');
          return state;
        }
        
        // We're not trying to set a theme here, just the base color
        // The theme will be set by the SET_THEME action when harmonies are available
        return {
          ...state,
          baseColor
        };
      }

      case 'SET_THEME': {
        const { theme, secondaryColor, tertiaryColor } = action.payload;
        const primaryColor = theme.colors.primary as ColorData;
        
        // Find light and dark variants for primary
        let primaryLightColor = null;
        let primaryDarkColor = null;
        if (primaryColor && primaryColor.allModes && primaryColor.allModes['AA-light']) {
          // Get lighter shade (e.g., index 2 for light variant)
          primaryLightColor = {
            ...primaryColor,
            baseHex: primaryColor.allModes['AA-light'].allShades[2]?.hex || primaryColor.baseHex,
            shadeIndex: 2
          };
          
          // Get darker shade (e.g., index 8 for dark variant)
          primaryDarkColor = {
            ...primaryColor,
            baseHex: primaryColor.allModes['AA-light'].allShades[8]?.hex || primaryColor.baseHex,
            shadeIndex: 8
          };
        }
        
        // Similar logic for secondary color
        let secondaryLightColor = null;
        let secondaryDarkColor = null;
        if (secondaryColor && secondaryColor.allModes && secondaryColor.allModes['AA-light']) {
          secondaryLightColor = {
            ...secondaryColor,
            baseHex: secondaryColor.allModes['AA-light'].allShades[2]?.hex || secondaryColor.baseHex,
            shadeIndex: 2
          };
          
          secondaryDarkColor = {
            ...secondaryColor,
            baseHex: secondaryColor.allModes['AA-light'].allShades[8]?.hex || secondaryColor.baseHex,
            shadeIndex: 8
          };
        }
        
        // Similar logic for tertiary color
        let tertiaryLightColor = null;
        let tertiaryDarkColor = null;
        if (tertiaryColor && tertiaryColor.allModes && tertiaryColor.allModes['AA-light']) {
          tertiaryLightColor = {
            ...tertiaryColor,
            baseHex: tertiaryColor.allModes['AA-light'].allShades[2]?.hex || tertiaryColor.baseHex,
            shadeIndex: 2
          };
          
          tertiaryDarkColor = {
            ...tertiaryColor,
            baseHex: tertiaryColor.allModes['AA-light'].allShades[8]?.hex || tertiaryColor.baseHex,
            shadeIndex: 8
          };
        }
      
        const newState = {
          ...state,
          activeTheme: theme,
          selectedTheme: theme,
          secondaryColor,
          tertiaryColor,
          // Add the variant colors
          primaryLightColor,
          primaryDarkColor,
          secondaryLightColor,
          secondaryDarkColor,
          tertiaryLightColor,
          tertiaryDarkColor
        };
      
        console.log('Set Theme State:', {
          activeThemeName: newState.activeTheme?.name,
          primaryColor: newState.activeTheme?.colors.primary,
          secondaryColor: newState.secondaryColor?.baseHex,
          tertiaryColor: newState.tertiaryColor?.baseHex,
          // Log variant colors
          primaryLightColor: newState.primaryLightColor?.baseHex,
          primaryDarkColor: newState.primaryDarkColor?.baseHex
        });
      
        return newState;
      }

      case 'SET_BASE_COLOR': {
        const newState = {
          ...state,
          baseColor: action.payload,
          // Only reset active and selected theme if they don't exist
          ...((!state.activeTheme && !!action.payload) ? {
            activeTheme: null,
            selectedTheme: null
          } : {})
        };

        console.log('Set Base Color State:', {
          baseColor: newState.baseColor?.baseHex,
          activeThemeExists: !!newState.activeTheme
        });

        return newState;
      }

      case 'SET_SURFACE_STYLE': {
        const newState = {
          ...state,
          surfaceStyle: action.payload
        };

        console.log('Set Surface Style State:', {
          previousStyle: state.surfaceStyle,
          newStyle: newState.surfaceStyle
        });

        return newState;
      }

      case 'SET_HOTLINK_STYLE': {
        const newState = {
          ...state,
          hotlinkStyle: action.payload
        };

        console.log('Set Hotlink Style State:', {
          previousStyle: state.hotlinkStyle,
          newStyle: newState.hotlinkStyle
        });

        return newState;
      }

      case 'SET_BUTTON_SHAPE': {
        const newState = {
          ...state,
          buttonShape: action.payload
        };

        console.log('Set Button Shape State:', {
          previousShape: state.buttonShape,
          newShape: newState.buttonShape
        });

        return newState;
      }

      case 'SET_COMPONENT_EFFECT': {
        const newState = {
          ...state,
          componentEffect: action.payload
        };

        console.log('Set Component Effect State:', {
          previousEffect: state.componentEffect,
          newEffect: newState.componentEffect
        });

        return newState;
      }

      case 'UPDATE_NEUTRAL_COLORS': {
        const { whiteColor, greyColor, blackColor } = action.payload;
        
        const newState = {
          ...state,
          whiteColor,
          greyColor,
          blackColor
        };

        console.log('Update Neutral Colors State:', {
          whiteColor: newState.whiteColor?.baseHex,
          greyColor: newState.greyColor?.baseHex,
          blackColor: newState.blackColor?.baseHex
        });

        return newState;
      }

      default:
        return state;
    }
  } catch (error) {
    console.error('Theme Reducer Error:', error);
    return state;
  } finally {
    console.groupEnd();
  }
};

interface ThemeContextType {
  themeState: ThemeState;
  dispatch: React.Dispatch<ThemeAction>;
  initializeTheme: (colors: ColorData[], harmonies: HarmoniesState) => void;
  setSurfaceStyle: (style: SurfaceStyle) => void;
  setHotlinkStyle: (style: HotlinkStyle) => void;
  setButtonShape: (shape: ButtonShape) => void;
  setComponentEffect: (effect: ComponentEffect) => void;
  updateNeutralColors: (whiteColor: ColorData, greyColor: ColorData, blackColor: ColorData) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeState: initialThemeState,
  dispatch: () => {},
  initializeTheme: () => {},
  setSurfaceStyle: () => {},
  setHotlinkStyle: () => {},
  setButtonShape: () => {},
  setComponentEffect: () => {},
  updateNeutralColors: () => {}
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeState, dispatch] = useReducer(themeReducer, initialThemeState);

  const initializeTheme = useCallback((colors: ColorData[], harmonies: HarmoniesState) => {
    dispatch({
      type: 'INITIALIZE_THEME',
      payload: { colors, harmonies }
    });
  }, []);

  const setSurfaceStyle = useCallback((style: SurfaceStyle) => {
    dispatch({
      type: 'SET_SURFACE_STYLE',
      payload: style
    });
  }, []);

  const setHotlinkStyle = useCallback((style: HotlinkStyle) => {
    dispatch({
      type: 'SET_HOTLINK_STYLE',
      payload: style
    });
  }, []);

  const setButtonShape = useCallback((shape: ButtonShape) => {
    dispatch({
      type: 'SET_BUTTON_SHAPE',
      payload: shape
    });
  }, []);

  const setComponentEffect = useCallback((effect: ComponentEffect) => {
    dispatch({
      type: 'SET_COMPONENT_EFFECT',
      payload: effect
    });
  }, []);

  const updateNeutralColors = useCallback((whiteColor: ColorData, greyColor: ColorData, blackColor: ColorData) => {
    dispatch({
      type: 'UPDATE_NEUTRAL_COLORS',
      payload: { whiteColor, greyColor, blackColor }
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ 
      themeState, 
      dispatch, 
      initializeTheme,
      setSurfaceStyle,
      setHotlinkStyle,
      setButtonShape,
      setComponentEffect,
      updateNeutralColors
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { ThemeContext };