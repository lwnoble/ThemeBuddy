import { MoodType } from '../types/fonts';
import { MOOD_FONT_CHARACTERISTICS } from '../utils/mood-font-characteristics';

// Types for Google Fonts
export interface GoogleFont {
  family: string;
  category: string;
  variants: string[];
  subsets: string[];
  styles: FontStyle[];
}

export interface FontStyle {
  name: string;
  classification: string;
  mood?: string[];
}

// Font style classifications mapping
const STYLE_CLASSIFICATIONS = {
  header: {
    serif: [
      'Transitional',
      'Slab',
      'Old Style',
      'Modern',
      'Humanist',
      'Scotch',
      'Fat Face',
      'Didone'
    ],
    sansSerif: [
      'Geometric',
      'Humanist',
      'Neo Grotesque',
      'Rounded',
      'Grotesque',
      'Superellipse',
      'Glyphic'
    ],
    display: [
      'Display',
      'Decorative',
      'Handwritten',
      'Script',
      'Blackletter'
    ]
  },
  body: {
    serif: [
      'Transitional',
      'Slab',
      'Old Style',
      'Modern',
      'Humanist'
    ],
    sansSerif: [
      'Geometric',
      'Humanist',
      'Neo Grotesque',
      'Rounded'
    ]
  }
};

// Updated URL generation function with semicolon-separated filters
export function generateGoogleFontsUrl(
    mood: MoodType,
    headerPreferences: Record<string, string[]>,
    bodyPreferences: Record<string, string[]>
  ): string {
    const baseUrl = 'https://fonts.google.com/';
    const filters: string[] = [];
  
    // Add mood-based filter
    if (mood) {
      filters.push('Feeling:%2FExpressive%2F' + mood.charAt(0).toUpperCase() + mood.slice(1));
    }
  
    // Handle Serif styles
    if (headerPreferences.serif?.length > 0) {
      headerPreferences.serif.forEach(style => {
        if (style !== 'All') {
          if (style === 'Slab') {
            filters.push('Serif:%2FSlab%2F*');
          } else {
            filters.push(`Serif:%2FSerif%2F${style}`);
          }
        }
      });
    }
  
    // Handle Sans Serif styles
    if (headerPreferences.sansSerif?.length > 0) {
      headerPreferences.sansSerif.forEach(style => {
        if (style !== 'All') {
          filters.push(`Sans+Serif:%2FSans%2F${style}`);
        }
      });
    }
  
    // Handle Calligraphy styles
    if (headerPreferences.calligraphy?.length > 0) {
      headerPreferences.calligraphy.forEach(style => {
        if (style !== 'All') {
          filters.push(`Calligraphy:%2FScript%2F${style}`);
        }
      });
    }
  
    // Combine all filters with semicolons
    const categoryFilters = filters.join(';');
    return `${baseUrl}?lang=en_Latn${categoryFilters ? `&categoryFilters=${categoryFilters}` : ''}`;
  }
  
  // Test function
  function testUrlGeneration() {
    console.log('Testing URL generation...\n');
  
    // Test 1: Mood with Calligraphy
    console.log('Mood with Calligraphy URL:');
    console.log(generateGoogleFontsUrl(
      'Cute',
      { serif: [], sansSerif: [], calligraphy: ['Handwritten'] },
      { serif: [], sansSerif: [] }
    ));
  
    // Test 2: Multiple style filters
    console.log('\nMultiple style filters URL:');
    console.log(generateGoogleFontsUrl(
      'Sophisticated',
      { 
        serif: ['Modern'], 
        sansSerif: ['Humanist'], 
        calligraphy: ['Handwritten'] 
      },
      { serif: [], sansSerif: [] }
    ));
  
    // Test 3: Slab with other styles
    console.log('\nSlab with other styles URL:');
    console.log(generateGoogleFontsUrl(
      'Sophisticated',
      { 
        serif: ['Slab', 'Modern'], 
        sansSerif: ['Humanist'] 
      },
      { serif: [], sansSerif: [] }
    ));
  }

// Generate URL for specific font pairing query
export function generateFontPairingUrl(
  category: string,
  style: string,
  isHeader: boolean
): string {
  const baseUrl = 'https://fonts.google.com/';
  const params = new URLSearchParams();
  
  params.append('category', category);
  params.append('classification', style);
  
  if (isHeader) {
    params.append('previewText', 'Heading Text');
  }
  
  return `${baseUrl}?${params.toString()}`;
}

