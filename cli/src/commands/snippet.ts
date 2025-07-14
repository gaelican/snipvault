import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import Table from 'cli-table3';
import hljs from 'highlight.js';
import { apiClient } from '../utils/api-client';
import { formatOutput } from '../utils/format';

export const snippetCommand = new Command('snippet')
  .description('Snippet management commands');

// Create snippet command
snippetCommand
  .command('create <file>')
  .alias('new')
  .description('Create a new snippet from a file')
  .option('-t, --title <title>', 'snippet title')
  .option('-d, --description <description>', 'snippet description')
  .option('-l, --language <language>', 'programming language')
  .option('--tags <tags>', 'comma-separated tags')
  .option('-p, --private', 'make snippet private', false)
  .action(async (file, options) => {
    const inquirer = (await import('inquirer')).default;
    
    try {
      // Read file content
      const filePath = path.resolve(file);
      const content = await fs.readFile(filePath, 'utf-8');
      const fileName = path.basename(filePath);
      
      // Detect language from file extension if not provided
      let language = options.language;
      if (!language) {
        const ext = path.extname(fileName).slice(1);
        language = ext || 'plaintext';
      }
      
      // Prompt for missing information
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'title',
          message: 'Snippet title:',
          default: fileName,
          when: !options.title
        },
        {
          type: 'input',
          name: 'description',
          message: 'Description (optional):',
          when: !options.description
        },
        {
          type: 'input',
          name: 'tags',
          message: 'Tags (comma-separated):',
          when: !options.tags,
          filter: (input) => input.split(',').map((tag: string) => tag.trim()).filter(Boolean)
        }
      ]);
      
      const spinner = ora('Creating snippet...').start();
      
      const snippetData = {
        title: options.title || answers.title,
        description: options.description || answers.description || '',
        content,
        language,
        tags: options.tags ? options.tags.split(',').map((t: string) => t.trim()) : (answers.tags || []),
        isPrivate: options.private
      };
      
      const response = await apiClient.post('/api/snippets', snippetData);
      
      spinner.succeed('Snippet created successfully!');
      console.log(chalk.green(`\nSnippet ID: ${response.data.id}`));
      console.log(chalk.cyan(`Title: ${response.data.title}`));
      console.log(chalk.gray(`URL: ${process.env.SNIPVAULT_URL || 'https://snipvault.com'}/snippet/${response.data.id}`));
      
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// List snippets command
snippetCommand
  .command('list')
  .alias('ls')
  .description('List your snippets')
  .option('-l, --limit <limit>', 'number of snippets to show', '20')
  .option('-p, --page <page>', 'page number', '1')
  .option('--private', 'show only private snippets')
  .option('--public', 'show only public snippets')
  .action(async (options) => {
    const spinner = ora('Fetching snippets...').start();
    
    try {
      const params = new URLSearchParams({
        limit: options.limit,
        page: options.page
      });
      
      if (options.private) params.append('visibility', 'private');
      if (options.public) params.append('visibility', 'public');
      
      const response = await apiClient.get(`/api/snippets?${params}`);
      spinner.stop();
      
      const format = options.parent?.opts()?.format || 'table';
      
      if (format === 'json') {
        console.log(JSON.stringify(response.data, null, 2));
      } else if (format === 'raw') {
        response.data.snippets.forEach((snippet: any) => {
          console.log(`${snippet.id}\t${snippet.title}\t${snippet.language}\t${snippet.createdAt}`);
        });
      } else {
        if (response.data.snippets.length === 0) {
          console.log(chalk.yellow('No snippets found.'));
          return;
        }
        
        const table = new Table({
          head: ['ID', 'Title', 'Language', 'Tags', 'Private', 'Created'],
          style: { head: ['cyan'] }
        });
        
        response.data.snippets.forEach((snippet: any) => {
          table.push([
            snippet.id.slice(0, 8),
            snippet.title.slice(0, 30) + (snippet.title.length > 30 ? '...' : ''),
            snippet.language,
            snippet.tags.slice(0, 3).join(', ') + (snippet.tags.length > 3 ? '...' : ''),
            snippet.isPrivate ? 'Yes' : 'No',
            new Date(snippet.createdAt).toLocaleDateString()
          ]);
        });
        
        console.log(table.toString());
        console.log(chalk.gray(`\nShowing ${response.data.snippets.length} of ${response.data.total} snippets`));
      }
    } catch (error: any) {
      spinner.fail('Failed to fetch snippets');
      console.error(chalk.red(error.response?.data?.message || error.message));
      process.exit(1);
    }
  });

