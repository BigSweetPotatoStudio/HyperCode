/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIProvider } from '../ai/types.js';

type Model = string;
type TokenCount = number;

export const DEFAULT_TOKEN_LIMIT = 1_048_576;

/**
 * 原有的 Gemini 专用 token 限制函数（向后兼容）
 */
export function tokenLimit(model: Model): TokenCount {
  // Add other models as they become relevant or if specified by config
  // Pulled from https://ai.google.dev/gemini-api/docs/models
  switch (model) {
    case 'gemini-1.5-pro':
      return 2_097_152;
    case 'gemini-1.5-flash':
    case 'gemini-2.5-pro-preview-05-06':
    case 'gemini-2.5-pro-preview-06-05':
    case 'gemini-2.5-pro':
    case 'gemini-2.5-flash-preview-05-20':
    case 'gemini-2.5-flash':
    case 'gemini-2.0-flash':
      return 1_048_576;
    case 'gemini-2.0-flash-preview-image-generation':
      return 32_000;
    default:
      return DEFAULT_TOKEN_LIMIT;
  }
}

/**
 * 通用的多提供商 token 限制函数
 * 支持环境变量配置和多种 AI 提供商
 */
export function getUniversalTokenLimit(provider: AIProvider, model: string): TokenCount {
  // 1. 优先使用环境变量配置
  const envLimit = process.env.HYPERCODE_MAX_TOKENS;
  if (envLimit) {
    const parsed = parseInt(envLimit, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  // 2. 根据提供商和模型返回默认限制
  switch (provider) {
    case AIProvider.OPENAI:
      return getOpenAITokenLimit(model);
    case AIProvider.ANTHROPIC:
      return getAnthropicTokenLimit(model);
    case AIProvider.GEMINI:
      return getGeminiTokenLimit(model);
    default:
      return DEFAULT_TOKEN_LIMIT;
  }
}

/**
 * OpenAI 模型的 token 限制
 */
function getOpenAITokenLimit(model: string): TokenCount {
  const openaiLimits: Record<string, TokenCount> = {
    'gpt-4o': 128_000,
    'gpt-4o-mini': 128_000,
    'gpt-4-turbo': 128_000,
    'gpt-4-turbo-preview': 128_000,
    'gpt-4': 8_192,
    'gpt-3.5-turbo': 16_385,
    'gpt-3.5-turbo-16k': 16_385,
  };
  
  return openaiLimits[model] || 128_000; // 默认使用 GPT-4o 的限制
}

/**
 * Anthropic (Claude) 模型的 token 限制
 */
function getAnthropicTokenLimit(model: string): TokenCount {
  const anthropicLimits: Record<string, TokenCount> = {
    'claude-3.5-sonnet-20241022': 200_000,
    'claude-3.5-sonnet': 200_000,
    'claude-3-opus-20240229': 200_000,
    'claude-3-opus': 200_000,
    'claude-3-sonnet-20240229': 200_000,
    'claude-3-sonnet': 200_000,
    'claude-3-haiku-20240307': 200_000,
    'claude-3-haiku': 200_000,
  };
  
  return anthropicLimits[model] || 200_000; // 默认使用 Claude 3.5 的限制
}

/**
 * Gemini 模型的 token 限制（复用原有逻辑）
 */
function getGeminiTokenLimit(model: string): TokenCount {
  return tokenLimit(model);
}

/**
 * 通用的 token 估算函数
 * 基于字符数进行估算，适用于所有提供商
 */
export function estimateTokenCount(text: string): TokenCount {
  if (!text) return 0;
  
  // 处理不同语言的字符
  const englishChars = text.match(/[a-zA-Z0-9\s.,!?;:'"()[\]{}\-_=+*/\\|~`@#$%^&]/g)?.length || 0;
  const chineseChars = text.match(/[\u4e00-\u9fff]/g)?.length || 0;
  const otherChars = text.length - englishChars - chineseChars;
  
  // 不同语言的 token 比率（基于经验数据）
  const englishTokens = Math.ceil(englishChars / 4);    // 英文：~4字符/token
  const chineseTokens = Math.ceil(chineseChars / 1.5);  // 中文：~1.5字符/token  
  const otherTokens = Math.ceil(otherChars / 3);        // 其他：~3字符/token
  
  return englishTokens + chineseTokens + otherTokens;
}
