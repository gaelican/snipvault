import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import { apiClient } from '../../utils/api-client';
import { formatRelativeTime } from '../../utils/format';

export default async function listInteractive() {
  console.log(chalk.cyan('\n=== Your Snippets ===\n'));
  
  let page = 1;
  const limit = 10;
  
  while (true) {
    const spinner = ora('Loading snippets...').start();
    
    try {
      const response = await apiClient.get(`/api/snippets?page=${page}&limit=${limit}`);
      spinner.stop();
      
      const { snippets, total, totalPages } = response.data;
      
      if (snippets.length === 0) {
        console.log(chalk.yellow('No snippets found.'));
        break;
      }
      
      // Display snippets in a table
      const table = new Table({
        head: ['#', 'Title', 'Language', 'Tags', 'Created'],
        style: { head: ['cyan'] },
        colWidths: [5, 40, 15, 30, 20]
      });
      
      snippets.forEach((snippet: any, index: number) => {
        table.push([
          ((page - 1) * limit + index + 1).toString(),
          snippet.title.slice(0, 38) + (snippet.title.length > 38 ? '..' : ''),
          snippet.language,
          snippet.tags.slice(0, 3).join(', ') + (snippet.tags.length > 3 ? '...' : ''),
          formatRelativeTime(snippet.createdAt)
        ]);
      });
      
      console.log(table.toString());
      console.log(chalk.gray(`\nPage ${page} of ${totalPages} (${total} total snippets)`));
      
      // Pagination and actions
      const choices = [];
      
      snippets.forEach((snippet: any, index: number) => {
        choices.push({
          name: `View snippet #${(page - 1) * limit + index + 1}`,
          value: `view:${snippet.id}`
        });
      });
      
      choices.push(new inquirer.Separator());
      
      if (page > 1) choices.push({ name: '← Previous page', value: 'prev' });
      if (page < totalPages) choices.push({ name: '→ Next page', value: 'next' });
      
      choices.push(
        { name: '🔍 Search snippets', value: 'search' },
        { name: '↩ Return to menu', value: 'menu' }
      );
      
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'Select an action:',
          choices
        }
      ]);
      
      if (action === 'menu') {
        break;
      } else if (action === 'prev') {
        page--;
      } else if (action === 'next') {
        page++;
      } else if (action === 'search') {
        const searchModule = await import('./search');
        await searchModule.default();
        break;
      } else if (action.startsWith('view:')) {
        const snippetId = action.split(':')[1];
        await viewSnippet(snippetId);
      }
      
    } catch (error: any) {
      spinner.fail('Failed to load snippets');
      console.error(chalk.red(error.message));
      break;
    }
  }
}

async function viewSnippet(id: string) {
  const viewModule = await import('./view');
  await viewModule.default(id);
}