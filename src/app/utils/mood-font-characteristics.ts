import { MoodType } from '../types/fonts';

// Map moods to font characteristics
export const MOOD_FONT_CHARACTERISTICS: Record<MoodType, {
  categories: string[];
  styles: string[];
  weights: string[];
}> = {
  Business: {
    categories: ['serif', 'sans-serif'],
    styles: ['Transitional', 'Modern', 'Neo Grotesque'],
    weights: ['400', '500', '700']
  },
  Calm: {
    categories: ['serif', 'sans-serif'],
    styles: ['Humanist', 'Old Style'],
    weights: ['300', '400', '500']
  },
  Cute: {
    categories: ['sans-serif', 'display'],
    styles: ['Rounded', 'Script'],
    weights: ['400', '500']
  },
  Playful: {
    categories: ['sans-serif', 'display'],
    styles: ['Rounded', 'Handwritten'],
    weights: ['400', '500', '700']
  },
  Fancy: {
    categories: ['serif', 'display'],
    styles: ['Didone', 'Script'],
    weights: ['400', '500', '600']
  },
  Stiff: {
    categories: ['serif', 'sans-serif'],
    styles: ['Slab', 'Geometric'],
    weights: ['400', '500', '700']
  },
  Vintage: {
    categories: ['serif', 'display'],
    styles: ['Old Style', 'Scotch', 'Blackletter'],
    weights: ['400', '500', '600']
  },
  Happy: {
    categories: ['sans-serif', 'display'],
    styles: ['Rounded', 'Script'],
    weights: ['400', '500', '700']
  },
  Futuristic: {
    categories: ['sans-serif'],
    styles: ['Geometric', 'Modern'],
    weights: ['300', '400', '700']
  },
  Excited: {
    categories: ['display', 'sans-serif'],
    styles: ['Display', 'Geometric'],
    weights: ['500', '700', '900']
  },
  Rugged: {
    categories: ['serif', 'sans-serif'],
    styles: ['Slab', 'Geometric'],
    weights: ['500', '600', '700']
  },
  Childlike: {
    categories: ['display', 'sans-serif'],
    styles: ['Rounded', 'Handwritten'],
    weights: ['400', '500']
  },
  Loud: {
    categories: ['display', 'sans-serif'],
    styles: ['Display', 'Black'],
    weights: ['700', '800', '900']
  },
  Artistic: {
    categories: ['serif', 'display'],
    styles: ['Didone', 'Script'],
    weights: ['400', '500', '600']
  },
  Sophisticated: {
    categories: ['serif'],
    styles: ['Didone', 'Modern'],
    weights: ['300', '400', '500']
  },
  Awkward: {
    categories: ['display', 'sans-serif'],
    styles: ['Display', 'Geometric'],
    weights: ['400', '500']
  },
  Active: {
    categories: ['sans-serif'],
    styles: ['Geometric', 'Neo Grotesque'],
    weights: ['500', '600', '700']
  },
  Scary: {
    categories: ['serif', 'display'],
    styles: ['Blackletter', 'Display'],
    weights: ['400', '500', '600']
  }
};