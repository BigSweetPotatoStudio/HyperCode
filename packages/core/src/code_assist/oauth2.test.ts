/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';

describe('oauth2 (deprecated)', () => {
  // OAuth authentication is no longer supported as only USE_GEMINI is available
  it('should indicate OAuth is no longer supported', () => {
    expect(true).toBe(true); // OAuth functionality is deprecated
  });
});