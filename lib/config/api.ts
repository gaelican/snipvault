export const API_CONFIG = {
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Rate limiting
  RATE_LIMITS: {
    CREATE_SNIPPET: {
      limit: 30,
      windowMs: 3600000 // 1 hour
    },
    UPDATE_SNIPPET: {
      limit: 60,
      windowMs: 3600000 // 1 hour
    },
    SEARCH: {
      limit: 30,
      windowMs: 60000 // 1 minute
    },
    GENERAL: {
      limit: 100,
      windowMs: 60000 // 1 minute
    }
  },
  
  // Content limits
  MAX_SNIPPET_SIZE: 100000, // 100KB
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_TAG_LENGTH: 30,
  MAX_TAGS_PER_SNIPPET: 10,
  
  // Search
  MAX_SEARCH_QUERY_LENGTH: 200,
  SEARCH_HIGHLIGHT_LENGTH: 200,
  MAX_SEARCH_HIGHLIGHTS: 3,
  
  // Caching
  CACHE_TTL: {
    PUBLIC_SNIPPET: 300, // 5 minutes
    SNIPPET_LIST: 60, // 1 minute
    SEARCH_RESULTS: 120, // 2 minutes
  },
  
  // Security
  ALLOWED_LANGUAGES: [
    'javascript',
    'typescript',
    'python',
    'java',
    'csharp',
    'cpp',
    'c',
    'go',
    'rust',
    'php',
    'ruby',
    'swift',
    'kotlin',
    'scala',
    'r',
    'matlab',
    'perl',
    'lua',
    'bash',
    'powershell',
    'sql',
    'html',
    'css',
    'scss',
    'sass',
    'less',
    'xml',
    'json',
    'yaml',
    'toml',
    'markdown',
    'dockerfile',
    'makefile',
    'cmake',
    'gradle',
    'maven',
    'plaintext'
  ],
  
  // Visibility defaults
  DEFAULT_VISIBILITY: 'public' as const,
  
  // Soft delete
  SOFT_DELETE_RETENTION_DAYS: 30,
  
  // API versioning
  API_VERSION: 'v1',
  
  // Error messages
  ERROR_MESSAGES: {
    UNAUTHORIZED: 'Authentication required',
    FORBIDDEN: 'You do not have permission to perform this action',
    NOT_FOUND: 'Resource not found',
    RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
    VALIDATION_FAILED: 'Invalid input data',
    INTERNAL_ERROR: 'An unexpected error occurred',
    SNIPPET_TOO_LARGE: 'Snippet content exceeds maximum allowed size',
    INVALID_LANGUAGE: 'Invalid programming language specified',
    TOO_MANY_TAGS: 'Too many tags specified',
  }
};

// Helper function to validate language
export function isValidLanguage(language: string): boolean {
  return API_CONFIG.ALLOWED_LANGUAGES.includes(language.toLowerCase());
}

// Helper function to get cache headers
export function getCacheHeaders(ttl: number): HeadersInit {
  return {
    'Cache-Control': `public, max-age=${ttl}, s-maxage=${ttl}`,
    'CDN-Cache-Control': `max-age=${ttl}`,
  };
}