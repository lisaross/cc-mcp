# CC-MCP: Claude Code MCP Manager

A **minimal** command-line tool that solves a critical problem: **Claude Code's built-in disable button permanently deletes MCP configurations**.

CC-MCP preserves your MCP setups when disabling them, enabling instant re-activation without reconfiguration.

## The Problem

When you disable an MCP using Claude Code's built-in UI, it permanently deletes the configuration from `mcp.json`. For MCPs with complex setups (API keys, custom paths, environment variables), this means complete reconfiguration from scratch.

**User Pain:** *"I spent 20 minutes setting up my database MCP with connection strings and API keys. I disabled it for a design task, and now it's completely gone. I have to start over."*

## The Solution

CC-MCP moves MCP configurations between `mcp.json` (enabled) and `mcp.json.disabled` (disabled) instead of deleting them.

**Result:** Instant re-enabling without losing any configuration data.

## Installation

### Global Installation (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-username/ccmcp.git
cd ccmcp

# Install globally  
deno install --global --allow-read --allow-write --name cc-mcp --force src/mvp/cc-mcp-mvp.ts

# Add to PATH (if needed)
export PATH="/Users/$USER/.deno/bin:$PATH"

# Test installation
cc-mcp --help
```

### Alternative: Run Directly

```bash
# Clone and run without installation
git clone https://github.com/your-username/ccmcp.git
cd ccmcp

# Run directly
deno run --allow-read --allow-write src/mvp/cc-mcp-mvp.ts

# Or use the task runner
deno task mvp
```

**Permissions needed:**

- `--allow-read`: Read MCP configuration files
- `--allow-write`: Write MCP configuration files

### ⚠️ Important: Claude Code Restart Requirement

**Add this to your global Claude Code memory** (`~/.claude/CLAUDE.md`):

```markdown
## CC-MCP Usage Notes
- When CC-MCP shows "⚠️ Restart Claude Code for changes to take effect:", pause and let the user restart Claude Code before continuing
- MCP changes only take effect after Claude Code restarts
```

## Usage

```bash
# Show all MCPs with status (default action)
cc-mcp
cc-mcp list
cc-mcp ls

# Enable a specific MCP 
cc-mcp enable github
cc-mcp e github

# Disable a specific MCP (preserves configuration)
cc-mcp disable github  
cc-mcp d github

# Initialize with working examples
cc-mcp init
```

## First Run

On first use, CC-MCP automatically creates:

- `mcp.json` with **filesystem** MCP enabled (safe, immediately useful)
- `mcp.json.disabled` with **github** MCP example (with placeholder token)

You can start using the filesystem MCP right away, then configure other MCPs as needed.

## Example Workflow

```bash
# See current status
$ cc-mcp
 filesystem
 github

# Enable GitHub MCP (after adding your token to mcp.json.disabled)
$ cc-mcp enable github
 Enabled github
�  Restart Claude Code: claude -r

# Later, disable for context management
$ cc-mcp disable github
 Disabled github (configuration preserved)
�  Restart Claude Code: claude -r

# Re-enable instantly - no reconfiguration needed!
$ cc-mcp enable github
 Enabled github
�  Restart Claude Code: claude -r
```

**Key Point:** The configuration is preserved in `.mcp.json.disabled`, so re-enabling requires zero setup.

## Key Benefits

- **Configuration Preservation**: Never lose MCP setups again
- **Instant Re-enabling**: No reconfiguration required
- **Context Management**: Enable only MCPs needed for current task
- **Zero Learning Curve**: Works immediately with auto-scaffolding
- **Safe**: Never destructively edits configurations

## Configuration Files

- `mcp.json`: Currently enabled MCP servers
- `mcp.json.disabled`: Disabled MCP servers (configurations preserved)

## Requirements

- **Deno** (for macOS: `brew install deno`)
- **Claude Code** project with MCP support
- Write permissions in project directory

## MVP Scope

This is a **true MVP** focused solely on configuration preservation:

 **Included**: List, enable, disable, auto-scaffolding  
L **Deferred**: Interactive modes, complex prompts, backup systems

Future versions will add more features based on user feedback.

## Contributing

Found a bug or want a feature? [Open an issue](https://github.com/your-username/ccmcp/issues).

This project follows MVP principles - we ship simple, working solutions and iterate based on real user needs.

---

**Warning:** Do not use Claude Code's built-in disable button for MCPs - it permanently deletes configurations. Always use CC-MCP for preserving your setups.