// Search snippets command
snippetCommand
  .command('search <query>')
  .alias('find')
  .description('Search for snippets')
  .option('-l, --language <language>', 'filter by language')
  .option('-t, --tags <tags>', 'filter by tags (comma-separated)')
  .option('--limit <limit>', 'number of results', '10')
  .action(async (query, options) => {
    const spinner = ora('Searching snippets...').start();
    
    try {
      const params = new URLSearchParams({
        q: query,
        limit: options.limit
      });
      
      if (options.language) params.append('language', options.language);
      if (options.tags) {
        options.tags.split(',').forEach((tag: string) => {
          params.append('tags', tag.trim());
        });
      }
      
      const response = await apiClient.get(`/api/snippets/search?${params}`);
      spinner.stop();
      
      const format = options.parent?.opts()?.format || 'table';
      
      if (format === 'json') {
        console.log(JSON.stringify(response.data, null, 2));
      } else {
        if (response.data.length === 0) {
          console.log(chalk.yellow('No snippets found matching your query.'));
          return;
        }
        
        const table = new Table({
          head: ['ID', 'Title', 'Language', 'Score', 'Author'],
          style: { head: ['cyan'] }
        });
        
        response.data.forEach((snippet: any) => {
          table.push([
            snippet.id.slice(0, 8),
            snippet.title.slice(0, 40) + (snippet.title.length > 40 ? '...' : ''),
            snippet.language,
            snippet.score ? snippet.score.toFixed(2) : 'N/A',
            snippet.author?.name || 'Unknown'
          ]);
        });
        
        console.log(table.toString());
        console.log(chalk.gray(`\nFound ${response.data.length} snippets`));
      }
    } catch (error: any) {
      spinner.fail('Search failed');
      console.error(chalk.red(error.response?.data?.message || error.message));
      process.exit(1);
    }
  });

// Get snippet by ID
snippetCommand
  .command('get <id>')
  .alias('show')
  .description('Get a snippet by ID')
  .option('-c, --copy', 'copy snippet to clipboard')
  .option('--no-highlight', 'disable syntax highlighting')
  .action(async (id, options) => {
    const spinner = ora('Fetching snippet...').start();
    
    try {
      const response = await apiClient.get(`/api/snippets/${id}`);
      spinner.stop();
      
      const snippet = response.data;
      const format = options.parent?.opts()?.format || 'table';
      
      if (format === 'json') {
        console.log(JSON.stringify(snippet, null, 2));
      } else if (format === 'raw') {
        console.log(snippet.content);
      } else {
        // Display snippet information
        console.log(chalk.cyan('\n=== Snippet Details ==='));
        console.log(chalk.white(`Title: ${snippet.title}`));
        console.log(chalk.white(`Language: ${snippet.language}`));
        console.log(chalk.white(`Description: ${snippet.description || 'N/A'}`));
        console.log(chalk.white(`Tags: ${snippet.tags.join(', ') || 'None'}`));
        console.log(chalk.white(`Author: ${snippet.author?.name || 'Unknown'}`));
        console.log(chalk.white(`Created: ${new Date(snippet.createdAt).toLocaleString()}`));
        console.log(chalk.white(`Updated: ${new Date(snippet.updatedAt).toLocaleString()}`));
        
        console.log(chalk.cyan('\n=== Code ===\n'));
        
        // Syntax highlighting
        if (options.highlight !== false && snippet.language !== 'plaintext') {
          try {
            const highlighted = hljs.highlight(snippet.content, { language: snippet.language }).value;
            // Simple ANSI coloring for terminal
            const colored = highlighted
              .replace(/<span class="hljs-keyword">(.*?)<\/span>/g, chalk.blue('$1'))
              .replace(/<span class="hljs-string">(.*?)<\/span>/g, chalk.green('$1'))
              .replace(/<span class="hljs-comment">(.*?)<\/span>/g, chalk.gray('$1'))
              .replace(/<span class="hljs-number">(.*?)<\/span>/g, chalk.yellow('$1'))
              .replace(/<span class="hljs-function">(.*?)<\/span>/g, chalk.cyan('$1'))
              .replace(/<[^>]+>/g, ''); // Remove remaining HTML tags
            
            console.log(colored);
          } catch {
            console.log(snippet.content);
          }
        } else {
          console.log(snippet.content);
        }
      }
      
      // Copy to clipboard if requested
      if (options.copy) {
        try {
          const clipboardy = await import('clipboardy');
          await clipboardy.default.write(snippet.content);
          console.log(chalk.green('\nSnippet copied to clipboard!'));
        } catch {
          console.log(chalk.yellow('\nCould not copy to clipboard (clipboardy not installed)'));
        }
      }
    } catch (error: any) {
      spinner.fail('Failed to fetch snippet');
      console.error(chalk.red(error.response?.data?.message || error.message));
      process.exit(1);
    }
  });

