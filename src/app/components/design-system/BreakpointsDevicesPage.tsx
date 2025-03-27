import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft, Home } from 'lucide-react';
import UpdateSystemPanel from './UpdateSystemPanel';
import { useNavigation } from '../../../context/NavigationContext';

// Types
interface Breakpoint {
  id: string;
  name: string;
  width: string;
  originalWidth?: string; // Track original value
}

interface Device {
  id: string;
  name: string;
  width: string;
  height: string;
  columns: string;
  margin: string;
  gutter: string;
  borderRadius: string;
  originalWidth?: string; // Track original values
  originalHeight?: string;
  originalColumns?: string;
  originalMargin?: string;
  originalGutter?: string;
  originalBorderRadius?: string;
}

interface DeviceCategory {
  id: string;
  name: string;
  devices: Device[];
}

const BreakpointsDevicesPage: React.FC = () => {
    // Add the navigation context hook
  const { setCurrentRoute } = useNavigation();
  
  // Handle back button click
  const handleBack = useCallback(() => {
    setCurrentRoute({
      id: 'home',
      title: 'Design System',
      path: '/',
      icon: Home
    });
  }, [setCurrentRoute]);

  // State for breakpoints
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([
    { id: 'extra-small', name: 'Extra Small', width: '320' },
    { id: 'small', name: 'Small', width: '480' },
    { id: 'medium', name: 'Medium', width: '768' },
    { id: 'large', name: 'Large', width: '992' },
    { id: 'extra-large', name: 'Extra Large', width: '1280' },
    { id: 'extra-extra-large', name: 'Extra Extra Large', width: '1440' }
  ]);

  // State for device categories
const [deviceCategories, setDeviceCategories] = useState<DeviceCategory[]>([
    {
      id: 'desktop',
      name: 'Desktop',
      devices: [
        { id: 'desktop-1920x1080', name: 'Desktop 1920x1080', width: '1920', height: '1080', columns: '12', margin: '16', gutter: '32', borderRadius: '8' },
        { id: 'desktop-1536x864', name: 'Desktop 1536x864', width: '1536', height: '864', columns: '12', margin: '16', gutter: '32', borderRadius: '8' },
        { id: 'desktop-1366x768', name: 'Desktop 1366x768', width: '1366', height: '768', columns: '12', margin: '16', gutter: '32', borderRadius: '8' },
        { id: 'desktop-1280x720', name: 'Desktop 1280x720', width: '1280', height: '720', columns: '12', margin: '16', gutter: '32', borderRadius: '8' },
        { id: 'desktop-1440x900', name: 'Desktop 1440x900', width: '1440', height: '900', columns: '12', margin: '16', gutter: '32', borderRadius: '8' },
      ]
    },
    {
      id: 'tablet',
      name: 'Tablet',
      devices: [
        { id: 'tablet-768x1024', name: 'Tablet 768x1024', width: '768', height: '1024', columns: '8', margin: '16', gutter: '24', borderRadius: '6' },
        { id: 'tablet-810x1080', name: 'Tablet 810x1080', width: '810', height: '1080', columns: '8', margin: '16', gutter: '24', borderRadius: '6' },
        { id: 'tablet-820x1180', name: 'Tablet 820x1180', width: '820', height: '1180', columns: '8', margin: '16', gutter: '24', borderRadius: '6' },
        { id: 'tablet-800x1280', name: 'Tablet 800x1280', width: '800', height: '1280', columns: '8', margin: '16', gutter: '24', borderRadius: '6' },
        { id: 'tablet-601x962', name: 'Tablet 601x962', width: '601', height: '962', columns: '8', margin: '16', gutter: '24', borderRadius: '6' },
      ]
    },
    {
      id: 'mobile',
      name: 'Mobile',
      devices: [
        { id: 'mobile-360x800', name: 'Mobile 360x800', width: '360', height: '800', columns: '4', margin: '16', gutter: '16', borderRadius: '4' },
        { id: 'mobile-390x844', name: 'Mobile 390x844', width: '390', height: '844', columns: '4', margin: '16', gutter: '16', borderRadius: '4' },
        { id: 'mobile-393x873', name: 'Mobile 393x873', width: '393', height: '873', columns: '4', margin: '16', gutter: '16', borderRadius: '4' },
        { id: 'mobile-412x915', name: 'Mobile 412x915', width: '412', height: '915', columns: '4', margin: '16', gutter: '16', borderRadius: '4' },
        { id: 'mobile-375x812', name: 'Mobile 375x812', width: '375', height: '812', columns: '4', margin: '16', gutter: '16', borderRadius: '4' },
      ]
    }
  ]);

  // State for expand/collapse
  const [expandedBreakpoints, setExpandedBreakpoints] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedDevices, setExpandedDevices] = useState<string[]>([]);
  
  // State for section expanded
  const [breakpointsExpanded, setBreakpointsExpanded] = useState(true);
  const [devicesExpanded, setDevicesExpanded] = useState(true);

  // State for tracking changes
  const [hasChanges, setHasChanges] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // Track if this is the initial load to prevent panel from showing on first render
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Check if any values have changed from their originals
  const checkForChanges = (): boolean => {
    // Check breakpoints
    const breakpointChanges = breakpoints.some(bp => bp.width !== bp.originalWidth);
    
    // Check devices
    let deviceChanges = false;
    deviceCategories.forEach(category => {
      category.devices.forEach(device => {
        if (
          device.width !== device.originalWidth ||
          device.height !== device.originalHeight ||
          device.columns !== device.originalColumns ||
          device.margin !== device.originalMargin ||
          device.gutter !== device.originalGutter ||
          device.borderRadius !== device.originalBorderRadius
        ) {
          deviceChanges = true;
        }
      });
    });
    
    return breakpointChanges || deviceChanges;
  };

