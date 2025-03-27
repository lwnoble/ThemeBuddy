export interface TokenRegistryEntry {
    hex: string;
    name: string;
    mode: string;
    group: string;
  }
  
  export class TokenRegistry {
    private static instance: TokenRegistry;
    private tokens: Record<string, TokenRegistryEntry> = {};
  
    private constructor() {}
  
    public static getInstance(): TokenRegistry {
      if (!TokenRegistry.instance) {
        TokenRegistry.instance = new TokenRegistry();
      }
      return TokenRegistry.instance;
    }
  
    public registerToken(key: string, token: TokenRegistryEntry) {
      this.tokens[key] = token;
    }
  
    public getToken(key: string): TokenRegistryEntry | undefined {
      return this.tokens[key];
    }
  
    public getAllTokens(): Record<string, TokenRegistryEntry> {
      return this.tokens;
    }
  }