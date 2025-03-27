import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, Home } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';
import { useColors } from '../../../context/ColorContext';
import { useTheme } from '../../../context/ThemeContext';
import CollapsiblePanel from './CollapsiblePanel';
import type { ButtonShape, HotlinkStyle } from '../../types/modes';
import colorToMoods from '../../data/colorToMoods.json';

const chroma = require('chroma-js');

type MoodType = keyof typeof colorToMoods.moodMappings;

// Define the shape configurations based on paste.txt with separated group and variable names
const shapeConfigurations: Record<ButtonShape, Record<string, { group: string; variable: string; collection: string; targetVariable: string; mode: string }>> = {
  'boldly-rounded': {
    'Button-Border-Radius': { group: 'Buttons', variable: 'Button-Border-Radius', collection: 'Sizing', targetVariable: 'Sizing-5', mode: 'Default' },
    'Button-Focus-Radius': { group: 'Buttons', variable: 'Button-Focus-Radius', collection: 'Sizing', targetVariable: 'Focus-5', mode: 'Default' },
    'Button-Horizontal-Padding': { group: 'Buttons', variable: 'Button-Horizontal-Padding', collection: 'Sizing', targetVariable: 'Sizing-5', mode: 'Default' },
    'Button-Horizontal-Padding-With-Icon': { group: 'Buttons', variable: 'Button-Horizontal-Padding-With-Icon', collection: 'Sizing', targetVariable: 'Sizing-4', mode: 'Default' },
    'Input-Border-Radius': { group: 'Inputs', variable: 'Input-Border-Radius', collection: 'Sizing', targetVariable: 'Sizing-5', mode: 'Default' },
    'Input-Focus-Radius': { group: 'Inputs', variable: 'Input-Focus-Radius', collection: 'Sizing', targetVariable: 'Focus-5', mode: 'Default' },
    'Input-Horizontal-Padding': { group: 'Inputs', variable: 'Input-Horizontal-Padding', collection: 'Sizing', targetVariable: 'Sizing-5', mode: 'Default' },
    'Modal-Border-Radius': { group: 'Modals', variable: 'Modal-Border-Radius', collection: 'Sizing', targetVariable: 'Sizing-10', mode: 'Default' },
    'Modal-Padding': { group: 'Modals', variable: 'Modal-Padding', collection: 'Sizing', targetVariable: 'Sizing-10', mode: 'Default' },
    'Handle-Border-Radius': { group: 'Handles', variable: 'Handle-Border-Radius', collection: 'Sizing', targetVariable: 'Sizing-5', mode: 'Default' },
    'Handle-Focus-Radius': { group: 'Handles', variable: 'Handle-Focus-Radius', collection: 'Sizing', targetVariable: 'Focus-5', mode: 'Default' },
    'Card-Border-Radius': { group: 'Cards', variable: 'Card-Border-Radius', collection: 'Sizing', targetVariable: 'Sizing-7', mode: 'Default' },
    'Card-Focus-Radius': { group: 'Cards', variable: 'Card-Focus-Radius', collection: 'Sizing', targetVariable: 'Focus-7', mode: 'Default' },
    'Card-Padding': { group: 'Cards', variable: 'Card-Padding', collection: 'Sizing', targetVariable: 'Sizing-7', mode: 'Default' },
  },
  'amply-rounded': {
    'Button-Border-Radius': { group: 'Buttons', variable: 'Button-Border-Radius', collection: 'Sizing', targetVariable: 'Sizing-2', mode: 'Default' },
    'Button-Focus-Radius': { group: 'Buttons', variable: 'Button-Focus-Radius', collection: 'Sizing', targetVariable: 'Focus-2', mode: 'Default' },
    'Button-Horizontal-Padding': { group: 'Buttons', variable: 'Button-Horizontal-Padding', collection: 'Sizing', targetVariable: 'Sizing-2', mode: 'Default' },
    'Button-Horizontal-Padding-With-Icon': { group: 'Buttons', variable: 'Button-Horizontal-Padding-With-Icon', collection: 'Sizing', targetVariable: 'Sizing-1', mode: 'Default' },
    'Input-Border-Radius': { group: 'Inputs', variable: 'Input-Border-Radius', collection: 'Sizing', targetVariable: 'Sizing-2', mode: 'Default' },
    'Input-Focus-Radius': { group: 'Inputs', variable: 'Input-Focus-Radius', collection: 'Sizing', targetVariable: 'Focus-2', mode: 'Default' },
    'Input-Horizontal-Padding': { group: 'Inputs', variable: 'Input-Horizontal-Padding', collection: 'Sizing', targetVariable: 'Sizing-2', mode: 'Default' },
    'Modal-Border-Radius': { group: 'Modals', variable: 'Modal-Border-Radius', collection: 'Sizing', targetVariable: 'Sizing-8', mode: 'Default' },
    'Modal-Padding': { group: 'Modals', variable: 'Modal-Padding', collection: 'Sizing', targetVariable: 'Sizing-8', mode: 'Default' },
    'Handle-Border-Radius': { group: 'Handles', variable: 'Handle-Border-Radius', collection: 'Sizing', targetVariable: 'Sizing-8', mode: 'Default' },
    'Handle-Focus-Radius': { group: 'Handles', variable: 'Handle-Focus-Radius', collection: 'Sizing', targetVariable: 'Focus-8', mode: 'Default' },
    'Card-Border-Radius': { group: 'Cards', variable: 'Card-Border-Radius', collection: 'Sizing', targetVariable: 'Sizing-4', mode: 'Default' },
    'Card-Focus-Radius': { group: 'Cards', variable: 'Card-Focus-Radius', collection: 'Sizing', targetVariable: 'Focus-4', mode: 'Default' },
    'Card-Padding': { group: 'Cards', variable: 'Card-Padding', collection: 'Sizing', targetVariable: 'Sizing-4', mode: 'Default' },
  },
  'gently-rounded': {
    'Button-Border-Radius': { group: 'Buttons', variable: 'Button-Border-Radius', collection: 'Sizing', targetVariable: 'Sizing-1', mode: 'Default' },
    'Button-Focus-Radius': { group: 'Buttons', variable: 'Button-Focus-Radius', collection: 'Sizing', targetVariable: 'Focus-1', mode: 'Default' },
    'Button-Horizontal-Padding': { group: 'Buttons', variable: 'Button-Horizontal-Padding', collection: 'Sizing', targetVariable: 'Sizing-2', mode: 'Default' },
    'Button-Horizontal-Padding-With-Icon': { group: 'Buttons', variable: 'Button-Horizontal-Padding-With-Icon', collection: 'Sizing', targetVariable: 'Sizing-1', mode: 'Default' },
    'Input-Border-Radius': { group: 'Inputs', variable: 'Input-Border-Radius', collection: 'Sizing', targetVariable: 'Sizing-1', mode: 'Default' },
    'Input-Focus-Radius': { group: 'Inputs', variable: 'Input-Focus-Radius', collection: 'Sizing', targetVariable: 'Focus-1', mode: 'Default' },
    'Input-Horizontal-Padding': { group: 'Inputs', variable: 'Input-Horizontal-Padding', collection: 'Sizing', targetVariable: 'Sizing-2', mode: 'Default' },
    'Modal-Border-Radius': { group: 'Modals', variable: 'Modal-Border-Radius', collection: 'Sizing', targetVariable: 'Sizing-6', mode: 'Default' },
    'Modal-Padding': { group: 'Modals', variable: 'Modal-Padding', collection: 'Sizing', targetVariable: 'Sizing-6', mode: 'Default' },
    'Handle-Border-Radius': { group: 'Handles', variable: 'Handle-Border-Radius', collection: 'Sizing', targetVariable: 'Sizing-1', mode: 'Default' },
    'Handle-Focus-Radius': { group: 'Handles', variable: 'Handle-Focus-Radius', collection: 'Sizing', targetVariable: 'Focus-1', mode: 'Default' },
    'Card-Border-Radius': { group: 'Cards', variable: 'Card-Border-Radius', collection: 'Sizing', targetVariable: 'Sizing-3', mode: 'Default' },
    'Card-Focus-Radius': { group: 'Cards', variable: 'Card-Focus-Radius', collection: 'Sizing', targetVariable: 'Focus-3', mode: 'Default' },
    'Card-Padding': { group: 'Cards', variable: 'Card-Padding', collection: 'Sizing', targetVariable: 'Sizing-3', mode: 'Default' },
  },
  'square': {
    'Button-Border-Radius': { group: 'Buttons', variable: 'Button-Border-Radius', collection: 'Sizing', targetVariable: 'Sizing-Half', mode: 'Default' },
    'Button-Focus-Radius': { group: 'Buttons', variable: 'Button-Focus-Radius', collection: 'Sizing', targetVariable: 'Focus-Half', mode: 'Default' },
    'Button-Horizontal-Padding': { group: 'Buttons', variable: 'Button-Horizontal-Padding', collection: 'Sizing', targetVariable: 'Sizing-2', mode: 'Default' },
    'Button-Horizontal-Padding-With-Icon': { group: 'Buttons', variable: 'Button-Horizontal-Padding-With-Icon', collection: 'Sizing', targetVariable: 'Sizing-1', mode: 'Default' },
    'Input-Border-Radius': { group: 'Inputs', variable: 'Input-Border-Radius', collection: 'Sizing', targetVariable: 'Sizing-Half', mode: 'Default' },
    'Input-Focus-Radius': { group: 'Inputs', variable: 'Input-Focus-Radius', collection: 'Sizing', targetVariable: 'Focus-Half', mode: 'Default' },
    'Input-Horizontal-Padding': { group: 'Inputs', variable: 'Input-Horizontal-Padding', collection: 'Sizing', targetVariable: 'Sizing-2', mode: 'Default' },
    'Modal-Border-Radius': { group: 'Modals', variable: 'Modal-Border-Radius', collection: 'Sizing', targetVariable: 'Sizing-4', mode: 'Default' },
    'Modal-Padding': { group: 'Modals', variable: 'Modal-Padding', collection: 'Sizing', targetVariable: 'Sizing-4', mode: 'Default' },
    'Handle-Border-Radius': { group: 'Handles', variable: 'Handle-Border-Radius', collection: 'Sizing', targetVariable: 'Sizing-Half', mode: 'Default' },
    'Handle-Focus-Radius': { group: 'Handles', variable: 'Handle-Focus-Radius', collection: 'Sizing', targetVariable: 'Focus-Half', mode: 'Default' },
    'Card-Border-Radius': { group: 'Cards', variable: 'Card-Border-Radius', collection: 'Sizing', targetVariable: 'Sizing-2', mode: 'Default' },
    'Card-Focus-Radius': { group: 'Cards', variable: 'Card-Focus-Radius', collection: 'Sizing', targetVariable: 'Focus-2', mode: 'Default' },
    'Card-Padding': { group: 'Cards', variable: 'Card-Padding', collection: 'Sizing', targetVariable: 'Sizing-2', mode: 'Default' },
  }
};

