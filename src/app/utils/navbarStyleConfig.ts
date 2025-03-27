// src/app/utils/navbarStyleConfig.ts
import { NavBarSurface } from '../components/design-system/NavigationBarsPage';
import { TokenRegistry } from './tokenRegistry';

interface NavBarConfig {
  'Nav-1': NavBarSurface;
  'Nav-2': NavBarSurface;
  'Nav-3': NavBarSurface;
}

interface StyleNavbarMapping {
  [key: string]: NavBarConfig;
}

// Define the interfaces for update message objects
interface NavBarUpdate {
  navId: string;
  collection: string;
  mode: string;
  targetCollection: string;
  targetGroup: string;
}

interface StatusBarUpdate {
  statusId: string;
  collection: string;
  mode: string;
  targetCollection: string;
  targetGroup: string;
}

export const styleNavbarMapping: StyleNavbarMapping = {
  'processLightTonalStyle': {
    'Nav-1': 'Default Surface Dim',
    'Nav-2': 'Primary Surface',
    'Nav-3': 'White Surface'
  },
  'processDarkTonalStyle': {
    'Nav-1': 'Black Surface',
    'Nav-2': 'Primary Surface',
    'Nav-3': 'White Surface'
  },
  'processColorfulTonalStyle': {
    'Nav-1': 'Default Surface Dim',
    'Nav-2': 'Primary Surface',
    'Nav-3': 'White Surface'
  },
  'processProfessionalLightStyle': {
    'Nav-1': 'White Surface',
    'Nav-2': 'Primary Surface',
    'Nav-3': 'Black Surface'
  },
  'processProfessionalGreyStyle': {
    'Nav-1': 'White Surface',
    'Nav-2': 'Grey Surface',
    'Nav-3': 'Black Surface'
  },
  'processProfessionalDarkStyle': {
    'Nav-1': 'White Surface',
    'Nav-2': 'Black Surface',
    'Nav-3': 'Primary Surface'
  },
  'processColorfulProfessionalStyle': {
    'Nav-1': 'Default Surface Dim',
    'Nav-2': 'Primary Surface',
    'Nav-3': 'White Surface'
  }
};

export const updateNavbarVariables = (
  styleProcessor: string, 
  isProcessingDefault: boolean
) => {
  console.group(`Updating navbar variables: ${styleProcessor}, isDefault: ${isProcessingDefault}`);
  
  // Only update if we're processing Default surfaces
  if (!isProcessingDefault) {
    console.log('Skipping - not processing default');
    console.groupEnd();
    return;
  }

  const navbarConfig = styleNavbarMapping[styleProcessor];
  if (!navbarConfig) {
    console.warn(`No navbar configuration found for style: ${styleProcessor}`);
    console.groupEnd();
    return;
  }

  // Prepare bulk update data with proper typing
  const navbarUpdates: NavBarUpdate[] = [];
  const statusbarUpdates: StatusBarUpdate[] = [];

  Object.entries(navbarConfig).forEach(([navId, surface]) => {
    const targetGroup = getBackgroundGroup(surface);
    console.log(`Setting ${navId} to use ${targetGroup}`);
    
    // Add navbar update
    navbarUpdates.push({
      navId,
      collection: 'NavBar',
      mode: `**${navId}**`,
      targetCollection: 'Modes',
      targetGroup
    });
    
    // Add statusbar update (using same mapping)
    const statusId = navId.replace('Nav', 'Status');
    statusbarUpdates.push({
      statusId,
      collection: 'StatusBar',
      mode: `**${statusId}**`,
      targetCollection: 'Modes',
      targetGroup
    });
  });

  // Send bulk update message
  console.log('Sending bulk update message');
  window.parent.postMessage({
    pluginMessage: {
      type: 'bulk-update-navbar-links',
      navbarUpdates,
      statusbarUpdates
    }
  }, '*');

  console.groupEnd();
};

/**
 * Updates a specific navbar or statusbar with a selected surface
 */
export const updateSingleBarLink = (
  barType: 'navbar' | 'statusbar',
  id: string,
  surface: NavBarSurface
): void => {
  const targetGroup = getBackgroundGroup(surface);
  const collection = barType === 'navbar' ? 'NavBar' : 'StatusBar';
  const idKey = barType === 'navbar' ? 'navId' : 'statusId';
  
  console.log(`Updating single ${barType}: ${id} to use ${targetGroup}`);
  
  // Send the message to Figma
  window.parent.postMessage({
    pluginMessage: {
      type: barType === 'navbar' ? 'update-navbar-links' : 'update-statusbar-links',
      [idKey]: id,
      collection,
      mode: `**${id}**`,
      targetCollection: 'Modes',
      targetGroup
    }
  }, '*');
};

/**
 * Gets the background group for a given surface type
 */
export const getBackgroundGroup = (surface: NavBarSurface): string => {
  const surfaceToGroupMap: Record<NavBarSurface, string> = {
    'Default Surface Dim': 'Backgrounds/Default',
    'Primary Surface': 'Backgrounds/Primary',
    'Primary Light Surface': 'Backgrounds/Primary-Light',
    'Primary Dark Surface': 'Backgrounds/Primary-Dark',
    'White Surface': 'Backgrounds/White',
    'Grey Surface': 'Backgrounds/Grey',
    'Black Surface': 'Backgrounds/Black'
  };
  return surfaceToGroupMap[surface];
};

