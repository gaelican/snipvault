import chalk from 'chalk';
import ora from 'ora';
import hljs from 'highlight.js';
import inquirer from 'inquirer';
import { apiClient } from '../../utils/api-client';
import { formatRelativeTime } from '../../utils/format';

export default async function viewSnippet(id: string) {
  const spinner = ora('Loading snippet...').start();
  
  try {
    const response = await apiClient.get(`/api/snippets/${id}`);
    spinner.stop();
    
    const snippet = response.data;
    
    console.log(chalk.cyan('\n=== Snippet Details ===\n'));
    console.log(chalk.white(`Title: ${chalk.bold(snippet.title)}`));
    console.log(chalk.white(`Language: ${snippet.language}`));
    console.log(chalk.white(`Description: ${snippet.description || chalk.gray('No description')}`));
    console.log(chalk.white(`Tags: ${snippet.tags.length > 0 ? snippet.tags.join(', ') : chalk.gray('No tags')}`));
    console.log(chalk.white(`Author: ${snippet.author?.name || 'Unknown'}`));
    console.log(chalk.white(`Visibility: ${snippet.isPrivate ? chalk.red('Private') : chalk.green('Public')}`));
    console.log(chalk.white(`Created: ${formatRelativeTime(snippet.createdAt)} (${new Date(snippet.createdAt).toLocaleDateString()})`));
    console.log(chalk.white(`Updated: ${formatRelativeTime(snippet.updatedAt)} (${new Date(snippet.updatedAt).toLocaleDateString()})`));
    
    if (snippet.stats) {
      console.log(chalk.white(`Views: ${snippet.stats.views || 0}`));
      console.log(chalk.white(`Likes: ${snippet.stats.likes || 0}`));
    }
    
    console.log(chalk.cyan('\n=== Code ===\n'));
    
    // Syntax highlighting
    if (snippet.language !== 'plaintext') {
      try {
        const highlighted = hljs.highlight(snippet.content, { language: snippet.language }).value;
        const colored = highlighted
          .replace(/<span class="hljs-keyword">(.*?)<\/span>/g, chalk.blue('$1'))
          .replace(/<span class="hljs-string">(.*?)<\/span>/g, chalk.green('$1'))
          .replace(/<span class="hljs-comment">(.*?)<\/span>/g, chalk.gray('$1'))
          .replace(/<span class="hljs-number">(.*?)<\/span>/g, chalk.yellow('$1'))
          .replace(/<span class="hljs-function">(.*?)<\/span>/g, chalk.cyan('$1'))
          .replace(/<[^>]+>/g, '');
        
        console.log(colored);
      } catch {
        console.log(snippet.content);
      }
    } else {
      console.log(snippet.content);
    }
    
    // Actions menu
    const choices = [
      { name: 'Copy to clipboard', value: 'copy' },
      { name: 'Save to file', value: 'save' },
      { name: 'Get AI explanation', value: 'explain' }
    ];
    
    // Add edit/delete options if user owns the snippet
    if (snippet.isOwner) {
      choices.push(
        { name: 'Edit snippet', value: 'edit' },
        { name: 'Delete snippet', value: 'delete' }
      );
    }
    
    choices.push(
      new inquirer.Separator(),
      { name: 'View another snippet', value: 'another' },
      { name: 'Return to menu', value: 'menu' }
    );
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '\nWhat would you like to do?',
        choices
      }
    ]);
    
    switch (action) {
      case 'copy':
        try {
          const clipboardy = await import('clipboardy');
          await clipboardy.default.write(snippet.content);
          console.log(chalk.green('\n✓ Snippet copied to clipboard!'));
        } catch {
          console.log(chalk.yellow('\nCould not copy to clipboard (clipboardy not installed)'));
        }
        break;
        
      case 'save':
        await saveSnippetToFile(snippet);
        break;
        
      case 'explain':
        await explainSnippet(snippet);
        break;
        
      case 'edit':
        await editSnippet(snippet);
        break;
        
      case 'delete':
        await deleteSnippet(snippet.id);
        break;
        
      case 'another':
        const { snippetId } = await inquirer.prompt([
          {
            type: 'input',
            name: 'snippetId',
            message: 'Enter snippet ID:',
            validate: (input) => input.trim().length > 0 || 'Snippet ID is required'
          }
        ]);
        await viewSnippet(snippetId);
        break;
    }
    
  } catch (error: any) {
    spinner.fail('Failed to load snippet');
    console.error(chalk.red(error.message));
  }
}

