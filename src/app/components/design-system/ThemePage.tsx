import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useColors } from '../../../context/ColorContext';
import { useColorHarmonies } from '../../hooks/useColorHarmonies';
import { ChevronLeft, Home, Plus } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';
import CollapsiblePanel from './CollapsiblePanel';
import _ from 'lodash';
import UpdateSystemPanel from './UpdateSystemPanel';
import ColorModal from './ColorModal';
import { processTokensWithVariants } from '../../utils/tokenHelpers'; // Adjust import path
import { getBackgroundThemeStore } from '../../utils/styleProcessors';

import {
  Mode,
  SurfaceStyle,
  ButtonShape,
  ComponentEffect,
  HotlinkStyle
} from '../../types/modes';
import {
  ColorData,
  ColorHarmony,
  HarmoniesState,
  ColorSet
} from '../../types/colors';
// Import necessary types
import { useTheme } from '../../../context/ThemeContext';
import {
  Theme,
  ThemeState,
  ThemeAnalysisResult,
  ThemeAnalysisReason
} from '../../types/theme';
import { isColorData } from '../../utils/tokenHelpers';

import {
  processTokens,
  processLightTonalStyle,
  processDarkTonalStyle,
  processColorfulTonalStyle,
  processProfessionalLightStyle,
  processProfessionalGreyStyle,
  processProfessionalDarkStyle,
  processColorfulProfessionalStyle
} from '../../utils/styleProcessors';

// Update the ThemePageProps interface
interface ThemePageProps {
  imageFile: File | null | undefined;
  imageUrl?: string;
  onThemeComplete?: (baseColor: string) => void;
  onThemeGenerationError?: (error: Error) => void;
  isProcessing?: boolean;
  onProcessRemainingModes?: () => void;
  isThemeAlreadyGenerated?: boolean;
}

const initialHarmonies: HarmoniesState = {
  triadic: null,
  analogous: null,
  monochromatic: null,
  tetradic: null,
  square: null,
  diadic: null,
  achromatic: null,
  splitComplementary: null
};

const ThemePage: React.FC<ThemePageProps> = ({
  imageFile,
  imageUrl,
  onThemeComplete,
  onThemeGenerationError,
  isProcessing = false,
  onProcessRemainingModes,
  isThemeAlreadyGenerated = false,
}) => {
  // Context hooks
  const { setCurrentRoute } = useNavigation();
  const { themeState, dispatch, initializeTheme, updateNeutralColors } = useTheme();
  const { fullColorData, neutralColors, setColors } = useColors();
  
  const backgroundThemes = getBackgroundThemeStore();

  // Refs for processing control
  const isProcessingRef = useRef(false);
  const processTimeoutRef = useRef<number | undefined>();
  const hasSetInitialThemeRef = useRef(false);
  
  // UI state
  const [isUpdatePanelOpen, setIsUpdatePanelOpen] = useState(false);
  const [updateType, setUpdateType] = useState<'baseColor' | 'harmony' | 'surface' | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [harmonies, setHarmonies] = useState<HarmoniesState>(initialHarmonies);
  const [surfaceStyle, setSurfaceStyle] = useState<SurfaceStyle>('light-tonal');
  const [buttonShape, setButtonShape] = useState<ButtonShape>('gently-rounded');
  const [componentEffect, setComponentEffect] = useState<ComponentEffect>('none');
  const [hotlinkStyle, setHotlinkStyle] = useState<HotlinkStyle>('tonal');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customColors, setCustomColors] = useState<string[]>([]);
  // Memoized Color Values
  const stateColors = useMemo(() => 
    fullColorData.filter(color => color.id.startsWith('state-color-')) as ColorData[],
    [fullColorData]
  );

  
  // Filter and format colors for processing
  const safeColors = useMemo(() => {
    return fullColorData
      .filter(color => (
        color && 
        typeof color === 'object' &&
        'id' in color &&
        !color.id.startsWith('state-') && 
        !color.id.startsWith('default-')
      ))
      .map(color => ({
        ...color,
        shadeIndex: typeof color.shadeIndex === 'string' 
          ? parseInt(color.shadeIndex, 10) 
          : color.shadeIndex,
        allModes: color.allModes || {
          'AA-light': { allShades: [] },
          'AA-dark': { allShades: [] },
          'AAA-light': { allShades: [] },
          'AAA-dark': { allShades: [] }
        }
      })) as ColorData[];
  }, [fullColorData]);

// Add this effect to sync neutral colors when available
useEffect(() => {
  if (
    neutralColors.white && 
    neutralColors.grey && 
    neutralColors.black && 
    updateNeutralColors
  ) {
    console.log('Syncing neutral colors from ColorContext to ThemeContext');
    updateNeutralColors(
      neutralColors.white,
      neutralColors.grey,
      neutralColors.black
    );
  }
}, [neutralColors, updateNeutralColors]);

// Solution: Update ThemeContext only, don't modify ColorContext

