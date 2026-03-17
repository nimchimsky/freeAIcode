import { OpenRouterConnector } from './openrouter';
import { GeminiConnector } from './gemini';
import { ProviderConnector } from './types';

/**
 * Get all available provider connectors
 */
export function getAllConnectors(): ProviderConnector[] {
  return [
    new OpenRouterConnector(),
    new GeminiConnector(),
  ];
}

export * from './types';
export * from './base';
