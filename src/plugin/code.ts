console.log('PLUGIN STARTED');

try {
  'use strict';

  console.log('🔍 Figma Plugin Code Loading');

  figma.showUI(__html__, {
    width: 460,
    height: 700
  });

  console.log('🔍 Figma Plugin UI Shown');

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

  // Message handler
  // Message handler
figma.ui.onmessage = (msg) => {
  console.log('🔍 Message received in plugin:', msg);

  switch (msg.type) {
    case 'update-design-token':
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
        let varType: VariableResolvedDataType = 'FLOAT';
        if (typeof value === 'string' && value.startsWith('#')) {
          varType = 'COLOR';
        }

        // Create full variable name including group
        const fullVariableName = group ? `${group}/${variableName}` : variableName;

        // Get or create the variable
        const variable = getOrCreateVariable(fullVariableName, collection.id, varType);

        // Convert color strings to RGBA if needed
        let finalValue = value;
        if (varType === 'COLOR' && typeof value === 'string') {
          const r = parseInt(value.substr(1,2), 16) / 255;
          const g = parseInt(value.substr(3,2), 16) / 255;
          const b = parseInt(value.substr(5,2), 16) / 255;
          finalValue = { r, g, b, a: 1 };
        }

        // Set the value for the specific mode
        variable.setValueForMode(modeId, finalValue);
        console.log(`Successfully updated ${fullVariableName} in ${collectionName} for mode ${mode}`);

        // Notify UI of success
        figma.ui.postMessage({
          type: 'design-token-updated',
          variable: fullVariableName,
          success: true
        });
      } catch (err) {
        console.error('Error updating design token:', err);
        const errorMessage = err instanceof Error ? err.toString() : 'An unknown error occurred';
        figma.ui.postMessage({
          type: 'design-token-updated',
          success: false,
          error: errorMessage
        });
      }
      break;

    case 'PLUGIN_UI_READY':
      console.log('🔍 Plugin UI is ready');
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