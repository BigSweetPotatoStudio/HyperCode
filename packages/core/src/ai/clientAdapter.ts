/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Content, 
  GenerateContentConfig, 
  SchemaUnion, 
  PartListUnion, 
  GenerateContentResponse 
} from '@google/genai';
import { UniversalAIClient } from './universalClient.js';
import { GeminiClient } from '../core/client.js';
import { AIProvider } from './types.js';
import { Config } from '../config/config.js';

/**
 * Adapter that makes UniversalAIClient compatible with GeminiClient interface
 * This allows gradual migration from Gemini-specific to multi-provider support
 */
export class AIClientAdapter {
  private universalClient: UniversalAIClient;
  private geminiClient?: GeminiClient;
  private config: Config;

  constructor(config: Config) {
    this.config = config;
    this.universalClient = config.getUniversalAIClient();
    
    // For providers that need Gemini-specific functionality, maintain compatibility
    const providerInfo = this.universalClient.getProviderInfo();
    if (providerInfo.provider === AIProvider.GEMINI || providerInfo.provider === AIProvider.GOOGLE) {
      this.geminiClient = config.getGeminiClient();
    }
  }

  /**
   * Determine if we should use the new Universal client or fallback to Gemini client
   */
  private shouldUseUniversalClient(): boolean {
    const providerInfo = this.universalClient.getProviderInfo();
    
    // Use universal client for all non-Gemini providers
    if (providerInfo.provider !== AIProvider.GEMINI && providerInfo.provider !== AIProvider.GOOGLE) {
      return true;
    }
    
    // For Gemini/Google providers, check if we have advanced features that require original client
    // For now, fallback to Gemini client for complex operations
    return false;
  }

  /**
   * Simple text generation that works with all providers
   */
  async generateSimpleText(prompt: string, options?: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }): Promise<{ text: string; usage?: any }> {
    return this.universalClient.generateText(prompt, options);
  }

  /**
   * Structured object generation
   */
  async generateObject<T>(
    prompt: string,
    schema: any,
    options?: {
      temperature?: number;
      systemPrompt?: string;
    }
  ): Promise<{ object: T; usage?: any }> {
    return this.universalClient.generateObject<T>(prompt, schema, options);
  }

  /**
   * Stream text generation
   */
  async streamText(prompt: string, options?: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }) {
    return this.universalClient.streamText(prompt, options);
  }

  /**
   * Legacy compatibility: delegate to GeminiClient for complex operations
   */
  async generateContent(
    contents: Content[],
    generationConfig: GenerateContentConfig,
    abortSignal: AbortSignal,
    model?: string,
  ): Promise<GenerateContentResponse> {
    if (this.shouldUseUniversalClient()) {
      // For non-Gemini providers, we need to adapt the Content[] format
      // This is a simplified adaptation - full implementation would require more work
      throw new Error('Complex generateContent operations with Content[] not yet supported for non-Gemini providers. Use generateSimpleText() instead.');
    }
    
    if (!this.geminiClient) {
      throw new Error('Gemini client not available for this provider');
    }
    
    return this.geminiClient.generateContent(contents, generationConfig, abortSignal, model);
  }

  /**
   * Legacy compatibility: delegate to GeminiClient for JSON generation
   */
  async generateJson(
    contents: Content[],
    schema: SchemaUnion,
    abortSignal: AbortSignal,
    model?: string,
    config: GenerateContentConfig = {},
  ): Promise<Record<string, unknown>> {
    if (this.shouldUseUniversalClient()) {
      // For non-Gemini providers, adapt to simple format
      const prompt = contents.map(c => 
        c.parts?.map(p => 'text' in p ? p.text : '').join(' ') || ''
      ).join('\n');
      
      const result = await this.universalClient.generateObject(prompt, schema, {
        temperature: config.temperature,
      });
      
      return result.object as Record<string, unknown>;
    }
    
    if (!this.geminiClient) {
      throw new Error('Gemini client not available for this provider');
    }
    
    return this.geminiClient.generateJson(contents, schema, abortSignal, model, config);
  }

  /**
   * Test connection to the AI provider
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    return this.universalClient.testConnection();
  }

  /**
   * Get provider information
   */
  getProviderInfo(): { provider: AIProvider; model: string } {
    return this.universalClient.getProviderInfo();
  }

  /**
   * Check if using universal client
   */
  isUsingUniversalClient(): boolean {
    return this.shouldUseUniversalClient();
  }

  /**
   * Get the underlying clients for advanced usage
   */
  getClients(): { universal: UniversalAIClient; gemini?: GeminiClient } {
    return {
      universal: this.universalClient,
      gemini: this.geminiClient,
    };
  }
}