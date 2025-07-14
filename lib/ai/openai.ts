import OpenAI from 'openai';
import { NextRequest } from 'next/server';

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Token pricing (per 1K tokens) - Update these based on current OpenAI pricing
export const PRICING = {
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  'gpt-3.5-turbo-16k': { input: 0.003, output: 0.004 },
};

// Calculate cost based on token usage
export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = PRICING[model as keyof typeof PRICING] || PRICING['gpt-3.5-turbo'];
  const inputCost = (inputTokens / 1000) * pricing.input;
  const outputCost = (outputTokens / 1000) * pricing.output;
  return Number((inputCost + outputCost).toFixed(6));
}

// Rate limiting configuration
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // 5 requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

export function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or initialize rate limit
    rateLimitMap.set(userId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return { allowed: true, remaining: RATE_LIMIT - 1, resetIn: RATE_LIMIT_WINDOW };
  }

  if (userLimit.count >= RATE_LIMIT) {
    // Rate limit exceeded
    const resetIn = userLimit.resetTime - now;
    return { allowed: false, remaining: 0, resetIn };
  }

  // Increment count
  userLimit.count++;
  rateLimitMap.set(userId, userLimit);
  
  return {
    allowed: true,
    remaining: RATE_LIMIT - userLimit.count,
    resetIn: userLimit.resetTime - now,
  };
}

// Extract user ID from request (you may need to adjust this based on your auth implementation)
export async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  // This is a placeholder - replace with your actual auth logic
  // For example, extract from JWT token, session, etc.
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  
  // For now, we'll use a simple approach - you should implement proper auth
  return authHeader.replace('Bearer ', '');
}

// Cache for common requests
const responseCache = new Map<string, { response: any; timestamp: number }>();
const CACHE_TTL = 3600 * 1000; // 1 hour

export function getCachedResponse(key: string): any | null {
  const cached = responseCache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    responseCache.delete(key);
    return null;
  }
  
  return cached.response;
}

export function setCachedResponse(key: string, response: any): void {
  responseCache.set(key, {
    response,
    timestamp: Date.now(),
  });
  
  // Clean up old entries periodically
  if (responseCache.size > 1000) {
    const now = Date.now();
    for (const [k, v] of responseCache.entries()) {
      if (now - v.timestamp > CACHE_TTL) {
        responseCache.delete(k);
      }
    }
  }
}

// Stream response helper
export async function* streamCompletion(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  model: string = 'gpt-3.5-turbo'
) {
  const stream = await openai.chat.completions.create({
    model,
    messages,
    stream: true,
    temperature: 0.7,
    max_tokens: 2000,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

// Non-streaming completion helper
export async function getCompletion(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  model: string = 'gpt-3.5-turbo',
  maxTokens: number = 2000
) {
  const completion = await openai.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    max_tokens: maxTokens,
  });

  return {
    content: completion.choices[0]?.message?.content || '',
    usage: completion.usage,
    cost: completion.usage ? calculateCost(
      model,
      completion.usage.prompt_tokens,
      completion.usage.completion_tokens
    ) : 0,
  };
}