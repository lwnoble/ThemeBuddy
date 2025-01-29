import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
import { MoodType } from '../../types/fonts';
import moodFonts from '../../data/moods.json';
import bodyFonts from '../../data/body.json';
import { detectMoodFromImage } from '../../utils/moodDetection';

interface FontStyle {
  "Font Name": string;
  Type: string;
}

interface FontPair {
  headerFont: FontStyle;
  bodyFont: FontStyle;
}

export interface FontPairingProps {
  imageFile: File | null | undefined;
  onBack?: () => void;
  onFontPairingComplete?: () => void;
  onFontPairingSelect?: (headerFont: any, bodyFont: any) => void;
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

const FontPairings: React.FC<FontPairingProps> = ({ 
  imageFile, 
  onBack, 
  onFontPairingSelect, 
  onFontPairingComplete,
  preferences 
}) => {
  const [selectedPair, setSelectedPair] = useState<FontPair | null>(null);
  const [fontPairs, setFontPairs] = useState<FontPair[]>([]);
  const [detectedMood, setDetectedMood] = useState<MoodType>('Sophisticated');
  const [error, setError] = useState<string | null>(null);
  const [isPreferencesExpanded, setIsPreferencesExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);

  // Prevent multiple completions
  const completionSentRef = useRef(false);

  // Send font tokens with explicit mode and validation
  const sendFontTokens = (headerFont: string, bodyFont: string) => {
    const safeHeaderFont = headerFont || 'Inter';
    const safeBodyFont = bodyFont || 'Roboto';

    console.log('Sending font tokens:', { 
      headerFont: safeHeaderFont, 
      bodyFont: safeBodyFont 
    });

    // Send Header Font Token
    window.parent.postMessage({
      pluginMessage: {
        type: 'update-design-token',
        collection: 'Typography',
        mode: 'Default',
        variable: 'Header-Font',
        value: safeHeaderFont
      }
    }, '*');

    // Send Body Font Token
    window.parent.postMessage({
      pluginMessage: {
        type: 'update-design-token',
        collection: 'Typography',
        mode: 'Default',
        variable: 'Body-Font',
        value: safeBodyFont
      }
    }, '*');
  };

  // Load fonts when pairs change
  useEffect(() => {
    const loadFonts = async () => {
      if (fontPairs.length > 0 && !processingComplete) {
        try {
          const families = fontPairs.flatMap(pair => [
            pair.headerFont["Font Name"],
            pair.bodyFont["Font Name"]
          ]);
          
          // Create a link element for Google Fonts
          const link = document.createElement('link');
          link.href = `https://fonts.googleapis.com/css?family=${encodeURIComponent(families.join('|'))}&display=swap`;
          link.rel = 'stylesheet';
          
          // Wrap font loading in a timeout to prevent hanging
          await new Promise((resolve, reject) => {
            const loadTimeout = setTimeout(() => {
              console.warn('Font loading timed out');
              resolve(null);
            }, 5000); // 5 second timeout

            link.onload = () => {
              clearTimeout(loadTimeout);
              resolve(null);
            };
            link.onerror = () => {
              clearTimeout(loadTimeout);
              reject(new Error('Failed to load fonts'));
            };
            
            document.head.appendChild(link);
          });

          // Mark processing as complete
          setProcessingComplete(true);
          
          // Ensure completion is sent only once
          if (!completionSentRef.current) {
            completionSentRef.current = true;
            
            // Send font tokens to Figma with explicit mode
            sendFontTokens(
              selectedPair?.headerFont["Font Name"] || 'Default Header', 
              selectedPair?.bodyFont["Font Name"] || 'Default Body'
            );

            console.log('Font pairing processing complete');
            window.parent.postMessage({
              pluginMessage: {
                type: 'font-pairing-complete'
              }
            }, '*');

            if (onFontPairingComplete) {
              onFontPairingComplete();
            }
          }
        } catch (err) {
          console.error('Error loading fonts:', err);
          setError('Failed to load fonts');
          
          // Ensure completion is sent only once
          if (!completionSentRef.current) {
            completionSentRef.current = true;
            
            window.parent.postMessage({
              pluginMessage: {
                type: 'font-pairing-complete',
                error: err instanceof Error ? err.message : 'Unknown font loading error'
              }
            }, '*');

            if (onFontPairingComplete) {
              onFontPairingComplete();
            }
          }
        }
      }
    };

    loadFonts();
  }, [fontPairs, processingComplete]);

  const resetFontPairs = () => {
    console.log('Resetting font pairs');
    
    // Reset all relevant state
    setSelectedPair(null);
    setFontPairs([]);
    setProcessingComplete(false);
    completionSentRef.current = false;
    
    // Force regeneration of font pairs
    generateFontPairs();
  };

  // Detect mood from image and generate pairs
  useEffect(() => {
    const initializeFonts = async () => {
      if (imageFile) {
        await detectImageMood();
      } else {
        // If no image, proceed with default mood
        generateFontPairs();
      }
    };

    initializeFonts();
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
        const formattedMood = detectedMood.charAt(0).toUpperCase() + detectedMood.slice(1).toLowerCase();
        setDetectedMood(formattedMood as MoodType);
      } else {
        throw new Error('Invalid mood detected');
      }
    } catch (err) {
      console.error('Mood detection error:', err);
      setError('Failed to detect mood from image');
      // Use default mood if detection fails
      setDetectedMood('Sophisticated');
    } finally {
      setIsLoading(false);
    }
  };

