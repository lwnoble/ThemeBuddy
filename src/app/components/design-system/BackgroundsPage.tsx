// Import necessary dependencies
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronUp, Box, Home } from 'lucide-react';
import PageLayout from './PageLayout';
import UpdateSystemPanel from './UpdateSystemPanel';
import { useTheme } from '../../../context/ThemeContext';
import { useColors } from '../../../context/ColorContext';
import { useNavigation } from '../../../context/NavigationContext';
import { useBackgrounds } from '../../../context/BackgroundContext';
import { ColorData } from '../../types/colors';
import { BackgroundTheme } from '../../types/backgrounds';
import { processTokens, SurfaceStyle } from '../../utils/styleProcessors';
import { DESIGN_SYSTEM_ROUTES } from '../../constants/routes';
import { isColorData } from '../../utils/tokenHelpers';
import { Mode } from '../../types/modes';
import { backgroundThemeStore } from '../../utils/styleProcessors';


export const BackgroundContextDebug: React.FC = () => {
  const { backgroundStore, getAllBackgrounds, getModeBackgrounds } = useBackgrounds();
  
  useEffect(() => {
    // Log the entire background store
    console.log('Background Context Debug - Full backgroundStore:', backgroundStore);
    
    // Check if we have any backgrounds at all
    const allBackgrounds = getAllBackgrounds();
    console.log('Background Context Debug - All backgrounds:', allBackgrounds);
    
    // Check each mode
    const modes: Mode[] = ['AA-light', 'AAA-light', 'AA-dark', 'AAA-dark'];
    modes.forEach(mode => {
      const modeBackgrounds = getModeBackgrounds(mode);
      console.log(`Background Context Debug - ${mode} backgrounds:`, modeBackgrounds);
    });
    
    // Check the structure of the store
    if (backgroundStore && typeof backgroundStore === 'object') {
      const storeKeys = Object.keys(backgroundStore);
      console.log('Background Context Debug - Store keys:', storeKeys);
      
      storeKeys.forEach(key => {
        console.log(`Background Context Debug - Background group ${key}:`, backgroundStore[key]);
      });
    }
  }, [backgroundStore, getAllBackgrounds, getModeBackgrounds]);
  
  return (
    <div className="p-4 m-4 bg-blue-50 border border-blue-200 rounded-md">
      <h3 className="text-blue-800 font-medium">Background Context Debug</h3>
      <p className="text-blue-700 text-sm mt-2">Check console for detailed logs.</p>
      
      <div className="mt-4 text-xs">
        <p>Background Store Keys: {Object.keys(backgroundStore).join(', ') || 'None'}</p>
        <p>Background Count: {getAllBackgrounds().length}</p>
      </div>
    </div>
  );
};

/**
 * Safely converts any color data to the expected ColorData type
 */
const safeColorData = (color: any): ColorData => {
  if (!color) return {} as ColorData;
  
  // Create a safe copy with proper types
  const safeColor: ColorData = {
    ...color,
    // Convert shadeIndex to number if it's a string
    shadeIndex: typeof color.shadeIndex === 'string' 
      ? parseInt(color.shadeIndex, 10) || 0 
      : (color.shadeIndex || 0)
  };
  
  return safeColor;
};

/**
 * Safely converts an array of color data objects to ColorData[] type
 */
const safeColorDataArray = (colors: any[]): ColorData[] => {
  if (!Array.isArray(colors)) return [];
  
  return colors.map(color => safeColorData(color));
};

// Type definition for Background Sections
type BackgroundSection = {
  id: string;
  title: string;
  type: 'info' | 'colorSelector' | 'neutralSelector';
  description?: string;
  links?: Array<{
    text: string;
    route: string;
  }>;
  colorGroup?: 'primary' | 'secondary' | 'tertiary' | 'neutral';
  disabledShade?: string;
};

