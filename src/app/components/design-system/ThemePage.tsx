<<<<<<< HEAD
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
=======
import React, { useState, useEffect, useMemo, useCallback } from 'react';
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
import { useColors } from '../../../context/ColorContext';
import { useColorHarmonies } from '../../hooks/useColorHarmonies';
import { ChevronLeft, Home, Plus } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';
import CollapsiblePanel from './CollapsiblePanel';
<<<<<<< HEAD
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
=======
import ColorModal from './ColorModal';
import { generateShades, ColorSettings } from '../../utils/colors';
import type { ColorResult } from '../../utils/colors';
import type { ColorData } from '../../utils/color-harmonies';
import { text } from 'stream/consumers';
const chroma = require('chroma-js');

interface ColorSet {
  primary: ColorData | string;
  secondary: ColorData | string;
  tertiary: ColorData | string;
}

interface ThemePageProps {
  imageFile: File | null | undefined;
  imageUrl?: string;
  onThemeComplete?: (baseColor: string) => void;  // Update the interface to include baseColor
  onThemeGenerationError?: (error: Error) => void;
  isProcessing?: boolean,
}

interface Theme {
  name: string;
  colors: ColorSet;
  type: 'analogous' | 'monochromatic' | 'triadic' | 'tetradic' | 'square' | 'diadic' | 'achromatic' | 'split-complementary' | 'custom';
}

type ThemeAnalysisReason = 'duplicate' | 'redundant' | 'valid';
type SurfaceStyle = 'light-tonal' | 'colorful-tonal' | 'dark-tonal' | 'light-professional' | 'grey-professional' | 'dark-professional' | 'light-glow' | 'dark-glow';
type ButtonShape = 'gently-rounded' | 'amply-rounded' | 'boldly-rounded' | 'square';
type ComponentEffect = 'none' | 'bevel' | 'ridged';
type HotlinkStyle = 'tonal' | 'blue';

const harmonyTypes = [
  { key: 'triadic', name: 'Triadic' },
  { key: 'analogous', name: 'Analogous' },
  { key: 'monochromatic', name: 'Monochromatic' },
  { key: 'tetradic', name: 'Tetradic' },
  { key: 'square', name: 'Square' },
  { key: 'diadic', name: 'Diadic' },
  { key: 'achromatic', name: 'Achromatic' },
  { key: 'splitComplementary', name: 'Split Comp.' }, // Shortened name
  { key: 'custom', name: 'Custom' }
] as const;

