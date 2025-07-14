import { NextRequest, NextResponse } from 'next/server';
import { withAIRateLimit } from '@/lib/ai/middleware';
import { compose, withLogging, withCORS } from '@/lib/middleware/api-middleware';
import { 
  getCompletion, 
  streamCompletion, 
  getCachedResponse, 
  setCachedResponse,
  getUserIdFromRequest 
} from '@/lib/ai/openai';
import { PROMPTS, createCacheKey, validateGeneratedCode } from '@/lib/ai/prompts';
import { generateSnippetSchema } from '@/lib/ai/types';

async function generateHandler(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validatedData = generateSnippetSchema.parse(body);
    const { description, language, context, stream } = validatedData;

    // Check cache for non-streaming requests
    if (!stream) {
      const cacheKey = createCacheKey('generate', { description, language, context });
      const cached = getCachedResponse(cacheKey);
      if (cached) {
        return NextResponse.json({
          success: true,
          data: {
            ...cached,
            cached: true,
          },
        });
      }
    }

    // Prepare prompt
    const prompt = PROMPTS.generateSnippet(description, language, context);
    const messages = [
      { role: 'system' as const, content: prompt.system },
      { role: 'user' as const, content: prompt.user },
    ];

    // Handle streaming response
    if (stream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamCompletion(messages)) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`)
            );
            controller.close();
          }
        },
      });

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Handle non-streaming response
    const result = await getCompletion(messages);
    
    // Validate generated code
    const validation = validateGeneratedCode(result.content, language);
    if (!validation.valid) {
      console.warn('Generated code validation issues:', validation.issues);
    }

    // Cache the response
    const cacheKey = createCacheKey('generate', { description, language, context });
    setCachedResponse(cacheKey, {
      content: result.content,
      usage: result.usage,
      cost: result.cost,
      validation: validation,
    });

    // Get user ID for tracking
    const userId = await getUserIdFromRequest(req);
    if (userId && result.usage) {
      // TODO: Store token usage in database
      console.log(`User ${userId} used ${result.usage.total_tokens} tokens for generation`);
    }

    return NextResponse.json({
      success: true,
      data: {
        content: result.content,
        usage: result.usage,
        cost: result.cost,
        validation: validation,
        cached: false,
      },
    });
  } catch (error: any) {
    console.error('Generate API error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation error', 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    if (error.response?.status === 429) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'OpenAI rate limit exceeded. Please try again later.' 
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate snippet',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Apply middleware
export const POST = compose(
  withLogging,
  withCORS,
  withAIRateLimit
)(generateHandler);

// Handle OPTIONS for CORS
export const OPTIONS = () => {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};