// Function to update device breakpoint flags
const updateDeviceBreakpointFlags = () => {
    console.log("Updating device breakpoint flags based on current breakpoint values");
    
    // Get current breakpoint values
    const extraSmallBreakpoint = parseInt(breakpoints.find(bp => bp.id === 'extra-small')?.width || '320', 10);
    const smallBreakpoint = parseInt(breakpoints.find(bp => bp.id === 'small')?.width || '480', 10);
    const mediumBreakpoint = parseInt(breakpoints.find(bp => bp.id === 'medium')?.width || '768', 10);
    const largeBreakpoint = parseInt(breakpoints.find(bp => bp.id === 'large')?.width || '992', 10);
    const extraLargeBreakpoint = parseInt(breakpoints.find(bp => bp.id === 'extra-large')?.width || '1280', 10);
    const extraExtraLargeBreakpoint = parseInt(breakpoints.find(bp => bp.id === 'extra-extra-large')?.width || '1440', 10);
    
    console.log("Current breakpoint values:", {
      extraSmall: extraSmallBreakpoint,
      small: smallBreakpoint,
      medium: mediumBreakpoint,
      large: largeBreakpoint,
      extraLarge: extraLargeBreakpoint,
      extraExtraLarge: extraExtraLargeBreakpoint
    });
    
    // Go through all devices and update their breakpoint flags
    deviceCategories.forEach(category => {
      category.devices.forEach(device => {
        // Get device info
        const isTablet = category.id === 'tablet';
        const deviceWidth = parseInt(device.width, 10);
        const deviceHeight = parseInt(device.height, 10);
        
        // Format the base device name
        const deviceName = device.id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-');
        
        // If it's a tablet, we need to handle both vertical and horizontal orientations
        if (isTablet) {
          // Extract the raw dimensions part
          const baseDeviceName = deviceName.replace(/^Tablet-/, '');
          const verticalModeName = `Tablet-Vertical-${baseDeviceName}`;
          const horizontalModeName = `Tablet-Horizontal-${baseDeviceName}`;
          
          // Update flags for vertical orientation using width
          updateBreakpointFlagsForDevice(verticalModeName, deviceWidth, extraSmallBreakpoint, smallBreakpoint, 
            mediumBreakpoint, largeBreakpoint, extraLargeBreakpoint, extraExtraLargeBreakpoint);
            
          // Update flags for horizontal orientation using height as width
          updateBreakpointFlagsForDevice(horizontalModeName, deviceHeight, extraSmallBreakpoint, smallBreakpoint, 
            mediumBreakpoint, largeBreakpoint, extraLargeBreakpoint, extraExtraLargeBreakpoint);
        } else {
          // Normal device - just update once
          updateBreakpointFlagsForDevice(deviceName, deviceWidth, extraSmallBreakpoint, smallBreakpoint, 
            mediumBreakpoint, largeBreakpoint, extraLargeBreakpoint, extraExtraLargeBreakpoint);
        }
      });
    });
  };
  
  // Helper function to update breakpoint flags for a specific device/orientation
  const updateBreakpointFlagsForDevice = (deviceName: string, deviceWidth: number, extraSmallBreakpoint: number, 
    smallBreakpoint: number, mediumBreakpoint: number, largeBreakpoint: number, 
    extraLargeBreakpoint: number, extraExtraLargeBreakpoint: number) => {
    
    // Determine which breakpoint flag should be true based on device width
    let isExtraSmall = false;
    let isSmall = false;
    let isMedium = false;
    let isLarge = false;
    let isExtraLarge = false;
    let isExtraExtraLarge = false;
    
    if (deviceWidth >= extraExtraLargeBreakpoint) {
      isExtraExtraLarge = true;
    } else if (deviceWidth >= extraLargeBreakpoint) {
      isExtraLarge = true;
    } else if (deviceWidth >= largeBreakpoint) {
      isLarge = true;
    } else if (deviceWidth >= mediumBreakpoint) {
      isMedium = true;
    } else if (deviceWidth >= smallBreakpoint) {
      isSmall = true;
    } else {
      isExtraSmall = true;
    }
    
    console.log(`Setting breakpoint flags for ${deviceName} with width ${deviceWidth}:`, {
      'Extra-Small': isExtraSmall,
      'Small': isSmall,
      'Medium': isMedium,
      'Large': isLarge,
      'Extra-Large': isExtraLarge,
      'Extra-Extra-Large': isExtraExtraLarge
    });
  
    // Update each flag using the correct structure
    updateBreakpointFlag(deviceName, 'Extra-Small', isExtraSmall);
    updateBreakpointFlag(deviceName, 'Small', isSmall);
    updateBreakpointFlag(deviceName, 'Medium', isMedium);
    updateBreakpointFlag(deviceName, 'Large', isLarge);
    updateBreakpointFlag(deviceName, 'Extra-Large', isExtraLarge);
    updateBreakpointFlag(deviceName, 'Extra-Extra-Large', isExtraExtraLarge);
  };

  // Helper function to update a device property
