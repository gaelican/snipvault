import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SnippetCard } from '@/components/snippets/SnippetCard';
import { Snippet } from '@/lib/types/snippet';

// Mock the UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, onClick }: any) => (
    <div className={className} onClick={onClick}>{children}</div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardFooter: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardTitle: ({ children, className }: any) => (
    <h3 className={className}>{children}</h3>
  ),
  CardDescription: ({ children, className }: any) => (
    <p className={className}>{children}</p>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span className={`badge ${variant} ${className}`}>{children}</span>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

describe('SnippetCard', () => {
  const mockSnippet: Snippet = {
    id: '1',
    userId: 'user123',
    title: 'Test Snippet',
    description: 'This is a test snippet',
    code: 'console.log("Hello World");',
    language: 'javascript',
    tags: ['test', 'demo', 'javascript', 'example', 'tutorial'],
    visibility: 'public',
    viewCount: 42,
    likeCount: 10,
    forkCount: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  };

  it('should render snippet information correctly', () => {
    render(<SnippetCard snippet={mockSnippet} />);

    expect(screen.getByText('Test Snippet')).toBeInTheDocument();
    expect(screen.getByText('This is a test snippet')).toBeInTheDocument();
    expect(screen.getByText('javascript')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should render tags correctly', () => {
    render(<SnippetCard snippet={mockSnippet} />);

    // Should show first 3 tags
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('demo')).toBeInTheDocument();
    expect(screen.getByText('javascript')).toBeInTheDocument();
    
    // Should show +2 for remaining tags
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('should render visibility icon and text', () => {
    render(<SnippetCard snippet={mockSnippet} />);
    expect(screen.getByText('public')).toBeInTheDocument();
  });

  it('should render private visibility correctly', () => {
    const privateSnippet = { ...mockSnippet, visibility: 'private' as const };
    render(<SnippetCard snippet={privateSnippet} />);
    expect(screen.getByText('private')).toBeInTheDocument();
  });

  it('should render unlisted visibility correctly', () => {
    const unlistedSnippet = { ...mockSnippet, visibility: 'unlisted' as const };
    render(<SnippetCard snippet={unlistedSnippet} />);
    expect(screen.getByText('unlisted')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<SnippetCard snippet={mockSnippet} onClick={handleClick} />);

    const card = screen.getByText('Test Snippet').closest('div');
    fireEvent.click(card!);

    expect(handleClick).toHaveBeenCalledWith(mockSnippet);
  });

  it('should stop propagation on button clicks', () => {
    const handleClick = jest.fn();
    render(<SnippetCard snippet={mockSnippet} onClick={handleClick} />);

    // Click on view button
    const viewButton = screen.getByText('42').closest('button');
    fireEvent.click(viewButton!);

    // Card click handler should not be called
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should render without description', () => {
    const snippetWithoutDesc = { ...mockSnippet, description: undefined };
    render(<SnippetCard snippet={snippetWithoutDesc} />);

    expect(screen.getByText('Test Snippet')).toBeInTheDocument();
    expect(screen.queryByText('This is a test snippet')).not.toBeInTheDocument();
  });

  it('should format date correctly', () => {
    render(<SnippetCard snippet={mockSnippet} />);
    
    // The date should be formatted
    const dateElement = screen.getByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
    expect(dateElement).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <SnippetCard snippet={mockSnippet} className="custom-class" />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });

  it('should render different language colors', () => {
    const languages = [
      'javascript',
      'typescript',
      'python',
      'java',
      'go',
      'rust',
      'cpp',
      'csharp',
      'html',
      'css',
      'sql',
      'unknown',
    ];

    languages.forEach((language) => {
      const { container } = render(
        <SnippetCard snippet={{ ...mockSnippet, language }} />
      );
      
      // Check that language badge is rendered
      expect(screen.getByText(language)).toBeInTheDocument();
    });
  });

  it('should render with minimal tags', () => {
    const snippetWithFewTags = { ...mockSnippet, tags: ['test'] };
    render(<SnippetCard snippet={snippetWithFewTags} />);

    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.queryByText(/\+\d/)).not.toBeInTheDocument();
  });

  it('should render with no tags', () => {
    const snippetWithNoTags = { ...mockSnippet, tags: [] };
    const { container } = render(<SnippetCard snippet={snippetWithNoTags} />);

    // Should still render without errors
    expect(screen.getByText('Test Snippet')).toBeInTheDocument();
  });
});