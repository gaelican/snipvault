import { createSnippetSchema, updateSnippetSchema, searchQuerySchema } from '@/lib/validations/snippet';

describe('Snippet Validation Schemas', () => {
  describe('createSnippetSchema', () => {
    it('should validate a valid snippet', () => {
      const validSnippet = {
        title: 'My Snippet',
        description: 'A test snippet',
        content: 'console.log("Hello World");',
        language: 'javascript',
        tags: ['test', 'demo'],
        visibility: 'public' as const,
      };

      const result = createSnippetSchema.parse(validSnippet);
      expect(result).toEqual(validSnippet);
    });

    it('should use default visibility when not provided', () => {
      const snippet = {
        title: 'My Snippet',
        content: 'console.log("Hello");',
        language: 'javascript',
      };

      const result = createSnippetSchema.parse(snippet);
      expect(result.visibility).toBe('public');
    });

    it('should fail with missing required fields', () => {
      const invalidSnippet = {
        description: 'Missing required fields',
      };

      expect(() => createSnippetSchema.parse(invalidSnippet)).toThrow();
    });

    it('should fail with empty title', () => {
      const invalidSnippet = {
        title: '',
        content: 'console.log("Hello");',
        language: 'javascript',
      };

      expect(() => createSnippetSchema.parse(invalidSnippet)).toThrow();
    });

    it('should fail with title exceeding max length', () => {
      const invalidSnippet = {
        title: 'a'.repeat(201),
        content: 'console.log("Hello");',
        language: 'javascript',
      };

      expect(() => createSnippetSchema.parse(invalidSnippet)).toThrow();
    });

    it('should fail with content exceeding max length', () => {
      const invalidSnippet = {
        title: 'My Snippet',
        content: 'a'.repeat(100001),
        language: 'javascript',
      };

      expect(() => createSnippetSchema.parse(invalidSnippet)).toThrow();
    });

    it('should fail with too many tags', () => {
      const invalidSnippet = {
        title: 'My Snippet',
        content: 'console.log("Hello");',
        language: 'javascript',
        tags: Array(11).fill('tag'),
      };

      expect(() => createSnippetSchema.parse(invalidSnippet)).toThrow();
    });

    it('should fail with invalid visibility', () => {
      const invalidSnippet = {
        title: 'My Snippet',
        content: 'console.log("Hello");',
        language: 'javascript',
        visibility: 'invalid' as any,
      };

      expect(() => createSnippetSchema.parse(invalidSnippet)).toThrow();
    });
  });

  describe('updateSnippetSchema', () => {
    it('should validate partial updates', () => {
      const updates = {
        title: 'Updated Title',
      };

      const result = updateSnippetSchema.parse(updates);
      expect(result).toEqual(updates);
    });

    it('should validate all fields update', () => {
      const updates = {
        title: 'Updated Title',
        description: 'Updated description',
        content: 'console.log("Updated");',
        language: 'typescript',
        tags: ['updated', 'test'],
        visibility: 'private' as const,
      };

      const result = updateSnippetSchema.parse(updates);
      expect(result).toEqual(updates);
    });

    it('should validate empty object (no updates)', () => {
      const updates = {};
      const result = updateSnippetSchema.parse(updates);
      expect(result).toEqual({});
    });

    it('should fail with invalid field values', () => {
      const invalidUpdates = {
        title: '', // Empty string not allowed
      };

      expect(() => updateSnippetSchema.parse(invalidUpdates)).toThrow();
    });
  });

  describe('searchQuerySchema', () => {
    it('should validate valid search query', () => {
      const query = { query: 'javascript snippet' };
      const result = searchQuerySchema.parse(query);
      expect(result).toEqual(query);
    });

    it('should fail with empty query', () => {
      const query = { query: '' };
      expect(() => searchQuerySchema.parse(query)).toThrow();
    });

    it('should fail with missing query field', () => {
      const query = {};
      expect(() => searchQuerySchema.parse(query)).toThrow();
    });

    it('should fail with query exceeding max length', () => {
      const query = { query: 'a'.repeat(201) };
      expect(() => searchQuerySchema.parse(query)).toThrow();
    });
  });
});