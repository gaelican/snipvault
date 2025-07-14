/**
 * Example usage of the SnipVault API
 * This file demonstrates how to use the client-side API functions
 */

import { 
  listSnippets, 
  getSnippet, 
  createSnippet, 
  updateSnippet, 
  deleteSnippet,
  searchSnippets,
  getSnippetVersions 
} from '@/lib/api/snippets';

// Example authentication token (in production, get this from your auth provider)
const authToken = 'your-auth-token';

async function exampleUsage() {
  try {
    // 1. List public snippets with pagination
    console.log('Listing public snippets...');
    const publicSnippets = await listSnippets({
      visibility: 'public',
      page: 1,
      limit: 10,
      sortBy: 'popularity',
      sortOrder: 'desc'
    });
    console.log(`Found ${publicSnippets.total} public snippets`);
    console.log(`Showing page ${publicSnippets.page} of ${publicSnippets.totalPages}`);

    // 2. Search for React-related snippets
    console.log('\\nSearching for React snippets...');
    const searchResults = await searchSnippets('useState useEffect', {
      language: 'javascript',
      tags: ['react'],
      limit: 5
    });
    console.log(`Found ${searchResults.total} matching snippets`);
    searchResults.data.forEach(snippet => {
      console.log(`- ${snippet.title} (${snippet.language})`);
      if (snippet.highlights) {
        console.log('  Highlights:', snippet.highlights[0]?.substring(0, 50) + '...');
      }
    });

    // 3. Create a new snippet (requires authentication)
    console.log('\\nCreating a new snippet...');
    const newSnippet = await createSnippet({
      title: 'Custom React Hook for Local Storage',
      description: 'A reusable hook to manage local storage state in React',
      content: `import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}`,
      language: 'typescript',
      tags: ['react', 'hooks', 'localstorage'],
      visibility: 'public'
    }, { token: authToken });
    console.log(`Created snippet: ${newSnippet.title} (ID: ${newSnippet.id})`);

    // 4. Get a single snippet
    console.log('\\nFetching snippet details...');
    const snippet = await getSnippet(newSnippet.id);
    console.log(`Title: ${snippet.title}`);
    console.log(`Language: ${snippet.language}`);
    console.log(`Tags: ${snippet.tags.join(', ')}`);
    console.log(`Views: ${snippet.viewCount}`);

    // 5. Update the snippet
    console.log('\\nUpdating snippet...');
    const updatedSnippet = await updateSnippet(newSnippet.id, {
      title: 'useLocalStorage - React Hook for Persistent State',
      tags: ['react', 'hooks', 'localstorage', 'typescript']
    }, { token: authToken });
    console.log(`Updated title: ${updatedSnippet.title}`);
    console.log(`Version: ${updatedSnippet.version}`);

    // 6. Get version history
    console.log('\\nFetching version history...');
    const versions = await getSnippetVersions(newSnippet.id, { token: authToken });
    console.log(`Current version: ${versions.currentVersion}`);
    console.log(`Total versions: ${versions.versions.length}`);
    versions.versions.forEach(v => {
      console.log(`- Version ${v.version}: ${v.createdAt} by ${v.createdBy}`);
    });

    // 7. Filter snippets by author
    console.log('\\nListing my snippets...');
    const mySnippets = await listSnippets({
      authorId: 'test-user-id', // Use actual user ID
      sortBy: 'updated_at',
      sortOrder: 'desc'
    }, { token: authToken });
    console.log(`You have ${mySnippets.total} snippets`);

    // 8. Delete the snippet (cleanup)
    console.log('\\nDeleting snippet...');
    const deleteResult = await deleteSnippet(newSnippet.id, { token: authToken });
    console.log(deleteResult.message);

  } catch (error) {
    console.error('API Error:', error);
  }
}

// Advanced examples

// Example: Implementing infinite scroll
async function infiniteScrollExample() {
  let page = 1;
  let hasMore = true;
  const allSnippets: any[] = [];

  while (hasMore) {
    const response = await listSnippets({
      page,
      limit: 20,
      visibility: 'public'
    });

    allSnippets.push(...response.data);
    hasMore = page < response.totalPages;
    page++;
  }

  console.log(`Loaded ${allSnippets.length} snippets`);
}

// Example: Search with debouncing
function createDebouncedSearch(delay = 300) {
  let timeoutId: NodeJS.Timeout;

  return (query: string) => {
    clearTimeout(timeoutId);
    
    return new Promise((resolve) => {
      timeoutId = setTimeout(async () => {
        const results = await searchSnippets(query);
        resolve(results);
      }, delay);
    });
  };
}

// Example: Batch operations
async function batchCreateSnippets(snippets: any[], token: string) {
  const results = await Promise.allSettled(
    snippets.map(snippet => createSnippet(snippet, { token }))
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  console.log(`Created ${successful} snippets, ${failed} failed`);
  return results;
}

// Export for use in other files
export {
  exampleUsage,
  infiniteScrollExample,
  createDebouncedSearch,
  batchCreateSnippets
};