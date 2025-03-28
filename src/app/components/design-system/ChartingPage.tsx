import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Home } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';
import { useTheme } from '../../../context/ThemeContext';
import { useColors } from '../../../context/ColorContext';
import { ColorData } from '../../types/colors';
import { Theme } from '../../types/theme';
const chroma = require('chroma-js');

type ColorMode = 'AA-light' | 'AA-dark' | 'AAA-light' | 'AAA-dark';

type ChartColorType = {
  hex: string;
  id: string;
  index: number;
  prefix: string;
};

type TabType = 'light' | 'dark';

interface ChartingPageProps {
  isHiddenProcessing?: boolean; // Add this prop to identify when component is used during loading
  onChartColorsComplete?: () => void; // Add callback for the loading process
}

export const ChartingPage: React.FC<ChartingPageProps> = ({ 
  isHiddenProcessing = false,
  onChartColorsComplete
}) => {
  console.log('ChartingPage component loaded', { isHiddenProcessing });
  
  const { themeState } = useTheme();
  const { activeTheme } = themeState;
  const { setCurrentRoute } = useNavigation();
  const { fullColorData } = useColors();
  const [activeTab, setActiveTab] = useState<TabType>('light');
  const [lightModeColors, setLightModeColors] = useState<ChartColorType[]>([]);
  const [darkModeColors, setDarkModeColors] = useState<ChartColorType[]>([]);
  const [additionalColors, setAdditionalColors] = useState<{
    lightMode: string[];
    darkMode: string[];
  }>({
    lightMode: [],
    darkMode: []
  });
  
  // Track if colors have been processed during loading
  const [colorsProcessedForLoading, setColorsProcessedForLoading] = useState<boolean>(false);

  // Utility function to check if a color is a ColorData type
  const isColorData = (color: any): color is ColorData => {
    return color && typeof color === 'object' && 'allModes' in color;
  };

  // Calculate contrast ratio between two colors
  const getContrastRatio = (color1: string, color2: string): number => {
    try {
      return chroma.contrast(color1, color2);
    } catch (error) {
      console.error('Error calculating contrast:', error);
      return 0;
    }
  };
  
  // Calculate color difference using Delta E
  const getDeltaE = (color1: string, color2: string): number => {
    try {
      return chroma.deltaE(color1, color2);
    } catch (error) {
      console.error('Error calculating deltaE:', error);
      return 0;
    }
  };

  // Generate colors for a specific mode
  const generateModeColors = (mode: ColorMode) => {
    console.log(`generateModeColors called for mode: ${mode}`);
    
    if (!activeTheme) {
      console.warn('No active theme available');
      return [];
    }

    const colorTypes: Array<keyof Theme['colors']> = ['primary', 'secondary', 'tertiary'];
    
    // Background colors for contrast checking
    const lightBackground = '#FFFFFF';
    const darkBackground = '#121212';
    
    const colors: ChartColorType[] = [];
    const selectedColors: { [key: string]: { hex: string, index: number }[] } = {};
    
    // First pass: select the first shade for each color type
    colorTypes.forEach(type => {
      const themeColor = activeTheme.colors[type];
      
      // Ensure the color exists and has the specified mode's shades
      if (!isColorData(themeColor) || !themeColor.allModes?.[mode]?.allShades) {
        console.warn(`No valid color data for ${type} in mode ${mode}`);
        return;
      }
      
      const allShades = themeColor.allModes[mode].allShades;
      const background = mode.includes('light') ? lightBackground : darkBackground;
      
      // First shade to check - prioritize middle shades for both light and dark modes
      // For light mode, we start with shade 4; for dark mode, we start with shade 5
      const firstShadeIndex = mode.includes('light') ? 4 : 5; 
      
      // First, check if the preferred shade meets contrast requirements
      const preferredShade = allShades[firstShadeIndex];
      if (preferredShade?.hex) {
        const contrast = getContrastRatio(preferredShade.hex, background);
        console.log(`${mode} ${type} shade ${firstShadeIndex}: contrast = ${contrast.toFixed(2)}`);
        
        // Check deltaE against already selected colors
        let hasEnoughDeltaE = true;
        for (const colorType in selectedColors) {
          for (const shade of selectedColors[colorType]) {
            const deltaE = getDeltaE(preferredShade.hex, shade.hex);
            console.log(`deltaE between ${type} shade ${firstShadeIndex} and ${colorType} shade ${shade.index}: ${deltaE.toFixed(2)}`);
            
            // Increased minimum deltaE from 12 to 18 for better visual distinction
            if (deltaE < 18) {
              hasEnoughDeltaE = false;
              console.log(`Insufficient deltaE (${deltaE.toFixed(2)}) between ${type} and ${colorType}`);
              break;
            }
          }
          if (!hasEnoughDeltaE) break;
        }
        
        if (contrast >= 3.1 && (Object.keys(selectedColors).length === 0 || hasEnoughDeltaE)) {
          // This shade meets contrast and deltaE requirements
          colors.push({
            hex: preferredShade.hex,
            id: `${type}-${firstShadeIndex}`,
            index: firstShadeIndex,
            prefix: type
          });
          
          // Store this shade for later deltaE comparisons
          if (!selectedColors[type]) selectedColors[type] = [];
          selectedColors[type].push({ hex: preferredShade.hex, index: firstShadeIndex });
          
          return;
        }
      }
      
      // If the preferred shade doesn't meet requirements, find an alternative
      console.warn(`${mode} ${type} preferred shade fails contrast or deltaE check`);
      
      // For both light and dark mode, prioritize middle shades before going to extremes
      // Changed alternatives for dark mode to favor mid-range shades
      const alternativeShades = mode.includes('light') 
        ? [5, 3, 6, 7, 2, 8, 1, 9] // Light mode - moderate to dark shades
        : [4, 6, 3, 7, 2, 8, 1, 0] // Dark mode - prioritize moderate shades with good contrast
      
      for (const altIndex of alternativeShades) {
        const altShade = allShades[altIndex];
        if (!altShade?.hex) continue;
        
        const altContrast = getContrastRatio(altShade.hex, background);
        console.log(`Trying alternative ${mode} ${type} shade ${altIndex}: contrast = ${altContrast.toFixed(2)}`);
        
        // Check deltaE against already selected colors
        let hasEnoughDeltaE = true;
        for (const colorType in selectedColors) {
          for (const shade of selectedColors[colorType]) {
            const deltaE = getDeltaE(altShade.hex, shade.hex);
            console.log(`deltaE between ${type} shade ${altIndex} and ${colorType} shade ${shade.index}: ${deltaE.toFixed(2)}`);
            
            // Increased minimum deltaE from 12 to 18 for better visual distinction
            if (deltaE < 18) {
              hasEnoughDeltaE = false;
              console.log(`Insufficient deltaE (${deltaE.toFixed(2)}) between ${type} and ${colorType}`);
              break;
            }
          }
          if (!hasEnoughDeltaE) break;
        }
        
        if (altContrast >= 3.1 && (Object.keys(selectedColors).length === 0 || hasEnoughDeltaE)) {
          console.log(`Using alternative shade ${altIndex} instead of first preferred shade`);
          colors.push({
            hex: altShade.hex,
            id: `${type}-${altIndex}`,
            index: altIndex,
            prefix: type
          });
          
          // Store this shade for later deltaE comparisons
          if (!selectedColors[type]) selectedColors[type] = [];
          selectedColors[type].push({ hex: altShade.hex, index: altIndex });
          
          break;
        }
      }
    });
    
    // Second pass: select the second shade for each color type with deltaE check
    colorTypes.forEach(type => {
      // Skip if we didn't find the first shade for this color type
      if (!selectedColors[type] || selectedColors[type].length === 0) return;
      
      const themeColor = activeTheme.colors[type];
      if (!isColorData(themeColor) || !themeColor.allModes?.[mode]?.allShades) return;
      
      const allShades = themeColor.allModes[mode].allShades;
      const background = mode.includes('light') ? lightBackground : darkBackground;
      
      // Get the first shade we already selected
      const firstShade = selectedColors[type][0];
      
      // Start with the initially preferred second shade
      // For light mode, if first shade is 4, try 6; otherwise try 4
      // For dark mode, if first shade is 5, try 3; otherwise try 5
      // The goal is to select a shade with good visual difference (at least 2 indices away)
      let secondShadeIndex = mode.includes('light') 
        ? (firstShade.index === 4 ? 6 : 4) // 2 shades away for light mode
        : (firstShade.index === 5 ? 3 : 5); // 2 shades away for dark mode
      
      // For both light and dark mode, ensure significant deltaE between shades
      // Increased minimum deltaE from 12 to 18 for better visual distinction
      const minDeltaE = 18;
      
      // Check the originally preferred second shade first
      let meetsRequirements = false;
      
      // Try these shades in sequence, focusing on moderate shades first
      const shadeIndexToTry = mode.includes('light')
        ? [6, 4, 7, 3, 8, 2, 9, 1] // Light mode strategy
        : [3, 7, 2, 8, 1, 0, 4, 6]; // Dark mode strategy - a mix of brighter and darker shades
      
      for (const shadeIndex of shadeIndexToTry) {
        // Skip if this is the same as the first shade we chose
        if (shadeIndex === firstShade.index) continue;
        
        const shade = allShades[shadeIndex];
        if (!shade?.hex) continue;
        
        // Check contrast with background
        const contrast = getContrastRatio(shade.hex, background);
        
        // Check deltaE with first shade and all other already selected colors
        const deltaEWithFirst = getDeltaE(shade.hex, firstShade.hex);
        
        // Check deltaE against all colors from other types
        let hasEnoughDeltaEWithOthers = true;
        for (const otherType in selectedColors) {
          if (otherType === type) continue; // Skip same type
          
          for (const otherShade of selectedColors[otherType]) {
            const deltaE = getDeltaE(shade.hex, otherShade.hex);
            console.log(`deltaE between ${type} second shade ${shadeIndex} and ${otherType} shade ${otherShade.index}: ${deltaE.toFixed(2)}`);
            
            if (deltaE < minDeltaE) {
              hasEnoughDeltaEWithOthers = false;
              console.log(`Insufficient deltaE (${deltaE.toFixed(2)}) between ${type} second shade and ${otherType}`);
              break;
            }
          }
          if (!hasEnoughDeltaEWithOthers) break;
        }
        
        console.log(`${mode} ${type} second shade ${shadeIndex}: contrast = ${contrast.toFixed(2)}, deltaE with first shade = ${deltaEWithFirst.toFixed(2)}, deltaE with others: ${hasEnoughDeltaEWithOthers ? 'sufficient' : 'insufficient'}`);
        
        // All requirements must be met: contrast, deltaE with first shade, and deltaE with other colors
        if (contrast >= 3.1 && deltaEWithFirst >= minDeltaE && hasEnoughDeltaEWithOthers) {
          console.log(`Selected ${mode} ${type} second shade ${shadeIndex}: meets all requirements`);
          secondShadeIndex = shadeIndex;
          meetsRequirements = true;
          break;
        }
      }
      
      if (!meetsRequirements) {
        console.warn(`Could not find a second shade for ${mode} ${type} meeting all requirements`);
        // Fall back to original second shade if we can't meet all requirements
        // At least ensure it meets contrast requirement
        for (const shadeIndex of shadeIndexToTry) {
          // Skip if this is the same as the first shade we chose
          if (shadeIndex === firstShade.index) continue;
          
          const shade = allShades[shadeIndex];
          if (!shade?.hex) continue;
          
          const contrast = getContrastRatio(shade.hex, background);
          
          if (contrast >= 3.1) {
            secondShadeIndex = shadeIndex;
            console.log(`Falling back to ${mode} ${type} second shade ${shadeIndex} with contrast = ${contrast.toFixed(2)}`);
            break;
          }
        }
      }
      
      // Add the selected second shade
      const secondShade = allShades[secondShadeIndex];
      if (secondShade?.hex) {
        colors.push({
          hex: secondShade.hex,
          id: `${type}-${secondShadeIndex}`,
          index: secondShadeIndex,
          prefix: type
        });
        
        // Store this shade for later deltaE comparisons
        if (selectedColors[type]) {
          selectedColors[type].push({ hex: secondShade.hex, index: secondShadeIndex });
        }
        
        // If there's a deltaE value, log it for information
        if (selectedColors[type] && selectedColors[type].length > 1) {
          const deltaE = getDeltaE(secondShade.hex, selectedColors[type][0].hex);
          console.log(`Final ${mode} ${type} deltaE between shades: ${deltaE.toFixed(2)}`);
        }
      }
    });

    console.log(`Generated ${colors.length} colors for ${mode} meeting requirements`);
    return colors;
  };

// Find diverse colors for additional chart colors with increased deltaE
// With strict exclusion of state colors
const findDiverseColors = (
  mode: 'light' | 'dark', 
  existingColors: string[],
  maxColors: number,
  minDeltaE: number
): {hex: string, id: string, colorType: string}[] => {
  const result: {hex: string, id: string, colorType: string}[] = [];
  const background = mode === 'light' ? '#FFFFFF' : '#121212';
  const modeKey = mode === 'light' ? 'AA-light' : 'AA-dark';
  
  // Get references to primary, secondary, and tertiary colors
  const primaryColor = mode === 'light' ? 
    lightModeColors.find(c => c.prefix === 'primary')?.hex || '' : 
    darkModeColors.find(c => c.prefix === 'primary')?.hex || '';
    
  const secondaryColor = mode === 'light' ? 
    lightModeColors.find(c => c.prefix === 'secondary')?.hex || '' : 
    darkModeColors.find(c => c.prefix === 'secondary')?.hex || '';
    
  const tertiaryColor = mode === 'light' ? 
    lightModeColors.find(c => c.prefix === 'tertiary')?.hex || '' : 
    darkModeColors.find(c => c.prefix === 'tertiary')?.hex || '';
  
  console.log(`Finding diverse ${mode} mode colors with strict exclusion of state colors`);
  
  // Track ALL selected colors including both existing and newly added ones
  const selectedColors: string[] = [...existingColors];
  
  // Track the color types to exclude (STATE COLORS)
  const STATE_COLOR_TYPES = ['success', 'error', 'warning', 'info'];
  
  // Extract the color types that are already represented in our palette
  const existingColorTypes = new Set<string>();
  (mode === 'light' ? lightModeColors : darkModeColors).forEach(color => {
    if (color.prefix) {
      existingColorTypes.add(color.prefix);
    }
  });
  
  // First pass: prioritize colors from types not already represented BUT exclude state colors
  const colorsByType: Record<string, {hex: string, id: string, shade: number}[]> = {};
  
  // Debugging: Log the full color data types to check for state colors
  const allColorTypes = new Set<string>();
  fullColorData.forEach(colorData => {
    if (colorData.id) {
      const type = colorData.id.split('-')[0].toLowerCase();
      allColorTypes.add(type);
    }
  });
  console.log('All color types found in fullColorData:', Array.from(allColorTypes));
  
  // First, categorize all colors by their color type
  fullColorData.forEach(colorData => {
    if (!colorData.allModes?.[modeKey]?.allShades || !colorData.id) return;
    
    // Extract color type and strictly check for state colors
    const colorType = colorData.id.split('-')[0].toLowerCase();
    
    // EXCLUDE state colors (success, error, warning, info)
    // Using includes() to catch variations like "success-green" or "error-red"
    const isStateColor = STATE_COLOR_TYPES.some(state => 
      colorType === state || colorType.includes(state)
    );
    
    if (isStateColor) {
      console.log(`!!! EXCLUDING STATE COLOR: ${colorData.id}`);
      return; // Skip this color entirely
    }
    
    // Skip color types that are already in our palette (primary, secondary, tertiary)
    if (existingColorTypes.has(colorType)) {
      console.log(`Skipping already used color type: ${colorType}`);
      return;
    }
    
    if (!colorsByType[colorType]) {
      colorsByType[colorType] = [];
    }
    
    // For each color type, find a suitable shade
    // For both light and dark mode, prioritize middle shades first (4-6)
    const shadeOrder = mode === 'light' 
      ? [4, 5, 3, 6, 7, 2, 8, 9, 1]  // Light mode - moderate to dark
      : [5, 4, 6, 3, 7, 2, 8, 1, 0]  // Dark mode - prioritize moderate shades
    
    for (const shadeIndex of shadeOrder) {
      const shade = colorData.allModes[modeKey].allShades[shadeIndex];
      if (!shade?.hex) continue;
      
      // Double-check this isn't a state color by id pattern (paranoia check)
      const shadeId = `${colorData.id}-${shadeIndex}`;
      if (STATE_COLOR_TYPES.some(state => shadeId.toLowerCase().includes(state))) {
        console.log(`!!! EXCLUDING STATE SHADE: ${shadeId}`);
        continue;
      }
      
      // Add to color type collection for later filtering
      colorsByType[colorType].push({
        hex: shade.hex,
        id: shadeId,
        shade: shadeIndex
      });
    }
  });
  
  // Log found color types after filtering out state colors
  console.log(`Found ${Object.keys(colorsByType).length} color types after excluding state colors:`);
  console.log('Available color types:', Object.keys(colorsByType));
  
  // Sort color types by name for consistent results
  const sortedColorTypes = Object.keys(colorsByType).sort();
  
  // Collect all candidates first to allow more global sorting
  let allCandidates: {hex: string, id: string, shade: number, colorType: string}[] = [];
  
  for (const colorType of sortedColorTypes) {
    const candidates = colorsByType[colorType];
    if (!candidates || candidates.length === 0) continue;
    
    // Check again to make absolutely sure no state colors slip through
    if (STATE_COLOR_TYPES.some(state => colorType.includes(state))) {
      console.log(`!!! SKIPPING STATE COLOR TYPE that got through: ${colorType}`);
      continue;
    }
    
    // Filter candidates to ensure they meet contrast requirement
    const validCandidates = candidates.filter(candidate => {
      // Last paranoia check on ID
      if (STATE_COLOR_TYPES.some(state => candidate.id.toLowerCase().includes(state))) {
        return false;
      }
      
      const contrast = getContrastRatio(candidate.hex, background);
      return contrast >= 3.1;
    });
    
    // Add all valid candidates to our collection
    validCandidates.forEach(candidate => {
      allCandidates.push({
        ...candidate,
        colorType
      });
    });
  }
  
  console.log(`Found ${allCandidates.length} candidate colors (excluding state colors)`);
  
  // Rest of implementation remains the same...
  
  // Sort all candidates by shade preference - use similar preference scoring for both modes
  allCandidates.sort((a, b) => {
    // Unified preference score function for both light and dark mode
    // We want to prioritize middle shades (4-5) for both modes
    const getPreferenceScore = (shade: number) => {
      // Calculate distance from the ideal middle (4.5)
      // Lower distance = higher preference
      const distFromMiddle = Math.abs(shade - 4.5);
      
      // Convert to a score where higher is better
      return 10 - distFromMiddle * 2; // Will give 10 for shade 4 or 5, then decreases
    };
    
    const scoreA = getPreferenceScore(a.shade);
    const scoreB = getPreferenceScore(b.shade);
    
    if (scoreA !== scoreB) return scoreB - scoreA;
    
    // If shades have same preference, prefer higher contrast
    const contrastA = getContrastRatio(a.hex, background);
    const contrastB = getContrastRatio(b.hex, background);
    return contrastB - contrastA;
  });
  
  // Start with a higher deltaE requirement (18 instead of original value)
  // This ensures better visual differentiation between chart colors
  let workingDeltaE = Math.max(minDeltaE, 18);
  
  // Greedy selection algorithm to maximize diversity
  while (result.length < maxColors && allCandidates.length > 0) {
    let bestCandidate = null;
    let bestCandidateIndex = -1;
    let highestMinDeltaE = 0;
    
    // For each candidate, calculate the minimum deltaE to any already selected color
    for (let i = 0; i < allCandidates.length; i++) {
      const candidate = allCandidates[i];
      
      // Final check: Skip if this is somehow a state color that got through
      if (STATE_COLOR_TYPES.some(state => 
        candidate.id.toLowerCase().includes(state) || 
        candidate.colorType.toLowerCase().includes(state)
      )) {
        continue;
      }
      
      // Calculate minimum deltaE to any selected color
      let minDeltaE = Infinity;
      for (const selectedColor of selectedColors) {
        const deltaE = getDeltaE(candidate.hex, selectedColor);
        if (deltaE < minDeltaE) {
          minDeltaE = deltaE;
        }
      }
      
      // If this candidate has a higher minimum deltaE than our current best, update
      if (minDeltaE >= workingDeltaE && minDeltaE > highestMinDeltaE) {
        highestMinDeltaE = minDeltaE;
        bestCandidate = candidate;
        bestCandidateIndex = i;
      }
    }
    
    // If we found a suitable candidate, add it
    if (bestCandidate && highestMinDeltaE >= workingDeltaE) {
      console.log(`Selected ${mode} mode color from type ${bestCandidate.colorType}: ${bestCandidate.hex} (shade ${bestCandidate.shade}, min deltaE: ${highestMinDeltaE.toFixed(2)})`);
      result.push({
        hex: bestCandidate.hex,
        id: bestCandidate.id,
        colorType: bestCandidate.colorType
      });
      
      // Add to tracking array for deltaE checks
      selectedColors.push(bestCandidate.hex);
      
      // Remove the selected candidate
      allCandidates.splice(bestCandidateIndex, 1);
    } else {
      // No suitable candidate found, reduce deltaE requirement and try again
      workingDeltaE -= 1;
      console.log(`No candidate with deltaE >= ${workingDeltaE + 1} found, reducing requirement to ${workingDeltaE}`);
      
      // If we've reduced too far, break to avoid infinite loop
      // Don't go below 12 to maintain good visual differentiation
      if (workingDeltaE < 12) {
        console.log(`Min deltaE threshold too low (${workingDeltaE}), stopping selection`);
        break;
      }
    }
  }
  
  // If we still need more colors, generate analogous colors from the theme colors
  if (result.length < maxColors) {
    console.log(`Need ${maxColors - result.length} more colors, generating analogous colors based on theme`);
    
    // Function to generate analogous colors from a base color
    const generateAnalogousColors = (baseColor: string, baseName: string) => {
      if (!baseColor) return [];
      
      const analogousColors: {hex: string, id: string, source: string}[] = [];
      
      try {
        const baseHsl = chroma(baseColor).hsl();
        const baseHue = baseHsl[0] || 0;
        
        // Create hue shifts at different angles
        const hueShifts = [20, 40, -20, -40, 60, -60, 80, -80];
        
        hueShifts.forEach((shift, index) => {
          // Create a new hue
          const newHue = (baseHue + shift + 360) % 360;
          
          // Try different saturation and lightness combinations
          const satValues = mode === 'light' ? [0.75, 0.65, 0.85] : [0.8, 0.7, 0.9];
          const lightValues = mode === 'light' ? [0.6, 0.5, 0.7] : [0.65, 0.55, 0.75];
          
          for (const sat of satValues) {
            for (const light of lightValues) {
              // Generate candidate color
              const candidateColor = chroma.hsl(newHue, sat, light).hex();
              
              // Check contrast with background
              const contrast = getContrastRatio(candidateColor, background);
              if (contrast < 3.1) continue;
              
              // Check deltaE with existing colors
              let hasEnoughDeltaE = true;
              for (const existingColor of selectedColors) {
                const deltaE = getDeltaE(candidateColor, existingColor);
                if (deltaE < 15) { // Using a slightly lower threshold for analogous colors
                  hasEnoughDeltaE = false;
                  break;
                }
              }
              
              if (hasEnoughDeltaE) {
                analogousColors.push({
                  hex: candidateColor,
                  id: `analogous-${baseName}-${shift}`,
                  source: `analogous-${baseName}`
                });
                break; // Move to next hue shift once we find a suitable color
              }
            }
            
            // If we found a good color for this hue shift, move to the next shift
            if (analogousColors.length > index) break;
          }
        });
        
        return analogousColors;
      } catch (error) {
        console.error('Error generating analogous colors:', error);
        return [];
      }
    };
    
    // Generate colors from primary, secondary, and tertiary in that order
    let analogousCandidates: {hex: string, id: string, source: string}[] = [];
    
    if (primaryColor) {
      const primaryAnalogous = generateAnalogousColors(primaryColor, "primary");
      analogousCandidates = [...analogousCandidates, ...primaryAnalogous];
      console.log(`Generated ${primaryAnalogous.length} analogous colors from primary`);
    }
    
    if (secondaryColor && analogousCandidates.length < maxColors - result.length) {
      const secondaryAnalogous = generateAnalogousColors(secondaryColor, "secondary");
      analogousCandidates = [...analogousCandidates, ...secondaryAnalogous];
      console.log(`Generated ${secondaryAnalogous.length} analogous colors from secondary`);
    }
    
    if (tertiaryColor && analogousCandidates.length < maxColors - result.length) {
      const tertiaryAnalogous = generateAnalogousColors(tertiaryColor, "tertiary");
      analogousCandidates = [...analogousCandidates, ...tertiaryAnalogous];
      console.log(`Generated ${tertiaryAnalogous.length} analogous colors from tertiary`);
    }
    
    console.log(`Generated ${analogousCandidates.length} total analogous candidates from theme colors`);
    
    // Sort by deltaE distance from existing colors (higher is better)
    analogousCandidates.sort((a, b) => {
      // Calculate minimum deltaE to existing colors
      const minDeltaEA = Math.min(...selectedColors.map(color => getDeltaE(a.hex, color)));
      const minDeltaEB = Math.min(...selectedColors.map(color => getDeltaE(b.hex, color)));
      
      return minDeltaEB - minDeltaEA; // Higher deltaE first
    });
    
    // Add as many as needed
    const remainingNeeded = maxColors - result.length;
    for (let i = 0; i < Math.min(remainingNeeded, analogousCandidates.length); i++) {
      const candidate = analogousCandidates[i];
      console.log(`Adding analogous color from ${candidate.source}: ${candidate.hex}`);
      
      result.push({
        hex: candidate.hex,
        id: candidate.id,
        colorType: candidate.source
      });
      
      selectedColors.push(candidate.hex);
    }
    
    // If we still need more colors after all that, create color variations directly
    if (result.length < maxColors) {
      console.log(`Still need ${maxColors - result.length} more colors, generating direct variations`);
      
      // Generate variations of the primary color as a last resort
      const baseColorToVary = primaryColor || '#1976d2'; // Use a default blue if no primary
      
      // Generate variations by adjusting hue, saturation, and lightness
      const hueSteps = [120, 240, 60, 300, 180];
      
      for (const hueStep of hueSteps) {
        if (result.length >= maxColors) break;
        
        try {
          const baseHsl = chroma(baseColorToVary).hsl();
          const newHue = (baseHsl[0] + hueStep) % 360;
          const newColor = chroma.hsl(newHue, baseHsl[1], baseHsl[2]).hex();
          
          // Check contrast
          const contrast = getContrastRatio(newColor, background);
          if (contrast < 3.1) continue;
          
          // Check deltaE
          let hasEnoughDeltaE = true;
          for (const existingColor of selectedColors) {
            const deltaE = getDeltaE(newColor, existingColor);
            if (deltaE < 15) {
              hasEnoughDeltaE = false;
              break;
            }
          }
          
          if (hasEnoughDeltaE) {
            const fallbackId = `direct-variation-${hueStep}`;
            console.log(`Adding direct color variation: ${newColor}`);
            
            result.push({
              hex: newColor,
              id: fallbackId,
              colorType: 'direct-variation'
            });
            
            selectedColors.push(newColor);
          }
        } catch (error) {
          console.error('Error creating direct color variation:', error);
        }
      }
    }
  }
  
  console.log(`Final selection: ${result.length} colors for ${mode} mode (with NO state colors)`);
  return result;
};

  // Function to fix similar colors by checking specific positions
  const fixSimilarColors = (colors: ChartColorType[], mode: 'light' | 'dark'): ChartColorType[] => {
    console.log(`Checking for similar colors in ${mode} mode...`);
    
    // Create a copy so we don't modify the original
    const result = [...colors];
    
    // Define problematic pairs to check by their indices (0-based)
    // These are the positions that look similar in your screenshots
    const problematicPairs = mode === 'light' 
      ? [[0, 3]] // Chart 1 and Chart 4 in light mode
      : [[0, 1]]; // Chart 1 and Chart 2 in dark mode
    
    // A very high deltaE requirement to ensure these pairs are visually distinct
    const requiredDeltaE = 25;
    
    for (const [idx1, idx2] of problematicPairs) {
      if (idx1 >= result.length || idx2 >= result.length) continue;
      
      const color1 = result[idx1].hex;
      const color2 = result[idx2].hex;
      
      const deltaE = getDeltaE(color1, color2);
      console.log(`DeltaE between positions ${idx1} and ${idx2}: ${deltaE.toFixed(2)}`);
      
      if (deltaE < requiredDeltaE) {
        console.log(`Found similar colors at positions ${idx1} and ${idx2}, attempting to replace`);
        
        // Try to find a replacement for the second color
        // (We keep the first color and replace the second)
        const replacementColor = findReplacementColor(
          result, 
          idx2, 
          color1, 
          mode, 
          requiredDeltaE
        );
        if (replacementColor) {
          console.log(`Replacing color at position ${idx2} with better alternative`);
          result[idx2] = {
            ...result[idx2],
            hex: replacementColor
          };
        } else {
          console.log(`Could not find a suitable replacement, shifting colors instead`);
          
          // If no replacement found, shift the order of colors to separate the similar ones
          // Move the second color to the end and shift everything else up
          const colorToMove = result.splice(idx2, 1)[0];
          result.push(colorToMove);
        }
      }
    }
    
    return result;
  };

  // Function to find a replacement color with sufficient deltaE from all other colors
  const findReplacementColor = (
    colors: ChartColorType[], 
    positionToReplace: number, 
    colorToAvoid: string,
    mode: 'light' | 'dark',
    minDeltaE: number
  ): string | null => {
    const modeKey = mode === 'light' ? 'AA-light' : 'AA-dark';
    const background = mode === 'light' ? '#FFFFFF' : '#121212';
    
    // All colors we need to have good distinction from
    const colorsToCheck = colors.map(c => c.hex);
    
    // Get candidate colors
    const candidates: string[] = [];
    
    // Pull from colors found in your theme
    fullColorData.forEach(colorData => {
      if (!colorData.allModes?.[modeKey]?.allShades) return;
      
      // Consider various shades, focusing on vivid ones that are distinctive
      // For light mode, we need more saturated colors to stand out
      // For dark mode, we need brighter colors to stand out
      const shadeIndices = mode === 'light'
        ? [4, 5, 3, 6, 2, 7] // Moderate to vivid shades for light mode
        : [3, 4, 2, 5, 1, 6]; // Brighter to moderate shades for dark mode
      
      for (const shadeIndex of shadeIndices) {
        const shade = colorData.allModes[modeKey].allShades[shadeIndex];
        if (!shade?.hex) continue;
        
        // Check contrast with background
        const contrast = getContrastRatio(shade.hex, background);
        if (contrast >= 3.1) {
          candidates.push(shade.hex);
        }
      }
    });
    
    console.log(`Found ${candidates.length} replacement color candidates`);
    
    // Helper function to calculate minimum deltaE to a set of colors
    const getMinDeltaE = (color: string, colorSet: string[]): number => {
      let minDeltaE = Infinity;
      for (const c of colorSet) {
        const deltaE = getDeltaE(color, c);
        if (deltaE < minDeltaE) {
          minDeltaE = deltaE;
        }
      }
      return minDeltaE;
    };
    
    // Sort candidates by their minimum deltaE to all other colors
    candidates.sort((a, b) => {
      const aMinDeltaE = getMinDeltaE(a, colorsToCheck);
      const bMinDeltaE = getMinDeltaE(b, colorsToCheck);
      return bMinDeltaE - aMinDeltaE; // Higher deltaE is better
    });
    
    // Find the first candidate with sufficient deltaE from all colors
    for (const candidate of candidates) {
      const deltaEToAvoid = getDeltaE(candidate, colorToAvoid);
      
      if (deltaEToAvoid >= minDeltaE) {
        // Also check against all other colors
        let isSuitable = true;
        for (let i = 0; i < colors.length; i++) {
          if (i === positionToReplace) continue; // Skip the position we're replacing
          
          const deltaE = getDeltaE(candidate, colors[i].hex);
          if (deltaE < 15) { // Minimum acceptable deltaE for other colors
            isSuitable = false;
            break;
          }
        }
        
        if (isSuitable) {
          return candidate;
        }
      }
    }
    
    // If we got here, we couldn't find a suitable replacement
    return null;
  };

  // Enhanced updateFigmaVariables function to handle both regular and half-opacity colors
  const updateFigmaVariables = (colors: ChartColorType[], modes: string[]) => {
    console.log(`updateFigmaVariables called with ${colors.length} colors for modes: ${modes.join(', ')}`);
    
    modes.forEach(mode => {
      console.log(`Processing mode: ${mode} in updateFigmaVariables`);
      
      colors.forEach((color, index) => {
        if (color.hex) {
          console.log(`Sending Chart-${index + 1} = ${color.hex} for mode ${mode}`);
          
          // Regular chart color
          window.parent.postMessage({
            pluginMessage: {
              type: 'update-design-token',
              collection: 'Modes',
              group: 'Charts/Default',
              variable: `Chart-${index + 1}`,
              value: color.hex,
              mode
            }
          }, '*');
          
          // Create and send half-opacity version
          const baseHex = color.hex.startsWith('#') 
            ? (color.hex.length > 7 ? color.hex.slice(0, 7) : color.hex)
            : `#${color.hex}`.slice(0, 7);
            
          const halfOpacityHex = `${baseHex}80`;
          console.log(`Sending Chart-${index + 1}-Half = ${halfOpacityHex} for mode ${mode}`);
          
          window.parent.postMessage({
            pluginMessage: {
              type: 'update-design-token',
              collection: 'Modes',
              group: 'Charts/Default',
              variable: `Chart-${index + 1}-Half`,
              value: halfOpacityHex,
              mode
            }
          }, '*');
        } else {
          console.warn(`Empty color hex found at index ${index}`);
        }
      });
      
      // Also update chart axis, grid, and background colors
      const axisColor = mode.includes('light') ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.75)';
      const gridColor = mode.includes('light') ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)';
      const backgroundColor = mode.includes('light') ? '#FFFFFF' : '#121212';
      
      console.log(`Direct update: Chart-Axis-Color = ${axisColor} for mode ${mode}`);
      console.log(`Direct update: Chart-Grid-Color = ${gridColor} for mode ${mode}`);
      console.log(`Direct update: Chart-Background = ${backgroundColor} for mode ${mode}`);
      
      // Update chart axis color
      window.parent.postMessage({
        pluginMessage: {
          type: 'update-design-token',
          collection: 'Modes',
          group: 'Charts/Default',
          variable: 'Chart-Axis-Color',
          value: axisColor,
          mode
        }
      }, '*');
      
      // Update chart grid color
      window.parent.postMessage({
        pluginMessage: {
          type: 'update-design-token',
          collection: 'Modes',
          group: 'Charts/Default',
          variable: 'Chart-Grid-Color',
          value: gridColor,
          mode
        }
      }, '*');
      
      // Update chart background
      window.parent.postMessage({
        pluginMessage: {
          type: 'update-design-token',
          collection: 'Modes',
          group: 'Charts/Default',
          variable: 'Chart-Background',
          value: backgroundColor,
          mode
        }
      }, '*');
    });
    
    console.log('updateFigmaVariables completed');
  };

  // Update colors when theme changes
  useEffect(() => {
    console.log('ChartingPage useEffect triggered');
    
    if (!activeTheme) {
      console.warn('No active theme available');
      return;
    }

    try {
      console.log('Generating chart colors for theme:', activeTheme.name);
      
      // Generate the first 6 colors
      const lightColors = generateModeColors('AA-light');
      const darkColors = generateModeColors('AA-dark');

      console.log('Generated light mode colors:', lightColors);
      console.log('Generated dark mode colors:', darkColors);
      
      // Set these colors to state
      setLightModeColors(lightColors);
      setDarkModeColors(darkColors);

      // Find additional colors immediately after setting the initial colors
      setTimeout(() => {
        console.log('Timeout callback for additional colors started');
        
        // We need the existing colors for deltaE calculations
        const existingLightColors = lightColors.map(c => c.hex).filter(Boolean);
        const existingDarkColors = darkColors.map(c => c.hex).filter(Boolean);
        
        console.log('Finding additional colors with improved selection algorithm');
        
        // Find diverse additional colors for each mode
        const lightModeResults = findDiverseColors('light', existingLightColors, 4, 18);
        const darkModeResults = findDiverseColors('dark', existingDarkColors, 4, 18);
        
        const additional = {
          lightMode: lightModeResults.map(c => c.hex),
          darkMode: darkModeResults.map(c => c.hex)
        };
        
        console.log('Found additional colors:', additional);
        setAdditionalColors(additional);
        
        // Automatically add the additional colors
        const updatedLightColors = [...lightColors];
        const updatedDarkColors = [...darkColors];
        
        additional.lightMode.forEach((color, index) => {
          if (index + lightColors.length < 10) {
            updatedLightColors.push({
              hex: color,
              id: `additional-${index}`,
              index: lightColors.length + index,
              prefix: 'additional'
            });
          }
        });
        
        additional.darkMode.forEach((color, index) => {
          if (index + darkColors.length < 10) {
            updatedDarkColors.push({
              hex: color,
              id: `additional-${index}`,
              index: darkColors.length + index,
              prefix: 'additional'
            });
          }
        });
        
        // Check and fix similar colors in light mode (specifically positions 0 and 3, which are charts 1 and 4)
        const fixedLightColors = fixSimilarColors(updatedLightColors, 'light');
        const fixedDarkColors = fixSimilarColors(updatedDarkColors, 'dark');
        
        console.log('Updated light colors with additional:', fixedLightColors);
        console.log('Updated dark colors with additional:', fixedDarkColors);
        
        // Update the state with the new colors
        setLightModeColors(fixedLightColors);
        setDarkModeColors(fixedDarkColors);
        
        // Update Figma variables
        console.log('Calling updateFigmaVariables for light mode');
        updateFigmaVariables(fixedLightColors, ['AA-light', 'AAA-light']);
        
        console.log('Calling updateFigmaVariables for dark mode');
        updateFigmaVariables(fixedDarkColors, ['AA-dark', 'AAA-dark']);
        
        console.log('Chart color processing complete');
        
        // If this component is being used during the loading process, notify completion
        if (isHiddenProcessing && onChartColorsComplete && !colorsProcessedForLoading) {
          console.log('Chart colors processed during loading, calling completion callback');
          setColorsProcessedForLoading(true);
          onChartColorsComplete();
        }
      }, 500);
      
    } catch (error) {
      console.error('Error generating colors:', error);
      
      // Even if there's an error, we need to call the completion callback if in loading mode
      if (isHiddenProcessing && onChartColorsComplete && !colorsProcessedForLoading) {
        console.log('Error occurred, but still completing chart colors step');
        setColorsProcessedForLoading(true);
        onChartColorsComplete();
      }
    }
  }, [activeTheme, isHiddenProcessing, onChartColorsComplete, colorsProcessedForLoading]);

  // Add additional effect to handle cases where the theme wasn't available initially
  useEffect(() => {
    // This is a safety net for when the component is in hidden processing mode
    // but the theme wasn't available on first render
    if (isHiddenProcessing && activeTheme && onChartColorsComplete && !colorsProcessedForLoading) {
      const safetyTimeoutId = setTimeout(() => {
        console.log('Safety timeout triggered for chart colors processing');
        if (!colorsProcessedForLoading) {
          console.log('Forcing completion of chart colors processing');
          setColorsProcessedForLoading(true);
          onChartColorsComplete();
        }
      }, 3000); // 3 second timeout as fallback
      
      return () => clearTimeout(safetyTimeoutId);
    }
  }, [isHiddenProcessing, activeTheme, onChartColorsComplete, colorsProcessedForLoading]);

  // Helper function for drag-and-drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    const colors = activeTab === 'light' ? lightModeColors : darkModeColors;
    const setColors = activeTab === 'light' ? setLightModeColors : setDarkModeColors;

    const newColors = [...colors];
    const [draggedColor] = newColors.splice(dragIndex, 1);
    newColors.splice(dropIndex, 0, draggedColor);
    setColors(newColors);

    // Update Figma variables
    const modes = activeTab === 'light' ? ['AA-light', 'AAA-light'] : ['AA-dark', 'AAA-dark'];
    updateFigmaVariables(newColors, modes);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleBack = () => {
    setCurrentRoute({
      id: 'home',
      title: 'Design System',
      path: '/',
      icon: Home
    });
  };

  // If this is being used in hidden processing mode, don't render the UI
  if (isHiddenProcessing) {
    return null;
  }

  // Render
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-xl">Back to Design System</span>
        </button>

        <h1 className="text-4xl font-bold mb-8">Charting Colors</h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-8">
            <div className="relative">
              <div className="flex flex-col items-center pb-4">
                <button
                  onClick={() => setActiveTab('light')}
                  className={`text-xl font-medium ${
                    activeTab === 'light'
                      ? 'text-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Light Mode Colors
                </button>
                <span className="text-sm text-gray-400 mt-1">
                  (AA-Light & AAA-Light)
                </span>
              </div>
              {activeTab === 'light' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
              )}
            </div>

            <div className="relative">
              <div className="flex flex-col items-center pb-4">
                <button
                  onClick={() => setActiveTab('dark')}
                  className={`text-xl font-medium ${
                    activeTab === 'dark'
                      ? 'text-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Dark Mode Colors
                </button>
                <span className="text-sm text-gray-400 mt-1">
                  (AA-Dark & AAA-Dark)
                </span>
              </div>
              {activeTab === 'dark' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
              )}
            </div>
          </div>
        </div>

        {/* Color Grid */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-5 gap-8 mt-6">
            {(activeTab === 'light' ? lightModeColors : darkModeColors).map((color, index) => (
              <div
                key={`color-${index}`}
                className="relative flex flex-col items-center"
              >
                <div
                  draggable={!!color.hex}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className="w-full aspect-square"
                >
                  <button
                    className={`w-full h-full rounded-lg shadow transition-transform hover:scale-105 
                      ${!color.hex ? 'border-2 border-dashed border-gray-300' : ''}`}
                    style={{ 
                      backgroundColor: color.hex || 'transparent',
                      cursor: color.hex ? 'move' : 'default'
                    }}
                  />
                </div>
                <div className="absolute w-full text-center" style={{ top: '100%', marginTop: '0.5rem' }}>
                  <span className="text-xs text-gray-400">
                    Chart {index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-20 text-sm text-gray-600 text-center">
            Drag and drop to reorder colors
          </p>
        </div>
        
        {/* Chart Color Documentation */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Chart Color Usage Guide</h2>
          <p className="mb-4">
            These colors are designed to provide optimal contrast and visual distinction for data visualization.
            Each color is available in both regular and half-opacity versions for flexibility in your charts.
          </p>
          
          <h3 className="text-xl font-medium mt-6 mb-3">How to Use:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <span className="font-medium">Base Colors:</span> Use variable <code className="bg-gray-100 px-1 py-0.5 rounded">Chart-1</code> through <code className="bg-gray-100 px-1 py-0.5 rounded">Chart-8</code> as your primary chart colors
            </li>
            <li>
              <span className="font-medium">Half-Opacity:</span> Variables <code className="bg-gray-100 px-1 py-0.5 rounded">Chart-1-Half</code> through <code className="bg-gray-100 px-1 py-0.5 rounded">Chart-8-Half</code> are available for lighter variants
            </li>
            <li>
              <span className="font-medium">Supporting Elements:</span> Use <code className="bg-gray-100 px-1 py-0.5 rounded">Chart-Axis-Color</code>, <code className="bg-gray-100 px-1 py-0.5 rounded">Chart-Grid-Color</code>, and <code className="bg-gray-100 px-1 py-0.5 rounded">Chart-Background</code> for consistent styling
            </li>
          </ul>
          
          <h3 className="text-xl font-medium mt-6 mb-3">Best Practices:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use colors sequentially for related data series (Chart-1, Chart-2, etc.)</li>
            <li>For highlighting specific data points, use a color that stands out from your base palette</li>
            <li>Maintain a consistent color coding scheme across related visualizations</li>
            <li>Consider using half-opacity versions for areas, and full-opacity for lines or points</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChartingPage;