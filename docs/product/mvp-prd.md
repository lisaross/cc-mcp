# CC-MCP MVP Product Requirements Document

## Product Overview

**Product Name:** CC-MCP (Claude Code MCP Manager)  
**Version:** 1.0.0 (True MVP)  
**Platform:** Command Line Interface (CLI)  
**Technology:** TypeScript/Deno with minimal dependencies

## Executive Summary

CC-MCP is a **minimal** command-line tool that solves one critical problem: **Claude Code's built-in disable button permanently deletes MCP configurations**. This MVP provides basic configuration preservation, allowing users to disable MCPs without losing their setups.

**Core Value Proposition:** Preserve MCP configurations when disabling them, enabling instant re-activation without reconfiguration.

## Problem Statement

**Critical Issue:** When you disable an MCP using Claude Code's built-in UI, it permanently deletes the configuration from `mcp.json`. For MCPs with complex setups (API keys, custom paths, environment variables), this means complete reconfiguration from scratch.

**User Pain:** "I spent 20 minutes setting up my database MCP with connection strings and API keys. I disabled it for a design task, and now it's completely gone. I have to start over."

## MVP Solution

A simple CLI tool that:
1. **Lists MCPs** with enabled/disabled status
2. **Preserves configurations** by moving them between `mcp.json` and `mcp.json.disabled`
3. **Auto-scaffolds** basic configs on first run
4. **Reminds users** to restart Claude Code after changes

**Target Implementation:** ~200 lines of code, deliverable in 2-3 days.

## MVP Features (4 Core Commands)

### 1. List MCPs (`list`, `ls`, default action)
Display all MCPs with their current status.

**Acceptance Criteria:**
- Shows all MCPs from both `mcp.json` and `mcp.json.disabled`
- Visual indicators: ✓ enabled, ✗ disabled
- Works when running `cc-mcp` with no arguments

### 2. Enable MCP (`enable <name>`, `e <name>`)
Move MCP configuration from disabled to enabled state.

**Acceptance Criteria:**
- Moves config from `mcp.json.disabled` to `mcp.json`
- Shows success message: "✓ Enabled {name}"
- Shows restart reminder: "⚠️ Restart Claude Code: claude -r"
- Handles "not found" and "already enabled" cases

### 3. Disable MCP (`disable <name>`, `d <name>`)
Move MCP configuration from enabled to disabled state.

**Acceptance Criteria:**
- Moves config from `mcp.json` to `mcp.json.disabled`
- Shows success message: "✓ Disabled {name}"
- Shows restart reminder
- Handles "not found" and "already disabled" cases

### 4. Initialize (`init`)
Create default configuration files with minimal examples.

**Acceptance Criteria:**
- Creates `mcp.json` with filesystem MCP enabled (safe, immediately useful)
- Creates `mcp.json.disabled` with 1-2 common examples (github)
- Auto-runs on first use if files don't exist
- Shows what was created

## Technical Requirements

### File Management
- Read/write `mcp.json` and `mcp.json.disabled` in current directory
- **Auto-scaffold on first run** if files don't exist
- Preserve JSON formatting (2-space indent)
- Handle malformed JSON gracefully with clear error messages

### User Experience
- Clear success/error messages
- Consistent command aliases (`ls`, `e`, `d`)
- Help text (`--help`, `-h`)
- Version command (`--version`, `-V`)
- **Restart reminder** after every configuration change

### Platform Support
- **macOS only for MVP** (simplified testing)
- Built with Deno for future cross-platform capability

### Installation
- Single-file Deno script
- Install: `deno install --allow-read --allow-write --name cc-mcp ./cc-mcp.ts`
- Permissions: read/write for JSON files only

## Example Configurations

### Enabled by Default (`mcp.json`)
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

### Disabled Examples (`mcp.json.disabled`)
```json
{
  "mcpServers": {
    "github": {
      "command": "bunx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

## User Flows

### First Time User
```
1. User runs: cc-mcp
2. Tool creates mcp.json (filesystem enabled) and mcp.json.disabled (github example)
3. Shows list: ✓ filesystem, ✗ github
4. User can immediately use filesystem MCP
```

### Enable MCP
```
1. User runs: cc-mcp enable github
2. Sees: "✓ Enabled github"
3. Sees: "⚠️ Restart Claude Code: claude -r"
4. User restarts Claude Code
```

### Disable MCP
```
1. User runs: cc-mcp disable github
2. Sees: "✓ Disabled github (configuration preserved)"
3. Sees restart reminder
4. User can re-enable later with: cc-mcp enable github
```

## Success Metrics

- **Time to first value:** < 30 seconds (working filesystem MCP)
- **Configuration preservation:** 100% (vs 0% with Claude Code UI)
- **Time to toggle:** < 10 seconds (vs minutes of reconfiguration)
- **User errors:** Near zero through validation

## Out of Scope for MVP

**Cut from Original PRD:**
- ❌ Interactive toggle mode (add in v1.1)
- ❌ Add command with complex prompts (manual JSON editing acceptable)
- ❌ Backup system with 30-file rotation (configuration preservation is the backup)
- ❌ Doctor/recovery commands (not core functionality)
- ❌ Batch enable-all/disable-all (edge cases)
- ❌ 6 pre-configured MCPs (just filesystem + github example)

**Future Phases:**
- v1.1: Interactive toggle mode
- v1.2: Simple add command
- v1.3: Basic backup system
- v2.0: Advanced features based on user feedback

## Implementation Architecture

### Simplified Code Structure (~200 lines)
```typescript
// Core classes
class SimpleMCPManager {
  async list()           // Show all MCPs with status
  async enable(name)     // Move from disabled to enabled
  async disable(name)    // Move from enabled to disabled
  async init()           // Create default configs
}

// CLI commands
- cc-mcp [list]          // Default action
- cc-mcp enable <name>
- cc-mcp disable <name>
- cc-mcp init
```

### Key Simplifications
- **No backup rotation** - configuration preservation IS the backup
- **No interactive prompts** - simple command-line arguments
- **Minimal error handling** - basic validation with clear messages
- **Two config files** - enabled vs disabled, that's it

## Delivery Timeline

- **Day 1:** Core MCPManager class with enable/disable/list
- **Day 2:** CLI commands and auto-scaffolding
- **Day 3:** Testing, polish, and documentation

**Deliverables:**
1. Single TypeScript file (`cc-mcp.ts`)
2. Updated README with MVP instructions
3. Updated CLAUDE.md with simplified architecture

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Feature creep | Strict MVP scope, defer everything non-essential |
| Over-engineering | 200-line limit, single file |
| User confusion | Auto-scaffolding with working example |
| Adoption resistance | Immediate value (filesystem MCP works instantly) |

## Success Criteria

**MVP is successful if:**
1. Users can preserve MCP configurations when disabling
2. Tool works out-of-the-box with zero configuration
3. No more lost configurations due to Claude Code's destructive disable
4. Implementation stays under 200 lines of code
5. Delivery in 2-3 days

**Quote from MVP Advisor:** *"The best MVP is embarrassingly simple but solves the core problem perfectly. Users suffering from Claude Code's destructive disable will be thrilled with even basic configuration preservation."*