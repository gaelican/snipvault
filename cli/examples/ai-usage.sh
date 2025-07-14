#!/bin/bash

# SnipVault CLI - AI Feature Examples

echo "=== SnipVault CLI AI Feature Examples ==="
echo

# 1. Generate code snippets
echo "1. Generating code with AI:"
echo
echo "# Generate a React component"
echo "$ snipvault generate \"create a modal component with open/close animations\" -l typescript"
echo
echo "# Generate and save a Python function"
echo "$ snipvault generate \"function to calculate fibonacci sequence\" -l python --save --title \"Fibonacci Calculator\""
echo
echo "# Generate and save to file"
echo "$ snipvault generate \"REST API client class\" -l javascript --output api-client.js"
echo

# 2. Explain existing code
echo "2. Getting AI explanations for code:"
echo
echo "# Basic explanation"
echo "$ snipvault explain complex-algorithm.py"
echo
echo "# Detailed explanation"
echo "$ snipvault explain legacy-code.js --detailed"
echo
echo "# Focus on specific aspects"
echo "$ snipvault explain authentication.go --focus security"
echo "$ snipvault explain data-processor.py --focus performance"
echo

# 3. Improve code
echo "3. Improving code with AI suggestions:"
echo
echo "# Get improvement suggestions"
echo "$ snipvault improve old-code.js"
echo
echo "# Focus on readability"
echo "$ snipvault improve complex-function.py --focus readability"
echo
echo "# Apply improvements directly"
echo "$ snipvault improve messy-code.js --apply"
echo
echo "# Save improvements to new file"
echo "$ snipvault improve legacy.php --output refactored.php"
echo

# 4. Check AI usage
echo "4. Monitoring AI usage:"
echo "$ snipvault ai usage"
echo

# 5. Advanced examples
echo "5. Advanced AI usage examples:"
echo
echo "# Generate a complete Express.js API endpoint"
cat << 'EOF'
$ snipvault generate "Express.js endpoint for user authentication with JWT, 
  including login, register, and middleware for protected routes" \
  -l javascript \
  --save \
  --title "Auth API Endpoints"
EOF
echo
echo "# Generate test cases"
echo "$ snipvault generate \"unit tests for a shopping cart class\" -l python"
echo
echo "# Generate documentation"
echo "$ snipvault generate \"JSDoc comments for a user service class\" -l javascript"
echo
echo "# Explain and improve in one workflow"
echo "$ snipvault explain database-query.sql --detailed"
echo "$ snipvault improve database-query.sql --focus performance --output optimized-query.sql"