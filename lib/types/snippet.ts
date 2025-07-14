export interface Snippet {
  id: string;
  title: string;
  description?: string;
  content: string;
  language: string;
  tags: string[];
  visibility: 'public' | 'private' | 'unlisted' | 'team';
  authorId: string;
  teamId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  viewCount: number;
  likeCount: number;
  forkCount: number;
  version: number;
}

export interface SnippetVersion {
  id: string;
  snippetId: string;
  content: string;
  version: number;
  createdAt: Date;
  createdBy: string;
  changeDescription?: string;
}

export interface CreateSnippetInput {
  title: string;
  description?: string;
  content: string;
  language: string;
  tags?: string[];
  visibility?: 'public' | 'private' | 'unlisted' | 'team';
  teamId?: string | null;
}

export interface UpdateSnippetInput {
  title?: string;
  description?: string;
  content?: string;
  language?: string;
  tags?: string[];
  visibility?: 'public' | 'private' | 'unlisted' | 'team';
  teamId?: string | null;
}

export interface SnippetFilters {
  tags?: string[];
  language?: string;
  visibility?: 'public' | 'private' | 'unlisted' | 'team';
  authorId?: string;
  teamId?: string;
  includeDeleted?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'updated_at' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  query: string;
  filters?: SnippetFilters;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}