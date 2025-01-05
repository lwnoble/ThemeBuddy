// Types for font data structure
  export interface FontStyle {
    name: string;
    classification: string;
    mood: string[];
  }
  
  export interface GoogleFont {
    family: string;
    category: string;
    variants: string[];
    subsets: string[];
    styles: FontStyle[];
  }
  
  export interface FontDatabaseType {
    version: string;
    lastUpdated: string;
    fonts: GoogleFont[];
  }
  
  // Font classifications for different categories (renamed from FONT_CLASSIFICATIONS to STYLE_CLASSIFICATIONS)
  export const STYLE_CLASSIFICATIONS = {
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
  
  // Default font weights
  export const DEFAULT_WEIGHTS = ['400', '700'];
  
  // Initial empty database structure
  export const fontDatabase: FontDatabaseType = {
    version: "1.0.0",
    lastUpdated: new Date().toISOString(),
    fonts: []
  };
  
  // Sample fonts for testing (remove in production)
  export const sampleFonts: GoogleFont[] = [
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
        mood: ["modern", "clean"]
      }]
    },
    {
      family: "Lora",
      category: "serif",
      variants: ["400", "500", "600", "700"],
      subsets: ["latin"],
      styles: [{
        name: "Lora",
        classification: "Transitional",
        mood: ["elegant", "refined"]
      }]
    }
  ];
  
  // Utility functions
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
  
  // Export a function to populate the database
  export function populateDatabase(newFonts: GoogleFont[]) {
    fontDatabase.fonts = newFonts;
    fontDatabase.lastUpdated = new Date().toISOString();
  }