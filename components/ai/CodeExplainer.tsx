'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Loader2, Lightbulb, Code, BookOpen, Settings, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { SUPPORTED_LANGUAGES } from '@/lib/ai/types';
import { CodeBlock } from '@/components/ui/CodeBlock';

interface CodeExplainerProps {
  initialCode?: string;
  initialLanguage?: string;
}

interface Explanation {
  overview: string;
  stepByStep: string[];
  concepts: string[];
  useCases: string[];
  considerations: string[];
}

interface Improvement {
  issues: Array<{ type: string; description: string; severity: 'high' | 'medium' | 'low' }>;
  suggestions: Array<{ category: string; suggestion: string; explanation: string }>;
  improvedCode?: string;
  performanceNotes?: string[];
  securityNotes?: string[];
}

export function CodeExplainer({ initialCode = '', initialLanguage = '' }: CodeExplainerProps) {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage || 'auto');
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [improvement, setImprovement] = useState<Improvement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('explain');
  const [usage, setUsage] = useState<{
    tokens: number;
    cost: number;
  } | null>(null);

  const handleExplain = async () => {
    if (!code.trim()) {
      toast.error('Please provide code to explain');
      return;
    }

    setIsProcessing(true);
    setExplanation(null);
    setUsage(null);

    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`, // Replace with your auth logic
        },
        body: JSON.stringify({
          code,
          language: language === 'auto' ? undefined : language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to explain code');
      }

      setExplanation(data.data.content);
      if (data.data.usage) {
        setUsage({
          tokens: data.data.usage.totalTokens,
          cost: data.data.cost || 0,
        });
      }

      toast.success(data.data.cached ? 'Explanation retrieved from cache' : 'Code explained successfully');
    } catch (error: any) {
      console.error('Explain error:', error);
      toast.error(error.message || 'Failed to explain code');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImprove = async () => {
    if (!code.trim()) {
      toast.error('Please provide code to analyze');
      return;
    }

    setIsProcessing(true);
    setImprovement(null);
    setUsage(null);

    try {
      const response = await fetch('/api/ai/improve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          code,
          language: language === 'auto' ? undefined : language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze code');
      }

      setImprovement(data.data);
      if (data.data.usage) {
        setUsage({
          tokens: data.data.usage.totalTokens,
          cost: data.data.cost || 0,
        });
      }

      toast.success(data.data.cached ? 'Analysis retrieved from cache' : 'Code analyzed successfully');
    } catch (error: any) {
      console.error('Improve error:', error);
      toast.error(error.message || 'Failed to analyze code');
    } finally {
      setIsProcessing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'default';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Code Explainer & Analyzer
        </CardTitle>
        <CardDescription>
          Understand and improve your code with AI-powered insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">Code to Analyze</Label>
          <Textarea
            id="code"
            placeholder="Paste your code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={10}
            className="font-mono text-sm"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-detect</SelectItem>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {usage && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">
                {usage.tokens} tokens
              </Badge>
              <Badge variant="secondary">
                ${usage.cost.toFixed(4)}
              </Badge>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="explain">Explain</TabsTrigger>
            <TabsTrigger value="improve">Improve</TabsTrigger>
          </TabsList>

          <TabsContent value="explain" className="space-y-4">
            <Button
              onClick={handleExplain}
              disabled={isProcessing || !code.trim()}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Explaining...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Explain Code
                </>
              )}
            </Button>

            {explanation && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="flex items-center gap-2 text-sm font-medium">
                    <BookOpen className="h-4 w-4" />
                    Overview
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {explanation.overview}
                  </p>
                </div>

                {explanation.stepByStep.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="flex items-center gap-2 text-sm font-medium">
                      <Code className="h-4 w-4" />
                      How It Works
                    </h3>
                    <ol className="space-y-1 text-sm text-muted-foreground">
                      {explanation.stepByStep.map((step, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="font-medium">{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {explanation.concepts.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="flex items-center gap-2 text-sm font-medium">
                      <Lightbulb className="h-4 w-4" />
                      Key Concepts
                    </h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {explanation.concepts.map((concept, i) => (
                        <li key={i}>• {concept}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {explanation.useCases.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Use Cases</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {explanation.useCases.map((useCase, i) => (
                        <li key={i}>• {useCase}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {explanation.considerations.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="flex items-center gap-2 text-sm font-medium">
                      <AlertTriangle className="h-4 w-4" />
                      Considerations
                    </h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {explanation.considerations.map((consideration, i) => (
                        <li key={i}>• {consideration}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="improve" className="space-y-4">
            <Button
              onClick={handleImprove}
              disabled={isProcessing || !code.trim()}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Settings className="mr-2 h-4 w-4" />
                  Analyze & Improve
                </>
              )}
            </Button>

            {improvement && (
              <div className="space-y-4">
                {improvement.issues.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Issues Found</h3>
                    <div className="space-y-2">
                      {improvement.issues.map((issue, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                          <Badge variant={getSeverityBadge(issue.severity)} className="mt-0.5">
                            {issue.severity}
                          </Badge>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${getSeverityColor(issue.severity)}`}>
                              {issue.type}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {issue.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {improvement.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Suggestions</h3>
                    <div className="space-y-2">
                      {improvement.suggestions.map((suggestion, i) => (
                        <div key={i} className="p-3 rounded-md bg-muted/50">
                          <p className="text-sm font-medium">{suggestion.category}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {suggestion.suggestion}
                          </p>
                          {suggestion.explanation && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {suggestion.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {improvement.performanceNotes && improvement.performanceNotes.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Performance Notes</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {improvement.performanceNotes.map((note, i) => (
                        <li key={i}>• {note}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {improvement.securityNotes && improvement.securityNotes.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-red-600 dark:text-red-400">
                      Security Considerations
                    </h3>
                    <ul className="space-y-1 text-sm text-red-600 dark:text-red-400">
                      {improvement.securityNotes.map((note, i) => (
                        <li key={i}>• {note}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {improvement.improvedCode && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Improved Code</h3>
                    <CodeBlock
                      code={improvement.improvedCode}
                      language={language === 'auto' ? 'plaintext' : language}
                      showLineNumbers
                    />
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}