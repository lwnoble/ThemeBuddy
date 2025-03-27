import React, { useRef, useState } from 'react';
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
<<<<<<< HEAD
  const [error, setError] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Function to create a sanitized filename
  const createSafeFileName = (name: string): string => {
    // Replace spaces and special characters with underscores
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
  };

  // Validate form based on selected generation method
  const validateForm = (): boolean => {
    // Clear any previous errors
    setError('');

    // Check if name is provided
    if (!settings.name || settings.name.trim() === '') {
      setError('Please provide a design system name.');
      return false;
    }

    // Check if generation method is selected
    if (!settings.generationMethod) {
      setError('Please select a generation method.');
      return false;
    }

    // Check method-specific requirements
    if (settings.generationMethod === 'Generate from photo/image' && !settings.imageFile) {
      setError('Please select an image to generate from.');
      return false;
    }

    if (settings.generationMethod === 'Generate from words' && (!settings.mood || settings.mood.trim() === '')) {
      setError('Please provide a mood description.');
      return false;
    }

    return true;
  };

  // Function to duplicate and customize the JSON file
  const duplicateTokensFile = async () => {
    try {
      // Send message to the Figma plugin to handle file duplication
      window.parent.postMessage({
        pluginMessage: {
          type: 'duplicate-tokens-file',
          payload: {
            name: settings.name,
            safeFileName: createSafeFileName(settings.name),
            metadata: {
              name: settings.name,
              dateCreated: new Date().toISOString(),
              generationMethod: settings.generationMethod,
              mood: settings.mood || undefined
            }
          }
        }
      }, '*');

    } catch (error) {
      console.error('Error duplicating tokens file:', error);
      setError('Failed to duplicate tokens file. Please try again.');
    }
  };

  // Update design system name in Figma variables
  const updateDesignSystemName = (name: string) => {
    try {
      window.parent.postMessage({
        pluginMessage: {
          type: 'update-design-token',
          collection: 'System-Styles',
          mode: 'Default',
          variable: 'Name',
          value: name
        }
      }, '*');
      console.log(`Updated System-Styles.Name to "${name}"`);
    } catch (error) {
      console.error('Error updating design system name:', error);
      setError('Failed to update design system name. Please try again.');
    }
  };
=======
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setSettings(prev => ({
      ...prev,
      name: newName
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({
      ...prev,
      generationMethod: e.target.value,
      imageFile: undefined,
      imageUrl: undefined,
      mood: ''
<<<<<<< HEAD
=======
    }));
  };

  const handleMoodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      mood: e.target.value
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
    }));
    
    // Clear error when user changes method
    if (error) setError('');
  };

  const handleMoodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      mood: e.target.value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input change event:', e.target.files);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileUrl = URL.createObjectURL(selectedFile);
<<<<<<< HEAD
  
      setSettings(prev => ({
        ...prev,
        imageFile: selectedFile,
        imageUrl: fileUrl,
      }));
      
      // Clear error when user selects file
      if (error) setError('');
    }
  };

  // Modified generate handler with validation
  const handleGenerate = async () => {
    // Validate form first
    if (!validateForm()) {
      return; // Stop if validation fails
    }
    
    // First, update the design system name in Figma variables
    updateDesignSystemName(settings.name);
    
    // Then continue with the duplication and generation
    await duplicateTokensFile();
    onGenerate();
  };

  // Determine if form is valid for button state
  const isFormValid = () => {
    if (!settings.name || !settings.generationMethod) return false;
    
    if (settings.generationMethod === 'Generate from photo/image' && !settings.imageFile) {
      return false;
    }
    
    if (settings.generationMethod === 'Generate from words' && (!settings.mood || settings.mood.trim() === '')) {
      return false;
    }
    
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Collapsible Title Bar - Only show after system is generated */}
      {isSystemGenerated && (
        <div 
          className="flex items-center justify-between p-3 bg-gray-100 rounded-lg cursor-pointer"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <h2 className="font-medium">System Settings</h2>
          <ChevronDown className={`transition-transform duration-200 ${isCollapsed ? '' : 'transform rotate-180'}`} />
        </div>
      )}
      
      {/* Settings Content - Always show if not generated, or show if not collapsed when generated */}
      {(!isSystemGenerated || !isCollapsed) && (
        <div className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
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

          {/* Mood Description Input */}
          {settings.generationMethod === 'Generate from words' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Mood Description
              </label>
              <input
                type="text"
                value={settings.mood}
                onChange={handleMoodChange}
                placeholder="Describe the desired mood"
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>
          )}

          {/* File Upload */}
          {settings.generationMethod === 'Generate from photo/image' && (
            <div className="space-y-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full p-3 border rounded-md flex items-center justify-center gap-2 ${
                  settings.imageFile 
                    ? 'border-green-500 text-green-500 hover:bg-green-50' 
                    : 'border-purple-500 text-purple-500 hover:bg-purple-50'
                }`}
              >Select an Image
             </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
              />

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

          {/* Generate Button - Only show if not yet generated */}
          {!isSystemGenerated && (
            <button
              onClick={handleGenerate}
              disabled={!isFormValid()}
              className={`w-full py-3 rounded-md transition-colors ${
                !isFormValid() 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              Generate Design System
            </button>
          )}
        </div>
      )}
=======
      console.log('Creating file URL:', fileUrl);
  
      setSettings(prev => {
        const newSettings = {
          ...prev,
          imageFile: selectedFile,
          imageUrl: fileUrl,
        };
        console.log('Updated settings:', newSettings);
        return newSettings;
      });
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

      {/* Mood Description Input */}
      {settings.generationMethod === 'Generate from words' && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Mood Description
          </label>
          <input
            type="text"
            value={settings.mood}
            onChange={handleMoodChange}
            placeholder="Describe the desired mood"
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>
      )}

      {/* File Upload - Only show if generation method is from photo/image */}
      {settings.generationMethod === 'Generate from photo/image' && (
        <div className="space-y-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-3 border border-purple-500 text-purple-500 rounded-md hover:bg-purple-50 flex items-center justify-center gap-2"
          >
            {settings.imageFile ? settings.imageFile.name : 'Select Image'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*"
          />

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
>>>>>>> 1c2c6148da612151452e1206e1b5acdf550ffafe
    </div>
  );
};