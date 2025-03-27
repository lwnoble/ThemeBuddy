import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, Home, ChevronRight } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';
import { useColors } from '../../../context/ColorContext';
import { useTheme } from '../../../context/ThemeContext';
import { TokenRegistry } from '../../utils/tokenRegistry';
import { getBackgroundGroup } from '../../utils/navbarStyleConfig';
import { 
  linkNavbarToBackground,
  updateStatusBarBooleans, 
  initNavigationUpdaterListeners
} from '../../utils/navigationUpdater';

export type NavBarSurface = 
  | 'Default Surface Dim'
  | 'Primary Surface'
  | 'Primary Light Surface'
  | 'Primary Dark Surface'
  | 'White Surface'
  | 'Grey Surface'
  | 'Black Surface';

interface NavBarSettings {
  surface: NavBarSurface;
  group: string;
  color: string;
}

// Define a combined interface for both nav and status bar
interface CombinedBarOption {
  navBar: NavBarSettings;
  statusBar: NavBarSettings;
  id: string;
}

export const NavigationBarsPage: React.FC = () => {
  const { setCurrentRoute } = useNavigation();
  const { fullColorData } = useColors();
  const { themeState } = useTheme();
  const { activeTheme } = themeState;
  
  // State for modes and active mode
  const defaultModes = ['AA-light', 'AAA-light', 'AA-dark', 'AAA-dark'];
  const [modes, setModes] = useState<string[]>(defaultModes);
  const [activeMode, setActiveMode] = useState<string>('AA-light');

  // State for surface colors - will be populated from TokenRegistry
  const [surfaceColors, setSurfaceColors] = useState<Record<NavBarSurface, string>>({} as Record<NavBarSurface, string>);

  // Combined state for navigation and status bars
  const [barOptions, setBarOptions] = useState<CombinedBarOption[]>([
    {
      id: '1',
      navBar: { 
        surface: 'Default Surface Dim', 
        group: 'Backgrounds/Default',
        color: '' // Will be populated from TokenRegistry
      },
      statusBar: { 
        surface: 'Default Surface Dim', 
        group: 'Backgrounds/Default',
        color: '' // Will be populated from TokenRegistry
      }
    },
    {
      id: '2',
      navBar: { 
        surface: 'Primary Surface', 
        group: 'Backgrounds/Primary',
        color: '' // Will be populated from TokenRegistry
      },
      statusBar: { 
        surface: 'Primary Surface', 
        group: 'Backgrounds/Primary',
        color: '' // Will be populated from TokenRegistry
      }
    },
    {
      id: '3',
      navBar: { 
        surface: 'White Surface', 
        group: 'Backgrounds/White',
        color: '' // Will be populated from TokenRegistry
      },
      statusBar: { 
        surface: 'White Surface', 
        group: 'Backgrounds/White',
        color: '' // Will be populated from TokenRegistry
      }
    }
  ]);

  // Handle mode change
  const handleModeChange = useCallback((mode: string) => {
    console.log(`Changing mode to: ${mode}`);
    setActiveMode(mode);
    
    // When mode changes, just re-initialize everything using the current settings
    barOptions.forEach((option) => {
      const navId = `Nav-${option.id}`;
      const statusBarId = `StatusBar-${option.id}`;
      
      // Update both nav and status bars with new functions, passing the mode parameter
      linkNavbarToBackground(navId, option.navBar.surface);
      updateStatusBarBooleans(statusBarId, option.statusBar.surface);
    });
  }, [barOptions]);

  /**
   * Add these utility functions to the NavigationBarsPage component to ensure safe access
   * to theme values and avoid null errors
   */

  // Safe getter for current theme colors
  const getThemeColor = useCallback((colorType: 'primary' | 'secondary' | 'tertiary'): string => {
    if (!themeState.activeTheme) return '#1976d2'; // Fallback blue
    
    const color = themeState.activeTheme.colors[colorType];
    
    if (typeof color === 'string') {
      return color;
    }
    
    if (color && typeof color === 'object' && 'baseHex' in color) {
      return color.baseHex;
    }
    
    // Fallbacks for each type
    const fallbacks = {
      primary: '#1976d2', // Blue
      secondary: '#9c27b0', // Purple
      tertiary: '#00796b'  // Teal
    };
    
    return fallbacks[colorType];
  }, [themeState.activeTheme]);

  // Initialize bar options when theme changes
  useEffect(() => {
    // Wait until we have theme colors and surface colors loaded
    if (!themeState.activeTheme || Object.keys(surfaceColors).length === 0) return;
    
    console.log('Updating bar options with theme colors:', {
      themeActive: !!themeState.activeTheme,
      primaryColor: getThemeColor('primary'),
      surfaceColorsLoaded: Object.keys(surfaceColors).length
    });
    
    // Ensure we don't lose existing settings, just update colors
    setBarOptions(prev => prev.map(option => ({
      ...option,
      navBar: {
        ...option.navBar,
        color: surfaceColors[option.navBar.surface] || '#CCCCCC'
      },
      statusBar: {
        ...option.statusBar,
        color: surfaceColors[option.statusBar.surface] || '#CCCCCC'
      }
    })));

    const handlePluginMessage = (event: MessageEvent) => {
      if (event.data.pluginMessage) {
        const msg = event.data.pluginMessage;
        
        // Handle design token update response
        if (msg.type === 'design-token-updated') {
          console.log(`Design token update for ${msg.variable} was ${msg.success ? 'successful' : 'unsuccessful'}`);
          if (!msg.success && msg.error) {
            console.error(`Error updating design token: ${msg.error}`);
            // You could show a toast notification here
          }
        }
        
        // Handle copy mode variables response
        if (msg.type === 'copy-mode-variables-result') {
          if (msg.success) {
            console.log(`Successfully copied ${msg.copyCount} variables from ${msg.fromMode} to ${msg.toMode}`);
            // You could show a success toast here
          } else {
            console.error(`Error copying mode variables: ${msg.error}`);
            // You could show an error toast here
          }
        }
      }
    };
    
    window.addEventListener('message', handlePluginMessage);
    
    // Cleanup listener when component unmounts
    return () => {
      window.removeEventListener('message', handlePluginMessage);
    };
    
    // Re-initialize navbar links with new functions, passing the activeMode parameter
    barOptions.forEach((option) => {
      const navId = `Nav-${option.id}`;
      const statusBarId = `StatusBar-${option.id}`;
      
      linkNavbarToBackground(navId, option.navBar.surface);
      updateStatusBarBooleans(statusBarId, option.statusBar.surface);
    });
  }, [themeState.activeTheme, surfaceColors, activeMode]);

  // Function to find a token from the registry
  const findToken = useCallback((pattern: string, backgroundName?: string): string => {
    if (!backgroundName) return '#CCCCCC';
    
    const tokenRegistry = TokenRegistry.getInstance();
    const allTokens = tokenRegistry.getAllTokens();
    
    // Filter tokens for the current mode
    const modeTokens = Object.entries(allTokens)
      .filter(([_, token]) => token.mode === activeMode)
      .reduce((acc, [key, token]) => {
        acc[key] = token;
        return acc;
      }, {} as Record<string, { hex: string; name: string; mode: string; group: string; }>);
    
    // For exact matches, try these specific patterns first
    const exactPatterns = [
      // Direct token keys as seen in the BackgroundsPage
      `.../Backgrounds/${backgroundName}/Surface`,
      `.../Backgrounds/${backgroundName}/Surface-Dim`,
      `...ds/${backgroundName}/Surface`,
      `...cond/${backgroundName}/Surface`,
      
      // Try direct paths with mode
      `${activeMode}-${backgroundName}-${pattern}`,
      `${activeMode}/Backgrounds/${backgroundName}/${pattern}`,
      `Backgrounds/${backgroundName}/${pattern}`,
      `${backgroundName}/${pattern}`,
      
      // Check for components in the key
      `${backgroundName}-${pattern}`,
      `${backgroundName}-${activeMode}-${pattern}`
    ];
    
    // For each pattern, try an exact match
    for (const p of exactPatterns) {
      if (p.includes('undefined')) continue;
      
      // Try exact match
      const exactMatch = Object.entries(modeTokens).find(([key]) => 
        key === p || key.endsWith(p)
      );
      
      if (exactMatch) {
        console.log(`✅ EXACT MATCH for "${pattern}" in "${backgroundName}": ${exactMatch[0]} = ${exactMatch[1].hex}`);
        return exactMatch[1].hex;
      }
    }
    
    // Try more fuzzy matches
    const fuzzyPatterns = [
      // Try with background name variations
      `${backgroundName}`,
      
      // Try pattern variations
      `surface`,
      `${pattern}`,
      
      // Combinations
      `${backgroundName}.*${pattern}`,
      `${pattern}.*${backgroundName}`
    ];
    
    // For fuzzy patterns, try a more flexible approach
    for (const p of fuzzyPatterns) {
      if (p.includes('undefined')) continue;
      
      try {
        // Create a loose regex pattern
        const regex = new RegExp(p, 'i');
        
        // Find any key that matches this pattern
        const fuzzyMatch = Object.entries(modeTokens).find(([key]) => {
          return regex.test(key) && 
                key.toLowerCase().includes(backgroundName.toLowerCase()) &&
                (pattern ? key.toLowerCase().includes(pattern.toLowerCase()) : true);
        });
        
        if (fuzzyMatch) {
          console.log(`🔍 FUZZY MATCH for "${pattern}" in "${backgroundName}": ${fuzzyMatch[0]} = ${fuzzyMatch[1].hex}`);
          return fuzzyMatch[1].hex;
        }
      } catch (e) {
        // If regex fails, try simple includes
        const fallbackMatch = Object.entries(modeTokens).find(([key]) => 
          key.toLowerCase().includes(backgroundName.toLowerCase()) && 
          (pattern ? key.toLowerCase().includes(pattern.toLowerCase()) : true)
        );
        
        if (fallbackMatch) {
          console.log(`⚠️ FALLBACK MATCH for "${pattern}" in "${backgroundName}": ${fallbackMatch[0]} = ${fallbackMatch[1].hex}`);
          return fallbackMatch[1].hex;
        }
      }
    }
    
    // If all else fails, try to find ANY token that has the background name
    const lastResortMatch = Object.entries(modeTokens).find(([key]) => 
      key.toLowerCase().includes(backgroundName.toLowerCase())
    );
    
    if (lastResortMatch) {
      console.log(`⚠️ LAST RESORT MATCH for "${pattern}" in "${backgroundName}": ${lastResortMatch[0]} = ${lastResortMatch[1].hex}`);
      return lastResortMatch[1].hex;
    }
    
    // Log the failure
    console.log(`❌ NO MATCH for "${pattern}" in "${backgroundName}"`);
    return '#CCCCCC'; // Default fallback color
  }, [activeMode]);

  // Initialize from TokenRegistry
  const loadSurfaceColorsFromTokenRegistry = useCallback(() => {
    console.log(`Loading surface colors from TokenRegistry for mode: ${activeMode}`);
    
    // Default fallbacks in case tokens aren't registered yet
    const fallbackColors: Record<NavBarSurface, string> = {
      'Default Surface Dim': '#E9ECEF',
      'Primary Surface': '#E8F3FF',
      'Primary Light Surface': '#F0F7FF',
      'Primary Dark Surface': '#CEEBFF',
      'White Surface': '#FFFFFF',
      'Grey Surface': '#F8F9FA',
      'Black Surface': '#212529'
    };

    // Initialize surface colors
    const newSurfaceColors: Record<NavBarSurface, string> = {
      'Default Surface Dim': findToken('surface-dim', 'Default') || fallbackColors['Default Surface Dim'],
      'Primary Surface': findToken('surface', 'Primary') || fallbackColors['Primary Surface'],
      'Primary Light Surface': findToken('surface', 'Primary-Light') || fallbackColors['Primary Light Surface'],
      'Primary Dark Surface': findToken('surface', 'Primary-Dark') || fallbackColors['Primary Dark Surface'],
      'White Surface': findToken('surface', 'White') || fallbackColors['White Surface'],
      'Grey Surface': findToken('surface', 'Grey') || fallbackColors['Grey Surface'],
      'Black Surface': findToken('surface', 'Black') || fallbackColors['Black Surface'],
    };

    console.log('Loaded surface colors:', newSurfaceColors);
    
    // Update the surface colors
    setSurfaceColors(newSurfaceColors);
    
    // Update colors for all bar options
    setBarOptions(prev => 
      prev.map(option => ({
        ...option,
        navBar: {
          ...option.navBar,
          color: newSurfaceColors[option.navBar.surface] || fallbackColors[option.navBar.surface]
        },
        statusBar: {
          ...option.statusBar,
          color: newSurfaceColors[option.statusBar.surface] || fallbackColors[option.statusBar.surface]
        }
      }))
    );
  }, [activeMode, findToken]);

  // Initialize component with TokenRegistry data
  useEffect(() => {
    console.log('Initializing NavigationBarsPage');
    
    // Get token registry instance
    const tokenRegistry = TokenRegistry.getInstance();
    const allTokens = tokenRegistry.getAllTokens();
    console.log('All tokens:', tokenRegistry.getAllTokens());
    
    // Check if we should discover additional modes from tokens
    const discoveredModes = new Set<string>();
    Object.values(allTokens).forEach(token => {
      if (token.mode) {
        discoveredModes.add(token.mode);
      }
    });
    
    // Keep our default modes, but add any additional discovered modes not in our defaults
    const additionalModes = Array.from(discoveredModes).filter(mode => !defaultModes.includes(mode));
    
    if (additionalModes.length > 0) {
      const allModes = [...defaultModes, ...additionalModes].sort();
      console.log('All available modes:', allModes);
      setModes(allModes);
    }
    
    // Initialize with AA-light if it exists in the available modes, otherwise use first mode
    const availableModes = [...discoveredModes, ...defaultModes];
    if (availableModes.includes('AA-light')) {
      setActiveMode('AA-light');
    } else if (availableModes.length > 0) {
      setActiveMode(availableModes[0]);
    }
    
    // Load initial colors
    loadSurfaceColorsFromTokenRegistry();
  }, [loadSurfaceColorsFromTokenRegistry]);

  // Update surface colors when activeMode changes
  useEffect(() => {
    loadSurfaceColorsFromTokenRegistry();
  }, [activeMode, loadSurfaceColorsFromTokenRegistry]);

  // Add a separate effect for initializing the navbar links
  useEffect(() => {
    // After the component mounts and initial data is loaded, update the navbar links
    const initializeNavBars = () => {
      console.log('Initializing navigation bar links...');
      
      // Wait a moment to ensure the UI is fully loaded
      setTimeout(() => {
        // Update each navbar/statusbar with its current surface setting
        barOptions.forEach((option) => {
          const navId = `Nav-${option.id}`;
          const statusBarId = `StatusBar-${option.id}`;
          
          console.log(`Initializing ${navId} to ${option.navBar.surface}`);
          console.log(`Initializing ${statusBarId} to ${option.statusBar.surface}`);
          
          // Pass the activeMode parameter to both functions
          linkNavbarToBackground(navId, option.navBar.surface);
          updateStatusBarBooleans(statusBarId, option.statusBar.surface);
        });
        
        console.log('Navigation bar initialization complete');
      }, 1000); // Give a second for everything to load
    };
    
    // Only run once when the component mounts
    initializeNavBars();
  }, [barOptions, activeMode]); // Add activeMode to dependency array

  const surfaceOptions: NavBarSurface[] = [
    'Default Surface Dim',
    'Primary Surface',
    'Primary Light Surface',
    'Primary Dark Surface',
    'White Surface',
    'Grey Surface',
    'Black Surface'
  ];

// Add this useEffect to initialize listeners when the component mounts
useEffect(() => {
  initNavigationUpdaterListeners();
  
  // Add local handlers for specific component feedback
  const handlePluginMessage = (event: MessageEvent) => {
    if (event.data.pluginMessage) {
      const msg = event.data.pluginMessage;
      
      // Handle navbar update response
      if (msg.type === 'navbar-links-updated') {
        console.log(`NavBar update for ${msg.navId} was ${msg.success ? 'successful' : 'unsuccessful'}`);
        
        // You could add UI feedback here, like a toast notification
        if (!msg.success && msg.error) {
          console.error(`NavBar update error: ${msg.error}`);
        }
      }
      
      // Handle statusbar update response
      if (msg.type === 'statusbar-links-updated') {
        console.log(`StatusBar update for ${msg.statusId} was ${msg.success ? 'successful' : 'unsuccessful'}`);
        
        // You could add UI feedback here, like a toast notification
        if (!msg.success && msg.error) {
          console.error(`StatusBar update error: ${msg.error}`);
        }
      }
    }
  };
  
  window.addEventListener('message', handlePluginMessage);
  
  // Clean up
  return () => {
    window.removeEventListener('message', handlePluginMessage);
  };
}, []);

/**
 * Updates the navigation bar surface and sends update to Figma
 */
const handleNavBarSurfaceChange = useCallback((optionIndex: number, newSurface: NavBarSurface) => {
  try {
    console.group(`Changing Nav Bar ${optionIndex + 1} surface to ${newSurface}`);
    
    // Update local state first
    setBarOptions(prev => {
      const updated = [...prev];
      updated[optionIndex] = {
        ...updated[optionIndex],
        navBar: {
          surface: newSurface,
          group: getBackgroundGroup(newSurface),
          color: surfaceColors[newSurface] || '#CCCCCC' // Add fallback
        }
      };
      return updated;
    });

    // Get the NavBar ID
    const navId = `Nav-${optionIndex + 1}`;
    
    // Use the linkNavbarToBackground function from navigationUpdater.ts
    linkNavbarToBackground(navId, newSurface);
    
    console.log('NavBar update sent');
    console.groupEnd();
  } catch (error) {
    console.error('Error updating navbar surface:', error);
  }
}, [surfaceColors]);


  /**
   * Updates the status bar surface and sends update to Figma
   */
  const handleStatusBarSurfaceChange = useCallback((optionIndex: number, newSurface: NavBarSurface) => {
    console.group(`Changing Status Bar ${optionIndex + 1} surface to ${newSurface}`);
    
    // Update local state
    setBarOptions(prev => {
      const updated = [...prev];
      updated[optionIndex] = {
        ...updated[optionIndex],
        statusBar: {
          surface: newSurface,
          group: getBackgroundGroup(newSurface),
          color: surfaceColors[newSurface]
        }
      };
      return updated;
    });

    // Get the StatusBar ID
    const statusBarId = `StatusBar-${optionIndex + 1}`;
    
    // Pass the activeMode parameter to updateStatusBarBooleans
    updateStatusBarBooleans(statusBarId, newSurface);
    
    console.log('StatusBar update complete');
    console.groupEnd();
  }, [surfaceColors, activeMode]); // Add activeMode to dependency array

  /**
   * Helper to match status bar to the same surface as nav bar
   */
  const matchStatusBarToNavBar = useCallback((optionIndex: number) => {
    const option = barOptions[optionIndex];
    if (option) {
      handleStatusBarSurfaceChange(optionIndex, option.navBar.surface);
    }
  }, [barOptions, handleStatusBarSurfaceChange]);

  const handleBack = useCallback(() => {
    setCurrentRoute({
      id: 'home',
      title: 'Design System',
      path: '/',
      icon: Home
    });
  }, [setCurrentRoute]);

  // Custom collapsible item component to match the screenshot UI
  const NavBarItem = ({ 
    color,
    title,
    defaultCollapsed = true,
    children
  }: {
    color: string;
    title: string;
    defaultCollapsed?: boolean;
    children?: React.ReactNode;
  }) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
    
    const handleToggle = () => {
      setIsCollapsed(!isCollapsed);
    };
    
    return (
      <div className="mb-2">
        <button 
          onClick={handleToggle}
          className="w-full bg-gray-50 rounded-lg p-4 flex items-center justify-between border border-gray-200"
        >
          <div className="flex items-center space-x-4">
            <div 
              className="w-10 h-10 rounded-md border border-gray-200"
              style={{ backgroundColor: color }}
            />
            <span className="text-lg font-medium">{title}</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </button>
        
        {!isCollapsed && children}
      </div>
    );
  };

 // In NavigationBarsPage.tsx, modify the return statement to remove the tabs and debug button

