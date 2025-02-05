const chroma = require('chroma-js');
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
import { MoodType } from '../../types/fonts';
import { loadGoogleFonts, getFontPairingsForMood, GoogleFont } from '../../utils/googleFontsManager';
import colorToMoods from '../../data/colorToMoods.json';
import moods from '../../data/moods.json';

interface MoodMapping {
  colors: string[];
  fontStyles: string[];
  fontWeight: string;
  customFonts?: string[];
}

interface ColorMoodMapping {
  moodMappings: {
    [key: string]: MoodMapping;
  };
}

interface FontStyle {
  "Font Name": string;
  Type: string;
}

interface FontPair {
  headerFont: FontStyle;
  bodyFont: FontStyle;
}

interface FontPairingProps {
  baseColor?: string;
  imageFile?: File | null;
  onBack?: () => void;
  onFontPairingComplete?: () => void;
  onFontPairingSelect?: (headerFont: any, bodyFont: any, pairs?: FontPair[], mood?: MoodType) => void;
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
  cachedPairs?: FontPair[];
  detectedMood?: MoodType;
  isHiddenProcessing?: boolean;
}

const STYLE_CLASSIFICATIONS = {
  header: {
    serif: [
      'Transitional', 'Slab', 'Old Style', 'Modern', 'Humanist',
      'Scotch', 'Fat Face', 'Didone'
    ],
    sansSerif: [
      'Geometric', 'Humanist', 'Neo Grotesque', 'Rounded',
      'Grotesque', 'Superellipse', 'Glyphic'
    ],
    display: [
      'Display', 'Decorative', 'Handwritten', 'Script', 'Blackletter'
    ]
  },
  body: {
    serif: [
      'Transitional', 'Slab', 'Old Style', 'Modern', 'Humanist'
    ],
    sansSerif: [
      'Geometric', 'Humanist', 'Neo Grotesque', 'Rounded'
    ]
  }
};

const determineColorMood = (baseColor: string): MoodType => {
  if (!baseColor) return 'Sophisticated';

  try {
    console.log('Determining mood for color:', baseColor);
    const inputColor = chroma(baseColor);
    
    let closestMood: MoodType = 'Sophisticated';
    let shortestDistance = Number.MAX_VALUE;

    const { moodMappings } = colorToMoods as ColorMoodMapping;

    Object.entries(moodMappings).forEach(([mood, mapping]) => {
      mapping.colors.forEach(colorHex => {
        try {
          const cleanColorHex = colorHex.trim();
          const moodColor = chroma(cleanColorHex);
          const distance = chroma.distance(inputColor, moodColor, 'rgb');
          
          if (distance < shortestDistance) {
            shortestDistance = distance;
            closestMood = mood.split('-')[0] as MoodType;
            console.log('New closest mood:', mood, 'with distance:', distance);
          }
        } catch (colorErr) {
          console.warn(`Invalid color in mood ${mood}:`, colorHex);
        }
      });
    });

    const baseMood = closestMood.split('-')[0] as MoodType;
    console.log('Final selected mood:', baseMood);
    return baseMood;
  } catch (err) {
    console.error('Error in determineColorMood:', err);
    return 'Sophisticated';
  }
};

const getFontStylesForMood = (mood: MoodType): { fontFamilies: string[], fontStyles: string[] } => {
  if (!mood) return { fontFamilies: [], fontStyles: [] };

  const baseMood = mood.split('-')[0] as MoodType;
  const moodMapping = (colorToMoods as ColorMoodMapping).moodMappings[baseMood];
  const fontStyles = moodMapping?.fontStyles || [];
  let fontFamilies: string[] = [];

  if (fontStyles.length === 1 && fontStyles[0] === 'Custom') {
    fontFamilies = moodMapping.customFonts || [];
  } else {
    fontStyles.forEach(style => {
      if (style !== 'Custom') {
        const moodFonts = moods[style as keyof typeof moods];
        if (moodFonts) {
          const fonts = moodFonts.map(font => font["Font Name"]);
          fontFamilies.push(...fonts);
        }
      }
    });

    if (fontStyles.includes('Custom') && moodMapping.customFonts) {
      fontFamilies.unshift(...moodMapping.customFonts);
    }
  }

  fontFamilies = [...new Set(fontFamilies)].slice(0, 25);

  return {
    fontFamilies,
    fontStyles
  };
};

