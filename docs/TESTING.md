# Testing Guide for SnipVault

## Overview

SnipVault uses a comprehensive testing strategy with unit tests, integration tests, and end-to-end tests to ensure code quality and reliability.

## Testing Stack

- **Unit Testing**: Jest + React Testing Library
- **Integration Testing**: Jest with API mocking
- **E2E Testing**: Playwright
- **Coverage Reporting**: Jest coverage + Codecov

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- snippets.test.ts

# Run tests matching pattern
npm run test -- --testNamePattern="should create snippet"
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run specific E2E test
npm run test:e2e -- auth.spec.ts

# Run E2E tests in headed mode
npm run test:e2e -- --headed
```

## Test Structure

```
__tests__/
├── components/        # React component tests
│   ├── ai/           # AI component tests
│   ├── auth/         # Auth component tests
│   ├── billing/      # Billing component tests
│   └── snippets/     # Snippet component tests
├── lib/              # Library function tests
│   ├── api/          # API client tests
│   ├── db/           # Database query tests
│   └── validations/  # Schema validation tests
└── test-utils.tsx    # Test utilities and helpers

e2e/
├── tests/            # E2E test files
├── fixtures/         # Test fixtures and helpers
└── playwright.config.ts
```

## Writing Tests

### Unit Test Example

```typescript
// __tests__/lib/validations/snippet.test.ts
import { createSnippetSchema } from '@/lib/validations/snippet';

describe('createSnippetSchema', () => {
  it('should validate a valid snippet', () => {
    const validSnippet = {
      title: 'My Snippet',
      content: 'console.log("Hello");',
      language: 'javascript',
    };

    const result = createSnippetSchema.parse(validSnippet);
    expect(result).toEqual(expect.objectContaining(validSnippet));
  });

  it('should fail with empty title', () => {
    const invalidSnippet = {
      title: '',
      content: 'console.log("Hello");',
      language: 'javascript',
    };

    expect(() => createSnippetSchema.parse(invalidSnippet)).toThrow();
  });
});
```

### Component Test Example

```typescript
// __tests__/components/snippets/SnippetCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SnippetCard } from '@/components/snippets/SnippetCard';
import { createMockSnippet } from '@/__tests__/test-utils';

describe('SnippetCard', () => {
  const mockSnippet = createMockSnippet();

  it('should render snippet information', () => {
    render(<SnippetCard snippet={mockSnippet} />);
    
    expect(screen.getByText(mockSnippet.title)).toBeInTheDocument();
    expect(screen.getByText(mockSnippet.language)).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<SnippetCard snippet={mockSnippet} onClick={handleClick} />);
    
    fireEvent.click(screen.getByText(mockSnippet.title));
    expect(handleClick).toHaveBeenCalledWith(mockSnippet);
  });
});
```

### E2E Test Example

```typescript
// e2e/tests/snippets.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Snippet Management', () => {
  test('should create a new snippet', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click create button
    await page.click('button:has-text("Create Snippet")');
    
    // Fill form
    await page.fill('[name="title"]', 'E2E Test Snippet');
    await page.fill('[name="description"]', 'Created by E2E test');
    await page.selectOption('[name="language"]', 'javascript');
    
    // Submit
    await page.click('button:has-text("Save")');
    
    // Verify success
    await expect(page).toHaveURL(/\/snippets\/.+/);
    await expect(page.locator('h1')).toContainText('E2E Test Snippet');
  });
});
```

## Test Utilities

### Mock Data Factories

```typescript
import { createMockSnippet, createMockUser } from '@/__tests__/test-utils';

const snippet = createMockSnippet({
  title: 'Custom Title',
  language: 'python',
});

const user = createMockUser({
  email: 'custom@example.com',
});
```

### Custom Render

```typescript
import { render } from '@/__tests__/test-utils';

// Automatically wraps with providers
render(<MyComponent />);
```

## Testing Best Practices

### 1. Test Naming

Use descriptive test names that explain what is being tested:

```typescript
// Good
it('should display error message when login fails with invalid credentials')

// Bad
it('should work')
```

### 2. Arrange-Act-Assert

Structure tests with clear sections:

```typescript
it('should update snippet title', () => {
  // Arrange
  const snippet = createMockSnippet();
  const newTitle = 'Updated Title';
  
  // Act
  const result = updateSnippetTitle(snippet, newTitle);
  
  // Assert
  expect(result.title).toBe(newTitle);
});
```

### 3. Test Isolation

Each test should be independent:

```typescript
beforeEach(() => {
  // Reset mocks
  jest.clearAllMocks();
  
  // Reset database state
  cleanup();
});
```

### 4. Mock External Dependencies

```typescript
// Mock API calls
jest.mock('@/lib/api/snippets');

// Mock Supabase
jest.mock('@/lib/supabase/client');

// Mock Next.js router
jest.mock('next/navigation');
```

### 5. Test User Interactions

```typescript
const user = userEvent.setup();

await user.click(button);
await user.type(input, 'text');
await user.selectOptions(select, 'option');
```

## Coverage Goals

- **Overall Coverage**: Aim for 80%+
- **Critical Paths**: 100% coverage for:
  - Authentication flows
  - Payment processing
  - Data validation
  - API endpoints

## Continuous Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Pre-deployment

See `.github/workflows/ci.yml` for configuration.

## Debugging Tests

### Debug Unit Tests

```bash
# Run with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Run single test with console output
npm run test -- --verbose snippet.test.ts
```

### Debug E2E Tests

```bash
# Run with Playwright Inspector
npm run test:e2e -- --debug

# Run with headed browser
npm run test:e2e -- --headed

# Save trace on failure
npm run test:e2e -- --trace on-first-retry
```

## Common Testing Patterns

### Testing Async Code

```typescript
it('should fetch snippets', async () => {
  const snippets = await getSnippets();
  expect(snippets).toHaveLength(10);
});
```

### Testing Hooks

```typescript
import { renderHook } from '@testing-library/react';

it('should update state', () => {
  const { result } = renderHook(() => useSnippet('123'));
  
  expect(result.current.loading).toBe(true);
  
  // Wait for loading to complete
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });
});
```

### Testing API Routes

```typescript
it('should create snippet via API', async () => {
  const response = await fetch('/api/snippets', {
    method: 'POST',
    body: JSON.stringify({ title: 'Test' }),
  });
  
  expect(response.status).toBe(201);
  const data = await response.json();
  expect(data.title).toBe('Test');
});
```

## Troubleshooting

### Common Issues

1. **Module not found errors**
   - Check import paths
   - Verify tsconfig paths

2. **React act() warnings**
   - Wrap state updates in act()
   - Use waitFor for async updates

3. **Timeout errors**
   - Increase timeout for slow operations
   - Mock heavy operations

4. **Flaky E2E tests**
   - Add proper waits
   - Use stable selectors
   - Check for race conditions

### Getting Help

- Check test output for detailed errors
- Use `--verbose` flag for more information
- Review test logs in CI/CD
- Ask in project discussions