import React, { useState } from 'react';
import { TokenRegistry } from '../../utils/tokenRegistry';

/**
 * A simple component to demonstrate registering and viewing tokens
 */
const TokenRegistryDemo = () => {
  const [tokenKey, setTokenKey] = useState('');
  const [tokenHex, setTokenHex] = useState('#000000');
  const [tokenName, setTokenName] = useState('');
  const [tokenMode, setTokenMode] = useState('AA-light');
  const [tokenGroup, setTokenGroup] = useState('');
  const [registeredTokens, setRegisteredTokens] = useState<any[]>([]);
  
  // Available modes
  const modes = ['AA-light', 'AAA-light', 'AA-dark', 'AAA-dark'];
  
  // Register a new token
  const handleRegisterToken = () => {
    if (!tokenKey) {
      alert('Token key is required');
      return;
    }
    
    const tokenRegistry = TokenRegistry.getInstance();
    tokenRegistry.registerToken(tokenKey, {
      hex: tokenHex,
      name: tokenName || tokenKey,
      mode: tokenMode,
      group: tokenGroup || 'Custom'
    });
    
    // Update the display
    refreshTokens();
    
    // Clear the form
    setTokenKey('');
    setTokenHex('#000000');
    setTokenName('');
    setTokenGroup('');
  };
  
  // Refresh the displayed tokens
  const refreshTokens = () => {
    const tokenRegistry = TokenRegistry.getInstance();
    const allTokens = tokenRegistry.getAllTokens();
    
    const tokens = Object.entries(allTokens).map(([key, token]) => ({
      key,
      ...token
    }));
    
    setRegisteredTokens(tokens);
  };
  
  // Generate random color
  const generateRandomColor = () => {
    const hex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    setTokenHex(hex);
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Token Registry Demo</h2>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Token Key (Required)
            </label>
            <input
              type="text"
              value={tokenKey}
              onChange={(e) => setTokenKey(e.target.value)}
              placeholder="e.g., primary-background"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color Value
            </label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={tokenHex}
                onChange={(e) => setTokenHex(e.target.value)}
                className="h-10 w-12"
              />
              <input
                type="text"
                value={tokenHex}
                onChange={(e) => setTokenHex(e.target.value)}
                placeholder="#000000"
                className="flex-grow p-2 border border-gray-300 rounded-md"
              />
              <button
                onClick={generateRandomColor}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
              >
                Random
              </button>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Token Name
            </label>
            <input
              type="text"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              placeholder="e.g., Primary Background"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mode
            </label>
            <select
              value={tokenMode}
              onChange={(e) => setTokenMode(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {modes.map(mode => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group
            </label>
            <input
              type="text"
              value={tokenGroup}
              onChange={(e) => setTokenGroup(e.target.value)}
              placeholder="e.g., Backgrounds/Primary"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mb-6">
        <button
          onClick={handleRegisterToken}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
        >
          Register Token
        </button>
        
        <button
          onClick={refreshTokens}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
        >
          Refresh Tokens
        </button>
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Registered Tokens ({registeredTokens.length})</h3>
        
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Color
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mode
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {registeredTokens.map((token, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 text-sm text-gray-900">{token.key}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{token.name}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center">
                      <div 
                        className="w-6 h-6 mr-2 rounded border border-gray-300" 
                        style={{ backgroundColor: token.hex }}
                      />
                      <span className="text-sm text-gray-900">{token.hex}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">{token.mode}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{token.group}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {registeredTokens.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No tokens found. Click "Refresh Tokens" to view the registry.
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenRegistryDemo;