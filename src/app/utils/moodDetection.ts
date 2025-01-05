// Types for color analysis
export interface ColorCount {
  r: number;
  g: number;
  b: number;
  count: number;
}

export interface MoodCharacteristics {
  brightness: number;
  saturation: number;
  warmth: number;
  contrast: number;
  dominantHues: string[];
}

// Define all possible moods that match Google Fonts categories
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
  | 'innovative';

// Mood characteristics mapping
const MOOD_CHARACTERISTICS = {
  business: {
    brightness: { min: 0.4, max: 0.7 },
    saturation: { min: 0.2, max: 0.5 },
    warmth: { min: 0.3, max: 0.6 },
    contrast: { min: 0.4, max: 0.8 },
    preferredHues: ['blue', 'gray', 'black']
  },
  calm: {
    brightness: { min: 0.5, max: 0.8 },
    saturation: { min: 0.2, max: 0.5 },
    warmth: { min: 0.3, max: 0.6 },
    contrast: { min: 0.2, max: 0.5 },
    preferredHues: ['blue', 'green', 'gray']
  },
  cute: {
    brightness: { min: 0.6, max: 0.9 },
    saturation: { min: 0.5, max: 0.8 },
    warmth: { min: 0.5, max: 0.8 },
    contrast: { min: 0.3, max: 0.6 },
    preferredHues: ['pink', 'yellow', 'purple']
  },
  playful: {
    brightness: { min: 0.6, max: 1.0 },
    saturation: { min: 0.6, max: 1.0 },
    warmth: { min: 0.5, max: 0.9 },
    contrast: { min: 0.4, max: 0.8 },
    preferredHues: ['yellow', 'orange', 'pink']
  },
  fancy: {
    brightness: { min: 0.3, max: 0.7 },
    saturation: { min: 0.3, max: 0.6 },
    warmth: { min: 0.4, max: 0.7 },
    contrast: { min: 0.5, max: 0.9 },
    preferredHues: ['purple', 'gold', 'red']
  },
  stiff: {
    brightness: { min: 0.3, max: 0.6 },
    saturation: { min: 0.1, max: 0.4 },
    warmth: { min: 0.2, max: 0.5 },
    contrast: { min: 0.6, max: 0.9 },
    preferredHues: ['gray', 'black', 'navy']
  },
  vintage: {
    brightness: { min: 0.3, max: 0.7 },
    saturation: { min: 0.2, max: 0.5 },
    warmth: { min: 0.4, max: 0.7 },
    contrast: { min: 0.3, max: 0.7 },
    preferredHues: ['brown', 'beige', 'cream']
  },
  happy: {
    brightness: { min: 0.6, max: 1.0 },
    saturation: { min: 0.5, max: 0.9 },
    warmth: { min: 0.5, max: 0.9 },
    contrast: { min: 0.3, max: 0.7 },
    preferredHues: ['yellow', 'orange', 'pink']
  },
  futuristic: {
    brightness: { min: 0.5, max: 0.9 },
    saturation: { min: 0.2, max: 0.6 },
    warmth: { min: 0.2, max: 0.5 },
    contrast: { min: 0.7, max: 1.0 },
    preferredHues: ['white', 'black', 'cyan']
  },
  excited: {
    brightness: { min: 0.6, max: 1.0 },
    saturation: { min: 0.7, max: 1.0 },
    warmth: { min: 0.6, max: 1.0 },
    contrast: { min: 0.5, max: 0.9 },
    preferredHues: ['red', 'orange', 'yellow']
  },
  rugged: {
    brightness: { min: 0.2, max: 0.6 },
    saturation: { min: 0.3, max: 0.7 },
    warmth: { min: 0.4, max: 0.8 },
    contrast: { min: 0.4, max: 0.8 },
    preferredHues: ['brown', 'green', 'gray']
  },
  childlike: {
    brightness: { min: 0.6, max: 1.0 },
    saturation: { min: 0.6, max: 1.0 },
    warmth: { min: 0.5, max: 0.9 },
    contrast: { min: 0.3, max: 0.7 },
    preferredHues: ['red', 'blue', 'yellow']
  },
  loud: {
    brightness: { min: 0.5, max: 0.9 },
    saturation: { min: 0.7, max: 1.0 },
    warmth: { min: 0.5, max: 0.9 },
    contrast: { min: 0.6, max: 1.0 },
    preferredHues: ['red', 'orange', 'pink']
  },
  artistic: {
    brightness: { min: 0.3, max: 0.8 },
    saturation: { min: 0.4, max: 0.8 },
    warmth: { min: 0.3, max: 0.7 },
    contrast: { min: 0.4, max: 0.9 },
    preferredHues: ['purple', 'blue', 'teal']
  },
  sophisticated: {
    brightness: { min: 0.3, max: 0.7 },
    saturation: { min: 0.1, max: 0.4 },
    warmth: { min: 0.3, max: 0.6 },
    contrast: { min: 0.5, max: 0.9 },
    preferredHues: ['black', 'gray', 'navy']
  },
  awkward: {
    brightness: { min: 0.4, max: 0.8 },
    saturation: { min: 0.3, max: 0.7 },
    warmth: { min: 0.3, max: 0.7 },
    contrast: { min: 0.2, max: 0.6 },
    preferredHues: ['green', 'yellow', 'pink']
  },
  active: {
    brightness: { min: 0.5, max: 0.9 },
    saturation: { min: 0.5, max: 0.9 },
    warmth: { min: 0.4, max: 0.8 },
    contrast: { min: 0.4, max: 0.8 },
    preferredHues: ['red', 'orange', 'blue']
  },
  innovative: {
    brightness: { min: 0.4, max: 0.8 },
    saturation: { min: 0.3, max: 0.7 },
    warmth: { min: 0.3, max: 0.6 },
    contrast: { min: 0.5, max: 0.9 },
    preferredHues: ['cyan', 'purple', 'green']
  }
};

