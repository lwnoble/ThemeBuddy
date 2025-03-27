import React from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';

export const Header: React.FC = () => {
  const { isMenuOpen, setIsMenuOpen, currentRoute } = useNavigation();

  return (
    <header className="flex items-center justify-between p-4 bg-purple-500 text-white">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="hover:bg-purple-600 p-1 rounded"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <div className="flex items-center space-x-2">
          <img 
            src="/your-icon.png" 
            alt="Dynamically" 
            className="w-6 h-6"
          />
          <span className="font-medium">Dynamically</span>
        </div>
      </div>
      <button className="bg-black text-white px-4 py-2 rounded-md flex items-center space-x-2">
        <img 
          src="/your-icon.png" 
          alt="" 
          className="w-4 h-4"
        />
        <span>Go Premium</span>
      </button>
    </header>
  );
};