const ThemePage: React.FC<ThemePageProps> = ({ 
  imageFile, 
  imageUrl, 
  onThemeComplete,
  onThemeGenerationError,
  isProcessing = false 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  console.log('ThemePage props:', { imageFile, imageUrl });
  // Context hooks
  const { setCurrentRoute } = useNavigation();
  const { fullColorData } = useColors();

  // All state declarations
  const [surfaceStyle, setSurfaceStyle] = useState<SurfaceStyle>('light-tonal');
  const [buttonShape, setButtonShape] = useState<ButtonShape>('gently-rounded');
  const [hasButtonShape, setHasButtonShape] = useState(false);const [componentEffect, setComponentEffect] = useState<ComponentEffect>('none');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [customTheme, setCustomTheme] = useState<Theme | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [activeTheme, setActiveTheme] = useState<Theme | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [hotlinkStyle, setHotlinkStyle] = useState<HotlinkStyle>('tonal');
  
  const [themeAnalysis, setThemeAnalysis] = useState<Array<{
    theme: Theme;
    isValid: boolean;
    reason: ThemeAnalysisReason;
  }>>([]);
  const [baseColor, setBaseColor] = useState<ColorData | null>(null);
  const [secondaryColor, setSecondaryColor] = useState<ColorData | null>(null);
  const [tertiaryColor, setTertiaryColor] = useState<ColorData | null>(null);

  // Add type guard for ColorData
  function isColorData(color: ColorData | string): color is ColorData {
    return typeof color === 'object' && 'baseHex' in color;
  }

  // Update safeColors to filter out state colors and default grey
  const safeColors = useMemo(() => {
  if (!fullColorData || !Array.isArray(fullColorData)) {
    return []; // Remove default grey fallback
  }
  
  return fullColorData
    .filter(color => 
      // Exclude state colors and default grey
      !color.id.startsWith('state-') && 
      !color.id.startsWith('default-')
    )
    .map(color => ({
      ...color,
      allModes: color.allModes || {
        'AA-light': { allShades: [] },
        'AA-dark': { allShades: [] },
        'AAA-light': { allShades: [] },
        'AAA-dark': { allShades: [] }
      }
    }));
}, [fullColorData]);


  // Second: Initialize base color
  useEffect(() => {
    console.log("Initializing base color, current safeColors:", safeColors);
    
    if (!baseColor && safeColors.length > 0) {
      // Find first non-default color
      const nonDefaultColor = safeColors.find(color => !color.id.startsWith('default-'));
      
      if (nonDefaultColor) {
        console.log("Setting initial base color to:", nonDefaultColor);
        const normalizedColor = {
          ...nonDefaultColor,
          shadeIndex: typeof nonDefaultColor.shadeIndex === 'string' 
            ? parseInt(nonDefaultColor.shadeIndex, 10) 
            : nonDefaultColor.shadeIndex,
          allModes: nonDefaultColor.allModes || {
            'AA-light': { allShades: [] },
            'AA-dark': { allShades: [] },
            'AAA-light': { allShades: [] },
            'AAA-dark': { allShades: [] }
          }
        };
        setBaseColor(normalizedColor);
      }
    }
  }, [safeColors]);

  // Color Harmonies
 const arrangedColors = useMemo(() => {
  console.log("Creating arrangedColors with:", {
    baseColor,
    safeColors
  });
  if (!baseColor) {
    console.log("No base color, returning empty array");
    return [];
  }
  
  // Make sure we're returning an array of ColorData objects
  const normalizedColors = [
    baseColor,
    ...safeColors
      .filter(color => 
        color.baseHex !== baseColor.baseHex &&
        !color.id.startsWith('state-') && 
        !color.id.startsWith('default-')
      )
  ].map(color => {
    const normalized = {
      ...color,
      shadeIndex: typeof color.shadeIndex === 'string' ? parseInt(color.shadeIndex, 10) : color.shadeIndex,
      allModes: color.allModes || {
        'AA-light': { allShades: [] },
        'AA-dark': { allShades: [] },
        'AAA-light': { allShades: [] },
        'AAA-dark': { allShades: [] }
      }
    };
    
    console.log("Normalized color:", normalized);
    return normalized;
  });

  console.log("Final arrangedColors:", normalizedColors);
  return normalizedColors;
}, [baseColor, safeColors.map(color => color.baseHex).join(',')]);
  

useEffect(() => {
  console.log('useEffect for image insertion triggered');
  console.log('Props:', { imageFile, imageUrl });
  
  const insertImage = async () => {
    if (imageFile || imageUrl) {
      try {
        console.log('Attempting image insertion');
        const imageBytes = imageFile 
          ? await imageFile.arrayBuffer() 
          : await (await fetch(imageUrl as string)).arrayBuffer();

        console.log('Image bytes:', imageBytes.byteLength);
        
        window.parent.postMessage({
          pluginMessage: {
            type: 'insert-image',
            imageBytes: new Uint8Array(imageBytes),
            frameName: 'imageHero'
          }
        }, '*');
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  insertImage();
}, [imageFile, imageUrl]);


  const harmonies = useColorHarmonies(arrangedColors);
  console.log("Generated harmonies:", harmonies);

  useEffect(() => {
    if (!harmonies || !baseColor) {
      console.log("Missing harmonies or baseColor, skipping theme generation");
      return;
    }
  
    try {
      let newThemes: Theme[] = [];
      let newThemeAnalysis: Array<{
        theme: Theme;
        isValid: boolean;
        reason: ThemeAnalysisReason;
      }> = [];
  
      // Process regular harmonies
      for (const { key, name } of harmonyTypes) {
        if (key === 'custom') {
          // Handle custom theme as before
          const customTheme = {
            name: 'Custom',
            colors: {
              primary: customColors[0] || '',
              secondary: customColors[1] || '',
              tertiary: customColors[2] || ''
            },
            type: 'custom' as const
          };
          newThemes.push(customTheme);
          newThemeAnalysis.push({
            theme: customTheme,
            isValid: customColors.length === 3 && customColors.every(color => color !== ''),
            reason: 'valid'
          });
          continue;
        }
  
        const harmonyColors = harmonies[key as keyof typeof harmonies];
        console.log(`Processing ${name} harmony:`, harmonyColors);
  
        if (!harmonyColors) continue;
  
        const processedColors: ColorSet = {
          primary: harmonyColors.primary?.baseHex || baseColor.baseHex,
          secondary: harmonyColors.secondary?.baseHex || baseColor.baseHex,
          tertiary: harmonyColors.tertiary?.baseHex || baseColor.baseHex
        };
  
        const theme: Theme = {
          name,
          colors: processedColors,
          type: key === 'splitComplementary' ? 'split-complementary' : key
        };
  
        // Add to themes array
        newThemes.push(theme);
      }
  
      // Check for duplicates and redundancy across all themes
      const redundancyResults = checkThemeRedundancy(newThemes);
      newThemeAnalysis = redundancyResults;
  
      console.log("Themes after redundancy check:", newThemeAnalysis);
  
      // Update state
      setThemes(newThemes);
      setThemeAnalysis(newThemeAnalysis);
  
      // If active theme is now invalid, select first valid theme
      if (activeTheme) {
        const activeThemeAnalysis = redundancyResults.find(t => 
          t.theme.name === activeTheme.name && t.theme.type === activeTheme.type
        );
  
        if (!activeThemeAnalysis?.isValid) {
          console.log("Active theme is now invalid, selecting new theme");
          const firstValidTheme = redundancyResults.find(t => t.isValid)?.theme;
          if (firstValidTheme) {
            setActiveTheme(firstValidTheme);
            setSelectedTheme(firstValidTheme);
            
            // Update Figma with new theme colors
            Object.entries(firstValidTheme.colors).forEach(([position, color]) => {
              const colorHex = typeof color === 'object' ? color.baseHex : color;
              window.parent.postMessage({
                pluginMessage: {
                  type: 'update-design-token',
                  collection: 'Modes',
                  group: 'Default',
                  mode: 'AA-light',
                  variable: `${position}-color`,
                  value: colorHex
                }
              }, '*');
            });
  
            // Trigger surface style update
            handleSurfaceStyleChange(surfaceStyle);
            onThemeComplete?.(baseColor.baseHex);  // Pass the baseColor hex
          }
        }
      }
  
    } catch (error) {
      console.error('Error generating themes:', error);
    }
  }, [harmonies, baseColor, customColors]);

  // Helper function for finding hotlink colors
  function findHotlinkColor(
    surfaces: string[],
    shades: Array<{ hex: string, contrastRatio: number, textColor: string }>,
    isBlueStyle: boolean = false
  ): { color: string, requiresInvert: boolean } {
    if (isBlueStyle) {
      const blueColor = '#0066CC';
      const meetsContrast = surfaces.every(surface => 
        chroma.contrast(blueColor, surface) >= 4.5
      );

      if (meetsContrast) {
        return { color: blueColor, requiresInvert: false };
      }
      return { color: '#000000', requiresInvert: true };
    }

    const firstSurface = surfaces[0];
    const surfaceLuminance = chroma(firstSurface).luminance();
    
    const sortedShades = [...shades].sort((a, b) => {
      if (surfaceLuminance < 0.5) {
        return shades.indexOf(a) - shades.indexOf(b);
      } else {
        return shades.indexOf(b) - shades.indexOf(a);
      }
    });

    for (const shade of sortedShades) {
      const meetsAllContrasts = surfaces.every(surface => 
        chroma.contrast(shade.hex, surface) >= 4.5
      );

      if (meetsAllContrasts) {
        return { color: shade.hex, requiresInvert: false };
      }
    }

    return {
      color: surfaceLuminance < 0.5 ? '#FFFFFF' : '#000000',
      requiresInvert: true
    };
  }

  const checkThemeRedundancy = (themes: Theme[]): Array<{
    theme: Theme;
    isValid: boolean;
    reason: ThemeAnalysisReason;
  }> => {
    console.log('Starting redundancy check');
    const seenSignatures = new Set<string>();
    
    return themes.map(theme => {
      const colorValues = Object.values(theme.colors);
      const uniqueColors = new Set(colorValues);
      const hasInternalDuplicates = uniqueColors.size !== colorValues.length;
      const colorSignature = colorValues.sort().join(',');
      const isRedundant = seenSignatures.has(colorSignature);
  
      if (!isRedundant) {
        seenSignatures.add(colorSignature);
      }
  
      const result = {
        theme,
        isValid: !hasInternalDuplicates && !isRedundant,
        reason: hasInternalDuplicates ? 'duplicate' as ThemeAnalysisReason : 
                isRedundant ? 'redundant' as ThemeAnalysisReason : 
                'valid' as ThemeAnalysisReason
      };
  
      return result;
    });
  };

let darkTextColor = '#121212';
let darkTextOpacity = 1;

// Add this useEffect near the top of your component
useEffect(() => {
  if (baseColor) {
    handleSurfaceStyleChange('light-tonal');
  }
}, [baseColor]);

useEffect(() => {
  const checkThemeGeneration = () => {
    console.log('Checking theme generation:', {
      surfaceStyle,
      buttonShape,
      activeTheme,
      isProcessing,
      baseColor: baseColor?.baseHex
    });

    const isThemeGenerated =
      surfaceStyle !== undefined &&
      buttonShape !== undefined &&
      activeTheme !== null &&
      baseColor?.baseHex &&  // Add check for baseColor
      isProcessing;

      if (isThemeGenerated && onThemeComplete) {
        console.log('Triggering onThemeComplete with baseColor:', baseColor.baseHex);
        onThemeComplete(baseColor.baseHex);
      }
  };

  const timer = setTimeout(checkThemeGeneration, 500);
  return () => clearTimeout(timer);
}, [surfaceStyle, activeTheme, buttonShape, onThemeComplete, isProcessing]);

const findBorderColor = (
  shadeMixer: string,
  surfaces: string[],
  targetContrastRatio: number
 ): string => {
  let n = 1;
  let lastValidN = null;
 
  while (n > 0) {
    const mixedColor = chroma.mix(surfaces[0], shadeMixer, n);
    const allSurfacesMeetContrast = surfaces.every(surface => 
      chroma.contrast(mixedColor, surface) >= targetContrastRatio
    );
 
    if (allSurfacesMeetContrast) {
      lastValidN = n;
      break;
    }
    n = n  - 0.01;
  }
 
  if (lastValidN === null) return shadeMixer;
  return chroma.mix(surfaces[0], shadeMixer, 1 - lastValidN + .01).hex();
 };


const findShadeWithMinContrastRatioMultiSurface = (
  targetColor: ColorData,
  surfaces: string[],
  targetContrastRatio: number
): { shade: string, requiresBg: boolean } => {
  const colorInPalette = safeColors.find(color => color.baseHex === targetColor.baseHex);
  const shades = colorInPalette?.allModes?.['AA-light']?.allShades || [];
  const firstSurface = surfaces[0];
  const surfaceLuminance = chroma(firstSurface).luminance();
  
  const sortedShades = [...shades].sort((a, b) => {
    if (surfaceLuminance < 0.5) {
      return shades.indexOf(a) - shades.indexOf(b);  // For dark surfaces, start light
    } else {
      return shades.indexOf(b) - shades.indexOf(a);  // For light surfaces, start dark
    }
  });

  let lastValidShade = null;
  for (const shade of sortedShades) {
    const meetsAllSurfaceContrasts = surfaces.every(surface => 
      chroma.contrast(shade.hex, surface) >= targetContrastRatio
    );

    if (meetsAllSurfaceContrasts) {
      lastValidShade = shade;
    } else if (lastValidShade) {
      return { shade: lastValidShade.hex, requiresBg: false };
    }
  }

  return { shade: lastValidShade?.hex || targetColor.baseHex, requiresBg: !lastValidShade };
};

// Helper function to find a button color with sufficient contrast
function findButtonColor(
  allShades: Array<{hex: string, contrastRatio: number, textColor: string}>,
  surfaces: string[],
  prefix: string = ''
 ): { [key: string]: string } {
  const firstSurface = surfaces[0];
  const surfaceLuminance = chroma(firstSurface).luminance();
  
  const sortedShades = [...allShades].sort((a, b) => {
    if (surfaceLuminance < 0.5) {
      return allShades.indexOf(a) - allShades.indexOf(b);
    } else {
      return allShades.indexOf(b) - allShades.indexOf(a);
    }
  });
 
  let lastValidShade = null;
 
  for (const shade of sortedShades) {
    const meetsContrastRequirements = surfaces.every(surface => 
      chroma.contrast(shade.hex, surface) >= 3.1
    );
 
    if (meetsContrastRequirements) {
      lastValidShade = shade;
    } else if (lastValidShade) {
      break;
    }
  }
 
  if (lastValidShade) {
    return {
      [`${prefix}buttonColor`]: lastValidShade.hex,
      [`${prefix}buttonTextColor`]: lastValidShade.textColor
    };
  }
 
  return {
    [`${prefix}buttonColor`]: sortedShades[0]?.hex || surfaces[0],
    [`${prefix}buttonTextColor`]: sortedShades[0]?.textColor || '#FFFFFF'
  };
 }

// Helper function to find a text color with sufficient contrast
function findTextColor(
  allShades: Array<{ hex: string, contrastRatio: number, textColor: string }>, 
  surfaces: string[],
  minContrastRatio: number
): string {
  console.log('Finding text color with minimum contrast ratio:', minContrastRatio);
  
  // Check luminance of first surface to determine direction
  const firstSurface = surfaces[0];
  const surfaceLuminance = chroma(firstSurface).luminance();
  
  // Sort shades based on surface luminance
  const sortedShades = [...allShades].sort((a, b) => {
    if (surfaceLuminance < 0.5) {
      // For dark surfaces, start from lightest (index 0)
      return allShades.indexOf(a) - allShades.indexOf(b);
    } else {
      // For light surfaces, start from darkest (index 9)
      return allShades.indexOf(b) - allShades.indexOf(a);
    }
  });

  let lastValidShade = null;

  // Iterate through each surface
  for (const surface of surfaces) {
    console.log(`\nChecking shades against surface: ${surface}`);
    const surfaceLum = chroma(surface).luminance();
    
    // Find the last valid shade for this surface
    for (const shade of sortedShades) {
      const contrast = chroma.contrast(shade.hex, surface);
      console.log(`Shade ${shade.hex}: Contrast against ${surface} = ${contrast}`);

      if (contrast >= minContrastRatio) {
        lastValidShade = shade;
      } else if (lastValidShade) {
        // If we found a valid shade but this one doesn't work, break
        break;
      }
    }

    // If we don't find a valid shade for any surface, break early
    if (!lastValidShade) {
      break;
    }
  }

  // If we found a valid shade that works for all surfaces, use it
  if (lastValidShade) {
    console.log(`✅ Selected shade ${lastValidShade.hex}`);
    return lastValidShade.hex;
  }

  // Fallback if no shade meets the contrast requirement
  console.log('No shade found meeting contrast requirements');
  return sortedShades[0]?.hex || '#121212';
}

const generateIconTokens = (
  primary: ColorData,
  surfaceOrContainer: 'surface' | 'container',
  surfaceOrContainerColors: string[],
  stateColors: ColorData[],
  secondary?: ColorData,
  tertiary?: ColorData,
  baseColor?: any // Add baseColor here
): Array<{ name: string; value: string }> => {
  const iconTokens: Array<{ name: string; value: string }> = [];
  let requiresIconBg = false;

  // Test all colors
  const primaryResult = findShadeWithMinContrastRatioMultiSurface(
    primary,
    surfaceOrContainerColors,
    3.1
  );
  const secondaryResult = secondary
    ? findShadeWithMinContrastRatioMultiSurface(secondary, surfaceOrContainerColors, 3.1)
    : null;
  const tertiaryResult = tertiary
    ? findShadeWithMinContrastRatioMultiSurface(tertiary, surfaceOrContainerColors, 3.1)
    : null;

  requiresIconBg =
    primaryResult.requiresBg ||
    (secondaryResult?.requiresBg || false) ||
    (tertiaryResult?.requiresBg || false);

  // Set background if needed
  const bgPrefix = surfaceOrContainer === 'surface' ? 'Surface-' : 'Container-';
  if (requiresIconBg) {
    const baseFirstShade = baseColor?.allModes?.['AA-light']?.allShades[0]?.hex;
    iconTokens.push({ name: `${bgPrefix}Icon-BG`, value: baseFirstShade || '#ffffff' });
  } else {
    iconTokens.push({ name: `${bgPrefix}Icon-BG`, value: 'rgba(255, 255, 255, 0)' });
  }

  // Add icon colors
  const colorPrefix = surfaceOrContainer === 'surface' ? 'Surface-' : 'Container-';
  iconTokens.push({ name: `${colorPrefix}Icon-Primary`, value: primaryResult.shade });
  if (secondaryResult)
    iconTokens.push({ name: `${colorPrefix}Icon-Secondary`, value: secondaryResult.shade });
  if (tertiaryResult)
    iconTokens.push({ name: `${colorPrefix}Icon-Tertiary`, value: tertiaryResult.shade });

  return iconTokens;
}

// Helper functions
function generateAndSendIconTokens(
  baseColor: ColorData,
  surfaceOrContainer: 'surface' | 'container',
  surfaceOrContainerColors: string[],
  stateColors: ColorData[],
  secondaryColor?: ColorData,
  tertiaryColor?: ColorData
) {
  const iconTokens = generateIconTokens(
    baseColor,
    surfaceOrContainer,
    surfaceOrContainerColors,
    stateColors,
    secondaryColor,
    tertiaryColor
  );

  iconTokens.forEach((token) => {
    window.parent.postMessage({
      pluginMessage: {
        type: 'update-design-token',
        collection: 'Modes',
        group: 'Backgrounds/Default',
        mode: 'AA-light',
        variable: token.name,
        value: token.value,
      },
    }, '*');
  });
}

function generateAndSendSurfaceTokens(
  surface: string,
  surfaceDim: string,
  surfaceBright: string,
  container: string,
  containerLow: string,
  containerLowest: string,
  containerHigh: string,
  containerHighest: string,
  buttonColor: string,
  buttonTextColor: string,
  containerButton: string,
  containerButtonText: string,
  onSurface: string,
  onContainers: string,
  borderColor: string | null = null,
  containerBorder: string | null = null,
  dropColor1: string | null = null,
  dropColor2: string | null = null,
  dropColor3: string | null = null,
  dropColor4: string | null = null,
  dropColor5: string | null = null,
  quietSurface:  string,
  quietSurfaceDim:string,
  quietSurfaceBright: string,
  quietContainer: string,
  quietContainerLow: string,
  quietContainerLowest: string,
  quietContainerHigh: string,
  quietContainerHighest: string,
  surfaceHotlinkColor: string | null = null,
  containerHotlinkColor: string | null = null
  ) {
  const surfaceTokens = [
    { name: 'Surface', value: surface },
    { name: 'On-Surface', value: onSurface },
    { name: 'On-Container', value: onContainers },
    { name: 'Surface-Dim', value: surfaceDim },
    { name: 'Surface-Bright', value: surfaceBright },
    { name: 'Container', value: container },
    { name: 'Container-Low', value: containerLow },
    { name: 'Container-Lowest', value: containerLowest },
    { name: 'Container-High', value: containerHigh },
    { name: 'Container-Highest', value: containerHighest },
    { name: 'Surface-Button', value: buttonColor },
    { name: 'Surface-On-Button', value: buttonTextColor },
    { name: 'Surface-Border', value: borderColor },
    { name: 'Container-Border', value: containerBorder },
    { name: 'Container-Button', value: containerButton },
    { name: 'Container-On-Button', value: containerButtonText },
    { name: 'Dropdown-Color-1', value: dropColor1 },
    { name: 'Dropdown-Color-2', value: dropColor2 },
    { name: 'Dropdown-Color-3', value: dropColor3 },
    { name: 'Dropdown-Color-4', value: dropColor4 },
    { name: 'Dropdown-Color-5', value: dropColor5 },
    { name: 'Surface-Quiet', value: quietSurface },
    { name: 'Surface-Dim-Quiet', value: quietSurfaceDim },
    { name: 'Surface-Bright-Quiet', value: quietSurfaceBright },
    { name: 'Container-Quiet', value: quietContainer },
    { name: 'Container-Low-Quiet', value: quietContainerLow },
    { name: 'Container-Lowest-Quiet', value: quietContainerLowest },
    { name: 'Container-High-Quiet', value: quietContainerHigh },
    { name: 'Container-Highest-Quiet', value: quietContainerHighest },
    { name: 'Surface-Hotlink', value: surfaceHotlinkColor || onSurface },
    { name: 'Container-Hotlink', value: containerHotlinkColor || onContainers },
  
  ];

  if (borderColor) {
    surfaceTokens.push({ name: 'Surface-Border', value: borderColor });
  }

  surfaceTokens.forEach(token => {
    console.log("Sending token to Figma:", token.name, token.value);
    window.parent.postMessage({
      pluginMessage: {
        type: 'update-design-token',
        collection: 'Modes',
        group: 'Backgrounds/Default',
        mode: 'AA-light',
        variable: token.name,
        value: token.value
      }
    }, '*');
  });
}

function getMonochromaticShades(
  baseColor: ColorData,
  surfaceStyle: SurfaceStyle,
  usedShadeIndices: number[]
) {
  const allShades = baseColor.allModes?.['AA-light']?.allShades || [];
  
  const availableIndices = Array.from(Array(allShades.length).keys())
    .filter(index => {
      if (usedShadeIndices.includes(index)) return false;
      if (surfaceStyle === 'light-tonal' && index === 0) return false;
      if (surfaceStyle === 'dark-tonal' && index === 8) return false;
      return true;
    });

  const randomIndex = Math.floor(Math.random() * availableIndices.length);
  const secondaryLightIndex = availableIndices[randomIndex];
  availableIndices.splice(randomIndex, 1);

  const randomIndex2 = Math.floor(Math.random() * availableIndices.length);
  const secondaryDarkIndex = availableIndices[randomIndex2];
  availableIndices.splice(randomIndex2, 1);

  const randomIndex3 = Math.floor(Math.random() * availableIndices.length);
  const tertiaryLightIndex = availableIndices[randomIndex3];
  availableIndices.splice(randomIndex3, 1);

  const randomIndex4 = Math.floor(Math.random() * availableIndices.length);
  const tertiaryDarkIndex = availableIndices[randomIndex4];

  return {
    secondaryLight: allShades[secondaryLightIndex]?.hex || baseColor.baseHex,
    secondaryDark: allShades[secondaryDarkIndex]?.hex || baseColor.baseHex,
    tertiaryLight: allShades[tertiaryLightIndex]?.hex || baseColor.baseHex,
    tertiaryDark: allShades[tertiaryDarkIndex]?.hex || baseColor.baseHex
  };
}
function modifyHSL(color: string): string[] {
  try {
    // Parse the input color and extract HSL values
    const hsl = chroma(color).hsl();
    const currentH = hsl[0];
    const currentS = hsl[1];
    const currentL = hsl[2];

    // Reduce saturation by 20% and lightness by 35%
    const newS = Math.max(0, currentS * 0.8); // Ensure value stays within 0-1
    const newL = Math.max(0, currentL * 0.65); // Ensure value stays within 0-1

    // Generate the base color with modified HSL values
    const newColor = chroma.hsl(currentH, newS, newL).hex();

    // Define the alpha values to apply
    const alphaValues = [0.7, 0.54, 0.38, 0.32, 0.2];

    // Return an array of colors with different alpha values
    const colorsWithAlpha = alphaValues.map(alpha => {
      const alphaHex = opacityToHex(alpha); // Convert opacity to hex
      return `${newColor}${alphaHex}`; // Append alpha as hex to the base color
    });

    return colorsWithAlpha;
  } catch (error) {
    console.error("Invalid color input:", error);
    throw new Error("Failed to modify HSL and generate colors. Please check the input color.");
  }
}
// Helper function to convert opacity (0-1) to hex
function opacityToHex(opacity: number): string {
  const alpha = Math.round(opacity * 255); // Scale to 0-255
  return alpha.toString(16).padStart(2, '0'); // Convert to hex and ensure 2 characters
}


function createOrUpdateMeshGradientBackground(
  primaryColors: string[], // Array of 5 primary color hex codes
  accentColors: string[],  // Array of 3 accent color hex codes
  backgroundColor: string, // Background color hex code
  frameWidth: number,      // Width of the background frame
  frameHeight: number      // Height of the background frame
) {
  // Ensure correct number of colors are provided
  if (primaryColors.length !== 5 || accentColors.length !== 3) {
    figma.notify("Please provide exactly 5 primary colors and 3 accent colors.");
    return;
  }

  // Helper to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const bigint = parseInt(hex.replace("#", ""), 16);
    return { r: ((bigint >> 16) & 255) / 255, g: ((bigint >> 8) & 255) / 255, b: (bigint & 255) / 255 };
  };

  // Find an existing frame named "MeshGradient"
  let frame = figma.currentPage.findOne((node) => node.name === "MeshGradient" && node.type === "FRAME") as FrameNode;

  if (!frame) {
    // Create a new frame if one doesn't exist
    frame = figma.createFrame();
    frame.name = "MeshGradient";
    frame.resize(frameWidth, frameHeight);
    figma.currentPage.appendChild(frame);
    frame.x = figma.viewport.center.x - frameWidth / 2;
    frame.y = figma.viewport.center.y - frameHeight / 2;
  } else {
    // Resize the existing frame to match the provided dimensions
    frame.resizeWithoutConstraints(frameWidth, frameHeight);
  }

  // Set the background color of the frame
  const bgColor = hexToRgb(backgroundColor);
  frame.fills = [{ type: "SOLID", color: bgColor }];

  // Combine primary and accent colors for random selection
  const allColors = [...primaryColors, ...accentColors];

  // Remove all existing child nodes (optional: to avoid overlaps)
  frame.children.forEach((child) => child.remove());

  // Generate blob shapes
  for (let i = 0; i < 20; i++) {
    const shape = figma.createEllipse(); // Create an ellipse
    const color = hexToRgb(allColors[Math.floor(Math.random() * allColors.length)]); // Pick a random color

    // Randomly position and size the shape
    const x = Math.random() * frameWidth;
    const y = Math.random() * frameHeight;
    const width = 50 + Math.random() * 150; // Width between 50 and 200
    const height = 50 + Math.random() * 150; // Height between 50 and 200

    shape.resize(width, height);
    shape.x = x;
    shape.y = y;

    // Assign the color and opacity
    shape.fills = [{ type: "SOLID", color, opacity: 0.7 }];

    // Apply background blur
    shape.effects = [
      {
        type: "BACKGROUND_BLUR",
        radius: 20, // Adjust blur radius as needed
        visible: true,
      },
    ];

    // Add the shape to the frame
    frame.appendChild(shape);
  }

  figma.notify("Mesh gradient background updated!");
}

const updateShadowVariables = () => {
  const elevations = [
    {
      group: 'Elevation-1',
      shadows: [
        {horizontal: .5, vertical: 1, blur: 1, spread: 0},
        {horizontal: 0, vertical: 0, blur: 0, spread: 0},
        {horizontal: 0, vertical: 0, blur: 0, spread: 0},
        {horizontal: 0, vertical: 0, blur: 0, spread: 0},
        {horizontal: 0, vertical: 0, blur: 0, spread: 0}
      ]
    },
    {
      group: 'Elevation-2', 
      shadows: [
        {horizontal: 1, vertical: 2, blur: 2, spread: 0},
        {horizontal: 2, vertical: 4, blur: 4, spread: 0},
        {horizontal: 0, vertical: 0, blur: 0, spread: 0},
        {horizontal: 0, vertical: 0, blur: 0, spread: 0},
        {horizontal: 0, vertical: 0, blur: 0, spread: 0}
      ]
    },
    {
      group: 'Elevation-3',
      shadows: [
        {horizontal: 1, vertical: 1, blur: 2, spread: 0},
        {horizontal: 2, vertical: 2,  blur: 4, spread: 0},
        {horizontal: 3, vertical: 6,  blur: 6, spread: 0},
        {horizontal: 0, vertical: 0, blur: 0, spread: 0},
        {horizontal: 0, vertical: 0, blur: 0, spread: 0},
      ]
    },
    {
      group: 'Elevation-4',
      shadows: [
        {horizontal: 1, vertical: 2, blur: 2, spread: 0},
        {horizontal: 2, vertical: 4,  blur: 4, spread: 0},
        {horizontal: 3, vertical: 6,  blur: 6, spread: 0},
        {horizontal: 6, vertical: 12, blur: 12, spread: 0},
        {horizontal: 0, vertical: 0, blur: 0, spread: 0},
      ]
    },
    {
      group: 'Elevation-5',
      shadows: [
        {horizontal: 1, vertical: 2, blur: 2, spread: 0},
        {horizontal: 2, vertical: 4,  blur: 4, spread: 0},
        {horizontal: 3, vertical: 6,  blur: 6, spread: 0},
        {horizontal: 6, vertical: 12, blur: 12, spread: 0},
        {horizontal: 12, vertical: 24, blur: 24, spread: 0},
      ]
    }
  ];
 
  elevations.forEach((elevation) => {
    elevation.shadows.forEach((shadow, shadowIndex) => {
      const dropNumber = shadowIndex + 1;
      const shadowProps = {
        Vertical: shadow.vertical,
        Horizontal: shadow.horizontal,
        Blur: shadow.blur,
        Spread: shadow.spread
      };
      
      Object.entries(shadowProps).forEach(([property, value]) => {
        window.parent.postMessage({
          pluginMessage: {
            type: 'update-design-token',
            collection: 'Shadows',
            group: elevation.group,
            mode: 'Dropshadows', 
            variable: `Drop${dropNumber}-${property}`,
            value: value
          }
        }, '*');
      });
 
      // Set color reference
      window.parent.postMessage({
        pluginMessage: {
          type: 'update-design-token',
          collection: 'Shadows',
          group: elevation.group,
          mode: 'Dropshadows',
          variable: `Drop${dropNumber}-Color`,
          value: {
            collection: 'Modes',
            mode: 'Backgrounds/Default', 
            variable: 'Dropdown'
          }
        }
      }, '*');
    });
  });
 };


function generateQuietSurfaceColor(
  surfaceColor: string,
  textColor: string,
  requiredContrast: number
): string {
  let n = 1;
  let lastValidN = null;

  while (n > 0) {
    const newColor = chroma.mix(surfaceColor, textColor, n, 'rgb').hex();
    const contrast = chroma.contrast(surfaceColor, newColor);

    if (contrast <= requiredContrast) {
      lastValidN = n; // Save the current valid n
    }
    n = n - 0.01;
  }
  lastValidN = 1 - n + .01 

  return lastValidN !== null
    ? chroma.mix(surfaceColor, textColor, lastValidN, 'rgb').hex() // Use lastValidN directly
    : surfaceColor;
}

// Main surface style handler
const handleSurfaceStyleChange = useCallback((style: SurfaceStyle) => {
  const stateColors: ColorData[] = fullColorData.filter(color => 
    color.id.startsWith('state-color-')
  ) as ColorData[];
   
  if (!baseColor || !baseColor.baseHex) return;

  // Base color definitions
  const primary = baseColor.baseHex;
  const shadeIndex = baseColor.shadeIndex;
  const primaryLight = baseColor.allModes['AA-light'].allShades[shadeIndex - 2]?.hex || primary;
  const primaryDark = baseColor.allModes['AA-light'].allShades[shadeIndex + 2]?.hex || primary;

  const secondaryColor = activeTheme?.colors.secondary
  ? (isColorData(activeTheme.colors.secondary)
    ? activeTheme.colors.secondary
    : { ...baseColor, baseHex: activeTheme.colors.secondary as string })
  : baseColor;

  const tertiaryColor = activeTheme?.colors.tertiary
  ? (isColorData(activeTheme.colors.tertiary)
    ? activeTheme.colors.tertiary
    : { ...baseColor, baseHex: activeTheme.colors.tertiary as string })
  : baseColor;

  const secondary = secondaryColor.baseHex;
  const tertiary = tertiaryColor.baseHex;

  let secondaryLight, secondaryDark, tertiaryLight, tertiaryDark;

  if (activeTheme?.type === 'monochromatic') {
    const usedIndices = [shadeIndex, shadeIndex - 2, shadeIndex + 2];
    const monochromaticShades = getMonochromaticShades(baseColor, style, usedIndices);
    secondaryLight = monochromaticShades.secondaryLight;
    secondaryDark = monochromaticShades.secondaryDark;
    tertiaryLight = monochromaticShades.tertiaryLight;
    tertiaryDark = monochromaticShades.tertiaryDark;
  } else {
    const secondaryPalette = safeColors.find(color => color.baseHex === secondaryColor.baseHex);
    const tertiaryPalette = safeColors.find(color => color.baseHex === tertiaryColor.baseHex);
    
    function getLightDarkIndices(baseIndex: number) {
      switch (baseIndex) {
        case 0: return { lightIndex: 2, darkIndex: 6 };
        case 1: return { lightIndex: 3, darkIndex: 6 };
        case 2: return { lightIndex: 1, darkIndex: 6 };
        case 3: return { lightIndex: 1, darkIndex: 6 };
        case 4: return { lightIndex: 2, darkIndex: 7 };
        case 5: return { lightIndex: 2, darkIndex: 7 };
        case 6: return { lightIndex: 2, darkIndex: 8 };
        case 7: return { lightIndex: 2, darkIndex: 5 };
        case 8: return { lightIndex: 3, darkIndex: 5 };
        default: return { lightIndex: 3, darkIndex: 7 };
      }
    }

    const secondaryIndices = getLightDarkIndices(baseColor.shadeIndex);
    const tertiaryIndices = getLightDarkIndices(baseColor.shadeIndex);

    secondaryLight = secondaryPalette?.allModes?.['AA-light']?.allShades[secondaryIndices.lightIndex]?.hex || secondary;
    secondaryDark = secondaryPalette?.allModes?.['AA-light']?.allShades[secondaryIndices.darkIndex]?.hex || secondary;
    tertiaryLight = tertiaryPalette?.allModes?.['AA-light']?.allShades[tertiaryIndices.lightIndex]?.hex || tertiary;
    tertiaryDark = tertiaryPalette?.allModes?.['AA-light']?.allShades[tertiaryIndices.darkIndex]?.hex || tertiary;
  }
    const white = '#ffffff';

  // Send base tokens
  const baseTokens = [
    { collection: 'Modes', group: 'Backgrounds/Primary', mode: 'AA-light', value: primary },
    { collection: 'Modes', group: 'Backgrounds/Primary-Light', mode: 'AA-light', value: primaryLight },
    { collection: 'Modes', group: 'Backgrounds/Primary-Dark', mode: 'AA-light', value: primaryDark },
    { collection: 'Modes', group: 'Backgrounds/Secondary', mode: 'AA-light', value: secondary },
    { collection: 'Modes', group: 'Backgrounds/Secondary-Light', mode: 'AA-light', value: secondaryLight },
    { collection: 'Modes', group: 'Backgrounds/Secondary-Dark', mode: 'AA-light', value: secondaryDark },
    { collection: 'Modes', group: 'Backgrounds/Tertiary', mode: 'AA-light', value: tertiary },
    { collection: 'Modes', group: 'Backgrounds/Tertiary-Light', mode: 'AA-light', value: tertiaryLight },
    { collection: 'Modes', group: 'Backgrounds/Tertiary-Dark', mode: 'AA-light', value: tertiaryDark },
    { collection: 'Modes', group: 'Backgrounds/White', mode: 'AA-light', value: white }
  ];

  baseTokens.forEach(token => {
    window.parent.postMessage({
      pluginMessage: {
        type: 'update-design-token',
        collection: token.collection,
        group: token.group,
        mode: token.mode,
        variable: 'Surface',
        value: token.value
      }
    }, '*');
  });

  const copyShadowValues = (fromMode: string) => {
    const shadowGroups = ['Elevation-0', 'Elevation-1', 'Elevation-2', 'Elevation-3', 'Elevation-4', 'Elevation-5'];
    const shadowProperties = ['Drop1-Vertical', 'Drop1-Horizontal', 'Drop1-Blur', 'Drop1-Spread', 'Drop1-Color', 
      'Drop2-Vertical', 'Drop2-Horizontal', 'Drop2-Blur', 'Drop2-Spread', 'Drop2-Color',
      'Drop3-Vertical', 'Drop3-Horizontal', 'Drop3-Blur', 'Drop3-Spread', 'Drop3-Color',
      'Drop4-Vertical', 'Drop4-Horizontal', 'Drop4-Blur', 'Drop4-Spread', 'Drop4-Color',
      'Drop5-Vertical', 'Drop5-Horizontal', 'Drop5-Blur', 'Drop5-Spread', 'Drop5-Color'];
   
    shadowGroups.forEach(group => {
      shadowProperties.forEach(property => {
        window.parent.postMessage({
          pluginMessage: {
            type: 'copy-token-value',
            collection: 'Shadows',
            group: group,
            fromMode: fromMode,
            toMode: 'Default',
            variable: property
          }
        }, '*');
      });
    });
   };
   
   if (['dark-professional', 'light-tonal', 'colorful-tonal', 'dark-tonal'].includes(style)) {
    copyShadowValues('None');
   } else if (['light-glow', 'dark-glow'].includes(style)) {
    copyShadowValues('Glow');
   } else {
    copyShadowValues('Dropshadows');
   }

  if (style === 'light-tonal') {

    const baseMix = baseColor.allModes?.['AA-light']?.allShades[5]?.hex || baseColor.baseHex;
    
    const surface = chroma.mix('white', baseMix, 0.07, 'rgb').hex();
    const surfaceDim = chroma.mix(surface, 'black', 0.07).hex();
    const surfaceBright = chroma.mix(surface, 'white', 0.05).hex();
    const container = surface;
    const containerLow = chroma.mix('white', baseMix, 0.04, 'rgb').hex();
    const containerLowest = chroma.mix('white', baseMix, 0.02, 'rgb').hex();
    const containerHigh = chroma.mix('white', baseMix, 0.11, 'rgb').hex();
    const containerHighest = chroma.mix('white', baseMix, 0.14, 'rgb').hex();

    const surfaces = [surface, surfaceDim, surfaceBright];
    const containers = [containerLow, containerLowest, containerHigh, containerHighest];  

    const safeAllShades = baseColor.allModes?.['AA-light']?.allShades || [];
    const { buttonColor, buttonTextColor } = findButtonColor(safeAllShades, surfaces);
    const { containerButton, containerButtonText } = findButtonColor(safeAllShades, containers, 'container');
    const onSurface = findTextColor(safeAllShades, surfaces, 4.5);
    const onContainers = findTextColor(safeAllShades, containers, 4.5);
    const borderColor = findBorderColor(baseColor.baseHex, surfaces, 3.1);
    const containerBorder = findBorderColor(baseColor.baseHex, containers, 3.1);
    const dropColors = modifyHSL(surface);
    console.log("Drop colors:", dropColors); // Add this after modifyHSL call
    const dropColor1 = dropColors[0];
    const dropColor2 = dropColors[1];
    const dropColor3 = dropColors[2];
    const dropColor4 = dropColors[3];
    const dropColor5 = dropColors[4];
    const quietSurface = generateQuietSurfaceColor(surface, onSurface, 4.5);
    const quietSurfaceDim = generateQuietSurfaceColor(surfaceDim, onSurface, 4.5);
    const quietSurfaceBright = generateQuietSurfaceColor(surfaceBright, onSurface, 4.5);
    const quietContainer = generateQuietSurfaceColor(surface, onSurface, 4.5);
    const quietContainerLow = generateQuietSurfaceColor(containerLow, onSurface, 4.5);
    const quietContainerLowest= generateQuietSurfaceColor(containerLowest, onSurface, 4.5);
    const quietContainerHigh = generateQuietSurfaceColor(containerHigh, onSurface, 4.5);
    const quietContainerHighest= generateQuietSurfaceColor(containerHighest, onSurface, 4.5);
    // Calculate hotlink colors
    const surfaceHotlink = findHotlinkColor(
      surfaces,
      baseColor.allModes?.['AA-light']?.allShades || [],
      hotlinkStyle === 'blue'
    );

    const containerHotlink = findHotlinkColor(
      containers,
      baseColor.allModes?.['AA-light']?.allShades || [],
      hotlinkStyle === 'blue'
    );

    generateAndSendSurfaceTokens(
      surface, surfaceDim, surfaceBright, container, containerLow,
      containerLowest, containerHigh, containerHighest,
      buttonColor, buttonTextColor, containerButton, containerButtonText, onSurface, onContainers, borderColor, containerBorder, dropColor1, dropColor2, dropColor3, dropColor4, dropColor5,
      quietSurface, quietSurfaceDim, quietSurfaceBright, quietContainer, quietContainerLow, quietContainerLowest, quietContainerHigh, quietContainerHighest, surfaceHotlink.color, containerHotlink.color
    );

      generateAndSendIconTokens(
        baseColor,
        'surface',
        [surface, surfaceDim, surfaceBright, containerLow, containerLowest, containerHigh, containerHighest],
        stateColors,
        activeTheme?.colors.secondary
          ? (isColorData(activeTheme.colors.secondary) ? activeTheme.colors.secondary : { ...baseColor, baseHex: activeTheme.colors.secondary as string })
          : baseColor,
        activeTheme?.colors.tertiary
          ? (isColorData(activeTheme.colors.tertiary) ? activeTheme.colors.tertiary : { ...baseColor, baseHex: activeTheme.colors.tertiary as string })
          : baseColor
      );
      
      generateAndSendIconTokens(
        baseColor,
        'container',
        [container, containerLow, containerLowest, containerHigh, containerHighest],
        stateColors,
        activeTheme?.colors.secondary
          ? (isColorData(activeTheme.colors.secondary) ? activeTheme.colors.secondary : { ...baseColor, baseHex: activeTheme.colors.secondary as string })
          : baseColor,
        activeTheme?.colors.tertiary
          ? (isColorData(activeTheme.colors.tertiary) ? activeTheme.colors.tertiary : { ...baseColor, baseHex: activeTheme.colors.tertiary as string })
          : baseColor
      );

  } 
  else if (style === 'dark-tonal') {
  
    const baseMix = baseColor.allModes?.['AA-light']?.allShades[5]?.hex || baseColor.baseHex;
    const surface = chroma.mix('black', baseMix, 0.07).hex();
    const surfaceDim = chroma.mix(surface, 'black', 0.30).hex();
    const surfaceBright = chroma(surface).brighten(.1).hex();
    const container = surface;
    const containerLow = chroma.mix('black', baseMix, 0.09).hex();
    const containerLowest = chroma.mix('black', baseMix, 0.11).hex();
    const containerHigh = chroma(surface).brighten(.3).hex();
    const containerHighest = chroma(surface).brighten(.4).hex();

    const surfaces = [surface, surfaceDim, surfaceBright];
    const containers = [containerLow, containerLowest, containerHigh, containerHighest];  
      
    const safeAllShades = baseColor.allModes?.['AA-light']?.allShades || [];
    const { buttonColor, buttonTextColor } = findButtonColor(safeAllShades, surfaces);
    const { containerButton, containerButtonText } = findButtonColor(safeAllShades, containers, 'container');
    const onSurface = findTextColor(safeAllShades, surfaces, 4.5);
    const onContainers = findTextColor(safeAllShades, surfaces, 4.5);
    const dropColors = modifyHSL(surface);
    const dropColor1 = dropColors[0];
    const dropColor2 = dropColors[1];
    const dropColor3 = dropColors[2];
    const dropColor4 = dropColors[3];
    const dropColor5 = dropColors[4];
    const quietSurface = generateQuietSurfaceColor(surface, onSurface, 4.5);
    const quietSurfaceDim = generateQuietSurfaceColor(surfaceDim, onSurface, 4.5);
    const quietSurfaceBright = generateQuietSurfaceColor(surfaceBright, onSurface, 4.5);
    const quietContainer = generateQuietSurfaceColor(surface, onSurface, 4.5);
    const quietContainerLow = generateQuietSurfaceColor(containerLow, onSurface, 4.5);
    const quietContainerLowest = generateQuietSurfaceColor(containerLowest, onSurface, 4.5);
    const quietContainerHigh = generateQuietSurfaceColor(containerHigh, onSurface, 4.5);
    const quietContainerHighest = generateQuietSurfaceColor(containerHighest, onSurface, 4.5);
    const borderColor = findBorderColor(baseColor.baseHex, surfaces, 3.1);
    const containerBorder = findBorderColor(baseColor.baseHex, containers, 3.1);
    // Calculate hotlink colors
    const surfaceHotlink = findHotlinkColor(
      surfaces,
      baseColor.allModes?.['AA-light']?.allShades || [],
      hotlinkStyle === 'blue'
    );

    const containerHotlink = findHotlinkColor(
      containers,
      baseColor.allModes?.['AA-light']?.allShades || [],
      hotlinkStyle === 'blue'
    );
    generateAndSendSurfaceTokens(surface, surfaceDim, surfaceBright, container, containerLow,
      containerLowest, containerHigh, containerHighest,
      buttonColor, buttonTextColor, containerButton, containerButtonText, onSurface, onContainers, borderColor, containerBorder, dropColor1, dropColor2, dropColor3, dropColor4, dropColor5,quietSurface, quietSurfaceDim, quietSurfaceBright, quietContainer, quietContainerLow, quietContainerLowest, quietContainerHigh, quietContainerHighest, surfaceHotlink.color, containerHotlink.color);

      generateAndSendIconTokens(
        baseColor,
        'surface',
        [surface, surfaceDim, surfaceBright, containerLow, containerLowest, containerHigh, containerHighest],
        stateColors,
        activeTheme?.colors.secondary
          ? (isColorData(activeTheme.colors.secondary) ? activeTheme.colors.secondary : { ...baseColor, baseHex: activeTheme.colors.secondary as string })
          : baseColor,
        activeTheme?.colors.tertiary
          ? (isColorData(activeTheme.colors.tertiary) ? activeTheme.colors.tertiary : { ...baseColor, baseHex: activeTheme.colors.tertiary as string })
          : baseColor
      );
      
      generateAndSendIconTokens(
        baseColor,
        'container',
        [container, containerLow, containerLowest, containerHigh, containerHighest],
        stateColors,
        activeTheme?.colors.secondary
          ? (isColorData(activeTheme.colors.secondary) ? activeTheme.colors.secondary : { ...baseColor, baseHex: activeTheme.colors.secondary as string })
          : baseColor,
        activeTheme?.colors.tertiary
          ? (isColorData(activeTheme.colors.tertiary) ? activeTheme.colors.tertiary : { ...baseColor, baseHex: activeTheme.colors.tertiary as string })
          : baseColor
      );
   
  }
  else if (style === 'colorful-tonal') {
    
    const baseMix = baseColor.baseHex;
    const baseLuminance = chroma(baseMix).luminance();
    const lighten1 = baseLuminance >= 0.5 ? 0.08 : 0.06;
    const lighten2 = baseLuminance >= 0.5 ? 0.11 : 0.09;

    const surface = baseMix;
    const surfaceDim = chroma.mix(surface, 'black', 0.08).hex();
    const surfaceBright = chroma(baseMix).brighten(.1).hex();
    const container = surface;
    const containerLow = chroma.mix(surface, 'black', 0.04, 'rgb').hex();
    const containerLowest = chroma.mix(surface, 'black', 0.07, 'rgb').hex();
    const containerHigh = chroma.mix(surface, 'white', lighten1, 'rgb').hex();
    const containerHighest = chroma.mix(surface, 'white', lighten2, 'rgb').hex();
    const safeAllShades = baseColor.allModes?.['AA-light']?.allShades || [];
    const surfaces = [surface, surfaceDim, surfaceBright];
    const containers = [containerLow, containerLowest, containerHigh, containerHighest];  
    const onSurface = findTextColor(safeAllShades, surfaces, 4.5);
    const onContainers = findTextColor(safeAllShades, surfaces, 4.5);

    const { buttonColor, buttonTextColor } = findButtonColor(safeAllShades, surfaces);
    const { containerButton, containerButtonText } = findButtonColor(safeAllShades, containers, 'container');

    const dropColors = modifyHSL(surface);
    const dropColor1 = dropColors[0];
    const dropColor2 = dropColors[1];
    const dropColor3 = dropColors[2];
    const dropColor4 = dropColors[3];
    const dropColor5 = dropColors[4];
    const quietSurface = generateQuietSurfaceColor(surface, onSurface, 4.5);
    const quietSurfaceDim = generateQuietSurfaceColor(surfaceDim, onSurface, 4.5);
    const quietSurfaceBright = generateQuietSurfaceColor(surfaceBright, onSurface, 4.5);
    const quietContainer = generateQuietSurfaceColor(surface, onSurface, 4.5);
    const quietContainerLow = generateQuietSurfaceColor(containerLow, onSurface, 4.5);
    const quietContainerLowest = generateQuietSurfaceColor(containerLowest, onSurface, 4.5);
    const quietContainerHigh = generateQuietSurfaceColor(containerHigh, onSurface, 4.5);
    const quietContainerHighest = generateQuietSurfaceColor(containerHighest, onSurface, 4.5);
    const borderColor = findBorderColor(baseColor.baseHex, surfaces, 3.1);
    const containerBorder = findBorderColor(baseColor.baseHex, surfaces, 3.1);
    // Calculate hotlink colors
    const surfaceHotlink = findHotlinkColor(
      surfaces,
      baseColor.allModes?.['AA-light']?.allShades || [],
      hotlinkStyle === 'blue'
    );

    const containerHotlink = findHotlinkColor(
      containers,
      baseColor.allModes?.['AA-light']?.allShades || [],
      hotlinkStyle === 'blue'
    );
      generateAndSendSurfaceTokens(
        surface, surfaceDim, surfaceBright, container, containerLow,
        containerLowest, containerHigh, containerHighest,
        buttonColor, buttonTextColor, containerButton, containerButtonText, onSurface, onContainers, borderColor, containerBorder, dropColor1, dropColor2, dropColor3, dropColor4, dropColor5,
        quietSurface, quietSurfaceDim, quietSurfaceBright, quietContainer, quietContainerLow, quietContainerLowest, quietContainerHigh, quietContainerHighest, surfaceHotlink.color, containerHotlink.color
      );
      generateAndSendIconTokens(
        baseColor,
        'surface',
        [surface, surfaceDim, surfaceBright, containerLow, containerLowest, containerHigh, containerHighest],
        stateColors,
        activeTheme?.colors.secondary
          ? (isColorData(activeTheme.colors.secondary) ? activeTheme.colors.secondary : { ...baseColor, baseHex: activeTheme.colors.secondary as string })
          : baseColor,
        activeTheme?.colors.tertiary
          ? (isColorData(activeTheme.colors.tertiary) ? activeTheme.colors.tertiary : { ...baseColor, baseHex: activeTheme.colors.tertiary as string })
          : baseColor
      );
      
      generateAndSendIconTokens(
        baseColor,
        'container',
        [container, containerLow, containerLowest, containerHigh, containerHighest],
        stateColors,
        activeTheme?.colors.secondary
          ? (isColorData(activeTheme.colors.secondary) ? activeTheme.colors.secondary : { ...baseColor, baseHex: activeTheme.colors.secondary as string })
          : baseColor,
        activeTheme?.colors.tertiary
          ? (isColorData(activeTheme.colors.tertiary) ? activeTheme.colors.tertiary : { ...baseColor, baseHex: activeTheme.colors.tertiary as string })
          : baseColor
      );

  } else if (style === 'light-professional') {
    
    const surface = '#ffffff';
    const surfaceDim = chroma.mix(surface, 'black', 0.05).hex();
    const surfaceBright = '#ffffff';
    const container = '#ffffff';
    const containerLow = '#ffffff';
    const containerLowest = '#ffffff';
    const containerHigh = '#ffffff';
    const containerHighest = '#ffffff';
    const onSurface = '#121212';
    const onContainers = '#121212';
    const dropColors = modifyHSL(surface);
    const dropColor1 = dropColors[0];
    const dropColor2 = dropColors[1];
    const dropColor3 = dropColors[2];
    const dropColor4 = dropColors[3];
    const dropColor5 = dropColors[4];
    const surfaces = [surface, surfaceDim, surfaceBright];
    const containers = [containerLow, containerLowest, containerHigh, containerHighest];  
    const safeAllShades = baseColor.allModes?.['AA-light']?.allShades || [];
    const { buttonColor, buttonTextColor } = findButtonColor(safeAllShades, surfaces);
    const { containerButton, containerButtonText } = findButtonColor(safeAllShades, containers, 'container');
    const quietSurface = generateQuietSurfaceColor(surface, onSurface, 4.5);
    const quietSurfaceDim = generateQuietSurfaceColor(surfaceDim, onSurface, 4.5);
    const quietSurfaceBright = generateQuietSurfaceColor(surfaceBright, onSurface, 4.5);
    const quietContainer = generateQuietSurfaceColor(surface, onSurface, 4.5);
    const quietContainerLow = generateQuietSurfaceColor(containerLow, onSurface, 4.5);
    const quietContainerLowest = generateQuietSurfaceColor(containerLowest, onSurface, 4.5);
    const quietContainerHigh = generateQuietSurfaceColor(containerHigh, onSurface, 4.5);
    const quietContainerHighest = generateQuietSurfaceColor(containerHighest, onSurface, 4.5);
    const borderColor = findBorderColor(baseColor.baseHex, surfaces, 3.1);
    const containerBorder = findBorderColor(baseColor.baseHex, surfaces, 3.1);
    const surfaceHotlink = findHotlinkColor(
      surfaces,
      baseColor.allModes?.['AA-light']?.allShades || [],
      hotlinkStyle === 'blue'
    );

    const containerHotlink = findHotlinkColor(
      containers,
      baseColor.allModes?.['AA-light']?.allShades || [],
      hotlinkStyle === 'blue'
    );
    generateAndSendSurfaceTokens(
      surface, surfaceDim, surfaceBright, container, containerLow,
      containerLowest, containerHigh, containerHighest,
      buttonColor, buttonTextColor, containerButton, containerButtonText, onSurface, onContainers, borderColor, containerBorder, dropColor1, dropColor2, dropColor3, dropColor4, dropColor5,
      quietSurface, quietSurfaceDim, quietSurfaceBright, quietContainer, quietContainerLow, quietContainerLowest, quietContainerHigh, quietContainerHighest, surfaceHotlink.color, containerHotlink.color
    );

      generateAndSendIconTokens(
        baseColor,
        'surface',
        [surface, surfaceDim, surfaceBright, containerLow, containerLowest, containerHigh, containerHighest],
        stateColors,
        activeTheme?.colors.secondary
          ? (isColorData(activeTheme.colors.secondary) ? activeTheme.colors.secondary : { ...baseColor, baseHex: activeTheme.colors.secondary as string })
          : baseColor,
        activeTheme?.colors.tertiary
          ? (isColorData(activeTheme.colors.tertiary) ? activeTheme.colors.tertiary : { ...baseColor, baseHex: activeTheme.colors.tertiary as string })
          : baseColor
      );
      
      generateAndSendIconTokens(
        baseColor,
        'container',
        [container, containerLow, containerLowest, containerHigh, containerHighest],
        stateColors,
        activeTheme?.colors.secondary
          ? (isColorData(activeTheme.colors.secondary) ? activeTheme.colors.secondary : { ...baseColor, baseHex: activeTheme.colors.secondary as string })
          : baseColor,
        activeTheme?.colors.tertiary
          ? (isColorData(activeTheme.colors.tertiary) ? activeTheme.colors.tertiary : { ...baseColor, baseHex: activeTheme.colors.tertiary as string })
          : baseColor
      );
  } else if (style === 'grey-professional') {
   
    const baseMix = baseColor.allModes?.['AA-light']?.allShades[5]?.hex || baseColor.baseHex;
    const surface = chroma.mix('white', baseMix, 0.03, 'rgb').desaturate(2).hex();
    const surfaceDim = chroma.mix(surface, 'black', 0.05).hex();
    const surfaceBright = '#ffffff';
    const container = '#ffffff';
    const containerLow = chroma.mix(surface, 'black', 0.05).hex();
    const containerLowest = chroma.mix(surface, 'black', 0.07).hex();
    const containerHigh = '#ffffff';
    const containerHighest = '#ffffff';
    const onSurface = '#121212';
    const onContainers = '#121212';
    const dropColors = modifyHSL(surface);
    const dropColor1 = dropColors[0];
    const dropColor2 = dropColors[1];
    const dropColor3 = dropColors[2];
    const dropColor4 = dropColors[3];
    const dropColor5 = dropColors[4];
    const surfaces = [surface, surfaceDim, surfaceBright];
    const containers = [containerLow, containerLowest, containerHigh, containerHighest];  
    const safeAllShades = baseColor.allModes?.['AA-light']?.allShades || [];
    const { buttonColor, buttonTextColor } = findButtonColor(safeAllShades, surfaces);
    const { containerButton, containerButtonText } = findButtonColor(safeAllShades, containers, 'container');
    const quietSurface = generateQuietSurfaceColor(surface, onSurface, 4.5);
    const quietSurfaceDim = generateQuietSurfaceColor(surfaceDim, onSurface, 4.5);
    const quietSurfaceBright = generateQuietSurfaceColor(surfaceBright, onSurface, 4.5);
    const quietContainer= generateQuietSurfaceColor(surface, onSurface, 4.5);
    const quietContainerLow = generateQuietSurfaceColor(containerLow, onSurface, 4.5);
    const quietContainerLowest = generateQuietSurfaceColor(containerLowest, onSurface, 4.5);
    const quietContainerHigh = generateQuietSurfaceColor(containerHigh, onSurface, 4.5);
    const quietContainerHighest = generateQuietSurfaceColor(containerHighest, onSurface, 4.5);
    const borderColor = findBorderColor('#000000', surfaces, 3.1);
    const containerBorder = findBorderColor('#000000', surfaces, 3.1);
    const surfaceHotlink = findHotlinkColor(
      surfaces,
      baseColor.allModes?.['AA-light']?.allShades || [],
      hotlinkStyle === 'blue'
    );

    const containerHotlink = findHotlinkColor(
      containers,
      baseColor.allModes?.['AA-light']?.allShades || [],
      hotlinkStyle === 'blue'
    );
    generateAndSendSurfaceTokens(
      surface, surfaceDim, surfaceBright, container, containerLow,
      containerLowest, containerHigh, containerHighest,
      buttonColor, buttonTextColor, containerButton, containerButtonText, onSurface, onContainers, borderColor, containerBorder, dropColor1, dropColor2, dropColor3, dropColor4, dropColor5,
      quietSurface, quietSurfaceDim, quietSurfaceBright, quietContainer, quietContainerLow, quietContainerLowest, quietContainerHigh, quietContainerHighest, surfaceHotlink.color, containerHotlink.color
    );
      generateAndSendIconTokens(
        baseColor,
        'surface',
        [surface, surfaceDim, surfaceBright, containerLow, containerLowest, containerHigh, containerHighest],
        stateColors,
        activeTheme?.colors.secondary
          ? (isColorData(activeTheme.colors.secondary) ? activeTheme.colors.secondary : { ...baseColor, baseHex: activeTheme.colors.secondary as string })
          : baseColor,
        activeTheme?.colors.tertiary
          ? (isColorData(activeTheme.colors.tertiary) ? activeTheme.colors.tertiary : { ...baseColor, baseHex: activeTheme.colors.tertiary as string })
          : baseColor
      );
      
      generateAndSendIconTokens(
        baseColor,
        'container',
        [container, containerLow, containerLowest, containerHigh, containerHighest],
        stateColors,
        activeTheme?.colors.secondary
          ? (isColorData(activeTheme.colors.secondary) ? activeTheme.colors.secondary : { ...baseColor, baseHex: activeTheme.colors.secondary as string })
          : baseColor,
        activeTheme?.colors.tertiary
          ? (isColorData(activeTheme.colors.tertiary) ? activeTheme.colors.tertiary : { ...baseColor, baseHex: activeTheme.colors.tertiary as string })
          : baseColor
      );
   } else if (style === 'dark-professional') {
   
    const surface = '#121212';
    const surfaceDim = chroma.mix(surface, 'black', 0.30).hex();
    const surfaceBright = chroma(surface).brighten(.1).hex();
    const container = '#ffffff'
    const containerLow = '#ffffff'
    const containerLowest = '#ffffff'
    const containerHigh = '#ffffff'
    const containerHighest = '#ffffff'
    const onSurface = '#fafafa'
    const onContainers = '#121212'
    const dropColors = modifyHSL(surface);
    const dropColor1 = dropColors[0];
    const dropColor2 = dropColors[1];
    const dropColor3 = dropColors[2];
    const dropColor4 = dropColors[3];
    const dropColor5 = dropColors[4];
    const quietSurface = generateQuietSurfaceColor(surface, onSurface, 4.5);
    const quietSurfaceDim = generateQuietSurfaceColor(surfaceDim, onSurface, 4.5);
    const quietSurfaceBright = generateQuietSurfaceColor(surfaceBright, onSurface, 4.5);
    const quietContainer = generateQuietSurfaceColor(surface, onSurface, 4.5);
    const quietContainerLow = generateQuietSurfaceColor(containerLow, onSurface, 4.5);
    const quietContainerLowest = generateQuietSurfaceColor(containerLowest, onSurface, 4.5);
    const quietContainerHigh = generateQuietSurfaceColor(containerHigh, onSurface, 4.5);
    const quietContainerHighest = generateQuietSurfaceColor(containerHighest, onSurface, 4.5);
    const surfaces = [surface, surfaceDim, surfaceBright];
    const containers = [containerLow, containerLowest, containerHigh, containerHighest];  
    const safeAllShades = baseColor.allModes?.['AA-light']?.allShades || [];
    const { buttonColor, buttonTextColor } = findButtonColor(safeAllShades, surfaces);
    const { containerButton, containerButtonText } = findButtonColor(safeAllShades, containers, 'container');
    const borderColor = findBorderColor('#ffffff', surfaces, 3.1);
    const containerBorder = findBorderColor('#000000', surfaces, 3.1);
    const surfaceHotlink = findHotlinkColor(
      surfaces,
      baseColor.allModes?.['AA-light']?.allShades || [],
      hotlinkStyle === 'blue'
    );

    const containerHotlink = findHotlinkColor(
      containers,
      baseColor.allModes?.['AA-light']?.allShades || [],
      hotlinkStyle === 'blue'
    );
    generateAndSendSurfaceTokens(
      surface, surfaceDim, surfaceBright, container, containerLow,
      containerLowest, containerHigh, containerHighest,
      buttonColor, buttonTextColor, containerButton, containerButtonText, onSurface, onContainers, borderColor, containerBorder, dropColor1, dropColor2, dropColor3, dropColor4, dropColor5,
      quietSurface, quietSurfaceDim, quietSurfaceBright, quietContainer, quietContainerLow, quietContainerLowest, quietContainerHigh, quietContainerHighest, surfaceHotlink.color, containerHotlink.color
    );

      generateAndSendIconTokens(
        baseColor,
        'surface',
        [surface, surfaceDim, surfaceBright, containerLow, containerLowest, containerHigh, containerHighest],
        stateColors,
        activeTheme?.colors.secondary
          ? (isColorData(activeTheme.colors.secondary) ? activeTheme.colors.secondary : { ...baseColor, baseHex: activeTheme.colors.secondary as string })
          : baseColor,
        activeTheme?.colors.tertiary
          ? (isColorData(activeTheme.colors.tertiary) ? activeTheme.colors.tertiary : { ...baseColor, baseHex: activeTheme.colors.tertiary as string })
          : baseColor
      );
      
      generateAndSendIconTokens(
        baseColor,
        'container',
        [container, containerLow, containerLowest, containerHigh, containerHighest],
        stateColors,
        activeTheme?.colors.secondary
          ? (isColorData(activeTheme.colors.secondary) ? activeTheme.colors.secondary : { ...baseColor, baseHex: activeTheme.colors.secondary as string })
          : baseColor,
        activeTheme?.colors.tertiary
          ? (isColorData(activeTheme.colors.tertiary) ? activeTheme.colors.tertiary : { ...baseColor, baseHex: activeTheme.colors.tertiary as string })
          : baseColor
      );
    
  }
  updateShadowVariables();

  
}, [baseColor, findButtonColor, findTextColor, fullColorData, activeTheme]);

  // Navigation handler
  const handleBack = () => {
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
    setCurrentRoute({
      id: 'home',
      title: 'Design System',
      path: '/',
      icon: Home
    });
<<<<<<< HEAD
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
=======
  };

  // Monitor button shape status
  useEffect(() => {
    console.log('Button shape state changed:', {
      buttonShape,
      hasButtonShape,
      surfaceStyle,
      activeTheme,
      isProcessing,
      baseColor: baseColor?.baseHex
    });

    // Check if all required conditions are met
    const isThemeGenerated =
      hasButtonShape &&
      surfaceStyle !== undefined &&
      activeTheme !== null &&
      baseColor?.baseHex &&
      isProcessing;

    if (isThemeGenerated && onThemeComplete && baseColor) {
      console.log('Triggering onThemeComplete with baseColor:', baseColor.baseHex);
      onThemeComplete(baseColor.baseHex);
    }
  }, [buttonShape, hasButtonShape, surfaceStyle, activeTheme, onThemeComplete, isProcessing, baseColor]);

  const handleButtonShapeChange = (shape: ButtonShape) => {
    console.log('Button shape change initiated:', shape);
    
    const borderRadiusMap: Record<ButtonShape, number> = {
      'gently-rounded': 8,
      'amply-rounded': 16,
      'boldly-rounded': 32,
      'square': 0
    };

    const borderRadius = borderRadiusMap[shape];

    // Update Figma
    window.parent.postMessage({
      pluginMessage: {
        type: 'update-design-token',
        collection: 'System-Styles',
        variable: 'Button-border-radius',
        value: borderRadius
      }
    }, '*');

    // Update state
    setButtonShape(shape);
    setHasButtonShape(true);
    
    console.log('Button shape updated:', {
      shape,
      hasButtonShape: true,
      borderRadius
    });
  };

  useEffect(() => {
    if (themes.length > 0 && !activeTheme && themeAnalysis.length > 0) {
      const validTheme = themeAnalysis.find(t => t.isValid)?.theme;
      if (validTheme) {
        handleThemeSelect(validTheme);
      }
    }
  }, [themes, themeAnalysis, baseColor, harmonies]);

  // Add handleThemeSelect to deps array and useCallback
  const handleThemeSelect = useCallback((theme: Theme) => {
    if (!baseColor || !harmonies) return;
  
    const harmonyType = theme.type === 'split-complementary' ? 'splitComplementary' : theme.type;
    const harmonyColors = harmonies[harmonyType as keyof typeof harmonies];
  
    if (harmonyColors) {
      const findColorInPalette = (hex: string) => {
        const color = safeColors.find(color => color.baseHex === hex);
        console.log(`Found color ${hex} in palette:`, color?.allModes?.['AA-light']?.allShades);
        return color;
      };
  
      const secondaryColorFromPalette = findColorInPalette(harmonyColors.secondary.baseHex);
      const tertiaryColorFromPalette = findColorInPalette(harmonyColors.tertiary.baseHex);
  
      if (secondaryColorFromPalette) {
        const normalizedSecondary = {
          ...secondaryColorFromPalette,
          shadeIndex: typeof secondaryColorFromPalette.shadeIndex === 'string' 
            ? parseInt(secondaryColorFromPalette.shadeIndex, 10) 
            : secondaryColorFromPalette.shadeIndex,
          allModes: secondaryColorFromPalette.allModes || {
            'AA-light': { allShades: [] },
            'AA-dark': { allShades: [] },
            'AAA-light': { allShades: [] },
            'AAA-dark': { allShades: [] }
          }
        };
        setSecondaryColor(normalizedSecondary);
      }
  
      if (tertiaryColorFromPalette) {
        const normalizedTertiary = {
          ...tertiaryColorFromPalette,
          shadeIndex: typeof tertiaryColorFromPalette.shadeIndex === 'string' 
            ? parseInt(tertiaryColorFromPalette.shadeIndex, 10) 
            : tertiaryColorFromPalette.shadeIndex,
          allModes: tertiaryColorFromPalette.allModes || {
            'AA-light': { allShades: [] },
            'AA-dark': { allShades: [] },
            'AAA-light': { allShades: [] },
            'AAA-dark': { allShades: [] }
          }
        };
        setTertiaryColor(normalizedTertiary);
      }
  
      setBaseColor(baseColor);
      setSelectedTheme(theme);
      setActiveTheme(theme);
    }

    
  }, [baseColor, harmonies, safeColors]);

  

  // Transform safeColors to hex strings for the modal
  const modalColors = useMemo(() => 
    safeColors.map(colorData => colorData.baseHex),
    [safeColors]
  );

  // Add this to your handlers section
  const handleBaseColorSelect = useCallback((colorData: ColorData) => {
    console.log('--- Base Color Selection ---');
    console.log('New base color:', colorData.baseHex);
    
    // Prevent unnecessary updates if the base color is the same
    if (baseColor?.baseHex === colorData.baseHex) return;
  
    // Update base color
    setBaseColor(colorData);
  }, [baseColor]);

    // Add this effect to handle surface updates when theme changes
    useEffect(() => {
      if (activeTheme) {
        handleSurfaceStyleChange(surfaceStyle);
      }
    }, [activeTheme, surfaceStyle]);
  
  // Custom color handlers using hex strings
  const handleCustomColorSelect = (color: string) => {
    if (!customColors.includes(color)) {
      const newCustomColors = [...customColors, color].slice(0, 3);
      setCustomColors(newCustomColors);
      
      const customThemeColors: ColorSet = {
        primary: newCustomColors[0] || '',
        secondary: newCustomColors[1] || '',
        tertiary: newCustomColors[2] || ''
      };
  
      const newCustomTheme: Theme = {
        name: 'Custom',
        colors: customThemeColors,
        type: 'custom'
      };
  
      setCustomTheme(newCustomTheme);
      
      // Only activate the theme if we have all three colors
      if (newCustomColors.length === 3) {
        setActiveTheme(newCustomTheme);
        setSelectedTheme(newCustomTheme);
        
        // Update Figma with the new theme colors
        Object.entries(customThemeColors).forEach(([position, color]) => {
          window.parent.postMessage({
            pluginMessage: {
              type: 'update-design-token',
              collection: 'System-Colors',
              variable: `${position}-color`,
              value: color
            }
          }, '*');
        });
      }
    }
  };
  
  const handleRemoveCustomColor = (colorToRemove: string) => {
    const newCustomColors = customColors.filter(color => color !== colorToRemove);
    setCustomColors(newCustomColors);
  
    if (newCustomColors.length > 0) {
      const customThemeColors: ColorSet = {
        primary: newCustomColors[0] || '',
        secondary: newCustomColors[1] || '',
        tertiary: newCustomColors[2] || ''
      };
  
      const updatedCustomTheme: Theme = {
        name: 'Custom Theme',
        colors: customThemeColors,
        type: 'custom'
      };
  
      setCustomTheme(updatedCustomTheme);
      if (activeTheme?.type === 'custom') {
        setActiveTheme(updatedCustomTheme);
      }
      setSelectedTheme(updatedCustomTheme);
    } else {
      setCustomTheme(null);
      if (activeTheme?.type === 'custom') {
        setActiveTheme(null);
      }
      setSelectedTheme(null);
    }
  };
  
  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
    e.dataTransfer.setData('text/plain', index.toString());
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '0.5';
      e.target.style.outline = '2px solid white';
      e.target.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
    }
<<<<<<< HEAD
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
=======
  };
  
  const handleDragEnd = (e: React.DragEvent) => {
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '';
      e.target.style.outline = '';
      e.target.style.boxShadow = '';
    }
<<<<<<< HEAD
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
=======
  };
  
  const handleDragOver = (e: React.DragEvent) => {
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
    e.preventDefault();
    if (e.target instanceof HTMLElement) {
      e.target.style.outline = '2px solid white';
      e.target.style.outlineOffset = '2px';
    }
<<<<<<< HEAD
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
=======
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
    if (e.target instanceof HTMLElement) {
      e.target.style.outline = '';
      e.target.style.outlineOffset = '';
    }
<<<<<<< HEAD
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
=======
  };
  
 // Update handleDrop for drag and drop functionality
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    
    if (!activeTheme || dragIndex === dropIndex) return;

    const colors = Object.entries(activeTheme.colors)
      .filter(([_, value]) => value !== undefined)
      .map(([_, color]) => isColorData(color) ? color.baseHex : color);

    const draggedColor = colors[dragIndex];
    const newColors = [...colors];
    newColors.splice(dragIndex, 1);
    newColors.splice(dropIndex, 0, draggedColor);

    const newThemeColors: ColorSet = {
      primary: newColors[0] || '',
      secondary: newColors[1] || '',
      tertiary: newColors[2] || ''
    };

    const updatedTheme: Theme = {
      ...activeTheme,
      colors: newThemeColors
    };

    setActiveTheme(updatedTheme);
    if (activeTheme.type === 'custom') {
      setCustomTheme(updatedTheme);
      setCustomColors(newColors);
    }
    setSelectedTheme(updatedTheme);

    Object.entries(newThemeColors).forEach(([position, color]) => {
      const colorHex = isColorData(color) ? color.baseHex : color;
      window.parent.postMessage({
        pluginMessage: {
          type: 'update-design-token',
          collection: 'System-Colors',
          variable: `${position}-color`,
          value: colorHex
        }
      }, '*');
    });

    if (e.target instanceof HTMLElement) {
      e.target.style.outline = '';
      e.target.style.outlineOffset = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
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
        {safeColors
          .filter(colorData => !colorData.id.startsWith('default-'))
          .map((colorData) => {
            // Normalize the color data to ensure correct types
            const normalizedColorData: ColorData = {
              ...colorData,
              shadeIndex: typeof colorData.shadeIndex === 'string' 
                ? parseInt(colorData.shadeIndex, 10) 
                : colorData.shadeIndex,
              allModes: colorData.allModes || {
                'AA-light': { allShades: [] },
                'AA-dark': { allShades: [] },
                'AAA-light': { allShades: [] },
                'AAA-dark': { allShades: [] }
              }
            };
            
            return (
              <button
                key={normalizedColorData.id}
                onClick={() => handleBaseColorSelect(normalizedColorData)}
                className={`group relative aspect-square rounded-xl transition-transform hover:scale-105 ${
                  baseColor?.baseHex === normalizedColorData.baseHex 
                    ? 'ring-2 ring-purple-500' 
                    : ''
                }`}
              >
                <div
                  className="w-full h-full rounded-xl"
                  style={{ backgroundColor: normalizedColorData.baseHex }}
                  title={normalizedColorData.name}
                />
              </button>
            );
          })}
      </div>
    </div>

    {/* Available Themes */}
    <div>
      <h3 className="text-lg font-medium mb-4">Available Themes:</h3>
      <div className="grid grid-cols-2 gap-3">
        {themeAnalysis.map(({ theme, isValid, reason }) => {
          const isCustom = theme.type === 'custom';
          const hasAllCustomColors = isCustom && 
            customColors.length === 3 && 
            customColors.every(color => color !== '');
          const isClickable = (isCustom && hasAllCustomColors) || (!isCustom && isValid);
          
          return (
            <div
              key={`${theme.name}-${theme.type}`}
              onClick={() => isClickable && handleThemeSelect(theme)}
              className={`p-4 rounded-xl transition-all flex flex-col h-[160px] relative ${
                activeTheme?.name === theme.name
                  ? 'bg-purple-50 border-2 border-purple-500'
                  : isClickable
                    ? 'border border-gray-200 hover:border-purple-200 cursor-pointer'
                    : 'border border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="mb-3 flex justify-between items-center">
                <h4 className="text-base font-medium">{theme.name}</h4>
                {isCustom && (
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
                {isCustom ? (
                  // Custom theme color swatches
                  <>
                    {customColors.length > 0 ? (
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
                    )}
                  </>
                ) : (
                  // Regular theme color swatches
                  Object.entries(theme.colors).map(([key, color], index) => {
                    const colorHex = typeof color === 'object' ? color.baseHex : color;
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
              <div className="h-6 flex items-center justify-center">
                {!isValid && !isCustom && (
                  <span className="text-xs text-gray-500">
                    {reason === 'duplicate' ? 'Has duplicate colors' : 'Combo already exists'}
                  </span>
                )}
                {isCustom && (
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
  </div>
</CollapsiblePanel>

          {/* Active Theme Colors */}
          {activeTheme && (
            <CollapsiblePanel title="Active Theme Colors">
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Harmony: {activeTheme.name}</span>
                </div>

                <div className="space-y-3">
                  {Object.entries(activeTheme.colors).map(([position, color], index) => (
                    <div key={position} className="flex items-center gap-3">
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        className="w-24 h-12 rounded-lg cursor-move"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-medium capitalize">{position}</span>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-gray-500">
                  Drag and drop colors to change their classified levels.
                </p>
              </div>
            </CollapsiblePanel>
          )}

          {/* Surface Styling */}
          <CollapsiblePanel title="Surface Styling">
            <div className="space-y-6">
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
            <div>
              <h3 className="text-lg font-medium mb-3">Tonal</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
<<<<<<< HEAD
                  onClick={createSurfaceStyleHandler('light-tonal')}
                  className={`px-6 py-3 rounded-xl ${
                    surfaceStyle === 'light-tonal' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
=======
                  onClick={() => {
                    setSurfaceStyle('light-tonal');
                    handleSurfaceStyleChange('light-tonal');
                  }}
                  className={`px-6 py-3 rounded-xl ${
                    surfaceStyle === 'light-tonal' 
                      ? 'bg-purple-50 border-2 border-purple-500' 
                      : 'border border-gray-200'
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
                  }`}
                >
                  Light Tonal
                </button>
                <button
<<<<<<< HEAD
                  onClick={createSurfaceStyleHandler('colorful-tonal')}
                  className={`px-6 py-3 rounded-xl ${
                    surfaceStyle === 'colorful-tonal' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
=======
                  onClick={() => {
                    setSurfaceStyle('colorful-tonal');
                    handleSurfaceStyleChange('colorful-tonal');
                  }}
                  className={`px-6 py-3 rounded-xl ${
                    surfaceStyle === 'colorful-tonal' 
                      ? 'bg-purple-50 border-2 border-purple-500' 
                      : 'border border-gray-200'
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
                  }`}
                >
                  Colorful Tonal
                </button>
                <button
<<<<<<< HEAD
                  onClick={createSurfaceStyleHandler('dark-tonal')}
                  className={`px-6 py-3 rounded-xl ${
                    surfaceStyle === 'dark-tonal' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
=======
                  onClick={() => {
                    setSurfaceStyle('dark-tonal');
                    handleSurfaceStyleChange('dark-tonal');
                  }}
                  className={`px-6 py-3 rounded-xl ${
                    surfaceStyle === 'dark-tonal' 
                      ? 'bg-purple-50 border-2 border-purple-500' 
                      : 'border border-gray-200'
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
                  }`}
                >
                  Dark Tonal
                </button>
              </div>
            </div>
<<<<<<< HEAD

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
=======
              <div>
                <h3 className="text-lg font-medium mb-3">Corporate</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSurfaceStyle('light-professional')}
                    className={`px-6 py-3 rounded-xl ${
                      surfaceStyle === 'light-professional' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                    }`}
                  >
                    Light Professional
                  </button>
                  <button
                    onClick={() => setSurfaceStyle('grey-professional')}
                    className={`px-6 py-3 rounded-xl ${
                      surfaceStyle === 'grey-professional' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                    }`}
                  >
                    Grey Professional
                  </button>
                  <button
                    onClick={() => setSurfaceStyle('dark-professional')}
                    className={`px-6 py-3 rounded-xl ${
                      surfaceStyle === 'dark-professional' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                    }`}
                  >
                    Dark Professional
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Modern</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSurfaceStyle('light-glow')}
                    className={`px-6 py-3 rounded-xl ${
                      surfaceStyle === 'light-glow' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                    }`}
                  >
                    Light Glow
                  </button>
                  <button
                    onClick={() => setSurfaceStyle('dark-glow')}
                    className={`px-6 py-3 rounded-xl ${
                      surfaceStyle === 'dark-glow' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                    }`}
                  >
                    Dark Glow
                  </button>
                </div>
              </div>
            </div>
          </CollapsiblePanel>
          {/* Button Shape Panel */}
          <CollapsiblePanel title="Button Shape">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleButtonShapeChange('gently-rounded')}
                className={`px-6 py-3 rounded-xl ${
                  buttonShape === 'gently-rounded' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                Gently Rounded
              </button>
              <button
                onClick={() => handleButtonShapeChange('amply-rounded')}
                className={`px-6 py-3 rounded-xl ${
                  buttonShape === 'amply-rounded' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                Amply Rounded
              </button>
              <button
                onClick={() => handleButtonShapeChange('boldly-rounded')}
                className={`px-6 py-3 rounded-xl ${
                  buttonShape === 'boldly-rounded' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                Boldly Rounded
              </button>
              <button
                onClick={() => handleButtonShapeChange('square')}
                className={`px-6 py-3 rounded-xl ${
                  buttonShape === 'square' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                Square
              </button>
            </div>
          </CollapsiblePanel>
          {/* Add Hotlink Coloring panel */}
          <CollapsiblePanel title="Hotlink Coloring">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setHotlinkStyle('tonal')}
                  className={`px-6 py-3 rounded-xl ${
                    hotlinkStyle === 'tonal' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                  }`}
                >
                  Tonal
                </button>
                <button
                  onClick={() => setHotlinkStyle('blue')}
                  className={`px-6 py-3 rounded-xl ${
                    hotlinkStyle === 'blue' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                  }`}
                >
                  Blue
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Note: the design system will default to black or white if unable to find a hotlink color with the required contrast.
              </p>
            </div>
          </CollapsiblePanel>
          {/* Component Effects */}
          <CollapsiblePanel title="Component Effects">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setComponentEffect('none')}
                className={`px-6 py-3 rounded-xl ${
                  componentEffect === 'none' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                None
              </button>
              <button
                onClick={() => setComponentEffect('bevel')}
                className={`px-6 py-3 rounded-xl ${
                  componentEffect === 'bevel' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                Bevel
              </button>
              <button
                onClick={() => setComponentEffect('ridged')}
                className={`px-6 py-3 rounded-xl ${
                  componentEffect === 'ridged' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                Ridged
              </button>
            </div>
          </CollapsiblePanel>
        </div>
      </div>

      {/* Color Selection Modal */}
      <ColorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableColors={modalColors}
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
        selectedColors={customColors}
        onColorSelect={handleCustomColorSelect}
        onColorRemove={handleRemoveCustomColor}
      />
    </div>
  );
};

export default ThemePage;