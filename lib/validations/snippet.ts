import { z } from 'zod';

export const createSnippetSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  content: z.string().min(1).max(100000), // 100KB limit
  language: z.string().min(1).max(50),
  tags: z.array(z.string().min(1).max(30)).max(10).optional(),
  visibility: z.enum(['public', 'private', 'unlisted', 'team']).optional().default('private'),
  teamId: z.string().uuid().nullable().optional()
});

export const updateSnippetSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  content: z.string().min(1).max(100000).optional(),
  language: z.string().min(1).max(50).optional(),
  tags: z.array(z.string().min(1).max(30)).max(10).optional(),
  visibility: z.enum(['public', 'private', 'unlisted', 'team']).optional(),
  teamId: z.string().uuid().nullable().optional()
});

export const searchQuerySchema = z.object({
  query: z.string().min(1).max(200)
});