import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  QueryConstraint,
  DocumentSnapshot,
  serverTimestamp,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config';
import type { Snippet, SnippetFilters, PaginationParams } from '@/lib/types/snippet';

const SNIPPETS_COLLECTION = 'snippets';
const VERSIONS_COLLECTION = 'versions';

// Convert Firestore document to Snippet type
function docToSnippet(doc: DocumentSnapshot): Snippet {
  const data = doc.data();
  if (!data) throw new Error('Document data is undefined');
  
  return {
    id: doc.id,
    title: data.title,
    description: data.description,
    content: data.content,
    language: data.language,
    tags: data.tags || [],
    visibility: data.visibility || 'private',
    author: data.author,
    authorId: data.authorId,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    version: data.version || 1,
    parentId: data.parentId || null,
    isFavorite: data.isFavorite || false,
    viewCount: data.viewCount || 0,
    copyCount: data.copyCount || 0,
    teamId: data.teamId || null,
  };
}

// Create a new snippet
export async function createSnippet(
  data: Partial<Snippet>,
  userId: string
): Promise<Snippet> {
  const snippetData = {
    ...data,
    authorId: userId,
    author: data.author || 'Anonymous',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    version: 1,
    viewCount: 0,
    copyCount: 0,
    isFavorite: false,
  };

  const docRef = await addDoc(collection(db, SNIPPETS_COLLECTION), snippetData);
  const newDoc = await getDoc(docRef);
  
  return docToSnippet(newDoc);
}