// New types for component shadow and button styling
type ComponentShadowType = 'drop-shadows' | 'no-drop-shadows';
type ButtonStylingType = 'bevel' | 'no-bevel';

const determineColorMood = (baseColor: string): MoodType => {
  if (!baseColor) return 'Sophisticated';

  try {
    const inputColor = chroma(baseColor);
    let closestMood: MoodType = 'Sophisticated';
    let shortestDistance = Number.MAX_VALUE;
    const moodMappings = colorToMoods.moodMappings;

    Object.entries(moodMappings).forEach(([mood, mapping]) => {
      mapping.colors.forEach(colorHex => {
        try {
          const cleanColorHex = colorHex.trim();
          const moodColor = chroma(cleanColorHex);
          const distance = chroma.distance(inputColor, moodColor, 'rgb');
          
          if (distance < shortestDistance) {
            shortestDistance = distance;
            closestMood = mood.split('-')[0] as MoodType;
          }
        } catch (colorErr) {
          console.warn(`Invalid color in mood ${mood}:`, colorHex);
        }
      });
    });

    return closestMood;
  } catch (err) {
    console.error('Error in determineColorMood:', err);
    return 'Sophisticated';
  }
};

const getMoodButtonStyle = (mood: MoodType): ButtonShape => {
  const moodConfig = colorToMoods.moodMappings[mood];
  if (!moodConfig) return 'gently-rounded';

  switch (moodConfig.buttonStyle.toLowerCase()) {
    case 'boldly rounded':
      return 'boldly-rounded';
    case 'amply rounded':
      return 'amply-rounded';
    case 'gently rounded':
      return 'gently-rounded';
    case 'square':
      return 'square';
    default:
      return 'gently-rounded';
  }
};

