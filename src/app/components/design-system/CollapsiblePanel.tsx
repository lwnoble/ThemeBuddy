// CollapsiblePanel.tsx
import React, { ReactNode, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CollapsiblePanelProps {
  title: ReactNode;
  children: ReactNode;
  defaultCollapsed?: boolean;
}

const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  title,
  children,
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
    </div>
  );
};

export default CollapsiblePanel;