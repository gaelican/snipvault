# Contributing to SnipVault

Thank you for your interest in contributing to SnipVault! We welcome contributions from the community and are grateful for any help you can provide.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- **Be respectful**: Treat everyone with respect. No harassment, discrimination, or inappropriate behavior.
- **Be collaborative**: Work together to resolve conflicts and assume good intentions.
- **Be inclusive**: Welcome newcomers and help them get started.
- **Be professional**: Keep discussions focused on the project and constructive.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/snipvault.git
   cd snipvault
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/original-owner/snipvault.git
   ```

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- A Supabase account (for backend development)
- An OpenAI API key (for AI features)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```

3. **Configure your local environment** in `.env.local`:
   ```env
   # Use your local Supabase instance or a development project
   NEXT_PUBLIC_SUPABASE_URL=your_dev_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_dev_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_dev_service_key
   
   # Development API keys
   OPENAI_API_KEY=your_openai_key
   
   # Use Stripe test keys
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

4. **Set up the database**:
   - Create a new Supabase project for development
   - Run migrations from `lib/supabase/schema.sql`
   - Apply additional migrations from `lib/supabase/migrations/`

5. **Start the development server**:
   ```bash
   npm run dev
   ```

### Development Tools

- **Type checking**: `npm run type-check`
- **Linting**: `npm run lint`
- **Testing**: `npm run test`
- **E2E Testing**: `npm run test:e2e`

## How to Contribute

### Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Create a new issue** with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, Node version)

### Suggesting Features

1. **Check existing feature requests**
2. **Create a new issue** with:
   - Clear problem statement
   - Proposed solution
   - Alternative solutions considered
   - Mockups or examples if applicable

### Contributing Code

1. **Find an issue** to work on:
   - Look for `good first issue` labels for beginners
   - Check `help wanted` for priority items
   - Comment on the issue to claim it

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

3. **Make your changes**:
   - Write clean, readable code
   - Follow the coding standards
   - Add tests for new functionality
   - Update documentation as needed

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature" # or "fix: resolve issue"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes (formatting, etc.)
   - `refactor:` Code refactoring
   - `test:` Test additions or changes
   - `chore:` Build process or auxiliary tool changes

## Pull Request Process

1. **Update your fork**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request**:
   - Use a clear, descriptive title
   - Reference related issues
   - Describe your changes
   - Include screenshots for UI changes
   - List any breaking changes

4. **PR Requirements**:
   - [ ] All tests pass
   - [ ] Code follows style guidelines
   - [ ] Documentation is updated
   - [ ] No TypeScript errors
   - [ ] Changes are tested locally

5. **Review Process**:
   - Maintainers will review your PR
   - Address feedback promptly
   - Keep the PR updated with main branch
   - Be patient and respectful

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Provide proper types (avoid `any`)
- Use interfaces for object shapes
- Export types from the same file

```typescript
// Good
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// Bad
const user: any = { id: '123', name: 'John' };
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use proper prop types

```typescript
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button className={`btn-${variant}`} onClick={onClick}>
      {label}
    </button>
  );
}
```

### File Organization

```
components/
  ComponentName/
    ComponentName.tsx      # Component implementation
    ComponentName.test.tsx # Component tests
    index.ts              # Export
```

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Functions**: camelCase (`getUserData()`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Files**: kebab-case for non-components (`api-utils.ts`)

### Code Style

- Use 2 spaces for indentation
- Maximum line length: 100 characters
- Use template literals for string concatenation
- Prefer `const` over `let`
- Use optional chaining (`?.`) and nullish coalescing (`??`)

## Testing Guidelines

### Unit Tests

Write tests for:
- Utility functions
- API clients
- Validation schemas
- React components

```typescript
// Example component test
describe('SnippetCard', () => {
  it('should render snippet title', () => {
    const snippet = { title: 'Test Snippet', ... };
    render(<SnippetCard snippet={snippet} />);
    expect(screen.getByText('Test Snippet')).toBeInTheDocument();
  });
});
```

### Integration Tests

Test interactions between components:

```typescript
// Example integration test
it('should create a new snippet', async () => {
  const user = userEvent.setup();
  render(<CreateSnippetDialog />);
  
  await user.click(screen.getByText('Create Snippet'));
  await user.type(screen.getByLabelText('Title'), 'My Snippet');
  await user.click(screen.getByText('Save'));
  
  expect(screen.getByText('Snippet created')).toBeInTheDocument();
});
```

### E2E Tests

Test complete user flows:

```typescript
// Example E2E test
test('user can create and share snippet', async ({ page }) => {
  await page.goto('/dashboard');
  await page.click('text=New Snippet');
  await page.fill('[name=title]', 'Shared Snippet');
  await page.click('text=Save');
  
  await expect(page).toHaveURL(/\/snippets\/.+/);
});
```

## Documentation

### Code Documentation

- Add JSDoc comments for complex functions
- Document component props
- Include examples where helpful

```typescript
/**
 * Formats a code snippet for display
 * @param code - The raw code string
 * @param language - Programming language for syntax highlighting
 * @returns Formatted code with syntax highlighting
 * @example
 * formatCode('console.log("Hello")', 'javascript')
 */
export function formatCode(code: string, language: string): string {
  // Implementation
}
```

### README Updates

Update README.md when:
- Adding new features
- Changing setup process
- Adding new dependencies
- Changing configuration

### API Documentation

Document new API endpoints in the code:

```typescript
/**
 * GET /api/snippets
 * 
 * List snippets with pagination and filtering
 * 
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 20)
 * - language: string (optional)
 * - tags: string[] (optional)
 * 
 * Response:
 * {
 *   data: Snippet[],
 *   pagination: { page, limit, total }
 * }
 */
```

## Community

### Getting Help

- Check the documentation first
- Search existing issues
- Ask in discussions
- Join our Discord (if available)

### Helping Others

- Answer questions in issues
- Review pull requests
- Improve documentation
- Share your experience

### Recognition

We appreciate all contributions! Contributors will be:
- Listed in the contributors section
- Mentioned in release notes
- Given credit in commit messages

## Development Tips

### Working with Supabase

- Use Supabase CLI for local development
- Test RLS policies thoroughly
- Use migrations for schema changes

### Working with AI Features

- Use minimal tokens during development
- Mock AI responses in tests
- Handle rate limits gracefully

### Performance Considerations

- Lazy load heavy components
- Optimize images with Next.js Image
- Use React.memo for expensive renders
- Profile performance regularly

## Release Process

1. **Version Bump**: Update version in `package.json`
2. **Changelog**: Update CHANGELOG.md
3. **Testing**: Ensure all tests pass
4. **Documentation**: Update relevant docs
5. **Tag Release**: Create Git tag
6. **Deploy**: Follow deployment guide

## Questions?

If you have questions about contributing:

1. Check existing documentation
2. Search closed issues
3. Ask in GitHub Discussions
4. Contact maintainers

Thank you for contributing to SnipVault! Your efforts help make this project better for everyone.