return (
  <div className="min-h-screen bg-gray-50 p-4">
    <div className="max-w-lg mx-auto">
      <button
        onClick={handleBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="text-xl">Back</span>
      </button>
      
      {/* Navigation & Status Bar Options */}
      {barOptions.map((option, index) => (
        <div key={`option-${index}`} className="mb-8">
          {/* Group header */}
          <h2 className="text-xl font-bold mb-3 px-2">Navigation & Status Bar {option.id}</h2>
          
          {/* Navigation Coloring Panel */}
          <NavBarItem
            color={option.navBar.color}
            title={index === 0 ? option.navBar.surface : "Navigation Coloring"}
            defaultCollapsed={true}
          >
            <div className="mt-1 p-4 bg-white rounded-b-lg border-x border-b border-gray-200">
              <div className="grid grid-cols-1 gap-2">
                {surfaceOptions.map((surface) => (
                  <button
                    key={`nav-${index}-${surface}`}
                    onClick={() => handleNavBarSurfaceChange(index, surface)}
                    className={`px-4 py-2 text-left rounded-lg flex items-center space-x-3 ${
                      option.navBar.surface === surface 
                        ? 'bg-purple-50 border-2 border-purple-500' 
                        : 'border border-gray-200'
                    }`}
                  >
                    <div 
                      className="w-5 h-5 rounded-full border border-gray-200"
                      style={{ backgroundColor: surfaceColors[surface] }}
                    />
                    <span>{surface}</span>
                  </button>
                ))}
              </div>
            </div>
          </NavBarItem>
          
          {/* Status Bar Coloring Panel */}
          <NavBarItem
            color={option.statusBar.color}
            title="Status Bar Coloring"
            defaultCollapsed={true}
          >
            <div className="mt-1 p-4 bg-white rounded-b-lg border-x border-b border-gray-200">
              <div className="grid grid-cols-1 gap-2">
                {surfaceOptions.map((surface) => (
                  <button
                    key={`status-${index}-${surface}`}
                    onClick={() => handleStatusBarSurfaceChange(index, surface)}
                    className={`px-4 py-2 text-left rounded-lg flex items-center space-x-3 ${
                      option.statusBar.surface === surface 
                        ? 'bg-purple-50 border-2 border-purple-500' 
                        : 'border border-gray-200'
                    }`}
                  >
                    <div 
                      className="w-5 h-5 rounded-full border border-gray-200"
                      style={{ backgroundColor: surfaceColors[surface] }}
                    />
                    <span>{surface}</span>
                  </button>
                ))}
              </div>
            </div>
          </NavBarItem>
        </div>
      ))}
    </div>
  </div>
);
};

export default NavigationBarsPage;