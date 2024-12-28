import React from 'react';
import { Star, Copy, Trash2, Info, BookOpen, Mail, User } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';

interface MenuItem {
  id: string;
  title: string;
  path: string;
  icon: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'new', title: 'Create a New Theme', path: '/new', icon: 'star' },
  { id: 'duplicate', title: 'Duplicate Theme', path: '/duplicate', icon: 'copy' },
  { id: 'delete', title: 'Delete Theme', path: '/delete', icon: 'trash' },
  { id: 'about', title: 'About Theme Buddy', path: '/about', icon: 'info' },
  { id: 'docs', title: 'Documentation', path: '/docs', icon: 'book' },
  { id: 'contact', title: 'Contact Us', path: '/contact', icon: 'mail' },
  { id: 'account', title: 'Account', path: '/account', icon: 'user' }
];

export const MenuOverlay: React.FC = () => {
  const { setIsMenuOpen } = useNavigation();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'star': return <Star className="w-5 h-5" />;
      case 'copy': return <Copy className="w-5 h-5" />;
      case 'trash': return <Trash2 className="w-5 h-5" />;
      case 'info': return <Info className="w-5 h-5" />;
      case 'book': return <BookOpen className="w-5 h-5" />;
      case 'mail': return <Mail className="w-5 h-5" />;
      case 'user': return <User className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <img src="/your-icon.png" alt="" className="w-6 h-6" />
        <span className="text-lg font-medium">Your Theme Buddies (1)</span>
      </div>

      <div className="border-b pb-2 mb-4">
        <div className="flex items-center space-x-2 px-4 py-2">
          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
          <span>My Theme Buddy (Current)</span>
        </div>
      </div>

      {MENU_ITEMS.map((item) => (
        <button
          key={item.id}
          className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 rounded-lg"
          onClick={() => {
            // Handle navigation
            setIsMenuOpen(false);
          }}
        >
          <div className="text-purple-500">
            {getIcon(item.icon)}
          </div>
          <span>{item.title}</span>
        </button>
      ))}
    </div>
  );
};