// src/app/scripts/buildFontDatabase.ts

import * as Papa from 'papaparse';
import { GoogleFont, FontDatabase } from '../types/fonts';

interface CSVRow {
  'Font Name': string;
  'Serif': string | number;
  'Sans Serif': string | number;
  'Monospace': string | number;
  'Calligraphy': string | number;
  'Display/Decorative': string | number;
}

// Initialize empty database with typing
export const fontDatabase: FontDatabase = {
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  fonts: [] as GoogleFont[]
};

export async function buildFontDatabase(csvContent: string, mood: string): Promise<GoogleFont[]> {
  console.log(`Starting to build font database for mood: ${mood}`);
  
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<CSVRow>) => {
        console.log(`Parsing CSV for mood ${mood}:`, {
          totalRows: results.data.length,
          sampleRow: results.data[0]
        });
        
        const fonts: GoogleFont[] = results.data
          .filter(row => {
            const hasName = Boolean(row['Font Name']);
            if (!hasName) {
              console.warn('Skipping row with no font name');
            }
            return hasName;
          })
          .map(row => {
            const font: GoogleFont = {
              family: row['Font Name'],
              category: determineCategory(row),
              variants: ['400', '700'],
              subsets: ['latin'],
              styles: [{
                name: row['Font Name'],
                classification: determineClassification(row),
                mood: [mood]
              }]
            };
            
            console.log(`Processed font: ${font.family} (${font.category})`);
            return font;
          });
        
        console.log(`Generated ${fonts.length} fonts for mood: ${mood}`);
        resolve(fonts);
      },
      error: (error: Error) => {
        console.error(`Error parsing CSV for mood ${mood}:`, error);
        reject(error);
      }
    });
  });
}

function determineCategory(row: CSVRow): string {
  if (Number(row['Serif']) > 0 || row['Serif'] === 'TRUE') return 'serif';
  if (Number(row['Sans Serif']) > 0 || row['Sans Serif'] === 'TRUE') return 'sans-serif';
  if (Number(row['Monospace']) > 0 || row['Monospace'] === 'TRUE') return 'monospace';
  if (Number(row['Display/Decorative']) > 0 || row['Display/Decorative'] === 'TRUE') return 'display';
  if (Number(row['Calligraphy']) > 0 || row['Calligraphy'] === 'TRUE') return 'display';
  return 'sans-serif'; // Default fallback
}

function determineClassification(row: CSVRow): string {
  if (Number(row['Serif']) > 0 || row['Serif'] === 'TRUE') return 'Transitional';
  if (Number(row['Sans Serif']) > 0 || row['Sans Serif'] === 'TRUE') return 'Neo Grotesque';
  if (Number(row['Display/Decorative']) > 0 || row['Display/Decorative'] === 'TRUE') return 'Display';
  if (Number(row['Calligraphy']) > 0 || row['Calligraphy'] === 'TRUE') return 'Script';
  return 'Modern';
}

export async function buildFullDatabase() {
  // Create a Map to deduplicate fonts by family name
  const uniqueFonts = new Map<string, GoogleFont>();
  
  // Add each font to the map, using family name as key
  fontDatabase.fonts.forEach(font => {
    uniqueFonts.set(font.family, font);
  });
  
  console.log('Full database built with:', {
    totalFonts: uniqueFonts.size,
    categories: [...new Set([...uniqueFonts.values()].map(f => f.category))],
    moods: [...new Set([...uniqueFonts.values()].flatMap(f => f.styles[0].mood))]
  });
  
  // Convert back to array and update database
  fontDatabase.fonts = Array.from(uniqueFonts.values());
  fontDatabase.lastUpdated = new Date().toISOString();
  
  return fontDatabase;
}

export function getFontsByMood(mood: string): GoogleFont[] {
  return fontDatabase.fonts.filter(font => 
    font.styles[0].mood.includes(mood.toLowerCase())
  );
}

export function getFontsByCategory(category: string): GoogleFont[] {
  return fontDatabase.fonts.filter(font => 
    font.category === category
  );
}

export function searchFonts(query: string): GoogleFont[] {
  const lowerQuery = query.toLowerCase();
  return fontDatabase.fonts.filter(font => 
    font.family.toLowerCase().includes(lowerQuery) ||
    font.styles[0].mood.some(mood => mood.toLowerCase().includes(lowerQuery))
  );
}