# @haiec/openai

OpenAI SDK wrapper with automatic usage tracking and cost calculation for HAIEC AI Inventory.

## Installation

```bash
npm install @haiec/openai
```

## Quick Start

### 1. Get Your HAIEC API Key

1. Go to [HAIEC Dashboard](https://haiec.com/dashboard/ai-inventory/api-keys)
2. Click "Add API Key"
3. Enter your OpenAI API key details
4. Check "Generate tracking key for SDK usage"
5. Copy the generated `haiec_sk_xxx` key (shown only once!)

### 2. Install and Use

```typescript
import { TrackedOpenAI } from '@haiec/openai';

const client = new TrackedOpenAI({
  apiKey: process.env.OPENAI_API_KEY,        // Your OpenAI key
  haiecApiKey: process.env.HAIEC_API_KEY,    // Your HAIEC tracking key
});

// Use exactly like the official OpenAI SDK
const response = await client.chat.completions.create({
  model: 'gpt-4-turbo',
  messages: [{ role: 'user', content: 'Hello!' }],
});

console.log(response.choices[0].message.content);
```

### 3. View Usage in Dashboard

Visit [HAIEC Dashboard](https://haiec.com/dashboard/ai-inventory/usage) to see:
- Real-time API usage
- Cost per request
- Token consumption
- Latency metrics
- Error rates

## Features

- ✅ **Automatic Usage Tracking**: Every API call logged with tokens, cost, and latency
- ✅ **Accurate Cost Calculation**: Real-time pricing for all OpenAI models
- ✅ **100% API Compatible**: Drop-in replacement for the official SDK
- ✅ **Silent Error Handling**: Logging failures don't break your app
- ✅ **Minimal Overhead**: <10ms added latency
- ✅ **Compliance Ready**: SOC 2, GDPR, HIPAA audit trails

## Supported Models

| Model | Input Cost | Output Cost |
|-------|------------|-------------|
| gpt-4-turbo | $10.00/1M | $30.00/1M |
| gpt-4 | $30.00/1M | $60.00/1M |
| gpt-4-32k | $60.00/1M | $120.00/1M |
| gpt-3.5-turbo | $0.50/1M | $1.50/1M |
| gpt-3.5-turbo-16k | $3.00/1M | $4.00/1M |
| gpt-3.5-turbo | $0.50 | $1.50 |
| gpt-3.5-turbo-16k | $3.00 | $4.00 |

*Pricing is automatically updated based on OpenAI's latest rates.*

## What Gets Tracked

For each API call, the following data is logged to HAIEC:

- **Provider**: `openai`
- **Model**: e.g., `gpt-4-turbo`
- **Endpoint**: e.g., `chat.completions`
- **Request Tokens**: Number of input tokens
- **Response Tokens**: Number of output tokens
- **Cost**: Calculated cost in USD
- **Latency**: Response time in milliseconds
- **Status Code**: HTTP status code
- **Error Message**: If the request failed

## Performance

- **Overhead**: <10ms per request
- **Async Logging**: Usage is logged asynchronously to avoid blocking
- **Error Handling**: Tracking failures don't affect your API calls

## Error Handling

If usage tracking fails, the error is logged to console but your OpenAI API call continues normally:

```typescript
try {
  const response = await client.chat.completions.create({...});
  // Your response is returned even if tracking fails
} catch (error) {
  // Only OpenAI API errors are thrown
}
```

## API Compatibility

This wrapper maintains 100% compatibility with the official OpenAI SDK. All methods and parameters work exactly the same.

## Getting Your HAIEC API Key

1. Sign up at [haiec.com](https://haiec.com)
2. Navigate to Settings > API Keys
3. Click "Create API Key"
4. Copy your key and add it to your environment variables

## Support

- **Documentation**: [docs.haiec.com](https://docs.haiec.com)
- **Issues**: [GitHub Issues](https://github.com/haiec/haiec-openai/issues)
- **Email**: support@haiec.com

## License

MIT
