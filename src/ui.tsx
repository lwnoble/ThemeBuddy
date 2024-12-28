import * as React from 'react';
import * as ReactDOM from 'react-dom';

console.log('UI script starting');

const App = () => {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#ffffff',
      color: '#000000'
    }}>
      <h2>Theme Buddy Test</h2>
      <button 
        onClick={() => console.log('clicked')}
        style={{
          marginTop: '10px',
          padding: '8px 16px',
          backgroundColor: '#18A0FB',
          color: 'white',
          border: 'none',
          borderRadius: '6px'
        }}
      >
        Click me
      </button>
    </div>
  );
};

// Make render function available globally
(window as any).onUIRender = () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    try {
      ReactDOM.render(<App />, rootElement);
      console.log('React rendered successfully');
    } catch (err) {
      console.error('React render error:', err);
      rootElement.textContent = 'Failed to initialize UI';
    }
  }
};

// Also try immediate render
console.log('Attempting immediate render');
const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    ReactDOM.render(<App />, rootElement);
    console.log('Immediate render successful');
  } catch (err) {
    console.error('Immediate render error:', err);
  }
}