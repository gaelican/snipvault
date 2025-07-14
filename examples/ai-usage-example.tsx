/**
 * Example: Using AI Features in SnipVault
 * 
 * This example demonstrates how to integrate the AI-powered features
 * into your SnipVault application.
 */

import { AISnippetGenerator } from '@/components/ai/AISnippetGenerator';
import { CodeExplainer } from '@/components/ai/CodeExplainer';
import { AIUsageStats } from '@/components/ai/AIUsageStats';
import { useAIGenerate, useAIExplain, useAIImprove } from '@/lib/ai/hooks';

// Example 1: AI Snippet Generator Component
function SnippetGeneratorExample() {
  const handleSaveSnippet = async (snippet: any) => {
    // Save the generated snippet to your database
    const response = await fetch('/api/snippets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({
        title: snippet.title,
        content: snippet.content,
        language: snippet.language,
        description: snippet.description,
        tags: ['ai-generated'],
      }),
    });

    if (response.ok) {
      console.log('Snippet saved successfully');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">AI Snippet Generator</h2>
      <AISnippetGenerator onSave={handleSaveSnippet} />
    </div>
  );
}

// Example 2: Code Explainer Component
function CodeExplainerExample() {
  const exampleCode = `
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  
  return [...quickSort(left), ...middle, ...quickSort(right)];
}`;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Code Explainer & Analyzer</h2>
      <CodeExplainer 
        initialCode={exampleCode} 
        initialLanguage="javascript" 
      />
    </div>
  );
}

// Example 3: Using AI Hooks Directly
function AIHooksExample() {
  const { generate, isLoading: isGenerating } = useAIGenerate({
    onSuccess: (data) => {
      console.log('Generated snippet:', data);
    },
  });

  const { explain, isLoading: isExplaining } = useAIExplain({
    onSuccess: (data) => {
      console.log('Code explanation:', data);
    },
  });

  const { improve, isLoading: isImproving } = useAIImprove({
    onSuccess: (data) => {
      console.log('Code improvements:', data);
    },
  });

  const handleGenerateExample = async () => {
    await generate({
      description: 'Create a debounce function in TypeScript',
      language: 'typescript',
      context: 'Should have proper type annotations',
    });
  };

  const handleExplainExample = async () => {
    await explain({
      code: 'const sum = (a, b) => a + b;',
      language: 'javascript',
    });
  };

  const handleImproveExample = async () => {
    await improve({
      code: 'function getData() { return fetch("/api/data").then(r => r.json()) }',
      language: 'javascript',
      requirements: 'Add error handling and async/await syntax',
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Using AI Hooks</h2>
      <div className="flex gap-4">
        <button 
          onClick={handleGenerateExample}
          disabled={isGenerating}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {isGenerating ? 'Generating...' : 'Generate Snippet'}
        </button>
        <button 
          onClick={handleExplainExample}
          disabled={isExplaining}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          {isExplaining ? 'Explaining...' : 'Explain Code'}
        </button>
        <button 
          onClick={handleImproveExample}
          disabled={isImproving}
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          {isImproving ? 'Analyzing...' : 'Improve Code'}
        </button>
      </div>
    </div>
  );
}

// Example 4: Streaming Response
function StreamingExample() {
  const [streamedContent, setStreamedContent] = useState('');
  
  const handleStreamGenerate = async () => {
    setStreamedContent('');
    
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({
        description: 'Create a React hook for fetching data',
        language: 'typescript',
        stream: true,
      }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                setStreamedContent(prev => prev + parsed.content);
              }
            } catch (e) {
              console.error('Failed to parse stream data:', e);
            }
          }
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Streaming Generation</h2>
      <button 
        onClick={handleStreamGenerate}
        className="px-4 py-2 bg-indigo-500 text-white rounded"
      >
        Generate with Streaming
      </button>
      {streamedContent && (
        <pre className="p-4 bg-gray-100 rounded overflow-x-auto">
          <code>{streamedContent}</code>
        </pre>
      )}
    </div>
  );
}

// Example 5: Usage Statistics
function UsageStatsExample() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">AI Usage Statistics</h2>
      <AIUsageStats />
    </div>
  );
}

// Main Example Page
export default function AIFeaturesExample() {
  return (
    <div className="container mx-auto p-8 space-y-12">
      <h1 className="text-4xl font-bold mb-8">AI Features Examples</h1>
      
      <SnippetGeneratorExample />
      <CodeExplainerExample />
      <AIHooksExample />
      <StreamingExample />
      <UsageStatsExample />
    </div>
  );
}