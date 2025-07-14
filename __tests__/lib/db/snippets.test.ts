import { 
  createSnippet, 
  updateSnippet, 
  deleteSnippet, 
  getSnippet, 
  getUserSnippets,
  getPublicSnippets,
  searchSnippets,
  getSnippetVersions,
  getSnippetVersion,
  incrementSnippetViews
} from '@/lib/db/snippets';
import { createClient } from '@/lib/supabase/server';

// Mock the Supabase client
jest.mock('@/lib/supabase/server');

describe('Snippets Database Functions', () => {
  let mockSupabase: any;
  let mockFrom: jest.Mock;
  let mockSelect: jest.Mock;
  let mockInsert: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDelete: jest.Mock;
  let mockEq: jest.Mock;
  let mockSingle: jest.Mock;
  let mockOrder: jest.Mock;
  let mockRange: jest.Mock;
  let mockOr: jest.Mock;
  let mockContains: jest.Mock;
  let mockRpc: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    mockSingle = jest.fn();
    mockRange = jest.fn();
    mockOrder = jest.fn();
    mockEq = jest.fn();
    mockOr = jest.fn();
    mockContains = jest.fn();
    mockSelect = jest.fn();
    mockInsert = jest.fn();
    mockUpdate = jest.fn();
    mockDelete = jest.fn();
    mockFrom = jest.fn();
    mockRpc = jest.fn();

    // Setup chain returns
    mockRange.mockReturnThis();
    mockOrder.mockReturnThis();
    mockEq.mockReturnThis();
    mockOr.mockReturnThis();
    mockContains.mockReturnThis();
    mockSelect.mockReturnThis();
    mockInsert.mockReturnThis();
    mockUpdate.mockReturnThis();
    mockDelete.mockReturnThis();
    
    // Make methods chainable
    const chainableMethods = {
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      single: mockSingle,
      order: mockOrder,
      range: mockRange,
      or: mockOr,
      contains: mockContains,
    };
    
    Object.values(chainableMethods).forEach(method => {
      method.mockReturnValue(chainableMethods);
    });

    mockFrom.mockReturnValue(chainableMethods);

    mockSupabase = {
      from: mockFrom,
      rpc: mockRpc,
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('createSnippet', () => {
    it('should create a snippet successfully', async () => {
      const mockSnippet = {
        id: '123',
        user_id: 'user123',
        title: 'Test Snippet',
        description: 'Test description',
        code: 'console.log("test");',
        language: 'javascript',
        tags: ['test'],
        visibility: 'private',
      };

      mockSingle.mockResolvedValueOnce({ data: mockSnippet, error: null });
      mockSingle.mockResolvedValueOnce({ data: { ...mockSnippet, version_number: 1 }, error: null });

      const result = await createSnippet('user123', {
        title: 'Test Snippet',
        description: 'Test description',
        code: 'console.log("test");',
        language: 'javascript',
        tags: ['test'],
      });

      expect(mockFrom).toHaveBeenCalledWith('snippets');
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user123',
        title: 'Test Snippet',
        description: 'Test description',
        code: 'console.log("test");',
        language: 'javascript',
        tags: ['test'],
        visibility: 'private',
        team_id: undefined,
      });
      expect(result).toEqual(mockSnippet);
    });

    it('should handle creation errors', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'Database error' } });

      const result = await createSnippet('user123', {
        title: 'Test',
        code: 'test',
        language: 'javascript',
      });

      expect(result).toBeNull();
    });
  });

  describe('updateSnippet', () => {
    it('should update a snippet successfully', async () => {
      const currentSnippet = {
        id: '123',
        title: 'Old Title',
        code: 'old code',
        language: 'javascript',
      };

      const updatedSnippet = {
        ...currentSnippet,
        title: 'New Title',
      };

      mockSingle
        .mockResolvedValueOnce({ data: currentSnippet, error: null }) // Get current snippet
        .mockResolvedValueOnce({ data: updatedSnippet, error: null }) // Update snippet
        .mockResolvedValueOnce({ data: { version_number: 1 }, error: null }) // Get max version
        .mockResolvedValueOnce({ data: { version_number: 2 }, error: null }); // Create version

      const result = await updateSnippet('123', 'user123', {
        title: 'New Title',
        commitMessage: 'Updated title',
      });

      expect(result).toEqual(updatedSnippet);
      expect(mockUpdate).toHaveBeenCalledWith({
        title: 'New Title',
        description: undefined,
        code: undefined,
        language: undefined,
        tags: undefined,
        visibility: undefined,
        team_id: undefined,
      });
    });

    it('should return null if snippet not found', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: null });

      const result = await updateSnippet('123', 'user123', { title: 'New' });

      expect(result).toBeNull();
    });
  });

  describe('deleteSnippet', () => {
    it('should delete a snippet successfully', async () => {
      mockDelete.mockReturnValue({
        eq: mockEq.mockResolvedValue({ error: null }),
      });

      const result = await deleteSnippet('123');

      expect(mockFrom).toHaveBeenCalledWith('snippets');
      expect(mockDelete).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle deletion errors', async () => {
      mockDelete.mockReturnValue({
        eq: mockEq.mockResolvedValue({ error: { message: 'Error' } }),
      });

      const result = await deleteSnippet('123');

      expect(result).toBe(false);
    });
  });

  describe('getSnippet', () => {
    it('should fetch a snippet by ID', async () => {
      const mockSnippet = { id: '123', title: 'Test' };
      mockSingle.mockResolvedValue({ data: mockSnippet, error: null });

      const result = await getSnippet('123');

      expect(mockFrom).toHaveBeenCalledWith('snippets');
      expect(mockEq).toHaveBeenCalledWith('id', '123');
      expect(result).toEqual(mockSnippet);
    });
  });

  describe('getUserSnippets', () => {
    it('should fetch user snippets with pagination', async () => {
      const mockSnippets = [
        { id: '1', title: 'Snippet 1' },
        { id: '2', title: 'Snippet 2' },
      ];
      
      mockRange.mockResolvedValue({ data: mockSnippets, error: null });

      const result = await getUserSnippets('user123', 10, 0);

      expect(mockFrom).toHaveBeenCalledWith('snippets');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user123');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockRange).toHaveBeenCalledWith(0, 9);
      expect(result).toEqual(mockSnippets);
    });

    it('should return empty array on error', async () => {
      mockRange.mockResolvedValue({ data: null, error: { message: 'Error' } });

      const result = await getUserSnippets('user123');

      expect(result).toEqual([]);
    });
  });

  describe('searchSnippets', () => {
    it('should search snippets with query and filters', async () => {
      const mockSnippets = [{ id: '1', title: 'JavaScript snippet' }];
      mockRange.mockResolvedValue({ data: mockSnippets, error: null });

      const result = await searchSnippets('javascript', {
        language: 'javascript',
        tags: ['test'],
        visibility: 'public',
        userId: 'user123',
      });

      expect(mockOr).toHaveBeenCalledWith('title.ilike.%javascript%,description.ilike.%javascript%');
      expect(mockEq).toHaveBeenCalledWith('language', 'javascript');
      expect(mockEq).toHaveBeenCalledWith('visibility', 'public');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user123');
      expect(mockContains).toHaveBeenCalledWith('tags', ['test']);
      expect(result).toEqual(mockSnippets);
    });

    it('should handle search without filters', async () => {
      const mockSnippets = [{ id: '1', title: 'Test' }];
      mockRange.mockResolvedValue({ data: mockSnippets, error: null });

      const result = await searchSnippets('test');

      expect(mockOr).toHaveBeenCalled();
      expect(result).toEqual(mockSnippets);
    });
  });

  describe('getSnippetVersions', () => {
    it('should fetch snippet versions', async () => {
      const mockVersions = [
        { id: '1', version_number: 2 },
        { id: '2', version_number: 1 },
      ];
      
      mockOrder.mockResolvedValue({ data: mockVersions, error: null });

      const result = await getSnippetVersions('snippet123');

      expect(mockFrom).toHaveBeenCalledWith('snippet_versions');
      expect(mockEq).toHaveBeenCalledWith('snippet_id', 'snippet123');
      expect(mockOrder).toHaveBeenCalledWith('version_number', { ascending: false });
      expect(result).toEqual(mockVersions);
    });
  });

  describe('incrementSnippetViews', () => {
    it('should increment snippet views', async () => {
      mockRpc.mockResolvedValue({ error: null });

      await incrementSnippetViews('snippet123');

      expect(mockRpc).toHaveBeenCalledWith('increment_snippet_views', {
        snippet_id: 'snippet123',
      });
    });

    it('should handle RPC errors silently', async () => {
      mockRpc.mockResolvedValue({ error: { message: 'Error' } });

      // Should not throw
      await expect(incrementSnippetViews('snippet123')).resolves.not.toThrow();
    });
  });
});