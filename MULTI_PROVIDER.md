# HyperCode Multi-LLM Provider Support

HyperCode now supports multiple LLM providers through Vercel AI SDK integration. This allows you to use different AI models from various providers while maintaining a consistent interface.

## Supported Providers

- **OpenAI** - GPT-4o, GPT-4, GPT-3.5 Turbo
- **Anthropic** - Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku  
- **Google AI** - Gemini 2.5 Pro, Gemini 2.5 Flash
- **Cohere** - Command R+, Command R
- **Mistral AI** - Mistral Large, Mistral Medium
- **Amazon Bedrock** - Various models through AWS

## Configuration

### Environment Variables

Set these environment variables to configure your preferred provider:

```bash
# Primary configuration
export HYPERCODE_PROVIDER=openai          # Provider name
export HYPERCODE_API_KEY=sk-...            # API key
export HYPERCODE_MODEL=gpt-4o              # Model name
export HYPERCODE_API_URL=https://...       # Optional custom API URL

# Proxy configuration
export HYPERCODE_PROXY=http://proxy:8080   # HyperCode-specific proxy
export HTTP_PROXY=http://proxy:8080       # General HTTP proxy
export HTTPS_PROXY=http://proxy:8080      # General HTTPS proxy

# SSL configuration (for development/debugging)
export HYPERCODE_SKIP_SSL_VERIFICATION=true  # Skip SSL verification

# Provider-specific API keys (alternative)
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
export GEMINI_API_KEY=AIza...
export COHERE_API_KEY=...
export MISTRAL_API_KEY=...
```

### Provider Examples

#### OpenAI
```bash
export HYPERCODE_PROVIDER=openai
export HYPERCODE_API_KEY=sk-proj-...
export HYPERCODE_MODEL=gpt-4o
```

#### Anthropic Claude
```bash
export HYPERCODE_PROVIDER=anthropic
export HYPERCODE_API_KEY=sk-ant-...
export HYPERCODE_MODEL=claude-3-5-sonnet-20241022
```

#### Google Gemini
```bash
export HYPERCODE_PROVIDER=google
export HYPERCODE_API_KEY=AIza...
export HYPERCODE_MODEL=gemini-2.5-pro
```

#### Cohere
```bash
export HYPERCODE_PROVIDER=cohere
export HYPERCODE_API_KEY=...
export HYPERCODE_MODEL=command-r-plus
```

#### Mistral AI
```bash
export HYPERCODE_PROVIDER=mistral
export HYPERCODE_API_KEY=...
export HYPERCODE_MODEL=mistral-large-latest
```

#### Amazon Bedrock
```bash
export HYPERCODE_PROVIDER=amazon-bedrock
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export HYPERCODE_MODEL=anthropic.claude-3-5-sonnet-20241022-v2:0
```

## Usage

### CLI Usage

The CLI will automatically use the configured provider:

```bash
# Uses the provider configured in environment variables
gemini "Write a hello world program in Python"

# Provider info is shown in debug mode
gemini --debug "Explain machine learning"
```

### Programmatic Usage

#### Basic Text Generation
```typescript
import { UniversalAIClient } from '@google/gemini-cli-core';

// From environment variables
const client = UniversalAIClient.fromEnvironment();
const result = await client.generateText('Hello, world!');
console.log(result.text);

// Direct configuration
const openaiClient = new UniversalAIClient({
  provider: AIProvider.OPENAI,
  apiKey: 'sk-...',
  model: 'gpt-4o',
});
```

#### Structured Object Generation
```typescript
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
  }
};

const result = await client.generateObject(
  'Generate a person profile',
  schema
);
console.log(result.object); // { name: "...", age: ... }
```

#### Streaming
```typescript
const stream = await client.streamText('Write a story');
for await (const chunk of stream.textStream) {
  process.stdout.write(chunk);
}
```

### Compatibility Adapter

For gradual migration from Gemini-specific code:

```typescript
import { Config } from '@google/gemini-cli-core';

const config = new Config(params);
const adapter = config.getAIClientAdapter();

// Works with all providers
const result = await adapter.generateSimpleText('Hello');

// Legacy Gemini operations (when using Gemini provider)
if (adapter.isUsingUniversalClient()) {
  console.log('Using new multi-provider system');
} else {
  console.log('Using legacy Gemini client');
}
```

## Default Models

Each provider has a recommended default model:

| Provider | Default Model |
|----------|---------------|
| OpenAI | gpt-4o |
| Anthropic | claude-3-5-sonnet-20241022 |
| Google | gemini-2.5-pro |
| Cohere | command-r-plus |
| Mistral | mistral-large-latest |
| Amazon Bedrock | anthropic.claude-3-5-sonnet-20241022-v2:0 |

## Migration from Gemini-only

### Step 1: Update Environment Variables
Replace your existing Gemini configuration:
```bash
# Old
export GEMINI_API_KEY=AIza...

# New (maintains compatibility)
export HYPERCODE_PROVIDER=gemini
export HYPERCODE_API_KEY=AIza...
export HYPERCODE_MODEL=gemini-2.5-pro
```

### Step 2: Test Configuration
```bash
gemini --debug "test message"
```

### Step 3: Try Other Providers
```bash
export HYPERCODE_PROVIDER=openai
export HYPERCODE_API_KEY=sk-...
gemini "same functionality, different provider"
```

## Advanced Configuration

### Custom API URLs
```bash
export HYPERCODE_API_URL=https://your-proxy.com/v1
```

### Proxy Configuration

#### Corporate Proxy
```bash
export HYPERCODE_PROVIDER=openai
export HYPERCODE_API_KEY=sk-...
export HYPERCODE_PROXY=http://corporate-proxy:8080
```

#### SOCKS Proxy
```bash
export HYPERCODE_PROVIDER=anthropic
export HYPERCODE_API_KEY=sk-ant-...
export HYPERCODE_PROXY=socks5://proxy:1080
```

#### SSL-bypass for Development
```bash
export HYPERCODE_PROVIDER=gemini
export HYPERCODE_API_KEY=AIza...
export HYPERCODE_PROXY=https://dev-proxy:3128
export HYPERCODE_SKIP_SSL_VERIFICATION=true
```

### Provider-specific Options
```typescript
const client = new UniversalAIClient({
  provider: AIProvider.AMAZON_BEDROCK,
  model: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  options: {
    region: 'us-west-2',
    accessKeyId: '...',
    secretAccessKey: '...',
  }
});
```

## Troubleshooting

### Connection Issues
```typescript
const client = UniversalAIClient.fromEnvironment();
const test = await client.testConnection();
if (!test.success) {
  console.error('Connection failed:', test.error);
}
```

### Provider Information
```typescript
const info = client.getProviderInfo();
console.log(`Using ${info.provider} with model ${info.model}`);
```

### Debug Mode
```bash
gemini --debug "your prompt"
```

## Examples

See `/examples/multi-provider-usage.ts` for comprehensive examples of:
- Switching between providers
- Structured object generation
- Error handling
- Configuration patterns

## Legacy Compatibility

The system maintains full backward compatibility with existing Gemini CLI usage:
- Existing `GEMINI_API_KEY` environment variables work
- All existing CLI commands and options work unchanged
- Gradual migration path available