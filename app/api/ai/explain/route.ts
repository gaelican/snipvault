import { NextRequest, NextResponse } from 'next/server';
import { withAIRateLimit } from '@/lib/ai/middleware';
import { compose, withLogging, withCORS } from '@/lib/middleware/api-middleware';
import { 
  getCompletion, 
  getCachedResponse, 
  setCachedResponse,
  getUserIdFromRequest 
} from '@/lib/ai/openai';
import { PROMPTS, createCacheKey, detectLanguage } from '@/lib/ai/prompts';
import { explainCodeSchema } from '@/lib/ai/types';

async function explainHandler(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validatedData = explainCodeSchema.parse(body);
    const { code, language: providedLanguage } = validatedData;

    // Detect language if not provided
    const language = providedLanguage || detectLanguage(code);

    // Check cache
    const cacheKey = createCacheKey('explain', { code, language });
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

    // Prepare prompt
    const prompt = PROMPTS.explainCode(code, language);
    const messages = [
      { role: 'system' as const, content: prompt.system },
      { role: 'user' as const, content: prompt.user },
    ];

    // Get completion
    const result = await getCompletion(messages, 'gpt-3.5-turbo', 3000);

    // Structure the explanation
    const structuredExplanation = structureExplanation(result.content);

    // Cache the response
    setCachedResponse(cacheKey, {
      content: structuredExplanation,
      usage: result.usage,
      cost: result.cost,
      language,
    });

    // Track usage
    const userId = await getUserIdFromRequest(req);
    if (userId && result.usage) {
      // TODO: Store token usage in database
      console.log(`User ${userId} used ${result.usage.total_tokens} tokens for explanation`);
    }

    return NextResponse.json({
      success: true,
      data: {
        content: structuredExplanation,
        usage: result.usage,
        cost: result.cost,
        language,
        cached: false,
      },
    });
  } catch (error: any) {
    console.error('Explain API error:', error);
    
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
        error: 'Failed to explain code',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Helper function to structure the explanation
function structureExplanation(rawExplanation: string): {
  overview: string;
  stepByStep: string[];
  concepts: string[];
  useCases: string[];
  considerations: string[];
} {
  // Simple parsing logic - in production, you might want to use more sophisticated parsing
  const sections = {
    overview: '',
    stepByStep: [] as string[],
    concepts: [] as string[],
    useCases: [] as string[],
    considerations: [] as string[],
  };

  const lines = rawExplanation.split('\n');
  let currentSection = '';

  for (const line of lines) {
    if (line.toLowerCase().includes('overview') || line.toLowerCase().includes('high-level')) {
      currentSection = 'overview';
      continue;
    } else if (line.toLowerCase().includes('step-by-step') || line.toLowerCase().includes('how it works')) {
      currentSection = 'stepByStep';
      continue;
    } else if (line.toLowerCase().includes('concepts') || line.toLowerCase().includes('patterns')) {
      currentSection = 'concepts';
      continue;
    } else if (line.toLowerCase().includes('use cases')) {
      currentSection = 'useCases';
      continue;
    } else if (line.toLowerCase().includes('considerations') || line.toLowerCase().includes('caveats')) {
      currentSection = 'considerations';
      continue;
    }

    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    switch (currentSection) {
      case 'overview':
        sections.overview += trimmedLine + ' ';
        break;
      case 'stepByStep':
        if (trimmedLine.match(/^\d+\.|^-|^\*/)) {
          sections.stepByStep.push(trimmedLine.replace(/^\d+\.|^-|^\*/, '').trim());
        }
        break;
      case 'concepts':
        if (trimmedLine.match(/^\d+\.|^-|^\*/)) {
          sections.concepts.push(trimmedLine.replace(/^\d+\.|^-|^\*/, '').trim());
        }
        break;
      case 'useCases':
        if (trimmedLine.match(/^\d+\.|^-|^\*/)) {
          sections.useCases.push(trimmedLine.replace(/^\d+\.|^-|^\*/, '').trim());
        }
        break;
      case 'considerations':
        if (trimmedLine.match(/^\d+\.|^-|^\*/)) {
          sections.considerations.push(trimmedLine.replace(/^\d+\.|^-|^\*/, '').trim());
        }
        break;
    }
  }

  // If parsing didn't work well, return the raw explanation in overview
  if (!sections.overview && sections.stepByStep.length === 0) {
    sections.overview = rawExplanation;
  }

  return sections;
}

// Apply middleware
export const POST = compose(
  withLogging,
  withCORS,
  withAIRateLimit
)(explainHandler);

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