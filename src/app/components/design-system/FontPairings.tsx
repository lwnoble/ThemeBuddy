import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
import { MoodType } from '../../types/fonts';
import moodFonts from '../../data/moods.json';
import bodyFonts from '../../data/body.json';

import { detectMoodFromImage } from '../../utils/moodDetection';

interface FontStyle {
  "Font Name": string;
  Type: string;
}

interface MoodFonts {
  [key: string]: FontStyle[];
}

interface BodyFonts {
  Body: FontStyle[];
}

interface FontPair {
  headerFont: FontStyle;
  bodyFont: FontStyle;
}

interface FontPairingProps {
  imageFile: File | null;
  onBack: () => void;
  onFontPairingSelect: (headerFont: { "Font Name": string; Type: string }, bodyFont: { "Font Name": string; Type: string }) => void;
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

const FontPairings: React.FC<FontPairingProps> = ({ imageFile, onBack, onFontPairingSelect, preferences }) => {
  const [selectedPair, setSelectedPair] = useState<FontPair | null>(null);
  const [fontPairs, setFontPairs] = useState<FontPair[]>([]);
  const [detectedMood, setDetectedMood] = useState<MoodType>('Sophisticated');
  const [error, setError] = useState<string | null>(null);
  const [isPreferencesExpanded, setIsPreferencesExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load fonts when pairs change
  useEffect(() => {
    if (fontPairs.length > 0) {
      const families = fontPairs.flatMap(pair => [
        pair.headerFont["Font Name"],
        pair.bodyFont["Font Name"]
      ]);
      
      // Create a link element for Google Fonts
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css?family=${encodeURIComponent(families.join('|'))}&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, [fontPairs]);

  // Detect mood from image and generate pairs
  useEffect(() => {
    if (imageFile) {
      detectImageMood();
    }
  }, [imageFile]);

  // Generate font pairs when mood is detected
  useEffect(() => {
    if (detectedMood) {
      generateFontPairs();
    }
  }, [detectedMood, preferences]);

  const detectImageMood = async () => {
    if (!imageFile) return;
    
    try {
      setIsLoading(true);
      const detectedMood = await detectMoodFromImage(imageFile);
      if (detectedMood && typeof detectedMood === 'string') {
        // Ensure the first letter is capitalized to match moods.json
        const formattedMood = detectedMood.charAt(0).toUpperCase() + detectedMood.slice(1).toLowerCase();
        setDetectedMood(formattedMood as MoodType);
      } else {
        throw new Error('Invalid mood detected');
      }
    } catch (err) {
      console.error('Mood detection error:', err);
      setError('Failed to detect mood from image');
    } finally {
      setIsLoading(false);
    }
  };

  const generateFontPairs = () => {
    try {
      // Handle case of "Sophisticated" mood
      const mood = detectedMood === "Sophisticated" ? "Sophisticated" : detectedMood;
      const moodFontList = moodFonts[mood as keyof typeof moodFonts] || [];
      console.log('Available moods:', Object.keys(moodFonts));
      console.log('Trying to access mood:', mood);
      console.log('Found fonts:', moodFontList);
      
      if (moodFontList.length === 0) {
        throw new Error(`No header fonts found for mood: ${mood}`);
      }

      // Generate 20-30 unique pairs
      const pairs: FontPair[] = [];
      const usedPairs = new Set<string>();

      // Access the Body array from body.json
      const bodyFontList = bodyFonts.Body || [];
      if (bodyFontList.length === 0) {
        throw new Error('No body fonts available');
      }

      while (pairs.length < 25 && pairs.length < moodFontList.length * bodyFontList.length) {
        const headerFont = moodFontList[Math.floor(Math.random() * moodFontList.length)];
        const bodyFont = bodyFontList[Math.floor(Math.random() * bodyFontList.length)];

        const pairKey = `${headerFont["Font Name"]}-${bodyFont["Font Name"]}`;
        
        if (!usedPairs.has(pairKey)) {
          pairs.push({ headerFont, bodyFont });
          usedPairs.add(pairKey);
        }
      }

      setFontPairs(pairs);
      setSelectedPair(pairs[0]);
      
      // Notify parent of initial selection
      if (pairs.length > 0) {
        onFontPairingSelect(pairs[0].headerFont, pairs[0].bodyFont);
      }
    } catch (err) {
      console.error('Font pair generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate font pairs');
    }
  };

  const resetFontPairs = () => {
    setSelectedPair(null);
    generateFontPairs();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-800">
        <ArrowLeft className="mr-2 w-5 h-5" />
        Back to Design System
      </button>

      {/* Header with Detected Mood */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">Typography</h2>
            <p className="text-gray-600">Detected Mood: {detectedMood}</p>
          </div>
          <div className="text-right">
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-600 font-medium py-2 px-4 rounded"
              onClick={resetFontPairs}
            >
              Regenerate Pairs
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mt-4">
            {error}
          </div>
        )}
      </div>

      {/* Font Preferences Panel */}
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
          <div className="p-4">
            {/* Preferences UI would go here */}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Processing fonts...</p>
        </div>
      )}

      {/* Font Pairing Results */}
      {selectedPair && (
        <div className="space-y-4">
          {/* Selected Pair Preview */}
          <div className="p-6 border rounded-lg">
            <div className="mb-4">
              <h3 style={{
                fontFamily: `"${selectedPair.headerFont["Font Name"]}", sans-serif`,
                fontSize: '2.5rem',
                fontWeight: 700,
                marginBottom: '0.5rem'
              }}>
                {selectedPair.headerFont["Font Name"]}
              </h3>
              <p style={{
                fontFamily: `"${selectedPair.bodyFont["Font Name"]}", sans-serif`,
                fontSize: '1rem',
                lineHeight: 1.6
              }}>
                The quick brown fox jumps over the lazy dog. Typography can make your design system more 
                cohesive and professional.
              </p>
            </div>
            <div className="text-sm text-gray-500 mt-4">
              <p>Header: {selectedPair.headerFont["Font Name"]} ({selectedPair.headerFont.Type})</p>
              <p>Body: {selectedPair.bodyFont["Font Name"]} ({selectedPair.bodyFont.Type})</p>
            </div>
          </div>

          {/* Alternative Pairs */}
          <div className="grid gap-4">
            {fontPairs.map((pair, index) => (
              <button
                key={`${pair.headerFont["Font Name"]}-${pair.bodyFont["Font Name"]}`}
                onClick={() => {
                  setSelectedPair(pair);
                  onFontPairingSelect(pair.headerFont, pair.bodyFont);
                }}
                className={`p-4 border rounded-lg text-left hover:bg-gray-50 ${
                  selectedPair === pair ? 'border-purple-500' : 'border-gray-200'
                }`}
              >
                <h4 style={{
                  fontFamily: `"${pair.headerFont["Font Name"]}", sans-serif`,
                  fontSize: '1.5rem',
                  fontWeight: 600
                }}>
                  Option {index + 1}
                </h4>
                <p style={{
                  fontFamily: `"${pair.bodyFont["Font Name"]}", sans-serif`,
                  fontSize: '0.875rem'
                }}>
                  {pair.headerFont["Font Name"]} + {pair.bodyFont["Font Name"]}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FontPairings;