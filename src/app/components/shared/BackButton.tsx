import React from 'react';
import { ChevronLeft, Home } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';

export const BackButton: React.FC = () => {
  const { setCurrentRoute } = useNavigation();

  return (
    <button
      onClick={() => setCurrentRoute({ 
        id: 'home', 
        title: 'Design System', 
        path: '/',
        icon: Home 
      })}
      className="flex items-center space-x-2 text-purple-500 hover:text-purple-600"
    >
      <ChevronLeft className="w-5 h-5" />
      <span>Back to Design System</span>
    </button>
  );
};