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
  
  export type MoodType = 
  | 'Business'
  | 'Calm'
  | 'Cute'
  | 'Playful'
  | 'Fancy'
  | 'Stiff'
  | 'Vintage'
  | 'Happy'
  | 'Futuristic'
  | 'Excited'
  | 'Rugged'
  | 'Childlike'
  | 'Loud'
  | 'Artistic'
  | 'Sophisticated'
  | 'Awkward'
  | 'Active'
  | 'Scary';