const generateCustomFontPairs = (customFonts: string[]): FontPair[] => {
  const pairs: FontPair[] = [];
  const usedPairs = new Set<string>();
  const bodyFonts = ["Roboto", "Open Sans", "Lato", "Noto Sans"];

  for (const headerFont of customFonts) {
    const bodyFont = bodyFonts[Math.floor(Math.random() * bodyFonts.length)];
    const pair = {
      headerFont: { "Font Name": headerFont, "Type": "Custom" },
      bodyFont: { "Font Name": bodyFont, "Type": "Sans-Serif" }
    };

    const pairKey = `${pair.headerFont["Font Name"]}-${pair.bodyFont["Font Name"]}`;
    if (!usedPairs.has(pairKey)) {
      pairs.push(pair);
      usedPairs.add(pairKey);
    }
  }

  return pairs;
};

const FontPairings: React.FC<FontPairingProps> = ({ 
  baseColor,
  imageFile, 
  onBack, 
  onFontPairingSelect, 
  onFontPairingComplete,
  preferences,
  cachedPairs,
  detectedMood: initialMood,
  isHiddenProcessing = false
}) => {
  const [selectedPair, setSelectedPair] = useState<FontPair | null>(null);
  const [fontPairs, setFontPairs] = useState<FontPair[]>([]);
  const [detectedMood, setDetectedMood] = useState<MoodType>(initialMood || 'Sophisticated');
  const [error, setError] = useState<string | null>(null);
  const [isPreferencesExpanded, setIsPreferencesExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  const fontsLoadedRef = useRef(false);

  const loadFontsForPairs = async (pairs: FontPair[]) => {
    try {
      console.log('Loading fonts for pairs:', pairs);
      const googleFonts: GoogleFont[] = pairs.flatMap(pair => ([
        {
          family: pair.headerFont["Font Name"],
          category: pair.headerFont.Type.toLowerCase(),
          variants: ['400', '700'],
          subsets: ['latin'],
          styles: []
        },
        {
          family: pair.bodyFont["Font Name"],
          category: pair.bodyFont.Type.toLowerCase(),
          variants: ['400', '700'],
          subsets: ['latin'],
          styles: []
        }
      ]));

      await loadGoogleFonts(googleFonts);
      fontsLoadedRef.current = true;
      console.log('Fonts loaded successfully');
    } catch (err) {
      console.error('Error loading fonts:', err);
      throw err;
    }
  };

  const updateFigmaTypography = (pair: FontPair) => {
    console.log('Updating Figma typography:', pair);
    window.parent.postMessage({
      pluginMessage: {
        type: 'update-design-token',
        collection: 'Typography',
        group: 'Font-Families',
        mode: 'Default',
        variable: 'Decorative-Family',
        value: pair.headerFont["Font Name"]
      }
    }, '*');

    window.parent.postMessage({
      pluginMessage: {
        type: 'update-design-token',
        collection: 'Typography',
        group: 'Font-Families',
        mode: 'Default',
        variable: 'Standard-Family',
        value: pair.bodyFont["Font Name"]
      }
    }, '*');
  };

  const handleDefaultFonts = async () => {
    const defaultPairs = [{
      headerFont: { "Font Name": "Inter", "Type": "Sans-Serif" },
      bodyFont: { "Font Name": "Roboto", "Type": "Sans-Serif" }
    }];

    await loadFontsForPairs(defaultPairs);
    setFontPairs(defaultPairs);
    setSelectedPair(defaultPairs[0]);
    onFontPairingSelect?.(defaultPairs[0].headerFont, defaultPairs[0].bodyFont);
    updateFigmaTypography(defaultPairs[0]);
    setProcessingComplete(true);
    onFontPairingComplete?.();
  };

  const handlePairSelect = (pair: FontPair) => {
    console.log('Font pair selected:', pair);
    setSelectedPair(pair);
    updateFigmaTypography(pair);
    onFontPairingSelect?.(pair.headerFont, pair.bodyFont, fontPairs, detectedMood);
  };

  const resetFontPairs = () => {
    console.log('Resetting font pairs');
    setSelectedPair(null);
    setFontPairs([]);
    setProcessingComplete(false);
    initializeFonts();
  };

  const initializeFonts = async () => {
    if (cachedPairs?.length) {
      console.log('Using cached font pairs');
      setFontPairs(cachedPairs);
      setSelectedPair(cachedPairs[0]);
      updateFigmaTypography(cachedPairs[0]);
      setProcessingComplete(true);
      
      if (!fontsLoadedRef.current) {
        await loadFontsForPairs(cachedPairs);
      }
      return;
    }

    if (isHiddenProcessing) {
      setIsLoading(true);
      try {
        if (baseColor) {
          const mood = determineColorMood(baseColor);
          const { fontFamilies, fontStyles } = getFontStylesForMood(mood);
          setDetectedMood(mood);

          let pairs: FontPair[];
          
          if (fontFamilies.length > 0) {
            pairs = generateCustomFontPairs(fontFamilies);
          } else {
            const headerPrefs = {
              serif: fontStyles.filter(style => STYLE_CLASSIFICATIONS.header.serif.includes(style)),
              sansSerif: fontStyles.filter(style => STYLE_CLASSIFICATIONS.header.sansSerif.includes(style)),
              calligraphy: fontStyles.filter(style => STYLE_CLASSIFICATIONS.header.display.includes(style))
            };

            pairs = await getFontPairingsForMood(mood, headerPrefs, {
              serif: ['All'],
              sansSerif: ['All']
            });
          }

          if (pairs.length > 0) {
            await loadFontsForPairs(pairs);
            setFontPairs(pairs);
            setSelectedPair(pairs[0]);
            updateFigmaTypography(pairs[0]);
            onFontPairingSelect?.(pairs[0].headerFont, pairs[0].bodyFont, pairs, mood);
          }
        }
        
        setProcessingComplete(true);
        onFontPairingComplete?.();
      } catch (err) {
        console.error('Error in font initialization:', err);
        setError(err instanceof Error ? err.message : 'Error generating fonts');
        handleDefaultFonts();
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    console.log('FontPairings initialization with props:', {
      baseColor,
      hasCachedPairs: !!cachedPairs?.length,
      isHiddenProcessing,
      initialMood
    });

    initializeFonts();
  }, [baseColor, cachedPairs, isHiddenProcessing]);

  if (!fontPairs.length && !isHiddenProcessing) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {onBack && (
        <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-800">
          <ArrowLeft className="mr-2 w-5 h-5" />
          Back to Design System
        </button>
      )}

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
            {/* Preferences UI */}
          </div>
        )}
      </div>
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Processing fonts...</p>
        </div>
      )}

      {selectedPair && (
        <div className="space-y-4">
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
              <p>Decorative Font: {selectedPair.headerFont["Font Name"]} ({selectedPair.headerFont.Type})</p>
              <p>Standard Font: {selectedPair.bodyFont["Font Name"]} ({selectedPair.bodyFont.Type})</p>
            </div>
          </div>

          <div className="grid gap-4">
            {fontPairs.map((pair, index) => (
              <button
                key={`${pair.headerFont["Font Name"]}-${pair.bodyFont["Font Name"]}`}
                onClick={() => handlePairSelect(pair)}
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