const updateThemeColors = useCallback((
  primary: ColorData,
  secondary: ColorData,
  tertiary: ColorData
) => {
  try {
    console.group('Updating Theme Colors');
    console.log('Primary:', primary);
    console.log('Secondary:', secondary);
    console.log('Tertiary:', tertiary);
    
    // Create the theme color objects
    const primaryColorData: ColorData = {
      ...primary,
      id: 'primary', 
      name: 'Primary'
    };
    
    const secondaryColorData: ColorData = {
      ...secondary,
      id: 'secondary',
      name: 'Secondary'
    };
    
    const tertiaryColorData: ColorData = {
      ...tertiary,
      id: 'tertiary',
      name: 'Tertiary'
    };
    
    console.log('Created theme color objects with proper IDs');
    
    // Update the Figma plugin with the new theme colors
    window.parent.postMessage({
      pluginMessage: {
        type: 'update-design-token',
        collection: 'System-Colors',
        updates: [
          { variable: 'primary-color', value: primaryColorData.baseHex },
          { variable: 'secondary-color', value: secondaryColorData.baseHex },
          { variable: 'tertiary-color', value: tertiaryColorData.baseHex }
        ]
      }
    }, '*');
    
    // Update the theme in ThemeContext
    if (themeState.activeTheme) {
      const updatedTheme = {
        ...themeState.activeTheme,
        colors: {
          primary: primaryColorData,
          secondary: secondaryColorData,
          tertiary: tertiaryColorData
        }
      };
      
      dispatch({
        type: 'SET_THEME',
        payload: {
          theme: updatedTheme,
          secondaryColor: secondaryColorData,
          tertiaryColor: tertiaryColorData
        }
      });
      
      console.log('Updated theme colors in ThemeContext');
    } else {
      console.warn('No active theme to update');
    }
    
    // Note: We don't touch ColorContext at all, keeping all original colors intact
    
    console.log('Theme colors updated');
    console.groupEnd();
  } catch (error) {
    console.error('Error in updateThemeColors:', error);
    console.groupEnd();
  }
}, [themeState.activeTheme, dispatch]);

  // Initialize theme when we have all required data
  useEffect(() => {
    if (!isThemeAlreadyGenerated && !themeState.activeTheme && safeColors.length > 0) {
      initializeTheme(safeColors, harmonies);
    }
  }, [isThemeAlreadyGenerated, safeColors, harmonies, themeState.activeTheme, initializeTheme]);

  // Check for theme validity
  const hasValidTheme = useMemo(() => {
    return !!themeState?.activeTheme && 
           !!themeState?.baseColor && 
           !!themeState?.activeTheme?.colors?.primary;
  }, [
    themeState?.activeTheme,
    themeState?.baseColor
  ]);

  // Update harmonies callback
  const updateHarmonies = useCallback((newHarmonies: HarmoniesState) => {
    setHarmonies(prev => 
      _.isEqual(prev, newHarmonies) ? prev : newHarmonies
    );
  }, []);

  // Color array for harmony generation
  const colorArray = useMemo(() => {
    if (!themeState.baseColor) return [];
    if (!Array.isArray(safeColors)) return [themeState.baseColor];
    return [themeState.baseColor, ...safeColors].filter(color => {
      if (!color) return false;
      if (typeof color !== 'object' || !('baseHex' in color)) return false;
      return true;
    });
  }, [themeState.baseColor, safeColors]);

  // Use the hook to generate color harmonies
  useColorHarmonies(colorArray, updateHarmonies, initialHarmonies);

  // Debug logging for theme generation
  useEffect(() => {
    console.log('Theme Generation Debug:', {
      baseColor: themeState.baseColor?.baseHex,
      harmonies: harmonies,
      colorArray: {
        length: colorArray?.length || 0,
        colors: colorArray?.map(c => c.baseHex) || []
      },
      harmonyTypes: Object.keys(harmonies).filter(key => harmonies[key as keyof HarmoniesState] !== null)
    });
  }, [harmonies, themeState.baseColor, colorArray]);
  // Theme Generation
  const themes = useMemo(() => {
    if (!themeState.baseColor || !harmonies) {
      console.log('Cannot generate themes - missing data:', {
        hasBaseColor: !!themeState.baseColor,
        hasHarmonies: !!harmonies
      });
      return [];
    }

    // Define custom theme
    const customTheme: Theme = {
      name: 'Custom',
      type: 'custom',
      colors: {
        primary: customColors[0] || '',
        secondary: customColors[1] || '',
        tertiary: customColors[2] || ''
      }
    };

    const validHarmonyTypes = [
      'triadic', 
      'analogous', 
      'monochromatic', 
      'tetradic', 
      'square', 
      'diadic', 
      'achromatic', 
      'splitComplementary'
    ] as const;

    try {
      // Generate themes from harmonies
      const generatedThemes = validHarmonyTypes
        .filter(key => {
          const harmony = harmonies[key as keyof HarmoniesState];
          return harmony && harmony.primary && harmony.secondary && harmony.tertiary;
        })
        .map(key => {
          const harmony = harmonies[key as keyof HarmoniesState]!;
          console.log(`Creating theme for ${key}:`, {
            primary: harmony.primary.baseHex,
            secondary: harmony.secondary.baseHex,
            tertiary: harmony.tertiary.baseHex
          });
          
          return {
            name: key === 'splitComplementary' ? 'Split Comp.' : key,
            type: key === 'splitComplementary' ? 'split-complementary' as const : key,
            colors: {
              primary: harmony.primary,
              secondary: harmony.secondary,
              tertiary: harmony.tertiary
            }
          };
        });

      return [...generatedThemes, customTheme];
    } catch (error) {
      console.error('Error generating themes:', error);
      return [customTheme];
    }
  }, [harmonies, themeState.baseColor, customColors]);

  // Theme Analysis
  const themeAnalysis = useMemo(() => {
    if (!themes.length) {
      console.log('No themes to analyze');
      return [];
    }
    
    const seenSignatures = new Set<string>();
    return themes.map(theme => {
      const colorValues = Object.values(theme.colors).map(color => 
        isColorData(color) ? color.baseHex : color
      );
      
      const uniqueColors = new Set(colorValues.filter(Boolean)); // Filter out empty strings
      const hasInternalDuplicates = uniqueColors.size !== colorValues.filter(Boolean).length;
      const colorSignature = [...colorValues].filter(Boolean).sort().join(',');
      const isRedundant = seenSignatures.has(colorSignature);
    
      if (!isRedundant && colorSignature) {
        seenSignatures.add(colorSignature);
      }

      console.log(`Analyzed theme ${theme.name}:`, {
        colors: colorValues,
        isValid: !hasInternalDuplicates && !isRedundant,
        reason: hasInternalDuplicates ? 'duplicate' : isRedundant ? 'redundant' : 'valid'
      });
    
      return {
        theme,
        isValid: !hasInternalDuplicates && !isRedundant,
        reason: hasInternalDuplicates ? 'duplicate' : isRedundant ? 'redundant' : 'valid'
      };
    });
  }, [themes]);

  // Set triadic as default theme when harmonies are available
