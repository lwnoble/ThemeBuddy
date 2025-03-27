// src/context/BackgroundContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BackgroundTheme, BackgroundThemeStore } from '../app/types/backgrounds';
import { Mode } from '../app/types/modes';
// Import the backgroundThemeStore
import { backgroundThemeStore } from '../app/utils/styleProcessors';

interface BackgroundContextType {
  backgroundStore: BackgroundThemeStore;
  setBackground: (id: string, mode: Mode, data: BackgroundTheme) => void;
  getAllBackgrounds: (mode?: Mode) => BackgroundTheme[];
  getBackgroundById: (id: string, mode: Mode) => BackgroundTheme | undefined;
  getModeBackgrounds: (mode: Mode) => BackgroundTheme[];
  getAllModes: (id: string) => Record<Mode, BackgroundTheme | undefined>;
  syncWithProcessorStore: () => void; // Add a new function to sync with processor store
}

const BackgroundContext = createContext<BackgroundContextType>({
  backgroundStore: {},
  setBackground: () => {},
  getAllBackgrounds: () => [],
  getBackgroundById: () => undefined,
  getModeBackgrounds: () => [],
  getAllModes: () => ({} as Record<Mode, BackgroundTheme | undefined>),
  syncWithProcessorStore: () => {}
});

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const [backgroundStore, setBackgroundStore] = useState<BackgroundThemeStore>(backgroundThemeStore);
  
  // Sync with the processor's background store on mount and when it changes
  useEffect(() => {
    const handleBackgroundsUpdated = () => {
      console.log('BackgroundContext: Syncing with processor store', backgroundThemeStore);
      setBackgroundStore({...backgroundThemeStore});
    };

    // Initial sync
    handleBackgroundsUpdated();
    
    // Listen for updates
    window.addEventListener('backgroundThemeUpdated', handleBackgroundsUpdated);
    
    return () => {
      window.removeEventListener('backgroundThemeUpdated', handleBackgroundsUpdated);
    };
  }, []);
  
  // Function to manually sync the context with the processor store
  const syncWithProcessorStore = useCallback(() => {
    console.log('BackgroundContext: Manual sync with processor store', backgroundThemeStore);
    setBackgroundStore({...backgroundThemeStore});
  }, []);
  
  const setBackground = useCallback((id: string, mode: Mode, data: BackgroundTheme) => {
    // Update our local store
    setBackgroundStore(prev => {
      const newStore = { ...prev };
      if (!newStore[id]) {
        newStore[id] = {};
      }
      newStore[id][mode] = data;
      return newStore;
    });
    
    // Also update the processor's store
    if (!backgroundThemeStore[id]) {
      backgroundThemeStore[id] = {};
    }
    backgroundThemeStore[id][mode] = data;
  }, []);
  
  const getAllBackgrounds = useCallback((mode?: Mode) => {
    if (!mode) {
      // Return all backgrounds for all modes
      const allBackgrounds: BackgroundTheme[] = [];
      
      Object.keys(backgroundStore).forEach(id => {
        Object.values(backgroundStore[id]).forEach(theme => {
          if (theme) {
            allBackgrounds.push(theme);
          }
        });
      });
      
      return allBackgrounds;
    } else {
      // Return all backgrounds for a specific mode
      const modeBackgrounds: BackgroundTheme[] = [];
      
      Object.keys(backgroundStore).forEach(id => {
        const theme = backgroundStore[id][mode];
        if (theme) {
          modeBackgrounds.push(theme);
        }
      });
      
      return modeBackgrounds;
    }
  }, [backgroundStore]);
  
  const getBackgroundById = useCallback((id: string, mode: Mode) => {
    return backgroundStore[id]?.[mode];
  }, [backgroundStore]);
  
  const getModeBackgrounds = useCallback((mode: Mode) => {
    const modeBackgrounds: BackgroundTheme[] = [];
    
    Object.keys(backgroundStore).forEach(id => {
      const theme = backgroundStore[id][mode];
      if (theme) {
        modeBackgrounds.push(theme);
      }
    });
    
    return modeBackgrounds;
  }, [backgroundStore]);
  
  const getAllModes = useCallback((id: string) => {
    const result = {} as Record<Mode, BackgroundTheme | undefined>;
    const groupData = backgroundStore[id] || {};
    
    // Initialize with undefined for all possible modes
    const allModes: Mode[] = ['AA-light', 'AA-dark', 'AAA-light', 'AAA-dark'];
    allModes.forEach(mode => {
      result[mode] = groupData[mode];
    });
    
    return result;
  }, [backgroundStore]);
  
  return (
    <BackgroundContext.Provider 
      value={{ 
        backgroundStore, 
        setBackground, 
        getAllBackgrounds, 
        getBackgroundById,
        getModeBackgrounds,
        getAllModes,
        syncWithProcessorStore
      }}
    >
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackgrounds() {
  return useContext(BackgroundContext);
}