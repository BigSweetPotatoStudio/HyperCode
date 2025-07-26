/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { HistoryItemCompression, MessageType } from '../types.js';
import { CommandKind, SlashCommand } from './types.js';

export const compressCommand: SlashCommand = {
  name: 'compress',
  altNames: ['summarize'],
  description: 'Compresses the context by replacing it with a summary.',
  kind: CommandKind.BUILT_IN,
  action: async (context) => {
    const { ui } = context;
    if (ui.pendingItem) {
      ui.addItem(
        {
          type: MessageType.ERROR,
          text: 'Already compressing, wait for previous request to complete',
        },
        Date.now(),
      );
      return;
    }

    const pendingMessage: HistoryItemCompression = {
      type: MessageType.COMPRESSION,
      compression: {
        isPending: true,
        originalTokenCount: null,
        newTokenCount: null,
      },
    };

    try {
      ui.setPendingItem(pendingMessage);
      const promptId = `compress-${Date.now()}`;
      
      // Check if in multi-provider mode
      const provider = process.env.HYPERCODE_PROVIDER;
      const apiKey = process.env.HYPERCODE_API_KEY;
      
      let compressed;
      if (provider && apiKey) {
        // Multi-provider mode: Use universal client for compression
        const universalClient = context.services.config?.getUniversalAIClient();
        
        // UniversalAIClient 已经有自己完整的历史记录了，不需要重建
        
        compressed = await universalClient?.tryCompressChat(promptId, true);
      } else {
        // Traditional Gemini mode
        compressed = await context.services.config
          ?.getGeminiClient()
          ?.tryCompressChat(promptId, true);
      }
      
      if (compressed) {
        ui.addItem(
          {
            type: MessageType.COMPRESSION,
            compression: {
              isPending: false,
              originalTokenCount: compressed.originalTokenCount,
              newTokenCount: compressed.newTokenCount,
            },
          } as HistoryItemCompression,
          Date.now(),
        );
      } else {
        ui.addItem(
          {
            type: MessageType.ERROR,
            text: 'Failed to compress chat history.',
          },
          Date.now(),
        );
      }
    } catch (e) {
      ui.addItem(
        {
          type: MessageType.ERROR,
          text: `Failed to compress chat history: ${
            e instanceof Error ? e.message : String(e)
          }`,
        },
        Date.now(),
      );
    } finally {
      ui.setPendingItem(null);
    }
  },
};
