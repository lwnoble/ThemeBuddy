// src/app/components/design-system/FontPairings.tsx
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
import { MoodType } from '../../types/fonts';
import { getFontsByMood } from '../../data/fontDataset'; 
import { isFontSuitableForHeaders, isFontSuitableForBody } from '../../data/fontDatabase';
import { detectMoodFromImage } from '../../utils/moodDetection';
import { 
  generateFontPairs, 
  loadGoogleFonts, 
  calculatePairingScore 
} from '../../utils/fontPairings';

interface GoogleFont {
  family: string;
  category: string;
  variants: string[];
  subsets: string[];
  styles: {
    name: string;
    classification: string;
    mood: string[];
  }[];
}

interface FontPairingProps {
  imageFile?: File;
  onBack: () => void;
  onFontPairingSelect: (headerFont: GoogleFont, bodyFont: GoogleFont) => void;
  preferences: {
    header: {
      serif: string[];
      sansSerif: string[];
      calligraphy: string[];
    };
    body: {
      serif: string[];
      sansSerif: string[];
    };
  };
}

// Mock fonts data
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

// MultiSelect Component (keep your existing implementation)
const MultiSelect: React.FC<{
  options: string[];
  selectedOptions: string[];
  onChange: (selected: string[]) => void;
  label: string;
}> = ({ options, selectedOptions, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 border rounded-lg flex justify-between items-center hover:bg-gray-50"
      >
        <div>
          <span className="text-sm text-gray-600">{label}:</span>
          <span className="ml-2">
            {selectedOptions.length === 0 ? 'Select options' : 
             selectedOptions.includes('All') ? 'All Selected' : 
             selectedOptions.join(', ')}
          </span>
        </div>
        <ChevronDown className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map(option => (
            <div 
              key={option}
              onClick={() => {
                const newSelected = selectedOptions.includes(option)
                  ? selectedOptions.filter(o => o !== option)
                  : [...selectedOptions, option];
                onChange(newSelected);
              }}
              className="p-2 hover:bg-gray-50 cursor-pointer flex items-center"
            >
              <input 
                type="checkbox" 
                checked={selectedOptions.includes(option)}
                readOnly
                className="mr-2"
              />
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FontPairings: React.FC<FontPairingProps> = ({
  imageFile,
  onBack,
  onFontPairingSelect,
  preferences
}) => {
  const [headerSerif, setHeaderSerif] = useState<string[]>(preferences.header.serif);
  const [headerSansSerif, setHeaderSansSerif] = useState<string[]>(preferences.header.sansSerif);
  const [headerCalligraphy, setHeaderCalligraphy] = useState<string[]>(['All']);
  const [bodySerif, setBodySerif] = useState<string[]>(preferences.body.serif);
  const [bodySansSerif, setBodySansSerif] = useState<string[]>(preferences.body.sansSerif);
  const [detectedMood, setDetectedMood] = useState<MoodType>('sophisticated');
  const [fontPairings, setFontPairings] = useState<[GoogleFont, GoogleFont][]>([]);
  const [selectedPairingIndex, setSelectedPairingIndex] = useState(0);
  const [isPreferencesExpanded, setIsPreferencesExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectImageMood = async () => {
    if (!imageFile) {
      setDetectedMood('sophisticated');
      return;
    }

    try {
      setIsLoading(true);
      const mood = await detectMoodFromImage(imageFile);
      setDetectedMood(mood as MoodType);
    } catch (error) {
      console.error('Error in mood detection:', error);
      setDetectedMood('sophisticated');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('FontPairings component mounted');
    if (imageFile) {
      console.log('Image file present:', imageFile);
      detectImageMood();
    } else {
      console.log('No image file provided');
    }
  }, [imageFile]);

  useEffect(() => {
    if (detectedMood) {
      console.log('Detected mood:', detectedMood);
      try {
        // Get fonts for the detected mood
        const moodFonts = getFontsByMood(detectedMood);
        console.log('Available fonts for mood:', {
          mood: detectedMood,
          fontCount: moodFonts.length,
          fonts: moodFonts.map(f => f.family)
        });

        if (!moodFonts || moodFonts.length === 0) {
          console.warn(`No fonts found for mood: ${detectedMood}`);
          setError(`No fonts available for mood: ${detectedMood}`);
          return;
        }

        // Filter fonts based on preferences with explicit typing
        const headerFonts = moodFonts.filter(font => {
          const isSuitable = isFontSuitableForHeaders(font);
          const matchesPreferences = (
            (font.category === 'serif' && headerSerif.includes('All')) ||
            (font.category === 'sans-serif' && headerSansSerif.includes('All')) ||
            (font.styles[0].classification === 'Script' && headerCalligraphy.includes('All'))
          );
          return isSuitable && matchesPreferences;
        }) as GoogleFont[]; // Add type assertion here

        const bodyFonts = moodFonts.filter(font => {
          const isSuitable = isFontSuitableForBody(font);
          const matchesPreferences = (
            (font.category === 'serif' && bodySerif.includes('All')) ||
            (font.category === 'sans-serif' && bodySansSerif.includes('All'))
          );
          return isSuitable && matchesPreferences;
        }) as GoogleFont[]; // Add type assertion here

        console.log('Filtered fonts:', {
          headerFonts: headerFonts.length,
          bodyFonts: bodyFonts.length
        });

        // Now TypeScript should recognize these as GoogleFont arrays
        const pairs = generateFontPairs(headerFonts, bodyFonts, detectedMood);
        console.log('Generated pairs:', {
          count: pairs.length,
          pairs: pairs.map(([h, b]) => `${h.family} + ${b.family}`)
        });

        if (pairs.length > 0) {
          setFontPairings(pairs);
          loadGoogleFonts(pairs.flat());
        } else {
          setError('No suitable font pairs found');
        }
      } catch (error) {
        console.error('Error processing fonts:', error);
        setError(error instanceof Error ? error.message : 'Error processing fonts');
      }
    }
  }, [detectedMood, headerSerif, headerSansSerif, headerCalligraphy, bodySerif, bodySansSerif]);

  // Render font pair card
  const renderFontPair = (headerFont: GoogleFont, bodyFont: GoogleFont, index: number) => (
    <div
      key={`${headerFont.family}-${bodyFont.family}`}
      className={`p-6 border rounded-lg cursor-pointer transition-all
        ${index === selectedPairingIndex ? 'border-purple-500 bg-purple-50' : 'hover:border-gray-300'}`}
      onClick={() => {
        setSelectedPairingIndex(index);
        onFontPairingSelect(headerFont, bodyFont);
      }}
    >
      <div className="mb-4">
        <h3 style={{
          fontFamily: headerFont.family,
          fontSize: '2.5rem',
          fontWeight: 700,
          marginBottom: '0.5rem',
        }}>
          {headerFont.family}
        </h3>
        <p style={{
          fontFamily: bodyFont.family,
          fontSize: '1rem',
          fontWeight: 400,
          lineHeight: 1.6,
        }}>
          The quick brown fox jumps over the lazy dog. Typography can make your design system more 
          cohesive and professional. Choose fonts that reflect your brand's personality and values.
        </p>
      </div>
      <div className="text-sm text-gray-500 space-y-1">
        <p>Header: {headerFont.family} ({headerFont.category})</p>
        <p>Header Style: {headerFont.styles[0].classification}</p>
        <p>Header Weights: {headerFont.variants.join(', ')}</p>
        <p>Body: {bodyFont.family} ({bodyFont.category})</p>
        <p>Body Style: {bodyFont.styles[0].classification}</p>
        <p>Body Weights: {bodyFont.variants.join(', ')}</p>
        <p className="text-purple-600">
          Compatibility Score: {calculatePairingScore(headerFont, bodyFont, detectedMood)}
        </p>
      </div>
    </div>
  );

  return (
    
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <button 
        onClick={onBack} 
        className="flex items-center text-gray-600 hover:text-gray-800"
      >
        <ArrowLeft className="mr-2 w-5 h-5" />
        Back to Design System
      </button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Typography</h2>
        <div className="text-sm text-gray-500">
          Detected Mood: {detectedMood}
        </div>
      </div>

      {/* Font Preferences */}
      <div className="bg-gray-50 rounded-lg">
        <button
          onClick={() => setIsPreferencesExpanded(!isPreferencesExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-100 rounded-lg"
        >
          <span className="font-medium">Font Style Preferences</span>
          {isPreferencesExpanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>

        {isPreferencesExpanded && (
          <div className="p-4 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Header Font Styles</h3>
              <div className="space-y-4">
                <MultiSelect 
                  label="Serif Styles" 
                  options={preferences.header.serif}
                  selectedOptions={headerSerif}
                  onChange={setHeaderSerif}
                />
                <MultiSelect 
                  label="Sans Serif Styles" 
                  options={preferences.header.sansSerif}
                  selectedOptions={headerSansSerif}
                  onChange={setHeaderSansSerif}
                />
                <MultiSelect 
                  label="Calligraphy Styles" 
                  options={preferences.header.calligraphy}
                  selectedOptions={headerCalligraphy}
                  onChange={setHeaderCalligraphy}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Body Font Styles</h3>
              <div className="space-y-4">
                <MultiSelect 
                  label="Serif Styles" 
                  options={preferences.body.serif}
                  selectedOptions={bodySerif}
                  onChange={setBodySerif}
                />
                <MultiSelect 
                  label="Sans Serif Styles" 
                  options={preferences.body.sansSerif}
                  selectedOptions={bodySansSerif}
                  onChange={setBodySansSerif}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Add Error Display Here */}
      {error && (
        <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Generating font pairs...</p>
        </div>
      )}

      {/* Font Pairings */}
      {!isLoading && (
        <div className="space-y-4">
          {fontPairings.map(([headerFont, bodyFont], index) => 
            renderFontPair(headerFont, bodyFont, index)
          )}
        </div>
      )}
    </div>
  );
};

export default FontPairings;