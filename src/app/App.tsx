import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Home } from 'lucide-react';
import { Header } from './components/navigation/Header';
import { MenuOverlay } from './components/navigation/MenuOverlay';
import { SystemSettings } from './components/settings/SystemSettings';
import ColorPalette from './components/design-system/ColorPalette';
import { DESIGN_SYSTEM_ROUTES } from './constants/routes';
import { useNavigation } from '../context/NavigationContext';
import type { DesignSystemSettings } from './types';

const App = () => {
    const { currentRoute, setCurrentRoute, isMenuOpen } = useNavigation();
    const [isSystemGenerated, setIsSystemGenerated] = useState(false);
    const [isSettingsExpanded, setIsSettingsExpanded] = useState(true);
    const [isInfoPanelExpanded, setIsInfoPanelExpanded] = useState(true);
    const [settings, setSettings] = useState<DesignSystemSettings>({
        name: '',
        generationMethod: 'Generate from photo/image',
     });

     const handleGenerate = () => {
        setIsSettingsExpanded(false);
        setIsSystemGenerated(true);
      };

  const renderContent = () => {
    if (isMenuOpen) {
      return <MenuOverlay />;
    }

    if (currentRoute.path === '/colors') {
        console.log('Rendering ColorPalette with:', {
          imageFile: settings.imageFile,
          imageUrl: settings.imageUrl
        });
        
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
      }

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
                <ChevronRight className="w-5 h-5" />
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
                  onClick={() => setCurrentRoute(route)}
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
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1 p-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;