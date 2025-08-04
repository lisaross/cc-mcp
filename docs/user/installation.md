# CC-MCP Setup & Usage

## ⚠️ Critical Warning

**NEVER use Claude Code's built-in MCP disable button!** It permanently deletes your MCP configuration. Always use CC-MCP to preserve your settings.

## Why CC-MCP Exists

When you disable an MCP through Claude Code's UI, it deletes the entire configuration - including API keys, custom paths, and arguments. CC-MCP solves this by:

- Moving configs to a `.disabled` file instead of deleting them
- Preserving all configuration data for instant re-enabling
- Managing context window usage effectively

**Benefits:**

- Preserve complex MCP configurations
- Manage context window usage (some MCPs consume significant space)
- Enable/disable MCPs based on current task
- Instantly re-enable without reconfiguration

**Note:** This is the MVP version focused on configuration preservation. Advanced features like automatic backups, recovery systems, and interactive modes are planned for future releases.

## Quick Install

### Option 1: Direct from URL (once published)

```bash
deno install --allow-read --allow-write --name cc-mcp https://raw.githubusercontent.com/lisaross/cc-mcp/main/src/mvp/cc-mcp-mvp.ts
```

### Option 2: Local Development

```bash
# Clone/create the project
mkdir cc-mcp && cd cc-mcp

# Save the cc-mcp.ts file from the artifact above

# Install locally
deno install --allow-read --allow-write --name cc-mcp ./cc-mcp.ts

# Or run directly without installing
deno run --allow-read --allow-write cc-mcp.ts list
```

### First Time Setup

```bash
# Initialize with example configurations
cc-mcp init

# This creates:
# - mcp.json with filesystem enabled
# - mcp.json.disabled with 6 common MCPs ready to configure
```

## Example Usage

### First Run Experience

```bash
$ cc-mcp list
Creating mcp.json with default configuration...
Creating mcp.json.disabled with example configurations...

  Status      Name          Command
  ✓ enabled   filesystem    bunx
  ✗ disabled  anthropic     bunx
  ✗ disabled  github        bunx
  ✗ disabled  google_drive  bunx
  ✗ disabled  postgres      bunx
  ✗ disabled  slack         bunx
  ✗ disabled  sqlite        bunx

  Example: bunx, bun x, npx, node, python, etc.
```

### Basic Commands (MVP)

```bash
# List all MCPs
cc-mcp
cc-mcp list
cc-mcp ls

# Enable/disable specific MCPs
cc-mcp enable filesystem
cc-mcp disable github

# Short aliases
cc-mcp e filesystem
cc-mcp d github

# Initialize with example configurations
cc-mcp init
```

**Note:** Interactive modes, bulk operations, and advanced features are planned for future releases after the MVP.

### Example Workflow

1. **Check current status**

   ```bash
   $ cc-mcp
   ✓ filesystem
   ✗ github
   ```

2. **Enable GitHub MCP (after configuring token)**

   ```bash
   $ cc-mcp enable github
   ✓ Enabled github
   ⚠️ Restart Claude Code: claude -c
   ```

3. **Later, disable for context management**

   ```bash
   $ cc-mcp disable github
   ✓ Disabled github (configuration preserved)
   ⚠️ Restart Claude Code: claude -c
   ```

4. **Re-enable instantly - no reconfiguration needed!**

   ```bash
   $ cc-mcp enable github
   ✓ Enabled github
   ⚠️ Restart Claude Code: claude -c
   ```

**Key Point:** The configuration is preserved in `.mcp.json.disabled`, so re-enabling requires zero setup.

### Current Status Display

   ```bash
   $ cc-mcp list
   
   ✓ filesystem
   ✗ github
   ```

The status shows which MCPs are currently enabled (✓) and disabled (✗).

## File Structure

Your project directory should look like:

```
your-project/
├── mcp.json          # Active MCP configurations
├── mcp.json.disabled # Disabled MCP configurations
└── ... other files
```

