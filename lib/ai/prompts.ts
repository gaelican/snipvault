// Optimized prompts for different AI operations

export const PROMPTS = {
  generateSnippet: (description: string, language: string, context?: string) => ({
    system: `You are an expert programmer specializing in ${language}. Generate clean, efficient, and well-commented code snippets based on user descriptions. Follow best practices and modern conventions for ${language}.`,
    user: `Generate a ${language} code snippet for: ${description}${context ? `\n\nAdditional context: ${context}` : ''}

Requirements:
1. Use modern ${language} syntax and best practices
2. Include helpful comments explaining key parts
3. Make the code production-ready and reusable
4. Handle edge cases where appropriate
5. Follow common naming conventions

Return ONLY the code snippet without any additional explanation or markdown formatting.`,
  }),

  explainCode: (code: string, language: string) => ({
    system: `You are a patient and thorough programming teacher. Explain code in simple terms that beginners can understand while also providing insights that experienced developers would appreciate.`,
    user: `Explain this ${language} code in detail:

\`\`\`${language}
${code}
\`\`\`

Please provide:
1. A high-level overview of what the code does
2. Step-by-step explanation of how it works
3. Key concepts or patterns used
4. Potential use cases
5. Any important considerations or caveats

Use clear, simple language and avoid jargon where possible.`,
  }),

  improveCode: (code: string, language: string, requirements?: string) => ({
    system: `You are a senior code reviewer with expertise in ${language}. Analyze code for improvements in performance, readability, maintainability, and adherence to best practices.`,
    user: `Review and suggest improvements for this ${language} code:

\`\`\`${language}
${code}
\`\`\`
${requirements ? `\nSpecific requirements: ${requirements}` : ''}

Please analyze the code and provide:
1. Identified issues or areas for improvement
2. Specific suggestions with explanations
3. Refactored version of the code
4. Performance considerations
5. Security considerations (if applicable)

Format your response with clear sections for each point.`,
  }),

  // Specialized prompts for common snippet types
  generateAPI: (description: string, framework: string) => ({
    system: `You are an expert in building RESTful APIs with ${framework}. Generate clean, secure, and scalable API endpoints following REST conventions and best practices.`,
    user: `Create a ${framework} API endpoint for: ${description}

Include:
1. Proper HTTP methods and status codes
2. Input validation
3. Error handling
4. Basic security considerations
5. Clear response formats

Return only the code implementation.`,
  }),

  generateAlgorithm: (problem: string, language: string, constraints?: string) => ({
    system: `You are an algorithm expert. Create efficient and well-documented algorithmic solutions.`,
    user: `Implement an algorithm in ${language} to solve: ${problem}
${constraints ? `\nConstraints: ${constraints}` : ''}

Requirements:
1. Optimize for time and space complexity
2. Include complexity analysis in comments
3. Handle edge cases
4. Add example usage
5. Use clear variable names

Return only the code implementation with comments.`,
  }),

  generateTest: (code: string, framework: string) => ({
    system: `You are a testing expert specializing in ${framework}. Write comprehensive test cases that ensure code quality and catch edge cases.`,
    user: `Write unit tests for this code using ${framework}:

\`\`\`
${code}
\`\`\`

Include:
1. Happy path tests
2. Edge case tests
3. Error handling tests
4. Descriptive test names
5. Proper test setup and teardown if needed

Return only the test code.`,
  }),

  convertCode: (code: string, fromLang: string, toLang: string) => ({
    system: `You are an expert in both ${fromLang} and ${toLang}. Convert code while maintaining functionality and following target language conventions.`,
    user: `Convert this ${fromLang} code to ${toLang}:

\`\`\`${fromLang}
${code}
\`\`\`

Requirements:
1. Maintain exact functionality
2. Use idiomatic ${toLang} patterns
3. Preserve comments (translated if necessary)
4. Follow ${toLang} naming conventions
5. Add language-specific optimizations where appropriate

Return only the converted code.`,
  }),

  documentCode: (code: string, language: string, style?: 'jsdoc' | 'docstring' | 'javadoc' | 'xmldoc') => ({
    system: `You are a documentation expert. Create clear, comprehensive documentation that helps developers understand and use code effectively.`,
    user: `Add comprehensive documentation to this ${language} code using ${style || 'standard'} format:

\`\`\`${language}
${code}
\`\`\`

Include:
1. Function/class descriptions
2. Parameter documentation with types
3. Return value documentation
4. Usage examples
5. Any important notes or warnings

Return the code with documentation added.`,
  }),
};

// Helper function to create a cache key for requests
export function createCacheKey(operation: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);
  
  return `${operation}:${JSON.stringify(sortedParams)}`;
}

// Language detection helper
export function detectLanguage(code: string): string {
  // Simple heuristic-based language detection
  const patterns = {
    javascript: /\b(const|let|var|function|=>|async|await)\b/,
    typescript: /\b(interface|type|enum|implements|namespace)\b/,
    python: /\b(def|import|from|class|if __name__|print\()\b/,
    java: /\b(public|private|protected|class|interface|extends|implements)\b.*{/,
    cpp: /\b(#include|using namespace|int main|std::)\b/,
    csharp: /\b(using|namespace|public class|static void Main)\b/,
    go: /\b(package|func|import|var|type struct)\b/,
    rust: /\b(fn|let mut|impl|pub|use|struct|match)\b/,
    ruby: /\b(def|end|class|module|require|puts)\b/,
    php: /(<\?php|\$\w+|function|echo|require_once)/,
    swift: /\b(func|var|let|class|struct|import|protocol)\b/,
    kotlin: /\b(fun|val|var|class|object|companion)\b/,
  };

  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(code)) {
      return lang;
    }
  }

  return 'plaintext';
}

// Validate generated code
export function validateGeneratedCode(code: string, language: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Basic validation rules
  if (!code || code.trim().length === 0) {
    issues.push('Generated code is empty');
  }
  
  if (code.includes('```')) {
    issues.push('Code contains markdown formatting');
  }
  
  // Language-specific validation
  switch (language.toLowerCase()) {
    case 'javascript':
    case 'typescript':
      if (code.match(/\b(var)\b/) && !code.match(/\b(let|const)\b/)) {
        issues.push('Consider using let/const instead of var');
      }
      break;
    case 'python':
      if (!code.match(/^(def|class|import|from|\w+\s*=)/m)) {
        issues.push('Code might be missing proper Python structure');
      }
      break;
  }
  
  return {
    valid: issues.length === 0,
    issues,
  };
}