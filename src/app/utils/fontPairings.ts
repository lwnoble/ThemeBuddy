// src/app/utils/fontPairings.ts

import { MoodType } from '../types/fonts';
import { GoogleFont } from '../data/fontDatabase';

export function calculatePairingScore(
  header: GoogleFont,
  body: GoogleFont,
  mood: MoodType
): number {
  let score = 0;
  
  // Base compatibility
  if (header.styles[0].mood.includes(mood) && body.styles[0].mood.includes(mood)) {
    score += 3;
  }
  
  // Category contrast
  if (header.category === 'serif' && body.category === 'sans-serif' ||
      header.category === 'sans-serif' && body.category === 'serif') {
    score += 2;
  }
  
  // Style compatibility
  if (header.styles[0].classification !== body.styles[0].classification) {
    score += 1;
  }
  
  // Shared moods bonus
  const sharedMoods = header.styles[0].mood.filter(m => 
    body.styles[0].mood.includes(m)
  );
  score += Math.min(sharedMoods.length, 2);
  
  return score;
}

export function generateFontPairs(
  headerFonts: GoogleFont[],
  bodyFonts: GoogleFont[],
  mood: MoodType
): [GoogleFont, GoogleFont][] {
  const pairs: [GoogleFont, GoogleFont][] = [];
  
  headerFonts.forEach(header => {
    bodyFonts.forEach(body => {
      if (header.family !== body.family) {
        const score = calculatePairingScore(header, body, mood);
        if (score >= 3) { // Only include pairs with good compatibility
          pairs.push([header, body]);
        }
      }
    });
  });
  
  // Sort by compatibility score
  return pairs.sort((a, b) => 
    calculatePairingScore(b[0], b[1], mood) - 
    calculatePairingScore(a[0], a[1], mood)
  ).slice(0, 40); // Limit to top 40 pairs
}

export function loadGoogleFonts(fonts: GoogleFont[]): void {
  const uniqueFamilies = [...new Set(fonts.map(font => font.family))];
  
  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?${
    uniqueFamilies.map(family => 
      `family=${family.replace(' ', '+')}&display=swap`
    ).join('&')
  }`;
  link.rel = 'stylesheet';
  
  document.head.appendChild(link);
  
  console.log('Loaded Google Fonts:', uniqueFamilies);
}

export function getFontUrl(font: GoogleFont): string {
  return `https://fonts.googleapis.com/css2?family=${font.family.replace(' ', '+')}&display=swap`;
}

export function areFontsCompatible(
  header: GoogleFont,
  body: GoogleFont,
  mood: MoodType
): boolean {
  return calculatePairingScore(header, body, mood) >= 3;
}

// Helper function to normalize font weights
export function getNormalizedWeights(font: GoogleFont): string[] {
  const defaultWeights = ['400', '700'];
  return font.variants.length > 0 ? font.variants : defaultWeights;
}