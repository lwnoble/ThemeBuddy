// src/app/utils/processCSV.ts

import { buildFontDatabase, addFontsToMood } from '../data/fontDataset';

const moodFiles = [
  'Fonts Business.csv',
  'Fonts Calm.csv',
  'Fonts Cute.csv',
  'Fonts Playful.csv',
  'Fonts Elegant.csv',
  'Fonts Stiff.csv',
  'Fonts Vintage.csv',
  'Fonts Happy.csv',
  'Fonts Futuristic.csv',
  'Fonts Excited.csv',
  'Fonts Rugged.csv',
  'Fonts Childlike.csv',
  'Fonts Artistic.csv',
  'Fonts Sophisticated.csv',
  'Fonts Awkward.csv',
  'Fonts Active.csv',
  'Fonts Loud.csv',
  'Fonts Scary.csv'
];

export async function processCSV() {
    console.log('Starting CSV processing for all mood files...');
    
    try {
      // Send message to plugin code to request CSV content
      parent.postMessage({ 
        pluginMessage: { 
          type: 'request-csv-files',
          files: moodFiles 
        }
      }, '*');
  
      // Listen for response from plugin
      window.onmessage = async (event) => {
        const message = event.data.pluginMessage;
        
        if (message.type === 'csv-content') {
          const { file, content } = message;
          const mood = file.replace('Fonts ', '').replace('.csv', '').toLowerCase();
          
          console.log(`Processing ${file} for mood: ${mood}`);
          const fonts = await buildFontDatabase(content, mood);
          addFontsToMood(mood, fonts);
          
          console.log(`Added ${fonts.length} fonts for mood: ${mood}`);
        }
      };
    } catch (error) {
      console.error('Error in CSV processing:', error);
    }
  }

// UI handler (to be added to your ui.tsx or similar)
export function setupUIHandler() {
  window.onmessage = async (event) => {
    const msg = event.data.pluginMessage;
    
    if (msg.type === 'process-csv-files') {
      try {
        for (const file of msg.files) {
          try {
            const response = await fetch(`csv/${file}`);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const content = await response.text();
            
            // Process the CSV content
            const mood = file.replace('Fonts  ', '').replace('.csv', '').toLowerCase();
            const fonts = await buildFontDatabase(content, mood);
            addFontsToMood(mood, fonts);
            
            console.log(`Processed ${file}`);
          } catch (error) {
            console.error(`Error processing ${file}:`, error);
          }
        }

        // Notify plugin that all files have been processed
        parent.postMessage({
          pluginMessage: { type: 'database-ready' }
        }, '*');

      } catch (error) {
        console.error('Error processing CSV files:', error);
        parent.postMessage({
          pluginMessage: {
            type: 'database-error',
            error: error instanceof Error ? error.message : String(error)
          }
        }, '*');
      }
    }
  };
}