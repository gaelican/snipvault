import { NextRequest, NextResponse } from 'next/server';
import { withAIRateLimit } from '@/lib/ai/middleware';
import { compose, withLogging, withCORS } from '@/lib/middleware/api-middleware';
import { 
  getCompletion, 
  getCachedResponse, 
  setCachedResponse,
  getUserIdFromRequest 
} from '@/lib/ai/openai';
import { PROMPTS, createCacheKey, detectLanguage, validateGeneratedCode } from '@/lib/ai/prompts';
import { improveCodeSchema } from '@/lib/ai/types';

async function improveHandler(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validatedData = improveCodeSchema.parse(body);
    const { code, language: providedLanguage, requirements } = validatedData;

    // Detect language if not provided
    const language = providedLanguage || detectLanguage(code);

    // Check cache
    const cacheKey = createCacheKey('improve', { code, language, requirements });
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
    const prompt = PROMPTS.improveCode(code, language, requirements);
    const messages = [
      { role: 'system' as const, content: prompt.system },
      { role: 'user' as const, content: prompt.user },
    ];

    // Get completion with higher token limit for detailed analysis
    const result = await getCompletion(messages, 'gpt-4-turbo-preview', 4000);

    // Parse the improvement suggestions
    const improvements = parseImprovements(result.content);

    // Validate improved code if present
    if (improvements.improvedCode) {
      const validation = validateGeneratedCode(improvements.improvedCode, language);
      improvements.validation = validation;
    }

    // Cache the response
    setCachedResponse(cacheKey, {
      ...improvements,
      usage: result.usage,
      cost: result.cost,
      language,
    });

    // Track usage
    const userId = await getUserIdFromRequest(req);
    if (userId && result.usage) {
      // TODO: Store token usage in database
      console.log(`User ${userId} used ${result.usage.total_tokens} tokens for improvement`);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...improvements,
        usage: result.usage,
        cost: result.cost,
        language,
        cached: false,
      },
    });
  } catch (error: any) {
    console.error('Improve API error:', error);
    
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
        error: 'Failed to analyze code',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Helper function to parse improvement suggestions
function parseImprovements(rawResponse: string): {
  issues: Array<{ type: string; description: string; severity: 'high' | 'medium' | 'low' }>;
  suggestions: Array<{ category: string; suggestion: string; explanation: string }>;
  improvedCode?: string;
  performanceNotes?: string[];
  securityNotes?: string[];
} {
  const result = {
    issues: [] as Array<{ type: string; description: string; severity: 'high' | 'medium' | 'low' }>,
    suggestions: [] as Array<{ category: string; suggestion: string; explanation: string }>,
    improvedCode: undefined as string | undefined,
    performanceNotes: [] as string[],
    securityNotes: [] as string[],
  };

  const sections = rawResponse.split(/\n(?=\d+\.|#{1,3}\s)/);
  
  for (const section of sections) {
    const lowerSection = section.toLowerCase();
    
    // Extract issues
    if (lowerSection.includes('issue') || lowerSection.includes('problem')) {
      const issueMatch = section.match(/(.+?):\s*(.+)/);
      if (issueMatch) {
        const severity = lowerSection.includes('critical') || lowerSection.includes('high') ? 'high' :
                        lowerSection.includes('medium') ? 'medium' : 'low';
        result.issues.push({
          type: issueMatch[1].trim(),
          description: issueMatch[2].trim(),
          severity,
        });
      }
    }
    
    // Extract suggestions
    if (lowerSection.includes('suggestion') || lowerSection.includes('improvement')) {
      const lines = section.split('\n');
      const category = lines[0].replace(/\d+\.|#/g, '').trim();
      const content = lines.slice(1).join(' ').trim();
      const [suggestion, ...explanationParts] = content.split(/\s*-\s*/);
      
      if (suggestion) {
        result.suggestions.push({
          category,
          suggestion: suggestion.trim(),
          explanation: explanationParts.join(' - ').trim(),
        });
      }
    }
    
    // Extract improved code
    if (lowerSection.includes('refactored') || lowerSection.includes('improved code')) {
      const codeMatch = section.match(/```[\w]*\n([\s\S]*?)```/);
      if (codeMatch) {
        result.improvedCode = codeMatch[1].trim();
      }
    }
    
    // Extract performance notes
    if (lowerSection.includes('performance')) {
      const perfMatch = section.match(/[-*]\s*(.+)/g);
      if (perfMatch) {
        result.performanceNotes = perfMatch.map(m => m.replace(/^[-*]\s*/, '').trim());
      }
    }
    
    // Extract security notes
    if (lowerSection.includes('security')) {
      const secMatch = section.match(/[-*]\s*(.+)/g);
      if (secMatch) {
        result.securityNotes = secMatch.map(m => m.replace(/^[-*]\s*/, '').trim());
      }
    }
  }

  // If we couldn't parse structured data, create a general suggestion
  if (result.issues.length === 0 && result.suggestions.length === 0) {
    result.suggestions.push({
      category: 'General',
      suggestion: 'Review the AI feedback',
      explanation: rawResponse,
    });
  }

  return result;
}

// Apply middleware
export const POST = compose(
  withLogging,
  withCORS,
  withAIRateLimit
)(improveHandler);

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