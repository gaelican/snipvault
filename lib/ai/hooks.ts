'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseAIOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useAIGenerate(options: UseAIOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  const generate = useCallback(async (params: {
    description: string;
    language: string;
    context?: string;
    stream?: boolean;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate snippet');
      }

      if (params.stream) {
        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let content = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.content) {
                    content += parsed.content;
                    setData({ content });
                  }
                } catch (e) {
                  console.error('Failed to parse stream data:', e);
                }
              }
            }
          }
        }

        const result = { content };
        options.onSuccess?.(result);
        return result;
      } else {
        // Handle regular response
        const responseData = await response.json();
        setData(responseData.data);
        options.onSuccess?.(responseData.data);
        return responseData.data;
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    generate,
    isLoading,
    data,
    error,
  };
}

export function useAIExplain(options: UseAIOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  const explain = useCallback(async (params: {
    code: string;
    language?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to explain code');
      }

      const responseData = await response.json();
      setData(responseData.data);
      options.onSuccess?.(responseData.data);
      return responseData.data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    explain,
    isLoading,
    data,
    error,
  };
}

export function useAIImprove(options: UseAIOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  const improve = useCallback(async (params: {
    code: string;
    language?: string;
    requirements?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/improve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze code');
      }

      const responseData = await response.json();
      setData(responseData.data);
      options.onSuccess?.(responseData.data);
      return responseData.data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    improve,
    isLoading,
    data,
    error,
  };
}