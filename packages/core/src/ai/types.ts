/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Supported AI providers
 */
export enum AIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic', 
  GOOGLE = 'google',
  COHERE = 'cohere',
  MISTRAL = 'mistral',
  AMAZON_BEDROCK = 'amazon-bedrock',
  // Support for original Gemini config
  GEMINI = 'gemini'
}

/**
 * AI Provider configuration
 */
export interface AIProviderConfig {
  provider: AIProvider;
  apiKey?: string;
  apiUrl?: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  // Proxy configuration
  proxy?: string;
  // Provider-specific options
  options?: Record<string, unknown>;
}

/**
 * Environment variable configuration
 */
export interface AIEnvironmentConfig {
  HYPERCODE_PROVIDER?: string;
  HYPERCODE_API_KEY?: string;
  HYPERCODE_API_URL?: string;
  HYPERCODE_MODEL?: string;
  HYPERCODE_PROXY?: string;
  HYPERCODE_SKIP_SSL_VERIFICATION?: string;
  // Legacy Gemini support
  GEMINI_API_KEY?: string;
  // OpenAI
  OPENAI_API_KEY?: string;
  // Anthropic
  ANTHROPIC_API_KEY?: string;
  // Common proxy settings
  HTTP_PROXY?: string;
  HTTPS_PROXY?: string;
  // Other providers...
}

/**
 * Default models for each provider
 */
export const DEFAULT_MODELS: Record<AIProvider, string> = {
  [AIProvider.OPENAI]: 'gpt-4o',
  [AIProvider.ANTHROPIC]: 'claude-3-5-sonnet-20241022',
  [AIProvider.GOOGLE]: 'gemini-2.5-pro',
  [AIProvider.COHERE]: 'command-r-plus',
  [AIProvider.MISTRAL]: 'mistral-large-latest',
  [AIProvider.AMAZON_BEDROCK]: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  [AIProvider.GEMINI]: 'gemini-2.5-pro', // Legacy support
};

/**
 * Provider display names
 */
export const PROVIDER_NAMES: Record<AIProvider, string> = {
  [AIProvider.OPENAI]: 'OpenAI',
  [AIProvider.ANTHROPIC]: 'Anthropic',
  [AIProvider.GOOGLE]: 'Google AI',
  [AIProvider.COHERE]: 'Cohere',
  [AIProvider.MISTRAL]: 'Mistral AI',
  [AIProvider.AMAZON_BEDROCK]: 'Amazon Bedrock',
  [AIProvider.GEMINI]: 'Google Gemini (Legacy)',
};