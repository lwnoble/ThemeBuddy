import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Home } from 'lucide-react';
import { Header } from './components/navigation/Header';
import { MenuOverlay } from './components/navigation/MenuOverlay';
import { SystemSettings } from './components/settings/SystemSettings';
import ColorPalette from './components/design-system/ColorPalette';
import FontPairings from './components/design-system/FontPairings';
import LoadingScreen from './components/design-system/LoadingScreen';
import { GoogleFont } from './utils/googleFontsManager';
import { DESIGN_SYSTEM_ROUTES } from './constants/routes';
import { useNavigation } from '../context/NavigationContext';
import type { DesignSystemSettings } from './types';
import { ColorProvider } from '../context/ColorContext';
import { MoodType } from './types/fonts';

// Import all page components
import ThemePage from './components/design-system/ThemePage';
import { LogosPage } from './components/design-system/LogosPage';
import { BackgroundsPage } from './components/design-system/BackgroundsPage';
import { ElevationsPage } from './components/design-system/ElevationsPage';
import { GradientsPage } from './components/design-system/GradientsPage';
import { TypographyPage } from './components/design-system/TypographyPage';
import { ColoredIconsPage } from './components/design-system/ColoredIconsPage';
import { SizingPage } from './components/design-system/SizingPage';
import { ShadowsPage } from './components/design-system/ShadowsPage';
import { ChartingPage } from './components/design-system/ChartingPage';
import { CognitivePage } from './components/design-system/CognitivePage';
import { WCAGPage } from './components/design-system/WCAGPage';
import { ExportPage } from './components/design-system/ExportPage';

type StepStatus = 'pending' | 'loading' | 'complete';

interface GenerationStep {
  label: string;
  status: StepStatus;
}

