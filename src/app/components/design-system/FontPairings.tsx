const chroma = require('chroma-js');
// Section 1: Imports and Type Definitions
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, ArrowLeft, Download, X } from 'lucide-react';
import { MoodType } from '../../types/fonts';
import { loadGoogleFonts, getFontPairingsForMood, GoogleFont } from '../../utils/googleFontsManager';
import colorToMoods from '../../data/colorToMoods.json';
import moods from '../../data/moods.json';

// Interfaces
interface MoodMapping {
  colors: string[];
  fontStyles: string[];
  fontWeight: string;
  customFonts?: Array<{ "Font Name": string; Type: string; }> | string[];
}

interface ColorMoodMapping {
  moodMappings: {
    [key: string]: MoodMapping;
  };
}

interface CustomFonts {
  decorative?: string;
  standard?: string;
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
  customFonts?: {
    decorative?: string;
    standard?: string;
  };
}
// Section 2: Utility Functions and Constants
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

// Utility function to check if a font is common and likely to be installed
const isCommonFont = (fontName: string): boolean => {
  const commonFonts = [
    "roboto", "open sans", "lato", "montserrat", "noto sans", 
    "source sans pro", "arial", "helvetica", "times new roman", "georgia",
    "verdana", "tahoma", "trebuchet ms", "impact", "comic sans ms"
  ];
  return commonFonts.includes(fontName.toLowerCase());
};

// Utility function to sanitize font names
const sanitizeFontName = (fontName: string) => {
  return fontName
    .replace(/\s*(Display|Medium|Bold|Light|Black|Thin|Regular|Italic|ExtraBold|SemiBold|ExtraLight|Condensed|Extended|Narrow)\s*/g, '')
    .trim();
};

// Determine color mood based on input color
const determineColorMood = (baseColor: string): MoodType => {
  if (!baseColor) return 'Sophisticated';

  try {
    const inputColor = chroma(baseColor);
    let closestMood: MoodType = 'Sophisticated';
    let shortestDistance = Number.MAX_VALUE;
    const moodMappings = colorToMoods.moodMappings;

    Object.entries(moodMappings).forEach(([mood, mapping]) => {
      mapping.colors.forEach(colorHex => {
        try {
          const cleanColorHex = colorHex.trim();
          const moodColor = chroma(cleanColorHex);
          const distance = chroma.distance(inputColor, moodColor, 'rgb');
          
          if (distance < shortestDistance) {
            shortestDistance = distance;
            closestMood = mood.split('-')[0] as MoodType;
          }
        } catch (colorErr) {
          console.warn(`Invalid color in mood ${mood}:`, colorHex);
        }
      });
    });

    return closestMood;
  } catch (err) {
    console.error('Error in determineColorMood:', err);
    return 'Sophisticated';
  }
};

interface CustomFonts {
  customFonts?: Array<FontStyle> | string[];
}

const getFontStylesForMood = (mood: MoodType): { fontFamilies: FontStyle[], fontStyles: string[] } => {
  if (!mood) return { fontFamilies: [], fontStyles: [] };

  const baseMood = mood.split('-')[0] as MoodType;
  const moodMapping = colorToMoods.moodMappings[baseMood as keyof typeof colorToMoods.moodMappings] as MoodMapping & CustomFonts;

  if (!moodMapping) return { fontFamilies: [], fontStyles: [] };

  const fontStyles = moodMapping.fontStyles || [];
  let fontFamilies: FontStyle[] = [];

  // Safely handle customFonts
  const customFonts = moodMapping.customFonts || [];

  if (fontStyles.length === 1 && fontStyles[0] === 'Custom') {
    if (customFonts.length > 0) {
      if (typeof customFonts[0] === 'string') {
        fontFamilies = (customFonts as string[]).map(font => ({
          "Font Name": font,
          "Type": "Display/Decorative"
        }));
      } else {
        fontFamilies = customFonts as FontStyle[];
      }
    }
  } else {
    fontStyles.forEach((style: string) => {
      if (style !== 'Custom') {
        const moodFonts = moods[style as keyof typeof moods];
        if (moodFonts) {
          fontFamilies.push(...moodFonts);
        }
      }
    });

    if (fontStyles.includes('Custom') && customFonts.length > 0) {
      if (typeof customFonts[0] === 'string') {
        fontFamilies.unshift(...(customFonts as string[]).map(font => ({
          "Font Name": font,
          "Type": "Display/Decorative"
        })));
      } else {
        fontFamilies.unshift(...(customFonts as FontStyle[]));
      }
    }
  }

  fontFamilies = [...new Set(fontFamilies.map(f => JSON.stringify(f)))].map(f => JSON.parse(f));

  return {
    fontFamilies,
    fontStyles
  };
};

