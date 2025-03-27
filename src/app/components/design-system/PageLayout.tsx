import React from 'react';
import { ChevronLeft, Home } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, children }) => {
  const { setCurrentRoute } = useNavigation();

 const handleBack = () => {
    setCurrentRoute({
      id: 'home',
      title: 'Design System',
      path: '/',
      icon: Home
    });
  };
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={handleBack} 
          className="flex items-center text-purple-500 hover:text-purple-600"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span>Back to Design System</span>
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-8">{title}</h1>

      <div className="space-y-12">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;