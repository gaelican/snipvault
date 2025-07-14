import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import { apiClient } from '../../utils/api-client';

export default async function explainInteractive() {
  console.log(chalk.cyan('\n=== AI Code Explanation ===\n'));
  
  const { source } = await inquirer.prompt([
    {
      type: 'list',
      name: 'source',
      message: 'Select code to explain:',
      choices: [
        { name: 'From a file', value: 'file' },
        { name: 'Paste code', value: 'paste' },
        { name: 'From a snippet ID', value: 'snippet' }
      ]
    }
  ]);
  
  let code = '';
  let language = '';
  let filename = '';
  
  if (source === 'file') {
    const { filePath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'filePath',
        message: 'Enter file path:',
        validate: async (input) => {
          try {
            await fs.access(input);
            return true;
          } catch {
            return 'File not found';
          }
        }
      }
    ]);
    
    code = await fs.readFile(filePath, 'utf-8');
    filename = path.basename(filePath);
    const ext = path.extname(filePath).slice(1);
    language = ext || 'plaintext';
    
  } else if (source === 'paste') {
    console.log(chalk.gray('Paste your code (press Ctrl+D when done):'));
    
    code = await new Promise<string>((resolve) => {
      let data = '';
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', chunk => data += chunk);
      process.stdin.on('end', () => resolve(data.trim()));
      process.stdin.resume();
    });
    
    const { lang } = await inquirer.prompt([
      {
        type: 'list',
        name: 'lang',
        message: 'Select language:',
        choices: [
          'javascript', 'typescript', 'python', 'java', 'go',
          'rust', 'cpp', 'c', 'csharp', 'php', 'ruby',
          'swift', 'kotlin', 'sql', 'plaintext'
        ]
      }
    ]);
    language = lang;
    
  } else {
    const { snippetId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'snippetId',
        message: 'Enter snippet ID:',
        validate: (input) => input.trim().length > 0 || 'Snippet ID is required'
      }
    ]);
    
    const spinner = ora('Fetching snippet...').start();
    
    try {
      const response = await apiClient.get(`/api/snippets/${snippetId}`);
      spinner.stop();
      code = response.data.content;
      language = response.data.language;
      filename = response.data.title;
    } catch (error: any) {
      spinner.fail('Failed to fetch snippet');
      console.error(chalk.red(error.message));
      return;
    }
  }
  
  if (!code) {
    console.error(chalk.red('No code provided'));
    return;
  }
  
  // Get explanation options
  const { detailed, focus } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'detailed',
      message: 'Would you like a detailed explanation?',
      default: true
    },
    {
      type: 'list',
      name: 'focus',
      message: 'Focus area:',
      choices: [
        { name: 'General explanation', value: '' },
        { name: 'Security analysis', value: 'security' },
        { name: 'Performance analysis', value: 'performance' },
        { name: 'Bug detection', value: 'bugs' },
        { name: 'Best practices', value: 'best-practices' }
      ]
    }
  ]);
  
  const spinner = ora('Analyzing code...').start();
  
  try {
    const response = await apiClient.post('/api/ai/explain', {
      code,
      language,
      detailed,
      focus: focus || undefined
    });
    
    spinner.stop();
    
    const { explanation, summary, suggestions, complexity } = response.data;
    
    console.log(chalk.cyan(`\n=== Code Analysis${filename ? ` for ${filename}` : ''} ===\n`));
    
    if (summary) {
      console.log(chalk.yellow('Summary:'));
      console.log(chalk.white(summary));
      console.log();
    }
    
    console.log(chalk.yellow('Explanation:'));
    console.log(chalk.white(explanation));
    
    if (complexity) {
      console.log(chalk.yellow('\nComplexity Analysis:'));
      if (complexity.cyclomatic) {
        console.log(chalk.white(`  Cyclomatic Complexity: ${complexity.cyclomatic}`));
      }
      if (complexity.cognitive) {
        console.log(chalk.white(`  Cognitive Complexity: ${complexity.cognitive}`));
      }
      if (complexity.lines) {
        console.log(chalk.white(`  Lines of Code: ${complexity.lines}`));
      }
    }
    
    if (suggestions && suggestions.length > 0) {
      console.log(chalk.yellow('\nSuggestions:'));
      suggestions.forEach((suggestion: string, index: number) => {
        console.log(chalk.white(`  ${index + 1}. ${suggestion}`));
      });
    }
    
    // Follow-up actions
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '\nWhat would you like to do next?',
        choices: [
          { name: 'Get improvement suggestions', value: 'improve' },
          { name: 'Explain another file', value: 'explain' },
          { name: 'Save explanation', value: 'save' },
          { name: 'Return to menu', value: 'menu' }
        ]
      }
    ]);
    
    if (action === 'improve') {
      console.log(chalk.yellow('\nFetching improvement suggestions...\n'));
      await improveCode(code, language);
    } else if (action === 'explain') {
      await explainInteractive();
    } else if (action === 'save') {
      await saveExplanation(explanation, summary, suggestions, filename);
    }
    
  } catch (error: any) {
    spinner.fail('Analysis failed');
    console.error(chalk.red(error.message));
  }
}

async function improveCode(code: string, language: string) {
  const spinner = ora('Generating improvements...').start();
  
  try {
    const response = await apiClient.post('/api/ai/improve', {
      code,
      language,
      focus: 'general'
    });
    
    spinner.stop();
    
    const { improvedCode, changes, explanation } = response.data;
    
    console.log(chalk.cyan('=== Suggested Improvements ===\n'));
    
    if (changes && changes.length > 0) {
      console.log(chalk.yellow('Changes:'));
      changes.forEach((change: string, index: number) => {
        console.log(chalk.white(`  ${index + 1}. ${change}`));
      });
      console.log();
    }
    
    if (explanation) {
      console.log(chalk.yellow('Explanation:'));
      console.log(chalk.white(explanation));
    }
    
  } catch (error: any) {
    spinner.fail('Failed to generate improvements');
    console.error(chalk.red(error.message));
  }
}

async function saveExplanation(
  explanation: string,
  summary: string | undefined,
  suggestions: string[] | undefined,
  filename: string
) {
  const { filepath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'filepath',
      message: 'Save explanation to file:',
      default: `${filename || 'code'}-explanation.md`,
      validate: (input) => input.trim().length > 0 || 'Filename is required'
    }
  ]);
  
  try {
    let content = `# Code Explanation\n\n`;
    
    if (filename) {
      content += `**File:** ${filename}\n\n`;
    }
    
    if (summary) {
      content += `## Summary\n\n${summary}\n\n`;
    }
    
    content += `## Detailed Explanation\n\n${explanation}\n\n`;
    
    if (suggestions && suggestions.length > 0) {
      content += `## Suggestions\n\n`;
      suggestions.forEach((suggestion, index) => {
        content += `${index + 1}. ${suggestion}\n`;
      });
    }
    
    await fs.writeFile(path.resolve(filepath), content);
    console.log(chalk.green(`\n✓ Explanation saved to: ${filepath}`));
    
  } catch (error: any) {
    console.error(chalk.red(`Failed to save file: ${error.message}`));
  }
}