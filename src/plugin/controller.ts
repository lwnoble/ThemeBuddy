// src/plugin/controller.ts

interface ColorAnalysis {
  dominantColors: string[];
  brightness: number;
  saturation: number;
  contrast: number;
}

figma.showUI(__html__, { 
  width: 480, 
  height: 640,
  themeColors: true
});

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'analyze-colors') {
    const selection = figma.currentPage.selection;
    if (selection.length > 0) {
      const colorAnalysis = await analyzeSelection(selection[0]);
      figma.ui.postMessage({ 
        type: 'color-analysis-complete',
        analysis: colorAnalysis
      });
    }
  }

  if (msg.type === 'apply-fonts') {
    const { headerFont, bodyFont } = msg;
    try {
      // Load fonts
      await figma.loadFontAsync({ family: headerFont.family, style: "Regular" });
      await figma.loadFontAsync({ family: bodyFont.family, style: "Regular" });

      // Apply to selection
      const selection = figma.currentPage.selection;
      for (const node of selection) {
        if (node.type === "TEXT") {
          const fontSize = node.fontSize as number;
          if (typeof fontSize === 'number' && fontSize >= 24) {
            node.fontName = { family: headerFont.family, style: "Regular" };
          } else {
            node.fontName = { family: bodyFont.family, style: "Regular" };
          }
        }
      }

      figma.notify("Fonts applied successfully!");
    } catch (error) {
      figma.notify("Error applying fonts. Please try again.", { error: true });
    }
  }
};

async function analyzeSelection(node: SceneNode): Promise<ColorAnalysis> {
  if ('fills' in node) {
    const colors: Array<{ r: number, g: number, b: number }> = [];
    const fills = node.fills as Paint[];
    
    fills.forEach(fill => {
      if (fill.type === 'SOLID') {
        colors.push({
          r: fill.color.r * 255,
          g: fill.color.g * 255,
          b: fill.color.b * 255
        });
      }
    });

    return {
      dominantColors: colors.map(c => `rgb(${c.r},${c.g},${c.b})`),
      brightness: calculateAvgBrightness(colors),
      saturation: calculateAvgSaturation(colors),
      contrast: calculateContrast(colors)
    };
  }

  return {
    dominantColors: [],
    brightness: 0,
    saturation: 0,
    contrast: 0
  };
}

function calculateAvgBrightness(colors: Array<{r: number, g: number, b: number}>): number {
  if (colors.length === 0) return 0;
  return colors.reduce((sum, color) => 
    sum + (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255, 0
  ) / colors.length;
}

function calculateAvgSaturation(colors: Array<{r: number, g: number, b: number}>): number {
  if (colors.length === 0) return 0;
  return colors.reduce((sum, color) => {
    const max = Math.max(color.r, color.g, color.b);
    const min = Math.min(color.r, color.g, color.b);
    return sum + ((max - min) / (max || 1)); // Avoid division by zero
  }, 0) / colors.length;
}

function calculateContrast(colors: Array<{r: number, g: number, b: number}>): number {
  if (colors.length < 2) return 0;
  const brightnesses = colors.map(color => 
    (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255
  );
  const max = Math.max(...brightnesses);
  const min = Math.min(...brightnesses);
  return max + min === 0 ? 0 : (max - min) / (max + min);
}