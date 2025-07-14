import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { getConfig, setConfig, getAllConfig, resetConfig } from '../utils/config';

export const configCommand = new Command('config')
  .description('Configure CLI settings');

// Get configuration value
configCommand
  .command('get [key]')
  .description('Get configuration value')
  .action((key) => {
    if (key) {
      const value = getConfig().get(key);
      if (value !== undefined) {
        console.log(value);
      } else {
        console.error(chalk.red(`Configuration key "${key}" not found`));
        process.exit(1);
      }
    } else {
      // Show all configuration
      const config = getAllConfig();
      const table = new Table({
        head: ['Key', 'Value'],
        style: { head: ['cyan'] }
      });
      
      Object.entries(config).forEach(([key, value]) => {
        // Hide sensitive values
        if (key === 'authToken' && value) {
          value = '***' + String(value).slice(-4);
        }
        table.push([key, String(value)]);
      });
      
      console.log(chalk.cyan('\n=== SnipVault CLI Configuration ===\n'));
      console.log(table.toString());
    }
  });

// Set configuration value
configCommand
  .command('set <key> <value>')
  .description('Set configuration value')
  .action((key, value) => {
    // Validate known configuration keys
    const validKeys = [
      'apiUrl',
      'defaultLanguage',
      'defaultVisibility',
      'outputFormat',
      'syntaxHighlight',
      'pageSize',
      'editor',
      'theme'
    ];
    
    if (!validKeys.includes(key) && key !== 'authToken') {
      console.warn(chalk.yellow(`Warning: "${key}" is not a recognized configuration key`));
    }
    
    // Parse boolean values
    if (value === 'true') value = true;
    if (value === 'false') value = false;
    
    // Parse number values
    if (!isNaN(Number(value))) value = Number(value);
    
    setConfig(key, value);
    console.log(chalk.green(`Configuration updated: ${key} = ${value}`));
  });

// Reset configuration
configCommand
  .command('reset [key]')
  .description('Reset configuration to defaults')
  .action(async (key) => {
    const inquirer = (await import('inquirer')).default;
    
    if (key) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Reset "${key}" to default value?`,
          default: true
        }
      ]);
      
      if (confirm) {
        resetConfig(key);
        console.log(chalk.green(`Configuration key "${key}" reset to default`));
      }
    } else {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Reset all configuration to defaults?',
          default: false
        }
      ]);
      
      if (confirm) {
        resetConfig();
        console.log(chalk.green('All configuration reset to defaults'));
      }
    }
  });

// List available configuration options
configCommand
  .command('list-options')
  .alias('options')
  .description('List available configuration options')
  .action(() => {
    const options = [
      {
        key: 'apiUrl',
        description: 'SnipVault API URL',
        default: 'https://api.snipvault.com',
        type: 'string'
      },
      {
        key: 'defaultLanguage',
        description: 'Default language for new snippets',
        default: 'javascript',
        type: 'string'
      },
      {
        key: 'defaultVisibility',
        description: 'Default visibility for new snippets',
        default: 'public',
        type: 'string',
        values: ['public', 'private']
      },
      {
        key: 'outputFormat',
        description: 'Default output format',
        default: 'table',
        type: 'string',
        values: ['table', 'json', 'raw']
      },
      {
        key: 'syntaxHighlight',
        description: 'Enable syntax highlighting',
        default: true,
        type: 'boolean'
      },
      {
        key: 'pageSize',
        description: 'Default page size for listings',
        default: 20,
        type: 'number'
      },
      {
        key: 'editor',
        description: 'Default editor for interactive mode',
        default: 'vim',
        type: 'string'
      },
      {
        key: 'theme',
        description: 'Color theme',
        default: 'default',
        type: 'string',
        values: ['default', 'dark', 'light']
      }
    ];
    
    const table = new Table({
      head: ['Key', 'Description', 'Type', 'Default', 'Values'],
      style: { head: ['cyan'] }
    });
    
    options.forEach(option => {
      table.push([
        option.key,
        option.description,
        option.type,
        String(option.default),
        option.values ? option.values.join(', ') : 'any'
      ]);
    });
    
    console.log(chalk.cyan('\n=== Available Configuration Options ===\n'));
    console.log(table.toString());
    console.log(chalk.gray('\nUse "snipvault config set <key> <value>" to change settings'));
  });

// Initialize configuration with setup wizard
configCommand
  .command('init')
  .description('Initialize configuration with setup wizard')
  .action(async () => {
    const inquirer = (await import('inquirer')).default;
    
    console.log(chalk.cyan('\n=== SnipVault CLI Setup Wizard ===\n'));
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiUrl',
        message: 'API URL:',
        default: getConfig().get('apiUrl') || 'https://api.snipvault.com',
        validate: (input) => {
          try {
            new URL(input);
            return true;
          } catch {
            return 'Please enter a valid URL';
          }
        }
      },
      {
        type: 'list',
        name: 'defaultLanguage',
        message: 'Default programming language:',
        choices: [
          'javascript', 'typescript', 'python', 'java', 'go', 
          'rust', 'cpp', 'c', 'csharp', 'php', 'ruby', 
          'swift', 'kotlin', 'sql', 'html', 'css', 'other'
        ],
        default: getConfig().get('defaultLanguage') || 'javascript'
      },
      {
        type: 'list',
        name: 'defaultVisibility',
        message: 'Default snippet visibility:',
        choices: ['public', 'private'],
        default: getConfig().get('defaultVisibility') || 'public'
      },
      {
        type: 'list',
        name: 'outputFormat',
        message: 'Default output format:',
        choices: ['table', 'json', 'raw'],
        default: getConfig().get('outputFormat') || 'table'
      },
      {
        type: 'confirm',
        name: 'syntaxHighlight',
        message: 'Enable syntax highlighting?',
        default: getConfig().get('syntaxHighlight') !== false
      },
      {
        type: 'number',
        name: 'pageSize',
        message: 'Default page size for listings:',
        default: getConfig().get('pageSize') || 20,
        validate: (input) => input > 0 && input <= 100 || 'Please enter a number between 1 and 100'
      }
    ]);
    
    // Save configuration
    Object.entries(answers).forEach(([key, value]) => {
      setConfig(key, value);
    });
    
    console.log(chalk.green('\n✓ Configuration saved successfully!'));
    console.log(chalk.gray('You can change these settings anytime with "snipvault config set"'));
    
    // Check if user is logged in
    if (!getConfig().get('authToken')) {
      console.log(chalk.yellow('\n⚠ You are not logged in. Run "snipvault login" to authenticate.'));
    }
  });