  const generateFontPairs = () => {
    try {
      console.log('Current detected mood:', detectedMood);
      const mood = detectedMood === "Sophisticated" ? "Sophisticated" : detectedMood;
      
      // Fallback to Sophisticated if mood not found
      const moodFontList = moodFonts[mood as keyof typeof moodFonts] || moodFonts['Sophisticated'];
      
      console.log('Generating font pairs for mood:', mood);
      console.log('Available mood font lists:', Object.keys(moodFonts));
      
      if (moodFontList.length === 0) {
        throw new Error(`No header fonts found for mood: ${mood}`);
      }

      // Generate 20-30 unique pairs
      const pairs: FontPair[] = [];
      const usedPairs = new Set<string>();

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

      console.log('Generated font pairs:', 
        pairs.map(p => `${p.headerFont["Font Name"]} + ${p.bodyFont["Font Name"]}`)
      );

      setFontPairs(pairs);
      if (pairs.length > 0) {
        const firstPair = pairs[0];
        setSelectedPair(firstPair);
        onFontPairingSelect?.(firstPair.headerFont, firstPair.bodyFont);
      }
    } catch (err) {
      console.error('Font pair generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate font pairs');
      
      // Force completion with default fonts
      if (!completionSentRef.current) {
        completionSentRef.current = true;
        
        // Use default fonts if generation fails
        const defaultHeaderFont = { "Font Name": "Inter", "Type": "Sans-Serif" };
        const defaultBodyFont = { "Font Name": "Roboto", "Type": "Sans-Serif" };
        
        window.parent.postMessage({
          pluginMessage: {
            type: 'font-pairing-complete',
            error: err instanceof Error ? err.message : 'Font pair generation error'
          }
        }, '*');

        // Send default font tokens
        sendFontTokens(defaultHeaderFont["Font Name"], defaultBodyFont["Font Name"]);
        onFontPairingSelect?.(defaultHeaderFont, defaultBodyFont);

        if (onFontPairingComplete) {
          onFontPairingComplete();
        }
      }
    }
  };

  // Only render UI if processing is complete or if we're not in "hidden" mode
  if (onFontPairingComplete && !processingComplete) {
    return null;
  }

  // Rest of the component remains the same
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {onBack && (
        <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-800">
          <ArrowLeft className="mr-2 w-5 h-5" />
          Back to Design System
        </button>
      )}

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
            {/* Preferences UI */}
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
                  onFontPairingSelect?.(pair.headerFont, pair.bodyFont);
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