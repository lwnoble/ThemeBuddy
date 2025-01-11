import * as React from 'react';
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

const App: React.FC = () => {
  // States for the landing page
  const [clickCount, setClickCount] = useState(0);
  const [systemName, setSystemName] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [fontDatabase, setFontDatabase] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for font database data passed from the plugin
    window.addEventListener('message', (event) => {
      if (event.data.pluginMessage) {
        const { type, fontDatabase } = event.data.pluginMessage;
        if (type === 'ui-ready') {
          setFontDatabase(fontDatabase);
        }
      }
    });
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setUploadedImage(file);
      
      // Preview the image
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          // You can add image preview logic here if needed
          console.log('Image loaded successfully');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (systemName && uploadedImage && fontDatabase) {
      setIsLoading(true);
      try {
        // Create the design system
        parent.postMessage({
          pluginMessage: {
            type: 'create-design-system',
            name: systemName,
            image: uploadedImage,
            fontDatabase: fontDatabase
          }
        }, '*');
      } catch (error) {
        console.error('Error creating design system:', error);
        setError('Failed to create design system');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        Error: {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ 
        padding: '20px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
      }}>
        <div style={{ marginBottom: '10px' }}>Initializing...</div>
        {/* Add a loading spinner here if desired */}
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#ffffff',
      color: '#000000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px'
    }}>
      <h2>Theme Buddy</h2>
      
      {/* Design System Name Input */}
      <input
        type="text"
        value={systemName}
        onChange={(e) => setSystemName(e.target.value)}
        placeholder="Enter Design System Name"
        style={{
          padding: '8px',
          marginBottom: '10px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          width: '100%',
          maxWidth: '300px'
        }}
      />

      {/* Image Upload */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ marginBottom: '10px' }}
      />

      {/* Create Button */}
      <button 
        onClick={handleSubmit}
        style={{
          padding: '8px 16px',
          backgroundColor: systemName && uploadedImage ? '#18A0FB' : '#cccccc',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: systemName && uploadedImage ? 'pointer' : 'not-allowed',
          transition: 'background-color 0.3s ease',
          width: '100%',
          maxWidth: '300px'
        }}
        disabled={!systemName || !uploadedImage || !fontDatabase}
      >
        Create Design System
      </button>

      {/* Preview Information */}
      {systemName && uploadedImage && (
        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center',
          width: '100%',
          maxWidth: '300px'
        }}>
          <p>Design System Name: {systemName}</p>
          <p>Image Selected: {uploadedImage.name}</p>
          <p>Fonts Available: {fontDatabase?.fonts?.length || 0}</p>
        </div>
      )}
    </div>
  );
};

export default App;