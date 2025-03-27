import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Home } from 'lucide-react';
import { Header } from './components/navigation/Header';
import { MenuOverlay } from './components/navigation/MenuOverlay';
import { SystemSettings } from './components/settings/SystemSettings';
import ColorPalette from './components/design-system/ColorPalette';
import FontPairings from './components/design-system/FontPairings';
import LoadingScreen from './components/design-system/LoadingScreen';
<<<<<<< HEAD
=======
import { GoogleFont } from './utils/googleFontsManager';
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
import { DESIGN_SYSTEM_ROUTES } from './constants/routes';
import { useNavigation } from '../context/NavigationContext';
import type { DesignSystemSettings } from './types';
import { ColorProvider } from '../context/ColorContext';
import { MoodType } from './types/fonts';
<<<<<<< HEAD
import { ComponentStylingPage } from './components/design-system/ComponentStylingPage';
import { NavigationBarsPage } from './components/design-system/NavigationBarsPage'; // If this file exists
=======
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe

// Import all page components
import ThemePage from './components/design-system/ThemePage';
import { LogosPage } from './components/design-system/LogosPage';
import { BackgroundsPage } from './components/design-system/BackgroundsPage';
import { ElevationsPage } from './components/design-system/ElevationsPage';
<<<<<<< HEAD
import GradientsPage from './components/design-system/GradientsPage';
=======
import { GradientsPage } from './components/design-system/GradientsPage';
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
import { TypographyPage } from './components/design-system/TypographyPage';
import { ColoredIconsPage } from './components/design-system/ColoredIconsPage';
import { SizingPage } from './components/design-system/SizingPage';
import { ShadowsPage } from './components/design-system/ShadowsPage';
import { ChartingPage } from './components/design-system/ChartingPage';
import { CognitivePage } from './components/design-system/CognitivePage';
import { WCAGPage } from './components/design-system/WCAGPage';
import { ExportPage } from './components/design-system/ExportPage';
<<<<<<< HEAD
import { ThemeProvider, ThemeContext } from '../context/ThemeContext';
import { BreakpointsDevicesPage } from './components/design-system/BreakpointsDevicesPage';
=======
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe

type StepStatus = 'pending' | 'loading' | 'complete';

interface GenerationStep {
  label: string;
  status: StepStatus;
}
<<<<<<< HEAD

interface ProcessingStages {
  aaLightComplete: boolean;
  fontPairingComplete: boolean;
  chartColorsComplete: boolean;  // Add a new step for chart colors
  gradientsComplete: boolean;
  remainingModesComplete: boolean;
}
=======
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe

