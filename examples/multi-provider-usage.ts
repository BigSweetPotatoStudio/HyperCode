/**
 * Example demonstrating how to use the new multi-LLM provider system
 * This shows how to switch between different AI providers using environment variables
 */

import { 
  UniversalAIClient, 
  AIProvider, 
  AIProviderConfig,
  AIClientAdapter 
} from '../packages/core/src/ai/index.js';
import { Config } from '../packages/core/src/config/config.js';

async function demonstrateMultiProvider() {
  console.log('🔥 HyperCode Multi-Provider Demo');
  console.log('================================\n');

  // Example 1: Direct UniversalAIClient usage
  console.log('📝 Example 1: Direct Provider Configuration');
  
  const openaiConfig: AIProviderConfig = {
    provider: AIProvider.OPENAI,
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o',
    temperature: 0.7,
  };

  try {
    const openaiClient = new UniversalAIClient(openaiConfig);
    const result = await openaiClient.generateText('Say hello in a friendly way');
    console.log(`OpenAI says: ${result.text}\n`);
  } catch (error) {
    console.log(`OpenAI Error: ${error}\n`);
  }

  // Example 2: Environment variable configuration
  console.log('🌍 Example 2: Environment Variable Configuration');
  console.log('Set these environment variables to test:');
  console.log('- HYPERCODE_PROVIDER=anthropic');
  console.log('- HYPERCODE_API_KEY=your-anthropic-key');
  console.log('- HYPERCODE_MODEL=claude-3-5-sonnet-20241022\n');

  try {
    const envClient = UniversalAIClient.fromEnvironment();
    const providerInfo = envClient.getProviderInfo();
    console.log(`Current Provider: ${providerInfo.provider}`);
    console.log(`Current Model: ${providerInfo.model}\n`);
    
    const result = await envClient.generateText('Explain AI in one sentence');
    console.log(`${providerInfo.provider} says: ${result.text}\n`);
  } catch (error) {
    console.log(`Environment Client Error: ${error}\n`);
  }

  // Example 3: Structured object generation
  console.log('📊 Example 3: Structured Object Generation');
  
  const schema = {
    type: 'object',
    properties: {
      greeting: { type: 'string' },
      language: { type: 'string' },
      enthusiasm: { type: 'number', minimum: 1, maximum: 10 }
    },
    required: ['greeting', 'language', 'enthusiasm']
  };

  try {
    const client = UniversalAIClient.fromEnvironment();
    const result = await client.generateObject(
      'Generate a greeting in Spanish with enthusiasm level',
      schema
    );
    console.log('Structured result:', JSON.stringify(result.object, null, 2));
    console.log('');
  } catch (error) {
    console.log(`Structured Generation Error: ${error}\n`);
  }

  // Example 4: Provider switching
  console.log('🔄 Example 4: Provider Switching');
  
  const providers = [
    { provider: AIProvider.GOOGLE, model: 'gemini-2.5-pro' },
    { provider: AIProvider.OPENAI, model: 'gpt-4o' },
    { provider: AIProvider.ANTHROPIC, model: 'claude-3-5-sonnet-20241022' },
  ];

  for (const config of providers) {
    try {
      const client = new UniversalAIClient({
        provider: config.provider,
        model: config.model,
        apiKey: getApiKeyForProvider(config.provider),
      });

      const connectionTest = await client.testConnection();
      if (connectionTest.success) {
        const result = await client.generateText('Say hi briefly');
        console.log(`✅ ${config.provider} (${config.model}): ${result.text}`);
      } else {
        console.log(`❌ ${config.provider}: ${connectionTest.error}`);
      }
    } catch (error) {
      console.log(`❌ ${config.provider}: ${error}`);
    }
  }
}

function getApiKeyForProvider(provider: AIProvider): string | undefined {
  switch (provider) {
    case AIProvider.OPENAI:
      return process.env.OPENAI_API_KEY;
    case AIProvider.ANTHROPIC:
      return process.env.ANTHROPIC_API_KEY;
    case AIProvider.GOOGLE:
    case AIProvider.GEMINI:
      return process.env.GEMINI_API_KEY;
    case AIProvider.COHERE:
      return process.env.COHERE_API_KEY;
    case AIProvider.MISTRAL:
      return process.env.MISTRAL_API_KEY;
    default:
      return undefined;
  }
}

// Environment variable examples
console.log('💡 Environment Variable Examples:');
console.log('');
console.log('# Use OpenAI GPT-4o');
console.log('export HYPERCODE_PROVIDER=openai');
console.log('export HYPERCODE_API_KEY=sk-...');
console.log('export HYPERCODE_MODEL=gpt-4o');
console.log('');
console.log('# Use Anthropic Claude');
console.log('export HYPERCODE_PROVIDER=anthropic');
console.log('export HYPERCODE_API_KEY=sk-ant-...');
console.log('export HYPERCODE_MODEL=claude-3-5-sonnet-20241022');
console.log('');
console.log('# Use Google Gemini (Legacy compatibility)');
console.log('export HYPERCODE_PROVIDER=gemini');
console.log('export HYPERCODE_API_KEY=AIza...');
console.log('export HYPERCODE_MODEL=gemini-2.5-pro');
console.log('');

// Run the demonstration
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateMultiProvider().catch(console.error);
}