### Example mcp.json (auto-created)

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "bunx",
      "args": ["@modelcontextprotocol/server-filesystem", "./"]
    }
  }
}
```

### Example mcp.json.disabled (auto-created with common MCPs)

```json
{
  "mcpServers": {
    "github": {
      "command": "bunx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token-here"
      }
    },
    "sqlite": {
      "command": "bunx",
      "args": ["@modelcontextprotocol/server-sqlite", "database.db"]
    },
    "anthropic": {
      "command": "bunx",
      "args": ["@modelcontextprotocol/server-anthropic"],
      "env": {
        "ANTHROPIC_API_KEY": "your-api-key-here"
      }
    },
    "slack": {
      "command": "bunx",
      "args": ["@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-token",
        "SLACK_TEAM_ID": "your-team-id"
      }
    },
    "postgres": {
      "command": "bunx",
      "args": ["@modelcontextprotocol/server-postgres", "postgresql://localhost/mydb"]
    },
    "google_drive": {
      "command": "bunx",
      "args": ["@modelcontextprotocol/server-gdrive"],
      "env": {
        "GOOGLE_DRIVE_CLIENT_ID": "your-client-id",
        "GOOGLE_DRIVE_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

**Note:** CC-MCP automatically creates these files with examples on first run, or you can run `cc-mcp init` to reset to defaults.

## Using with Claude in Claude Code

When working with Claude inside Claude Code, you can use cc-mcp commands directly:

```
Claude: "I need to enable the GitHub MCP to help with your repository"
> cc-mcp enable github
> claude -c

Claude: "Let me check which MCPs are available"
> cc-mcp list

Claude: "I'll help you configure the right MCPs for this project"
> cc-mcp toggle
> claude -c
```

Note: After enabling/disabling MCPs, you'll need to quit and run `claude -c` to resume with the new configuration.

## Configuring Scaffolded MCPs

The disabled MCPs come with placeholder values that need to be configured:

### GitHub

```bash
# Edit mcp.json.disabled and replace "your-token-here" with your GitHub PAT
# Then enable:
cc-mcp enable github
```

### Anthropic

```bash
# Add your Anthropic API key to mcp.json.disabled
# Get key from: https://console.anthropic.com/
cc-mcp enable anthropic
```

### Slack

```bash
# Configure both tokens in mcp.json.disabled:
# - SLACK_BOT_TOKEN: Get from Slack app settings
# - SLACK_TEAM_ID: Your workspace ID
cc-mcp enable slack
```

### PostgreSQL

```bash
# Update connection string in mcp.json.disabled
# Format: postgresql://user:password@host:port/database
cc-mcp enable postgres
```

## Tips & Tricks

1. **Use Short Aliases**: `cc-mcp e github` and `cc-mcp d github` for faster commands

2. **Manual Backup**: Before major changes (optional)

   ```bash
   cp .mcp.json .mcp.json.backup
   cp .mcp.json.disabled .mcp.json.disabled.backup
   ```

3. **Check JSON Validity**: If you manually edit the files

   ```bash
   deno fmt --check .mcp.json
   ```

4. **Project-Specific MCPs**: Keep different .mcp.json files for different projects

5. **Shell Alias**: Add to your shell config for faster access

   ```bash
   alias mcp="cc-mcp"
   ```

## Future Marketplace Integration

Once the marketplace is available:

```bash
# Search for MCPs
cc-mcp search "database"

# Add from marketplace
cc-mcp add @modelcontextprotocol/server-postgres

# With automatic configuration
cc-mcp add @smithery/weather-mcp --configure
```

## Troubleshooting

### "No MCP servers found"

- Make sure you have `mcp.json` or `mcp.json.disabled` in current directory
- Files can be empty initially: `{"mcpServers": {}}`

### Changes not taking effect

- Always restart Claude Code after changes
- Quit Claude Code and run `claude -c` to resume your conversation
- MCP changes only apply after a full restart

### Permission denied

- Ensure you have write permissions in the directory
- Re-run install with proper permissions: `deno install --allow-read --allow-write ...`