// Main BackgroundsPage Component
export const BackgroundsPage: React.FC = () => {
  const { themeState } = useTheme();
  const { fullColorData } = useColors();
  const { setCurrentRoute } = useNavigation();
  const { getBackgroundById, getModeBackgrounds } = useBackgrounds();
  const { syncWithProcessorStore } = useBackgrounds();
  

  useEffect(() => {
    // Sync with the background store from the style processors
    syncWithProcessorStore();
  }, [syncWithProcessorStore]);


  // State for Modes and Sections
  const modes = ['AA-light', 'AAA-light', 'AA-dark', 'AAA-dark'];
  const [activeMode, setActiveMode] = useState<Mode>('AA-light');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  
  // Update Panel State
  const [isUpdatePanelOpen, setIsUpdatePanelOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<{
    sectionId: string;
    colorData: ColorData;
  } | null>(null);

  // Get background themes for the active mode
  const backgroundThemes = useMemo(() => {
    return getModeBackgrounds(activeMode);
  }, [getModeBackgrounds, activeMode]);

  // Get specific background theme by ID for the current mode
  const getBackground = useCallback((id: string): BackgroundTheme | undefined => {
    return getBackgroundById(id, activeMode);
  }, [getBackgroundById, activeMode]);

  useEffect(() => {
    // Log existing information
    console.log('BackgroundsPage - Full Color Data:', fullColorData);
    console.log('BackgroundsPage - Color Data Length:', fullColorData?.length || 0);
    console.log('BackgroundsPage - Theme State:', themeState);
    
    // Add detailed background theme logging
    console.group('BackgroundsPage - Background Theme Info');
    
    // Use your existing context functions to access the data
    if (typeof getBackgroundById === 'function' && typeof getModeBackgrounds === 'function') {
      console.log('Background context functions are available');
      
      // Check if specific backgrounds exist for the current mode
      const testIds = ['default', 'primary', 'secondary', 'tertiary', 'white', 'grey', 'black'];
      testIds.forEach(id => {
        const bg = getBackgroundById(id, activeMode);
        console.log(`Background '${id}' for mode ${activeMode}:`, bg || 'Not found');
      });
      
      // Get all backgrounds for the active mode
      const allBackgrounds = getModeBackgrounds(activeMode);
      console.log(`All backgrounds for ${activeMode}:`, allBackgrounds);
      console.log('Number of backgrounds:', allBackgrounds.length);
      
      if (allBackgrounds.length > 0) {
        // Log the IDs of all available backgrounds
        console.log('Available background IDs:', allBackgrounds.map(bg => bg.id));
      }
    } else {
      console.warn('Background context functions are not available');
    }
    
    console.groupEnd();
  }, [fullColorData, themeState, activeMode, getBackgroundById, getModeBackgrounds]);
  // MOVED INSIDE COMPONENT: Helper function to extract colors from ThemeState
  const getThemeColor = useCallback((colorKey: 'primary' | 'secondary' | 'tertiary'): ColorData | null => {
    if (!themeState || !themeState.activeTheme || !themeState.activeTheme.colors) {
      return null;
    }
    
    const color = themeState.activeTheme.colors[colorKey];
    
    if (!color) {
      return null;
    }
    
    // Check if it's already a ColorData object
    if (isColorData(color)) {
      return color as ColorData;
    }
    
    // If it's a string (hex value), try to find the corresponding ColorData 
    // from fullColorData (if available)
    if (typeof color === 'string' && Array.isArray(fullColorData)) {
      const foundColor = fullColorData.find(c => c && c.baseHex === color);
      if (foundColor) {
        return safeColorData(foundColor);
      }
    }
    
    // If we can't find a proper ColorData, create a minimal one with the string value
    if (typeof color === 'string') {
      return {
        baseHex: color,
        name: colorKey.charAt(0).toUpperCase() + colorKey.slice(1),
        id: `${colorKey}-color`
      } as ColorData;
    }
    
    return null;
  }, [themeState, fullColorData]);

  // MOVED INSIDE COMPONENT: Function to get variant colors from ThemeState
  const getVariantColorFromThemeState = useCallback((sectionId: string): ColorData | null => {
    // Ensure themeState is available
    if (!themeState) return null;
    
    // Normalize section ID for consistent matching
    const normalizedId = sectionId.toLowerCase();
    
    switch (normalizedId) {
      case 'primary':
        return getThemeColor('primary');
      case 'primary-light':
        return themeState.primaryLightColor;
      case 'primary-dark':
        return themeState.primaryDarkColor;
      case 'secondary':
        return getThemeColor('secondary');
      case 'secondary-light':
        return themeState.secondaryLightColor;
      case 'secondary-dark':
        return themeState.secondaryDarkColor;
      case 'tertiary':
        return getThemeColor('tertiary');
      case 'tertiary-light':
        return themeState.tertiaryLightColor;
      case 'tertiary-dark':
        return themeState.tertiaryDarkColor;
      case 'white':
        return themeState.whiteColor;
      case 'grey':
        return themeState.greyColor;
      case 'black':
        return themeState.blackColor;
      case 'default':
        return themeState.baseColor;
      default:
        return null;
    }
  }, [themeState, getThemeColor]);

  // Updated backgroundColors memoized with type safety
  const backgroundColors = useMemo(() => {
    // Make sure fullColorData is an array
    if (!Array.isArray(fullColorData)) {
      return {
        primary: [] as ColorData[],
        secondary: [] as ColorData[],
        tertiary: [] as ColorData[],
        neutral: [] as ColorData[]
      };
    }
    
    // Apply the filter functions and convert to safe ColorData
    return {
      primary: safeColorDataArray(fullColorData.filter(color => {
        const id = String(color?.id || '').toLowerCase();
        const name = String(color?.name || '').toLowerCase();
        return (
          id.includes('primary') || 
          name.includes('primary') || 
          name.includes('red') || 
          name.includes('violet') || 
          name.includes('mahogany')
        );
      })),
      secondary: safeColorDataArray(fullColorData.filter(color => {
        const id = String(color?.id || '').toLowerCase();
        const name = String(color?.name || '').toLowerCase();
        return (
          id.includes('secondary') || 
          name.includes('secondary') || 
          name.includes('purple') || 
          name.includes('blue')
        );
      })),
      tertiary: safeColorDataArray(fullColorData.filter(color => {
        const id = String(color?.id || '').toLowerCase();
        const name = String(color?.name || '').toLowerCase();
        return (
          id.includes('tertiary') || 
          name.includes('tertiary') || 
          name.includes('midnight') || 
          name.includes('marina')
        );
      })),
      neutral: safeColorDataArray(fullColorData.filter(color => {
        const id = String(color?.id || '').toLowerCase();
        const name = String(color?.name || '').toLowerCase();
        return (
          id.includes('neutral') || 
          id.includes('grey') || 
          id.includes('gray') || 
          id.includes('white') || 
          id.includes('black') || 
          name.includes('grey') || 
          name.includes('gray') || 
          name.includes('moonstone') ||
          name === 'default grey'
        );
      }))
    };
  }, [fullColorData]);

  /**
   * Safely retrieves colors for a specific color group
   */
  const getColorsForGroup = useCallback((colorGroup?: string): ColorData[] => {
    // Guard clauses for safety
    if (!colorGroup) return [];
    if (!backgroundColors) return [];
    
    // Validate the color group is one of the expected values
    const validColorGroups = ['primary', 'secondary', 'tertiary', 'neutral'];
    if (!validColorGroups.includes(colorGroup)) {
      console.warn(`Invalid color group: ${colorGroup}. Expected one of: ${validColorGroups.join(', ')}`);
      return [];
    }
    
    // Type assertion is now safe since we validated the value
    const typedColorGroup = colorGroup as keyof typeof backgroundColors;
    
    // Get the colors with safety checks
    try {
      const groupColors = backgroundColors[typedColorGroup];
      // We already know this is a ColorData[] because of our backgroundColors definition,
      // but we'll add a runtime check just to be safe
      if (Array.isArray(groupColors)) {
        return groupColors;
      } else {
        console.warn(`Colors for group ${colorGroup} is not an array`);
        return [];
      }
    } catch (e) {
      console.error(`Error accessing colors for group ${colorGroup}:`, e);
      return [];
    }
  }, [backgroundColors]);

  // Background Sections Configuration
  const backgroundSections: BackgroundSection[] = [
    // Primary Sections
    {
      id: 'primary',
      title: 'Primary',
      type: 'info',
      description: 'To change your Primary color, modify your theme or theme order.',
      links: [
        { text: 'Change Theme', route: 'theme' },
        { text: 'Adjust Color Palette', route: 'colors' }
      ]
    },
    {
      id: 'primary-light',
      title: 'Primary-Light',
      type: 'colorSelector',
      colorGroup: 'primary',
      disabledShade: 'primary'
    },
    {
      id: 'primary-dark',
      title: 'Primary-Dark',
      type: 'colorSelector',
      colorGroup: 'primary',
      disabledShade: 'primary'
    },
    // Secondary Sections
    {
      id: 'secondary',
      title: 'Secondary',
      type: 'info',
      description: 'To change your Secondary color, modify your theme or theme order.',
      links: [
        { text: 'Change Theme', route: 'theme' },
        { text: 'Adjust Color Palette', route: 'colors' }
      ]
    },
    {
      id: 'secondary-light',
      title: 'Secondary-Light',
      type: 'colorSelector',
      colorGroup: 'secondary',
      disabledShade: 'secondary'
    },
    {
      id: 'secondary-dark',
      title: 'Secondary-Dark',
      type: 'colorSelector',
      colorGroup: 'secondary',
      disabledShade: 'secondary'
    },
    // Tertiary Sections
    {
      id: 'tertiary',
      title: 'Tertiary',
      type: 'info',
      description: 'To change your Tertiary color, modify your theme or theme order.',
      links: [
        { text: 'Change Theme', route: 'theme' },
        { text: 'Adjust Color Palette', route: 'colors' }
      ]
    },
    {
      id: 'tertiary-light',
      title: 'Tertiary-Light',
      type: 'colorSelector',
      colorGroup: 'tertiary',
      disabledShade: 'tertiary'
    },
    {
      id: 'tertiary-dark',
      title: 'Tertiary-Dark',
      type: 'colorSelector',
      colorGroup: 'tertiary',
      disabledShade: 'tertiary'
    },
    // Neutral Sections
    {
      id: 'white',
      title: 'White',
      type: 'neutralSelector',
    },
    {
      id: 'grey',
      title: 'Grey',
      type: 'neutralSelector',
    },
    {
      id: 'black',
      title: 'Black',
      type: 'neutralSelector',
    }
  ];

  // Initialization Effect
  useEffect(() => {
    // Initialize expanded states (all collapsed by default)
    const initialExpandedState = backgroundSections.reduce((acc, section) => {
      acc[section.id] = false;
      return acc;
    }, {} as Record<string, boolean>);
    
    setExpandedSections(initialExpandedState);
  }, []);

  // Navigation Handlers
  const navigateTo = useCallback((route: string) => {
    const routeConfig = DESIGN_SYSTEM_ROUTES.find(r => r.id === route);
    
    if (routeConfig) {
      setCurrentRoute(routeConfig);
    } else {
      console.warn(`Route "${route}" not found in DESIGN_SYSTEM_ROUTES`);
      setCurrentRoute({
        id: route,
        title: route.charAt(0).toUpperCase() + route.slice(1),
        path: `/${route}`,
        icon: Box
      });
    }
  }, [setCurrentRoute]);

  // Render Route Links
  const renderLink = useCallback((text: string, route: string) => (
    <button
      key={route}
      onClick={() => navigateTo(route)}
      className="text-purple-600 hover:text-purple-800 underline"
    >
      {text}
    </button>
  ), [navigateTo]);

// Update renderColorSelector to use ThemeState data and show available shades
const renderColorSelector = useCallback((
  section: BackgroundSection, 
  variantColors: ColorData[] = [],
  themeStateColor: ColorData | null = null // Add themeStateColor parameter
) => {
  try {
    // Safe check for the section
    if (!section) {
      console.error('Section is undefined in renderColorSelector');
      return <div className="p-3 text-red-500">Error: Invalid section data</div>;
    }
    
    // Log what we're trying to render
    console.log(`Rendering color selector for section:`, {
      id: section.id,
      title: section.title,
      type: section.type,
      colorGroup: section.colorGroup,
      hasThemeStateColor: !!themeStateColor,
      variantColorsLength: variantColors?.length || 0
    });

    // Get the background theme for this section
    const backgroundTheme = getBackground(section.id);

    // Extract the specific shade index for this variant
    let variantShadeIndex: number | undefined;

    if (themeStateColor?.shadeIndex !== undefined) {
      // If ThemeState has a shade index, prioritize it
      variantShadeIndex = typeof themeStateColor.shadeIndex === 'string'
        ? parseInt(themeStateColor.shadeIndex, 10)
        : themeStateColor.shadeIndex;
    } else if (backgroundTheme) {
      // Fallback to background theme
      variantShadeIndex = typeof backgroundTheme.shadeIndex === 'string'
        ? parseInt(backgroundTheme.shadeIndex, 10)
        : backgroundTheme.shadeIndex;
    }
    
    // Determine which colors to use (with safety checks)
    let allColorsForGroup: ColorData[] = [];
    
    if (Array.isArray(variantColors) && variantColors.length > 0) {
      // Use the provided colors, ensuring they're compatible with ColorData type
      allColorsForGroup = safeColorDataArray(variantColors);
    } else if (section.colorGroup) {
      // Get colors for this group using our utility function
      allColorsForGroup = getColorsForGroup(section.colorGroup);
    } else if (section.id) {
      // For neutral selectors, find appropriate colors
      const sectionId = section.id.toLowerCase();
      const filteredColors = (Array.isArray(fullColorData) ? fullColorData : []).filter(color => {
        if (!color) return false;
        const id = String(color.id || '').toLowerCase();
        const name = String(color.name || '').toLowerCase();
        return id.includes(sectionId) || name.includes(sectionId);
      });
      
      // Convert to safe ColorData
      allColorsForGroup = safeColorDataArray(filteredColors);
    }
    
    // Ensure allColorsForGroup is an array of ColorData
    if (!Array.isArray(allColorsForGroup)) {
      console.warn(`allColorsForGroup is not an array for ${section.id}`);
      allColorsForGroup = [];
    }

    return (
      <div>
        {/* Current selection info */}
        {(themeStateColor || backgroundTheme) && (
          <div className="p-4 mb-4 border rounded-md">
            <h3 className="font-medium mb-2">Current Selection</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* ThemeState color */}
              {themeStateColor?.baseHex && (
                <div>
                  <div className="font-semibold text-xs mb-1">ThemeState</div>
                  <div 
                    className="h-10 rounded-md border border-gray-200"
                    style={{ backgroundColor: themeStateColor.baseHex }}
                    title={themeStateColor.baseHex}
                  />
                  <div className="text-xs mt-1">{themeStateColor.baseHex}</div>
                  <div className="text-xs text-gray-500">
                    {themeStateColor.name && (
                      <span className="block">{themeStateColor.name}</span>
                    )}
                    Shade Index: {themeStateColor.shadeIndex}
                  </div>
                </div>
              )}
              
              {/* Background Theme info */}
              {backgroundTheme && (
                <div>
                  <div className="font-semibold text-xs mb-1">Surfaces</div>
                  <div className="flex gap-1">
                    <div 
                      className="h-10 flex-1 rounded-md border border-gray-200"
                      style={{ backgroundColor: backgroundTheme.surface }}
                      title="Surface"
                    />
                    <div 
                      className="h-10 flex-1 rounded-md border border-gray-200"
                      style={{ backgroundColor: backgroundTheme.surfaceDim }}
                      title="Surface Dim"
                    />
                    <div 
                      className="h-10 flex-1 rounded-md border border-gray-200"
                      style={{ backgroundColor: backgroundTheme.surfaceBright }}
                      title="Surface Bright"
                    />
                  </div>
                  <div className="text-xs mt-1">Base: {backgroundTheme.baseHex}</div>
                </div>
              )}
            </div>

            {/* Show available shades if available in ThemeState */}
            {themeStateColor?.allModes && themeStateColor.allModes[activeMode]?.allShades && (
              <div className="mt-4">
                <div className="font-semibold text-xs mb-1">Available Shades</div>
                <div className="flex gap-1 flex-wrap">
                  {themeStateColor.allModes[activeMode].allShades.map((shade, idx) => (
                    <div key={idx} className="text-center">
                      <div 
                        className={`h-8 w-8 rounded-md border ${
                          variantShadeIndex === idx ? 
                            'border-purple-500 ring-2 ring-purple-200' : 
                            'border-gray-200'
                        }`}
                        style={{ backgroundColor: shade.hex }}
                        title={`Shade ${idx}: ${shade.hex}`}
                      />
                      <div className="text-xs mt-1">{idx}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
  
        {/* Colors display section */}
        {allColorsForGroup.length > 0 ? (
          <div className="mt-4">
            <h3 className="font-medium mb-2 px-4">Available Colors</h3>
            <div className="grid grid-cols-3 gap-4 px-4">
              {allColorsForGroup.map((color, index) => {
                if (!color || !color.baseHex) return null;
                
                // Check if this color matches the ThemeState color
                const isSelected = themeStateColor?.baseHex === color.baseHex;
                
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedColor({
                        sectionId: section.id,
                        colorData: color
                      });
                      setIsUpdatePanelOpen(true);
                    }}
                    className={`p-2 border rounded-md hover:bg-gray-50 transition-colors ${
                      isSelected ? 'border-purple-500 bg-purple-50' : ''
                    }`}
                  >
                    <div 
                      className={`w-full h-12 rounded-md border mb-2 ${
                        isSelected ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color.baseHex }}
                    />
                    <div className="text-xs font-medium truncate">
                      {color.name || `Color ${index + 1}`}
                      {isSelected && <span className="ml-1 text-purple-600">(Current)</span>}
                    </div>
                    <div className="text-xs text-gray-500">{color.baseHex}</div>
                    {color.shadeIndex !== undefined && (
                      <div className="text-xs text-gray-400">Shade: {color.shadeIndex}</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 text-gray-500">
            <p>No colors available for this group.</p>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800 font-medium">Missing Colors</p>
              <p className="text-xs text-yellow-700 mt-1">
                No colors were found for the "{section.colorGroup || section.id}" group. 
                Please ensure colors are properly defined in the system.
              </p>
            </div>
          </div>
        )}

        {/* If specific shade variants are available for the selected color */}
        {themeStateColor?.allModes && themeStateColor.allModes[activeMode]?.allShades && 
         themeStateColor.allModes[activeMode].allShades.length > 1 && (
          <div className="mt-6 px-4">
            <h3 className="font-medium mb-2">Shade Variants for {themeStateColor.name || section.title}</h3>
            <div className="grid grid-cols-5 gap-3">
              {themeStateColor.allModes[activeMode].allShades.map((shade, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    // Create a variant with the specific shade index
                    const variantColor = {
                      ...themeStateColor,
                      baseHex: shade.hex,
                      shadeIndex: idx
                    };
                    
                    setSelectedColor({
                      sectionId: section.id,
                      colorData: variantColor
                    });
                    setIsUpdatePanelOpen(true);
                  }}
                  className={`p-2 border rounded-md hover:bg-gray-50 transition-colors ${
                    variantShadeIndex === idx ? 'border-purple-500 bg-purple-50' : ''
                  }`}
                >
                  <div 
                    className={`w-full h-10 rounded-md border mb-1 ${
                      variantShadeIndex === idx ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: shade.hex }}
                  />
                  <div className="text-xs font-medium text-center">Shade {idx}</div>
                  <div className="text-xs text-gray-500 text-center">{shade.hex}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error in renderColorSelector:', error);
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-700">Error rendering color selector: {String(error)}</p>
        <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">{JSON.stringify({
          section: section ? { id: section.id, title: section.title } : 'undefined',
          variantColors: variantColors ? `array[${variantColors.length}]` : 'undefined',
          themeStateColor: themeStateColor ? 'present' : 'absent'
        }, null, 2)}</pre>
      </div>
    );
  }
}, [
  getBackground, 
  getColorsForGroup, 
  fullColorData, 
  setSelectedColor, 
  setIsUpdatePanelOpen, 
  activeMode
]);

// Toggle Section Expansion
const toggleSection = useCallback((sectionId: string) => {
  setExpandedSections(prev => ({
    ...prev,
    [sectionId]: !prev[sectionId]
  }));
}, []);

// Updated renderBackgroundSection function to use ThemeState
// Update renderBackgroundSection function to display data properly
const renderBackgroundSection = useCallback((section: BackgroundSection) => {
  const isExpanded = expandedSections[section.id];
  
  // Get background theme for this section from BackgroundContext
  const backgroundTheme = getBackground(section.id);
  
  // Get color data from ThemeState
  const themeStateColor = getVariantColorFromThemeState(section.id);
  
  // Find correct swatch color for section title display, prioritizing Surface variable
  let swatchColor = '#ffffff'; // Default to white
  let swatchLabel = section.title;
  let shadeIndex: number | string | undefined;
  let surfaceStyle: string | undefined;

  if (backgroundTheme) {
    // Use the surface color from the background theme
    swatchColor = backgroundTheme.surface;
    shadeIndex = backgroundTheme.shadeIndex;
    surfaceStyle = backgroundTheme.styleType;
    
    if (backgroundTheme.name) {
      swatchLabel = `${section.title}`;
    }
  } else if (themeStateColor && themeStateColor.baseHex) {
    // Fallback to theme state color
    swatchColor = themeStateColor.baseHex;
    shadeIndex = themeStateColor.shadeIndex;
    
    if (themeStateColor.name) {
      swatchLabel = `${section.title}`;
    }
  } 
  
  return (
    <div key={section.id} className="mb-4 border border-gray-200 rounded-md overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
        onClick={() => toggleSection(section.id)}
      >
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded-md mr-3 border border-gray-200 flex-shrink-0"
            style={{ backgroundColor: swatchColor }}
            title={`Surface: ${swatchColor}`}
          />
          <div className="flex flex-col">
            <span className="font-medium">{section.title}</span>
            {themeStateColor?.name && themeStateColor.name !== section.title && (
              <span className="text-xs text-gray-500">{themeStateColor.name}</span>
            )}
          </div>
        </div>
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      
      {isExpanded && (
        <div className="p-4 bg-white border-t border-gray-200">
          {/* Surface Style Information with Link to ThemePage */}
          {surfaceStyle && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-medium">Surface Style: {formatStyleName(surfaceStyle)}</span>
                <button 
                  onClick={() => navigateToSurfaceStyling()}
                  className="text-purple-600 hover:text-purple-800 text-sm"
                >
                  Change Style
                </button>
              </div>
            </div>
          )}
          
          {section.type === 'info' && (
            <div>
              <p className="mb-4">{section.description}</p>
              <div className="flex space-x-4">
                {section.links?.map(link => renderLink(link.text, link.route))}
              </div>
            </div>
          )}
          
          {(section.type === 'colorSelector' || section.type === 'neutralSelector') && (
            // Simplified color selector that focuses on shade selection
            (() => {
              try {
                return renderSimplifiedColorSelector(section, themeStateColor);
              } catch (e) {
                console.error(`Error rendering color selector for ${section.id}:`, e);
                return (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                    Error rendering color selector: {String(e)}
                  </div>
                );
              }
            })()
          )}
        </div>
      )}
    </div>
  );
}, [
  expandedSections, 
  toggleSection, 
  renderLink, 
  getBackground,
  themeState
]);

// Helper function to format style names
const formatStyleName = (style: string): string => {
  return style
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Navigation to Surface Styling section of ThemePage
const navigateToSurfaceStyling = useCallback(() => {
  setCurrentRoute({
    id: 'theme',
    title: 'Theme',
    path: '/theme',
    icon: Box
  });
  
  // Add a small delay to ensure the ThemePage is mounted before scrolling
  setTimeout(() => {
    // Dispatch an event to scroll to surface styling section
    window.dispatchEvent(new CustomEvent('scrollToSurfaceStyling'));
  }, 200);
}, [setCurrentRoute]);

// Simplified color selector focused on shade selection
// Simplified color selector focused on shade selection
const renderSimplifiedColorSelector = useCallback((
  section: BackgroundSection,
  themeStateColor: ColorData | null = null
) => {
  if (!themeStateColor?.allModes) {
    return (
      <div className="p-4 text-gray-500">
        <p>No color data available for this background.</p>
      </div>
    );
  }
  
  // Get the shade index
  const variantShadeIndex = typeof themeStateColor.shadeIndex === 'string'
    ? parseInt(themeStateColor.shadeIndex, 10)
    : themeStateColor.shadeIndex || 0;
  
  // Get the shades array
  const shades = themeStateColor.allModes[activeMode]?.allShades || [];
  
  return (
    <div>
      {/* Current Background Info */}
      <div className="mb-4">
        <h3 className="text-base font-medium mb-2">
          Current Background: {themeStateColor.name}
        </h3>
        <div className="p-3 bg-gray-50 rounded-md">
          <div className="flex items-center">
            <div 
              className="w-10 h-10 rounded-md mr-3"
              style={{ backgroundColor: themeStateColor.baseHex }}
            />
            <div>
              <div className="text-sm font-medium">{themeStateColor.baseHex}</div>
              <div className="text-xs text-gray-500">Shade Index: {variantShadeIndex}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Shade Selection */}
      {shades.length > 0 && (
        <div>
          <h3 className="text-base font-medium mb-2">Select Shade</h3>
          <div className="grid grid-cols-5 gap-2">
            {shades.map((shade, idx) => (
              <button
                key={idx}
                onClick={() => {
                  // Create a variant with the specific shade index
                  const variantColor = {
                    ...themeStateColor,
                    baseHex: shade.hex,
                    shadeIndex: idx
                  };
                  
                  setSelectedColor({
                    sectionId: section.id,
                    colorData: variantColor
                  });
                  setIsUpdatePanelOpen(true);
                }}
                className={`p-2 border rounded-md transition-all ${
                  variantShadeIndex === idx ? 'border-purple-500 bg-purple-50' : 'hover:bg-gray-50'
                }`}
              >
                <div 
                  className={`w-full h-10 rounded-md mb-1 ${
                    variantShadeIndex === idx ? 'ring-2 ring-purple-300' : ''
                  }`}
                  style={{ backgroundColor: shade.hex }}
                />
                <div className="text-xs font-medium text-center">Shade {idx}</div>
                <div className="text-xs text-gray-500 text-center truncate">{shade.hex}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}, [activeMode, setIsUpdatePanelOpen, setSelectedColor]);

// Background Color Update Handler
// Updated handleUpdateConfirm to update ThemeState with variant colors
const handleUpdateConfirm = useCallback((updateFontsAndStyles: boolean = false) => {
  if (!selectedColor || !themeState) return;
  
  const { sectionId, colorData } = selectedColor;
  const section = backgroundSections.find(s => s.id === sectionId);
  
  if (!section) return;
  
  // Determine background to update
  let backgroundName = section.title;
  
  // Get current background theme if it exists
  const currentBackgroundTheme = getBackground(sectionId.toLowerCase().replace(/\s+/g, '-'));
  
  // Determine which style processor to use
  let processorStyle: SurfaceStyle;
  
  if (currentBackgroundTheme?.styleType) {
    // If we have an existing background theme with a style type, use that
    processorStyle = currentBackgroundTheme.styleType;
    console.log(`Using existing style type: ${processorStyle} from background theme`);
  } else {
    // Otherwise determine from theme settings
    const isTonalStyle = themeState.surfaceStyle?.includes('tonal') || false;
    
    // Special case handling for neutral backgrounds
    if (['white', 'grey', 'black'].includes(sectionId.toLowerCase())) {
      switch (sectionId.toLowerCase()) {
        case 'white':
          processorStyle = isTonalStyle ? 'colorful-tonal' : 'light-professional';
          break;
        case 'grey':
          processorStyle = isTonalStyle ? 'colorful-tonal' : 'grey-professional';
          break;
        case 'black':
          processorStyle = isTonalStyle ? 'colorful-tonal' : 'dark-professional';
          break;
        default:
          processorStyle = isTonalStyle ? 'colorful-tonal' : 'colorful-professional';
      }
    } else {
      // For color backgrounds, use colorful style processors
      processorStyle = isTonalStyle ? 'colorful-tonal' : 'colorful-professional';
    }
    
    console.log(`Determined style type: ${processorStyle} from theme settings`);
  }
  
  // Process tokens
  try {
    // Ensure active theme exists
    if (!themeState.activeTheme) {
      console.error('No active theme available');
      return;
    }

    // Get state colors (success, error, warning, info)
    const stateColors = Array.isArray(fullColorData) 
      ? fullColorData.filter(color => {
          if (!color || !color.id) return false;
          const id = String(color.id).toLowerCase();
          return id.includes('state-');
        })
      : [];
    
    console.log(`Found ${stateColors.length} state colors`);
    
    // Create empty harmonies object
    const emptyHarmonies = {
      analogous: null,
      monochromatic: null,
      triadic: null,
      tetradic: null,
      square: null,
      diadic: null,
      achromatic: null,
      splitComplementary: null
    };

    // Determine which ThemeState property to update based on section ID
    const normalizedSectionId = sectionId.toLowerCase();
    let themeStateUpdateData: any = null;
    
    // Map sectionId to ThemeState property
    if (normalizedSectionId === 'primary-light') {
      themeStateUpdateData = { propertyName: 'primaryLightColor', value: colorData };
    } else if (normalizedSectionId === 'primary-dark') {
      themeStateUpdateData = { propertyName: 'primaryDarkColor', value: colorData };
    } else if (normalizedSectionId === 'secondary-light') {
      themeStateUpdateData = { propertyName: 'secondaryLightColor', value: colorData };
    } else if (normalizedSectionId === 'secondary-dark') {
      themeStateUpdateData = { propertyName: 'secondaryDarkColor', value: colorData };
    } else if (normalizedSectionId === 'tertiary-light') {
      themeStateUpdateData = { propertyName: 'tertiaryLightColor', value: colorData };
    } else if (normalizedSectionId === 'tertiary-dark') {
      themeStateUpdateData = { propertyName: 'tertiaryDarkColor', value: colorData };
    } else if (normalizedSectionId === 'white') {
      themeStateUpdateData = { propertyName: 'whiteColor', value: colorData };
    } else if (normalizedSectionId === 'grey') {
      themeStateUpdateData = { propertyName: 'greyColor', value: colorData };
    } else if (normalizedSectionId === 'black') {
      themeStateUpdateData = { propertyName: 'blackColor', value: colorData };
    }
    
    // If we need to update ThemeState, send a message to the plugin
    if (themeStateUpdateData) {
      console.log(`Updating ThemeState property: ${themeStateUpdateData.propertyName}`, themeStateUpdateData.value);
      
      // Send message to update ThemeState
      window.parent.postMessage({
        pluginMessage: {
          type: 'update-theme-state',
          propertyName: themeStateUpdateData.propertyName,
          value: themeStateUpdateData.value
        }
      }, '*');
    }

    // Process tokens for the specific background
    processTokens({
      baseColor: colorData,
      activeTheme: themeState.activeTheme,
      stateColors: stateColors as unknown as ColorData[],
      hotlinkStyle: themeState.hotlinkStyle || 'tonal',
      safeColors: Array.isArray(fullColorData) ? fullColorData as ColorData[] : [],
      style: processorStyle,
      harmonies: emptyHarmonies,
      specificGroups: [backgroundName],
      modes: [activeMode] // Process only for the current active mode
    });
    
    // Update Figma with the selected color data
    window.parent.postMessage({
      pluginMessage: {
        type: 'update-background-color',
        background: backgroundName,
        color: colorData.baseHex,
        mode: activeMode,
        shadeIndex: colorData.shadeIndex
      }
    }, '*');

    console.log(`Updated background ${backgroundName} with color ${colorData.baseHex} (shade index: ${colorData.shadeIndex}) using style ${processorStyle}`);
  } catch (error) {
    console.error('Error processing tokens:', error);
  }
  
  // Close the update panel
  setIsUpdatePanelOpen(false);
  setSelectedColor(null);
}, [
  selectedColor, 
  themeState, 
  fullColorData, 
  activeMode, 
  backgroundSections,
  getBackground
]);

// Main component return
return (
  <PageLayout title="Backgrounds">
    {/* Mode Tabs */}
    <div className="mb-6 border-b border-gray-200">
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {modes.map(mode => (
          <div key={mode} className="relative">
            <button
              onClick={() => setActiveMode(mode as Mode)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
                activeMode === mode
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {mode}
            </button>
            {activeMode === mode && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
            )}
          </div>
        ))}
      </div>
    </div>
    
    {/* Background Sections */}
    <div className="space-y-4">
      {backgroundSections.map(renderBackgroundSection)}
    </div>
    
    {/* Update System Panel */}
    <UpdateSystemPanel 
      isOpen={isUpdatePanelOpen}
      onClose={() => setIsUpdatePanelOpen(false)}
      onConfirm={handleUpdateConfirm}
    />
  </PageLayout>
);
};

export default BackgroundsPage;