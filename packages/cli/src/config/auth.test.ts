/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthType } from '@google/gemini-cli-core';
import { vi } from 'vitest';
import { validateAuthMethod } from './auth.js';

vi.mock('./settings.js', () => ({
  loadEnvironment: vi.fn(),
}));

describe('validateAuthMethod', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {};
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // Test for LOGIN_WITH_GOOGLE removed as it's no longer supported

  // Test for CLOUD_SHELL removed as it's no longer supported

  describe('USE_GEMINI', () => {
    it('should return null if GEMINI_API_KEY is set', () => {
      process.env.GEMINI_API_KEY = 'test-key';
      expect(validateAuthMethod(AuthType.USE_GEMINI)).toBeNull();
    });

    it('should return an error message if GEMINI_API_KEY is not set', () => {
      expect(validateAuthMethod(AuthType.USE_GEMINI)).toBe(
        'GEMINI_API_KEY environment variable not found. Add that to your environment and try again (no reload needed if using .env)!',
      );
    });
  });

  // Tests for USE_VERTEX_AI removed as it's no longer supported
          'Update your environment and try again (no reload needed if using .env)!',
      );
    });
  });

  it('should return an error message for an invalid auth method', () => {
    expect(validateAuthMethod('invalid-method')).toBe(
      'Invalid auth method selected.',
    );
  });
});
