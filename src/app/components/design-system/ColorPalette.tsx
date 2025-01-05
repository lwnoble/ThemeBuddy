import React, { useState, useEffect } from 'react';
import { ChevronLeft, Settings2 } from 'lucide-react';
import ColorPaletteSettings from './ColorPaletteSettings';
import ShadeSettings, { ShadeSettingsProps } from './ShadeSettings';
import { extractDominantColors, generateAllColorModes, ColorSettings } from '../../utils/colors';
import { ColorSwatch } from './ColorSwatch';
import { generateUniqueColorNames } from '../../utils/color-namer';

interface ColorPaletteProps {
  imageFile?: File;
  imageUrl?: string;
  onBack: () => void;
}

type WCAGMode = 'AA-light' | 'AA-dark' | 'AAA-light' | 'AAA-dark';

const ColorPalette: React.FC<ColorPaletteProps> = ({
  imageFile,
  imageUrl,
  onBack
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [colors, setColors] = useState<string[]>([]);
  const [colorNames, setColorNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showShadeSettings, setShowShadeSettings] = useState(false);
  const [activeWCAGMode, setActiveWCAGMode] = useState<WCAGMode>('AA-light');
  const [colorSettings, setColorSettings] = useState<ColorSettings>({
    numberOfShades: 10,
    numberOfColors: 5,
    lightMode: {
      lightestShade: 95,
      darkestShade: 10,
      maxChroma: 100,
      textColor: {
        light: '#FFFFFF',
        dark: '#121212',
        lightOpacity: 1,
        darkOpacity: 1
      }
    },
    darkMode: {
      lightestShade: 90,
      darkestShade: 5,
      maxChroma: 80,
      textColor: {
        light: '#FFFFFF',
        dark: '#121212',
        lightOpacity: 0.7,
        darkOpacity: 1
      }
    },
    contrastMode: 'AA',
    minContrastRatio: 4.5
  });

  const extractColors = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let imgFile;
      
      if (imageFile) {
        imgFile = imageFile;
      } else if (imageUrl) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        imgFile = new File([blob], 'image.png', { type: blob.type });
      } else {
        throw new Error('No image source available');
      }

      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imgFile);
      });

      console.log('Processing image...');
      const extractedColors = await extractDominantColors(
        dataUrl,
        colorSettings.numberOfColors,
        10
      );
      
      console.log('Extracted colors:', extractedColors);
      setColors(extractedColors);
      
      const uniqueColorNames = generateUniqueColorNames(extractedColors);
      setColorNames(uniqueColorNames);
    } catch (err) {
      console.error('Error extracting colors:', err);
      setError('Failed to extract colors from image');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (imageFile || imageUrl) {
      extractColors();
    }
  }, [
    imageFile,
    imageUrl,
    colorSettings,
    colorSettings.lightMode.textColor,
    colorSettings.darkMode.textColor
  ]);

  const handleShadeSettingsChange = (newSettings: Partial<ShadeSettingsProps>) => {
    setColorSettings(prevSettings => ({
      ...prevSettings,
      numberOfShades: newSettings.numberOfShades ?? prevSettings.numberOfShades,
      lightMode: {
        ...prevSettings.lightMode,
        lightestShade: newSettings.maxLightnessLight ?? prevSettings.lightMode.lightestShade,
        darkestShade: newSettings.maxDarknessLight ?? prevSettings.lightMode.darkestShade,
        maxChroma: newSettings.maxChromaLight ?? prevSettings.lightMode.maxChroma,
        textColor: newSettings.lightModeTextColor ?? prevSettings.lightMode.textColor,
      },
      darkMode: {
        ...prevSettings.darkMode,
        lightestShade: newSettings.maxLightnessDark ?? prevSettings.darkMode.lightestShade,
        darkestShade: newSettings.maxDarknessDark ?? prevSettings.darkMode.darkestShade,
        maxChroma: newSettings.maxChromaDark ?? prevSettings.darkMode.maxChroma,
        textColor: newSettings.darkModeTextColor ?? prevSettings.darkMode.textColor,
      }
    }));
  };

  const handleSettingsChange = (newSettings: Partial<typeof colorSettings>) => {
    setColorSettings(prev => {
      const updatedSettings = { ...prev };
      
      if (newSettings.numberOfColors !== undefined) {
        updatedSettings.numberOfColors = newSettings.numberOfColors;
      }
      if (newSettings.numberOfShades !== undefined) {
        updatedSettings.numberOfShades = newSettings.numberOfShades;
      }
      return updatedSettings;
    });
  };

  const renderWCAGModeSelector = () => (
    <div className="flex space-x-4 border-b border-gray-200 mb-6">
      {(['AA-light', 'AA-dark', 'AAA-light', 'AAA-dark'] as const).map((mode) => (
        <button
          key={mode}
          className={`pb-2 border-b-2 transition-colors ${
            activeWCAGMode === mode
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent hover:text-gray-600'
          }`}
          onClick={() => setActiveWCAGMode(mode)}
        >
          {mode.replace('-', ' ')}
        </button>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center text-purple-500 hover:text-purple-600">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span>Back to Design System</span>
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-8">Colors</h1>

      <div className="space-y-12">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Palette</h2>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${
                showSettings ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings2 className="w-6 h-6" />
            </button>
          </div>
          
          {showSettings && (
            <ColorPaletteSettings
              settings={colorSettings}
              onSettingsChange={handleSettingsChange}
            />
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto" />
              <p className="mt-4 text-gray-600">Generating color palette...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          ) : colors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No colors could be extracted from the image.</p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-5 gap-4 mb-4">
                {colors.map((color, index) => (
                  <div key={index} className="text-center">
                    <ColorSwatch 
                      color={color} 
                      size="large" 
                      onClick={() => navigator.clipboard.writeText(color)}
                    />
                    <p className="mt-2 text-sm font-medium">{colorNames[index]}</p>
                    <p className="text-xs text-gray-500">{color}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 text-center">
                Click color to copy hex value
              </p>
            </div>
          )}
        </section>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Shades</h2>
            <button
              onClick={() => setShowShadeSettings(!showShadeSettings)}
              className={`p-2 rounded-lg transition-colors ${
                showShadeSettings ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings2 className="w-6 h-6" />
            </button>
          </div>
          
          {showShadeSettings && (
            <ShadeSettings
              numberOfShades={colorSettings.numberOfShades}
              maxLightnessLight={colorSettings.lightMode.lightestShade}
              maxLightnessDark={colorSettings.darkMode.lightestShade}
              maxDarknessLight={colorSettings.lightMode.darkestShade}
              maxDarknessDark={colorSettings.darkMode.darkestShade}
              maxChromaLight={colorSettings.lightMode.maxChroma}
              maxChromaDark={colorSettings.darkMode.maxChroma}
              lightModeTextColor={colorSettings.lightMode.textColor}
              darkModeTextColor={colorSettings.darkMode.textColor}
              onSettingsChange={handleShadeSettingsChange}
            />
          )}
        </div>

        <div className="space-y-6">
          {renderWCAGModeSelector()}
          {colors.map((color, colorIndex) => (
            <div key={colorIndex} className="space-y-6">
              <h3 className="text-lg font-semibold">{colorNames[colorIndex] || `Color ${colorIndex + 1}`}</h3>
              <div className="grid grid-cols-10 gap-2">
                {generateAllColorModes(
                  color,
                  colorSettings
                )[activeWCAGMode].map((shade, shadeIndex) => (
                  <div
                    key={`${colorIndex}-${shadeIndex}`}
                    className="w-20 h-24 rounded flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105"
                    style={{ backgroundColor: shade.color }}
                    onClick={() => {
                      navigator.clipboard.writeText(shade.color);
                    }}
                  >
                    <span style={{ color: shade.textColor }}>Aa</span>
                    <span className="text-xs mt-1" style={{ color: shade.textColor }}>
                      {shade.contrastRatio.toFixed(2)}:1
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorPalette;