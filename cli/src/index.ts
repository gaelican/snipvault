#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { authCommand } from './commands/auth';
import { snippetCommand } from './commands/snippet';
import { aiCommand } from './commands/ai';
import { configCommand } from './commands/config';
import { getConfig } from './utils/config';

const program = new Command();

program
  .name('snipvault')
  .description('CLI for SnipVault - Manage your code snippets from the terminal')
  .version('1.0.0')
  .option('-f, --format <format>', 'output format (json, table, raw)', 'table')
  .option('--no-color', 'disable colored output')
  .hook('preAction', async (thisCommand, actionCommand) => {
    // Check if auth is required for this command
    const authRequiredCommands = ['create', 'list', 'search', 'get', 'generate', 'explain'];
    const commandName = actionCommand.name();
    
    if (authRequiredCommands.includes(commandName) && commandName !== 'login') {
      const config = getConfig();
      if (!config.get('authToken')) {
        console.error(chalk.red('Error: You must be logged in to use this command.'));
        console.error(chalk.yellow('Run "snipvault login" to authenticate.'));
        process.exit(1);
      }
    }
  });

// Add commands
program.addCommand(authCommand);
program.addCommand(snippetCommand);
program.addCommand(aiCommand);
program.addCommand(configCommand);

// Interactive mode
program
  .command('interactive')
  .alias('i')
  .description('Start interactive mode')
  .action(async () => {
    const inquirer = (await import('inquirer')).default;
    
    console.log(chalk.cyan('\nWelcome to SnipVault Interactive Mode!\n'));
    
    const mainMenu = async () => {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: 'Create a new snippet', value: 'create' },
            { name: 'List snippets', value: 'list' },
            { name: 'Search snippets', value: 'search' },
            { name: 'Generate snippet with AI', value: 'generate' },
            { name: 'Explain code with AI', value: 'explain' },
            { name: 'Exit', value: 'exit' }
          ]
        }
      ]);
      
      if (action === 'exit') {
        console.log(chalk.green('\nGoodbye!'));
        process.exit(0);
      }
      
      // Execute the selected action
      await import(`./commands/interactive/${action}`).then(m => m.default());
      
      // Return to main menu
      await mainMenu();
    };
    
    await mainMenu();
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}