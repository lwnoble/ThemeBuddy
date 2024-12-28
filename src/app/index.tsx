import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { NavigationProvider } from '../context/NavigationContext';
import '../styles.css';

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Failed to find the root element');

  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <NavigationProvider>
        <App />
      </NavigationProvider>
    </React.StrictMode>
  );
} catch (err) {
  console.error('Failed to render the plugin:', err);
  
  // Type check the error object
  const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
  
  document.body.innerHTML = `
    <div style="padding: 20px; color: red;">
      Error loading plugin: ${errorMessage}
    </div>
  `;
}