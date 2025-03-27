import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, Home, ChevronDown } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';
import { useColors } from '../../../context/ColorContext';
import CollapsiblePanel from './CollapsiblePanel';

interface GradientStop {
  color: string;
  position: number;
}

interface GradientsPageProps {
  onGradientsComplete?: () => void;
}

interface GradientConfig {
  stops: GradientStop[];
  rotation: number;
  type: 'linear' | 'radial';
  onColor: string;
}

interface GradientSet {
  standard: GradientConfig;
}

const DEFAULT_ROTATION = 25;

const GradientsPage: React.FC<GradientsPageProps> = ({ onGradientsComplete }) => {
  const { setCurrentRoute } = useNavigation();
  const { fullColorData } = useColors();
  const [gradients, setGradients] = useState<Record<string, GradientSet>>({});
  const [selectedStop, setSelectedStop] = useState<{gradientKey: string; stopIndex: number} | null>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  const generateGradient = (config: GradientConfig): string => {
    if (config.type === 'linear') {
      const stopsString = config.stops
        .map(stop => `${stop.color} ${stop.position}%`)
        .join(', ');
      return `linear-gradient(${config.rotation}deg, ${stopsString})`;
    } else if (config.type === 'radial') {
      const stopsString = config.stops
        .map(stop => `${stop.color} ${stop.position}%`)
        .join(', ');
      return `radial-gradient(circle at center, ${stopsString})`;
    }
    return '';
  };

  const handleColorChange = (gradientKey: string, stopIndex: number, newColor: string) => {
    setGradients(prev => {
      const gradient = prev[gradientKey].standard;
      const newStops = [...gradient.stops];
      newStops[stopIndex] = {
        ...newStops[stopIndex],
        color: newColor
      };
      
      return {
        ...prev,
        [gradientKey]: {
          ...prev[gradientKey],
          standard: {
            ...gradient,
            stops: newStops
          }
        }
      };
    });
  };

  const handleStopPositionChange = (
    gradientKey: string, 
    stopIndex: number, 
    newPosition: number
  ) => {
    setGradients(prev => {
      const gradient = prev[gradientKey].standard;
      const newStops = [...gradient.stops];
      newStops[stopIndex] = {
        ...newStops[stopIndex],
        position: newPosition
      };
      newStops.sort((a, b) => a.position - b.position);
      
      return {
        ...prev,
        [gradientKey]: {
          ...prev[gradientKey],
          standard: {
            ...gradient,
            stops: newStops
          }
        }
      };
    });
  };

  const handleRotationChange = (gradientKey: string, newRotation: number) => {
    setGradients(prev => ({
      ...prev,
      [gradientKey]: {
        ...prev[gradientKey],
        standard: {
          ...prev[gradientKey].standard,
          rotation: newRotation
        }
      }
    }));
  };

  const handleTypeChange = (gradientKey: string, newType: 'linear' | 'radial') => {
    setGradients(prev => ({
      ...prev,
      [gradientKey]: {
        ...prev[gradientKey],
        standard: {
          ...prev[gradientKey].standard,
          type: newType
        }
      }
    }));
  };

  const handleRemoveStop = (gradientKey: string, stopIndex: number) => {
    setGradients(prev => {
      const gradient = prev[gradientKey].standard;
      // Don't remove if it's the last stop
      if (gradient.stops.length <= 2) return prev;
      
      const newStops = gradient.stops.filter((_, index) => index !== stopIndex);
      return {
        ...prev,
        [gradientKey]: {
          ...prev[gradientKey],
          standard: {
            ...gradient,
            stops: newStops
          }
        }
      };
    });
    setSelectedStop(null);
  };

  useEffect(() => {
    if (!fullColorData?.length) return;

    const newGradients: Record<string, GradientSet> = {};
    
    // Create gradient sets for the first 4 extracted colors
    fullColorData.slice(0, 4).forEach((colorData, index) => {
      if (colorData && colorData.baseHex) {
        const gradientKey = `gradient-${index + 1}`;
        const complementaryIndex = (index + 2) % 4;
        const complementaryColor = fullColorData[complementaryIndex]?.baseHex || colorData.baseHex;

        newGradients[gradientKey] = {
          standard: {
            stops: [
              { color: colorData.baseHex, position: 0 },
              { color: complementaryColor, position: 100 }
            ],
            rotation: DEFAULT_ROTATION,
            type: 'linear',
            onColor: '#FFFFFF'
          }
        };
      }
    });

    setGradients(newGradients);
  }, [fullColorData]);

   // Add effect to call onComplete when gradients are generated
   useEffect(() => {
    if (Object.keys(gradients).length > 0 && onGradientsComplete) {
      onGradientsComplete();
    }
  }, [gradients, onGradientsComplete]);

  const handleBack = useCallback(() => {
    setCurrentRoute({
      id: 'home',
      title: 'Design System',
      path: '/',
      icon: Home
    });
  }, [setCurrentRoute]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-xl">Back</span>
        </button>

        <div className="space-y-4">
          {Object.entries(gradients).map(([key, gradientSet]) => (
            <CollapsiblePanel 
              key={key} 
              title={
                <div className="flex items-center space-x-4">
                  <div
                    className="w-20 h-20 rounded-lg shadow-sm"
                    style={{ background: generateGradient(gradientSet.standard) }}
                  />
                  <span>{`Gradient ${key.split('-')[1]}`}</span>
                </div>
              }
              defaultCollapsed={false}
            >
              <div className="space-y-6">
                {/* Gradient Preview */}
                <div 
                  className="w-full h-48 rounded-lg"
                  style={{ background: generateGradient(gradientSet.standard) }}
                />

                {/* Gradient Line with Stops */}
                <div className="relative h-8">
                  <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 h-2 rounded-full"
                    style={{ background: generateGradient(gradientSet.standard) }}
                  />
                  {gradientSet.standard.stops.map((stop, index) => (
                    <div
                      key={index}
                      className={`absolute top-1/2 transform -translate-y-1/2 -ml-3 cursor-pointer
                        ${selectedStop?.gradientKey === key && selectedStop?.stopIndex === index ? 'ring-2 ring-blue-500' : ''}`}
                      style={{ left: `${stop.position}%` }}
                      onClick={() => setSelectedStop({ gradientKey: key, stopIndex: index })}
                    >
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow"
                        style={{ backgroundColor: stop.color }}
                      />
                    </div>
                  ))}
                </div>

                {/* Selected Stop Controls */}
                {selectedStop?.gradientKey === key && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2">Color</label>
                        <div className="relative">
                          <select
                            value={gradientSet.standard.stops[selectedStop.stopIndex].color}
                            onChange={(e) => handleColorChange(key, selectedStop.stopIndex, e.target.value)}
                            className="w-full p-2 appearance-none border rounded-lg"
                          >
                            {fullColorData.map((color) => (
                              <option key={color.id} value={color.baseHex}>
                                {color.name}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded"
                            style={{ backgroundColor: gradientSet.standard.stops[selectedStop.stopIndex].color }}
                          />
                          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm mb-2">Position</label>
                        <div className="relative">
                          <select
                            value={gradientSet.standard.stops[selectedStop.stopIndex].position}
                            onChange={(e) => handleStopPositionChange(key, selectedStop.stopIndex, Number(e.target.value))}
                            className="w-full p-2 appearance-none border rounded-lg"
                          >
                            {Array.from({length: 101}, (_, i) => i).map(pos => (
                              <option key={pos} value={pos}>{pos}%</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveStop(key, selectedStop.stopIndex)}
                      className="text-blue-500 hover:text-blue-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Type and Rotation Controls */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">Rotation</label>
                    <div className="relative">
                      <select
                        value={gradientSet.standard.rotation}
                        onChange={(e) => handleRotationChange(key, Number(e.target.value))}
                        className="w-full p-2 appearance-none border rounded-lg"
                      >
                        {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                          <option key={deg} value={deg}>{deg}°</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Type</label>
                    <div className="relative">
                      <select
                        value={gradientSet.standard.type}
                        onChange={(e) => handleTypeChange(key, e.target.value as 'linear' | 'radial')}
                        className="w-full p-2 appearance-none border rounded-lg"
                      >
                        <option value="linear">Linear</option>
                        <option value="radial">Radial</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </CollapsiblePanel>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GradientsPage;