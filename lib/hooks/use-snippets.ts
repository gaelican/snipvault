import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/providers';
import {
  createSnippet,
  getSnippet,
  listSnippets,
  updateSnippet,
  deleteSnippet,
  toggleFavorite,
  searchSnippets,
  getUserSnippetStats,
  getSnippetVersions,
  incrementCopyCount,
} from '@/lib/firebase/db/snippets';
import type { Snippet, SnippetFilters, PaginationParams } from '@/lib/types/snippet';
import { toast } from 'sonner';

// Hook for managing snippets
export function useSnippets(
  filters: SnippetFilters = {},
  pagination: PaginationParams = { page: 1, limit: 20 }
) {
  const { user } = useAuth();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchSnippets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await listSnippets(filters, pagination, user?.uid);
      setSnippets(result.snippets);
      setTotal(result.total);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch snippets');
      toast.error('Failed to load snippets');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination, user?.uid]);

  useEffect(() => {
    fetchSnippets();
  }, [fetchSnippets]);

  return {
    snippets,
    loading,
    error,
    hasMore,
    total,
    refetch: fetchSnippets,
  };
}

// Hook for a single snippet
export function useSnippet(id: string) {
  const { user } = useAuth();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSnippet() {
      try {
        setLoading(true);
        setError(null);
        const result = await getSnippet(id, user?.uid);
        setSnippet(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch snippet');
        toast.error('Failed to load snippet');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchSnippet();
    }
  }, [id, user?.uid]);

  return { snippet, loading, error };
}

// Hook for creating snippets
export function useCreateSnippet() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (data: Partial<Snippet>) => {
      if (!user) {
        toast.error('You must be logged in to create snippets');
        return null;
      }

      try {
        setLoading(true);
        setError(null);
        const snippet = await createSnippet(data, user.uid);
        toast.success('Snippet created successfully');
        return snippet;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create snippet';
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return { create, loading, error };
}

// Hook for updating snippets
export function useUpdateSnippet() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    async (id: string, data: Partial<Snippet>) => {
      if (!user) {
        toast.error('You must be logged in to update snippets');
        return null;
      }

      try {
        setLoading(true);
        setError(null);
        const snippet = await updateSnippet(id, data, user.uid);
        toast.success('Snippet updated successfully');
        return snippet;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update snippet';
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return { update, loading, error };
}

// Hook for deleting snippets
export function useDeleteSnippet() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(
    async (id: string) => {
      if (!user) {
        toast.error('You must be logged in to delete snippets');
        return false;
      }

      try {
        setLoading(true);
        setError(null);
        await deleteSnippet(id, user.uid);
        toast.success('Snippet deleted successfully');
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete snippet';
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return { remove, loading, error };
}

// Hook for toggling favorites
export function useToggleFavorite() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const toggle = useCallback(
    async (id: string) => {
      if (!user) {
        toast.error('You must be logged in to favorite snippets');
        return false;
      }

      try {
        setLoading(true);
        const isFavorite = await toggleFavorite(id, user.uid);
        toast.success(isFavorite ? 'Added to favorites' : 'Removed from favorites');
        return isFavorite;
      } catch (err) {
        toast.error('Failed to update favorite status');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return { toggle, loading };
}

// Hook for searching snippets
export function useSearchSnippets(query: string, filters: SnippetFilters = {}) {
  const { user } = useAuth();
  const [results, setResults] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function search() {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await searchSnippets(query, filters, { page: 1, limit: 20 }, user?.uid);
        setResults(result.snippets);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        toast.error('Search failed');
      } finally {
        setLoading(false);
      }
    }

    const debounceTimer = setTimeout(search, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, filters, user?.uid]);

  return { results, loading, error };
}

// Hook for user statistics
export function useUserStats(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.uid;
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!targetUserId) {
        setStats(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getUserSnippetStats(targetUserId);
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch user stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [targetUserId]);

  return { stats, loading };
}

// Hook for snippet versions
export function useSnippetVersions(snippetId: string) {
  const { user } = useAuth();
  const [versions, setVersions] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVersions() {
      if (!user || !snippetId) {
        setVersions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getSnippetVersions(snippetId, user.uid);
        setVersions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch versions');
        toast.error('Failed to load snippet versions');
      } finally {
        setLoading(false);
      }
    }

    fetchVersions();
  }, [snippetId, user]);

  return { versions, loading, error };
}

// Hook for copying snippets
export function useCopySnippet() {
  const [loading, setLoading] = useState(false);

  const copy = useCallback(async (snippet: Snippet) => {
    try {
      setLoading(true);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(snippet.content);
      
      // Increment copy count
      await incrementCopyCount(snippet.id);
      
      toast.success('Snippet copied to clipboard');
      return true;
    } catch (err) {
      toast.error('Failed to copy snippet');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { copy, loading };
}