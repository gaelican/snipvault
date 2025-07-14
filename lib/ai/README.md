# AI Integration for SnipVault

This directory contains the AI-powered features for SnipVault, enabling snippet generation, code explanation, and improvement suggestions using OpenAI's GPT models.

## Setup

1. **Environment Variables**
   Add your OpenAI API key to your environment variables:
   ```bash
   OPENAI_API_KEY=your-api-key-here
   ```

2. **Database Setup**
   Run the AI schema SQL file to create the necessary tables:
   ```bash
   psql -d your-database -f lib/supabase/ai-schema.sql
   ```

## Features

### 1. AI Snippet Generator
Generate code snippets from natural language descriptions.

```typescript
import { AISnippetGenerator } from '@/components/ai/AISnippetGenerator';

<AISnippetGenerator onSave={handleSave} />
```

### 2. Code Explainer
Get detailed explanations of code snippets in simple terms.

```typescript
import { CodeExplainer } from '@/components/ai/CodeExplainer';

<CodeExplainer initialCode={code} initialLanguage="javascript" />
```

### 3. Code Improvement Analyzer
Analyze code for potential improvements, performance optimizations, and security issues.

### 4. Usage Tracking & Statistics
Monitor AI usage, costs, and quotas with the built-in tracking system.

```typescript
import { AIUsageStats } from '@/components/ai/AIUsageStats';

<AIUsageStats />
```

## API Endpoints

- `POST /api/ai/generate` - Generate code snippets
- `POST /api/ai/explain` - Explain code
- `POST /api/ai/improve` - Get improvement suggestions

## Rate Limiting

- Free tier: 5 requests per minute, 100k tokens per month
- Pro tier: 20 requests per minute, 1M tokens per month
- Enterprise tier: 100 requests per minute, 10M tokens per month

## Caching

Common requests are cached for 1 hour to reduce API costs and improve response times.

## Token Usage & Cost Tracking

All API calls track token usage and calculate costs based on the model used:
- GPT-3.5 Turbo: $0.0005/1K input tokens, $0.0015/1K output tokens
- GPT-4 Turbo: $0.01/1K input tokens, $0.03/1K output tokens

## Streaming Support

The generate endpoint supports streaming responses for real-time code generation:

```typescript
const response = await fetch('/api/ai/generate', {
  method: 'POST',
  body: JSON.stringify({
    description: 'Create a React hook',
    language: 'typescript',
    stream: true
  })
});

const reader = response.body.getReader();
// Process stream...
```

## Security Considerations

1. **Authentication**: All AI endpoints require authentication
2. **Rate Limiting**: Prevents abuse and controls costs
3. **Input Validation**: All inputs are validated using Zod schemas
4. **Token Limits**: Maximum tokens per request are capped
5. **Cost Controls**: Monthly quotas prevent unexpected charges

## Best Practices

1. **Use Specific Descriptions**: More detailed descriptions generate better code
2. **Provide Context**: Additional context improves generation quality
3. **Language Specification**: Always specify the target language for best results
4. **Cache Awareness**: Common requests are cached - consider this for testing
5. **Error Handling**: Always handle rate limit and quota errors gracefully

## Error Handling

```typescript
try {
  const result = await generateSnippet({
    description: 'Create a debounce function',
    language: 'typescript'
  });
} catch (error) {
  if (error.status === 429) {
    // Rate limit exceeded
    console.log('Please wait before making another request');
  } else if (error.status === 402) {
    // Quota exceeded
    console.log('Monthly token quota exceeded');
  }
}
```

## Monitoring

Monitor AI usage through:
1. Usage statistics component
2. Database queries on ai_usage_* tables
3. Supabase dashboard for real-time metrics

## Future Enhancements

- Support for more AI models (Claude, Gemini)
- Code translation between languages
- Automated test generation
- Documentation generation
- Code review and PR suggestions