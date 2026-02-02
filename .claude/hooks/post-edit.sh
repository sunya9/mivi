#!/bin/bash
# Post-edit hook: runs typecheck, lint, and format on edited files

# Read JSON input from stdin
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Exit if no file path
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Only process TypeScript/JavaScript files
if [[ "$FILE_PATH" != *.ts && "$FILE_PATH" != *.tsx && "$FILE_PATH" != *.js && "$FILE_PATH" != *.jsx ]]; then
  exit 0
fi

# Run typecheck (project-wide, but fast incremental)
pnpm typecheck 2>&1

# Run lint on the specific file
pnpm lint --fix "$FILE_PATH" 2>&1

# Run prettier on the specific file
pnpm exec prettier --write "$FILE_PATH" 2>&1

exit 0
