import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FontStylesDropdownProps {
  label: string;
  styles: {
    serif: string[];
    sansSerif: string[];
    calligraphy?: string[];
  };
  selectedStyles: {
    serif: string[];
    sansSerif: string[];
    calligraphy?: string[];
  };
  onChange: (category: string, selected: string[]) => void;
}

const FontStylesDropdown: React.FC<FontStylesDropdownProps> = ({
  label,
  styles,
  selectedStyles,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const getSelectedCount = () => {
    let count = selectedStyles.serif.length + selectedStyles.sansSerif.length;
    if (selectedStyles.calligraphy) {
      count += selectedStyles.calligraphy.length;
    }
    return count;
  };

  const renderStyleSection = (title: string, category: 'serif' | 'sansSerif' | 'calligraphy') => {
    const options = styles[category] || [];
    if (options.length === 0) return null;

    // Ensure we have a valid array of selected styles for this category
    const currentSelected = selectedStyles[category] || [];

    return (
      <div className="p-3">
        <div className="font-medium text-sm text-gray-700 mb-2">{title}</div>
        <div className="space-y-1">
          {options.map(style => (
            <div
              key={style}
              className="flex items-center space-x-2"
            >
              <input
                type="checkbox"
                id={`${category}-${style}`}
                checked={currentSelected.includes(style)}
                onChange={(e) => {
                  const current = [...currentSelected];
                  let newSelected: string[];
                  if (style === 'All') {
                    newSelected = e.target.checked ? [...options] : [];
                  } else {
                    if (e.target.checked) {
                      newSelected = [...current, style];
                      if (newSelected.length === options.length - 1) {
                        newSelected.push('All');
                      }
                    } else {
                      newSelected = current.filter(s => s !== style && s !== 'All');
                    }
                  }
                  onChange(category, newSelected);
                }}
                className="rounded border-gray-300"
              />
              <label
                htmlFor={`${category}-${style}`}
                className="text-sm cursor-pointer"
              >
                {style}
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 border rounded-lg flex justify-between items-center hover:bg-gray-50 bg-white"
      >
        <span className="text-sm">
          {label}: {getSelectedCount()} selected
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg divide-y">
          {renderStyleSection('Serif Styles', 'serif')}
          {renderStyleSection('Sans Serif Styles', 'sansSerif')}
          {styles.calligraphy && renderStyleSection('Calligraphy Styles', 'calligraphy')}
        </div>
      )}
    </div>
  );
};

export default FontStylesDropdown;