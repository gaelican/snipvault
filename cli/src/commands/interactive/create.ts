import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { apiClient } from '../../utils/api-client';

export default async function createInteractive() {
  console.log(chalk.cyan('\n=== Create New Snippet ===\n'));
  
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'source',
      message: 'How would you like to create the snippet?',
      choices: [
        { name: 'From a file', value: 'file' },
        { name: 'Write in editor', value: 'editor' },
        { name: 'Paste content', value: 'paste' }
      ]
    }
  ]);
  
  let content = '';
  let suggestedTitle = '';
  let detectedLanguage = '';
  
  if (answers.source === 'file') {
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
    
    content = await fs.readFile(filePath, 'utf-8');
    suggestedTitle = path.basename(filePath);
    const ext = path.extname(filePath).slice(1);
    detectedLanguage = ext || 'plaintext';
    
  } else if (answers.source === 'editor') {
    const { editor } = await inquirer.prompt([
      {
        type: 'editor',
        name: 'editor',
        message: 'Write your snippet (save and close editor when done):'
      }
    ]);
    content = editor;
    
  } else {
    console.log(chalk.gray('Paste your code (press Ctrl+D when done):'));
    
    // Read from stdin
    content = await new Promise<string>((resolve) => {
      let data = '';
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', chunk => data += chunk);
      process.stdin.on('end', () => resolve(data.trim()));
      process.stdin.resume();
    });
  }
  
  if (!content) {
    console.error(chalk.red('No content provided'));
    return;
  }
  
  // Get snippet details
  const details = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Title:',
      default: suggestedTitle,
      validate: (input) => input.trim().length > 0 || 'Title is required'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description (optional):'
    },
    {
      type: 'list',
      name: 'language',
      message: 'Language:',
      default: detectedLanguage,
      choices: [
        'javascript', 'typescript', 'python', 'java', 'go',
        'rust', 'cpp', 'c', 'csharp', 'php', 'ruby',
        'swift', 'kotlin', 'sql', 'html', 'css', 'plaintext'
      ]
    },
    {
      type: 'input',
      name: 'tags',
      message: 'Tags (comma-separated):',
      filter: (input) => input.split(',').map((tag: string) => tag.trim()).filter(Boolean)
    },
    {
      type: 'confirm',
      name: 'isPrivate',
      message: 'Make this snippet private?',
      default: false
    }
  ]);
  
  const spinner = ora('Creating snippet...').start();
  
  try {
    const response = await apiClient.post('/api/snippets', {
      title: details.title,
      description: details.description,
      content,
      language: details.language,
      tags: details.tags,
      isPrivate: details.isPrivate
    });
    
    spinner.succeed('Snippet created successfully!');
    console.log(chalk.green(`\nSnippet ID: ${response.data.id}`));
    console.log(chalk.gray(`URL: ${process.env.SNIPVAULT_URL || 'https://snipvault.com'}/snippet/${response.data.id}`));
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do next?',
        choices: [
          { name: 'View snippet', value: 'view' },
          { name: 'Create another', value: 'create' },
          { name: 'Return to menu', value: 'menu' }
        ]
      }
    ]);
    
    if (action === 'view') {
      const viewModule = await import('./view');
      await viewModule.default(response.data.id);
    } else if (action === 'create') {
      await createInteractive();
    }
    
  } catch (error: any) {
    spinner.fail('Failed to create snippet');
    console.error(chalk.red(error.message));
  }
}