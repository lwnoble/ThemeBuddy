import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, ArrowLeft } from 'lucide-react';

// Typography Styles Configuration
const TYPOGRAPHY_STYLES = {
  body: [
    { name: 'Body Small', key: 'body-small' },
    { name: 'Body Small Semibold', key: 'body-small-semibold' },
    { name: 'Body Medium', key: 'body-medium' },
    { name: 'Body Medium Semibold', key: 'body-medium-semibold' },
    { name: 'Body Large', key: 'body-large' },
    { name: 'Body Large Semibold', key: 'body-large-semibold' }
  ],
  buttons: [
    { name: 'Small', key: 'button-small' },
    { name: 'Standard', key: 'button-standard' }
  ],
  captions: [
    { name: 'Standard', key: 'caption-standard' },
    { name: 'Bold', key: 'caption-bold' }
  ],
  labels: [
    { name: 'Extra Small', key: 'label-extra-small' },
    { name: 'Small', key: 'label-small' },
    { name: 'Medium', key: 'label-medium' },
    { name: 'Large', key: 'label-large' }
  ],
  legal: [
    { name: 'Standard', key: 'legal-standard' },
    { name: 'Semibold', key: 'legal-semibold' }
  ],
  subtitles: [
    { name: 'Small', key: 'subtitle-small' },
    { name: 'Standard', key: 'subtitle-standard' }
  ],
  overline: [
    { name: 'Small', key: 'overline-small' },
    { name: 'Medium', key: 'overline-medium' },
    { name: 'Large', key: 'overline-large' }
  ],
  display: [
    { name: 'Small', key: 'display-small' },
    { name: 'Large', key: 'display-large' }
  ],
  headers: [
    { name: 'H1', key: 'header-h1' },
    { name: 'H2', key: 'header-h2' },
    { name: 'H3', key: 'header-h3' },
    { name: 'H4', key: 'header-h4' },
    { name: 'H5', key: 'header-h5' },
    { name: 'H6', key: 'header-h6' }
  ]
};

// Define the interface for the Figma message
interface FigmaUpdateMessage {
  type: string;
  collection: string;
  group: string;
  mode: string;
  variable: string;
  value: string;
}

// Define the props interface
interface TypographyPageProps {
  decorativeFontType?: string;
  onBack?: () => void;
}

