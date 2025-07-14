import {
  listSnippets,
  getSnippet,
  createSnippet,
  updateSnippet,
  deleteSnippet,
  searchSnippets,
  getSnippetVersions,
  getSnippetUrl,
  getSnippetEmbedUrl,
  getSnippetRawUrl,
} from '@/lib/api/snippets';

// Mock global fetch
global.fetch = jest.fn();

describe('Snippets API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listSnippets', () => {
    it('should fetch snippets with default parameters', async () => {
      const mockResponse = {
        data: [{ id: '1', title: 'Test' }],
        pagination: { page: 1, limit: 20, total: 1 },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await listSnippets();

      expect(global.fetch).toHaveBeenCalledWith('/api/snippets?', {
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should fetch snippets with filters and pagination', async () => {
      const mockResponse = {
        data: [{ id: '1', title: 'Test' }],
        pagination: { page: 2, limit: 10, total: 50 },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await listSnippets({
        page: 2,
        limit: 10,
        sortBy: 'created_at',
        sortOrder: 'desc',
        tags: ['javascript', 'react'],
        language: 'javascript',
        visibility: 'public',
        authorId: 'user123',
        includeDeleted: true,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/snippets?page=2&limit=10&sortBy=created_at&sortOrder=desc&tags=javascript%2Creact&language=javascript&visibility=public&authorId=user123&includeDeleted=true',
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should include authorization token when provided', async () => {
      const mockResponse = { data: [], pagination: { page: 1, limit: 20, total: 0 } };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await listSnippets({}, { token: 'test-token' });

      expect(global.fetch).toHaveBeenCalledWith('/api/snippets?', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
      });
    });
  });

  describe('getSnippet', () => {
    it('should fetch a single snippet', async () => {
      const mockSnippet = { id: '123', title: 'Test Snippet' };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSnippet,
      });

      const result = await getSnippet('123');

      expect(global.fetch).toHaveBeenCalledWith('/api/snippets/123', {
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockSnippet);
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Snippet not found' }),
      });

      await expect(getSnippet('123')).rejects.toThrow('Snippet not found');
    });
  });

  describe('createSnippet', () => {
    it('should create a new snippet', async () => {
      const input = {
        title: 'New Snippet',
        content: 'console.log("Hello");',
        language: 'javascript',
      };
      const mockSnippet = { id: '123', ...input };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSnippet,
      });

      const result = await createSnippet(input);

      expect(global.fetch).toHaveBeenCalledWith('/api/snippets', {
        method: 'POST',
        body: JSON.stringify(input),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockSnippet);
    });
  });

  describe('updateSnippet', () => {
    it('should update a snippet', async () => {
      const input = { title: 'Updated Title' };
      const mockSnippet = { id: '123', title: 'Updated Title' };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSnippet,
      });

      const result = await updateSnippet('123', input);

      expect(global.fetch).toHaveBeenCalledWith('/api/snippets/123', {
        method: 'PUT',
        body: JSON.stringify(input),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockSnippet);
    });
  });

  describe('deleteSnippet', () => {
    it('should delete a snippet', async () => {
      const mockResponse = { message: 'Snippet deleted successfully' };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await deleteSnippet('123');

      expect(global.fetch).toHaveBeenCalledWith('/api/snippets/123', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('searchSnippets', () => {
    it('should search snippets', async () => {
      const mockResponse = {
        data: [
          { id: '1', title: 'JavaScript Functions', highlights: ['JavaScript'] },
        ],
        pagination: { page: 1, limit: 20, total: 1 },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await searchSnippets('javascript');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/snippets/search?q=javascript',
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should search with filters', async () => {
      const mockResponse = {
        data: [],
        pagination: { page: 1, limit: 20, total: 0 },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await searchSnippets('test', {
        page: 2,
        limit: 5,
        language: 'python',
        tags: ['django'],
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/snippets/search?q=test&page=2&limit=5&tags=django&language=python',
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });
  });

  describe('getSnippetVersions', () => {
    it('should fetch snippet versions', async () => {
      const mockResponse = {
        snippetId: '123',
        currentVersion: 3,
        versions: [
          { id: 'v1', version_number: 1 },
          { id: 'v2', version_number: 2 },
          { id: 'v3', version_number: 3 },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getSnippetVersions('123');

      expect(global.fetch).toHaveBeenCalledWith('/api/snippets/123/versions', {
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('URL helpers', () => {
    const mockSnippet = {
      id: '123',
      title: 'Test',
      content: 'test',
      language: 'javascript',
      user_id: 'user123',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    it('should generate snippet URL', () => {
      expect(getSnippetUrl(mockSnippet)).toBe('/snippets/123');
    });

    it('should generate embed URL', () => {
      expect(getSnippetEmbedUrl(mockSnippet)).toBe('/embed/123');
    });

    it('should generate raw content URL', () => {
      expect(getSnippetRawUrl(mockSnippet)).toBe('/api/snippets/123/raw');
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(listSnippets()).rejects.toThrow('Network error');
    });

    it('should handle JSON parse errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(listSnippets()).rejects.toThrow('API Error: 500');
    });
  });
});