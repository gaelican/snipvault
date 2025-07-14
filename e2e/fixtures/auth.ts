import { test as base } from '@playwright/test';

// Define custom fixtures
export const test = base.extend({
  // Authenticated page fixture
  authenticatedPage: async ({ page }, use) => {
    // Set up authentication state
    // In a real app, you'd set cookies or local storage
    await page.addInitScript(() => {
      // Mock authentication state
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          user_metadata: {
            username: 'testuser'
          }
        }
      }));
    });

    // Use the authenticated page
    await use(page);
  },

  // Test user data
  testUser: async ({}, use) => {
    const user = {
      email: 'test@example.com',
      password: 'Test123!@#',
      username: 'testuser',
    };
    await use(user);
  },
});

export { expect } from '@playwright/test';

// Helper functions for authentication
export async function login(page: any, email: string, password: string) {
  await page.goto('/login');
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');
  
  // Wait for redirect
  await page.waitForURL('/dashboard');
}

export async function logout(page: any) {
  await page.click('[data-testid="user-menu"]');
  await page.click('text=Sign out');
  await page.waitForURL('/');
}

export async function signup(page: any, email: string, password: string, username: string) {
  await page.goto('/signup');
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.fill('[name="username"]', username);
  await page.click('button[type="submit"]');
  
  // Wait for redirect or confirmation
  await page.waitForURL('/dashboard');
}