import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export interface UpdateSystemPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (updateFontsAndStyles: boolean) => void;
}

const UpdateSystemPanel: React.FC<UpdateSystemPanelProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm
}) => {
  const [updateFontsAndStyles, setUpdateFontsAndStyles] = useState(true);
  
  useEffect(() => {
    if (isOpen) {
      setUpdateFontsAndStyles(true);
    }
  }, [isOpen]);

  return (
    <div 
      className={`
        fixed bottom-0 left-0 right-0 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        bg-white shadow-lg rounded-t-xl
        z-50
      `}
    >
      <div className="max-w-lg mx-auto p-6">
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(updateFontsAndStyles)}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Update
          </button>
        </div>
        <div className="mb-6">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={updateFontsAndStyles}
              onChange={(e) => setUpdateFontsAndStyles(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">
              Update fonts and component styles
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default UpdateSystemPanel;