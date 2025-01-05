import { GoogleFont, fontDatabase } from '../data/fontDatabase';
import { MoodType } from '../types/fonts';
import { getFontsByMood } from '../data/fontDataset';

// Helper function to get fonts suitable for headers or body text
export function getHeaderFonts(mood: MoodType) {
  return getFontsByMood(mood).filter(font => 
    font.category === 'serif' || 
    font.category === 'display' ||
    (font.category === 'sans-serif' && font.styles[0].classification !== 'Body')
  );
}

export function getBodyFonts(mood: MoodType) {
  return getFontsByMood(mood).filter(font => 
    (font.category === 'serif' || font.category === 'sans-serif') &&
    font.styles[0].classification !== 'Display'
  );
}

export function getFontsByCategory(category: string) {
  return fontDatabase.fonts.filter(font => 
    font.category === category
  );
}

export function searchFonts(query: string) {
  const lowercaseQuery = query.toLowerCase();
  return fontDatabase.fonts.filter(font => 
    font.family.toLowerCase().includes(lowercaseQuery) ||
    font.styles[0].mood.some(mood => mood.toLowerCase().includes(lowercaseQuery))
  );
}