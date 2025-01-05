// src/app/data/initFontDatabase.ts

import { MoodType, GoogleFont } from '../types/fonts';
import { fontDatabase } from './fontDataset';  // Import from fontDataset instead

// Using Partial since we don't have all moods
const moodFonts: Partial<Record<MoodType, GoogleFont[]>> = {
  sophisticated: [
    {
      family: "Playfair Display",
      category: "serif",
      variants: ["400", "500", "600", "700"],
      subsets: ["latin"],
      styles: [{
        name: "Playfair Display",
        classification: "Didone",
        mood: ["sophisticated", "elegant"]
      }]
    },
    {
      family: "Montserrat",
      category: "sans-serif",
      variants: ["300", "400", "500", "700"],
      subsets: ["latin"],
      styles: [{
        name: "Montserrat",
        classification: "Geometric",
        mood: ["sophisticated", "modern"]
      }]
    }
  ],
  futuristic: [
    {
      family: "Space Grotesk",
      category: "sans-serif",
      variants: ["300", "400", "500", "700"],
      subsets: ["latin"],
      styles: [{
        name: "Space Grotesk",
        classification: "Geometric",
        mood: ["futuristic", "modern"]
      }]
    }
  ]
};

export function initializeFontDatabase() {
  // Clear existing fonts if needed
  fontDatabase.fonts = [];
  
  // Initialize the database with the preset fonts
  Object.entries(moodFonts).forEach(([mood, fonts]) => {
    if (fonts) {  // Check if fonts exist for this mood
      console.log(`Initializing ${mood} fonts:`, fonts.length);
      fontDatabase.fonts.push(...fonts);
    }
  });
  
  console.log('Font database initialized with', fontDatabase.fonts.length, 'fonts');
  return fontDatabase;
}