export const TypographyPage: React.FC<TypographyPageProps> = ({ 
  decorativeFontType = '',
  onBack 
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState('Desktop');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [currentDecorativeFontType, setCurrentDecorativeFontType] = useState(decorativeFontType);
  const [useNativeFonts, setUseNativeFonts] = useState({
    'IOS Mobile': true,
    'IOS Tablet': true,
    'Android': true
  });

  // Check for Handwritten font type
  const isHandwrittenFont = currentDecorativeFontType === 'Handwritten';

  // Function to update Figma variable
  const updateFigmaVariable = (group: string, variable: string, value: string) => {
    const message: FigmaUpdateMessage = {
      type: 'update-design-token',
      collection: 'Cognitive',
      group,
      mode: 'None',
      variable,
      value
    };
    
    console.log('Sending message to Figma:', message);
    window.parent.postMessage({
      pluginMessage: message
    }, '*');
  };

  // Function to apply typography styles based on decorative font type
  const applyTypographyStylesByFontType = () => {
    console.log(`Applying typography styles for font type: ${currentDecorativeFontType}`);
    
    // Update headers
    const headerGroups = [
      'Headers/H1/Desktop/Font-Family',
      'Headers/H2/Desktop/Font-Family',
      'Headers/H3/Desktop/Font-Family',
      'Headers/H4/Desktop/Font-Family',
      'Headers/H5/Desktop/Font-Family',
      'Headers/H6/Desktop/Font-Family'
    ];
    
    const displayGroups = [
      'Display/Small/Desktop/Font-Family',
      'Display/Large/Desktop/Font-Family'
    ];
    
    const overlineGroups = [
      'Overline/Small/Font-Family',
      'Overline/Medium/Font-Family',
      'Overline/Large/Font-Family'
    ];
    
    const overlineTransformGroups = [
      'Overline/Small/Text-Transform',
      'Overline/Medium/Text-Transform',
      'Overline/Large/Text-Transform'
    ];
    
    if (isHandwrittenFont) {
      // For Handwritten font type
      // Headers use Standard font
      headerGroups.forEach(group => {
        updateFigmaVariable(group, 'Font-Family', 'Font-Families/Standard');
      });
      
      // Display uses Decorative font
      displayGroups.forEach(group => {
        updateFigmaVariable(group, 'Font-Family', 'Font-Families/Decorative');
      });
      
      // Overline uses Standard font with uppercase transform
      overlineGroups.forEach(group => {
        updateFigmaVariable(group, 'Font-Family', 'Font-Families/Standard');
      });
      
      overlineTransformGroups.forEach(group => {
        updateFigmaVariable(group, 'Text-Transform', 'uppercase');
      });
    } else {
      // For other font types
      // Headers use Decorative font
      headerGroups.forEach(group => {
        updateFigmaVariable(group, 'Font-Family', 'Font-Families/Decorative');
      });
      
      // Display uses Decorative font
      displayGroups.forEach(group => {
        updateFigmaVariable(group, 'Font-Family', 'Font-Families/Decorative');
      });
      
      // Overline uses Decorative font with no text transform
      overlineGroups.forEach(group => {
        updateFigmaVariable(group, 'Font-Family', 'Font-Families/Decorative');
      });
      
      overlineTransformGroups.forEach(group => {
        updateFigmaVariable(group, 'Text-Transform', 'none');
      });
    }
  };

  // Effect to listen for decorative font type changes
  useEffect(() => {
    if (decorativeFontType !== currentDecorativeFontType) {
      setCurrentDecorativeFontType(decorativeFontType);
    }
  }, [decorativeFontType]);

  // Effect to apply typography styles when the decorative font type changes
  useEffect(() => {
    if (currentDecorativeFontType) {
      applyTypographyStylesByFontType();
    }
  }, [currentDecorativeFontType]);

  // Listen for messages from Figma
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.data.pluginMessage && 
        event.data.pluginMessage.type === 'decorative-font-type-updated'
      ) {
        setCurrentDecorativeFontType(event.data.pluginMessage.value);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Style Edit Form Component
  const StyleEditForm = () => {
    const isHeaderStyle = selectedStyle?.includes('header-');
    const isDisplayStyle = selectedStyle?.includes('display-');
    const isOverlineStyle = selectedStyle?.includes('overline-');
    
    // Determine if the style can use decorative font
    const canUseDecorativeFont = isHeaderStyle || isDisplayStyle || isOverlineStyle;
    
    // Set initial values based on style type and decorative font type
    const getInitialFontFamily = () => {
      if (isHandwrittenFont) {
        if (isHeaderStyle) return 'Standard';
        if (isDisplayStyle) return 'Decorative';
        if (isOverlineStyle) return 'Standard';
      } else {
        if (isHeaderStyle) return 'Decorative';
        if (isDisplayStyle) return 'Decorative';
        if (isOverlineStyle) return 'Decorative';
      }
      return 'Standard';
    };
    
    const getInitialTextTransform = () => {
      if (isOverlineStyle) {
        return isHandwrittenFont ? 'uppercase' : 'none';
      }
      return '';
    };

    const [fontFamily, setFontFamily] = useState(getInitialFontFamily());
    const [fontSize, setFontSize] = useState('');
    const [fontWeight, setFontWeight] = useState('');
    const [characterSpacing, setCharacterSpacing] = useState('');
    const [textTransform, setTextTransform] = useState(getInitialTextTransform());
    
    // Get the proper Figma group path based on the selected style
    const getFigmaGroupPath = () => {
      if (!selectedStyle) return '';
      
      // Extract category and style from the selectedStyle key
      const parts = selectedStyle.split('-');
      const category = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      
      let styleName = '';
      if (category === 'Header') {
        // For headers, the style is H1, H2, etc.
        styleName = parts[1].toUpperCase();
      } else {
        // For other categories, capitalize each part after the first dash
        styleName = parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
      }
      
      return `${category}s/${styleName}/${selectedPlatform}/Font-Family`;
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Get the appropriate Figma group path
      const groupPath = getFigmaGroupPath();
      
      // Determine the font family value to send to Figma
      const fontFamilyValue = `Font-Families/${fontFamily}`;
      
      // Update Figma variables
      if (groupPath) {
        updateFigmaVariable(groupPath, 'Font-Family', fontFamilyValue);
        
        // If this is an overline style, also update the text transform
        if (isOverlineStyle) {
          const transformGroupPath = groupPath.replace('/Font-Family', '/Text-Transform');
          updateFigmaVariable(transformGroupPath, 'Text-Transform', textTransform);
        }
      }
      
      // Close the edit form
      setSelectedStyle(null);
    };

    return (
      <form onSubmit={handleSubmit} className="py-6 px-6 space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Font Family</label>
          <div className="flex space-x-6">
            <label className="inline-flex items-center">
              <input 
                type="radio" 
                name="fontFamily"
                value="Standard"
                checked={fontFamily === 'Standard'}
                onChange={() => setFontFamily('Standard')}
                disabled={!canUseDecorativeFont}
                className="h-4 w-4 text-purple-600 border-gray-300"
              />
              <span className="ml-2">Standard</span>
            </label>
            <label className="inline-flex items-center">
              <input 
                type="radio" 
                name="fontFamily"
                value="Decorative"
                checked={fontFamily === 'Decorative'}
                onChange={() => setFontFamily('Decorative')}
                disabled={!canUseDecorativeFont}
                className="h-4 w-4 text-purple-600 border-gray-300"
              />
              <span className="ml-2">Decorative</span>
            </label>
          </div>
          {!canUseDecorativeFont && (
            <p className="text-xs text-gray-500 italic mt-1">
              Only Header, Display, and Overline styles can use decorative fonts
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Font Size</label>
            <input 
              type="text" 
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. 16px"
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Font Weight</label>
            <input 
              type="text" 
              value={fontWeight}
              onChange={(e) => setFontWeight(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. 400"
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Character Spacing</label>
            <input 
              type="text" 
              value={characterSpacing}
              onChange={(e) => setCharacterSpacing(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. 0.5px"
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Text Transform</label>
            <select 
              value={textTransform}
              onChange={(e) => setTextTransform(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="none">None</option>
              <option value="uppercase">Uppercase</option>
              <option value="lowercase">Lowercase</option>
              <option value="capitalize">Capitalize</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
          <button 
            type="button" 
            onClick={() => setSelectedStyle(null)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Update Design Tokens
          </button>
        </div>
      </form>
    );
  };

  // Function to handle bulk apply of typography settings
  const handleBulkApplyTypography = () => {
    applyTypographyStylesByFontType();
  };

  return (
    <div className="bg-white h-full">
      {/* Platform Tabs */}
      <div className="flex border-b">
        {['Desktop', 'IOS Mobile', 'IOS Tablet', 'Android'].map(platform => (
          <button
            key={platform}
            onClick={() => setSelectedPlatform(platform)}
            className={`px-4 py-2 ${
              selectedPlatform === platform 
                ? 'border-b-2 border-purple-500 text-purple-500' 
                : 'text-gray-600'
            }`}
          >
            {platform}
          </button>
        ))}
      </div>

      {/* Native Fonts Checkbox for Mobile Platforms */}
      {selectedPlatform !== 'Desktop' && (
        <div className="px-4 py-2 bg-gray-100 flex items-center">
          <input 
            type="checkbox" 
            id="nativeFonts"
            checked={useNativeFonts[selectedPlatform as keyof typeof useNativeFonts]}
            onChange={() => {
              setUseNativeFonts(prev => ({
                ...prev,
                [selectedPlatform]: !prev[selectedPlatform as keyof typeof useNativeFonts]
              }));
            }}
            className="mr-2"
          />
          <label htmlFor="nativeFonts">Use {selectedPlatform} System Font Families Only</label>
        </div>
      )}

      {/* Typography Categories */}
      <div className="p-4 space-y-4">
        {Object.entries(TYPOGRAPHY_STYLES).map(([category, styles]) => (
          <div key={category}>
            <div 
              onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
              className="flex justify-between items-center cursor-pointer bg-gray-100 px-4 py-2 rounded"
            >
              <h2 className="text-lg font-semibold capitalize">{category}</h2>
              {selectedCategory === category ? <ChevronDown /> : <ChevronRight />}
            </div>

            {selectedCategory === category && (
              <div className="mt-2 space-y-2">
                {styles.map(style => {
                  // Determine font family information to display based on style and current font type
                  let fontInfo = '';
                  const isHeaderStyle = style.key.includes('header-');
                  const isDisplayStyle = style.key.includes('display-');
                  const isOverlineStyle = style.key.includes('overline-');
                  
                  if (isHandwrittenFont) {
                    if (isHeaderStyle) fontInfo = 'Font-Family/Standard';
                    else if (isDisplayStyle) fontInfo = 'Font-Family/Decorative';
                    else if (isOverlineStyle) fontInfo = 'Font-Family/Standard (Uppercase)';
                  } else {
                    if (isHeaderStyle) fontInfo = 'Font-Family/Decorative';
                    else if (isDisplayStyle) fontInfo = 'Font-Family/Decorative';
                    else if (isOverlineStyle) fontInfo = 'Font-Family/Decorative (No Transform)';
                  }
                  
                  return (
                    <div 
                      key={style.key}
                      onClick={() => setSelectedStyle(style.key)}
                      className="flex justify-between items-center px-4 py-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <div>
                        <span>{style.name}</span>
                        {fontInfo && (
                          <span className="ml-2 text-xs text-gray-500">{fontInfo}</span>
                        )}
                      </div>
                      <ChevronRight className="text-gray-500" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Style Edit Form */}
      {selectedStyle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-lg relative">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Edit {selectedStyle.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</h2>
              <button 
                onClick={() => setSelectedStyle(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6">
              <StyleEditForm />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypographyPage;