# CC-MCP Setup & Usage

## ⚠️ Critical Warning

**NEVER use Claude Code's built-in MCP disable button!** It permanently deletes your MCP configuration. Always use CC-MCP to preserve your settings.

## Why CC-MCP Exists

When you disable an MCP through Claude Code's UI, it deletes the entire configuration - including API keys, custom paths, and arguments. CC-MCP solves this by:
- Moving configs to a `.disabled` file instead of deleting them
- **Automatic backups** before every change
- **Recovery system** to restore accidentally deleted MCPs
- Managing context window usage effectively

**Benefits:**
- Preserve complex MCP configurations
- Recover from accidental deletions
- Manage context window usage (some MCPs like Canva consume significant space)
- Enable/disable MCPs based on current task
- Instantly re-enable without reconfiguration

## Quick Install

### Option 1: Direct from URL (once published)
```bash
deno install --allow-read --allow-write --name cc-mcp https://raw.githubusercontent.com/YOUR_USER/cc-mcp/main/cc-mcp.ts
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

### Basic Commands
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

# Interactive mode (best feature!)
cc-mcp toggle
cc-mcp t

# Bulk operations
cc-mcp enable-all
cc-mcp disable-all
```

### Example Workflow

1. **Morning: Working on web development**
   ```bash
   $ cc-mcp toggle
   # Enable: filesystem, github
   # Disable: canva, database, slack
   
   # Restart Claude Code:
   $ claude -r
   ```

2. **Afternoon: Switching to design work**
   ```bash
   $ cc-mcp toggle
   # Enable: canva, filesystem
   # Disable: github, database
   # (Frees up context window from unused MCPs)
   
   # Restart to apply changes:
   $ claude -r
   ```

3. **Next day: Back to web dev**
   ```bash
   $ cc-mcp toggle
   # Enable: filesystem, github
   # All your GitHub tokens and configs are preserved!
   
   $ claude -r
   ```

### Checking Current Status
   ```bash
   $ cc-mcp list
   
     Status      Name         Command
     ✓ enabled   filesystem   bunx
     ✗ disabled  github       bun
     ✓ enabled   sqlite       bunx
   ```

2. **Use interactive toggle**
   ```bash
   $ cc-mcp toggle
   
   ? Select MCPs to enable (space to toggle, enter to confirm):
   ◉ filesystem (bunx)
   ◯ github (bun)
   ◉ sqlite (bunx)
   ```

3. **Get restart reminder**
   ```bash
   ✓ Updated 1 MCP(s)
   
   ⚠️  Configuration changed!
   Please restart Claude Code for changes to take effect.
   Quit Claude Code and run: claude -r to resume
   ```

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
> claude -r

Claude: "Let me check which MCPs are available"
> cc-mcp list

Claude: "I'll help you configure the right MCPs for this project"
> cc-mcp toggle
> claude -r
```

Note: After enabling/disabling MCPs, you'll need to quit and run `claude -r` to resume with the new configuration.

## Backup & Recovery Features

CC-MCP automatically backs up your configurations before every change. If you accidentally use Claude Code's disable button:

### Check for Missing MCPs
```bash
$ cc-mcp doctor

⚠️  Found 2 missing MCP(s):
  • github
  • slack

These configurations may have been deleted using Claude Code's UI.
Run 'cc-mcp recover' to restore from backup.
```

### Recover Deleted Configurations
```bash
$ cc-mcp recover

Found 2 missing MCP(s):
  • github
  • slack

Recover 2 MCP(s) from backup? Y

✓ Recovered 2 MCP(s) to disabled state
  Run 'cc-mcp list' to see all MCPs
  Run 'cc-mcp enable <n>' to re-enable specific MCPs
```

### View Backup History
```bash
$ cc-mcp history

Backup History:

  Time                    Operation
  2024-01-15 10:30:00    Enabled filesystem
  2024-01-15 10:25:00    Disabled github
  2024-01-15 09:00:00    Toggle MCPs

  Keeping last 30 backups automatically
```

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

1. **Quick Toggle**: Use `cc-mcp t` for the fastest way to manage MCPs

2. **Backup Configurations**: Before major changes
   ```bash
   cp mcp.json mcp.json.backup
   cp mcp.json.disabled mcp.json.disabled.backup
   ```

3. **Check JSON Validity**: If you manually edit the files
   ```bash
   deno fmt --check mcp.json
   ```

4. **Project-Specific MCPs**: Keep different mcp.json files for different projects

5. **Alias for Even Faster Access**: Add to your shell config
   ```bash
   alias mcp="cc-mcp"
   alias mcpt="cc-mcp toggle"
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
- Quit Claude Code and run `claude -r` to resume your conversation
- MCP changes only apply after a full restart

### Permission denied
- Ensure you have write permissions in the directory
- Re-run install with proper permissions: `deno install --allow-read --allow-write ...`