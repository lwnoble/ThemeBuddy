// src/app/data/fontDataset.ts

import * as Papa from 'papaparse';
import { MoodType, GoogleFont, FontDatabase } from '../types/fonts';

interface CSVRow {
  'Font Name': string;
  'Serif': string | number;
  'Sans Serif': string | number;
  'Monospace': string | number;
  'Calligraphy': string | number;
  'Display/Decorative': string | number;
}

// Initialize empty database
export const fontDatabase: FontDatabase = {
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  fonts: [] as GoogleFont[]
};

// Initialize empty dataset for mood-specific fonts
export const fontDataset: Record<string, GoogleFont[]> = {};

// Default fonts for immediate availability
const defaultFonts: Partial<Record<MoodType, GoogleFont[]>> = {
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

// Initialize with default fonts
export function initializeDefaultFonts() {
  Object.entries(defaultFonts).forEach(([mood, fonts]) => {
    if (fonts) {
      addFontsToMood(mood, fonts);
    }
  });
}

// CSV Processing Functions
export async function buildFontDatabase(csvContent: string, mood: string): Promise<GoogleFont[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<CSVRow>) => {
        const fonts: GoogleFont[] = results.data
          .filter(row => row['Font Name'])
          .map(row => ({
            family: row['Font Name'],
            category: determineCategory(row),
            variants: ['400', '700'],
            subsets: ['latin'],
            styles: [{
              name: row['Font Name'],
              classification: determineClassification(row),
              mood: [mood]
            }]
          }));
        resolve(fonts);
      },
      error: (error: Error) => {
        reject(error);
      }
    });
  });
}

function determineCategory(row: CSVRow): string {
  if (row['Serif']) return 'serif';
  if (row['Sans Serif']) return 'sans-serif';
  if (row['Monospace']) return 'monospace';
  if (row['Display/Decorative']) return 'display';
  if (row['Calligraphy']) return 'display';
  return 'sans-serif';
}

function determineClassification(row: CSVRow): string {
  if (row['Serif']) return 'Transitional';
  if (row['Sans Serif']) return 'Neo Grotesque';
  if (row['Display/Decorative']) return 'Display';
  if (row['Calligraphy']) return 'Script';
  return 'Modern';
}

// Dataset Management Functions
export function addFontsToMood(mood: string, fonts: GoogleFont[]) {
  const lowerMood = mood.toLowerCase();
  if (!fontDataset[lowerMood]) {
    fontDataset[lowerMood] = [];
  }
  fontDataset[lowerMood] = fonts;
  
  // Also add to main database if not already present
  fonts.forEach(font => {
    if (!fontDatabase.fonts.some(f => f.family === font.family)) {
      fontDatabase.fonts.push(font);
    }
  });
}

// Query Functions
export function getFontsByMood(mood: MoodType | string): GoogleFont[] {
    console.log('Getting fonts for mood:', mood);
    
    const lowerMood = mood.toLowerCase();
    console.log('Normalized mood (lowercase):', lowerMood);
    
    const fontsFromDataset = fontDataset[lowerMood] || [];
    console.log('Fonts found in dataset:', {
      count: fontsFromDataset.length,
      families: fontsFromDataset.map(f => f.family)
    });
    
    const fontsFromDatabase = fontDatabase.fonts.filter(font => 
      font.styles[0].mood.includes(lowerMood)
    );
    console.log('Fonts found in database:', {
      count: fontsFromDatabase.length,
      families: fontsFromDatabase.map(f => f.family)
    });
    
    // Combine and deduplicate fonts
    const allFonts = [...fontsFromDataset, ...fontsFromDatabase];
    const uniqueFonts = [...new Set(allFonts)];
    
    console.log('Final font collection:', {
      totalBeforeDeduplication: allFonts.length,
      totalAfterDeduplication: uniqueFonts.length,
      families: uniqueFonts.map(f => f.family)
    });
  
    if (uniqueFonts.length === 0) {
      console.warn(`No fonts found for mood: ${mood}`);
    }
    
    return uniqueFonts;
  }

export function getAllFonts(): GoogleFont[] {
  const allFonts = [...fontDatabase.fonts];
  Object.values(fontDataset).forEach(fonts => {
    fonts.forEach(font => {
      if (!allFonts.some(f => f.family === font.family)) {
        allFonts.push(font);
      }
    });
  });
  return allFonts;
}

export function getFontsByCategory(category: string): GoogleFont[] {
  return getAllFonts().filter(font => font.category === category);
}

export function getCategoriesForMood(mood: string): string[] {
  const fonts = getFontsByMood(mood);
  return [...new Set(fonts.map(font => font.category))];
}

// Font Suitability Functions
export function isFontSuitableForHeaders(font: GoogleFont): boolean {
  return font.category === 'serif' || 
         font.category === 'display' ||
         (font.category === 'sans-serif' && 
          !font.styles[0].classification.toLowerCase().includes('body'));
}

export function isFontSuitableForBody(font: GoogleFont): boolean {
  return (font.category === 'serif' || font.category === 'sans-serif') &&
         !font.styles[0].classification.toLowerCase().includes('display');
}

// Initialize default fonts when module is loaded
initializeDefaultFonts();