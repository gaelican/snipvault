'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Copy, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SUPPORTED_LANGUAGES } from '@/lib/ai/types';
import { CodeBlock } from '@/components/ui/CodeBlock';

interface AISnippetGeneratorProps {
  onSave?: (snippet: {
    title: string;
    content: string;
    language: string;
    description: string;
  }) => void;
}

export function AISnippetGenerator({ onSave }: AISnippetGeneratorProps) {
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [context, setContext] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [usage, setUsage] = useState<{
    tokens: number;
    cost: number;
  } | null>(null);
  const [validation, setValidation] = useState<{
    valid: boolean;
    issues: string[];
  } | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    setIsGenerating(true);
    setGeneratedCode('');
    setUsage(null);
    setValidation(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`, // Replace with your auth logic
        },
        body: JSON.stringify({
          description,
          language,
          context: context.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate snippet');
      }

      setGeneratedCode(data.data.content);
      if (data.data.usage) {
        setUsage({
          tokens: data.data.usage.totalTokens,
          cost: data.data.cost || 0,
        });
      }
      if (data.data.validation) {
        setValidation(data.data.validation);
      }

      if (data.data.cached) {
        toast.success('Generated from cache');
      } else {
        toast.success('Snippet generated successfully');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate snippet');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success('Copied to clipboard');
  };

  const handleSave = () => {
    if (!generatedCode || !onSave) return;

    const title = description.split(' ').slice(0, 5).join(' ');
    onSave({
      title,
      content: generatedCode,
      language,
      description,
    });
    toast.success('Snippet saved');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Snippet Generator
        </CardTitle>
        <CardDescription>
          Generate code snippets from natural language descriptions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe what you want to create... (e.g., 'Function to validate email addresses using regex')"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Additional Context (Optional)</Label>
            <Textarea
              id="context"
              placeholder="Any specific requirements or constraints..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={1}
            />
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !description.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Snippet
            </>
          )}
        </Button>

        {generatedCode && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Generated Code</h3>
              <div className="flex items-center gap-2">
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                {onSave && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSave}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {validation && !validation.valid && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    Validation Issues
                  </p>
                  <ul className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1">
                    {validation.issues.map((issue, i) => (
                      <li key={i}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <CodeBlock
              code={generatedCode}
              language={language}
              showLineNumbers
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}