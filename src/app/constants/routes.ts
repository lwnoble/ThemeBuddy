import { 
    Palette, Type, Layout, Image, Box, 
    Grid, Layers, TextCursor, Paintbrush, 
    Ruler, Sparkles, PieChart, Brain, 
    CheckCircle, Code 
  } from 'lucide-react';
  import type { LucideIcon } from 'lucide-react';
  
  export interface RouteConfig {
    id: string;
    title: string;
    path: string;
    icon: LucideIcon;
  }
  
  export interface MenuItem {
    id: string;
    title: string;
    path: string;
    icon: string;
  }
  
  export const MENU_ITEMS: MenuItem[] = [
    { id: 'new', title: 'Create a New Theme', path: '/new', icon: 'star' },
    { id: 'duplicate', title: 'Duplicate Theme', path: '/duplicate', icon: 'copy' },
    { id: 'delete', title: 'Delete Theme', path: '/delete', icon: 'trash' },
    { id: 'about', title: 'About Theme Buddy', path: '/about', icon: 'info' },
    { id: 'docs', title: 'Documentation', path: '/docs', icon: 'book' },
    { id: 'contact', title: 'Contact Us', path: '/contact', icon: 'mail' },
    { id: 'account', title: 'Account', path: '/account', icon: 'user' }
  ];
  
  export const DESIGN_SYSTEM_ROUTES: RouteConfig[] = [
    { id: 'colors', title: 'Color Palette', path: '/colors', icon: Palette },
    { id: 'fonts', title: 'Fonts', path: '/fonts', icon: Type },
    { id: 'theme', title: 'Theme', path: '/theme', icon: Layout },
    { id: 'logos', title: 'Logos', path: '/logos', icon: Image },
    { id: 'backgrounds', title: 'Backgrounds', path: '/backgrounds', icon: Box },
    { id: 'elevations', title: 'Elevations', path: '/elevations', icon: Grid },
    { id: 'gradients', title: 'Gradients', path: '/gradients', icon: Layers },
    { id: 'typography', title: 'Typography', path: '/typography', icon: TextCursor },
    { id: 'colored-icons', title: 'Colored Icons and Text', path: '/colored-icons', icon: Paintbrush },
    { id: 'sizing', title: 'Size and Spacing', path: '/sizing', icon: Ruler },
    { id: 'shadows', title: 'Shadows and Glows', path: '/shadows', icon: Sparkles },
    { id: 'charting', title: 'Charting Colors', path: '/charting', icon: PieChart },
    { id: 'cognitive', title: 'Cognitive Mode', path: '/cognitive', icon: Brain },
    { id: 'wcag', title: 'WCAG Check', path: '/wcag', icon: CheckCircle },
    { id: 'export', title: 'Export CSS', path: '/export', icon: Code }
  ];