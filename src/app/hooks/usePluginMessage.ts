import { useCallback } from 'react';
import type { PluginMessage, DesignSystemSettings } from '../types';

export function usePluginMessage() {
  const sendMessage = useCallback((msg: PluginMessage) => {
    parent.postMessage({ pluginMessage: msg }, '*');
  }, []);

  const generateDesignSystem = useCallback((name: string, settings: DesignSystemSettings) => {
    sendMessage({
      type: 'generate-design-system',
      name,
      settings,
    });
  }, [sendMessage]);

  return {
    sendMessage,
    generateDesignSystem,
  };
}