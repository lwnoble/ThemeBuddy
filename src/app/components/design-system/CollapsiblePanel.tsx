<<<<<<< HEAD
// CollapsiblePanel.tsx
import React, { ReactNode, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CollapsiblePanelProps {
  title: ReactNode;
  children: ReactNode;
  defaultCollapsed?: boolean;
=======
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsiblePanelProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
}

const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  title,
  children,
<<<<<<< HEAD
  defaultCollapsed = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100"
      >
        <div className="flex-1 text-left">{title}</div>
        {isCollapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>
      {!isCollapsed && <div className="p-4 bg-white">{children}</div>}
=======
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-gray-50 rounded-xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 rounded-t-xl"
      >
        <span className="text-base font-semibold">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
    </div>
  );
};

export default CollapsiblePanel;