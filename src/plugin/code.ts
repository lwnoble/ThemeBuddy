console.log('PLUGIN STARTED');

try {
  // Strict mode for better error catching
  'use strict';

  console.log('🔍 Figma Plugin Code Loading');

  // Show the UI with minimal options
  figma.showUI(__html__, {
    width: 460,
    height: 700
  });

  console.log('🔍 Figma Plugin UI Shown');

  // Function to push variable to collection
  function pushVariableToCollection() {
    console.log('Attempting to push variable to collection');
    // Check if the collection exists, if not create it
    let collection = figma.variables.getLocalVariableCollections().find(c => c.name === "System-Styles");
    if (!collection) {
      collection = figma.variables.createVariableCollection("System-Styles");
      console.log('Created "System-Styles" collection');
    } else {
      console.log('"System-Styles" collection already exists');
    }

    // Check if the variable exists, if not create it
    let variable = figma.variables.getLocalVariables().find(v => v.name === "Button-border-radius" && v.variableCollectionId === collection.id);
    if (!variable) {
      variable = figma.variables.createVariable("Button-border-radius", collection.id, 'FLOAT');
      console.log('Created "Button-border-radius" variable');
    } else {
      console.log('"Button-border-radius" variable already exists');
    }

    // Set the value of the variable
    variable.setValueForMode(collection.defaultModeId, 16);
    console.log('Set "Button-border-radius" to 16');
  }

  // Basic message handler
  figma.ui.onmessage = (msg) => {
    console.log('🔍 Message received in plugin:', msg);

    // You can add specific message handling here
    switch (msg.type) {
      case 'PLUGIN_UI_READY':
        console.log('🔍 Plugin UI is ready');
        break;
      
      case 'update-design-token':
        console.log('🔍 Design token update received:', msg);
        break;
    }
  };

  // Confirm connection to Figma and push variable
  console.log('🔍 Plugin successfully connected to Figma');
  pushVariableToCollection();

  // Send initial ready message
  console.log('🔍 Sending plugin ready message');
  // Send UI ready message
  figma.ui.postMessage({ 
    type: 'ui-ready',
    fontDatabase: {} // Add any initial data if needed
  });

} catch (error) {
  console.error('An error occurred:', error);
}

console.log('PLUGIN FINISHED');