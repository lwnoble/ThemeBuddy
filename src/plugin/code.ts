console.log('PLUGIN STARTED');

try {
  'use strict';

  console.log('🔍 Figma Plugin Code Loading');

  figma.showUI(__html__, {
    width: 460,
    height: 700
  });

  console.log('🔍 Figma Plugin UI Shown');

// In code.ts
function updateAllPageBackgroundsToSurfaceDim(hexColor: string) {
  console.log(`Updating all page backgrounds to Surface-Dim color: ${hexColor}`);
  
  // Convert hex to RGB (0-1 range for Figma API)
  const r = parseInt(hexColor.slice(1, 3), 16) / 255;
  const g = parseInt(hexColor.slice(3, 5), 16) / 255;
  const b = parseInt(hexColor.slice(5, 7), 16) / 255;
  
  // Get all pages and update their backgrounds
  for (const page of figma.root.children) {
    page.backgrounds = [{
      type: 'SOLID',
      color: {r, g, b}
    }];
  }
}

// enhance the loadAndSetFont function

async function loadAndSetFont(variable: Variable, modeId: string, fontName: string) {
  console.log(`Loading font: ${fontName}`);
  
  // Handle specific problem fonts
  if (fontName.toLowerCase() === "poiret one") {
    console.log("Detected special case font: Poiret One");
    try {
      // Try loading with exact name
      await figma.loadFontAsync({ family: "Poiret One", style: "Regular" });
      console.log("Successfully loaded Poiret One");
      
      // Set the exact name
      variable.setValueForMode(modeId, "Poiret One");
      return true;
    } catch (poiretError) {
      console.error("Error loading Poiret One:", poiretError);
    }
  }
  
  try {
    // Rest of your existing code for loading fonts
    const availableFonts = await figma.listAvailableFontsAsync();
    
    // Log some of the available fonts for debugging
    console.log(`Found ${availableFonts.length} available fonts`);
    console.log(`Sample fonts: ${availableFonts.slice(0, 5).map(f => f.fontName.family).join(', ')}`);
    
    // Find all variants of this font family - with more detailed logging
    const fontVariants = availableFonts.filter(font => {
      const match = font.fontName.family.toLowerCase() === fontName.toLowerCase() ||
                   font.fontName.family.toLowerCase().includes(fontName.toLowerCase()) ||
                   fontName.toLowerCase().includes(font.fontName.family.toLowerCase());
      
      if (match) {
        console.log(`Found matching font: ${font.fontName.family}, style: ${font.fontName.style}`);
      }
      
      return match;
    });
    
    console.log(`Found ${fontVariants.length} variants for font family: ${fontName}`);
    
    if (fontVariants.length > 0) {
      // Try to find a Regular variant first
      let selectedVariant = fontVariants.find(font => 
        font.fontName.style === "Regular"
      );
      
      // If no Regular, try Medium
      if (!selectedVariant) {
        selectedVariant = fontVariants.find(font => 
          font.fontName.style === "Medium"
        );
      }
      
      // If still not found, just use the first available variant
      if (!selectedVariant) {
        selectedVariant = fontVariants[0];
      }
      
      console.log(`Selected font variant: ${selectedVariant.fontName.family}, style: ${selectedVariant.fontName.style}`);
      
      // Load this specific font style
      await figma.loadFontAsync(selectedVariant.fontName);
      
      // Now set just the family name in the variable
      variable.setValueForMode(modeId, selectedVariant.fontName.family);
      console.log(`Successfully set font family: ${selectedVariant.fontName.family}`);
      return true;
    } else {
      // Your existing fallback handling...
    }
  } catch (error) {
    console.error(`Error loading font ${fontName}:`, error);
    throw error;
  }
}

// Function to update variables based on button shape
async function updateButtonShape(variables: any[]) {
  try {
    // Get the Sizing collection
    const sizingCollection = figma.variables.getLocalVariableCollections()
      .find(c => c.name === 'Sizing');
      
    if (!sizingCollection) {
      console.error("Sizing collection not found");
      return;
    }
    
    // Get the actual mode ID from the mode name
    let modeId: string;
    const defaultMode = sizingCollection.modes.find(m => m.name === 'Default');
    
    if (defaultMode) {
      modeId = defaultMode.modeId;
    } else {
      // If 'Default' mode doesn't exist, use the first available mode or create one
      if (sizingCollection.modes.length > 0) {
        console.warn("'Default' mode not found in Sizing, using first available mode");
        modeId = sizingCollection.modes[0].modeId;
      } else {
        console.warn("No modes found in Sizing, creating 'Default' mode");
        modeId = sizingCollection.addMode('Default');
      }
    }
    
    // Process each variable
    for (const varInfo of variables) {
      try {
        // Find the target variable (e.g., Focus-7) in the Sizing collection
        const targetVariable = figma.variables.getLocalVariables()
          .find(v => v.name === varInfo.targetVariable && 
                 v.variableCollectionId === sizingCollection.id);
        
        if (!targetVariable) {
          console.error(`${varInfo.targetVariable} variable not found in Sizing collection`);
          continue; // Skip to next variable
        }
        
        // Find or create the variable in the same Sizing collection
        const fullVarName = `${varInfo.group}/${varInfo.variable}`;
        let systemVariable = figma.variables.getLocalVariables()
          .find(v => v.name === fullVarName && 
                 v.variableCollectionId === sizingCollection.id);
        
        // If not found, create the variable
        if (!systemVariable) {
          console.log(`Creating new variable: ${fullVarName}`);
          systemVariable = figma.variables.createVariable(
            fullVarName,                // Name
            sizingCollection.id,        // Collection ID
            targetVariable.resolvedType // Type (match the target)
          );
        }
        
        // Set the alias using the actual target variable ID
        console.log(`Setting ${fullVarName} to reference ${targetVariable.name} (ID: ${targetVariable.id})`);
        
        systemVariable.setValueForMode(modeId, {
          type: 'VARIABLE_ALIAS',
          id: targetVariable.id // Use the actual variable ID
        });
        
        console.log(`Successfully updated ${fullVarName}`);
      } catch (varError) {
        console.error(`Error updating variable ${varInfo.variable}:`, varError);
      }
    }
    
    console.log('Button shape update complete');
    
  } catch (error) {
    console.error('Error updating button shape:', error);
  }
}

// New function to update page backgrounds with any color
function updateAllPageBackgrounds(hexColor: string) {
  console.log(`Updating all page backgrounds to color: ${hexColor}`);
  
  // Convert hex to RGB (0-1 range for Figma API)
  const r = parseInt(hexColor.slice(1, 3), 16) / 255;
  const g = parseInt(hexColor.slice(3, 5), 16) / 255;
  const b = parseInt(hexColor.slice(5, 7), 16) / 255;
  
  // Get all pages and update their backgrounds
  for (const page of figma.root.children) {
    page.backgrounds = [{
      type: 'SOLID',
      color: {r, g, b}
    }];
  }
}

  // Function to create or get a collection
  function getOrCreateCollection(collectionName: string) {
    let collection = figma.variables.getLocalVariableCollections().find(c => c.name === collectionName);
    if (!collection) {
      collection = figma.variables.createVariableCollection(collectionName);
      console.log(`Created "${collectionName}" collection`);
    } else {
      console.log(`"${collectionName}" collection already exists`);
    }
    return collection;
  }

  // Function to create or get a variable
  function getOrCreateVariable(variableName: string, collectionId: string, type: VariableResolvedDataType) {
    let variable = figma.variables.getLocalVariables().find(
      v => v.name === variableName && v.variableCollectionId === collectionId
    );
    if (!variable) {
      variable = figma.variables.createVariable(variableName, collectionId, type);
      console.log(`Created "${variableName}" variable`);
    } else {
      console.log(`"${variableName}" variable already exists`);
    }
    return variable;
  }

  /**
   * Updates navigation bar links to point to the background variables
   */
  async function updateNavigationBarLinks(
    navId: string,
    collection: string,
    mode: string,
    targetCollection: string,
    targetGroup: string,
    activeMode?: string
  ) {
    console.log(`Updating navigation bar links for ${navId} to target ${targetGroup}`);
    
    try {
      // Get all collections
      const collections = figma.variables.getLocalVariableCollections();
      
      // Find the collection objects
      const navbarCollection = collections.find(c => c.name === collection);
      const modesCollection = collections.find(c => c.name === targetCollection);
      
      if (!navbarCollection || !modesCollection) {
        console.error(`Collection not found: NavBar=${!!navbarCollection}, Modes=${!!modesCollection}`);
        return;
      }
      
      // Get all variables
      const allVariables = figma.variables.getLocalVariables();
      
      // Find the navbar variables related to this navId
      const navbarVariables = allVariables.filter(v => 
        v.variableCollectionId === navbarCollection.id && 
        v.name.includes(navId)
      );
      
      if (navbarVariables.length === 0) {
        console.warn(`No navbar variables found for ${navId}`);
        return;
      }
      
      // Find the navbar mode ID
      const navbarModeId = navbarCollection.modes.find(m => m.name === mode)?.modeId;
      if (!navbarModeId) {
        console.error(`Mode "${mode}" not found in ${collection} collection`);
        return;
      }
      
      // Find the target background variables
      const targetGroupVariables = allVariables.filter(v => 
        v.variableCollectionId === modesCollection.id && 
        v.name.includes(targetGroup)
      );
      
      if (targetGroupVariables.length === 0) {
        console.error(`No target variables found for group ${targetGroup}`);
        return;
      }
      
      // Find the active mode in the target collection
      let targetModeId = modesCollection.defaultModeId;
      if (activeMode) {
        const targetMode = modesCollection.modes.find(m => m.name === activeMode);
        if (targetMode) {
          targetModeId = targetMode.modeId;
        } else {
          console.warn(`Active mode "${activeMode}" not found in target collection, using default mode`);
        }
      }
      
      // Update each navbar variable
      for (const navVar of navbarVariables) {
        // Extract the component type from the variable name
        // Expected format: NavId-ComponentType or NavId-ComponentType-SubType
        const match = navVar.name.match(new RegExp(`${navId}-([^-]+)(-(.+))?$`));
        
        if (match) {
          const componentType = match[1]; // e.g., "Surface", "Container", "Border"
          const subType = match[3] || ""; // e.g., "Dim", "Text", etc.
          
          // Find the corresponding target variable
          let targetVar;
          
          // Try exact component type match first
          if (subType) {
            // With subtype, like "Surface-Dim"
            targetVar = targetGroupVariables.find(v => 
              v.name.includes(`${componentType}-${subType}`) || 
              v.name.endsWith(`/${componentType}-${subType}`)
            );
          }
          
          // If not found, try just the component type
          if (!targetVar) {
            targetVar = targetGroupVariables.find(v => 
              v.name.includes(`/${componentType}`) || 
              v.name.endsWith(`/${componentType}`)
            );
          }
          
          // If still not found, try a generic match
          if (!targetVar) {
            targetVar = targetGroupVariables.find(v => 
              v.name.toLowerCase().includes(componentType.toLowerCase())
            );
          }
          
          if (targetVar) {
            // Set the navbar variable to reference the target variable
            navVar.setValueForMode(navbarModeId, {
              type: 'VARIABLE_ALIAS',
              id: targetVar.id
            });
            
            console.log(`✅ Linked ${navVar.name} to ${targetVar.name}`);
          } else {
            console.warn(`❌ Could not find a matching target variable for ${navVar.name}`);
          }
        } else {
          console.warn(`❓ Could not parse component type from ${navVar.name}`);
        }
      }
      
      figma.ui.postMessage({
        type: 'navbar-links-updated',
        navId,
        targetGroup,
        success: true
      });
      
    } catch (error) {
      console.error('Error updating navigation bar links:', error);
      figma.ui.postMessage({
        type: 'navbar-links-updated',
        navId,
        targetGroup,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
 * Debug handler to get information about variables and collections
 */
function handleDebugGetVariablesInfo() {
  console.group('DEBUG: Variables Info');
  
  try {
    // Get all collections
    const collections = figma.variables.getLocalVariableCollections();
    console.log('Collections:', collections.map(c => ({
      id: c.id,
      name: c.name,
      modes: c.modes.map(m => ({
        modeId: m.modeId,
        name: m.name
      }))
    })));
    
    // Check for the NavBar collection
    const navbarCollection = collections.find(c => c.name === 'NavBar');
    console.log('NavBar collection found:', !!navbarCollection);
    
    if (navbarCollection) {
      console.log('NavBar modes:', navbarCollection.modes);
      
      // Get all variables in the NavBar collection
      const navbarVariables = figma.variables.getLocalVariables()
        .filter(v => v.variableCollectionId === navbarCollection.id);
      
      console.log('NavBar variables:', navbarVariables.map(v => ({
        id: v.id,
        name: v.name,
        resolvedType: v.resolvedType
      })));
      
      // Look for Nav-1 variables specifically
      const nav1Variables = navbarVariables.filter(v => v.name.includes('Nav-1'));
      console.log('Nav-1 variables:', nav1Variables.map(v => v.name));
    }
    
    // Check for the Modes collection
    const modesCollection = collections.find(c => c.name === 'Modes');
    console.log('Modes collection found:', !!modesCollection);
    
    if (modesCollection) {
      console.log('Modes collection modes:', modesCollection.modes);
      
      // Get all variables in the Backgrounds/Default group
      const defaultBgVariables = figma.variables.getLocalVariables()
        .filter(v => 
          v.variableCollectionId === modesCollection.id && 
          v.name.includes('Backgrounds/Default')
        );
      
      console.log('Default background variables:', defaultBgVariables.map(v => ({
        id: v.id,
        name: v.name
      })));
    }
  } catch (error) {
    console.error('Error in debug handler:', error);
  }
  
  console.groupEnd();
  
  // Send results back to UI
  figma.ui.postMessage({
    type: 'debug-variables-info-result',
    success: true
  });
}

/**
 * Debug handler to try a basic navbar update
 */
function handleDebugUpdateNavbar(msg: any) {
  console.group('DEBUG: Update Navbar');
  console.log('Received message:', msg);
  
  try {
    // Get collections
    const collections = figma.variables.getLocalVariableCollections();
    const navbarCollection = collections.find(c => c.name === msg.collection);
    const modesCollection = collections.find(c => c.name === msg.targetCollection);
    
    console.log('NavBar collection:', navbarCollection?.name);
    console.log('Modes collection:', modesCollection?.name);
    
    if (!navbarCollection || !modesCollection) {
      console.error('Missing collection(s)');
      return;
    }
    
    // Find the mode in NavBar collection
    const navMode = navbarCollection.modes.find(m => m.name === msg.mode);
    console.log('NavBar mode found:', navMode?.name);
    
    if (!navMode) {
      console.error(`Mode "${msg.mode}" not found in ${msg.collection}`);
      return;
    }
    
    // Find the active mode in Modes collection
    let targetMode = modesCollection.defaultModeId;
    if (msg.activeMode) {
      const modeObj = modesCollection.modes.find(m => m.name === msg.activeMode);
      if (modeObj) {
        targetMode = modeObj.modeId;
        console.log('Target mode found:', msg.activeMode);
      } else {
        console.warn(`Active mode not found: ${msg.activeMode}, using default`);
      }
    }
    
    // Get all variables
    const allVariables = figma.variables.getLocalVariables();
    
    // Find Nav-1 variables
    const navbarVariables = allVariables.filter(v => 
      v.variableCollectionId === navbarCollection.id && 
      v.name.includes(msg.navId)
    );
    console.log(`Found ${navbarVariables.length} navbar variables for ${msg.navId}`);
    
    // Find target group variables
    const targetGroupVariables = allVariables.filter(v => 
      v.variableCollectionId === modesCollection.id && 
      v.name.includes(msg.targetGroup)
    );
    console.log(`Found ${targetGroupVariables.length} target variables for ${msg.targetGroup}`);
    
    // Try updating a single variable as a test
    if (navbarVariables.length > 0 && targetGroupVariables.length > 0) {
      const navVar = navbarVariables[0];
      const targetVar = targetGroupVariables[0];
      
      console.log(`Trying to update ${navVar.name} to reference ${targetVar.name}`);
      
      // Try setting the value
      try {
        navVar.setValueForMode(navMode.modeId, {
          type: 'VARIABLE_ALIAS',
          id: targetVar.id
        });
        console.log('✅ Successfully updated test variable');
      } catch (err) {
        console.error('❌ Error setting variable value:', err);
      }
    }
  } catch (error) {
    console.error('Error in debug update navbar handler:', error);
  }
  
  console.groupEnd();
  
  // Send results back to UI
  figma.ui.postMessage({
    type: 'debug-update-navbar-result',
    success: true
  });
}

/**
 * Directly updates a navbar variable with a specific color or value
 * This bypasses the aliasing approach which might be causing issues
 */
async function directUpdateNavbarVariable(msg: any) {
  console.group('Direct Update Navbar Variable');
  console.log('Message:', msg);
  
  try {
    const { navId, variableName, value, mode } = msg;
    
    // Get NavBar collection
    const collections = figma.variables.getLocalVariableCollections();
    const navbarCollection = collections.find(c => c.name === 'NavBar');
    
    if (!navbarCollection) {
      console.error('NavBar collection not found');
      return;
    }
    
    // Find mode ID
    const modeId = navbarCollection.modes.find(m => m.name === mode)?.modeId;
    if (!modeId) {
      console.error(`Mode "${mode}" not found in NavBar collection`);
      return;
    }
    
    // Find the specific variable
    const fullVariableName = `${navId}-${variableName}`;
    const variable = figma.variables.getLocalVariables()
      .find(v => 
        v.variableCollectionId === navbarCollection.id && 
        v.name === fullVariableName
      );
    
    if (!variable) {
      console.error(`Variable "${fullVariableName}" not found`);
      return;
    }
    
    // For color values, convert hex to RGBA
    let finalValue = value;
    if (typeof value === 'string' && value.startsWith('#')) {
      if (value.length === 9) { // 8-digit hex (#RRGGBBAA)
        const r = parseInt(value.substr(1,2), 16) / 255;
        const g = parseInt(value.substr(3,2), 16) / 255;
        const b = parseInt(value.substr(5,2), 16) / 255;
        const a = parseInt(value.substr(7,2), 16) / 255;
        finalValue = { r, g, b, a };
      } else { // 6-digit hex (#RRGGBB)
        const r = parseInt(value.substr(1,2), 16) / 255;
        const g = parseInt(value.substr(3,2), 16) / 255;
        const b = parseInt(value.substr(5,2), 16) / 255;
        finalValue = { r, g, b, a: 1 };
      }
    }
    
    // Set the value directly
    variable.setValueForMode(modeId, finalValue);
    console.log(`✅ Successfully updated ${fullVariableName} to ${value}`);
    
    figma.ui.postMessage({
      type: 'direct-update-result',
      navId,
      variableName,
      success: true
    });
  } catch (error) {
    console.error('Error in direct update:', error);
    figma.ui.postMessage({
      type: 'direct-update-result',
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
  
  console.groupEnd();
}

async function copyAllModeVariables(collectionName: string, fromMode: string, toMode: string) {
  const collections = figma.variables.getLocalVariableCollections();
  
  const collection = collections.find(c => c.name === collectionName);
  if (!collection) {
    figma.notify(`Collection ${collectionName} not found`);
    return;
  }
  const fromModeId = collection.modes.find(mode => mode.name === fromMode)?.modeId;
  const toModeId = collection.modes.find(mode => mode.name === toMode)?.modeId;
  
  if (!fromModeId || !toModeId) {
    figma.notify(`Mode not found: ${fromMode} or ${toMode}`);
    return;
  }
  collection.variableIds.forEach(variableId => {
    const variable = figma.variables.getVariableById(variableId);
    if (variable) {
      const sourceValue = variable.valuesByMode[fromModeId];
      if (sourceValue !== undefined) {
        variable.setValueForMode(toModeId, sourceValue);
      }
    }
  });
}
  
/**
 * Updates status bar links to point to the background variables
 * Similar to updateNavigationBarLinks but for status bars
 */
async function updateStatusBarLinks(
  statusId: string,
  collection: string,
  mode: string,
  targetCollection: string,
  targetGroup: string,
  activeMode?: string
) {
  console.log(`Updating status bar links for ${statusId} to target ${targetGroup}`);
  
  try {
    // Implementation is similar to updateNavigationBarLinks
    const collections = figma.variables.getLocalVariableCollections();
    
    const statusbarCollection = collections.find(c => c.name === collection);
    const modesCollection = collections.find(c => c.name === targetCollection);
    
    if (!statusbarCollection || !modesCollection) {
      console.error(`Collection not found: StatusBar=${!!statusbarCollection}, Modes=${!!modesCollection}`);
      return;
    }
    
    const allVariables = figma.variables.getLocalVariables();
    
    const statusbarVariables = allVariables.filter(v => 
      v.variableCollectionId === statusbarCollection.id && 
      v.name.includes(statusId)
    );
    
    if (statusbarVariables.length === 0) {
      console.warn(`No statusbar variables found for ${statusId}`);
      return;
    }
    
    const statusbarModeId = statusbarCollection.modes.find(m => m.name === mode)?.modeId;
    if (!statusbarModeId) {
      console.error(`Mode "${mode}" not found in ${collection} collection`);
      return;
    }
    
    const targetGroupVariables = allVariables.filter(v => 
      v.variableCollectionId === modesCollection.id && 
      v.name.includes(targetGroup)
    );
    
    if (targetGroupVariables.length === 0) {
      console.error(`No target variables found for group ${targetGroup}`);
      return;
    }
    
    let targetModeId = modesCollection.defaultModeId;
    if (activeMode) {
      const targetMode = modesCollection.modes.find(m => m.name === activeMode);
      if (targetMode) {
        targetModeId = targetMode.modeId;
      } else {
        console.warn(`Active mode "${activeMode}" not found in target collection, using default mode`);
      }
    }
    
    for (const statusVar of statusbarVariables) {
      const match = statusVar.name.match(new RegExp(`${statusId}-([^-]+)(-(.+))?$`));
      
      if (match) {
        const componentType = match[1];
        const subType = match[3] || "";
        
        let targetVar;
        
        if (subType) {
          targetVar = targetGroupVariables.find(v => 
            v.name.includes(`${componentType}-${subType}`) || 
            v.name.endsWith(`/${componentType}-${subType}`)
          );
        }
        
        if (!targetVar) {
          targetVar = targetGroupVariables.find(v => 
            v.name.includes(`/${componentType}`) || 
            v.name.endsWith(`/${componentType}`)
          );
        }
        
        if (!targetVar) {
          targetVar = targetGroupVariables.find(v => 
            v.name.toLowerCase().includes(componentType.toLowerCase())
          );
        }
        
        if (targetVar) {
          statusVar.setValueForMode(statusbarModeId, {
            type: 'VARIABLE_ALIAS',
            id: targetVar.id
          });
          
          console.log(`✅ Linked ${statusVar.name} to ${targetVar.name}`);
        } else {
          console.warn(`❌ Could not find a matching target variable for ${statusVar.name}`);
        }
      } else {
        console.warn(`❓ Could not parse component type from ${statusVar.name}`);
      }
    }
    
    figma.ui.postMessage({
      type: 'statusbar-links-updated',
      statusId,
      targetGroup,
      success: true
    });
    
  } catch (error) {
    console.error('Error updating status bar links:', error);
    figma.ui.postMessage({
      type: 'statusbar-links-updated',
      statusId,
      targetGroup,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Message handler
figma.ui.onmessage = (msg) => {
  console.log('🔍 Message received in plugin:', msg);

  if (msg.type === 'update-page-backgrounds-to-surface-dim') {
    updateAllPageBackgroundsToSurfaceDim(msg.color);
  }

  // Handle the new message type for copying shadow variables
  if (msg.type === 'copy-shadow-variables') {
    const { collection, sourceMode, targetMode } = msg;
    
    // Get the variable collection by name
    figma.variables.getLocalVariableCollectionsAsync()
      .then(collections => {
        const targetCollection = collections.find(c => c.name === collection);
        
        if (!targetCollection) {
          console.error(`Collection "${collection}" not found`);
          return Promise.reject(`Collection "${collection}" not found`);
        }
        
        // Get the mode IDs
        const sourceModeId = targetCollection.modes.find(m => m.name === sourceMode)?.modeId;
        const targetModeId = targetCollection.modes.find(m => m.name === targetMode)?.modeId;
        
        if (!sourceModeId || !targetModeId) {
          console.error(`Mode "${!sourceModeId ? sourceMode : targetMode}" not found in collection "${collection}"`);
          return Promise.reject(`Mode not found in collection "${collection}"`);
        }
        
        // Get all variables in the collection
        return figma.variables.getLocalVariablesAsync()
          .then(variables => {
            const collectionVariables = variables.filter(v => v.variableCollectionId === targetCollection.id);
            
            // Process each variable one by one
            const updatePromises = collectionVariables.map(variable => {
              const sourceValue = variable.valuesByMode[sourceModeId];
              if (sourceValue !== undefined) {
                return variable.setValueForMode(targetModeId, sourceValue);
              }
              return Promise.resolve();
            });
            
            return Promise.all(updatePromises)
              .then(() => {
                console.log(`Copied ${collectionVariables.length} variables from "${sourceMode}" to "${targetMode}" in "${collection}"`);
              });
          });
      })
      .catch(error => {
        console.error('Error copying shadow variables:', error);
      });
  }

  switch (msg.type) {

    
    case 'update-page-backgrounds':
      updateAllPageBackgrounds(msg.color);
      break;

    // Add this to your existing message handler in code.ts
case 'update-variable':
  try {
    const { collection, variable, value, mode = "Default" } = msg;
    console.log(`Updating variable: ${collection}/${variable} to ${value} in mode ${mode}`);
    
    // Get the collection
    const collections = figma.variables.getLocalVariableCollections();
    const targetCollection = collections.find(c => c.name === collection);
    
    if (!targetCollection) {
      console.error(`Collection not found: ${collection}`);
      figma.notify(`Error: Collection "${collection}" not found`, { error: true });
      return;
    }
    
    // Get the mode
    const modeId = targetCollection.modes.find(m => m.name === mode)?.modeId;
    
    if (!modeId) {
      console.error(`Mode not found: ${mode} in collection ${collection}`);
      figma.notify(`Error: Mode "${mode}" not found in collection "${collection}"`, { error: true });
      return;
    }
    
    // Find the variable
    const variables = figma.variables.getLocalVariables();
    const targetVariable = variables.find(v => 
      v.name === variable && 
      v.variableCollectionId === targetCollection.id
    );
    
    if (!targetVariable) {
      console.error(`Variable not found: ${variable} in collection ${collection}`);
      figma.notify(`Error: Variable "${variable}" not found in collection "${collection}"`, { error: true });
      return;
    }
    
    // Update the variable value
    targetVariable.setValueForMode(modeId, value);
    
    console.log(`Successfully updated ${collection}/${variable} to ${value} in mode ${mode}`);
    figma.notify(`Updated ${variable} to ${value}`);
    
    // Send confirmation back to UI
    figma.ui.postMessage({
      type: 'variable-updated',
      collection,
      variable,
      value,
      success: true
    });
  } catch (error) {
    console.error('Error updating variable:', error);
    figma.notify(`Error updating variable: ${error instanceof Error ? error.message : String(error)}`, { error: true });
    
    // Send error back to UI
    figma.ui.postMessage({
      type: 'variable-updated',
      collection: msg.collection,
      variable: msg.variable,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
  break;  

  // Add these cases to your message handler in code.ts

case 'save-custom-pairs':
  try {
    const customPairs = msg.pairs;
    console.log('Saving custom font pairs:', customPairs);

    // Save to Figma's client storage
    figma.clientStorage.setAsync('customFontPairs', customPairs)
      .then(() => {
        console.log('Custom font pairs saved successfully');
        figma.ui.postMessage({
          type: 'custom-pairs-saved',
          success: true
        });
      })
      .catch(error => {
        console.error('Error saving custom font pairs:', error);
        figma.ui.postMessage({
          type: 'custom-pairs-saved',
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      });
  } catch (error) {
    console.error('Error processing save-custom-pairs:', error);
  }
  break;

case 'load-custom-pairs':
  try {
    console.log('Loading custom font pairs');
    
    // Load from Figma's client storage
    figma.clientStorage.getAsync('customFontPairs')
      .then(pairs => {
        if (pairs) {
          console.log('Loaded custom font pairs:', pairs);
          figma.ui.postMessage({
            type: 'custom-pairs-loaded',
            pairs: pairs
          });
        } else {
          console.log('No custom font pairs found');
          figma.ui.postMessage({
            type: 'custom-pairs-loaded',
            pairs: []
          });
        }
      })
      .catch(error => {
        console.error('Error loading custom font pairs:', error);
        figma.ui.postMessage({
          type: 'custom-pairs-loaded',
          pairs: [],
          error: error instanceof Error ? error.message : String(error)
        });
      });
  } catch (error) {
    console.error('Error processing load-custom-pairs:', error);
    figma.ui.postMessage({
      type: 'custom-pairs-loaded',
      pairs: []
    });
  }
  break;
      
// Then modify your update-design-token case to handle font loading:
case 'update-design-token':
  (async () => {
    try {
      const { collection: collectionName, group, mode, variable: variableName, value } = msg;
      console.log(`Updating ${collectionName}/${group}/${variableName} in mode ${mode} with value:`, value);

      // Get or create the collection
      const collection = getOrCreateCollection(collectionName);

      // Get or create the mode
      let modeId = collection.modes.find(m => m.name === mode)?.modeId;
      if (!modeId) {
        modeId = collection.addMode(mode);
        console.log(`Created mode "${mode}"`);
      }

      // Determine variable type based on value
      let varType: VariableResolvedDataType = 'STRING';
      if (typeof value === 'string' && value.startsWith('#')) {
        varType = 'COLOR';
      } else if (typeof value === 'number') {
        varType = 'FLOAT';
      }

      // Create full variable name including group
      const fullVariableName = group ? `${group}/${variableName}` : variableName;

      // Get or create the variable
      const variable = getOrCreateVariable(fullVariableName, collection.id, varType);

// Special handling for font names - use the loadAndSetFont function
if (group === 'Font-Families' && typeof value === 'string') {
  try {
    // Special case handling
    const specialFonts: {[key: string]: string} = {
      "poiret one": "Poiret One",
      "dancing script": "Dancing Script",
      "nunito sans": "Nunito Sans",
      "work sans": "Work Sans",
      "pt sans": "PT Sans",
      "pt serif": "PT Serif",
      "dm sans": "DM Sans",
      "source sans pro": "Source Sans Pro",
      "source serif pro": "Source Serif Pro"
    };
    
    // Check if it's a special font case (case insensitive)
    const lowerValue = value.toLowerCase();
    let cleanFontName = value;
    
    if (specialFonts[lowerValue]) {
      cleanFontName = specialFonts[lowerValue];
      console.log(`Using special case handling for ${value}: ${cleanFontName}`);
    } else {
      // Normal cleaning for other fonts
      cleanFontName = value
        .replace(/\s*(Display|Medium|Bold|Light|Black|Thin|Regular|Italic|ExtraBold|SemiBold|ExtraLight|Condensed|Extended|Narrow|Sans Serif|Serif)\s*/gi, '')
        .replace(/\s*,.*$/, '') // Remove any text after a comma
        .trim();
    }
    
    console.log(`Processing font: "${value}" -> cleaned to: "${cleanFontName}"`);
    
    // Load and set the font
    await loadAndSetFont(variable, modeId, cleanFontName);
    
    console.log(`Successfully set font ${fullVariableName} to ${cleanFontName}`);
    
    // Notify UI of success
    figma.ui.postMessage({
      type: 'design-token-updated',
      variable: variableName,
      value: cleanFontName,
      success: true
    });
  } catch (fontError) {
    console.error(`Font loading error:`, fontError);
    
    // Notify UI of error
    figma.ui.postMessage({
      type: 'design-token-updated',
      variable: variableName,
      success: false,
      error: fontError instanceof Error ? fontError.toString() : 'Font loading error'
    });
  }
}
      // Handle other value types
      else {
        let finalValue = value;
        
        // Convert color strings to RGBA if needed
        if (varType === 'COLOR' && typeof value === 'string') {
          if (value.length === 9) { // 8-digit hex (#RRGGBBAA)
            const r = parseInt(value.substr(1,2), 16) / 255;
            const g = parseInt(value.substr(3,2), 16) / 255;
            const b = parseInt(value.substr(5,2), 16) / 255;
            const a = parseInt(value.substr(7,2), 16) / 255;
            finalValue = { r, g, b, a };
          } else { // 6-digit hex (#RRGGBB)
            const r = parseInt(value.substr(1,2), 16) / 255;
            const g = parseInt(value.substr(3,2), 16) / 255;
            const b = parseInt(value.substr(5,2), 16) / 255;
            finalValue = { r, g, b, a: 1 };
          }
        }

        // Set the value for the specific mode
        variable.setValueForMode(modeId, finalValue);
        console.log(`Successfully updated ${fullVariableName} in ${collectionName} for mode ${mode}`);

        // Notify UI of success
        figma.ui.postMessage({
          type: 'design-token-updated',
          variable: variableName,
          value: finalValue,
          success: true
        });
      }
    } catch (err) {
      console.error('Error updating design token:', err);
      const errorMessage = err instanceof Error ? err.toString() : 'An unknown error occurred';
      figma.ui.postMessage({
        type: 'design-token-updated',
        variable: msg.variable,
        success: false,
        error: errorMessage
      });
    }
  })();
  break;

  // Add this case to your message handler in code.ts

case 'check-font-availability-api':
  (async () => {
    try {
      const fontName = msg.fontName;
      console.log(`Checking font availability for: ${fontName}`);
      
      // List all available fonts using Figma's API
      const availableFonts = await figma.listAvailableFontsAsync();
      
      // Check if the requested font exists in any case-insensitive variant
      const fontExists = availableFonts.some(font => 
        font.fontName.family.toLowerCase().includes(fontName.toLowerCase()) ||
        fontName.toLowerCase().includes(font.fontName.family.toLowerCase())
      );
      
      console.log(`Font "${fontName}" availability: ${fontExists}`);
      
      // Send the result back to the UI
      figma.ui.postMessage({
        type: 'font-availability-result',
        fontName: fontName,
        available: fontExists
      });
    } catch (error) {
      console.error(`Error checking font availability: ${error}`);
      // In case of error, assume the font is available to prevent false warnings
      figma.ui.postMessage({
        type: 'font-availability-result',
        fontName: msg.fontName,
        available: true
      });
    }
  })();
  break;

    case 'insert-image': {
      const targetFrame = figma.currentPage.findOne(node => 
        node.type === 'FRAME' && node.name === msg.frameName
      ) as FrameNode;
      
      if (targetFrame) {
        // First, remove any existing rectangles in this frame
        const existingImages = targetFrame.findChildren(node => 
          node.type === 'RECTANGLE'
        );
        
        existingImages.forEach(node => node.remove());

        // Then create and insert the new image
        const image = figma.createImage(msg.imageBytes);
        const imageNode = figma.createRectangle();
        
        imageNode.resize(targetFrame.width, targetFrame.height);
        imageNode.fills = [{ 
          type: 'IMAGE', 
          imageHash: image.hash, 
          scaleMode: 'FILL' 
        }];
        
        targetFrame.appendChild(imageNode);
      }
      break;
    }

    case 'update-button-shape':
      console.log('Updating button shape to:', msg.shape);
      updateButtonShape(msg.variables);
      break;

    // In code.ts, in the figma.ui.onmessage switch statement
    case 'copy-all-mode-variables':
      copyAllModeVariables(msg.collection, msg.fromMode, msg.toMode);
      break;


    case 'update-navbar-background': {
      console.log('Received update-navbar-background message:', msg);
      
      try {
        const { navId, backgroundName, isDefaultSurfaceDim } = msg;
        
        // List all collections to check what's available
        const collections = figma.variables.getLocalVariableCollections();
        console.log('Available collections:', collections.map(c => c.name));
        
        // Just log this information and don't try to process it yet
        console.log(`Request to update ${navId} to background ${backgroundName}`);
        console.log(`isDefaultSurfaceDim: ${isDefaultSurfaceDim}`);
        
        figma.notify(`Received request to update ${navId} to ${backgroundName}`);
      } catch (error) {
        console.error('Error in update-navbar-background handler:', error);
      }
      
      break;
    }

    // Add this to the code.ts message handler
      case 'debug-variable-update-log': {
        const { operation, target, result, details } = msg;
        console.group(`🧪 DEBUG: ${operation} on ${target}`);
        console.log('Result:', result);
        if (details) console.log('Details:', details);
        console.groupEnd();
        
        // Show a notification in Figma for immediate feedback
        figma.notify(`${operation}: ${result ? '✅' : '❌'} ${details?.slice(0, 30) || ''}`);
        break;
      }

    case 'PLUGIN_UI_READY':
      console.log('🔍 Plugin UI is ready');
      break;

    case 'copy-token-value':
      try {
        const { collection: collectionName, group, fromMode, toMode, variable: variableName } = msg;
        const collection = getOrCreateCollection(collectionName);
        
        const fromModeId = collection.modes.find(m => m.name === fromMode)?.modeId;
        const toModeId = collection.modes.find(m => m.name === toMode)?.modeId;
        
        if (!fromModeId || !toModeId) {
          console.error(`Mode not found: From ${fromMode}, To ${toMode}`);
          return;
        }

        const fullVariableName = group ? `${group}/${variableName}` : variableName;
        
        const variable = figma.variables.getLocalVariables().find(
          v => v.name === fullVariableName && v.variableCollectionId === collection.id
        );

        if (!variable) {
          console.error(`Variable ${fullVariableName} not found`);
          return;
        }

        const sourceValue = variable.valuesByMode[fromModeId];
        variable.setValueForMode(toModeId, sourceValue);

      } catch (err) {
        console.error('Error copying token value:', err);
      }
      break;

    case 'update-statusbar-links':
      updateStatusBarLinks(
        msg.statusId,
        msg.collection,
        msg.mode,
        msg.targetCollection,
        msg.targetGroup,
        msg.activeMode
      );
      break;

    // New handlers for improved variable linking
    case 'link-variable': {
      console.log('Link variable request received:', msg);
      
      // Extract the parameters but don't do anything with them yet
      const { sourceCollection, sourceMode, sourceVariable, targetCollection, targetMode, targetVariable } = msg;
      
      // Just log the information for now to avoid errors
      figma.notify(`Link request: ${sourceMode}/${sourceVariable} → ${targetMode}/${targetVariable}`);
      break;
    }

// Handle bulk updates for multiple navbar and statusbar links
case 'bulk-update-navbar-links':
console.log('Processing bulk navbar/statusbar updates:', msg);

// Process all navbar updates
if (msg.navbarUpdates && Array.isArray(msg.navbarUpdates)) {
  msg.navbarUpdates.forEach((update: any) => {
    updateNavigationBarLinks(
      update.navId,
      update.collection,
      update.mode,
      update.targetCollection,
      update.targetGroup,
      update.activeMode
    );
  });
}

// Process all statusbar updates
if (msg.statusbarUpdates && Array.isArray(msg.statusbarUpdates)) {
  msg.statusbarUpdates.forEach((update: any) => {
    updateStatusBarLinks(
      update.statusId,
      update.collection,
      update.mode,
      update.targetCollection,
      update.targetGroup,
      update.activeMode
    );
  });
}
break;
  }
};

console.log('🔍 Plugin successfully connected to Figma');

figma.ui.postMessage({ 
  type: 'ui-ready',
  fontDatabase: {}
});

} catch (err) {
  const errorMessage = err instanceof Error ? err.toString() : 'An unknown error occurred';
  console.error('An error occurred:', errorMessage);
}

console.log('PLUGIN FINISHED');