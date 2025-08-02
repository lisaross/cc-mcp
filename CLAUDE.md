# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CC-MCP is a command-line tool for managing Model Context Protocol (MCP) servers in Claude Code projects. It provides a non-destructive alternative to Claude Code's built-in MCP management, preserving configurations when disabling MCPs instead of deleting them entirely.

## Development Commands

### Running the Tool
```bash
# Run the main script directly with Deno
deno run --allow-read --allow-write cc-mcp-minimal.ts

# Install locally for system-wide usage
deno install --allow-read --allow-write --name cc-mcp cc-mcp-minimal.ts

# Common commands after installation
cc-mcp list          # Show all MCPs and their status
cc-mcp toggle        # Interactive checkbox interface
cc-mcp enable <name> # Enable a specific MCP
cc-mcp disable <name># Disable a specific MCP
cc-mcp init          # Initialize with example configurations
```

### Testing
Since this is a CLI tool that manages file system operations:
```bash
# Test in a temporary directory to avoid affecting real configs
mkdir test-env && cd test-env
deno run --allow-read --allow-write ../cc-mcp-minimal.ts init
deno run --allow-read --allow-write ../cc-mcp-minimal.ts list
```

### Permissions Required
- `--allow-read`: Read mcp.json configuration files
- `--allow-write`: Write mcp.json configuration files and create backup directory

## Architecture

### Core Components

**MCPManager Class** (`cc-mcp-minimal.ts:179-291`): 
- Handles all MCP configuration file operations
- Manages enabled (mcp.json) and disabled (mcp.json.disabled) configurations
- Provides methods for enabling/disabling MCPs while preserving configs

**BackupManager Class** (`cc-mcp-minimal.ts:79-177`):
- Automatically creates backups before any configuration changes
- Stores backups in `./.cc-mcp/backups/` with timestamp-based naming
- Keeps last 30 backups with auto-cleanup
- Detects orphaned configurations (deleted via Claude Code UI)

**Configuration Files**:
- `mcp.json`: Currently enabled MCP servers
- `mcp.json.disabled`: Disabled MCP servers (preserves configuration)
- `.cc-mcp/backups/`: Automatic backup storage

### Key Features

1. **Configuration Preservation**: Unlike Claude Code's destructive disable, this tool moves MCPs between enabled/disabled states
2. **Automatic Scaffolding**: Creates example configurations on first run
3. **Backup & Recovery**: Automatic backups with orphan detection for configs deleted via Claude Code UI
4. **Interactive Interface**: Checkbox-based toggle interface using Cliffy prompts
5. **Restart Reminders**: Prominent notifications to restart Claude Code after changes

### Default Configurations

**Enabled by Default** (`cc-mcp-minimal.ts:27-34`):
- filesystem: Safe, useful MCP for local file access

**Disabled Examples** (`cc-mcp-minimal.ts:36-77`):
- github, sqlite, anthropic, slack, postgres, google_drive
- Pre-configured with placeholder values for API keys and environment variables

## Development Workflow

1. **All changes preserve existing configurations** - never destructively edit
2. **Test with temporary directories** to avoid affecting real MCP configs
3. **Use auto-scaffolding** - tool creates example configs automatically
4. **Backup system** protects against data loss from any source
5. **CLI-first design** - optimized for terminal workflow with Claude Code

## File Structure

```
ccmcp/
├── cc-mcp-minimal.ts     # Single-file implementation with full functionality
├── docs/                 # Project documentation
│   ├── PRD.md           # Product requirements and feature specifications
│   ├── cc-mcp-architecture.md # Technical architecture (planned vs actual)
│   └── ...
└── CLAUDE.md            # This file
```

## Important Implementation Notes

- **Single-file design**: All functionality contained in `cc-mcp-minimal.ts` for simplicity
- **Deno runtime**: Uses Deno with Cliffy framework for CLI interface
- **File-based state**: No database - uses JSON files for configuration management
- **Safety-first**: Always creates backups, validates operations, provides undo capabilities
- **Claude Code integration**: Designed specifically for Claude Code's MCP configuration format

## CLI UX Patterns

- Orange ASCII logo matching Claude Code branding
- Clear visual status indicators (✓ enabled, ✗ disabled)
- Interactive prompts with sensible defaults
- Helpful error messages with suggested solutions
- Consistent command aliases for speed (ls, e, d, t)
- Prominent restart reminders after configuration changes