export const ComponentStylingPage: React.FC = () => {
    const { setCurrentRoute } = useNavigation();
    const { fullColorData } = useColors();
    const themeContext = useTheme();
    
    // Use existing values from theme context or set defaults
    const initialButtonShape = themeContext.themeState?.buttonShape;
    const initialHotlinkStyle = themeContext.themeState?.hotlinkStyle;
    
    // Use local state for all properties
    const [buttonShape, setLocalButtonShape] = useState<ButtonShape | undefined>(initialButtonShape);
    const [hotlinkStyle, setLocalHotlinkStyle] = useState<HotlinkStyle | undefined>(initialHotlinkStyle);
    const [componentShadow, setComponentShadow] = useState<ComponentShadowType>('drop-shadows');
    const [buttonStyling, setButtonStyling] = useState<ButtonStylingType>('no-bevel');
    
    // Updated border radius values for visual display only
    const buttonShapeValues: Record<ButtonShape, number> = {
      'square': 2,
      'gently-rounded': 8,
      'amply-rounded': 16,
      'boldly-rounded': 40
    };

  useEffect(() => {
    // Only set suggested button shape if one isn't already selected
    if (!buttonShape) {
      // Get primary color from fullColorData
      const primaryColor = fullColorData.find(color => 
        color.id.startsWith('primary-color') || 
        color.id.includes('Primary')
      );

      if (primaryColor?.baseHex) {
        const mood = determineColorMood(primaryColor.baseHex);
        const suggestedButtonStyle = getMoodButtonStyle(mood);
        console.log('Detected mood:', mood, 'Suggested button style:', suggestedButtonStyle);
        handleButtonShapeChange(suggestedButtonStyle);
      }
    }
  }, [fullColorData, buttonShape]);

  const handleButtonShapeChange = useCallback((shape: ButtonShape) => {
    // Update local state
    setLocalButtonShape(shape);
    
    // Update theme context if available
    if (themeContext && themeContext.setButtonShape) {
      themeContext.setButtonShape(shape);
    }
    
    // Get the configuration for the selected shape
    const config = shapeConfigurations[shape];
    
    // Send a single message with all variables to update
    window.parent.postMessage({
      pluginMessage: {
        type: 'update-button-shape',
        shape,
        variables: Object.entries(config).map(([key, settings]) => ({
          group: settings.group,
          variable: settings.variable,
          targetCollection: settings.collection,
          targetVariable: settings.targetVariable,
          targetMode: settings.mode,
          mode: 'Default'
        }))
      }
    }, '*');

  }, [themeContext]);

  const handleHotlinkStyleChange = useCallback((style: HotlinkStyle) => {
    // Update local state
    setLocalHotlinkStyle(style);

    // Update theme context if available
    if (themeContext && themeContext.setHotlinkStyle) {
      themeContext.setHotlinkStyle(style);
    }

    // Send the updated hotlink style to Figma if needed
    window.parent.postMessage({
      pluginMessage: {
        type: 'update-hotlink-style',
        value: style,
        mode: 'Default'
      }
    }, '*');
  }, [themeContext]);

  // Handle Component Shadow change
  const handleComponentShadowChange = useCallback((shadowType: ComponentShadowType) => {
    // Update local state
    setComponentShadow(shadowType);
    
    // Determine the source mode based on selection
    const sourceMode = shadowType === 'drop-shadows' ? 'Dropshadows' : 'None';
    
    // Send message to Figma to copy variables
    window.parent.postMessage({
      pluginMessage: {
        type: 'copy-shadow-variables',
        collection: 'Shadows',
        sourceMode,
        targetMode: 'Default'
      }
    }, '*');
    
    // Also update button styling to ensure consistency
    handleButtonStylingChange(buttonStyling, shadowType);
    
  }, [buttonStyling]);

  // Handle Button Styling change
  const handleButtonStylingChange = useCallback((
    stylingType: ButtonStylingType, 
    shadowType: ComponentShadowType = componentShadow
  ) => {
    // Update local state
    setButtonStyling(stylingType);
    
    // Determine the source mode based on both selections
    let sourceMode = 'None';
    
    if (stylingType === 'bevel') {
      if (shadowType === 'drop-shadows') {
        sourceMode = 'Bevel & Elevation';
      } else {
        sourceMode = 'Bevel';
      }
    } else { // no-bevel
      if (shadowType === 'drop-shadows') {
        sourceMode = 'Dropshadows';
      } else {
        sourceMode = 'None';
      }
    }
    
    // Send message to Figma to copy variables
    window.parent.postMessage({
      pluginMessage: {
        type: 'copy-shadow-variables',
        collection: 'Shadows',
        sourceMode,
        targetMode: 'Buttons'
      }
    }, '*');
  }, [componentShadow]);

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
      <div className="max-w-sm mx-auto bg-white shadow-md rounded-xl p-6">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-xl">Back</span>
        </button>

        <div className="space-y-4">
          {/* Button Shape */}
          <CollapsiblePanel title="Button Shape">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleButtonShapeChange('gently-rounded')}
                className={`px-6 py-3 rounded-xl ${
                  buttonShape === 'gently-rounded' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                Gently Rounded
              </button>
              <button
                onClick={() => handleButtonShapeChange('amply-rounded')}
                className={`px-6 py-3 rounded-xl ${
                  buttonShape === 'amply-rounded' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                Amply Rounded
              </button>
              <button
                onClick={() => handleButtonShapeChange('boldly-rounded')}
                className={`px-6 py-3 rounded-xl ${
                  buttonShape === 'boldly-rounded' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                Boldly Rounded
              </button>
              <button
                onClick={() => handleButtonShapeChange('square')}
                className={`px-6 py-3 rounded-xl ${
                  buttonShape === 'square' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                Square
              </button>
            </div>
          </CollapsiblePanel>

          {/* Component Shadow - NEW */}
          <CollapsiblePanel title="Component Shadow">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleComponentShadowChange('drop-shadows')}
                className={`px-6 py-3 rounded-xl ${
                  componentShadow === 'drop-shadows' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                Drop Shadows
              </button>
              <button
                onClick={() => handleComponentShadowChange('no-drop-shadows')}
                className={`px-6 py-3 rounded-xl ${
                  componentShadow === 'no-drop-shadows' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                No Drop Shadows
              </button>
            </div>
          </CollapsiblePanel>

          {/* Button Styling - NEW - with No Bevel listed first */}
          <CollapsiblePanel title="Button Styling">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleButtonStylingChange('no-bevel')}
                className={`px-6 py-3 rounded-xl ${
                  buttonStyling === 'no-bevel' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                No Bevel
              </button>
              <button
                onClick={() => handleButtonStylingChange('bevel')}
                className={`px-6 py-3 rounded-xl ${
                  buttonStyling === 'bevel' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                Bevel
              </button>
            </div>
          </CollapsiblePanel>

          {/* Hotlink Style */}
          <CollapsiblePanel title="Hotlink Style">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleHotlinkStyleChange('tonal')}
                className={`px-6 py-3 rounded-xl ${
                  hotlinkStyle === 'tonal' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                Tonal
              </button>
              <button
                onClick={() => handleHotlinkStyleChange('blue')}
                className={`px-6 py-3 rounded-xl ${
                  hotlinkStyle === 'blue' ? 'bg-purple-50 border-2 border-purple-500' : 'border border-gray-200'
                }`}
              >
                Blue
              </button>
            </div>
          </CollapsiblePanel>
        </div>
      </div>
    </div>
  );
};

export default ComponentStylingPage;