useEffect(() => {
  if (isThemeAlreadyGenerated || themeState.activeTheme) {
    return;
  }

  if (!themeState.baseColor || !harmonies.triadic) {
    console.log('Waiting for initial theme setup conditions:', {
      hasBaseColor: !!themeState.baseColor,
      hasTriadicHarmony: !!harmonies.triadic
    });
    return;
  }

  // Set triadic as default theme immediately when harmonies are available
  const defaultTheme: Theme = {
    name: 'Triadic',
    type: 'triadic',
    colors: {
      primary: themeState.baseColor,
      secondary: harmonies.triadic.secondary,
      tertiary: harmonies.triadic.tertiary
    }
  };

  dispatch({
    type: 'SET_THEME',
    payload: {
      theme: defaultTheme,
      secondaryColor: harmonies.triadic.secondary,
      tertiaryColor: harmonies.triadic.tertiary
    }
  });

  // Add this: Update theme colors with the triadic harmony colors
  updateThemeColors(
    themeState.baseColor,
    harmonies.triadic.secondary,
    harmonies.triadic.tertiary
  );
  
}, [themeState.baseColor, harmonies.triadic, isThemeAlreadyGenerated, themeState.activeTheme, dispatch, updateThemeColors]);

  // Debug effect to track state changes
  useEffect(() => {
    console.log('Current theme state:', {
      baseColor: themeState.baseColor?.baseHex,
      activeTheme: themeState.activeTheme?.name,
      harmoniesAvailable: Object.keys(harmonies).filter(k => harmonies[k as keyof HarmoniesState])
    });
  }, [themeState, harmonies]);

  const processTokensMemoized = useCallback(() => {
    if (!themeState.activeTheme || !themeState.baseColor) {
      console.log('Missing required theme data');
      return;
    }

    
  
    try {
      console.log('Processing tokens:', {
        isProcessing,
        onProcessRemainingModes: !!onProcessRemainingModes,
        baseColor: themeState.baseColor.baseHex,
        activeTheme: themeState.activeTheme.name
      });

      
  
      if (isProcessing && onProcessRemainingModes) {
        // Process remaining modes
        processTokensWithVariants({
          baseColor: themeState.baseColor,
          activeTheme: themeState.activeTheme,
          stateColors,
          hotlinkStyle,
          safeColors,
          style: surfaceStyle,
          harmonies,
          modes: 'AA-light'
          // No need to specify specificGroups, the helper function handles this
        });
        onProcessRemainingModes();
      } else {
        // Process AA-Light mode only
        processTokensWithVariants({
          baseColor: themeState.baseColor,
          activeTheme: themeState.activeTheme,
          stateColors,
          hotlinkStyle,
          safeColors,
          style: surfaceStyle,
          harmonies,
          modes: 'AA-light'
          // No need to specify specificGroups, the helper function handles this
        });
        if (onThemeComplete) {
          onThemeComplete(themeState.baseColor.baseHex);
        }
      }
    } catch (error) {
      console.error('Error processing tokens:', error);
    }
  }, [
    themeState.activeTheme,
    themeState.baseColor,
    isProcessing,
    onProcessRemainingModes,
    onThemeComplete,
    stateColors,
    hotlinkStyle,
    safeColors,
    surfaceStyle,
    harmonies
  ]);

