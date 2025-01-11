// src/plugin/code.ts
figma.showUI(__html__, {
  width: 480,
  height: 640,
  themeColors: true
});

// When UI is ready
figma.ui.onmessage = async (msg: { type: string; error?: string }) => {
  if (msg.type === 'ui-ready') {
    console.log('UI is ready');
  }

  if (msg.type === 'database-ready') {
    console.log('Font database has been built');
  }

  if (msg.type === 'database-error') {
    console.error('Error building font database:', msg.error);
  }
};