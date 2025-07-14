import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';

// Mock providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      {children}
    </ThemeProvider>
  );
};

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
  avatar_url: null,
  created_at: '2024-01-01T00:00:00Z',
  subscription_tier: 'free',
  ...overrides,
});

export const createMockSnippet = (overrides = {}) => ({
  id: 'snippet-123',
  user_id: 'user-123',
  title: 'Test Snippet',
  description: 'A test snippet',
  code: 'console.log("Hello World");',
  language: 'javascript',
  tags: ['test', 'example'],
  visibility: 'public',
  view_count: 0,
  like_count: 0,
  fork_count: 0,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockTeam = (overrides = {}) => ({
  id: 'team-123',
  name: 'Test Team',
  owner_id: 'user-123',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockSubscription = (overrides = {}) => ({
  id: 'sub-123',
  user_id: 'user-123',
  stripe_customer_id: 'cus_123',
  stripe_subscription_id: 'sub_123',
  plan_id: 'pro',
  status: 'active',
  current_period_end: '2024-12-31T00:00:00Z',
  ...overrides,
});

// Mock API responses
export const mockApiResponse = <T>(data: T, options = {}) => ({
  ok: true,
  json: async () => data,
  ...options,
});

export const mockApiError = (message: string, status = 400) => ({
  ok: false,
  status,
  json: async () => ({ error: message }),
});

// Wait utilities
export const waitForLoadingToFinish = () => 
  screen.findByText((content, element) => {
    return element?.tagName.toLowerCase() !== 'script' && content !== '';
  });

// Mock router
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

// Mock Supabase client
export const createMockSupabaseClient = () => ({
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: createMockUser() }, error: null }),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    updateUser: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
  })),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      download: jest.fn(),
      remove: jest.fn(),
      getPublicUrl: jest.fn(),
    })),
  },
});

// Test IDs for common elements
export const testIds = {
  snippetCard: 'snippet-card',
  codeEditor: 'code-editor',
  searchInput: 'search-input',
  createButton: 'create-button',
  deleteButton: 'delete-button',
  loading: 'loading',
  error: 'error',
};