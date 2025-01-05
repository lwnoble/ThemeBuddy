// src/plugin/code.ts
import { fontData, moodFiles } from '../app/data/fontData';

figma.showUI(__html__, {
    width: 480,
    height: 640,
    themeColors: true
  });
  
  // When UI is ready, start processing CSVs
  figma.ui.onmessage = async (msg) => {
    if (msg.type === 'ui-ready') {
      // Start CSV processing
      figma.ui.postMessage({ 
        type: 'process-csv-files',
        fontData: fontData,
        files: moodFiles
      });
    }
  
    if (msg.type === 'database-ready') {
      console.log('Font database has been built');
    }
  
    if (msg.type === 'database-error') {
      console.error('Error building font database:', msg.error);
    }
  };