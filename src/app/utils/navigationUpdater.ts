import { NavBarSurface } from '../components/design-system/NavigationBarsPage';
import { styleNavbarMapping } from './navbarStyleConfig';
import { getBackgroundGroup } from './navbarStyleConfig';

/**
 * Links variables in a navigation bar to the corresponding background variables
 * This copies all variables from the source background mode to the target nav mode
 * @param navId The ID of the navbar (e.g., 'Nav-1')
 * @param backgroundType The background to link to (e.g., 'Default Surface Dim')
 */
export const linkNavbarToBackground = (
    navId: string,
    backgroundType: NavBarSurface
  ): void => {
    console.group(`Linking ${navId} to ${backgroundType} background`);
    
    // Extract the background name (Default, Primary, White, etc.)
    const backgroundName = backgroundType
      .replace(' Surface Dim', '')
      .replace(' Surface', '');
    
    // Send a message to copy all variables from the source mode (background) to the target mode (navId)
    window.parent.postMessage({
      pluginMessage: {
        type: 'copy-all-mode-variables',
        collection: 'Backgrounds',
        fromMode: backgroundName, // Source mode is the background name (e.g., "Primary")
        toMode: navId            // Target mode is the navId (e.g., "Nav-1")
      }
    }, '*');
    
    console.log(`NavBar update message sent for ${navId} to ${backgroundName}`);
    console.groupEnd();
  };
  
  /**
   * Updates the status bar boolean values based on the selected surface
   * @param statusBarId The ID of the status bar (e.g., 'StatusBar-1')
   * @param surface The surface type to use
   */
  export const updateStatusBarBooleans = (
    statusBarId: string,
    surface: NavBarSurface
  ): void => {
    console.group(`Updating ${statusBarId} booleans for ${surface}`);
    
    // Extract the background name (Default, Primary, White, etc.)
    const surfaceName = surface
      .replace(' Surface Dim', '')
      .replace(' Surface', '');
    
    // All possible surface types
    const surfaceTypes = ['Default', 'Primary', 'Primary-Light', 'Primary-Dark', 'White', 'Grey', 'Black'];
    
    // Set all surface types to false for this statusBarId
    surfaceTypes.forEach(type => {
      const value = (type === surfaceName);
      
      window.parent.postMessage({
        pluginMessage: {
          type: 'update-design-token',
          collection: 'StatusBar',
          mode: statusBarId, // The mode is the StatusBar ID
          variable: type, // Variable is the surface type
          value: value // Set to true only for the selected surface
        }
      }, '*');
      
      console.log(`Set StatusBar.${type} for mode ${statusBarId} = ${value}`);
    });
    
    console.log(`${statusBarId} booleans updated for ${surface}`);
    console.groupEnd();
  };
  
  /**
   * Add a listener to handle responses from the Figma plugin
   */
  export const initNavigationUpdaterListeners = (): void => {
    console.log('Initializing navigation updater listeners');
    
    const handlePluginMessage = (event: MessageEvent) => {
      if (event.data.pluginMessage) {
        const msg = event.data.pluginMessage;
        
        // Handle design token update response
        if (msg.type === 'design-token-updated') {
          console.log(`Design token update was ${msg.success ? 'successful' : 'unsuccessful'}`);
          if (!msg.success && msg.error) {
            console.error(`Design token update error: ${msg.error}`);
          }
        }
      }
    };
    
    window.addEventListener('message', handlePluginMessage);
    console.log('Navigation updater listeners initialized');
  };

/**
 * Updates a specific navbar with a selected surface type
 * Also updates the corresponding status bar
 * @param navId The navigation bar ID (e.g., 'Nav-1')
 * @param surface The surface type to use
 */
export const updateNavigationBackground = (
  navId: string,
  surface: NavBarSurface
): void => {
  console.log(`Changing ${navId} surface to ${surface}`);
  
  // Link the navbar to the background
  linkNavbarToBackground(navId, surface);
  
  // Update the corresponding status bar booleans
  const statusBarId = navId.replace('Nav-', 'StatusBar-');
  updateStatusBarBooleans(statusBarId, surface);
};

/**
 * Updates all navigation elements according to the style mapping
 * @param styleProcessor The style processor being used
 */
export const updateAllNavigationForStyle = (
    styleProcessor: string
  ): void => {
    console.group(`Updating all navigation for style: ${styleProcessor}`);
    
    // Get the navBar mapping for this style
    const navbarConfig = styleNavbarMapping[styleProcessor];
    if (!navbarConfig) {
      console.warn(`No navbar configuration found for style: ${styleProcessor}`);
      console.groupEnd();
      return;
    }
    
    // Process each nav bar and its corresponding status bar
    Object.entries(navbarConfig).forEach(([navId, surfaceType]) => {
      updateNavigationBackground(navId, surfaceType);
    });
    
    console.log('All navigation elements updated');
    console.groupEnd();
  };

  /**
 * This function should be called after token processing is complete
 * It ensures that navigation is updated for the current style
 */
export const updateNavigationAfterProcessing = (style: string): void => {
  console.group('Updating navigation after token processing');
  
  // Map SurfaceStyle to processor name (matching the keys in styleNavbarMapping)
  const processorNameMap: Record<string, string> = {
    'light-tonal': 'processLightTonalStyle',
    'dark-tonal': 'processDarkTonalStyle',
    'colorful-tonal': 'processColorfulTonalStyle',
    'light-professional': 'processProfessionalLightStyle',
    'grey-professional': 'processProfessionalGreyStyle',
    'dark-professional': 'processProfessionalDarkStyle',
    'colorful-professional': 'processColorfulProfessionalStyle'
  };
  
  const processorName = processorNameMap[style] || processorNameMap['light-tonal'];
  console.log(`Using processor name: ${processorName} for style: ${style}`);
  
  // Update all navigation elements for this style
  updateAllNavigationForStyle(processorName);
  
  console.groupEnd();
};