import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Home } from 'lucide-react';
import { Header } from './components/navigation/Header';
import { MenuOverlay } from './components/navigation/MenuOverlay';
import { SystemSettings } from './components/settings/SystemSettings';
import ColorPalette from './components/design-system/ColorPalette';
import FontPairings from './components/design-system/FontPairings';
import { GoogleFont } from './utils/googleFontsManager';
import { DESIGN_SYSTEM_ROUTES } from './constants/routes';
import { useNavigation } from '../context/NavigationContext';
import type { DesignSystemSettings } from './types';
import { ColorProvider } from '../context/ColorContext';


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

const App = () => {
  const { currentRoute, setCurrentRoute, isMenuOpen } = useNavigation();
  const [isSystemGenerated, setIsSystemGenerated] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(true);
  const [isInfoPanelExpanded, setIsInfoPanelExpanded] = useState(true);
  const [settings, setSettings] = useState<DesignSystemSettings>({
    name: '',
    generationMethod: 'Generate from photo/image',
  });

  const renderContent = () => {
    console.log('Current route:', currentRoute.path);

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
        return (
          <FontPairings
            imageFile={settings.imageFile || null}
            onBack={() => setCurrentRoute({
              id: 'home',
              title: 'Design System',
              path: '/',
              icon: Home
            })}
            onFontPairingSelect={(headerFont, bodyFont) => {
              console.log('Selected fonts:', { headerFont, bodyFont });
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
        );

      case '/theme':
        return <ThemePage />;

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
                    onGenerate={() => {
                      setIsSystemGenerated(true);
                      setIsSettingsExpanded(false);
                    }}
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