// Get a single snippet by ID
export async function getSnippet(id: string, userId?: string): Promise<Snippet | null> {
  const docRef = doc(db, SNIPPETS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  const snippet = docToSnippet(docSnap);
  
  // Check access permissions
  if (snippet.visibility === 'private' && snippet.authorId !== userId) {
    return null;
  }
  
  // Increment view count
  if (userId && snippet.authorId !== userId) {
    await updateDoc(docRef, {
      viewCount: increment(1)
    });
  }
  
  return snippet;
}

// List snippets with filters and pagination
export async function listSnippets(
  filters: SnippetFilters = {},
  pagination: PaginationParams = { page: 1, limit: 20 },
  userId?: string
): Promise<{ snippets: Snippet[]; total: number; hasMore: boolean }> {
  const constraints: QueryConstraint[] = [];
  
  // Apply filters
  if (filters.authorId) {
    constraints.push(where('authorId', '==', filters.authorId));
  }
  
  if (filters.teamId) {
    constraints.push(where('teamId', '==', filters.teamId));
  }
  
  if (filters.language) {
    constraints.push(where('language', '==', filters.language));
  }
  
  if (filters.visibility) {
    constraints.push(where('visibility', '==', filters.visibility));
  } else if (!userId) {
    // Only show public snippets to non-authenticated users
    constraints.push(where('visibility', '==', 'public'));
  }
  
  if (filters.tags && filters.tags.length > 0) {
    constraints.push(where('tags', 'array-contains-any', filters.tags));
  }
  
  if (filters.isFavorite && userId) {
    constraints.push(where('authorId', '==', userId));
    constraints.push(where('isFavorite', '==', true));
  }
  
  // Add ordering
  const sortField = filters.sortBy || 'createdAt';
  const sortOrder = filters.sortOrder || 'desc';
  constraints.push(orderBy(sortField, sortOrder));
  
  // Add pagination
  constraints.push(limit(pagination.limit));
  
  // Create query
  const q = query(collection(db, SNIPPETS_COLLECTION), ...constraints);
  const snapshot = await getDocs(q);
  
  const snippets = snapshot.docs
    .map(doc => docToSnippet(doc))
    .filter(snippet => {
      // Additional client-side filtering for complex cases
      if (snippet.visibility === 'private' && snippet.authorId !== userId) {
        return false;
      }
      return true;
    });
  
  return {
    snippets,
    total: snippets.length,
    hasMore: snapshot.docs.length === pagination.limit,
  };
}

// Update a snippet
export async function updateSnippet(
  id: string,
  data: Partial<Snippet>,
  userId: string
): Promise<Snippet> {
  const docRef = doc(db, SNIPPETS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    throw new Error('Snippet not found');
  }
  
  const snippet = docToSnippet(docSnap);
  
  // Check permissions
  if (snippet.authorId !== userId) {
    throw new Error('Unauthorized');
  }
  
  // Create version before updating
  await createVersion(id, snippet);
  
  // Update snippet
  const updateData = {
    ...data,
    updatedAt: serverTimestamp(),
    version: increment(1),
  };
  
  await updateDoc(docRef, updateData);
  const updatedDoc = await getDoc(docRef);
  
  return docToSnippet(updatedDoc);
}

// Delete a snippet
export async function deleteSnippet(id: string, userId: string): Promise<void> {
  const docRef = doc(db, SNIPPETS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    throw new Error('Snippet not found');
  }
  
  const snippet = docToSnippet(docSnap);
  
  // Check permissions
  if (snippet.authorId !== userId) {
    throw new Error('Unauthorized');
  }
  
  // Delete snippet and its versions
  const batch = writeBatch(db);
  
  // Delete all versions
  const versionsQuery = query(
    collection(db, SNIPPETS_COLLECTION, id, VERSIONS_COLLECTION)
  );
  const versionsSnapshot = await getDocs(versionsQuery);
  versionsSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  // Delete the snippet
  batch.delete(docRef);
  
  await batch.commit();
}

// Toggle favorite status
export async function toggleFavorite(id: string, userId: string): Promise<boolean> {
  const docRef = doc(db, SNIPPETS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    throw new Error('Snippet not found');
  }
  
  const snippet = docToSnippet(docSnap);
  
  // Check permissions
  if (snippet.authorId !== userId) {
    throw new Error('Unauthorized');
  }
  
  const newFavoriteStatus = !snippet.isFavorite;
  
  await updateDoc(docRef, {
    isFavorite: newFavoriteStatus,
    updatedAt: serverTimestamp(),
  });
  
  return newFavoriteStatus;
}

// Search snippets
export async function searchSnippets(
  searchQuery: string,
  filters: SnippetFilters = {},
  pagination: PaginationParams = { page: 1, limit: 20 },
  userId?: string
): Promise<{ snippets: Snippet[]; total: number; hasMore: boolean }> {
  // Note: Full-text search in Firestore is limited.
  // For production, consider using Algolia or Elasticsearch
  
  // For now, we'll do a simple client-side search after fetching
  const result = await listSnippets(filters, { ...pagination, limit: 100 }, userId);
  
  const searchLower = searchQuery.toLowerCase();
  const filtered = result.snippets.filter(snippet => 
    snippet.title.toLowerCase().includes(searchLower) ||
    snippet.description?.toLowerCase().includes(searchLower) ||
    snippet.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
    snippet.content.toLowerCase().includes(searchLower)
  );
  
  // Apply pagination to filtered results
  const start = (pagination.page - 1) * pagination.limit;
  const end = start + pagination.limit;
  const paginated = filtered.slice(start, end);
  
  return {
    snippets: paginated,
    total: filtered.length,
    hasMore: filtered.length > end,
  };
}

// Create a version of a snippet
async function createVersion(snippetId: string, snippetData: Snippet): Promise<void> {
  const versionData = {
    ...snippetData,
    createdAt: serverTimestamp(),
    snippetId,
  };
  
  await addDoc(
    collection(db, SNIPPETS_COLLECTION, snippetId, VERSIONS_COLLECTION),
    versionData
  );
}

// Get snippet versions
export async function getSnippetVersions(
  snippetId: string,
  userId: string
): Promise<Snippet[]> {
  // First check if user has access to the snippet
  const snippet = await getSnippet(snippetId, userId);
  if (!snippet) {
    throw new Error('Snippet not found or access denied');
  }
  
  const versionsQuery = query(
    collection(db, SNIPPETS_COLLECTION, snippetId, VERSIONS_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(versionsQuery);
  
  return snapshot.docs.map(doc => ({
    ...docToSnippet(doc),
    id: doc.id,
  }));
}

// Increment copy count
export async function incrementCopyCount(id: string): Promise<void> {
  const docRef = doc(db, SNIPPETS_COLLECTION, id);
  await updateDoc(docRef, {
    copyCount: increment(1),
  });
}

// Get user's snippet statistics
export async function getUserSnippetStats(userId: string): Promise<{
  total: number;
  public: number;
  private: number;
  totalViews: number;
  totalCopies: number;
}> {
  const q = query(
    collection(db, SNIPPETS_COLLECTION),
    where('authorId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  
  let stats = {
    total: 0,
    public: 0,
    private: 0,
    totalViews: 0,
    totalCopies: 0,
  };
  
  snapshot.docs.forEach(doc => {
    const snippet = docToSnippet(doc);
    stats.total++;
    if (snippet.visibility === 'public') {
      stats.public++;
    } else {
      stats.private++;
    }
    stats.totalViews += snippet.viewCount || 0;
    stats.totalCopies += snippet.copyCount || 0;
  });
  
  return stats;
}