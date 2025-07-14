import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import hljs from 'highlight.js';
import { apiClient } from '../utils/api-client';

export const aiCommand = new Command('ai')
  .description('AI-powered snippet generation and code explanation');

// Generate snippet with AI
aiCommand
  .command('generate <prompt>')
  .alias('gen')
  .description('Generate a code snippet using AI')
  .option('-l, --language <language>', 'programming language', 'javascript')
  .option('-s, --save', 'save generated snippet')
  .option('-t, --title <title>', 'snippet title (when saving)')
  .option('-o, --output <file>', 'save to file')
  .action(async (prompt, options) => {
    const spinner = ora('Generating code...').start();
    
    try {
      const response = await apiClient.post('/api/ai/generate', {
        prompt,
        language: options.language,
        framework: options.framework
      });
      
      spinner.stop();
      
      const { code, language, explanation } = response.data;
      const format = options.parent?.parent?.opts()?.format || 'table';
      
      if (format === 'json') {
        console.log(JSON.stringify(response.data, null, 2));
      } else if (format === 'raw') {
        console.log(code);
      } else {
        console.log(chalk.cyan('\n=== Generated Code ==='));
        console.log(chalk.gray(`Language: ${language}`));
        console.log();
        
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
          console.log(chalk.cyan('\n=== Explanation ==='));
          console.log(chalk.white(explanation));
        }
      }
      
      // Save to file if requested
      if (options.output) {
        await fs.writeFile(path.resolve(options.output), code);
        console.log(chalk.green(`\nCode saved to: ${options.output}`));
      }
      
      // Save as snippet if requested
      if (options.save) {
        const inquirer = (await import('inquirer')).default;
        
        const title = options.title || await inquirer.prompt([
          {
            type: 'input',
            name: 'title',
            message: 'Snippet title:',
            default: prompt.slice(0, 50)
          }
        ]).then(a => a.title);
        
        const saveSpinner = ora('Saving snippet...').start();
        
        const snippetResponse = await apiClient.post('/api/snippets', {
          title,
          description: `Generated from prompt: ${prompt}`,
          content: code,
          language,
          tags: ['ai-generated', language],
          isPrivate: false
        });
        
        saveSpinner.succeed('Snippet saved!');
        console.log(chalk.gray(`Snippet ID: ${snippetResponse.data.id}`));
      }
      
    } catch (error: any) {
      spinner.fail('Generation failed');
      console.error(chalk.red(error.response?.data?.message || error.message));
      process.exit(1);
    }
  });

// Explain code with AI
aiCommand
  .command('explain <file>')
  .alias('exp')
  .description('Get AI explanation for code')
  .option('-l, --language <language>', 'programming language (auto-detected if not specified)')
  .option('-d, --detailed', 'provide detailed explanation')
  .option('-f, --focus <aspect>', 'focus on specific aspect (security, performance, bugs)')
  .action(async (file, options) => {
    try {
      // Read file content
      const filePath = path.resolve(file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Auto-detect language from file extension
      let language = options.language;
      if (!language) {
        const ext = path.extname(filePath).slice(1);
        language = ext || 'plaintext';
      }
      
      const spinner = ora('Analyzing code...').start();
      
      const response = await apiClient.post('/api/ai/explain', {
        code: content,
        language,
        detailed: options.detailed,
        focus: options.focus
      });
      
      spinner.stop();
      
      const { explanation, summary, suggestions, complexity } = response.data;
      const format = options.parent?.parent?.opts()?.format || 'table';
      
      if (format === 'json') {
        console.log(JSON.stringify(response.data, null, 2));
      } else {
        console.log(chalk.cyan('\n=== Code Analysis ===\n'));
        
        if (summary) {
          console.log(chalk.yellow('Summary:'));
          console.log(chalk.white(summary));
          console.log();
        }
        
        console.log(chalk.yellow('Explanation:'));
        console.log(chalk.white(explanation));
        
        if (complexity) {
          console.log(chalk.yellow('\nComplexity Analysis:'));
          console.log(chalk.white(`  Cyclomatic Complexity: ${complexity.cyclomatic || 'N/A'}`));
          console.log(chalk.white(`  Cognitive Complexity: ${complexity.cognitive || 'N/A'}`));
        }
        
        if (suggestions && suggestions.length > 0) {
          console.log(chalk.yellow('\nSuggestions:'));
          suggestions.forEach((suggestion: string, index: number) => {
            console.log(chalk.white(`  ${index + 1}. ${suggestion}`));
          });
        }
      }
      
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.error(chalk.red(`Error: File not found: ${file}`));
      } else {
        console.error(chalk.red(error.response?.data?.message || error.message));
      }
      process.exit(1);
    }
  });

