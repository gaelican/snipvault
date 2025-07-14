# SnipVault CLI

Command-line interface for SnipVault - Manage your code snippets from the terminal.

## Features

- 🔐 **Authentication**: Secure login/logout with token management
- 📝 **Snippet Management**: Create, list, search, update, and delete snippets
- 🤖 **AI-Powered**: Generate code snippets and get explanations using AI
- 🎨 **Syntax Highlighting**: Beautiful code display in your terminal
- 📊 **Multiple Output Formats**: Table, JSON, or raw output
- ⚙️ **Configurable**: Customize default settings and behavior
- 🚀 **Interactive Mode**: User-friendly interactive prompts

## Installation

### From npm

```bash
npm install -g @snipvault/cli
```

### From source

```bash
git clone https://github.com/yourusername/snipvault.git
cd snipvault/cli
npm install
npm run build
npm link
```

## Quick Start

1. **Login to SnipVault**
   ```bash
   snipvault login
   ```

2. **Create a snippet from a file**
   ```bash
   snipvault create index.js --title "My First Snippet" --tags "javascript,nodejs"
   ```

3. **List your snippets**
   ```bash
   snipvault list
   ```

4. **Search for snippets**
   ```bash
   snipvault search "react hooks"
   ```

## Commands

### Authentication

#### Login
```bash
snipvault login [options]
# or
snipvault auth login

Options:
  -e, --email <email>       Email address
  -p, --password <password> Password
```

#### Logout
```bash
snipvault logout
# or
snipvault auth logout
```

#### Check Status
```bash
snipvault auth status
```

### Snippet Management

#### Create Snippet
```bash
snipvault create <file> [options]
# or
snipvault snippet create <file>

Options:
  -t, --title <title>              Snippet title
  -d, --description <description>  Snippet description
  -l, --language <language>        Programming language
  --tags <tags>                    Comma-separated tags
  -p, --private                    Make snippet private
```

#### List Snippets
```bash
snipvault list [options]
# or
snipvault snippet list

Options:
  -l, --limit <limit>  Number of snippets to show (default: 20)
  -p, --page <page>    Page number (default: 1)
  --private            Show only private snippets
  --public             Show only public snippets
```

#### Search Snippets
```bash
snipvault search <query> [options]
# or
snipvault snippet search <query>

Options:
  -l, --language <language>  Filter by language
  -t, --tags <tags>          Filter by tags (comma-separated)
  --limit <limit>            Number of results (default: 10)
```

#### Get Snippet
```bash
snipvault get <id> [options]
# or
snipvault snippet get <id>

Options:
  -c, --copy          Copy snippet to clipboard
  --no-highlight      Disable syntax highlighting
```

#### Update Snippet
```bash
snipvault update <id> [options]
# or
snipvault snippet update <id>

Options:
  -t, --title <title>              New title
  -d, --description <description>  New description
  -c, --content <file>             Update content from file
  --tags <tags>                    New tags (comma-separated)
  --add-tags <tags>                Add tags (comma-separated)
  --remove-tags <tags>             Remove tags (comma-separated)
```

#### Delete Snippet
```bash
snipvault delete <id> [options]
# or
snipvault snippet delete <id>

Options:
  -f, --force  Skip confirmation
```

### AI Features

#### Generate Code
```bash
snipvault generate <prompt> [options]
# or
snipvault ai generate <prompt>

Options:
  -l, --language <language>  Programming language (default: javascript)
  -s, --save                 Save generated snippet
  -t, --title <title>        Snippet title (when saving)
  -o, --output <file>        Save to file

Example:
  snipvault generate "create a React hook for local storage" -l typescript
```

#### Explain Code
```bash
snipvault explain <file> [options]
# or
snipvault ai explain <file>

Options:
  -l, --language <language>  Programming language (auto-detected)
  -d, --detailed             Provide detailed explanation
  -f, --focus <aspect>       Focus on specific aspect (security, performance, bugs)

Example:
  snipvault explain complex-algorithm.py --detailed --focus performance
```

