import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import { apiClient } from '../../utils/api-client';

export default async function searchInteractive() {
  console.log(chalk.cyan('\n=== Search Snippets ===\n'));
  
  const { query, filters } = await inquirer.prompt([
    {
      type: 'input',
      name: 'query',
      message: 'Search query:',
      validate: (input) => input.trim().length > 0 || 'Please enter a search query'
    },
    {
      type: 'confirm',
      name: 'filters',
      message: 'Add filters?',
      default: false
    }
  ]);
  
  let language = '';
  let tags: string[] = [];
  
  if (filters) {
    const filterAnswers = await inquirer.prompt([
      {
        type: 'list',
        name: 'language',
        message: 'Filter by language:',
        choices: [
          { name: 'Any language', value: '' },
          'javascript', 'typescript', 'python', 'java', 'go',
          'rust', 'cpp', 'c', 'csharp', 'php', 'ruby',
          'swift', 'kotlin', 'sql', 'html', 'css'
        ]
      },
      {
        type: 'input',
        name: 'tags',
        message: 'Filter by tags (comma-separated):',
        filter: (input) => input.split(',').map((tag: string) => tag.trim()).filter(Boolean)
      }
    ]);
    
    language = filterAnswers.language;
    tags = filterAnswers.tags;
  }
  
  const spinner = ora('Searching...').start();
  
  try {
    const params = new URLSearchParams({ q: query, limit: '20' });
    if (language) params.append('language', language);
    tags.forEach(tag => params.append('tags', tag));
    
    const response = await apiClient.get(`/api/snippets/search?${params}`);
    spinner.stop();
    
    const results = response.data;
    
    if (results.length === 0) {
      console.log(chalk.yellow('\nNo snippets found matching your query.'));
      
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: 'Search again', value: 'search' },
            { name: 'Return to menu', value: 'menu' }
          ]
        }
      ]);
      
      if (action === 'search') {
        await searchInteractive();
      }
      return;
    }
    
    // Display results
    console.log(chalk.green(`\nFound ${results.length} snippets:\n`));
    
    const table = new Table({
      head: ['#', 'Title', 'Language', 'Author', 'Score'],
      style: { head: ['cyan'] },
      colWidths: [5, 45, 15, 20, 10]
    });
    
    results.forEach((snippet: any, index: number) => {
      table.push([
        (index + 1).toString(),
        snippet.title.slice(0, 43) + (snippet.title.length > 43 ? '..' : ''),
        snippet.language,
        snippet.author?.name || 'Unknown',
        snippet.score ? snippet.score.toFixed(2) : 'N/A'
      ]);
    });
    
    console.log(table.toString());
    
    // Actions
    const choices = results.map((snippet: any, index: number) => ({
      name: `View snippet #${index + 1}: ${snippet.title}`,
      value: snippet.id
    }));
    
    choices.push(
      new inquirer.Separator(),
      { name: '🔍 Search again', value: 'search' },
      { name: '↩ Return to menu', value: 'menu' }
    );
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Select a snippet to view:',
        choices
      }
    ]);
    
    if (action === 'search') {
      await searchInteractive();
    } else if (action !== 'menu') {
      const viewModule = await import('./view');
      await viewModule.default(action);
    }
    
  } catch (error: any) {
    spinner.fail('Search failed');
    console.error(chalk.red(error.message));
  }
}