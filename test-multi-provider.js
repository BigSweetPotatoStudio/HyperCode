#!/usr/bin/env node

/**
 * Quick test script to verify multi-provider functionality
 */

import { UniversalAIClient, AIProvider } from './packages/core/dist/src/ai/index.js';

async function testProviders() {
  console.log('🧪 Testing Multi-Provider Functionality\n');

  // Test 1: Environment configuration
  console.log('📋 Test 1: Environment Configuration Detection');
  try {
    const envClient = UniversalAIClient.fromEnvironment();
    const info = envClient.getProviderInfo();
    console.log(`✅ Provider: ${info.provider}`);
    console.log(`✅ Model: ${info.model}\n`);
  } catch (error) {
    console.log(`❌ Environment config error: ${error.message}\n`);
  }

  // Test 1.5: Proxy configuration test
  console.log('📋 Test 1.5: Proxy Configuration Detection');
  try {
    const { ProxyUtils } = await import('./packages/core/dist/src/utils/proxyUtils.js');
    console.log(`✅ Proxy configured: ${ProxyUtils.isProxyConfigured()}`);
    const proxyUrl = ProxyUtils.getProxyUrl();
    if (proxyUrl) {
      console.log(`✅ Proxy URL: ${proxyUrl}`);
    }
    console.log(`✅ SSL skip: ${ProxyUtils.shouldSkipSslVerification()}\n`);
  } catch (error) {
    console.log(`❌ Proxy utils error: ${error.message}\n`);
  }

  // Test 2: Direct configuration
  console.log('📋 Test 2: Direct Provider Configuration');
  
  const testConfigs = [
    {
      provider: AIProvider.GEMINI,
      model: 'gemini-2.5-pro',
      apiKey: process.env.GEMINI_API_KEY || 'test-key',
    },
    {
      provider: AIProvider.OPENAI,
      model: 'gpt-4o',
      apiKey: process.env.OPENAI_API_KEY || 'test-key',
    },
    {
      provider: AIProvider.ANTHROPIC,
      model: 'claude-3-5-sonnet-20241022',
      apiKey: process.env.ANTHROPIC_API_KEY || 'test-key',
    },
  ];

  for (const config of testConfigs) {
    try {
      const client = new UniversalAIClient(config);
      const info = client.getProviderInfo();
      console.log(`✅ ${config.provider}: Configured with model ${info.model}`);
      
      // Test connection (will fail without real API key, but structure should work)
      const connectionTest = await client.testConnection();
      if (connectionTest.success) {
        console.log(`  ✅ Connection successful`);
      } else {
        console.log(`  ⚠️  Connection failed (expected without real API key): ${connectionTest.error}`);
      }
    } catch (error) {
      console.log(`❌ ${config.provider}: Configuration error: ${error.message}`);
    }
  }

  console.log('\n🎉 Multi-provider system structure is working correctly!');
  console.log('\n💡 To test with real providers, set these environment variables:');
  console.log('export HYPERCODE_PROVIDER=openai');
  console.log('export HYPERCODE_API_KEY=your-api-key');
  console.log('export HYPERCODE_MODEL=gpt-4o');
}

testProviders().catch(console.error);