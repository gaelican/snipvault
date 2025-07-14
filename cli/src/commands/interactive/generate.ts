import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import hljs from 'highlight.js';
import { apiClient } from '../../utils/api-client';

export default async function generateInteractive() {
  console.log(chalk.cyan('\n=== AI Code Generation ===\n'));
  
  const { prompt, language, advanced } = await inquirer.prompt([
    {
      type: 'input',
      name: 'prompt',
      message: 'Describe what you want to generate:',
      validate: (input) => input.trim().length > 10 || 'Please provide a detailed description'
    },
    {
      type: 'list',
      name: 'language',
      message: 'Programming language:',
      choices: [
        'javascript', 'typescript', 'python', 'java', 'go',
        'rust', 'cpp', 'c', 'csharp', 'php', 'ruby',
        'swift', 'kotlin', 'sql', 'html', 'css'
      ],
      default: 'javascript'
    },
    {
      type: 'confirm',
      name: 'advanced',
      message: 'Add advanced options?',
      default: false
    }
  ]);
  
  let framework = '';
  let style = '';
  
  if (advanced) {
    const advancedAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'framework',
        message: 'Framework/Library (optional):',
        when: ['javascript', 'typescript', 'python'].includes(language)
      },
      {
        type: 'list',
        name: 'style',
        message: 'Code style:',
        choices: [
          { name: 'Clean and simple', value: 'simple' },
          { name: 'Production-ready', value: 'production' },
          { name: 'With comments', value: 'commented' },
          { name: 'Minimal', value: 'minimal' }
        ],
        default: 'simple'
      }
    ]);
    
    framework = advancedAnswers.framework || '';
    style = advancedAnswers.style || 'simple';
  }
  
  const spinner = ora('Generating code...').start();
  
  try {
    const response = await apiClient.post('/api/ai/generate', {
      prompt,
      language,
      framework,
      style
    });
    
    spinner.stop();
    
    const { code, explanation } = response.data;
    
    console.log(chalk.cyan('\n=== Generated Code ===\n'));
    
    // Syntax highlighting
    try {
      const highlighted = hljs.highlight(code, { language }).value;
      const colored = highlighted
        .replace(/<span class="hljs-keyword">(.*?)<\/span>/g, chalk.blue('$1'))
        .replace(/<span class="hljs-string">(.*?)<\/span>/g, chalk.green('$1'))
        .replace(/<span class="hljs-comment">(.*?)<\/span>/g, chalk.gray('$1'))
        .replace(/<span class="hljs-number">(.*?)<\/span>/g, chalk.yellow('$1'))
        .replace(/<span class="hljs-function">(.*?)<\/span>/g, chalk.cyan('$1'))
        .replace(/<[^>]+>/g, '');
      
      console.log(colored);
    } catch {
      console.log(code);
    }
    
    if (explanation) {
      console.log(chalk.cyan('\n=== Explanation ===\n'));
      console.log(chalk.white(explanation));
    }
    
    // Actions
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Save as snippet', value: 'save' },
          { name: 'Save to file', value: 'file' },
          { name: 'Copy to clipboard', value: 'copy' },
          { name: 'Regenerate', value: 'regenerate' },
          { name: 'Generate something else', value: 'new' },
          { name: 'Return to menu', value: 'menu' }
        ]
      }
    ]);
    
    if (action === 'save') {
      await saveAsSnippet(code, language, prompt);
    } else if (action === 'file') {
      await saveToFile(code, language);
    } else if (action === 'copy') {
      try {
        const clipboardy = await import('clipboardy');
        await clipboardy.default.write(code);
        console.log(chalk.green('\n✓ Code copied to clipboard!'));
      } catch {
        console.log(chalk.yellow('\nCould not copy to clipboard (clipboardy not installed)'));
      }
    } else if (action === 'regenerate') {
      console.log(chalk.yellow('\nRegenerating with same prompt...\n'));
      await generateWithPrompt(prompt, language, framework, style);
    } else if (action === 'new') {
      await generateInteractive();
    }
    
  } catch (error: any) {
    spinner.fail('Generation failed');
    console.error(chalk.red(error.message));
  }
}

async function generateWithPrompt(prompt: string, language: string, framework: string, style: string) {
  const spinner = ora('Regenerating...').start();
  
  try {
    const response = await apiClient.post('/api/ai/generate', {
      prompt,
      language,
      framework,
      style
    });
    
    spinner.stop();
    // Display the regenerated code...
    // (Similar to above)
    
  } catch (error: any) {
    spinner.fail('Regeneration failed');
    console.error(chalk.red(error.message));
  }
}

async function saveAsSnippet(code: string, language: string, prompt: string) {
  const { title, description, tags, isPrivate } = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Snippet title:',
      default: prompt.slice(0, 50),
      validate: (input) => input.trim().length > 0 || 'Title is required'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description:',
      default: `AI generated: ${prompt}`
    },
    {
      type: 'input',
      name: 'tags',
      message: 'Tags (comma-separated):',
      default: `ai-generated,${language}`,
      filter: (input) => input.split(',').map((tag: string) => tag.trim()).filter(Boolean)
    },
    {
      type: 'confirm',
      name: 'isPrivate',
      message: 'Make snippet private?',
      default: false
    }
  ]);
  
  const spinner = ora('Saving snippet...').start();
  
  try {
    const response = await apiClient.post('/api/snippets', {
      title,
      description,
      content: code,
      language,
      tags,
      isPrivate
    });
    
    spinner.succeed('Snippet saved successfully!');
    console.log(chalk.green(`\nSnippet ID: ${response.data.id}`));
    
  } catch (error: any) {
    spinner.fail('Failed to save snippet');
    console.error(chalk.red(error.message));
  }
}

async function saveToFile(code: string, language: string) {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  const { filename } = await inquirer.prompt([
    {
      type: 'input',
      name: 'filename',
      message: 'Filename:',
      default: `generated.${getFileExtension(language)}`,
      validate: (input) => input.trim().length > 0 || 'Filename is required'
    }
  ]);
  
  try {
    const filePath = path.resolve(filename);
    await fs.writeFile(filePath, code);
    console.log(chalk.green(`\n✓ Code saved to: ${filePath}`));
  } catch (error: any) {
    console.error(chalk.red(`Failed to save file: ${error.message}`));
  }
}

function getFileExtension(language: string): string {
  const extensions: Record<string, string> = {
    javascript: 'js',
    typescript: 'ts',
    python: 'py',
    java: 'java',
    go: 'go',
    rust: 'rs',
    cpp: 'cpp',
    c: 'c',
    csharp: 'cs',
    php: 'php',
    ruby: 'rb',
    swift: 'swift',
    kotlin: 'kt',
    sql: 'sql',
    html: 'html',
    css: 'css'
  };
  
  return extensions[language] || 'txt';
}