figma.showUI(__html__, {
    width: 450,
    height: 800,
    themeColors: true
  });
  
  figma.ui.onmessage = async (msg) => {
    console.log('Message received:', msg);
    
    if (msg.type === 'generate-design-system') {
      const { name, settings } = msg;
      figma.notify('Generating design system...');
    }
  
    if (msg.type === 'notify') {
      figma.notify(msg.message);
    }
  };