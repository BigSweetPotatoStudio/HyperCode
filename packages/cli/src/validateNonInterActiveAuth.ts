/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthType, Config } from '@google/gemini-cli-core';
import { USER_SETTINGS_PATH } from './config/settings.js';
import { validateAuthMethod } from './config/auth.js';

export async function validateNonInteractiveAuth(
  configuredAuthType: AuthType | undefined,
  nonInteractiveConfig: Config,
) {
  // Check for HyperCode multi-provider configuration first
  const provider = process.env.HYPERCODE_PROVIDER;
  const apiKey = process.env.HYPERCODE_API_KEY;
  
  if (provider && apiKey) {
    // Multi-provider configuration is available, use Gemini auth type as default
    const effectiveAuthType = configuredAuthType || AuthType.USE_GEMINI;
    const err = validateAuthMethod(effectiveAuthType);
    if (err != null) {
      console.error(err);
      process.exit(1);
    }
    await nonInteractiveConfig.refreshAuth(effectiveAuthType);
    return nonInteractiveConfig;
  }

  // Fallback to legacy Gemini authentication
  const effectiveAuthType =
    configuredAuthType ||
    (process.env.GEMINI_API_KEY
      ? AuthType.USE_GEMINI
      : AuthType.USE_GEMINI); // Default to USE_GEMINI since it's the only supported type

  if (!effectiveAuthType) {
    console.error(
      `Please set an Auth method in your ${USER_SETTINGS_PATH} or specify the HYPERCODE_PROVIDER/HYPERCODE_API_KEY or GEMINI_API_KEY environment variables before running`,
    );
    process.exit(1);
  }

  const err = validateAuthMethod(effectiveAuthType);
  if (err != null) {
    console.error(err);
    process.exit(1);
  }

  await nonInteractiveConfig.refreshAuth(effectiveAuthType);
  return nonInteractiveConfig;
}