// Generate custom font pairs
const generateCustomFontPairs = (customFonts: Array<{ "Font Name": string, "Type": string }>): FontPair[] => {
  const pairs: FontPair[] = [];
  const usedPairs = new Set<string>();
  const bodyFonts = ["Roboto", "Open Sans", "Lato", "Noto Sans"];

  for (const headerFont of customFonts) {
    const bodyFont = bodyFonts[Math.floor(Math.random() * bodyFonts.length)];
    const pair = {
      headerFont: { "Font Name": headerFont["Font Name"], "Type": headerFont["Type"] },
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
// Section 3: FontPairings Component
const FontPairings: React.FC<FontPairingProps> = ({ 
  baseColor,
  imageFile, 
  onBack, 
  onFontPairingSelect, 
  onFontPairingComplete,
  preferences,
  cachedPairs,
  detectedMood: initialMood,
  isHiddenProcessing = false,
  customFonts = {} // Provide a default empty object
}) => {
  // Original State Management
  const [customDecorativeFont, setCustomDecorativeFont] = useState(customFonts?.decorative || '');
  const [customStandardFont, setCustomStandardFont] = useState(customFonts?.standard || '');

  const [selectedPair, setSelectedPair] = useState<FontPair | null>(null);
  const [fontPairs, setFontPairs] = useState<FontPair[]>([]);
  const [detectedMood, setDetectedMood] = useState<MoodType>(initialMood || 'Sophisticated');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [isCheckingFonts, setIsCheckingFonts] = useState(false);
  const [missingFonts, setMissingFonts] = useState<{
    headerFont: boolean;
    bodyFont: boolean;
  }>({ headerFont: false, bodyFont: false });
  const fontsLoadedRef = useRef(false);
  
  // New state for custom pairs functionality
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customDecorativeInput, setCustomDecorativeInput] = useState('');
  const [customStandardInput, setCustomStandardInput] = useState('');
  const [customPairs, setCustomPairs] = useState<FontPair[]>([]);
  // Font Availability Check Method - Improved
  const checkFontAvailability = async (fontName: string): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      console.log(`Checking availability for font: ${fontName}`);
      
      // For common fonts, consider them available by default
      if (isCommonFont(fontName.toLowerCase())) {
        console.log(`${fontName} is a common font, assuming it's available`);
        resolve(true);
        return;
      }
      
      const sanitizedFontName = sanitizeFontName(fontName);
      let hasResponse = false;
      
      // Set up message handler to receive font list from Figma plugin
      const messageHandler = (event: MessageEvent) => {
        if (
          event.data.pluginMessage && 
          event.data.pluginMessage.type === 'font-availability-result'
        ) {
          window.removeEventListener('message', messageHandler);
          hasResponse = true;
          
          // Check if the font is in the list (case-insensitive)
          const available = event.data.pluginMessage.available;
          console.log(`Font availability check result for ${fontName}: ${available}`);
          resolve(available);
        }
        
        // Check if font is successfully applied to Figma
        if (
          event.data.pluginMessage && 
          event.data.pluginMessage.type === 'design-token-updated' &&
          (
            (event.data.pluginMessage.variable === 'Decorative' && 
             event.data.pluginMessage.success === true) ||
            (event.data.pluginMessage.variable === 'Standard' && 
             event.data.pluginMessage.success === true)
          )
        ) {
          // If Figma confirms the font was successfully applied, consider it available
          if (!hasResponse) {
            window.removeEventListener('message', messageHandler);
            hasResponse = true;
            console.log(`Font ${fontName} was successfully applied to Figma, marking as available`);
            resolve(true);
          }
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      // Send message to Figma plugin to check font availability using Figma's API
      window.parent.postMessage({
        pluginMessage: {
          type: 'check-font-availability-api',
          fontName: sanitizedFontName
        }
      }, '*');
      
      // Timeout if no response
      setTimeout(() => {
        if (!hasResponse) {
          window.removeEventListener('message', messageHandler);
          console.warn(`Font availability check timed out for: ${fontName}`);
          resolve(true); // Assume font is available if no response - this prevents false "missing" messages
        }
      }, 5000);
    });
  };

  // Font Download Method
  const openFontDownloadLink = (fontName: string) => {
    console.log(`Opening download link for font: ${fontName}`);
    
    // Format the font name for use in Google Fonts URL
    // Replace spaces with plus signs and remove any special characters
    const formattedFontName = fontName
      .replace(/\s+/g, '+')
      .replace(/[^\w\s+\-]/g, ''); // Remove special characters except spaces, plus signs, and hyphens
    
    const googleFontsBaseUrl = 'https://fonts.google.com/specimen/';
    const fontUrl = `${googleFontsBaseUrl}${formattedFontName}`;
    
    console.log(`Opening font URL: ${fontUrl}`);
    window.open(fontUrl, '_blank');
  };
  // Load Fonts for Pairs
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

  // Update Figma Typography with Better Font Availability Checking
  const updateFigmaTypography = async (pair: FontPair) => {
    console.log('Updating Figma typography with pair:', pair);
    
    try {
      // Check font availability before updating
      const [headerFontAvailable, bodyFontAvailable] = await Promise.all([
        checkFontAvailability(pair.headerFont["Font Name"]),
        checkFontAvailability(pair.bodyFont["Font Name"])
      ]);

      console.log(`Font availability results: Header (${pair.headerFont["Font Name"]}): ${headerFontAvailable}, Body (${pair.bodyFont["Font Name"]}): ${bodyFontAvailable}`);

// In FontPairings.tsx, update the figmaFontApplicationPromise function

const figmaFontApplicationPromise = (fontName: string, tokenType: 'Decorative' | 'Standard'): Promise<boolean> => {
  return new Promise((resolve) => {
    let resolved = false;
    
    // Handle special case for Poiret One
    const processedFontName = sanitizeFontName(fontName);
    console.log(`Processing font for Figma: "${fontName}" -> "${processedFontName}"`);
    
    const messageHandler = (event: MessageEvent) => {
      if (
        event.data.pluginMessage && 
        event.data.pluginMessage.type === 'design-token-updated' &&
        event.data.pluginMessage.variable === tokenType
      ) {
        window.removeEventListener('message', messageHandler);
        resolved = true;
        resolve(event.data.pluginMessage.success === true);
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    // Send message to update design token - with special case handling
    window.parent.postMessage({
      pluginMessage: {
        type: 'update-design-token',
        collection: 'Cognitive',
        group: 'Font-Families',
        mode: 'None',
        variable: tokenType,
        value: processedFontName
      }
    }, '*');
    
    // Timeout if no response
    setTimeout(() => {
      if (!resolved) {
        window.removeEventListener('message', messageHandler);
        console.warn(`Figma font application check timed out for: ${fontName}`);
        resolve(false);
      }
    }, 5000);
  });
};

      // Try to apply fonts to Figma and detect success
      const [headerFontApplied, bodyFontApplied] = await Promise.all([
        figmaFontApplicationPromise(pair.headerFont["Font Name"], 'Decorative'),
        figmaFontApplicationPromise(pair.bodyFont["Font Name"], 'Standard')
      ]);
      
      console.log(`Font application results: Header (${pair.headerFont["Font Name"]}): ${headerFontApplied}, Body (${pair.bodyFont["Font Name"]}): ${bodyFontApplied}`);
      
      // Update missing fonts state based on both availability check AND successful application
      setMissingFonts({
        headerFont: !headerFontAvailable && !isCommonFont(pair.headerFont["Font Name"]),
        bodyFont: !bodyFontAvailable && !isCommonFont(pair.bodyFont["Font Name"])
      });
      
    } catch (error) {
      console.error('Error in updateFigmaTypography:', error);
      // If error occurs, assume fonts are missing for non-common fonts
      setMissingFonts({
        headerFont: !isCommonFont(pair.headerFont["Font Name"]),
        bodyFont: !isCommonFont(pair.bodyFont["Font Name"])
      });
    }
  };
  // Handle Default Fonts
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

  // Handle Pair Selection
  const handlePairSelect = async (pair: FontPair) => {
    try {
      console.log('Font pair selected:', pair);
      setSelectedPair(pair);
      
      // Show loading screen while checking fonts
      setIsCheckingFonts(true);
      
      // First reset missing fonts state to avoid flashing incorrect UI
      setMissingFonts({ headerFont: false, bodyFont: false });
      
      // Update typography and wait for it to complete
      await updateFigmaTypography(pair);
      
      // Notify parent component about the selection
      onFontPairingSelect?.(pair.headerFont, pair.bodyFont, fontPairs, detectedMood);
      
      // Scroll to top after selection
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error in handlePairSelect:', error);
      // In case of error, set a reasonable default for non-common fonts
      setMissingFonts({
        headerFont: !isCommonFont(pair.headerFont["Font Name"]),
        bodyFont: !isCommonFont(pair.bodyFont["Font Name"])
      });
    } finally {
      setIsCheckingFonts(false);
    }
  };
  
  // Reset Font Pairs
  const resetFontPairs = () => {
    console.log('Resetting font pairs');
    setSelectedPair(null);
    setFontPairs([]);
    setProcessingComplete(false);
    initializeFonts();
  };
  // Add this function to handle creating a custom font pair
  const handleAddCustomPair = async () => {
    if (!customDecorativeInput || !customStandardInput) {
      return; // Don't add if either field is empty
    }

    const newPair: FontPair = {
      headerFont: { "Font Name": customDecorativeInput, "Type": "Decorative" },
      bodyFont: { "Font Name": customStandardInput, "Type": "Sans-Serif" }
    };

    // Add to custom pairs
    const updatedCustomPairs = [...customPairs, newPair];
    setCustomPairs(updatedCustomPairs);

    // Add to all font pairs (at the beginning)
    const updatedFontPairs = [newPair, ...fontPairs];
    setFontPairs(updatedFontPairs);

    // Close modal
    setIsCustomModalOpen(false);
    setCustomDecorativeInput('');
    setCustomStandardInput('');

    // Select the new pair
    await handlePairSelect(newPair);

    // Save custom pairs to localStorage
    try {
      window.parent.postMessage({
        pluginMessage: {
          type: 'save-custom-pairs',
          pairs: updatedCustomPairs
        }
      }, '*');
    } catch (error) {
      console.error('Error saving custom pairs:', error);
    }
  };

  // Add this function to load custom pairs from storage
  const loadCustomPairs = () => {
    window.parent.postMessage({
      pluginMessage: {
        type: 'load-custom-pairs'
      }
    }, '*');

    // Set up a listener for the response
    const messageHandler = (event: MessageEvent) => {
      if (
        event.data.pluginMessage && 
        event.data.pluginMessage.type === 'custom-pairs-loaded'
      ) {
        const loadedPairs = event.data.pluginMessage.pairs;
        if (loadedPairs && loadedPairs.length > 0) {
          setCustomPairs(loadedPairs);
          
          // Add to all font pairs (at the beginning)
          setFontPairs(prevPairs => [...loadedPairs, ...prevPairs]);
        }
        window.removeEventListener('message', messageHandler);
      }
    };
    
    window.addEventListener('message', messageHandler);
  };
  // Initialize Fonts
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

  // Use Effects
  useEffect(() => {
    console.log('FontPairings initialization with props:', {
      baseColor,
      hasCachedPairs: !!cachedPairs?.length,
      isHiddenProcessing,
      initialMood
    });

    initializeFonts();
  }, [baseColor, cachedPairs, isHiddenProcessing]);

  // Add this useEffect to load custom pairs when component mounts
  useEffect(() => {
    loadCustomPairs();
  }, []);
  // Render Conditions
  if (!fontPairs.length && !isHiddenProcessing) {
    return null;
  }

  // Custom font modal component
  const customFontModal = (
    <>
      {isCustomModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Custom Font Families</h3>
              <button 
                onClick={() => setIsCustomModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
                </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Decorative Font (Headers)
                </label>
                <input
                  type="text"
                  value={customDecorativeInput}
                  onChange={(e) => setCustomDecorativeInput(e.target.value)}
                  placeholder="e.g., Playfair Display"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Standard Font (Body Text)
                </label>
                <input
                  type="text"
                  value={customStandardInput}
                  onChange={(e) => setCustomStandardInput(e.target.value)}
                  placeholder="e.g., Roboto"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded mr-2 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomPair}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  disabled={!customDecorativeInput || !customStandardInput}
                >
                  Add Pair
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Render Method
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {onBack && (
        <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-800">
          <ArrowLeft className="mr-2 w-5 h-5" />
          Back to Design System
        </button>
      )}

      {/* Loading overlay when checking fonts */}
      {isCheckingFonts && (
        <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-3 text-gray-600">Checking font availability...</p>
          </div>
        </div>
      )}

      {/* Font Installation Prompt - Updated for better UI */}
      {selectedPair && (missingFonts.headerFont || missingFonts.bodyFont) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="text-yellow-800 font-semibold mb-2">Missing Fonts Detected</h3>
          <p className="text-yellow-700 text-sm mb-3">
            Please download and install the missing fonts below, then relaunch Figma to see the selected font in your designs.
          </p>
          
          <div className="space-y-3">
            {missingFonts.headerFont && (
              <div className="flex items-center justify-between p-2 bg-white rounded border border-yellow-200">
                <div>
                  <span className="font-medium">Decorative Font:</span>
                  <span className="ml-2">{selectedPair.headerFont["Font Name"]}</span>
                </div>
                <button 
                  onClick={() => openFontDownloadLink(selectedPair.headerFont["Font Name"])}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded flex items-center"
                >
                  <Download className="w-4 h-4 mr-1" /> Download Font
                </button>
              </div>
            )}
            
            {missingFonts.bodyFont && (
              <div className="flex items-center justify-between p-2 bg-white rounded border border-yellow-200">
                <div>
                  <span className="font-medium">Standard Font:</span>
                  <span className="ml-2">{selectedPair.bodyFont["Font Name"]}</span>
                </div>
                <button 
                  onClick={() => openFontDownloadLink(selectedPair.bodyFont["Font Name"])}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded flex items-center"
                >
                  <Download className="w-4 h-4 mr-1" /> Download Font
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Typography section with buttons */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">Typography</h2>
          </div>
          <div className="flex space-x-2">
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-600 font-medium py-2 px-4 rounded"
              onClick={() => setIsCustomModalOpen(true)}
            >
              Customize Pairs
            </button>
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
              <p className="text-gray-500 text-sm font-medium mb-1">Decorative Font:</p>
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
            {fontPairs.map((pair, index) => {
              // Check if this is a custom pair
              const isCustomPair = customPairs.some(
                customPair => 
                  customPair.headerFont["Font Name"] === pair.headerFont["Font Name"] && 
                  customPair.bodyFont["Font Name"] === pair.bodyFont["Font Name"]
              );
              
              return (
                <button
                  key={`${pair.headerFont["Font Name"]}-${pair.bodyFont["Font Name"]}`}
                  onClick={() => handlePairSelect(pair)}
                  className={`p-4 border rounded-lg text-left hover:bg-gray-50 relative ${
                    selectedPair === pair ? 'border-purple-500' : 'border-gray-200'
                  }`}
                >
                  {isCustomPair && (
                    <span className="absolute top-2 right-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      Custom
                    </span>
                  )}
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
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Font Modal */}
      {customFontModal}
    </div>
  );
};

export default FontPairings;