#### Improve Code
```bash
snipvault improve <file> [options]
# or
snipvault ai improve <file>

Options:
  -l, --language <language>  Programming language (auto-detected)
  -f, --focus <aspect>       Improvement focus (performance, readability, security, best-practices)
  -a, --apply                Apply improvements and save to file
  -o, --output <file>        Save improved code to different file

Example:
  snipvault improve legacy-code.js --focus readability --output improved-code.js
```

#### AI Usage Statistics
```bash
snipvault ai usage
```

### Configuration

#### Get Configuration
```bash
snipvault config get [key]
```

#### Set Configuration
```bash
snipvault config set <key> <value>

Example:
  snipvault config set defaultLanguage python
  snipvault config set outputFormat json
```

#### Reset Configuration
```bash
snipvault config reset [key]
```

#### List Available Options
```bash
snipvault config list-options
```

#### Setup Wizard
```bash
snipvault config init
```

### Interactive Mode

Start an interactive session:
```bash
snipvault interactive
# or
snipvault i
```

## Global Options

These options can be used with any command:

```bash
-f, --format <format>  Output format: table, json, raw (default: table)
--no-color             Disable colored output
-h, --help             Display help
-V, --version          Display version
```

## Configuration

SnipVault CLI stores configuration in `~/.config/configstore/@snipvault/cli.json`

### Available Configuration Options

| Key | Description | Type | Default | Values |
|-----|-------------|------|---------|--------|
| apiUrl | SnipVault API URL | string | https://api.snipvault.com | any URL |
| defaultLanguage | Default language for new snippets | string | javascript | any |
| defaultVisibility | Default visibility for new snippets | string | public | public, private |
| outputFormat | Default output format | string | table | table, json, raw |
| syntaxHighlight | Enable syntax highlighting | boolean | true | true, false |
| pageSize | Default page size for listings | number | 20 | 1-100 |
| editor | Default editor for interactive mode | string | vim | any |
| theme | Color theme | string | default | default, dark, light |

## Environment Variables

- `SNIPVAULT_API_URL`: Override the API URL
- `SNIPVAULT_AUTH_TOKEN`: Authentication token (not recommended for production)
- `EDITOR`: Default editor for interactive mode
- `NO_COLOR`: Disable colored output

## Examples

### Create a snippet with multiple tags
```bash
snipvault create utils.js \
  --title "JavaScript Utility Functions" \
  --description "Common utility functions for JavaScript projects" \
  --tags "javascript,utils,helpers" \
  --private
```

### Search for Python snippets about machine learning
```bash
snipvault search "machine learning" --language python --limit 20
```

### Generate a React component
```bash
snipvault generate "create a todo list component with add and delete functionality" \
  --language typescript \
  --save \
  --title "Todo List Component"
```

### Get detailed explanation of complex code
```bash
snipvault explain algorithm.cpp --detailed --focus performance
```

### Export snippets in JSON format
```bash
snipvault list --format json > my-snippets.json
```

### Update snippet tags
```bash
snipvault update abc123 --add-tags "production,tested" --remove-tags "draft"
```

## Troubleshooting

### Authentication Issues

If you're having trouble authenticating:

1. Check your credentials:
   ```bash
   snipvault auth status
   ```

2. Clear saved credentials and login again:
   ```bash
   snipvault logout
   snipvault login
   ```

3. Check API URL configuration:
   ```bash
   snipvault config get apiUrl
   ```

### Network Issues

If you're experiencing network errors:

1. Check your internet connection
2. Verify the API URL is correct
3. Check if you're behind a proxy

### Permission Issues

If you can't save configuration:

1. Check write permissions for config directory
2. Try running with appropriate permissions
3. Set custom config path using environment variables

## Contributing

We welcome contributions! Please see our [Contributing Guide](../CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](../LICENSE) for details.

## Support

- Documentation: https://docs.snipvault.com
- Issues: https://github.com/yourusername/snipvault/issues
- Discord: https://discord.gg/snipvault
- Email: support@snipvault.com