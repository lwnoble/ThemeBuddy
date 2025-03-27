import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ChevronLeft, Home } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';
import CollapsiblePanel from './CollapsiblePanel';

type SpacingStyle = 'Standard' | 'Reduced' | 'Expanded';

export const SizingPage: React.FC = () => {
  const { setCurrentRoute } = useNavigation();
  const [gridSystem, setGridSystem] = useState<8 | 10>(8);
  const [desktopTarget, setDesktopTarget] = useState<number>(24);
  const [spacingStyle, setSpacingStyle] = useState<SpacingStyle>('Standard');

  // Calculate valid target sizes using useMemo
  const targetSizes = useMemo(() => {
    const sizes: number[] = [];
    sizes.push(24); // Always include 24px
    
    let currentSize = gridSystem === 8 ? 32 : 30;
    const maxSize = gridSystem === 8 ? 48 : 50; // Max is 48px for 8px grid, 50px for 10px grid
    
    while (currentSize <= maxSize) {
      sizes.push(currentSize);
      currentSize += gridSystem;
    }
    
    return sizes.sort((a, b) => a - b);
  }, [gridSystem]);

  // Initialize spacing on component mount by copying Standard mode to Default
  useEffect(() => {
    // Copy all spacing variables from Standard to Default mode
    for (let i = 1; i <= 10; i++) {
      window.parent.postMessage({
        pluginMessage: {
          type: 'copy-token-value',
          collection: 'Spacing',
          variable: `Spacing-${i}`,
          fromMode: 'Standard',
          toMode: 'Default'
        }
      }, '*');
    }

    // Copy fractional spacing variables
    ['Half', 'Quarter'].forEach(fraction => {
      window.parent.postMessage({
        pluginMessage: {
          type: 'copy-token-value',
          collection: 'Spacing',
          variable: `Spacing-${fraction}`,
          fromMode: 'Standard',
          toMode: 'Default'
        }
      }, '*');
    });
  }, []);

  const handleGridChange = (newGrid: 8 | 10) => {
    setGridSystem(newGrid);

    // Helper function to update all sizing variables for a mode
    const updateSizingVariables = (mode: string) => {
      // Regular sizes (1-10)
      for (let i = 1; i <= 10; i++) {
        window.parent.postMessage({
          pluginMessage: {
            type: 'update-design-token',
            collection: 'Sizing',
            variable: `Sizing-${i}`,
            value: newGrid * i,
            mode
          }
        }, '*');
      }

      // Additional sizing variables
      const additionalSizing = [
        { name: 'Sizing-20', value: newGrid * 20 },
        { name: 'Sizing-24', value: newGrid * 24 },
        { name: 'Sizing-30', value: newGrid * 30 },
        { name: 'Sizing-One-And-Half', value: newGrid * 1.5 },
        { name: 'Negative-Size-1', value: 0 - newGrid },
        { name: 'Negative-Size-2', value: 0 - (newGrid * 2) },
        { name: 'Negative-Size-Half', value: 0 - (newGrid / 2) },
        { name: 'Negative-Size-Quarter', value: 0 - (newGrid / 4) }
      ];
      
      additionalSizing.forEach(size => {
        window.parent.postMessage({
          pluginMessage: {
            type: 'update-design-token',
            collection: 'Sizing',
            variable: size.name,
            value: size.value,
            mode
          }
        }, '*');
      });

      // Focus variables
      const focusVariables = [
        { name: 'Focus-1', value: newGrid * 1 + 3 },
        { name: 'Focus-2', value: newGrid * 2 + 3 },
        { name: 'Focus-3', value: newGrid * 3 + 3 },
        { name: 'Focus-4', value: newGrid * 4 + 3 },
        { name: 'Focus-5', value: newGrid * 5 + 3 },
        { name: 'Focus-6', value: newGrid * 6 + 3 },
        { name: 'Focus-7', value: newGrid * 7 + 3 },
        { name: 'Focus-8', value: newGrid * 8 + 3 },
        { name: 'Focus-9', value: newGrid * 9 + 3 },
        { name: 'Focus-10', value: newGrid * 10 + 3 },
        { name: 'Focus-Half', value: (newGrid / 2) + 3 },
        { name: 'Focus-Quarter', value: (newGrid / 4) + 3 },
        { name: 'Focus-One-And-Half', value: (newGrid * 1.5) + 3 }
      ];
      
      focusVariables.forEach(focus => {
        window.parent.postMessage({
          pluginMessage: {
            type: 'update-design-token',
            collection: 'Sizing',
            variable: focus.name,
            value: focus.value,
            mode
          }
        }, '*');
      });

      // Fractional sizes
      window.parent.postMessage({
        pluginMessage: {
          type: 'update-design-token',
          collection: 'Sizing',
          variable: 'Sizing-Half',
          value: newGrid / 2,
          mode
        }
      }, '*');

      window.parent.postMessage({
        pluginMessage: {
          type: 'update-design-token',
          collection: 'Sizing',
          variable: 'Sizing-Quarter',
          value: newGrid / 4,
          mode
        }
      }, '*');
    };

    // Helper function to update all spacing variables for a mode with multiplier
    const updateSpacingVariables = (mode: string, multiplier: number = 1) => {
      // Regular sizes (1-10)
      for (let i = 1; i <= 10; i++) {
        window.parent.postMessage({
          pluginMessage: {
            type: 'update-design-token',
            collection: 'Spacing',
            variable: `Spacing-${i}`,
            value: newGrid * i * multiplier,
            mode
          }
        }, '*');
      }

      // Fractional sizes
      window.parent.postMessage({
        pluginMessage: {
          type: 'update-design-token',
          collection: 'Spacing',
          variable: 'Spacing-Half',
          value: (newGrid / 2) * multiplier,
          mode
        }
      }, '*');

      window.parent.postMessage({
        pluginMessage: {
          type: 'update-design-token',
          collection: 'Spacing',
          variable: 'Spacing-Quarter',
          value: (newGrid / 4) * multiplier,
          mode
        }
      }, '*');
    };

    // Update sizing variables for 'Default' mode
    updateSizingVariables('Default');

    // Update spacing variables for each mode with appropriate multipliers
    updateSpacingVariables('Standard', 1);
    updateSpacingVariables('Expanded', 1.5);
    updateSpacingVariables('Reduced', 0.5);
    // Also update Default mode based on current spacing style
    updateSpacingVariables('Default', spacingStyle === 'Standard' ? 1 : spacingStyle === 'Expanded' ? 1.5 : 0.5);

    // Update the grid in System-Styles
    window.parent.postMessage({
      pluginMessage: {
        type: 'update-design-token',
        collection: 'System-Styles',
        variable: 'Grid',
        value: newGrid,
        mode: 'Default'
      }
    }, '*');

    // Update Navigation variables based on grid size
    if (newGrid === 8) {
      // Update LeftNav-Width for 8px grid
      window.parent.postMessage({
        pluginMessage: {
          type: 'update-button-shape',
          shape: 'navigation',
          variables: [
            {
              group: 'Navigation',
              variable: 'LeftNav-Width',
              targetCollection: 'Sizing',
              targetVariable: 'Sizing-30',
              targetMode: 'Default',
              mode: 'Default'
            },
            {
              group: 'Navigation',
              variable: 'TopNav-Height',
              targetCollection: 'Sizing',
              targetVariable: 'Sizing-6',
              targetMode: 'Default',
              mode: 'Default'
            }
          ]
        }
      }, '*');
    } else {
      // Update LeftNav-Width for 10px grid
      window.parent.postMessage({
        pluginMessage: {
          type: 'update-button-shape',
          shape: 'navigation',
          variables: [
            {
              group: 'Navigation',
              variable: 'LeftNav-Width',
              targetCollection: 'Sizing',
              targetVariable: 'Sizing-24',
              targetMode: 'Default',
              mode: 'Default'
            },
            {
              group: 'Navigation',
              variable: 'TopNav-Height',
              targetCollection: 'Sizing',
              targetVariable: 'Sizing-5',
              targetMode: 'Default',
              mode: 'Default'
            }
          ]
        }
      }, '*');
    }

    // Calculate closest valid target size
    if (desktopTarget !== 24) { // Keep 24px as minimum regardless of grid
      let closestTarget;
      
      if (newGrid === 8 && desktopTarget === 50) {
        // If switching to 8px grid and target was 50px, set to 48px
        closestTarget = 48;
      } else {
        // Calculate the nearest multiple of the new grid that's at least 24px
        closestTarget = Math.max(24, Math.round(desktopTarget / newGrid) * newGrid);
        // Cap at different maximums based on grid
        closestTarget = Math.min(closestTarget, newGrid === 8 ? 48 : 50);
      }
      
      // Update target if it changed
      if (closestTarget !== desktopTarget) {
        setDesktopTarget(closestTarget);
        
        window.parent.postMessage({
          pluginMessage: {
            type: 'update-design-token',
            collection: 'System-Styles',
            variable: 'Desktop-Minimum',
            value: closestTarget,
            mode: 'Default'
          }
        }, '*');
      }
    }
  };

  const handleSpacingChange = (style: SpacingStyle) => {
    setSpacingStyle(style);
    
    // Map style names to mode names
    const modeMap = {
      'Standard': 'Standard',
      'Expanded': 'Expanded',
      'Reduced': 'Reduced'
    };

    // Copy all spacing variables from selected mode to Default mode
    for (let i = 1; i <= 10; i++) {
      window.parent.postMessage({
        pluginMessage: {
          type: 'copy-token-value',
          collection: 'Spacing',
          variable: `Spacing-${i}`,
          fromMode: modeMap[style],
          toMode: 'Default'
        }
      }, '*');
    }

    // Copy fractional spacing variables
    ['Half', 'Quarter'].forEach(fraction => {
      window.parent.postMessage({
        pluginMessage: {
          type: 'copy-token-value',
          collection: 'Spacing',
          variable: `Spacing-${fraction}`,
          fromMode: modeMap[style],
          toMode: 'Default'
        }
      }, '*');
    });
  };

  const handleTargetChange = (newTarget: number) => {
    setDesktopTarget(newTarget);
    
    window.parent.postMessage({
      pluginMessage: {
        type: 'update-design-token',
        collection: 'System-Styles',
        variable: 'Desktop-Minimum',
        value: newTarget,
        mode: 'Default'
      }
    }, '*');
  };

  const handleBack = useCallback(() => {
    setCurrentRoute({
      id: 'home',
      title: 'Design System',
      path: '/',
      icon: Home
    });
  }, [setCurrentRoute]);

  return (
    <div className="max-w-sm mx-auto bg-white shadow-md rounded-xl p-6">
      <button
        onClick={handleBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="text-xl">Back</span>
      </button>

      <div className="space-y-4">
        <CollapsiblePanel title="Grid System">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleGridChange(8)}
              className={`px-6 py-3 rounded-xl ${
                gridSystem === 8 ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
              }`}
            >
              8px Grid
            </button>
            <button
              onClick={() => handleGridChange(10)}
              className={`px-6 py-3 rounded-xl ${
                gridSystem === 10 ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
              }`}
            >
              10px Grid
            </button>
          </div>
        </CollapsiblePanel>

        <CollapsiblePanel title="Desktop Minimum Target Area">
          <div className="grid grid-cols-2 gap-3">
            {targetSizes.map(size => (
              <button
                key={size}
                onClick={() => handleTargetChange(size)}
                className={`px-6 py-3 rounded-xl ${
                  desktopTarget === size ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                {size}px
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Minimum target area starts at 24px. Additional sizes align with the {gridSystem}px grid system
            {gridSystem === 8 ? ', with 48px as maximum.' : ', with 50px as maximum.'}
          </p>
        </CollapsiblePanel>

        <CollapsiblePanel title="Spacings">
          <div className="grid grid-cols-1 gap-3">
            {(['Standard', 'Expanded', 'Reduced'] as SpacingStyle[]).map(style => (
              <button
                key={style}
                onClick={() => handleSpacingChange(style)}
                className={`px-6 py-3 rounded-xl ${
                  spacingStyle === style ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{style}</span>
                  <span className="text-sm text-gray-500">
                    {style === 'Standard' ? '1x spacing' : 
                     style === 'Expanded' ? '1.5x spacing' : 
                     '0.5x spacing'}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Choose spacing density to adjust layout spacing throughout the system.
          </p>
        </CollapsiblePanel>
      </div>
    </div>
  );
};

export default SizingPage;