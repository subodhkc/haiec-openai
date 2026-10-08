import OpenAI from 'openai';

interface TrackedOpenAIConfig {
  apiKey: string;
  haiecApiKey: string;
  haiecEndpoint?: string;
  organizationId?: string;
}

interface ModelPricing {
  inputCostPer1M: number;
  outputCostPer1M: number;
}

const MODEL_PRICING: Record<string, ModelPricing> = {
  'gpt-4-turbo': {
    inputCostPer1M: 10.00,
    outputCostPer1M: 30.00,
  },
  'gpt-4-turbo-preview': {
    inputCostPer1M: 10.00,
    outputCostPer1M: 30.00,
  },
  'gpt-4': {
    inputCostPer1M: 30.00,
    outputCostPer1M: 60.00,
  },
  'gpt-4-32k': {
    inputCostPer1M: 60.00,
    outputCostPer1M: 120.00,
  },
  'gpt-3.5-turbo': {
    inputCostPer1M: 0.50,
    outputCostPer1M: 1.50,
  },
  'gpt-3.5-turbo-16k': {
    inputCostPer1M: 3.00,
    outputCostPer1M: 4.00,
  },
};

function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING['gpt-3.5-turbo'];
  
  const inputCost = (inputTokens / 1_000_000) * pricing.inputCostPer1M;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputCostPer1M;
  
  return inputCost + outputCost;
}

async function logUsage(
  haiecApiKey: string,
  endpoint: string,
  data: {
    provider: string;
    model: string;
    endpoint: string;
    requestTokens: number;
    responseTokens: number;
    cost: number;
    latencyMs: number;
    statusCode: number;
    errorMessage?: string;
  }
): Promise<void> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-HAIEC-API-KEY': haiecApiKey,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error('Failed to log usage to HAIEC:', await response.text());
    }
  } catch (error) {
    console.error('Error logging usage to HAIEC:', error);
  }
}

export class TrackedOpenAI {
  private client: OpenAI;
  private haiecApiKey: string;
  private haiecEndpoint: string;

  constructor(config: TrackedOpenAIConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      organization: config.organizationId,
    });

    this.haiecApiKey = config.haiecApiKey;
    this.haiecEndpoint = config.haiecEndpoint || 'https://haiec.com/api/v1/inventory/usage/log';
  }

  get chat() {
    const self = this;
    return {
      completions: {
        create: async (params: OpenAI.Chat.ChatCompletionCreateParams) => {
          const startTime = Date.now();
          let statusCode = 200;
          let errorMessage: string | undefined;

          try {
            const response = await self.client.chat.completions.create(params);
            const latencyMs = Date.now() - startTime;

            if ('usage' in response && response.usage) {
              const cost = calculateCost(
                params.model,
                response.usage.prompt_tokens,
                response.usage.completion_tokens
              );

              await logUsage(self.haiecApiKey, self.haiecEndpoint, {
                provider: 'openai',
                model: params.model,
                endpoint: 'chat.completions',
                requestTokens: response.usage.prompt_tokens,
                responseTokens: response.usage.completion_tokens,
                cost,
                latencyMs,
                statusCode,
              });
            }

            return response;
          } catch (error) {
            const latencyMs = Date.now() - startTime;
            statusCode = error instanceof Error && 'status' in error ? (error as any).status : 500;
            errorMessage = error instanceof Error ? error.message : 'Unknown error';

            await logUsage(self.haiecApiKey, self.haiecEndpoint, {
              provider: 'openai',
              model: params.model,
              endpoint: 'chat.completions',
              requestTokens: 0,
              responseTokens: 0,
              cost: 0,
              latencyMs,
              statusCode,
              errorMessage,
            });

            throw error;
          }
        },
      },
    };
  }
}

export default TrackedOpenAI;