const App = () => {
  const { currentRoute, setCurrentRoute, isMenuOpen } = useNavigation();
  const [isSystemGenerated, setIsSystemGenerated] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(true);
  const [isInfoPanelExpanded, setIsInfoPanelExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [colorExtractionComplete, setColorExtractionComplete] = useState(false);
<<<<<<< HEAD
  const [cachedFontPairs, setCachedFontPairs] = useState<any[]>([]);
  const [cachedMood, setCachedMood] = useState<MoodType>('Sophisticated');
  const [baseColorForFonts, setBaseColorForFonts] = useState<string | null>(null);
  const [fontPairingComplete, setFontPairingComplete] = useState(false);
  
  const themeContext = React.useContext(ThemeContext);
  const themeState = themeContext?.themeState;

  const [processingStages, setProcessingStages] = useState<ProcessingStages>({
    aaLightComplete: false,
    fontPairingComplete: false,
    chartColorsComplete: false,  // Initialize chart colors step
    gradientsComplete: false,
    remainingModesComplete: false
  });

  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([
    { label: 'Extracting Colors', status: 'pending' },
    { label: 'Processing AA-Light Mode', status: 'pending' },
    { label: 'Generating Font Pairs', status: 'pending' },
    { label: 'Generating Chart Colors', status: 'pending' },  // Add a new step for chart colors
    { label: 'Building Gradients', status: 'pending' },
    { label: 'Processing Remaining Modes', status: 'pending' }
  ]);

=======
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
  

>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
  const [settings, setSettings] = useState<DesignSystemSettings>({
    name: '',
    generationMethod: 'Generate from photo/image',
    imageFile: null,
    imageUrl: undefined
  });

<<<<<<< HEAD
=======
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

>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
  const handleGenerate = () => {
    console.log('Starting generation...');
    setIsLoading(true);
    setColorExtractionComplete(false);
<<<<<<< HEAD
    setProcessingStages({
      aaLightComplete: false,
      fontPairingComplete: false,
      chartColorsComplete: false,  // Reset chart colors step
      gradientsComplete: false,
      remainingModesComplete: false
    });
=======
    setFontPairingComplete(false);
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
    setGenerationSteps(prevSteps => 
      prevSteps.map((step, index) => ({
        ...step,
        status: index === 0 ? 'loading' : 'pending'
      }))
    );
  };

<<<<<<< HEAD
  const completeGeneration = () => {
    console.log('Running complete generation');
    
    setGenerationSteps(prevSteps => 
      prevSteps.map(step => ({
        ...step,
        status: 'complete'
      }))
    );
    
    setIsSystemGenerated(true);
    setIsSettingsExpanded(false);
    setIsLoading(false);
    
    setCurrentRoute({
      id: 'home',
      title: 'Design System',
      path: '/',
      icon: Home
    });
    
    console.log('Generation completed, UI updated');
  };

  
  // HiddenProcessing component with improved state management
  const HiddenProcessing = () => {
    if (!settings.imageFile && !settings.imageUrl) {
      console.log('No image source provided');
      return null;
    }
    if (!isLoading) {
      console.log('Not in loading state');
      return null;
    }

    console.log('Current processing state:', {
      colorExtractionComplete,
      processingStages,
      baseColorForFonts
    });

    // Ensure theme is maintained across processing stages
    useEffect(() => {
      console.log('Preserving theme during processing:', {
        currentTheme: themeContext?.themeState?.activeTheme,
        isLoading,
        processingStages
      });
    }, [themeContext?.themeState, isLoading, processingStages]);
    
    return (
      <div style={{ display: 'none' }}>
        {/* Step 1: Color Extraction */}
        {!colorExtractionComplete && (
          <ColorPalette
            imageFile={settings.imageFile}
            imageUrl={settings.imageUrl}
            onColorExtractionComplete={() => {
              console.log('Color extraction complete callback received');
              setColorExtractionComplete(true);
              setGenerationSteps(prevSteps => 
                prevSteps.map((step, index) => ({
                  ...step,
                  status: index === 0 ? 'complete' : 
                          index === 1 ? 'loading' : 'pending'
                }))
              );
            }}
          />
        )}

        {/* Step 2: Theme Processing */}
        {colorExtractionComplete && !processingStages.aaLightComplete && (
          <ThemePage 
            imageFile={settings.imageFile}
            imageUrl={settings.imageUrl}
            isProcessing={true}
            onThemeComplete={(baseColor) => {
              console.log('AA-Light mode processing complete with baseColor:', baseColor);
              setBaseColorForFonts(baseColor);
              setProcessingStages(prev => ({ ...prev, aaLightComplete: true }));
              setGenerationSteps(prevSteps => 
                prevSteps.map((step, index) => ({
                  ...step,
                  status: index <= 1 ? 'complete' : 
                          index === 2 ? 'loading' : 'pending'
                }))
              );
            }}
          />
        )}

        {/* Step 3: Font Pairing */}
        {colorExtractionComplete && processingStages.aaLightComplete && 
         !processingStages.fontPairingComplete && baseColorForFonts && (
          <FontPairings
            imageFile={settings.imageFile}
            baseColor={baseColorForFonts}
            isHiddenProcessing={true}
            onFontPairingComplete={() => {
              console.log('Font pairing complete');
              setProcessingStages(prev => ({ ...prev, fontPairingComplete: true }));
              setGenerationSteps(prevSteps => 
                prevSteps.map((step, index) => ({
                  ...step,
                  status: index <= 2 ? 'complete' : 
                          index === 3 ? 'loading' : 'pending'
                }))
              );
            }}
            onFontPairingSelect={(headerFont, bodyFont, pairs, mood) => {
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
          />
        )}

        {/* Step 4: Chart Colors Processing */}
        {processingStages.fontPairingComplete && !processingStages.chartColorsComplete && (
          <ChartingPage 
            isHiddenProcessing={true}
            onChartColorsComplete={() => {
              console.log('Chart colors processing complete');
              setProcessingStages(prev => ({ ...prev, chartColorsComplete: true }));
              setGenerationSteps(prevSteps => 
                prevSteps.map((step, index) => ({
                  ...step,
                  status: index <= 3 ? 'complete' : 
                          index === 4 ? 'loading' : 'pending'
                }))
              );
            }}
          />
        )}

        {/* Step 5: Gradients Generation */}
        {processingStages.chartColorsComplete && !processingStages.gradientsComplete && (
          <GradientsPage 
            onGradientsComplete={() => {
              console.log('Gradients generation complete');
              
              // First update gradients status
              setProcessingStages(prev => ({ 
                ...prev, 
                gradientsComplete: true 
              }));
              
              // Update loading steps
              setGenerationSteps(prevSteps => 
                prevSteps.map((step, index) => ({
                  ...step,
                  status: index <= 4 ? 'complete' : 'loading'
                }))
              );
              
              // Short delay before final completion
              setTimeout(() => {
                setProcessingStages(prev => ({
                  ...prev,
                  remainingModesComplete: true
                }));
                completeGeneration();
              }, 100);
            }}
          />
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="min-h-screen">
          <LoadingScreen steps={generationSteps} />
          <HiddenProcessing />
        </div>
=======
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
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
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

<<<<<<< HEAD
        // Update the theme route case in App.tsx
        case '/theme':
          return (
            <ThemePage 
              imageFile={settings.imageFile} 
              imageUrl={settings.imageUrl}
              isProcessing={isLoading}
              isThemeAlreadyGenerated={isSystemGenerated} // Add this prop
              onThemeComplete={(baseColor) => {
                console.log('AA-Light mode processing complete');
                setBaseColorForFonts(baseColor);
                setProcessingStages(prev => ({ ...prev, aaLightComplete: true }));
              }}
              onProcessRemainingModes={() => {
                if (processingStages.gradientsComplete) {
                  console.log('Processing remaining modes');
                  setProcessingStages(prev => ({ ...prev, remainingModesComplete: true }));
                  completeGeneration();
                }
              }}
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
=======
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
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
              cachedPairs={cachedFontPairs}
              detectedMood={cachedMood}
            />
          );
<<<<<<< HEAD

          case '/breakpoints-devices':
            return <BreakpointsDevicesPage />;

            case '/backgrounds':
              return <BackgroundsPage />;
        

          case '/component-styling':
            return <ComponentStylingPage />;
          
          case '/navigation-bars':
            return <NavigationBarsPage />;
=======
            
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
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe

      case '/gradients':
        return <GradientsPage />;

<<<<<<< HEAD
      case '/logos':
        return <LogosPage />;

=======
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
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

<<<<<<< HEAD

=======
      case '/cognitive':
        return <CognitivePage />;

      case '/wcag':
        return <WCAGPage />;

      case '/export':
        return <ExportPage />;
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe

      case '/':
      default:
        return (
          <>
<<<<<<< HEAD
            {/* Only show System Settings header after system is generated */}
            {isSystemGenerated && (
              <div className="mb-6">
                <button
                  onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <ChevronDown className="w-5 h-5" />
                    <span className="font-medium">System Settings</span>
                  </div>
                  {!isSettingsExpanded && (
                    <span className="text-sm text-gray-500">
                      {settings.name || 'Untitled Design System'}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Always show SystemSettings component for initial setup, 
                or when system is generated and settings are expanded */}
            {(!isSystemGenerated || isSettingsExpanded) && (
              <div className={isSystemGenerated ? "mt-4" : ""}>
                <SystemSettings
                  settings={settings}
                  setSettings={setSettings}
                  onGenerate={handleGenerate}
                  isSystemGenerated={isSystemGenerated}
                />
              </div>
            )}

            {/* Design System Options - Only show when system is generated and settings are collapsed */}
            {isSystemGenerated && !isSettingsExpanded && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-4">Design System</h2>
=======
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
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
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


  // Add debugging effect for state changes
  useEffect(() => {
    console.log('State updated:', {
      isLoading,
      colorExtractionComplete,
      currentTheme: themeState?.activeTheme?.name, // Change to name for easier logging
      currentThemeColors: themeState?.activeTheme?.colors, // Log the colors
      processingStages,
      currentRoute: currentRoute.path,
      baseColorForFonts,
    });
  }, [isLoading, colorExtractionComplete, processingStages, currentRoute, baseColorForFonts, themeState]);

  return (
    <ColorProvider>
<<<<<<< HEAD
      <ThemeProvider>
          <div className="flex flex-col min-h-screen bg-white">
            <Header />
            <main className="flex-1 p-4">
              {renderContent()}
            </main>
          </div>
      </ThemeProvider>
    </ColorProvider>
=======
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-1 p-4">
          {renderContent()}
        </main>
      </div>
    </ColorProvider>  
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
  );
};

export default App;