// Improve code with AI
aiCommand
  .command('improve <file>')
  .alias('imp')
  .description('Get AI suggestions to improve code')
  .option('-l, --language <language>', 'programming language (auto-detected if not specified)')
  .option('-f, --focus <aspect>', 'improvement focus (performance, readability, security, best-practices)')
  .option('-a, --apply', 'apply improvements and save to file')
  .option('-o, --output <file>', 'save improved code to different file')
  .action(async (file, options) => {
    try {
      // Read file content
      const filePath = path.resolve(file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Auto-detect language from file extension
      let language = options.language;
      if (!language) {
        const ext = path.extname(filePath).slice(1);
        language = ext || 'plaintext';
      }
      
      const spinner = ora('Analyzing code for improvements...').start();
      
      const response = await apiClient.post('/api/ai/improve', {
        code: content,
        language,
        focus: options.focus || 'general'
      });
      
      spinner.stop();
      
      const { improvedCode, changes, explanation } = response.data;
      const format = options.parent?.parent?.opts()?.format || 'table';
      
      if (format === 'json') {
        console.log(JSON.stringify(response.data, null, 2));
      } else {
        console.log(chalk.cyan('\n=== Code Improvements ===\n'));
        
        console.log(chalk.yellow('Changes Made:'));
        if (changes && changes.length > 0) {
          changes.forEach((change: string, index: number) => {
            console.log(chalk.white(`  ${index + 1}. ${change}`));
          });
        }
        
        if (explanation) {
          console.log(chalk.yellow('\nExplanation:'));
          console.log(chalk.white(explanation));
        }
        
        console.log(chalk.cyan('\n=== Improved Code ===\n'));
        
        // Syntax highlighting
        try {
          const highlighted = hljs.highlight(improvedCode, { language }).value;
          const colored = highlighted
            .replace(/<span class="hljs-keyword">(.*?)<\/span>/g, chalk.blue('$1'))
            .replace(/<span class="hljs-string">(.*?)<\/span>/g, chalk.green('$1'))
            .replace(/<span class="hljs-comment">(.*?)<\/span>/g, chalk.gray('$1'))
            .replace(/<span class="hljs-number">(.*?)<\/span>/g, chalk.yellow('$1'))
            .replace(/<span class="hljs-function">(.*?)<\/span>/g, chalk.cyan('$1'))
            .replace(/<[^>]+>/g, '');
          
          console.log(colored);
        } catch {
          console.log(improvedCode);
        }
      }
      
      // Save improved code if requested
      if (options.apply || options.output) {
        const inquirer = (await import('inquirer')).default;
        
        if (options.apply && !options.output) {
          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Overwrite ${file} with improved code?`,
              default: false
            }
          ]);
          
          if (!confirm) {
            console.log(chalk.yellow('\nImprovement cancelled.'));
            return;
          }
        }
        
        const outputPath = options.output ? path.resolve(options.output) : filePath;
        await fs.writeFile(outputPath, improvedCode);
        console.log(chalk.green(`\nImproved code saved to: ${outputPath}`));
      }
      
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.error(chalk.red(`Error: File not found: ${file}`));
      } else {
        console.error(chalk.red(error.response?.data?.message || error.message));
      }
      process.exit(1);
    }
  });

// AI usage statistics
aiCommand
  .command('usage')
  .description('Show AI usage statistics')
  .action(async () => {
    const spinner = ora('Fetching usage statistics...').start();
    
    try {
      const response = await apiClient.get('/api/ai/usage');
      spinner.stop();
      
      const { usage, limit, period } = response.data;
      const format = options.parent?.parent?.opts()?.format || 'table';
      
      if (format === 'json') {
        console.log(JSON.stringify(response.data, null, 2));
      } else {
        console.log(chalk.cyan('\n=== AI Usage Statistics ===\n'));
        console.log(chalk.white(`Period: ${period.start} to ${period.end}`));
        console.log(chalk.white(`Total Requests: ${usage.total}`));
        console.log(chalk.white(`Generations: ${usage.generations}`));
        console.log(chalk.white(`Explanations: ${usage.explanations}`));
        console.log(chalk.white(`Improvements: ${usage.improvements}`));
        console.log(chalk.white(`Tokens Used: ${usage.tokens}`));
        console.log();
        console.log(chalk.yellow(`Monthly Limit: ${limit.requests} requests`));
        console.log(chalk.yellow(`Remaining: ${limit.remaining} requests`));
        
        if (usage.total / limit.requests > 0.8) {
          console.log(chalk.red('\nWarning: You are approaching your monthly AI usage limit!'));
        }
      }
    } catch (error: any) {
      spinner.fail('Failed to fetch usage statistics');
      console.error(chalk.red(error.response?.data?.message || error.message));
      process.exit(1);
    }
  });