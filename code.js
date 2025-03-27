console.log('🔍 FIGMA PLUGIN CODE LOADED');

figma.showUI(__html__, {
  width: 480,
  height: 840
});

console.log('🔍 FIGMA UI SHOWN');

figma.ui.onmessage = (msg) => {
  console.log('🔍 MESSAGE RECEIVED:', msg);
};

// Send a message to confirm plugin is ready
figma.ui.postMessage({ type: 'PLUGIN_READY' });