const updateDeviceProperty = (deviceName: string, prop: string, value: string | number) => {
    try {
      parent.postMessage({
        pluginMessage: {
          type: 'update-design-token',
          collection: 'Device',
          mode: deviceName,     // Device name is the mode
          variable: prop,       // Property name is the variable
          value: typeof value === 'string' ? parseInt(value, 10) : value
        }
      }, '*');
    } catch (e) {
      console.error(`Error updating device property ${prop} for ${deviceName}:`, e);
    }
  };

    // Helper function to update a breakpoint flag
    const updateBreakpointFlag = (deviceName: string, flag: string, value: boolean) => {
        try {
        window.parent.postMessage({
            pluginMessage: {
            type: 'update-design-token',
            collection: 'Device',
            mode: deviceName,     // Device name is the mode
            variable: flag,       // Flag name is the variable
            value: value ? "True" : "False"  // Send as string with capital first letter
            }
        }, '*');
        } catch (e) {
        console.error(`Error updating breakpoint flag ${flag} for ${deviceName}:`, e);
        }
    };

  // Toggle breakpoint expansion
  const toggleBreakpoint = (id: string) => {
    setExpandedBreakpoints(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };
  
  // Toggle device category expansion
  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Toggle device expansion
  const toggleDevice = (id: string) => {
    setExpandedDevices(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Handle breakpoint width change (local state only)
  const handleBreakpointWidthChange = (id: string, value: string) => {
    console.log(`Changing breakpoint ${id} from original value to ${value}`);
    
    setBreakpoints(prev => {
      const updatedBreakpoints = prev.map(breakpoint => {
        if (breakpoint.id === id) {
          // Check if the value is actually different from original
          const isChanged = value !== breakpoint.originalWidth;
          console.log(`Breakpoint ${id} changed: ${isChanged}`, {
            current: value,
            original: breakpoint.originalWidth
          });
          
          return { ...breakpoint, width: value };
        }
        return breakpoint;
      });
      
      // Check if any breakpoint has changed from its original value
      const anyBreakpointChanged = updatedBreakpoints.some(
        bp => bp.width !== bp.originalWidth
      );
      
      console.log("Any breakpoint changed:", anyBreakpointChanged);
      
      // If there's a change, set hasChanges (panel will show via useEffect)
      if (anyBreakpointChanged) {
        setHasChanges(true);
      } else {
        setHasChanges(false);
      }
      
      return updatedBreakpoints;
    });
  };


// Handle device property change (local state only)
const handleDevicePropertyChange = (categoryId: string, deviceId: string, property: string, value: string) => {
    console.log(`Changing device ${deviceId} property ${property} to ${value}`);
    
    setDeviceCategories(prev => {
      const updatedCategories = prev.map(category => 
        category.id === categoryId ? {
          ...category,
          devices: category.devices.map(device => {
            if (device.id === deviceId) {
              // Get the original value property name
              const originalProp = `original${property.charAt(0).toUpperCase() + property.slice(1)}` as keyof Device;
              
              // Check if the value is actually different from original
              const isChanged = value !== device[originalProp];
              console.log(`Device ${deviceId} property ${property} changed: ${isChanged}`, {
                current: value,
                original: device[originalProp]
              });
              
              return { ...device, [property]: value };
            }
            return device;
          })
        } : category
      );
      
      // Check if any device property has changed from its original value
      let anyDeviceChanged = false;
      
      updatedCategories.forEach(category => {
        category.devices.forEach(device => {
          if (
            device.width !== device.originalWidth ||
            device.height !== device.originalHeight ||
            device.columns !== device.originalColumns ||
            device.margin !== device.originalMargin ||
            device.gutter !== device.originalGutter ||
            device.borderRadius !== device.originalBorderRadius
          ) {
            anyDeviceChanged = true;
          }
        });
      });
      
      console.log("Any device changed:", anyDeviceChanged);
      
      // Set hasChanges based on changes to any device or breakpoint
      const anyBreakpointChanged = breakpoints.some(bp => bp.width !== bp.originalWidth);
      const hasActualChanges = anyDeviceChanged || anyBreakpointChanged;
      
      setHasChanges(hasActualChanges);
      
      return updatedCategories;
    });
  };

// Function to calculate and update column widths
const calculateAndUpdateColumnWidths = async (deviceName: string, deviceWidth: number, columns: number, margin: number, gutter: number, isTablet: boolean = false) => {
    // For tablets, we need to handle both vertical and horizontal orientations
    if (isTablet) {
      // Extract the raw dimensions from the device name (e.g., "768x1024" from "Tablet-768x1024")
      const dimensionsMatch = deviceName.match(/(\d+)x(\d+)/);
      if (!dimensionsMatch) {
        console.error(`Could not extract dimensions from tablet device name: ${deviceName}`);
        return;
      }
      
      const width = parseInt(dimensionsMatch[1], 10);
      const height = parseInt(dimensionsMatch[2], 10);
      
      // Create vertical and horizontal mode names
      const baseDeviceName = deviceName.replace(/^Tablet-/, '');
      const verticalModeName = `Tablet-Vertical-${baseDeviceName}`;
      const horizontalModeName = `Tablet-Horizontal-${baseDeviceName}`;
      
      console.log(`Processing tablet device in both orientations:`, {
        vertical: { name: verticalModeName, width },
        horizontal: { name: horizontalModeName, width: height } // Swap width and height for horizontal
      });
      
      // Calculate for vertical orientation (using original width)
      await calculateColumnWidthsForDevice(verticalModeName, width, columns, margin, gutter);
      
      // Calculate for horizontal orientation (using height as width)
      await calculateColumnWidthsForDevice(horizontalModeName, height, columns, margin, gutter);
    } else {
      // Normal device - just calculate once
      await calculateColumnWidthsForDevice(deviceName, deviceWidth, columns, margin, gutter);
    }
  };
  
  // Helper function to do the actual calculations for a specific device and orientation
  const calculateColumnWidthsForDevice = async (deviceModeName: string, deviceWidth: number, columns: number, margin: number, gutter: number) => {
    console.log(`Calculating column widths for ${deviceModeName}: width=${deviceWidth}, columns=${columns}, margin=${margin}, gutter=${gutter}`);
    
    // First, fetch the required navigation values
    let navigationRailWidth = 0;
    let leftNavWidth = 0;
    
    try {
      // Fetch Navigation-Rail value
      const navigationRailResponse = await fetchDesignToken('Sizing', 'Navigation', 'Default', 'Navigation-Rail');
      navigationRailWidth = typeof navigationRailResponse === 'number' ? navigationRailResponse : 0;
      
      // Fetch LeftNav-Width value
      const leftNavResponse = await fetchDesignToken('Sizing', 'Navigation', 'Default', 'LeftNav-Width');
      leftNavWidth = typeof leftNavResponse === 'number' ? leftNavResponse : 0;
      
      console.log('Navigation widths:', { navigationRailWidth, leftNavWidth });
    } catch (error) {
      console.error('Error fetching navigation widths:', error);
      // Use fallback values if fetch fails
      navigationRailWidth = 80; // Default fallback
      leftNavWidth = 320; // Default fallback
    }
    
    // Define column prefix groups
    const columnGroups = [
      'Standard', 
      'NoGutter-NoMargin', 
      'Standard-With-LeftNav', 
      'NoGutter-NoMargin-With-LeftNav', 
      'Standard-With-Rail', 
      'NoGutter-NoMargin-With-Rail'
    ];
    
    // Calculate column widths for each group and column count
    for (let group of columnGroups) {
      for (let colCount = 1; colCount <= columns; colCount++) {
        let columnWidth = 0;
        
        // Calculate based on the group type
        switch (group) {
          case 'Standard':
            columnWidth = (((deviceWidth - (margin * 2) - (gutter * (columns - 1))) / columns) * colCount);
            break;
            
          case 'NoGutter-NoMargin':
            columnWidth = ((deviceWidth / 12) * colCount);
            break;
            
          case 'Standard-With-Rail':
            columnWidth = (((deviceWidth - (margin * 2) - (gutter * (columns - 1)) - navigationRailWidth) / columns) * colCount);
            break;
            
          case 'NoGutter-NoMargin-With-Rail':
            columnWidth = ((deviceWidth - navigationRailWidth) / 12) * colCount;
            break;
            
          case 'Standard-With-LeftNav':
            columnWidth = (((deviceWidth - (margin * 2) - (gutter * (columns - 1)) - leftNavWidth) / columns) * colCount);
            break;
            
          case 'NoGutter-NoMargin-With-LeftNav':
            columnWidth = ((deviceWidth - leftNavWidth) / 12) * colCount;
            break;
        }
        
        // Round to prevent floating point issues
        columnWidth = Math.round(columnWidth);
        
        // Variable name (e.g., "Col-1", "Col-2", etc.)
        const variableName = `Col-${colCount}`;
        
        // Update the column width in Figma
        updateColumnWidth(deviceModeName, group, variableName, columnWidth);
      }
    }
  };
  
  // Helper function to fetch a design token value
  const fetchDesignToken = (collection: string, group: string, mode: string, variable: string): Promise<number> => {
    return new Promise((resolve, reject) => {
      // Create a unique ID for this request
      const requestId = `${collection}_${group}_${mode}_${variable}_${Date.now()}`;
      
      // Setup listener for this specific response
      const handleResponse = (event: MessageEvent) => {
        const message = event.data.pluginMessage;
        
        if (message && 
            message.type === 'design-token-value' && 
            message.collection === collection &&
            message.group === group &&
            message.mode === mode &&
            message.variable === variable) {
          
          // Remove the listener
          window.removeEventListener('message', handleResponse);
          
          // Resolve with the value
          resolve(message.value);
        }
      };
      
      // Add event listener
      window.addEventListener('message', handleResponse);
      
      // Send the request
      window.parent.postMessage({
        pluginMessage: {
          type: 'get-design-token',
          collection,
          group,
          mode,
          variable,
          requestId // Include the request ID
        }
      }, '*');
      
      // Set a timeout to prevent hanging
      setTimeout(() => {
        window.removeEventListener('message', handleResponse);
        reject(new Error(`Timeout fetching design token: ${collection}.${group}.${mode}.${variable}`));
      }, 3000);
    });
  };
  
// Helper function to update a column width
const updateColumnWidth = (deviceName: string, group: string, variableName: string, value: number) => {
    console.log(`Updating column for ${deviceName}, group ${group}, variable ${variableName}: ${value}px`);
    
    try {
      window.parent.postMessage({
        pluginMessage: {
          type: 'update-design-token',
          collection: 'Device',
          group: `${group}`, // E.g., "Standard/" 
          mode: deviceName,
          variable: `${variableName}`, // Same as group
          value: value
        }
      }, '*');
    } catch (e) {
      console.error(`Error updating column width for ${deviceName}, ${group}, ${variableName}:`, e);
    }
  };

// Apply all changes to Figma
const applyChanges = (updateFontsAndStyles: boolean) => {
    console.log("Applying all changes to Figma", { updateFontsAndStyles });
    
    // Update breakpoints
    breakpoints.forEach(breakpoint => {
      // Log state for debugging
      console.log(`Checking breakpoint ${breakpoint.id}:`, {
        current: breakpoint.width,
        original: breakpoint.originalWidth,
        changed: breakpoint.width !== breakpoint.originalWidth
      });
      
      // Format the variable name for Figma
      const variableName = breakpoint.id.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('-');
      
      console.log(`Updating breakpoint: ${variableName} = ${breakpoint.width}`);
      
      // Send to Figma with numeric value
      try {
        parent.postMessage({
          pluginMessage: {
            type: 'update-design-token',
            collection: 'Sizing',
            group: 'Breakpoints',
            mode: 'Default',
            variable: variableName,
            value: parseInt(breakpoint.width, 10)
          }
        }, '*');
      } catch (e) {
        console.error(`Error updating breakpoint ${variableName}:`, e);
      }
    });
    
    // Update devices
    const updatePromises: Promise<void>[] = [];
    
    deviceCategories.forEach(category => {
      category.devices.forEach(device => {
        // Format the device name
        const deviceName = device.id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-');
        
        // Check if this is a tablet device
        const isTablet = category.id === 'tablet';
        
        // For tablets, we'll handle properties differently - we need to update both orientations
        if (isTablet) {
          // Extract the raw dimensions part
          const baseDeviceName = deviceName.replace(/^Tablet-/, '');
          const verticalModeName = `Tablet-Vertical-${baseDeviceName}`;
          const horizontalModeName = `Tablet-Horizontal-${baseDeviceName}`;
          
          // Update each property for both orientations
          const deviceProperties = [
            { prop: 'columns', figmaName: 'Columns', original: device.originalColumns },
            { prop: 'margin', figmaName: 'Margin', original: device.originalMargin },
            { prop: 'gutter', figmaName: 'Gutter', original: device.originalGutter },
            { prop: 'borderRadius', figmaName: 'Device-Border-Radius', original: device.originalBorderRadius }
          ];
          
          // Update properties for vertical orientation
          deviceProperties.forEach(({ prop, figmaName, original }) => {
            console.log(`Updating device ${verticalModeName} property ${figmaName}:`, {
              current: device[prop as keyof Device],
              original: original
            });
            
            updateDeviceProperty(verticalModeName, figmaName, device[prop as keyof Device] as string);
          });
          
          // Update properties for horizontal orientation
          deviceProperties.forEach(({ prop, figmaName, original }) => {
            console.log(`Updating device ${horizontalModeName} property ${figmaName}:`, {
              current: device[prop as keyof Device],
              original: original
            });
            
            updateDeviceProperty(horizontalModeName, figmaName, device[prop as keyof Device] as string);
          });
          
          // Calculate and update column widths for both orientations
          const promise = calculateAndUpdateColumnWidths(
            deviceName, // Original device name - the function will handle creating vertical/horizontal variants
            parseInt(device.width, 10),
            parseInt(device.columns, 10),
            parseInt(device.margin, 10),
            parseInt(device.gutter, 10),
            true // Flag to indicate this is a tablet
          );
          
          updatePromises.push(promise);
        } else {
          // Regular device (not a tablet) - update normally
          const deviceProperties = [
            { prop: 'columns', figmaName: 'Columns', original: device.originalColumns },
            { prop: 'margin', figmaName: 'Margin', original: device.originalMargin },
            { prop: 'gutter', figmaName: 'Gutter', original: device.originalGutter },
            { prop: 'borderRadius', figmaName: 'Device-Border-Radius', original: device.originalBorderRadius }
          ];
          
          deviceProperties.forEach(({ prop, figmaName, original }) => {
            console.log(`Updating device ${deviceName} property ${figmaName}:`, {
              current: device[prop as keyof Device],
              original: original
            });
            
            updateDeviceProperty(deviceName, figmaName, device[prop as keyof Device] as string);
          });
          
          // Calculate and update column widths
          const promise = calculateAndUpdateColumnWidths(
            deviceName,
            parseInt(device.width, 10),
            parseInt(device.columns, 10),
            parseInt(device.margin, 10),
            parseInt(device.gutter, 10),
            false // Not a tablet
          );
          
          updatePromises.push(promise);
        }
      });
    });
    
    // After updating all devices and column widths, update device breakpoint flags
    Promise.all(updatePromises).then(() => {
      // Update breakpoint flags
      updateDeviceBreakpointFlags();
      
      // Reset the hasChanges flag
      setHasChanges(false);
    }).catch(error => {
      console.error("Error calculating column widths:", error);
      // Still update the breakpoint flags and reset changes state
      updateDeviceBreakpointFlags();
      setHasChanges(false);
    });
  };

  // Handle update confirmation
  const handleUpdate = (updateFontsAndStyles: boolean) => {
    applyChanges(updateFontsAndStyles);
    setIsPanelOpen(false);
    setHasChanges(false);
  };
  
  // Handle update panel close (cancel)
  const handleClosePanel = () => {
    setIsPanelOpen(false);
    
    // Revert any changes in the UI
    setBreakpoints(prev => 
      prev.map(breakpoint => ({
        ...breakpoint,
        width: breakpoint.originalWidth || breakpoint.width
      }))
    );
    
    setDeviceCategories(prev => 
      prev.map(category => ({
        ...category,
        devices: category.devices.map(device => ({
          ...device,
          width: device.originalWidth || device.width,
          height: device.originalHeight || device.height,
          columns: device.originalColumns || device.columns,
          margin: device.originalMargin || device.margin,
          gutter: device.originalGutter || device.gutter,
          borderRadius: device.originalBorderRadius || device.borderRadius
        }))
      }))
    );
    
    setHasChanges(false);
  };

  // Handle showing the update panel when values change
  useEffect(() => {
    // Only show panel if there are changes and we're past the initial load
    if (hasChanges && !isInitialLoad) {
      setIsPanelOpen(true);
    }
  }, [hasChanges, isInitialLoad]);

  // Load existing values from Figma on component mount
  useEffect(() => {
    // Function to handle messages from Figma
    const handleMessage = (event: MessageEvent) => {
      const message = event.data.pluginMessage;
      
      if (message && message.type === 'design-token-value') {
        console.log('Received design token value:', message);
        
        // Update breakpoint values if they match
        if (message.collection === 'Sizing' && message.group === 'Breakpoints') {
          const valueStr = message.value.toString();
          console.log(`Received value for breakpoint ${message.variable}: ${valueStr}`);
          
          setBreakpoints(prev => 
            prev.map(bp => {
              // Format variable name for comparison
              const bpName = bp.id.split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join('-');
                
              if (bpName === message.variable) {
                console.log(`Updating state for ${bp.id} to ${valueStr}`);
                return { 
                  ...bp, 
                  width: valueStr,
                  originalWidth: valueStr // Store original value
                };
              }
              return bp;
            })
          );
        }
        
        // Update device values if they match
        if (message.collection === 'Device') {
            const deviceName = message.mode;
            const property = message.group;
            const valueStr = message.value.toString();
            
            // Skip if deviceName is missing
            if (!deviceName) return;
            
            const deviceId = deviceName.toLowerCase().replace(/\s/g, '-');
            
            // Check if it's a property token
            const deviceProperties = ['Device-Width', 'Device-Height', 'Columns', 'Margin', 'Gutter', 'Device-Border-Radius'];
            if (deviceProperties.includes(property)) {
            console.log(`Received device value for ${deviceName}, property: ${property}, value: ${valueStr}`);
            
            // Map Figma property names to component property names
            let componentProperty = property.toLowerCase();
            let originalProperty = '';
            
            if (property === 'Device-Width') {
                componentProperty = 'width';
                originalProperty = 'originalWidth';
            } else if (property === 'Device-Height') {
                componentProperty = 'height';
                originalProperty = 'originalHeight';
            } else if (property === 'Device-Border-Radius') {
                componentProperty = 'borderRadius';
                originalProperty = 'originalBorderRadius';
            } else if (property === 'Columns') {
                componentProperty = 'columns';
                originalProperty = 'originalColumns';
            } else if (property === 'Margin') {
                componentProperty = 'margin';
                originalProperty = 'originalMargin';
            } else if (property === 'Gutter') {
                componentProperty = 'gutter';
                originalProperty = 'originalGutter';
            }
            
            // Only update if it's a property we care about
            if (['width', 'height', 'columns', 'margin', 'gutter', 'borderRadius'].includes(componentProperty)) {
                setDeviceCategories(prev => {
                return prev.map(category => {
                    const updatedDevices = category.devices.map(device => {
                    if (device.id.toLowerCase() === deviceId) {
                        console.log(`Updating device ${device.id} ${componentProperty} to ${valueStr}`);
                        
                        const updatedDevice = { 
                        ...device,
                        [componentProperty]: valueStr
                        };
                        
                        // Also store the original value
                        if (originalProperty) {
                        console.log(`Setting original value ${originalProperty} to ${valueStr}`);
                        updatedDevice[originalProperty as keyof Device] = valueStr;
                        }
                        
                        return updatedDevice;
                    }
                    return device;
                    });
                    
                    return {
                    ...category,
                    devices: updatedDevices
                    };
                });
                });
            }
            }
    
    // Check if it's a breakpoint flag token
    const breakpointFlags = ['Extra-Small', 'Small', 'Medium', 'Large', 'Extra-Large', 'Extra-Extra-Large'];
    if (breakpointFlags.includes(property)) {
      console.log(`Received breakpoint flag: ${property} = ${valueStr} for device ${deviceName}`);
      // We don't need to update state for breakpoint flags - they're calculated based on width
    }
  }
      }
    };
    
    // Add event listener
    window.addEventListener('message', handleMessage);
    
    // Fetch initial values for breakpoints
    try {
      breakpoints.forEach(breakpoint => {
        // Format the variable name for Figma
        const variableName = breakpoint.id.split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('-');
        
        console.log(`Requesting breakpoint value for ${variableName}`);
        
        window.parent.postMessage({
          pluginMessage: {
            type: 'get-design-token',
            collection: 'Sizing',
            group: 'Breakpoints',
            mode: 'Default',
            variable: variableName
          }
        }, '*');
      });
      
      // Fetch initial values for devices
      deviceCategories.forEach(category => {
        category.devices.forEach(device => {
          const deviceName = device.id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-');
          
          // Get device properties
          const propertyVariables = ['Device-Width', 'Device-Height', 'Columns', 'Margin', 'Gutter', 'Device-Border-Radius'];
          
          propertyVariables.forEach(prop => {
            window.parent.postMessage({
              pluginMessage: {
                type: 'get-design-token',
                collection: 'Device',
                group: 'Properties',
                mode: deviceName,
                variable: prop
              }
            }, '*');
          });
          
          // Get the current breakpoint flags
          const breakpointFlags = ['Extra-Small', 'Small', 'Medium', 'Large', 'Extra-Large', 'Extra-Extra-Large'];
          
          breakpointFlags.forEach(flag => {
            window.parent.postMessage({
              pluginMessage: {
                type: 'get-design-token',
                collection: 'Device',
                group: 'Breakpoints',
                mode: deviceName,
                variable: flag
              }
            }, '*');
          });
        });
      });
      
      // After loading all initial values, update device breakpoint flags
      // and mark initial load as complete
      setTimeout(() => {
        updateDeviceBreakpointFlags();
        setIsInitialLoad(false);
      }, 1000);
    } catch (e) {
      console.error("Error requesting initial values:", e);
      setIsInitialLoad(false);
    }
    
    // Clean up
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div className="space-y-8 p-4">
      {/* Add back button */}
      <button
        onClick={handleBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="text-xl">Back</span>
      </button>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Breakpoints & Devices</h1>
      </div>
      
      {/* Breakpoints Section */}
      <section className="border rounded-lg p-4">
        <button 
          className="w-full flex items-center justify-between font-semibold text-lg mb-4"
          onClick={() => setBreakpointsExpanded(!breakpointsExpanded)}
        >
          <span>Breakpoints</span>
          {breakpointsExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>
        
        {breakpointsExpanded && (
          <div className="space-y-4">
            {breakpoints.map((breakpoint) => (
              <div key={breakpoint.id} className="border rounded-lg overflow-hidden">
                <button 
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100"
                  onClick={() => toggleBreakpoint(breakpoint.id)}
                >
                  <span className="font-medium">{breakpoint.name}</span>
                  {expandedBreakpoints.includes(breakpoint.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                
                {expandedBreakpoints.includes(breakpoint.id) && (
                  <div className="p-4">
                    <div className="flex items-center">
                      <label className="w-24">Width:</label>
                      <input 
                        type="text"
                        className="border rounded p-2 flex-1"
                        value={breakpoint.width}
                        onChange={(e) => handleBreakpointWidthChange(breakpoint.id, e.target.value)}
                      />
                      <span className="ml-2">px</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
      
 {/* Devices Section */}
 <section className="border rounded-lg p-4">
        <button 
          className="w-full flex items-center justify-between font-semibold text-lg mb-4"
          onClick={() => setDevicesExpanded(!devicesExpanded)}
        >
          <span>Devices</span>
          {devicesExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>
        
        {devicesExpanded && (
          <div className="space-y-6">
            {deviceCategories.map((category) => (
              <div key={category.id} className="space-y-4">
                <button 
                  className="w-full flex items-center justify-between p-2 bg-gray-100 rounded-lg"
                  onClick={() => toggleCategory(category.id)}
                >
                  <span className="font-medium">{category.name}</span>
                  {expandedCategories.includes(category.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                
                {expandedCategories.includes(category.id) && (
                  <div className="pl-4 space-y-4">
                    {category.devices.map((device) => (
                      <div key={device.id} className="border rounded-lg overflow-hidden">
                        <button 
                          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100"
                          onClick={() => toggleDevice(device.id)}
                        >
                          <span className="font-medium">{device.name}</span>
                          {expandedDevices.includes(device.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                        
                        {expandedDevices.includes(device.id) && (
                        <div className="p-4 space-y-3">
                            <div className="flex items-center">
                            <label className="w-32">Width:</label>
                            <input 
                                type="text"
                                className="border rounded p-2 flex-1 bg-gray-100 cursor-not-allowed"
                                value={device.width}
                                disabled
                            />
                            <span className="ml-2">px</span>
                            </div>
                            
                            <div className="flex items-center">
                            <label className="w-32">Height:</label>
                            <input 
                                type="text"
                                className="border rounded p-2 flex-1 bg-gray-100 cursor-not-allowed"
                                value={device.height}
                                disabled
                            />
                            <span className="ml-2">px</span>
                            </div>
                            
                            <div className="flex items-center">
                            <label className="w-32">Columns:</label>
                            <input 
                                type="text"
                                className="border rounded p-2 flex-1"
                                value={device.columns}
                                onChange={(e) => handleDevicePropertyChange(category.id, device.id, 'columns', e.target.value)}
                            />
                            </div>
                            
                            <div className="flex items-center">
                            <label className="w-32">Margin:</label>
                            <input 
                                type="text"
                                className="border rounded p-2 flex-1"
                                value={device.margin}
                                onChange={(e) => handleDevicePropertyChange(category.id, device.id, 'margin', e.target.value)}
                            />
                            <span className="ml-2">px</span>
                            </div>
                            
                            <div className="flex items-center">
                            <label className="w-32">Gutter:</label>
                            <input 
                                type="text"
                                className="border rounded p-2 flex-1"
                                value={device.gutter}
                                onChange={(e) => handleDevicePropertyChange(category.id, device.id, 'gutter', e.target.value)}
                            />
                            <span className="ml-2">px</span>
                            </div>
                            
                            <div className="flex items-center">
                            <label className="w-32">Border Radius:</label>
                            <input 
                                type="text"
                                className="border rounded p-2 flex-1"
                                value={device.borderRadius}
                                onChange={(e) => handleDevicePropertyChange(category.id, device.id, 'borderRadius', e.target.value)}
                            />
                            <span className="ml-2">px</span>
                            </div>
                        </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* Update Panel */}
      <UpdateSystemPanel 
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        onConfirm={handleUpdate}
      />
    </div>
  );
};

export { BreakpointsDevicesPage };