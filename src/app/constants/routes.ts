import { 
  Palette, Type, Layout, Image, Box, 
  Grid, Layers, TextCursor, Paintbrush, 
  Ruler, Sparkles, PieChart, Brain, 
  CheckCircle, Code, Settings, Navigation,
  Monitor // Add this import for the device icon
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
  { id: 'about', title: 'About Dynamically', path: '/about', icon: 'info' },
  { id: 'docs', title: 'Documentation', path: '/docs', icon: 'book' },
  { id: 'contact', title: 'Contact Us', path: '/contact', icon: 'mail' },
  { id: 'account', title: 'Account', path: '/account', icon: 'user' }
];

export const DESIGN_SYSTEM_ROUTES: RouteConfig[] = [
  { id: 'colors', title: 'Color Palette', path: '/colors', icon: Palette },
  { id: 'theme', title: 'Theme', path: '/theme', icon: Layout },
  { id: 'backgrounds', title: 'Backgrounds', path: '/backgrounds', icon: Box },
  { id: 'component-styling', title: 'Component Styling', path: '/component-styling', icon: Settings },
  { id: 'fonts', title: 'Fonts', path: '/fonts', icon: Type },
  { id: 'typography', title: 'Typography', path: '/typography', icon: TextCursor },
  { id: 'breakpoints-devices', title: 'Breakpoints & Devices', path: '/breakpoints-devices', icon: Monitor },{ id: 'navigation-bars', title: 'Navigation Bars', path: '/navigation-bars', icon: Navigation },
  { id: 'sizing', title: 'Size and Spacing', path: '/sizing', icon: Ruler },
  { id: 'colored-icons', title: 'Colored Icons and Text', path: '/colored-icons', icon: Paintbrush },
  { id: 'gradients', title: 'Gradients', path: '/gradients', icon: Layers },
  { id: 'charting', title: 'Charting Colors', path: '/charting', icon: PieChart },
  { id: 'logos', title: 'Logos', path: '/logos', icon: Image },

];