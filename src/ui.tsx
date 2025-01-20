// ui.tsx

import * as React from 'react';
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

const App: React.FC = () => {
  // States for the landing page
  const [clickCount, setClickCount] = useState(0);
  const [systemName, setSystemName] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  useEffect(() => {
    
    // Tell the plugin we're ready to process files
    parent.postMessage({ 
      pluginMessage: { type: 'ui-ready' } 
    }, '*');
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setUploadedImage(event.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (systemName && uploadedImage) {
      // Handle design system creation
      console.log('Creating design system:', systemName);
    }
  };

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
          border: '1px solid #ccc'
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
          backgroundColor: '#18A0FB',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease'
        }}
        disabled={!systemName || !uploadedImage}
      >
        Create Design System
      </button>

      {/* Preview Information */}
      {systemName && uploadedImage && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p>Design System Name: {systemName}</p>
          <p>Image Selected: {uploadedImage.name}</p>
        </div>
      )}
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

const renderApp = (container: HTMLElement): void => {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
};

// Extend Window interface to avoid type errors
declare global {
  interface Window {
    onUIRender?: () => void;
  }
}

window.onUIRender = () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    try {
      renderApp(rootElement);
      console.log('React rendered successfully');
    } catch (err) {
      console.error('React render error:', err);
      rootElement.textContent = 'Failed to initialize UI';
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root') || document.getElementById('react-app');
  if (rootElement) {
    renderApp(rootElement);
  } else {
    console.error('Root element not found');
  }
});