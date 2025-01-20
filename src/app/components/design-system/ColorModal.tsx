import React from 'react';
import { X, Plus } from 'lucide-react';

interface ColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableColors: string[];
  selectedColors: string[];
  onColorSelect: (color: string) => void;
  onColorRemove: (color: string) => void;
}

const ColorModal = ({
  isOpen,
  onClose,
  availableColors,
  selectedColors,
  onColorSelect,
  onColorRemove
}: ColorModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Custom Color Theme</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Selected Colors */}
          <div>
            <h3 className="text-lg font-medium mb-3">Selected Colors ({selectedColors.length}/3)</h3>
            <div className="grid grid-cols-3 gap-3">
              {selectedColors.map((color) => (
                <button
                  key={color}
                  onClick={() => onColorRemove(color)}
                  className="group relative aspect-square rounded-xl transition-transform hover:scale-105"
                >
                  <div
                    className="w-full h-full rounded-xl"
                    style={{ backgroundColor: color }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-20 rounded-xl">
                    <span className="text-white font-medium">Remove</span>
                  </div>
                </button>
              ))}
              {[...Array(3 - selectedColors.length)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-200"
                />
              ))}
            </div>
          </div>

          {/* Available Colors */}
          <div>
            <h3 className="text-lg font-medium mb-3">Available Colors</h3>
            <div className="grid grid-cols-5 gap-3">
              {availableColors.map((color) => (
                <button
                  key={color}
                  onClick={() => selectedColors.length < 3 && onColorSelect(color)}
                  disabled={selectedColors.length >= 3 || selectedColors.includes(color)}
                  className={`group relative aspect-square rounded-xl transition-transform ${
                    selectedColors.length < 3 && !selectedColors.includes(color)
                      ? 'hover:scale-105'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div
                    className="w-full h-full rounded-xl"
                    style={{ backgroundColor: color }}
                  />
                  {!selectedColors.includes(color) && selectedColors.length < 3 && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-6 h-6 text-white drop-shadow-md" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorModal;