// AI-related types and interfaces

export interface AIRequest {
  userId: string;
  operation: 'generate' | 'explain' | 'improve';
  input: string;
  language?: string;
  context?: string;
  model?: string;
}

export interface AIResponse {
  success: boolean;
  data?: {
    content: string;
    usage?: TokenUsage;
    cost?: number;
    cached?: boolean;
  };
  error?: string;
  rateLimit?: {
    remaining: number;
    resetIn: number;
  };
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface GenerateSnippetRequest {
  description: string;
  language: string;
  context?: string;
  stream?: boolean;
}

export interface ExplainCodeRequest {
  code: string;
  language?: string;
}

export interface ImproveCodeRequest {
  code: string;
  language?: string;
  requirements?: string;
}

export interface UserTokenUsage {
  userId: string;
  date: string;
  usage: {
    generate: number;
    explain: number;
    improve: number;
    total: number;
  };
  cost: number;
}

// Validation schemas using Zod
import { z } from 'zod';

export const generateSnippetSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters'),
  language: z.string().min(1, 'Language is required'),
  context: z.string().optional(),
  stream: z.boolean().optional().default(false),
});

export const explainCodeSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  language: z.string().optional(),
});

export const improveCodeSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  language: z.string().optional(),
  requirements: z.string().optional(),
});

// Supported languages
export const SUPPORTED_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'csharp',
  'go',
  'rust',
  'ruby',
  'php',
  'swift',
  'kotlin',
  'html',
  'css',
  'sql',
  'bash',
  'powershell',
  'r',
  'matlab',
  'scala',
  'perl',
  'lua',
  'dart',
  'elixir',
  'haskell',
  'julia',
  'clojure',
  'ocaml',
  'fsharp',
  'erlang',
  'nim',
  'crystal',
  'zig',
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];