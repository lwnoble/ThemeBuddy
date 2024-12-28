import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

console.log('UI script starting');

const App: React.FC = () => {
  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);
    console.log(`Button clicked ${newClickCount} time(s)`);
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
      <h2>Theme Buddy Test</h2>
      <button 
        onClick={handleClick}
        style={{
          marginTop: '10px',
          padding: '8px 16px',
          backgroundColor: '#18A0FB',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease'
        }}
      >
        Click me
      </button>
      {clickCount > 0 && (
        <p>Button has been clicked {clickCount} time(s)</p>
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

console.log('Attempting immediate render');
const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    renderApp(rootElement);
    console.log('Immediate render successful');
  } catch (err) {
    console.error('Immediate render error:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root') || document.getElementById('react-app');
  if (rootElement) {
    renderApp(rootElement);
  } else {
    console.error('Root element not found');
  }
});