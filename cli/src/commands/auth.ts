import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { apiClient } from '../utils/api-client';
import { saveAuthToken, clearAuthToken, getAuthToken } from '../utils/auth';

export const authCommand = new Command('auth')
  .description('Authentication commands');

authCommand
  .command('login')
  .alias('signin')
  .description('Login to SnipVault')
  .option('-e, --email <email>', 'email address')
  .option('-p, --password <password>', 'password')
  .action(async (options) => {
    const inquirer = (await import('inquirer')).default;
    
    let { email, password } = options;
    
    // Prompt for credentials if not provided
    if (!email || !password) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'email',
          message: 'Email:',
          when: !email,
          validate: (input) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(input) || 'Please enter a valid email address';
          }
        },
        {
          type: 'password',
          name: 'password',
          message: 'Password:',
          when: !password,
          mask: '*'
        }
      ]);
      
      email = email || answers.email;
      password = password || answers.password;
    }
    
    const spinner = ora('Logging in...').start();
    
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      if (response.data.token) {
        saveAuthToken(response.data.token);
        spinner.succeed('Successfully logged in!');
        console.log(chalk.green(`Welcome back, ${response.data.user.name || email}!`));
      } else {
        throw new Error('No authentication token received');
      }
    } catch (error: any) {
      spinner.fail('Login failed');
      console.error(chalk.red(error.response?.data?.message || error.message));
      process.exit(1);
    }
  });

authCommand
  .command('logout')
  .alias('signout')
  .description('Logout from SnipVault')
  .action(async () => {
    const inquirer = (await import('inquirer')).default;
    
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to logout?',
        default: true
      }
    ]);
    
    if (confirm) {
      clearAuthToken();
      console.log(chalk.green('Successfully logged out!'));
    }
  });

authCommand
  .command('status')
  .alias('whoami')
  .description('Check authentication status')
  .action(async () => {
    const token = getAuthToken();
    
    if (!token) {
      console.log(chalk.yellow('You are not logged in.'));
      return;
    }
    
    const spinner = ora('Checking authentication status...').start();
    
    try {
      const response = await apiClient.get('/auth/me');
      spinner.succeed('Authenticated');
      console.log(chalk.cyan('\nUser Information:'));
      console.log(chalk.white(`  Email: ${response.data.email}`));
      console.log(chalk.white(`  Name: ${response.data.name || 'Not set'}`));
      console.log(chalk.white(`  Plan: ${response.data.subscription?.plan || 'Free'}`));
    } catch (error: any) {
      spinner.fail('Authentication check failed');
      if (error.response?.status === 401) {
        console.error(chalk.red('Your session has expired. Please login again.'));
        clearAuthToken();
      } else {
        console.error(chalk.red(error.response?.data?.message || error.message));
      }
    }
  });