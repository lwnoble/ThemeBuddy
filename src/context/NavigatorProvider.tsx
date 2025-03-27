import React, { createContext, useContext, useState } from 'react';
import { Home } from 'lucide-react';
import type { RouteConfig } from '../app/constants/routes';

interface NavigationContextType {
  currentRoute: RouteConfig;
  setCurrentRoute: (route: RouteConfig) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  isSettingsCollapsed: boolean;
  setIsSettingsCollapsed: (collapsed: boolean) => void;
}

const defaultRoute: RouteConfig = {
  id: 'home',
  title: 'Design System',
  path: '/',
  icon: Home
};

export const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<RouteConfig>(defaultRoute);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsCollapsed, setIsSettingsCollapsed] = useState(false);

  return (
    <NavigationContext.Provider 
      value={{ 
        currentRoute, 
        setCurrentRoute, 
        isMenuOpen, 
        setIsMenuOpen,
        isSettingsCollapsed,
        setIsSettingsCollapsed
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};