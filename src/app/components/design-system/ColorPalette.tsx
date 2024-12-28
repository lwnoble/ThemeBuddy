import React, { useState, useEffect } from 'react';
import { ChevronLeft, Settings2 } from 'lucide-react';
import ColorPaletteSettings from './ColorPaletteSettings';
import ShadeSettings, { ShadeSettingsProps } from './ShadeSettings';
import { extractDominantColors, generateShades, ColorSettings } from '../../utils/colors';

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
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showShadeSettings, setShowShadeSettings] = useState(false);
  const [activeWCAGMode, setActiveWCAGMode] = useState<WCAGMode>('AA-light');
  const [colorSettings, setColorSettings] = useState<ColorSettings>({
    numberOfShades: 5,
    numberOfColors: 5,
    sampling: 10,
    hueDifference: 30,
    lightMode: {
      lightestShade: 95,
      darkestShade: 5,
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

  useEffect(() => {
    if (imageFile || imageUrl) {
      extractColors();
    }
  }, [imageFile, imageUrl, colorSettings.numberOfColors, colorSettings.sampling]);

  const extractColors = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let imgElement: HTMLImageElement;
      
      if (imageFile) {
        const reader = new FileReader();
        const imageDataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
        imgElement = await loadImage(imageDataUrl);
      } else if (imageUrl) {
        imgElement = await loadImage(imageUrl);
      } else {
        throw new Error('No image source available');
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      canvas.width = imgElement.width;
      canvas.height = imgElement.height;
      ctx.drawImage(imgElement, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      
      const extractedColors = await extractDominantColors(
        imageData,
        canvas.width,
        canvas.height,
        colorSettings.numberOfColors,
        colorSettings.sampling
      );
      
      setColors(extractedColors);
    } catch (err) {
      console.error('Error extracting colors:', err);
      setError('Failed to extract colors from image');
    } finally {
      setIsLoading(false);
    }
  };


  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const sortShades = (shades: ReturnType<typeof generateShades>) => {
    return [...shades].sort((a, b) => {
      const getLightness = (color: string) => {
        const rgb = parseInt(color.slice(1), 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = (rgb >> 0) & 0xff;
        return (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
      };
      return getLightness(b.color) - getLightness(a.color);
    });
  };

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

  const handleSettingsChange = (newSettings: Partial<ColorSettings>) => {
    setColorSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  const renderWCAGModeSelector = () => (
    <div className="flex space-x-4 border-b border-gray-200 mb-6">
      {(['AA-light', 'AA-dark', 'AAA-light', 'AAA-dark'] as WCAGMode[]).map((mode) => (
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack} 
          className="flex items-center text-purple-500 hover:text-purple-600"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span>Back to Design System</span>
        </button>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-lg transition-colors ${
            showSettings
              ? 'bg-purple-100 text-purple-600'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Settings2 className="w-6 h-6" />
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-8">Generated Color Palette</h1>

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
        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-bold mb-4">Generated Palette</h2>
            <div className="grid grid-cols-5 gap-4 mb-4">
              {colors.map((color, index) => (
                <div
                  key={index}
                  className="w-10 h-10 rounded cursor-pointer transition-transform hover:scale-105"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    navigator.clipboard.writeText(color);
                  }}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Click to copy hex value
            </p>
          </section>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Shades</h2>
              <button
                onClick={() => setShowShadeSettings(!showShadeSettings)}
                className={`p-2 rounded-lg transition-colors ${
                  showShadeSettings
                    ? 'bg-purple-100 text-purple-600'
                    : 'text-gray-600 hover:bg-gray-100'
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
                <h3 className="text-lg font-semibold">Color {colorIndex + 1}</h3>
                <div className="grid grid-cols-10 gap-2">
                  {sortShades(generateShades(
                    color, 
                    colorSettings, 
                    activeWCAGMode.includes('light') ? 'light' : 'dark', 
                    activeWCAGMode.includes('AA') ? 'AA' : 'AAA'
                  )).map((shade, shadeIndex) => (
                    <div
                      key={`${colorIndex}-${shadeIndex}`}
                      className="w-20 h-24 rounded flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105"
                      style={{
                        backgroundColor: shade.color,
                      }}
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
      )}
    </div>
  );
};

export default ColorPalette;