// The rest of your component remains the same

  // Process tokens when theme changes
  useEffect(() => {
    // Skip processing if theme is already generated
    if (isThemeAlreadyGenerated) {
      console.log('Skipping token processing as theme is already generated');
      return;
    }

    const shouldProcess = 
      themeState.activeTheme && 
      themeState.baseColor && 
      harmonies &&
      Object.values(harmonies).some(h => h !== null);

    if (!shouldProcess) {
      console.log('Token processing conditions not met:', {
        activeTheme: !!themeState.activeTheme,
        baseColor: !!themeState.baseColor,
        harmoniesPresent: !!harmonies,
        nonNullHarmonies: Object.values(harmonies).some(h => h !== null)
      });
      return;
    }

    if (processTimeoutRef.current !== undefined) {
      window.clearTimeout(processTimeoutRef.current);
    }

    processTimeoutRef.current = window.setTimeout(() => {
      if (!isProcessingRef.current) {
        isProcessingRef.current = true;
        processTokensMemoized();
        isProcessingRef.current = false;
      }
    }, 300);

    return () => {
      if (processTimeoutRef.current !== undefined) {
        window.clearTimeout(processTimeoutRef.current);
      }
    };
  }, [
    themeState.activeTheme,
    themeState.baseColor,
    harmonies,
    processTokensMemoized,
    isThemeAlreadyGenerated
  ]);

  // Image processing effect
  useEffect(() => {
    if (!imageFile && !imageUrl) return;

    const insertImage = async () => {
      try {
        const imageBytes = imageFile 
          ? await imageFile.arrayBuffer() 
          : await (await fetch(imageUrl as string)).arrayBuffer();
        
        // First, send message to delete all existing images
        window.parent.postMessage({
          pluginMessage: {
            type: 'cleanup-images'
          }
        }, '*');

        // Wait a brief moment for cleanup to complete
        await new Promise(resolve => setTimeout(resolve, 100));

        // Then insert the new image into all three frames
        const frameNames = ['imageHero', 'imageHero-2', 'imageHero-3', 'imageHero-4', 'imageHero-5'];
        const targetPageName = 'SYSTEM PREVIEW';


        frameNames.forEach(frameName => {
          window.parent.postMessage({
            pluginMessage: {
              type: 'insert-image',
              targetPageName: targetPageName,
              imageBytes: new Uint8Array(imageBytes),
              frameName
            }
          }, '*');
        });
      } catch (error) {
        if (onThemeGenerationError) {
          onThemeGenerationError(error as Error);
        }
      }
    };

    insertImage();
  }, [imageFile, imageUrl, onThemeGenerationError]);

  // Process all design system tokens at once
const processDesignSystem = useCallback(() => {
  if (!themeState.activeTheme || !themeState.baseColor) {
    console.warn('Cannot process design system - missing theme or base color');
    return;
  }

  // Process tokens for AA modes (not AAA by default)
  processTokens({
    baseColor: themeState.baseColor,
    activeTheme: themeState.activeTheme,
    stateColors,
    hotlinkStyle,
    safeColors,
    style: surfaceStyle,
    harmonies,
    modes: ['AA-light', 'AA-dark']
  });

  // Run font pairings
  window.parent.postMessage({
    pluginMessage: {
      type: 'run-font-pairings'
    }
  }, '*');

  // Close update panel
  setIsUpdatePanelOpen(false);
}, [
  themeState.activeTheme, 
  themeState.baseColor, 
  stateColors, 
  hotlinkStyle, 
  safeColors, 
  surfaceStyle, 
  harmonies
]);

  // Process remaining modes
const processRemainingModes = useCallback(() => {
  if (!themeState.activeTheme || !themeState.baseColor || !harmonies) {
    return;
  }

  console.log('Processing remaining modes: AAA-light and AAA-dark');
  
  processTokens({
    baseColor: themeState.baseColor,
    activeTheme: themeState.activeTheme,
    stateColors,
    hotlinkStyle,
    safeColors,
    style: surfaceStyle,
    harmonies,
    modes: ['AAA-light', 'AAA-dark'] // Only process AAA modes
  });

  // Call the callback after processing
  if (onProcessRemainingModes) {
    onProcessRemainingModes();
  }
}, [
  themeState.activeTheme,
  themeState.baseColor,
  stateColors,
  hotlinkStyle,
  safeColors,
  surfaceStyle,
  harmonies,
  onProcessRemainingModes
]);

  // Navigation Handler
  const handleBack = useCallback(() => {
    setCurrentRoute({
      id: 'home',
      title: 'Design System',
      path: '/',
      icon: Home
    });
  }, [setCurrentRoute]);

  // Base color selection handler
  const handleBaseColorSelect = useCallback((colorData: ColorData) => {
    if (!colorData || themeState.baseColor?.baseHex === colorData.baseHex) {
      return;
    }

    // First update base color
    dispatch({ 
      type: 'SET_BASE_COLOR', 
      payload: colorData 
    });

    // Find the currently selected harmony type or default to triadic
    const currentHarmonyType = themeState.activeTheme?.type === 'split-complementary' 
      ? 'splitComplementary' 
      : (themeState.activeTheme?.type || 'triadic');

    // Check if the current harmony type is still available after color change
    const currentHarmony = harmonies[currentHarmonyType as keyof HarmoniesState];
    
    if (currentHarmony && currentHarmony.secondary && currentHarmony.tertiary) {
      // Current harmony is still valid, update with it
      const updatedTheme: Theme = {
        name: currentHarmonyType === 'splitComplementary' ? 'Split Comp.' : currentHarmonyType,
        type: currentHarmonyType === 'splitComplementary' ? 'split-complementary' as const : currentHarmonyType as Theme['type'],
        colors: {
          primary: colorData,
          secondary: currentHarmony.secondary,
          tertiary: currentHarmony.tertiary
        }
      };

      dispatch({
        type: 'SET_THEME',
        payload: {
          theme: updatedTheme,
          secondaryColor: currentHarmony.secondary,
          tertiaryColor: currentHarmony.tertiary
        }
      });
    } else {
      // Current harmony not available, find first available harmony
      const harmonyOrder = ['triadic', 'analogous', 'monochromatic', 'tetradic', 'square', 'diadic', 'splitComplementary'] as const;
      
      for (const harmonyType of harmonyOrder) {
        const harmony = harmonies[harmonyType];
        if (harmony && harmony.secondary && harmony.tertiary) {
          const newTheme: Theme = {
            name: harmonyType === 'splitComplementary' ? 'Split Comp.' : harmonyType,
            type: harmonyType === 'splitComplementary' ? 'split-complementary' as const : harmonyType,
            colors: {
              primary: colorData,
              secondary: harmony.secondary,
              tertiary: harmony.tertiary
            }
          };

          dispatch({
            type: 'SET_THEME',
            payload: {
              theme: newTheme,
              secondaryColor: harmony.secondary,
              tertiaryColor: harmony.tertiary
            }
          });
          break;
        }
      }
    }

    // Open the update panel
    setIsUpdatePanelOpen(true);
    
    // Prepare a pending action to update the primary color token
    setPendingAction(() => () => {
      window.parent.postMessage({
        pluginMessage: {
          type: 'update-design-token',
          collection: 'System-Colors',
          variable: 'primary-color',
          value: colorData.baseHex
        }
      }, '*');
    });
  }, [themeState.baseColor, themeState.activeTheme, harmonies, dispatch]);

// Function to update Figma variables
const updateFigmaVariable = (collection: string, variable: string, value: string, mode: string = "Default") => {
  window.parent.postMessage({
    pluginMessage: {
      type: 'update-variable',
      collection,
      variable,
      value,
      mode
    }
  }, '*');
};

// Modified handleThemeSelect function with Color-Theory variable update
const handleThemeSelect = useCallback((selectedTheme: Theme) => {
  if (!themeState.baseColor || !harmonies) {
    console.log('THEME SELECTION FAILED - Missing required data:', {
      hasBaseColor: !!themeState.baseColor,
      hasHarmonies: !!harmonies
    });
    return;
  }

  // Find all valid themes
  const validThemes = themeAnalysis.filter(analysis => analysis.isValid);
  console.log('VALID THEMES:', validThemes.map(t => t.theme.name));

  // If selected theme is not valid, pick first valid theme
  if (!themeAnalysis.find(t => t.theme.name === selectedTheme.name)?.isValid) {
    console.log('SELECTED THEME NOT VALID - Defaulting to first valid theme');
    if (validThemes.length > 0) {
      selectedTheme = validThemes[0].theme;
    } else {
      console.log('NO VALID THEMES AVAILABLE');
      return;
    }
  }

  console.log('PROCESSING THEME SELECTION:', {
    selectedTheme: selectedTheme.name,
    type: selectedTheme.type,
    currentTheme: themeState.activeTheme?.name
  });

  if (selectedTheme.type === 'custom') {
    console.log('SETTING CUSTOM THEME');

      // Create proper ColorData objects for custom colors
      const customPrimary: ColorData = createColorDataFromHex(selectedTheme.colors.primary, 'primary', 'Primary');
      const customSecondary: ColorData = createColorDataFromHex(selectedTheme.colors.secondary, 'secondary', 'Secondary');
      const customTertiary: ColorData = createColorDataFromHex(selectedTheme.colors.tertiary, 'tertiary', 'Tertiary');
      
      const updatedTheme: Theme = {
        ...selectedTheme,
        colors: {
          primary: customPrimary,
          secondary: customSecondary,
          tertiary: customTertiary
        }
      };
      
      dispatch({
        type: 'SET_THEME',
        payload: {
          theme: updatedTheme,
          secondaryColor: customSecondary,
          tertiaryColor: customTertiary
        }
      });


    
    // Update Color-Theory variable for custom theme
    updateFigmaVariable("System-Styles", "Color-Theory", "Custom");
  } else {
    const harmonyType = selectedTheme.type === 'split-complementary' 
      ? 'splitComplementary' 
      : selectedTheme.type;

    const harmonyColors = harmonies[harmonyType as keyof HarmoniesState];

    if (!harmonyColors) {
      console.log(`HARMONY NOT FOUND: ${harmonyType} - Defaulting to first valid theme`);
      if (validThemes.length > 0) {
        const firstValidTheme = validThemes[0].theme;
        const firstValidHarmonyType = firstValidTheme.type === 'split-complementary' 
          ? 'splitComplementary' 
          : firstValidTheme.type;
        const firstValidHarmonyColors = harmonies[firstValidHarmonyType as keyof HarmoniesState];
        
        if (firstValidHarmonyColors) {
          console.log('USING DEFAULT THEME:', firstValidTheme.name);
          dispatch({
            type: 'SET_THEME',
            payload: {
              theme: firstValidTheme,
              secondaryColor: firstValidHarmonyColors.secondary,
              tertiaryColor: firstValidHarmonyColors.tertiary
            }
          });
          
          // Update Color-Theory variable for default theme
          // Capitalize first letter for proper display
          const formattedThemeName = firstValidTheme.name.charAt(0).toUpperCase() + firstValidTheme.name.slice(1);
          updateFigmaVariable("System-Styles", "Color-Theory", formattedThemeName);
        }
      }
      return;
    }

    // Create new ColorData objects with appropriate IDs while preserving original data
    const primaryColor: ColorData = {
      ...harmonyColors.primary,
      id: 'primary',
      name: 'Primary'
    };
    
    const secondaryColor: ColorData = {
      ...harmonyColors.secondary,
      id: 'secondary',
      name: 'Secondary'
    };
    
    const tertiaryColor: ColorData = {
      ...harmonyColors.tertiary,
      id: 'tertiary',
      name: 'Tertiary'
    };


    console.log('UPDATING TO NEW HARMONY WITH NAMED COLOR DATA:', {
      primary: primaryColor,
      secondary: secondaryColor,
      tertiary: tertiaryColor
    });

    const updatedTheme: Theme = {
      ...selectedTheme,
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
        tertiary: tertiaryColor
      }
    };

   // After dispatching the theme update
   dispatch({
    type: 'SET_THEME',
    payload: {
      theme: updatedTheme,
      secondaryColor: secondaryColor,
      tertiaryColor: tertiaryColor
    }
  });
  
  // Call updateThemeColors
  updateThemeColors(
    primaryColor,
    secondaryColor,
    tertiaryColor
  );
    
    // Update Color-Theory variable for harmony themes
    // Capitalize first letter for proper display
    const formattedThemeName = selectedTheme.name.charAt(0).toUpperCase() + selectedTheme.name.slice(1);
    updateFigmaVariable("System-Styles", "Color-Theory", formattedThemeName);
  }

  // Set up pending action for Figma updates
  setIsUpdatePanelOpen(true);
  setPendingAction(() => () => {
    const getHexValue = (color: ColorData | string) => {
      return typeof color === 'object' && 'baseHex' in color 
        ? color.baseHex 
        : color as string;
    };

    window.parent.postMessage({
      pluginMessage: {
        type: 'update-design-token',
        collection: 'System-Colors',
        updates: [
          { 
            variable: 'primary-color', 
            value: getHexValue(selectedTheme.colors.primary) 
          },
          { 
            variable: 'secondary-color', 
            value: getHexValue(selectedTheme.colors.secondary) 
          },
          { 
            variable: 'tertiary-color', 
            value: getHexValue(selectedTheme.colors.tertiary) 
          }
        ]
      }
    }, '*');
  });
}, [themeState.baseColor, themeState.activeTheme, harmonies, themeAnalysis, dispatch, updateThemeColors]);

