#!/bin/bash

# SnipVault CLI - Advanced Usage Examples

echo "=== SnipVault CLI Advanced Usage Examples ==="
echo

# 1. Batch operations
echo "1. Batch Operations:"
echo
echo "# Create multiple snippets from a directory"
echo "for file in *.js; do"
echo "  snipvault create \"\$file\" --title \"\${file%.*}\" --tags \"javascript,utils\""
echo "done"
echo

# 2. Export and backup
echo "2. Export and Backup Snippets:"
echo
echo "# Export all snippets to JSON"
echo "$ snipvault list --limit 1000 --format json > snippets-backup.json"
echo
echo "# Export specific language snippets"
echo "$ snipvault search \"*\" --language python --format json > python-snippets.json"
echo

# 3. Pipeline operations
echo "3. Pipeline Operations:"
echo
echo "# Search and get details for each result"
echo "$ snipvault search \"authentication\" --format json | jq -r '.[].id' | while read id; do"
echo "    snipvault get \"\$id\" --format json"
echo "done"
echo

# 4. Configuration management
echo "4. Configuration Management:"
echo
echo "# Export configuration"
echo "$ snipvault config get > config-backup.json"
echo
echo "# Set multiple configurations"
echo "$ snipvault config set defaultLanguage typescript"
echo "$ snipvault config set outputFormat json"
echo "$ snipvault config set syntaxHighlight false"
echo

# 5. Interactive scripting
echo "5. Interactive Scripting:"
echo
echo "# Non-interactive login"
echo "$ snipvault login --email user@example.com --password \"\$PASSWORD\""
echo
echo "# Create snippet with all options"
cat << 'EOF'
$ snipvault create app.py \
  --title "Flask Application Setup" \
  --description "Basic Flask app with blueprints and error handling" \
  --language python \
  --tags "flask,python,web,backend" \
  --private
EOF
echo

# 6. Integration examples
echo "6. Integration Examples:"
echo
echo "# Git pre-commit hook to save changed files as snippets"
cat << 'EOF'
#!/bin/bash
# .git/hooks/pre-commit
for file in $(git diff --cached --name-only); do
  if [[ -f "$file" ]]; then
    snipvault create "$file" \
      --title "Git: $file" \
      --tags "git-commit,$(date +%Y-%m-%d)" \
      --private
  fi
done
EOF
echo
echo "# VS Code task to create snippet from current file"
cat << 'EOF'
{
  "label": "Save to SnipVault",
  "type": "shell",
  "command": "snipvault create ${file} --title '${fileBasename}'"
}
EOF
echo

# 7. Custom workflows
echo "7. Custom Workflows:"
echo
echo "# Review and improve all JavaScript files"
cat << 'SCRIPT'
#!/bin/bash
for file in src/**/*.js; do
  echo "Analyzing $file..."
  snipvault explain "$file" --focus bugs
  read -p "Improve this file? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    snipvault improve "$file" --output "${file%.js}.improved.js"
  fi
done
SCRIPT
echo

# 8. Monitoring and reporting
echo "8. Monitoring and Reporting:"
echo
echo "# Generate snippet statistics"
cat << 'SCRIPT'
#!/bin/bash
echo "=== Snippet Statistics ==="
total=$(snipvault list --format json | jq '. | length')
echo "Total snippets: $total"

echo -e "\nBy language:"
snipvault list --limit 1000 --format json | \
  jq -r '.[].language' | sort | uniq -c | sort -nr

echo -e "\nMost used tags:"
snipvault list --limit 1000 --format json | \
  jq -r '.[].tags[]' | sort | uniq -c | sort -nr | head -10
SCRIPT