// Helper functions for color analysis
const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h, s, l];
};

const getColorName = (r: number, g: number, b: number): string => {
  const [h, s, l] = rgbToHsl(r, g, b);
  
  // Convert hue to degrees
  const hDeg = h * 360;

  // Handle grayscale colors
  if (s < 0.15) {
    if (l < 0.2) return 'black';
    if (l > 0.8) return 'white';
    return 'gray';
  }

  // Handle chromatic colors
  if (hDeg >= 0 && hDeg < 30) return 'red';
  if (hDeg >= 30 && hDeg < 60) return 'orange';
  if (hDeg >= 60 && hDeg < 90) return 'yellow';
  if (hDeg >= 90 && hDeg < 150) return 'green';
  if (hDeg >= 150 && hDeg < 210) return 'cyan';
  if (hDeg >= 210 && hDeg < 270) return 'blue';
  if (hDeg >= 270 && hDeg < 330) return 'purple';
  
  // Complete the circle back to red
  return 'red';
};

// Main mood detection function
export const detectMoodFromImage = async (imageFile: File): Promise<MoodType> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image to canvas
      ctx.drawImage(img, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Analyze colors
      const colorCounts: ColorCount[] = [];
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Find or create color count
        const existingColor = colorCounts.find(c => 
          Math.abs(c.r - r) < 5 && 
          Math.abs(c.g - g) < 5 && 
          Math.abs(c.b - b) < 5
        );
        
        if (existingColor) {
          existingColor.count++;
        } else {
          colorCounts.push({ r, g, b, count: 1 });
        }
      }
      
      // Sort colors by count
      colorCounts.sort((a, b) => b.count - a.count);
      
      // Calculate characteristics
      const totalPixels = canvas.width * canvas.height;
      let totalBrightness = 0;
      let totalSaturation = 0;
      let totalWarmth = 0;
      
      const dominantColors = colorCounts.slice(0, 5);
      const characteristics: MoodCharacteristics = {
        brightness: 0,
        saturation: 0,
        warmth: 0,
        contrast: 0,
        dominantHues: []
      };
      
      dominantColors.forEach(color => {
        const [h, s, l] = rgbToHsl(color.r, color.g, color.b);
        const weight = color.count / totalPixels;
        
        totalBrightness += l * weight;
        totalSaturation += s * weight;
        totalWarmth += (color.r > color.b ? 1 : 0) * weight;
        
        characteristics.dominantHues.push(getColorName(color.r, color.g, color.b));
      });
      
      characteristics.brightness = totalBrightness;
      characteristics.saturation = totalSaturation;
      characteristics.warmth = totalWarmth;
      characteristics.contrast = Math.abs(
        colorCounts[0].count / totalPixels - 
        colorCounts[Math.min(colorCounts.length - 1, 10)].count / totalPixels
      );
      
      // Match characteristics to mood
      let bestMatch = {
        mood: 'business' as MoodType,
        score: 0
      };
      
      Object.entries(MOOD_CHARACTERISTICS).forEach(([mood, criteria]) => {
        let score = 0;
        
        // Score based on brightness
        if (characteristics.brightness >= criteria.brightness.min && 
            characteristics.brightness <= criteria.brightness.max) {
          score += 1;
        }
        
        // Score based on saturation
        if (characteristics.saturation >= criteria.saturation.min && 
            characteristics.saturation <= criteria.saturation.max) {
          score += 1;
        }
        
        // Score based on warmth
        if (characteristics.warmth >= criteria.warmth.min && 
            characteristics.warmth <= criteria.warmth.max) {
          score += 1;
        }
        
        // Score based on contrast
        if (characteristics.contrast >= criteria.contrast.min && 
            characteristics.contrast <= criteria.contrast.max) {
          score += 1;
        }
        
        // Score based on preferred hues
        const matchingHues = characteristics.dominantHues.filter(
          hue => criteria.preferredHues.includes(hue)
        ).length;
        score += matchingHues / 3;
        
        if (score > bestMatch.score) {
          bestMatch = { 
            mood: mood as MoodType, 
            score 
          };
        }
      });
      
      resolve(bestMatch.mood);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    // Create object URL from file
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(imageFile);
  });
};

