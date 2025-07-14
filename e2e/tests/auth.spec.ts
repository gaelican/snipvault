import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check for login form elements
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    
    // Check for links
    await expect(page.getByText(/don't have an account/i)).toBeVisible();
    await expect(page.getByText(/forgot password/i)).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/login');
    await page.getByText(/don't have an account/i).click();
    
    await expect(page).toHaveURL('/signup');
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/login');
    await page.getByText(/forgot password/i).click();
    
    await expect(page).toHaveURL('/forgot-password');
    await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible();
  });

  test('should show validation errors for invalid login', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/login');
    
    // Enter invalid email
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show email validation error
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  test('should handle login error', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in credentials
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show error message (exact text depends on backend)
    await expect(page.getByText(/invalid credentials|incorrect password|user not found/i)).toBeVisible({
      timeout: 10000
    });
  });
});

test.describe('Signup Flow', () => {
  test('should display signup page', async ({ page }) => {
    await page.goto('/signup');
    
    // Check for signup form elements
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();
    
    // Check for login link
    await expect(page.getByText(/already have an account/i)).toBeVisible();
  });

  test('should validate password requirements', async ({ page }) => {
    await page.goto('/signup');
    
    // Enter weak password
    await page.getByLabel(/email/i).fill('newuser@example.com');
    await page.getByLabel(/password/i).fill('weak');
    await page.getByRole('button', { name: /sign up/i }).click();
    
    // Should show password validation error
    await expect(page.getByText(/password must be at least/i)).toBeVisible();
  });

  test('should navigate back to login', async ({ page }) => {
    await page.goto('/signup');
    await page.getByText(/already have an account/i).click();
    
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Password Reset Flow', () => {
  test('should display forgot password page', async ({ page }) => {
    await page.goto('/forgot-password');
    
    await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible();
    await expect(page.getByText(/remember your password/i)).toBeVisible();
  });

  test('should validate email on forgot password', async ({ page }) => {
    await page.goto('/forgot-password');
    
    // Try to submit with invalid email
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByRole('button', { name: /send reset link/i }).click();
    
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  test('should show success message after requesting reset', async ({ page }) => {
    await page.goto('/forgot-password');
    
    // Enter valid email
    await page.getByLabel(/email/i).fill('user@example.com');
    await page.getByRole('button', { name: /send reset link/i }).click();
    
    // Should show success message
    await expect(page.getByText(/check your email|reset link sent/i)).toBeVisible({
      timeout: 10000
    });
  });
});