async function saveSnippetToFile(snippet: any) {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  const { filename } = await inquirer.prompt([
    {
      type: 'input',
      name: 'filename',
      message: 'Save as:',
      default: `${snippet.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${getFileExtension(snippet.language)}`,
      validate: (input) => input.trim().length > 0 || 'Filename is required'
    }
  ]);
  
  try {
    const filePath = path.resolve(filename);
    await fs.writeFile(filePath, snippet.content);
    console.log(chalk.green(`\n✓ Snippet saved to: ${filePath}`));
  } catch (error: any) {
    console.error(chalk.red(`Failed to save file: ${error.message}`));
  }
}

async function explainSnippet(snippet: any) {
  console.log(chalk.yellow('\nGetting AI explanation...\n'));
  
  const explainModule = await import('./explain');
  // We'll simulate as if the code was pasted
  const originalStdin = process.stdin;
  
  // Create a mock stdin
  const { Readable } = await import('stream');
  const mockStdin = new Readable({
    read() {
      this.push(snippet.content);
      this.push(null);
    }
  });
  
  Object.defineProperty(process, 'stdin', {
    value: mockStdin,
    configurable: true
  });
  
  await explainModule.default();
  
  // Restore original stdin
  Object.defineProperty(process, 'stdin', {
    value: originalStdin,
    configurable: true
  });
}

async function editSnippet(snippet: any) {
  const { field } = await inquirer.prompt([
    {
      type: 'list',
      name: 'field',
      message: 'What would you like to edit?',
      choices: [
        { name: 'Title', value: 'title' },
        { name: 'Description', value: 'description' },
        { name: 'Tags', value: 'tags' },
        { name: 'Code content', value: 'content' },
        { name: 'Visibility', value: 'visibility' },
        { name: 'Cancel', value: 'cancel' }
      ]
    }
  ]);
  
  if (field === 'cancel') return;
  
  const updateData: any = {};
  
  switch (field) {
    case 'title':
      const { title } = await inquirer.prompt([
        {
          type: 'input',
          name: 'title',
          message: 'New title:',
          default: snippet.title,
          validate: (input) => input.trim().length > 0 || 'Title is required'
        }
      ]);
      updateData.title = title;
      break;
      
    case 'description':
      const { description } = await inquirer.prompt([
        {
          type: 'input',
          name: 'description',
          message: 'New description:',
          default: snippet.description
        }
      ]);
      updateData.description = description;
      break;
      
    case 'tags':
      const { tags } = await inquirer.prompt([
        {
          type: 'input',
          name: 'tags',
          message: 'Tags (comma-separated):',
          default: snippet.tags.join(', '),
          filter: (input) => input.split(',').map((tag: string) => tag.trim()).filter(Boolean)
        }
      ]);
      updateData.tags = tags;
      break;
      
    case 'content':
      const { content } = await inquirer.prompt([
        {
          type: 'editor',
          name: 'content',
          message: 'Edit code (save and close editor when done):',
          default: snippet.content
        }
      ]);
      updateData.content = content;
      break;
      
    case 'visibility':
      const { isPrivate } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'isPrivate',
          message: 'Make snippet private?',
          default: snippet.isPrivate
        }
      ]);
      updateData.isPrivate = isPrivate;
      break;
  }
  
  const spinner = ora('Updating snippet...').start();
  
  try {
    await apiClient.patch(`/api/snippets/${snippet.id}`, updateData);
    spinner.succeed('Snippet updated successfully!');
  } catch (error: any) {
    spinner.fail('Failed to update snippet');
    console.error(chalk.red(error.message));
  }
}

async function deleteSnippet(id: string) {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: chalk.red('Are you sure you want to delete this snippet?'),
      default: false
    }
  ]);
  
  if (!confirm) {
    console.log(chalk.yellow('Deletion cancelled.'));
    return;
  }
  
  const spinner = ora('Deleting snippet...').start();
  
  try {
    await apiClient.delete(`/api/snippets/${id}`);
    spinner.succeed('Snippet deleted successfully!');
  } catch (error: any) {
    spinner.fail('Failed to delete snippet');
    console.error(chalk.red(error.message));
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