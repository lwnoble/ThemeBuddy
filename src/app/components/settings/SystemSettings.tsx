import React, { useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import type { DesignSystemSettings } from '../../types';

interface SystemSettingsProps {
  settings: DesignSystemSettings;
  setSettings: React.Dispatch<React.SetStateAction<DesignSystemSettings>>;
  onGenerate: () => void;
  isSystemGenerated: boolean;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({
    settings,
    setSettings,
    onGenerate,
    isSystemGenerated
  }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      name: e.target.value
    }));
  };
  

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({
      ...prev,
      generationMethod: e.target.value,
      imageFile: undefined,
      imageUrl: undefined
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileUrl = URL.createObjectURL(selectedFile);
      
      setSettings(prev => ({
        ...prev,
        imageFile: selectedFile,
        imageUrl: fileUrl
      }));
    }
  };

    return (
        <div className="space-y-6">
          {/* Design System Name Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Design system name:
            </label>
            <input
              type="text"
              value={settings.name}
              onChange={handleNameChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Enter design system name"
            />
          </div>
    
          {/* Generation Method Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Design system generation method:
            </label>
            <div className="relative">
              <select
                value={settings.generationMethod}
                onChange={handleMethodChange}
                className="w-full p-3 border border-gray-300 rounded-md appearance-none pr-10"
              >
                <option value="">Select generation method</option>
                <option value="Generate from photo/image">Generate from photo/image</option>
                <option value="Generate from words">Generate from words</option>
                <option value="Generate randomly">Generate randomly</option>
                <option value="Generate manually">Generate manually</option>
              </select>
              <ChevronDown 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
              />
            </div>
          </div>
    
          {/* File Upload - Only show if generation method is from photo/image */}
          {settings.generationMethod === 'Generate from photo/image' && (
            <div className="space-y-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  readOnly
                  value={settings.imageFile ? settings.imageFile.name : ''}
                  placeholder="No file selected"
                  className="flex-1 p-3 border border-gray-300 rounded-md bg-white"
                />
                <label className="px-6 py-3 border border-purple-500 text-purple-500 rounded-md hover:bg-purple-50 cursor-pointer">
                  Select Image
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </label>
              </div>
    
              {/* Image Preview */}
              {settings.imageUrl && (
                <div className="mt-4">
                  <img 
                    src={settings.imageUrl} 
                    alt="Selected" 
                    className="max-h-48 rounded-lg object-contain"
                  />
                </div>
              )}
            </div>
          )}
    
          {/* Generate Button */}
          <button
            onClick={onGenerate}
            className="w-full bg-purple-500 text-white py-3 rounded-md hover:bg-purple-600 transition-colors"
            >
            Generate Design System
           </button>
        </div>
      );
    };