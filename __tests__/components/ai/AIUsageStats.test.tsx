import React from 'react';
import { render, screen } from '@testing-library/react';
import { AIUsageStats } from '@/components/ai/AIUsageStats';

// Mock the progress component
jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: any) => (
    <div className={className} data-testid="progress" data-value={value}>
      {value}%
    </div>
  ),
}));

// Mock the card components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

describe('AIUsageStats', () => {
  const defaultProps = {
    used: 5000,
    limit: 10000,
    subscription: 'free' as const,
  };

  it('should render usage statistics', () => {
    render(<AIUsageStats {...defaultProps} />);

    expect(screen.getByText('AI Usage')).toBeInTheDocument();
    expect(screen.getByText('5,000 / 10,000 tokens')).toBeInTheDocument();
    expect(screen.getByText('50% used')).toBeInTheDocument();
  });

  it('should calculate percentage correctly', () => {
    render(<AIUsageStats {...defaultProps} />);

    const progress = screen.getByTestId('progress');
    expect(progress).toHaveAttribute('data-value', '50');
  });

  it('should show upgrade prompt for free tier', () => {
    render(<AIUsageStats {...defaultProps} />);

    expect(screen.getByText(/Upgrade to Pro/i)).toBeInTheDocument();
  });

  it('should not show upgrade prompt for pro tier', () => {
    render(<AIUsageStats {...defaultProps} subscription="pro" />);

    expect(screen.queryByText(/Upgrade to Pro/i)).not.toBeInTheDocument();
  });

  it('should handle 100% usage', () => {
    render(<AIUsageStats used={10000} limit={10000} subscription="free" />);

    expect(screen.getByText('100% used')).toBeInTheDocument();
    expect(screen.getByText(/limit reached/i)).toBeInTheDocument();
  });

  it('should handle over-usage', () => {
    render(<AIUsageStats used={12000} limit={10000} subscription="free" />);

    const progress = screen.getByTestId('progress');
    expect(progress).toHaveAttribute('data-value', '100');
    expect(screen.getByText('12,000 / 10,000 tokens')).toBeInTheDocument();
  });

  it('should format large numbers correctly', () => {
    render(<AIUsageStats used={1234567} limit={5000000} subscription="pro" />);

    expect(screen.getByText('1,234,567 / 5,000,000 tokens')).toBeInTheDocument();
  });

  it('should show warning when usage is above 80%', () => {
    render(<AIUsageStats used={8500} limit={10000} subscription="free" />);

    expect(screen.getByText(/85% of your limit/i)).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <AIUsageStats {...defaultProps} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should show different limits for different tiers', () => {
    const { rerender } = render(
      <AIUsageStats used={5000} limit={10000} subscription="free" />
    );
    expect(screen.getByText('5,000 / 10,000 tokens')).toBeInTheDocument();

    rerender(
      <AIUsageStats used={5000} limit={50000} subscription="pro" />
    );
    expect(screen.getByText('5,000 / 50,000 tokens')).toBeInTheDocument();

    rerender(
      <AIUsageStats used={5000} limit={200000} subscription="team" />
    );
    expect(screen.getByText('5,000 / 200,000 tokens')).toBeInTheDocument();
  });

  it('should handle zero usage', () => {
    render(<AIUsageStats used={0} limit={10000} subscription="free" />);

    expect(screen.getByText('0 / 10,000 tokens')).toBeInTheDocument();
    expect(screen.getByText('0% used')).toBeInTheDocument();
  });

  it('should show reset date information', () => {
    const resetDate = new Date();
    resetDate.setMonth(resetDate.getMonth() + 1);
    resetDate.setDate(1);

    render(<AIUsageStats {...defaultProps} resetDate={resetDate.toISOString()} />);

    expect(screen.getByText(/Resets on/i)).toBeInTheDocument();
  });
});