// Helper function to create ColorData from hex string
function createColorDataFromHex(hexOrColorData: string | ColorData, id: string, name: string): ColorData {
  // If it's already a ColorData object, just update the id and name
  if (typeof hexOrColorData !== 'string') {
    return {
      ...hexOrColorData,
      id,
      name
    };
  }
  
  // Find a matching color in safeColors to copy the shade data
  const matchingColor = safeColors.find(color => color.baseHex === hexOrColorData);
  
  if (matchingColor) {
    // Use the matching color's data but with our new id and name
    return {
      ...matchingColor,
      id,
      name
    };
  }
  
  // If no match, create a basic ColorData with default values
  return {
    id,
    name,
    baseHex: hexOrColorData,
    shadeIndex: 5,
    allModes: {
      'AA-light': { allShades: [] },
      'AA-dark': { allShades: [] },
      'AAA-light': { allShades: [] },
      'AAA-dark': { allShades: [] }
    }
  };
}

// Basic createSurfaceStyleHandler function without external dependencies
const createSurfaceStyleHandler = (style: SurfaceStyle) => () => {
  // Don't proceed if it's already the current style
  if (surfaceStyle === style) return;
  
  // Determine if we're changing style families or staying within the same family
  const currentStyleFamily = surfaceStyle.includes('tonal') ? 'tonal' : 'professional';
  const newStyleFamily = style.includes('tonal') ? 'tonal' : 'professional';
  const isChangingFamilies = currentStyleFamily !== newStyleFamily;
  
  // First, immediately update the UI state
  setSurfaceStyle(style);
  
  // Set up the update panel
  setUpdateType('surface');
  setPendingAction(() => () => {
    // When confirmed, process the design system with the new style
    if (!themeState.activeTheme || !themeState.baseColor) {
      console.warn('Cannot update surface style - missing theme data');
      return;
    }
    
    // Log what we're doing
    if (isChangingFamilies) {
      console.log(`Changing style families: ${currentStyleFamily} -> ${newStyleFamily}. Processing all backgrounds.`);
    } else {
      console.log(`Staying within ${newStyleFamily} family. Using optimized processing.`);
    }

        // Update Surface-Style variable in Figma
    // Convert style like 'light-tonal' to 'Light Tonal' for Figma variable
    const formattedStyleName = style
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Update the Surface-Style variable
    updateFigmaVariable("System-Styles", "Surface-Style", formattedStyleName);
    
    
    // Process tokens with the new style
    processTokens({
      baseColor: themeState.baseColor,
      activeTheme: themeState.activeTheme,
      stateColors,
      hotlinkStyle,
      safeColors,
      style: style,
      harmonies,
      modes: ['AA-light', 'AA-dark'] // Only process AA modes by default
    });
  });
  
  // Open the update panel
  setIsUpdatePanelOpen(true);
};


  // Update panel handlers
  const handleUpdatePanelClose = useCallback(() => {
    setIsUpdatePanelOpen(false);
    setPendingAction(null);
    setUpdateType(null);
  }, []);
  
  const handleUpdateConfirm = useCallback((updateFontsAndStyles: boolean) => {
    console.log('Update Confirm called', {
      hasPendingAction: !!pendingAction,
      updateFontsAndStyles
    });
  
    // Execute the comprehensive design system processing
    processDesignSystem();
  
    // Optionally run font pairings if checkbox is checked
    if (updateFontsAndStyles) {
      window.parent.postMessage({
        pluginMessage: {
          type: 'run-font-pairings'
        }
      }, '*');
    }
  }, [processDesignSystem, pendingAction]);

  // Custom Color Handlers
  const handleCustomColorSelect = useCallback((color: string) => {
    if (customColors.includes(color)) return;
      
    const newCustomColors = [...customColors, color].slice(0, 3);
    setCustomColors(newCustomColors);
      
    if (newCustomColors.length === 3) {
      const newCustomTheme: Theme = {
        name: 'Custom',
        colors: {
          primary: newCustomColors[0],
          secondary: newCustomColors[1],
          tertiary: newCustomColors[2]
        },
        type: 'custom'
      };
          
      dispatch({
        type: 'SET_THEME',
        payload: {
          theme: newCustomTheme,
          secondaryColor: null,
          tertiaryColor: null
        }
      });
    }
  }, [customColors, dispatch]);

  const handleRemoveCustomColor = useCallback((colorToRemove: string) => {
    setCustomColors(prev => prev.filter(color => color !== colorToRemove));
  }, []);

  // Drag and Drop Handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    // Prevent dragging of primary color (index 0)
    if (index === 0) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', index.toString());
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '0.5';
      e.target.style.outline = '2px solid white';
      e.target.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
    }
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '';
      e.target.style.outline = '';
      e.target.style.boxShadow = '';
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.target instanceof HTMLElement) {
      e.target.style.outline = '2px solid white';
      e.target.style.outlineOffset = '2px';
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.style.outline = '';
      e.target.style.outlineOffset = '';
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    try {
      e.preventDefault();
      e.stopPropagation();
  
      if (!e.dataTransfer) {
        console.warn('No dataTransfer in drop event');
        return;
      }
  
      const dragIndexStr = e.dataTransfer.getData('text/plain');
      const dragIndex = parseInt(dragIndexStr, 10);
  
      if (
        isNaN(dragIndex) || 
        !themeState.activeTheme || 
        dragIndex === dropIndex ||
        dragIndex === 0  // Prevent moving primary color
      ) {
        return;
      }
  
      const currentColors = [
        themeState.activeTheme.colors.primary,
        themeState.activeTheme.colors.secondary,
        themeState.activeTheme.colors.tertiary
      ];
  
      const newColors = [...currentColors];
      const [removedColor] = newColors.splice(dragIndex, 1);
      newColors.splice(dropIndex, 0, removedColor);
  
      setIsUpdatePanelOpen(true);
      setPendingAction(() => () => {
        const updatedTheme: Theme = {
          ...themeState.activeTheme!,
          colors: {
            primary: newColors[0],
            secondary: newColors[1],
            tertiary: newColors[2]
          }
        };
  
        // After dispatching the theme update
        dispatch({
          type: 'SET_THEME',
          payload: {
            theme: updatedTheme,
            secondaryColor: null,
            tertiaryColor: null
          }
        });

        // Call updateThemeColors if we have valid colors
        if (
          isColorData(newColors[0]) && 
          isColorData(newColors[1]) && 
          isColorData(newColors[2])
        ) {
          updateThemeColors(
            newColors[0],
            newColors[1],
            newColors[2]
          );
        }
  
        // Update tokens in Figma
        ['secondary', 'tertiary'].forEach((position, index) => {
          const color = newColors[index + 1];
          const colorHex = typeof color === 'object' && 'baseHex' in color 
            ? color.baseHex 
            : color as string;
          
          window.parent.postMessage({
            pluginMessage: {
              type: 'update-design-token',
              collection: 'System-Colors',
              variable: `${position}-color`,
              value: colorHex
            }
          }, '*');
        });
      });
    } catch (error) {
      console.error('Error in handleDrop:', error);
    }
  }, [themeState.activeTheme, dispatch, updateThemeColors]);

  // Register handler for processing remaining modes
  useEffect(() => {
    if (isProcessing && onProcessRemainingModes) {
      window.parent.postMessage({
        pluginMessage: {
          type: 'process-remaining-modes',
          handler: processRemainingModes
        }
      }, '*');
    }
  }, [isProcessing, processRemainingModes, onProcessRemainingModes]);

  return (
    <div className="max-w-sm mx-auto bg-white shadow-md rounded-xl p-6">
      <button
        onClick={handleBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="text-xl">Back</span>
      </button>

      <div className="space-y-4">
        <CollapsiblePanel title="Theme Color Settings">
          <div className="space-y-6">
            {/* Base Color Selection */}
            <div>
              <h3 className="text-sm font-medium mb-3">Base Color</h3>
              <div className="grid grid-cols-5 gap-3">
                {safeColors.filter(color => color && typeof color === 'object' && 'baseHex' in color).map((colorData) => (
                  <button
                    key={colorData.id}
                    onClick={() => handleBaseColorSelect(colorData)}
                    className={`group relative aspect-square rounded-xl transition-transform hover:scale-105 ${
                      themeState.baseColor?.baseHex === colorData.baseHex ? 'ring-2 ring-purple-500' : ''
                    }`}
                  >
                    <div
                      className="w-full h-full rounded-xl"
                      style={{ backgroundColor: colorData.baseHex }}
                      title={colorData.name}
                    />
                  </button>
                ))}
              </div>
            </div>
            {/* Available Themes */}
            <div>
              <h3 className="text-lg font-medium mb-4">Available Themes:</h3>
              <div className="grid grid-cols-2 gap-3">
              {themeAnalysis.map(({ theme, isValid, reason }) => {
                const isCustomTheme = theme.type === 'custom';
                const hasAllCustomColors = isCustomTheme && 
                  customColors.length === 3 && 
                  customColors.every(color => color !== '');
                const isClickable = (isCustomTheme && hasAllCustomColors) || (!isCustomTheme && isValid);
                
                return (
                  <div
                    key={`${theme.name}-${theme.type}`}
                    onClick={() => {
                      if (isClickable && theme) {
                        const validTheme: Theme = {
                          name: theme.name,
                          type: theme.type as Theme['type'],
                          colors: theme.colors
                        };
                        handleThemeSelect(validTheme);
                      }
                    }}
                    className={`p-4 rounded-xl transition-all flex flex-col h-[160px] relative ${
                      themeState.activeTheme?.name === theme.name
                        ? 'bg-purple-50 border-2 border-purple-500'
                        : isClickable
                          ? 'border border-gray-200 hover:border-purple-200 cursor-pointer'
                          : 'border border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="mb-3 flex justify-between items-center">
                      <h4 className="text-base font-medium">{theme.name}</h4>
                      {isCustomTheme && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsModalOpen(true);
                          }}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-5 h-5 text-gray-600" />
                        </button>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mb-3">
                      {isCustomTheme ? (
                        customColors.length > 0 ? (
                          customColors.map((color, index) => (
                            <div
                              key={index}
                              className="flex-1 h-12 rounded-lg"
                              style={{ backgroundColor: color }}
                            />
                          ))
                        ) : (
                          Array.from({ length: 3 }).map((_, index) => (
                            <div
                              key={index}
                              className="flex-1 h-12 rounded-lg border-2 border-dashed border-gray-200"
                            />
                          ))
                        )
                      ) : (
                        Object.entries(theme.colors).map(([key, color], index) => {
                          const colorHex = isColorData(color) ? color.baseHex : color;
                          return (
                            <div
                              key={`${key}-${index}`}
                              className="flex-1 h-12 rounded-lg"
                              style={{ backgroundColor: colorHex }}
                            />
                          );
                        })
                      )}
                    </div>
                    
                    <div className="mt-auto text-center">
                      {!isValid && !isCustomTheme && (
                        <span className="text-xs text-gray-500">
                          {reason === 'duplicate' ? 'Has duplicate colors' : 'Combo already exists'}
                        </span>
                      )}
                      {isCustomTheme && (
                        <span className="text-xs text-gray-500">
                          {customColors.length === 3 
                            ? 'Click to activate custom theme' 
                            : 'Click + to add custom colors'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>

            {/* Active Theme Colors */}
            {themeState.activeTheme && Object.entries(themeState.activeTheme.colors).map(([position, color], index) => (
              <div
                key={position}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                className="flex items-center gap-3"
              >
                <div
                  className="w-24 h-12 rounded-lg cursor-move"
                  style={{
                    backgroundColor: isColorData(color) ? color.baseHex : color
                  }}
                />
                <span className="font-medium capitalize">{position}</span>
              </div>
            ))}
          </div>
        </CollapsiblePanel>

        {/* Surface Styling */}
        <CollapsiblePanel title="Surface Styling">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Tonal</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={createSurfaceStyleHandler('light-tonal')}
                  className={`px-6 py-3 rounded-xl ${
                    surfaceStyle === 'light-tonal' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                  }`}
                >
                  Light Tonal
                </button>
                <button
                  onClick={createSurfaceStyleHandler('colorful-tonal')}
                  className={`px-6 py-3 rounded-xl ${
                    surfaceStyle === 'colorful-tonal' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                  }`}
                >
                  Colorful Tonal
                </button>
                <button
                  onClick={createSurfaceStyleHandler('dark-tonal')}
                  className={`px-6 py-3 rounded-xl ${
                    surfaceStyle === 'dark-tonal' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                  }`}
                >
                  Dark Tonal
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Professional</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={createSurfaceStyleHandler('light-professional')}
                  className={`px-6 py-3 rounded-xl ${
                    surfaceStyle === 'light-professional' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                  }`}
                >
                  Light Professional
                </button>
                <button
                  onClick={createSurfaceStyleHandler('grey-professional')}
                  className={`px-6 py-3 rounded-xl ${
                    surfaceStyle === 'grey-professional' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                  }`}
                >
                  Grey Professional
                </button>
                <button
                  onClick={createSurfaceStyleHandler('dark-professional')}
                  className={`px-6 py-3 rounded-xl ${
                    surfaceStyle === 'dark-professional' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                  }`}
                >
                  Dark Professional
                </button>
                <button
                  onClick={createSurfaceStyleHandler('colorful-professional')}
                  className={`px-6 py-3 rounded-xl ${
                    surfaceStyle === 'colorful-professional' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                  }`}
                >
                  Colorful Professional
                </button>
              </div>
            </div>
          </div>
        </CollapsiblePanel>
      </div>

      {/* Update System Panel */}
      <UpdateSystemPanel
        isOpen={isUpdatePanelOpen}
        onClose={handleUpdatePanelClose}
        onConfirm={handleUpdateConfirm}
      />

      {/* Color Modal */}
      <ColorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableColors={safeColors.map(c => c.baseHex)}
        selectedColors={customColors}
        onColorSelect={handleCustomColorSelect}
        onColorRemove={handleRemoveCustomColor}
      />
    </div>
  );
};

export default ThemePage;