// Randomly pair fonts based on preferences and mood
export function generateFontPairings(
  fonts: GoogleFont[],
  mood: MoodType,
  headerPrefs: Record<string, string[]>,
  bodyPrefs: Record<string, string[]>,
  maxPairs: number = 10
): Array<[GoogleFont, GoogleFont]> {
  const moodCharacteristics = MOOD_FONT_CHARACTERISTICS[mood];
  
  // Filter header fonts
  const headerFonts = fonts.filter(font => {
    const isValidCategory = moodCharacteristics.categories.includes(font.category);
    const hasValidStyle = font.styles?.some(style => 
      moodCharacteristics.styles.includes(style.classification) ||
      headerPrefs[font.category]?.includes(style.classification)
    );
    return isValidCategory && hasValidStyle;
  });
  
  // Filter body fonts
  const bodyFonts = fonts.filter(font => {
    const isValidCategory = ['serif', 'sans-serif'].includes(font.category);
    const hasValidStyle = font.styles?.some(style =>
      bodyPrefs[font.category]?.includes(style.classification)
    );
    return isValidCategory && hasValidStyle;
  });
  
  // Generate random pairs
  const pairs: Array<[GoogleFont, GoogleFont]> = [];
  const usedPairs = new Set<string>();
  
  while (pairs.length < maxPairs && headerFonts.length > 0 && bodyFonts.length > 0) {
    const headerFont = headerFonts[Math.floor(Math.random() * headerFonts.length)];
    const bodyFont = bodyFonts[Math.floor(Math.random() * bodyFonts.length)];
    
    const pairKey = `${headerFont.family}-${bodyFont.family}`;
    
    if (headerFont.family !== bodyFont.family && !usedPairs.has(pairKey)) {
      pairs.push([headerFont, bodyFont]);
      usedPairs.add(pairKey);
    }
  }
  
  return pairs;
}

// Load Google Fonts dynamically
export function loadGoogleFonts(fonts: GoogleFont[]): void {
  const uniqueFamilies = [...new Set(fonts.map(font => font.family))];
  const familiesWithVariants = uniqueFamilies.map(family => {
    const font = fonts.find(f => f.family === family);
    const variants = font?.variants?.join(',') || '400,700';
    return `${family}:${variants}`;
  });
  
  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css?family=${encodeURIComponent(familiesWithVariants.join('|'))}`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}
// Function to get font pairings based on mood
export async function getFontPairingsForMood(
    mood: MoodType,
    headerPreferences: Record<string, string[]>,
    bodyPreferences: Record<string, string[]>
  ): Promise<Array<[GoogleFont, GoogleFont]>> {
    // Generate Google Fonts URL with proper filter structure
    const baseUrl = 'https://fonts.google.com/';
    const filters: string[] = [];
  
    // Add mood-based filter
    if (mood) {
      filters.push('Feeling:%2FExpressive%2F' + mood.charAt(0).toUpperCase() + mood.slice(1));
    }
  
    // Handle Serif styles
    if (headerPreferences.serif?.length > 0) {
      headerPreferences.serif.forEach(style => {
        if (style !== 'All') {
          if (style === 'Slab') {
            filters.push('Serif:%2FSlab%2F*');
          } else {
            filters.push(`Serif:%2FSerif%2F${style}`);
          }
        }
      });
    }
  
    // Handle Sans Serif styles
    if (headerPreferences.sansSerif?.length > 0) {
      headerPreferences.sansSerif.forEach(style => {
        if (style !== 'All') {
          filters.push(`Sans+Serif:%2FSans%2F${style}`);
        }
      });
    }
  
    // Handle Calligraphy styles
    if (headerPreferences.calligraphy?.length > 0) {
      headerPreferences.calligraphy.forEach(style => {
        if (style !== 'All') {
          filters.push(`Calligraphy:%2FScript%2F${style}`);
        }
      });
    }
  
    // Combine all filters with semicolons
    const categoryFilters = filters.join(';');
    const url = `${baseUrl}?lang=en_Latn${categoryFilters ? `&categoryFilters=${categoryFilters}` : ''}`;
  
    try {
      // For now, return mock data instead of actually scraping
      // This maintains functionality while you implement the backend scraping
      const pairs = generateFontPairings(
        mockFonts,
        mood,
        headerPreferences,
        bodyPreferences
      );
      return pairs;
    } catch (error) {
      console.error('Error getting font pairings:', error);
      return [];
    }
  }
  
  // Mock fonts data for testing and fallback
  const mockFonts: GoogleFont[] = [
    {
      family: 'Playfair Display',
      category: 'serif',
      variants: ['400', '500', '600', '700'],
      subsets: ['latin'],
      styles: [{ name: 'Playfair Display', classification: 'Didone', mood: ['sophisticated', 'elegant'] }]
    },
    {
      family: 'Montserrat',
      category: 'sans-serif',
      variants: ['300', '400', '500', '700'],
      subsets: ['latin'],
      styles: [{ name: 'Montserrat', classification: 'Geometric', mood: ['modern', 'clean'] }]
    },
    {
      family: 'Lora',
      category: 'serif',
      variants: ['400', '500', '600', '700'],
      subsets: ['latin'],
      styles: [{ name: 'Lora', classification: 'Transitional', mood: ['elegant', 'refined'] }]
    },
    {
      family: 'Poppins',
      category: 'sans-serif',
      variants: ['300', '400', '500', '600'],
      subsets: ['latin'],
      styles: [{ name: 'Poppins', classification: 'Geometric', mood: ['modern', 'friendly'] }]
    },
    {
      family: 'Raleway',
      category: 'sans-serif',
      variants: ['300', '400', '500', '700'],
      subsets: ['latin'],
      styles: [{ name: 'Raleway', classification: 'Humanist', mood: ['modern', 'elegant'] }]
    }
  ];
  
