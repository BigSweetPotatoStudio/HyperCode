/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createCohere } from '@ai-sdk/cohere';
import { createMistral } from '@ai-sdk/mistral';
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText, generateObject, streamText, LanguageModel } from 'ai';
import { ProxyUtils, CustomFetch } from '../utils/proxyUtils.js';

import { AIProvider, AIProviderConfig, DEFAULT_MODELS } from './types.js';

/**
 * Creates and configures AI language models based on provider configuration
 */
export class AIProviderFactory {
  private static instance?: AIProviderFactory;

  public static getInstance(): AIProviderFactory {
    if (!this.instance) {
      this.instance = new AIProviderFactory();
    }
    return this.instance;
  }

  /**
   * Get custom fetch function with proxy support if configured
   */
  private getCustomFetch(config: AIProviderConfig): CustomFetch | undefined {
    // If proxy is explicitly configured in config, temporarily set env var
    if (config.proxy) {
      const originalProxy = process.env.HYPERCODE_PROXY;
      process.env.HYPERCODE_PROXY = config.proxy;
      const customFetch = ProxyUtils.createFetch();
      // Restore original value
      if (originalProxy) {
        process.env.HYPERCODE_PROXY = originalProxy;
      } else {
        delete process.env.HYPERCODE_PROXY;
      }
      return customFetch;
    }
    
    return ProxyUtils.createFetch();
  }

  /**
   * Create a language model instance for the specified provider
   */
  createModel(config: AIProviderConfig): LanguageModel {
    const { provider, apiKey, apiUrl, model, options = {} } = config;
    const customFetch = this.getCustomFetch(config);

    const providerCreators: Record<string, () => any> = {
      [AIProvider.OPENAI]: () => createOpenAI({
        apiKey: apiKey || process.env.OPENAI_API_KEY,
        baseURL: apiUrl,
        compatibility: "strict",
        fetch: customFetch,
        ...options,
      }),
      
      [AIProvider.ANTHROPIC]: () => createAnthropic({
        apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
        baseURL: apiUrl,
        fetch: customFetch,
        ...options,
      }),
      
      [AIProvider.GOOGLE]: () => createGoogleGenerativeAI({
        apiKey: apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        baseURL: apiUrl,
        fetch: customFetch,
        ...options,
      }),
      
      [AIProvider.GEMINI]: () => createGoogleGenerativeAI({
        apiKey: apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        baseURL: apiUrl,
        fetch: customFetch,
        ...options,
      }),
      
      [AIProvider.COHERE]: () => createCohere({
        apiKey: apiKey || process.env.COHERE_API_KEY,
        baseURL: apiUrl,
        fetch: customFetch,
        ...options,
      }),
      
      [AIProvider.MISTRAL]: () => createMistral({
        apiKey: apiKey || process.env.MISTRAL_API_KEY,
        baseURL: apiUrl,
        fetch: customFetch,
        ...options,
      }),
      
      [AIProvider.AMAZON_BEDROCK]: () => {
        // Amazon Bedrock uses AWS SDK, which has its own proxy handling
        const bedrockConfig: any = {
          region: options.region as string || process.env.AWS_REGION || 'us-east-1',
          accessKeyId: options.accessKeyId as string || process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: options.secretAccessKey as string || process.env.AWS_SECRET_ACCESS_KEY,
          fetch: customFetch, // Some versions of Bedrock SDK support custom fetch
          ...options,
        };
        
        return createAmazonBedrock(bedrockConfig);
      },
      
      // Fallback for unknown providers using OpenAI-compatible interface
      unknown: () => createOpenAICompatible({
        name: provider,
        baseURL: apiUrl || '',
        apiKey: apiKey || '',
        fetch: customFetch,
        ...options,
      })
    };

    const createProvider = providerCreators[provider] || providerCreators.unknown;
    const aiProvider = createProvider();
    
    return aiProvider(model);
  }

  /**
   * Parse provider configuration from environment variables
   */
  parseEnvironmentConfig(): AIProviderConfig {
    const provider = (process.env.HYPERCODE_PROVIDER as AIProvider) || AIProvider.GEMINI;
    const apiKey = process.env.HYPERCODE_API_KEY;
    const apiUrl = process.env.HYPERCODE_API_URL;
    const model = process.env.HYPERCODE_MODEL || DEFAULT_MODELS[provider];
    const proxy = process.env.HYPERCODE_PROXY || process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

    return {
      provider,
      apiKey,
      apiUrl,
      model,
      proxy,
    };
  }

  /**
   * Validate provider configuration
   */
  validateConfig(config: AIProviderConfig): void {
    const { provider, model } = config;

    if (!Object.values(AIProvider).includes(provider)) {
      throw new Error(`Invalid AI provider: ${provider}`);
    }

    if (!model) {
      throw new Error(`Model is required for provider: ${provider}`);
    }

    // Provider-specific validation
    switch (provider) {
      case AIProvider.OPENAI:
        if (!config.apiKey && !process.env.OPENAI_API_KEY) {
          throw new Error('OpenAI API key is required');
        }
        break;

      case AIProvider.ANTHROPIC:
        if (!config.apiKey && !process.env.ANTHROPIC_API_KEY) {
          throw new Error('Anthropic API key is required');
        }
        break;

      case AIProvider.GOOGLE:
      case AIProvider.GEMINI:
        if (!config.apiKey && !process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
          throw new Error('Google AI API key is required');
        }
        break;

      case AIProvider.COHERE:
        if (!config.apiKey && !process.env.COHERE_API_KEY) {
          throw new Error('Cohere API key is required');
        }
        break;

      case AIProvider.MISTRAL:
        if (!config.apiKey && !process.env.MISTRAL_API_KEY) {
          throw new Error('Mistral API key is required');
        }
        break;

      case AIProvider.AMAZON_BEDROCK:
        // AWS credentials validation is handled by AWS SDK
        break;
    }
  }

  /**
   * List all supported providers
   */
  getSupportedProviders(): AIProvider[] {
    return Object.values(AIProvider);
  }

  /**
   * Get default model for a provider
   */
  getDefaultModel(provider: AIProvider): string {
    return DEFAULT_MODELS[provider];
  }
}