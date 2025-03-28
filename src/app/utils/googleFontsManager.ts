import { MoodType } from '../types/fonts';
import { MOOD_FONT_CHARACTERISTICS } from '../utils/mood-font-characteristics';
import moods from '../data/moods.json';

// Types and Interfaces
export interface FontStyle {
  name: string;
  classification: string;
  mood?: string[];
}

export interface GoogleFont {
  family: string;
  category: string;
  variants: string[];
  subsets: string[];
  styles: FontStyle[];
}

export interface FontPair {
  headerFont: {
    "Font Name": string;
    "Type": string;
  };
  bodyFont: {
    "Font Name": string;
    "Type": string;
  };
}

// Constants
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

// Mock fonts for testing and development
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

// URL Generation Functions
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

// Font Generation and Loading Functions
export async function getFontPairingsForMood(
  mood: MoodType,
  headerPreferences: Record<string, string[]>,
  bodyPreferences: Record<string, string[]>
): Promise<FontPair[]> {
  try {
    console.log('Generating font pairs for mood:', {
      mood,
      headerPreferences,
      bodyPreferences
    });

    const moodFonts = moods[mood as keyof typeof moods] || [];
    
    // Split fonts by category using Type field
    const headerFontCandidates = moodFonts.filter(font => 
      ['Display', 'Display/Decorative', 'Calligraphy', 'Script', 'Handwritten'].includes(font.Type)
    );
    
    const bodyFontCandidates = moodFonts.filter(font => 
      ['Sans-Serif', 'Sans Serif', 'Serif', 'Monospace'].includes(font.Type)
    );

    const fallbackHeaderFonts = [
      { "Font Name": "Indie Flower", "Type": "Display/Decorative" },
      { "Font Name": "Caveat", "Type": "Calligraphy" },
      { "Font Name": "Dancing Script", "Type": "Handwritten" }
    ];

    const fallbackBodyFonts = [
      { "Font Name": "Roboto", "Type": "Sans-Serif" },
      { "Font Name": "Open Sans", "Type": "Sans-Serif" },
      { "Font Name": "Lato", "Type": "Sans-Serif" }
    ];

    const combinedHeaderFonts = [
      ...headerFontCandidates, 
      ...headerFontCandidates.length < 3 ? fallbackHeaderFonts : []
    ];

    const combinedBodyFonts = [
      ...bodyFontCandidates, 
      ...bodyFontCandidates.length < 3 ? fallbackBodyFonts : []
    ];

    // Generate pairs with type compatibility check
    const pairs: FontPair[] = [];
    const usedPairs = new Set<string>();
    const maxPairs = 10;

    function isCompatiblePair(header: any, body: any): boolean {
      // Normalize type strings
      const headerType = header.Type.toLowerCase().replace(/-/g, ' ');
      const bodyType = body.Type.toLowerCase().replace(/-/g, ' ');
      
      // Don't pair same font or incompatible types
      if (header["Font Name"] === body["Font Name"]) return false;
      if (headerType === bodyType) return false;
      
      // Decorative/Display/Handwritten fonts should only be headers
      if (['display', 'decorative', 'handwritten', 'script', 'calligraphy'].some(t => bodyType.includes(t))) {
        return false;
      }

      return true;
    }

    while (pairs.length < maxPairs && combinedHeaderFonts.length > 0 && combinedBodyFonts.length > 0) {
      const headerFont = combinedHeaderFonts[Math.floor(Math.random() * combinedHeaderFonts.length)];
      const bodyFont = combinedBodyFonts[Math.floor(Math.random() * combinedBodyFonts.length)];
      
      const pairKey = `${headerFont["Font Name"]}-${bodyFont["Font Name"]}`;
      
      if (!usedPairs.has(pairKey) && isCompatiblePair(headerFont, bodyFont)) {
        pairs.push({
          headerFont: {
            "Font Name": headerFont["Font Name"],
            "Type": headerFont.Type
          },
          bodyFont: {
            "Font Name": bodyFont["Font Name"],
            "Type": bodyFont.Type
          }
        });
        usedPairs.add(pairKey);
      }
    }

    // Fallback pair if no valid pairs were generated
    if (pairs.length === 0) {
      pairs.push({
        headerFont: { "Font Name": "Caveat", "Type": "Calligraphy" },
        bodyFont: { "Font Name": "Roboto", "Type": "Sans-Serif" }
      });
    }

    console.log('Generated pairs:', pairs);
    return pairs;
  } catch (error) {
    console.error('Error getting font pairings:', error);
    return [{
      headerFont: { "Font Name": "Caveat", "Type": "Calligraphy" },
      bodyFont: { "Font Name": "Roboto", "Type": "Sans-Serif" }
    }];
  }
}

export function loadGoogleFonts(fonts: GoogleFont[]): void {
  try {
    const uniqueFamilies = [...new Set(fonts.map(font => font.family))];
    const familiesWithVariants = uniqueFamilies.map(family => {
      const font = fonts.find(f => f.family === family);
      const variants = font?.variants?.join(',') || '400,700';
      return `${family}:${variants}`;
    });
    
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css?family=${encodeURIComponent(familiesWithVariants.join('|'))}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    console.log('Loaded Google Fonts:', uniqueFamilies);
  } catch (error) {
    console.error('Error loading Google Fonts:', error);
  }
}

// Helper function to get available fonts for a mood
export function getAvailableFontsForMood(mood: MoodType): GoogleFont[] {
  return mockFonts.filter(font => 
    font.styles.some(style => style.mood?.includes(mood.toLowerCase()))
  );
}

// Helper function to validate font availability
export function isFontAvailable(fontFamily: string): boolean {
  return mockFonts.some(font => font.family === fontFamily);
}

// Testing functions
export function testUrlGeneration(): void {
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

export default {
  generateGoogleFontsUrl,
  generateFontPairingUrl,
  getFontPairingsForMood,
  loadGoogleFonts,
  getAvailableFontsForMood,
  isFontAvailable,
  testUrlGeneration,
  STYLE_CLASSIFICATIONS
};