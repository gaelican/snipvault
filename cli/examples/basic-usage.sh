#!/bin/bash

# SnipVault CLI - Basic Usage Examples

echo "=== SnipVault CLI Basic Usage Examples ==="
echo

# 1. Login
echo "1. Logging in to SnipVault:"
echo "$ snipvault login"
echo

# 2. Create a snippet from a file
echo "2. Creating a snippet from a file:"
echo "$ snipvault create index.js --title \"Express Server Setup\" --tags \"nodejs,express\""
echo

# 3. List snippets
echo "3. Listing your snippets:"
echo "$ snipvault list"
echo "$ snipvault list --limit 5 --format json"
echo

# 4. Search for snippets
echo "4. Searching for snippets:"
echo "$ snipvault search \"react hooks\""
echo "$ snipvault search \"authentication\" --language javascript"
echo

# 5. Get a specific snippet
echo "5. Getting a snippet by ID:"
echo "$ snipvault get abc123def"
echo "$ snipvault get abc123def --copy  # Copy to clipboard"
echo

# 6. Update a snippet
echo "6. Updating a snippet:"
echo "$ snipvault update abc123def --title \"Updated Title\""
echo "$ snipvault update abc123def --add-tags \"production,tested\""
echo

# 7. Delete a snippet
echo "7. Deleting a snippet:"
echo "$ snipvault delete abc123def"
echo "$ snipvault delete abc123def --force  # Skip confirmation"
echo

# 8. Configure CLI
echo "8. Configuring the CLI:"
echo "$ snipvault config set defaultLanguage python"
echo "$ snipvault config get"
echo

# 9. Check authentication status
echo "9. Checking authentication status:"
echo "$ snipvault auth status"
echo

# 10. Logout
echo "10. Logging out:"
echo "$ snipvault logout"