/**
 * Directly updates a navbar with color values from TokenRegistry
 * This provides an alternative approach if variable aliasing doesn't work
 */
export const directUpdateFromRegistry = (
  navId: string,
  surface: NavBarSurface
): void => {
  console.group(`Direct update from registry: ${navId}, ${surface}`);
  
  // Get the background group path
  const backgroundGroup = getBackgroundGroup(surface);
  if (!backgroundGroup) {
    console.error(`No background group found for surface: ${surface}`);
    console.groupEnd();
    return;
  }
  
  // Get TokenRegistry instance
  const registry = TokenRegistry.getInstance();
  const allTokens = registry.getAllTokens();
  
  // Helper to find tokens for this background group
  const findToken = (component: string): string | null => {
    // Create the pattern to match in registry
    const pattern = `${backgroundGroup.split('/')[1]}-${component}`;
    
    // Find matching token
    const matchingToken = Object.entries(allTokens).find(([key, token]) => 
      key.includes(pattern)
    );
    
    if (matchingToken) {
      console.log(`Found token for ${component}: ${matchingToken[1].hex}`);
      return matchingToken[1].hex;
    }
    
    console.warn(`No token found for ${component}`);
    return null;
  };
  
  // Get key component tokens
  const surfaceToken = findToken('Surface');
  const surfaceDimToken = findToken('Surface-Dim');
  const surfaceBrightToken = findToken('Surface-Bright');
  const onSurfaceToken = findToken('On-Surface');
  const borderToken = findToken('Surface-Border');
  
  // If we can't find the basic tokens, abort
  if (!surfaceToken) {
    console.error('Could not find basic Surface token');
    console.groupEnd();
    return;
  }
  
  // Send direct updates for each component
  const sendDirectUpdate = (component: string, value: string | null) => {
    if (!value) return;
    
    window.parent.postMessage({
      pluginMessage: {
        type: 'update-design-token',
        collection: 'NavBar',
        mode: `**${navId}**`,
        variable: component, // Just use the component name without navId prefix
        value: value
      }
    }, '*');
  };
  
  // Update key components
  sendDirectUpdate('Surface', surfaceToken);
  if (surfaceDimToken) sendDirectUpdate('Surface-Dim', surfaceDimToken);
  if (surfaceBrightToken) sendDirectUpdate('Surface-Bright', surfaceBrightToken);
  if (onSurfaceToken) sendDirectUpdate('On-Surface', onSurfaceToken);
  if (borderToken) sendDirectUpdate('Surface-Border', borderToken);
  
  console.log('Direct updates sent');
  console.groupEnd();
  
  if (!surfaceToken || !surfaceDimToken || !surfaceBrightToken || !onSurfaceToken || !borderToken) {
    console.warn('Some tokens are missing for complete NavBar styling');
  }
};

/**
 * Links variables in a navigation bar to the corresponding background variables
 * using the update-design-token message which is known to be working
 * @param navId The ID of the navbar (e.g., 'Nav-1')
 * @param backgroundType The background to link to (e.g., 'Default Surface Dim')
 */

/**
 * Links variables in a navigation bar to the corresponding background variables
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
  
  console.log(`Copying variables from ${backgroundName} to ${navId}`);
  
  // Use the simple-update type that is already handled in the plugin
  window.parent.postMessage({
    pluginMessage: {
      type: 'simple-update',
      navId: navId,
      backgroundName: backgroundName
    }
  }, '*');
  
  // Also update status bar booleans
  const statusBarId = navId.replace('Nav', 'StatusBar');
  updateStatusBarBooleans(statusBarId, backgroundType);
  
  console.log(`Background link request sent: ${backgroundName} → ${navId}`);
  console.groupEnd();
};

// Modified version of updateStatusBarBooleans to fix the mode format
export const updateStatusBarBooleans = (
  statusBarId: string,
  surface: NavBarSurface
): void => {
  console.group(`Updating ${statusBarId} booleans for ${surface}`);
  
  // Extract the base surface name (without "Surface" suffix)
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
        mode: statusBarId,             // Removed the ** characters
        variable: type,
        value: value
      }
    }, '*');
    
    console.log(`Set StatusBar.${type} for mode ${statusBarId} = ${value}`);
  });
  
  console.log(`${statusBarId} booleans updated for ${surface}`);
  console.groupEnd();
};

// Add this to navbarStyleConfig.ts
export const debugVariables = () => {
  // List all collections
  window.parent.postMessage({
    pluginMessage: {
      type: 'debug-variable-operations',
      operation: 'list-collections'
    }
  }, '*');
  
  // List all variables
  window.parent.postMessage({
    pluginMessage: {
      type: 'debug-variable-operations',
      operation: 'list-variables'
    }
  }, '*');
  
  // Test a simple update (adjust parameters as needed)
  window.parent.postMessage({
    pluginMessage: {
      type: 'debug-variable-operations',
      operation: 'test-update',
      collectionName: 'Backgrounds',
      fromMode: 'Default',         // Source mode
      toMode: 'Nav-1',             // Target mode
      variableName: 'Surface'      // Variable to update
    }
  }, '*');
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