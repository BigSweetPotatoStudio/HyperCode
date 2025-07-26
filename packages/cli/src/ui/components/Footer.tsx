/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Box, Text } from 'ink';
import { Colors } from '../colors.js';
import { shortenPath, tildeifyPath, tokenLimit, getUniversalTokenLimit, AIProvider } from '@google/gemini-cli-core';
import { ConsoleSummaryDisplay } from './ConsoleSummaryDisplay.js';
import process from 'node:process';
import Gradient from 'ink-gradient';
import { MemoryUsageDisplay } from './MemoryUsageDisplay.js';

interface FooterProps {
  model: string;
  targetDir: string;
  branchName?: string;
  debugMode: boolean;
  debugMessage: string;
  corgiMode: boolean;
  errorCount: number;
  showErrorDetails: boolean;
  showMemoryUsage?: boolean;
  promptTokenCount: number;
  nightly: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  model,
  targetDir,
  branchName,
  debugMode,
  debugMessage,
  corgiMode,
  errorCount,
  showErrorDetails,
  showMemoryUsage,
  promptTokenCount,
  nightly,
}) => {
  // 检测多提供商模式并获取相应的 token 限制
  const provider = process.env.HYPERCODE_PROVIDER;
  const apiKey = process.env.HYPERCODE_API_KEY;
  
  let limit: number;
  
  if (provider && apiKey) {
    // 多提供商模式：解析 provider:model 格式
    if (model.includes(':')) {
      const [providerName, modelName] = model.split(':', 2);
      
      // 将字符串转换为 AIProvider 枚举
      const aiProvider = providerName as AIProvider;
      limit = getUniversalTokenLimit(aiProvider, modelName);
    } else {
      // 回退：直接使用提供商和模型
      const aiProvider = provider as AIProvider;
      limit = getUniversalTokenLimit(aiProvider, model);
    }
  } else {
    // 传统 Gemini 模式
    limit = tokenLimit(model);
  }
  
  const percentage = promptTokenCount / limit;

  return (
    <Box marginTop={1} justifyContent="space-between" width="100%">
      <Box>
        {nightly ? (
          <Gradient colors={Colors.GradientColors}>
            <Text>
              {shortenPath(tildeifyPath(targetDir), 70)}
              {branchName && <Text> ({branchName}*)</Text>}
            </Text>
          </Gradient>
        ) : (
          <Text color={Colors.LightBlue}>
            {shortenPath(tildeifyPath(targetDir), 70)}
            {branchName && <Text color={Colors.Gray}> ({branchName}*)</Text>}
          </Text>
        )}
        {debugMode && (
          <Text color={Colors.AccentRed}>
            {' ' + (debugMessage || '--debug')}
          </Text>
        )}
      </Box>

      {/* Middle Section: Centered Sandbox Info */}
      <Box
        flexGrow={1}
        alignItems="center"
        justifyContent="center"
        display="flex"
      >
        {process.env.SANDBOX && process.env.SANDBOX !== 'sandbox-exec' ? (
          <Text color="green">
            {process.env.SANDBOX.replace(/^gemini-(?:cli-)?/, '')}
          </Text>
        ) : process.env.SANDBOX === 'sandbox-exec' ? (
          <Text color={Colors.AccentYellow}>
            macOS Seatbelt{' '}
            <Text color={Colors.Gray}>({process.env.SEATBELT_PROFILE})</Text>
          </Text>
        ) : (
          <Text color={Colors.AccentRed}>
            no sandbox <Text color={Colors.Gray}>(see /docs)</Text>
          </Text>
        )}
      </Box>

      {/* Right Section: Gemini Label and Console Summary */}
      <Box alignItems="center">
        <Text color={Colors.AccentBlue}>
          {' '}
          {model}{' '}
          <Text color={Colors.Gray}>
            ({((1 - percentage) * 100).toFixed(0)}% context left)
          </Text>
        </Text>
        {corgiMode && (
          <Text>
            <Text color={Colors.Gray}>| </Text>
            <Text color={Colors.AccentRed}>▼</Text>
            <Text color={Colors.Foreground}>(´</Text>
            <Text color={Colors.AccentRed}>ᴥ</Text>
            <Text color={Colors.Foreground}>`)</Text>
            <Text color={Colors.AccentRed}>▼ </Text>
          </Text>
        )}
        {!showErrorDetails && errorCount > 0 && (
          <Box>
            <Text color={Colors.Gray}>| </Text>
            <ConsoleSummaryDisplay errorCount={errorCount} />
          </Box>
        )}
        {showMemoryUsage && <MemoryUsageDisplay />}
      </Box>
    </Box>
  );
};
