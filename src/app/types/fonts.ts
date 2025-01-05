// src/app/types/fonts.ts

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
  
  export interface FontDatabase {
    version: string;
    lastUpdated: string;
    fonts: GoogleFont[];
  }
  
  export type MoodType = 
    | 'business'
    | 'calm'
    | 'cute'
    | 'playful'
    | 'fancy'
    | 'stiff'
    | 'vintage'
    | 'happy'
    | 'futuristic'
    | 'excited'
    | 'rugged'
    | 'childlike'
    | 'loud'
    | 'artistic'
    | 'sophisticated'
    | 'awkward'
    | 'active'
    | 'scary';