// Delete snippet
snippetCommand
  .command('delete <id>')
  .alias('rm')
  .description('Delete a snippet')
  .option('-f, --force', 'skip confirmation')
  .action(async (id, options) => {
    const inquirer = (await import('inquirer')).default;
    
    if (!options.force) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Are you sure you want to delete this snippet?',
          default: false
        }
      ]);
      
      if (!confirm) {
        console.log(chalk.yellow('Deletion cancelled.'));
        return;
      }
    }
    
    const spinner = ora('Deleting snippet...').start();
    
    try {
      await apiClient.delete(`/api/snippets/${id}`);
      spinner.succeed('Snippet deleted successfully!');
    } catch (error: any) {
      spinner.fail('Failed to delete snippet');
      console.error(chalk.red(error.response?.data?.message || error.message));
      process.exit(1);
    }
  });

// Update snippet
snippetCommand
  .command('update <id>')
  .alias('edit')
  .description('Update a snippet')
  .option('-t, --title <title>', 'new title')
  .option('-d, --description <description>', 'new description')
  .option('-c, --content <file>', 'update content from file')
  .option('--tags <tags>', 'new tags (comma-separated)')
  .option('--add-tags <tags>', 'add tags (comma-separated)')
  .option('--remove-tags <tags>', 'remove tags (comma-separated)')
  .action(async (id, options) => {
    const spinner = ora('Updating snippet...').start();
    
    try {
      const updateData: any = {};
      
      if (options.title) updateData.title = options.title;
      if (options.description) updateData.description = options.description;
      
      if (options.content) {
        const content = await fs.readFile(path.resolve(options.content), 'utf-8');
        updateData.content = content;
      }
      
      if (options.tags) {
        updateData.tags = options.tags.split(',').map((t: string) => t.trim());
      }
      
      // Handle tag additions/removals
      if (options.addTags || options.removeTags) {
        // First get current tags
        const currentSnippet = await apiClient.get(`/api/snippets/${id}`);
        let tags = currentSnippet.data.tags || [];
        
        if (options.addTags) {
          const newTags = options.addTags.split(',').map((t: string) => t.trim());
          tags = [...new Set([...tags, ...newTags])];
        }
        
        if (options.removeTags) {
          const removeTags = options.removeTags.split(',').map((t: string) => t.trim());
          tags = tags.filter((t: string) => !removeTags.includes(t));
        }
        
        updateData.tags = tags;
      }
      
      const response = await apiClient.patch(`/api/snippets/${id}`, updateData);
      spinner.succeed('Snippet updated successfully!');
      
      console.log(chalk.green(`\nUpdated snippet: ${response.data.title}`));
    } catch (error: any) {
      spinner.fail('Failed to update snippet');
      console.error(chalk.red(error.response?.data?.message || error.message));
      process.exit(1);
    }
  });