const App = () => {
  const { currentRoute, setCurrentRoute, isMenuOpen } = useNavigation();
  const [isSystemGenerated, setIsSystemGenerated] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(true);
  const [isInfoPanelExpanded, setIsInfoPanelExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [colorExtractionComplete, setColorExtractionComplete] = useState(false);
  const [fontPairingComplete, setFontPairingComplete] = useState(false);
  const [cachedFontPairs, setCachedFontPairs] = useState<any[]>([]);
  const [cachedMood, setCachedMood] = useState<MoodType>('Sophisticated');
  const [baseColorForFonts, setBaseColorForFonts] = useState<string | null>(null);
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([
    { label: 'Extracting Colors', status: 'pending' },
    { label: 'Generating Theme', status: 'pending' },    // Moved up
    { label: 'Generating Font Pairs', status: 'pending' }, // Moved down
    { label: 'Finalizing Design System', status: 'pending' }
  ]);
  

  const [settings, setSettings] = useState<DesignSystemSettings>({
    name: '',
    generationMethod: 'Generate from photo/image',
    imageFile: null,
    imageUrl: undefined
  });

 // Add new state for theme completion
const [themeGenerationComplete, setThemeGenerationComplete] = useState(false);

// Update the color extraction effect
useEffect(() => {
  if (colorExtractionComplete) {
    setGenerationSteps(prevSteps => 
      prevSteps.map((step, index) => ({
        ...step,
        status: index === 0 ? 'complete' as const :
                index === 1 ? 'loading' as const :
                'pending' as const
      }))
    );
  }
}, [colorExtractionComplete]);

useEffect(() => {
  if (themeGenerationComplete) {
    setGenerationSteps(prevSteps => 
      prevSteps.map((step, index) => ({
        ...step,
        status: index <= 1 ? 'complete' as const :
                index === 2 ? 'loading' as const :
                'pending' as const
      }))
    );
  }
}, [themeGenerationComplete]);


// Update the font pairing effect
useEffect(() => {
  if (fontPairingComplete) {
    setTimeout(completeGeneration, 500);
  }
}, [fontPairingComplete]);

const completeGeneration = () => {
  console.log('Running complete generation', {
    colorExtractionComplete,
    themeGenerationComplete,
    fontPairingComplete
  });
  
  // Mark all steps complete
  setGenerationSteps(prevSteps => 
    prevSteps.map(step => ({
      ...step,
      status: 'complete' as const
    }))
  );
  
  // Update UI state
  setIsSystemGenerated(true);
  setIsSettingsExpanded(false);
  setIsLoading(false);
  
  // Navigate home
  setCurrentRoute({
    id: 'home',
    title: 'Design System',
    path: '/',
    icon: Home
  });
  
  console.log('Generation completed, UI updated');
};

  const handleGenerate = () => {
    console.log('Starting generation...');
    setIsLoading(true);
    setColorExtractionComplete(false);
    setFontPairingComplete(false);
    setGenerationSteps(prevSteps => 
      prevSteps.map((step, index) => ({
        ...step,
        status: index === 0 ? 'loading' : 'pending'
      }))
    );
  };

// Update the HiddenProcessing component with better sequencing
const HiddenProcessing = () => {
  console.log('HiddenProcessing render conditions:', {
    hasImage: !!(settings.imageFile || settings.imageUrl),
    colorExtractionComplete,
    themeGenerationComplete,
    fontPairingComplete,
    currentStep: !colorExtractionComplete ? 'colors' :
                !themeGenerationComplete ? 'theme' :
                !fontPairingComplete ? 'fonts' : 'complete',
    baseColorForFonts        
  });

  if (!settings.imageFile && !settings.imageUrl) return null;

  return (
    <div style={{ display: 'none' }}>
      {/* Step 1: Color Extraction */}
      {!colorExtractionComplete && (
        <ColorPalette
          imageFile={settings.imageFile}
          imageUrl={settings.imageUrl}
          onColorExtractionComplete={() => {
            console.log('Color extraction complete');
            setColorExtractionComplete(true);
          }}
        />
      )}

      {/* Step 2: Theme Generation */}
      {colorExtractionComplete && !themeGenerationComplete && (
        <ThemePage 
          imageFile={settings.imageFile}
          imageUrl={settings.imageUrl}
          isProcessing={true}
          onThemeComplete={(baseColor) => {
            console.log('Theme generation complete');
            setThemeGenerationComplete(true);
            setBaseColorForFonts(baseColor);
            setThemeGenerationComplete(true);
            // Start font processing by marking theme as done
            setGenerationSteps(prevSteps => 
              prevSteps.map((step, index) => ({
                ...step,
                status: index <= 1 ? 'complete' as const :
                        index === 2 ? 'loading' as const :
                        'pending' as const
              }))
            );
          }}
        />
      )}

      {/* Step 3: Font Pairing */}
      {themeGenerationComplete && (
      <FontPairings
        imageFile={settings.imageFile}
        baseColor={baseColorForFonts || undefined} // Convert null to undefined to match prop type
        isHiddenProcessing={true}
        onFontPairingComplete={() => {
          console.log('Font pairing complete');
          setFontPairingComplete(true);
        }}
        onFontPairingSelect={(headerFont, bodyFont, pairs, mood) => {
          console.log('Selected fonts:', { headerFont, bodyFont });
          setCachedFontPairs(pairs || []);
          setCachedMood(mood || 'Sophisticated');
        }}
        preferences={{
          header: {
            serif: ['All', 'Transitional', 'Slab', 'Old Style', 'Modern', 'Humanist'],
            sansSerif: ['All', 'Geometric', 'Humanist', 'Neo Grotesque'],
            calligraphy: ['All', 'Handwritten', 'Formal']
          },
          body: {
            serif: ['All', 'Transitional', 'Modern'],
            sansSerif: ['All', 'Geometric', 'Humanist']
          }
        }}
      />
    )}
    </div>
  );
};

// Single monitoring effect for generation process
useEffect(() => {
  if (!isLoading) return;

  console.log('Generation state:', {
    colorExtractionComplete,
    themeGenerationComplete,
    fontPairingComplete,
    step: !colorExtractionComplete ? 'colors' :
          !themeGenerationComplete ? 'theme' :
          !fontPairingComplete ? 'fonts' : 'complete'
  });

  // Don't start timeout until theme is complete
  if (!themeGenerationComplete) return;

  // Only start font timeout after theme is done
  const timeout = setTimeout(() => {
    if (!fontPairingComplete) {
      console.log('Font pairing timeout after 10s - using defaults');
      setCachedFontPairs([{
        headerFont: 'Inter',
        bodyFont: 'Roboto',
        category: 'sans-serif',
        style: 'modern'
      }]);
      setCachedMood('Sophisticated');
      setFontPairingComplete(true);
      completeGeneration();
    }
  }, 10000); // Give it 10 full seconds

  return () => clearTimeout(timeout);
}, [isLoading, themeGenerationComplete, fontPairingComplete]);

  const renderContent = () => {
    console.log('Rendering content:', { isLoading });

    if (isLoading) {
      return (
        <>
          <LoadingScreen steps={generationSteps} />
          <HiddenProcessing />
        </>
      );
    }

    if (isMenuOpen) {
      return <MenuOverlay />;
    }

    // Handle all routes
    switch (currentRoute.path) {
      case '/colors':
        return (
          <ColorPalette
            imageFile={settings.imageFile}
            imageUrl={settings.imageUrl}
            onBack={() => setCurrentRoute({
              id: 'home',
              title: 'Design System',
              path: '/',
              icon: Home
            })}
          />
        );

        case '/fonts':
          console.log('Rendering font route:', {
            imageFile: settings.imageFile,
            cachedPairs: cachedFontPairs?.length,
            detectedMood: cachedMood
          });
          
          return (
            <FontPairings
              imageFile={settings.imageFile}
              onFontPairingComplete={() => {
                console.log('Font pairing completed in route');
                setFontPairingComplete(true);
              }}
              onBack={() => {
                console.log('Navigating back from fonts');
                setCurrentRoute({
                  id: 'home',
                  title: 'Design System',
                  path: '/',
                  icon: Home
                });
              }}
              onFontPairingSelect={(headerFont, bodyFont, pairs, mood) => {
                console.log('Selected fonts:', {
                  headerFont,
                  bodyFont,
                  pairsCount: pairs?.length,
                  mood
                });
                
                if (pairs) setCachedFontPairs(pairs);
                if (mood) setCachedMood(mood);
              }}
              preferences={{
                header: {
                  serif: ['All', 'Transitional', 'Slab', 'Old Style', 'Modern', 'Humanist'],
                  sansSerif: ['All', 'Geometric', 'Humanist', 'Neo Grotesque'],
                  calligraphy: ['All', 'Handwritten', 'Formal']
                },
                body: {
                  serif: ['All', 'Transitional', 'Modern'],
                  sansSerif: ['All', 'Geometric', 'Humanist']
                }
              }}
              cachedPairs={cachedFontPairs}
              detectedMood={cachedMood}
            />
          );
            
    // Update the theme route case in App.tsx
case '/theme':
  return (
    <ThemePage 
      imageFile={settings.imageFile} 
      imageUrl={settings.imageUrl}
      isProcessing={isLoading} // Add isProcessing prop
      onThemeComplete={() => {
        console.log('Theme generation complete');
        setThemeGenerationComplete(true);
      }}
      onThemeGenerationError={(error) => {
        console.error('Theme generation error:', error);
        // Optionally handle the error (e.g., show error message)
      }}
    />
  );

      case '/logos':
        return <LogosPage />;

      case '/backgrounds':
        return <BackgroundsPage />;

      case '/elevations':
        return <ElevationsPage />;

      case '/gradients':
        return <GradientsPage />;

      case '/typography':
        return <TypographyPage />;

      case '/colored-icons':
        return <ColoredIconsPage />;

      case '/sizing':
        return <SizingPage />;

      case '/shadows':
        return <ShadowsPage />;

      case '/charting':
        return <ChartingPage />;

      case '/cognitive':
        return <CognitivePage />;

      case '/wcag':
        return <WCAGPage />;

      case '/export':
        return <ExportPage />;

      case '/':
      default:
        return (
          <>
            {/* Collapsible System Settings */}
            <div className="mb-6">
              <button
                onClick={() => {
                  if (isSystemGenerated) {
                    setIsSettingsExpanded(!isSettingsExpanded);
                  }
                }}
                className={`w-full flex items-center justify-between p-4 ${
                  isSystemGenerated ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-100'
                } rounded-lg ${isSystemGenerated ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                disabled={!isSystemGenerated}
              >
                <div className="flex items-center space-x-2">
                  {isSettingsExpanded && isSystemGenerated ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                  <span className="font-medium">System Settings</span>
                </div>
                {!isSettingsExpanded && (
                  <span className="text-sm text-gray-500">
                    {settings.name || 'Untitled Design System'}
                  </span>
                )}
              </button>

              {isSettingsExpanded && (
                <div className="mt-4">
                  <SystemSettings
                    settings={settings}
                    setSettings={setSettings}
                    onGenerate={handleGenerate}
                    isSystemGenerated={isSystemGenerated}
                  />
                </div>
              )}
            </div>

            {/* Design System Options - Only show when settings are collapsed */}
            {!isSettingsExpanded && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-4">Design System</h2>

                  {/* Collapsible Info Panel */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setIsInfoPanelExpanded(!isInfoPanelExpanded)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100"
                    >
                      <span className="font-medium">Design System Information</span>
                      {isInfoPanelExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>

                    {isInfoPanelExpanded && (
                      <div className="p-4 bg-white">
                        <p className="text-gray-600 mb-4">
                          We have generated your Theme Buddy design system. Explore your systems settings below.
                          As you continue to customize the styles and settings you will see your Figma Design System
                          automatically update, and maintain accessibility.
                        </p>
                        <p className="mb-4">
                          <span className="text-purple-500 cursor-pointer">Upgrade to premium</span> to unlock all the theme settings.
                          Have fun!
                        </p>
                        <p>
                          Once you have the system you want, {' '}
                          <span className="text-purple-500 cursor-pointer">learn how to use your new design system</span>.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid gap-3">
                  {DESIGN_SYSTEM_ROUTES.map((route) => (
                    <button
                      key={route.id}
                      onClick={() => {
                        console.log('Navigating to:', route.path);
                        setCurrentRoute(route);
                      }}
                      className="w-full p-4 flex items-center justify-between bg-white rounded-lg border hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <route.icon className="w-5 h-5 text-purple-500" />
                        <span>{route.title}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <ColorProvider>
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-1 p-4">
          {renderContent()}
        </main>
      </div>
    </ColorProvider>  
  );
};

export default App;