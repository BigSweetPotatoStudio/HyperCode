/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthType, ContentGenerator } from '../core/contentGenerator.js';
import { getOauthClient } from './oauth2.js';
import { setupUser } from './setup.js';
import { CodeAssistServer, HttpOptions } from './server.js';
import { Config } from '../config/config.js';

export async function createCodeAssistContentGenerator(
  httpOptions: HttpOptions,
  authType: AuthType,
  config: Config,
  sessionId?: string,
): Promise<ContentGenerator> {
  // Code assist is no longer supported as only USE_GEMINI auth type is available
  throw new Error(`Code assist is no longer supported. AuthType: ${authType}`);
}
