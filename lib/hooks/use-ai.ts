import { useState, useCallback } from 'react';
import { useAuth } from '@/app/providers';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { toast } from 'sonner';

interface GenerateSnippetParams {
  description: string;
  language?: string;
  framework?: string;
  style?: string;
}

interface ImproveSnippetParams {
  code: string;
  language: string;
  improvements?: string[];
}

interface ExplainSnippetParams {
  code: string;
  language: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

// For development/demo, we'll use mock responses
// In production, these would call Firebase Functions
const MOCK_RESPONSES = {
  generate: {
    title: 'Generated Code Snippet',
    description: 'AI-generated code based on your description',
    content: '// This is a mock generated snippet\n// In production, this would use OpenAI API via Firebase Functions\nfunction example() {\n  console.log("Hello, World!");\n}',
    language: 'javascript',
  },
  improve: {
    improved: '// This is a mock improved snippet\n// Original code has been enhanced\nfunction improvedExample() {\n  console.log("Improved Hello, World!");\n}',
    suggestions: [
      'Added error handling',
      'Improved variable naming',
      'Added comments for clarity',
    ],
  },
  explain: {
    explanation: 'This is a mock explanation of the code. In production, this would provide detailed analysis using AI.',
    concepts: ['Functions', 'Console output', 'Basic syntax'],
    complexity: 'beginner',
  },
};

export function useAI() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSnippet = useCallback(
    async (params: GenerateSnippetParams) => {
      if (!user) {
        toast.error('You must be logged in to use AI features');
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        // In production, call Firebase Function
        if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
          const functions = getFunctions();
          const generateFunction = httpsCallable(functions, 'generateSnippet');
          const result = await generateFunction(params);
          return result.data;
        }

        // Mock response for development
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
        return MOCK_RESPONSES.generate;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to generate snippet';
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const improveSnippet = useCallback(
    async (params: ImproveSnippetParams) => {
      if (!user) {
        toast.error('You must be logged in to use AI features');
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        // In production, call Firebase Function
        if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
          const functions = getFunctions();
          const improveFunction = httpsCallable(functions, 'improveSnippet');
          const result = await improveFunction(params);
          return result.data;
        }

        // Mock response for development
        await new Promise(resolve => setTimeout(resolve, 1500));
        return MOCK_RESPONSES.improve;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to improve snippet';
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const explainSnippet = useCallback(
    async (params: ExplainSnippetParams) => {
      if (!user) {
        toast.error('You must be logged in to use AI features');
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        // In production, call Firebase Function
        if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
          const functions = getFunctions();
          const explainFunction = httpsCallable(functions, 'explainSnippet');
          const result = await explainFunction(params);
          return result.data;
        }

        // Mock response for development
        await new Promise(resolve => setTimeout(resolve, 1500));
        return MOCK_RESPONSES.explain;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to explain snippet';
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return {
    generateSnippet,
    improveSnippet,
    explainSnippet,
    loading,
    error,
  };
}

// Hook for AI usage statistics
export function useAIUsageStats() {
  const { user, profile } = useAuth();
  
  // In a real implementation, this would fetch from Firestore
  const stats = {
    used: 0,
    limit: profile?.subscription?.plan === 'free' ? 10 : 
           profile?.subscription?.plan === 'individual' ? 100 : 
           1000,
    resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  };

  return stats;
}