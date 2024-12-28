import React from 'react';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';
import type { RouteConfig } from '../../../app/constants/routes';

interface NavigationLinkProps {
  route: RouteConfig;
}

export const NavigationLink: React.FC<NavigationLinkProps> = ({ route }) => {
  const { setCurrentRoute } = useNavigation();

  return (
    <button
      onClick={() => setCurrentRoute(route)}
      className="w-full p-4 flex items-center justify-between bg-white rounded-lg border hover:bg-gray-50"
    >
      <div className="flex items-center space-x-3">
        <route.icon className="w-5 h-5 text-purple-500" />
        <span>{route.title}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </button>
  );
};