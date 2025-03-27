import { TokenRegistry } from '../utils/tokenRegistry';

/**
 * Utility class for logging and monitoring TokenRegistry operations
 */
export class TokenRegistryLogger {
  private static instance: TokenRegistryLogger;
  private originalRegisterToken: Function;
  private tokenRegistry: TokenRegistry;

  private constructor() {
    this.tokenRegistry = TokenRegistry.getInstance();
    
    // Store the original method
    this.originalRegisterToken = this.tokenRegistry.registerToken;
    
    // Override the registerToken method to add logging
    (this.tokenRegistry as any).registerToken = (key: string, token: any) => {
      console.log(`TokenRegistry: Registering token "${key}"`, token);
      return this.originalRegisterToken.call(this.tokenRegistry, key, token);
    };
  }

  public static getInstance(): TokenRegistryLogger {
    if (!TokenRegistryLogger.instance) {
      TokenRegistryLogger.instance = new TokenRegistryLogger();
    }
    return TokenRegistryLogger.instance;
  }

  /**
   * Dump the current state of the TokenRegistry to console
   */
  public dumpRegistry(): void {
    const allTokens = this.tokenRegistry.getAllTokens();
    console.group('TokenRegistry Current State');
    console.log('Total tokens:', Object.keys(allTokens).length);
    
    // Group by mode
    const tokensByMode: Record<string, any[]> = {};
    Object.entries(allTokens).forEach(([key, token]) => {
      const mode = token.mode || 'unknown';
      if (!tokensByMode[mode]) {
        tokensByMode[mode] = [];
      }
      tokensByMode[mode].push({ key, ...token });
    });
    
    // Log tokens by mode
    Object.entries(tokensByMode).forEach(([mode, tokens]) => {
      console.group(`Mode: ${mode} (${tokens.length} tokens)`);
      tokens.forEach(token => {
        console.log(`${token.key}:`, token);
      });
      console.groupEnd();
    });
    
    console.groupEnd();
  }

  /**
   * Restore the original registerToken method
   */
  public restore(): void {
    (this.tokenRegistry as any).registerToken = this.originalRegisterToken;
    console.log('TokenRegistry: Restored original registerToken method');
  }
}

export default TokenRegistryLogger;