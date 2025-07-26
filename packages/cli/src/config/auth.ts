/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthType } from '@google/gemini-cli-core';
import { loadEnvironment } from './settings.js';

export const validateAuthMethod = (authMethod: string): string | null => {
  loadEnvironment();
  
  // Check for HyperCode multi-provider configuration first
  const provider = process.env.HYPERCODE_PROVIDER;
  const apiKey = process.env.HYPERCODE_API_KEY;
  
  if (provider && apiKey) {
    // Multi-provider configuration is available, no need for Gemini-specific check
    return null;
  }
  
  // Fallback to legacy Gemini authentication
  if (authMethod === AuthType.USE_GEMINI) {
    if (!process.env.GEMINI_API_KEY) {
      return 'No valid API key found. Please set either:\n' +
             '  - HYPERCODE_PROVIDER and HYPERCODE_API_KEY for multi-provider support, or\n' +
             '  - GEMINI_API_KEY for Gemini-only support\n' +
             'Add these to your environment and try again (no reload needed if using .env)!';
    }
    return null;
  }

  return 'Invalid auth method selected. Only USE_GEMINI is supported.';
};