// Helper function to get mood description
export const getMoodDescription = (mood: MoodType): string => {
  const descriptions = {
    business: 'Professional and trustworthy',
    calm: 'Peaceful and serene',
    cute: 'Sweet and charming',
    playful: 'Fun and lighthearted',
    fancy: 'Elegant and sophisticated',
    stiff: 'Formal and structured',
    vintage: 'Classic and nostalgic',
    happy: 'Cheerful and optimistic',
    futuristic: 'Modern and innovative',
    excited: 'Energetic and dynamic',
    rugged: 'Strong and durable',
    childlike: 'Innocent and playful',
    loud: 'Bold and attention-grabbing',
    artistic: 'Creative and expressive',
    sophisticated: 'Refined and elegant',
    awkward: 'Unique and unconventional',
    active: 'Dynamic and energetic',
    innovative: 'Forward-thinking and creative'
  };

  return descriptions[mood];
};

// Helper function to validate mood type
export const isValidMood = (mood: string): mood is MoodType => {
  return mood in MOOD_CHARACTERISTICS;
};

// Helper function to get color scheme for a mood
export const getMoodColorScheme = (mood: MoodType) => {
  return MOOD_CHARACTERISTICS[mood].preferredHues;
};

// Helper function to get mood characteristics
export const getMoodCharacteristics = (mood: MoodType) => {
  return MOOD_CHARACTERISTICS[mood];
};

// Helper function to check if an image's characteristics match a mood
export const doesImageMatchMood = (
  characteristics: MoodCharacteristics,
  mood: MoodType
): boolean => {
  const criteria = MOOD_CHARACTERISTICS[mood];
  
  return (
    characteristics.brightness >= criteria.brightness.min &&
    characteristics.brightness <= criteria.brightness.max &&
    characteristics.saturation >= criteria.saturation.min &&
    characteristics.saturation <= criteria.saturation.max &&
    characteristics.warmth >= criteria.warmth.min &&
    characteristics.warmth <= criteria.warmth.max &&
    characteristics.contrast >= criteria.contrast.min &&
    characteristics.contrast <= criteria.contrast.max &&
    characteristics.dominantHues.some(hue => 
      criteria.preferredHues.includes(hue)
    )
  );
};

// Export mood-related constants
export const MOODS = Object.keys(MOOD_CHARACTERISTICS) as MoodType[];

export const MOOD_CATEGORIES = {
  PROFESSIONAL: ['business', 'sophisticated', 'stiff'] as MoodType[],
  PLAYFUL: ['playful', 'cute', 'childlike', 'happy'] as MoodType[],
  ENERGETIC: ['excited', 'active', 'loud'] as MoodType[],
  CREATIVE: ['artistic', 'innovative', 'fancy'] as MoodType[],
  TRADITIONAL: ['vintage', 'rugged'] as MoodType[],
  MODERN: ['futuristic'] as MoodType[],
  RELAXED: ['calm'] as MoodType[],
  UNIQUE: ['awkward'] as MoodType[]
};