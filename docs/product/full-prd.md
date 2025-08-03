# CC-MCP Product Requirements Document

## Product Overview

**Product Name:** CC-MCP (Claude Code MCP Manager)  
**Version:** 1.0.0 (MVP)  
**Platform:** Command Line Interface (CLI)  
**Technology:** TypeScript/Deno with Cliffy framework

## Executive Summary

CC-MCP is a lightweight command-line tool that simplifies the management of Model Context Protocol (MCP) servers within Claude Code projects. It provides a user-friendly interface to enable, disable, and configure MCP servers without manually editing JSON files, while preserving configurations that Claude Code's built-in UI would delete.

The tool includes:

- Configuration preservation (unlike Claude Code's destructive disable)
- Automatic backup and recovery system
- Sensible defaults with 7 pre-configured MCPs
- Claude Code-style branding for instant recognition

Version 1.0.0 delivers 10 essential features focused on solving the immediate pain points of MCP management.

### Problem Statement

Currently, managing MCP servers in Claude Code has critical limitations:

- **Claude Code's disable button DELETES configurations entirely** - no way to re-enable without recreating
- Context window pollution - some MCPs (e.g., Canva) consume significant context when not needed
- Manually editing `mcp.json` configuration files
- Remembering complex JSON syntax and environment variables
- No easy way to temporarily disable MCPs without losing configuration
- Manual restart of Claude Code after changes
- Risk of syntax errors breaking configurations

**Critical Issue:** When you disable an MCP using Claude Code's built-in UI, it permanently deletes the configuration from `mcp.json`. For MCPs with complex setups (API keys, custom paths, specific arguments), this means you have to reconfigure everything from scratch when you want to use it again.

### Solution

A simple CLI tool that:

- **Preserves MCP configurations** when disabling (unlike Claude Code's destructive disable)
- Moves MCP configurations between `mcp.json` (enabled) and `mcp.json.disabled` (disabled)
- Provides visual feedback on MCP status
- Reminds users to restart Claude Code after changes
- Offers both quick commands and interactive modes
- Enables task-based MCP management (enable only what you need, when you need it)

## MVP Scope (v1.0.0)

### Core Features (7 total)

#### 1. List MCPs (`list`, `ls`)

Display all MCPs with their current status (enabled/disabled).

**Acceptance Criteria:**

- Shows all MCPs from both `mcp.json` and `mcp.json.disabled`
- Displays status with visual indicators (✓/✗)
- Shows MCP name and base command
- Works as default action when running `cc-mcp` without arguments

#### 2. Enable MCP (`enable <name>`, `e <name>`)

Move an MCP configuration from disabled to enabled state.

**Acceptance Criteria:**

- Moves configuration from `mcp.json.disabled` to `mcp.json`
- Shows success/error message
- Displays restart reminder on success
- Handles case when MCP not found or already enabled

#### 3. Disable MCP (`disable <name>`, `d <name>`)

Move an MCP configuration from enabled to disabled state.

**Acceptance Criteria:**

- Moves configuration from `mcp.json` to `mcp.json.disabled`
- Shows success/error message
- Displays restart reminder on success
- Handles case when MCP not found or already disabled

#### 4. Interactive Toggle (`toggle`, `t`)

Interactive checkbox interface to enable/disable multiple MCPs at once.

**Acceptance Criteria:**

- Shows all MCPs with checkboxes
- Space to toggle, Enter to confirm
- Shows current state for each MCP
- Updates all changed MCPs in one operation
- Single restart reminder after all changes

#### 5. Add New MCP (`add <name>`)

Manually add a new MCP configuration with interactive prompts.

**Acceptance Criteria:**

- Prompts for command (e.g., "npx", "node")
- Prompts for arguments (e.g., "@modelcontextprotocol/server-filesystem")
- Optional: prompts for environment variables
- Validates JSON structure
- Adds to `mcp.json.disabled` by default
- Suggests running `enable <name>` to activate

**Example Flow:**

```
$ cc-mcp add postgres
? Command: bun
? Arguments (comma-separated): x, @modelcontextprotocol/server-postgres
? Add environment variables? No
✓ Added 'postgres' to disabled MCPs
Run 'cc-mcp enable postgres' to activate
```

**Alternative with bunx:**

```
$ cc-mcp add weather
? Command: bunx
? Arguments (comma-separated): @modelcontextprotocol/server-weather
? Add environment variables? Yes
? Environment variable name: WEATHER_API_KEY
? Environment variable value: ****
✓ Added 'weather' to disabled MCPs
```

#### 6. Restart Reminder

After any configuration change, display a prominent reminder.

**Acceptance Criteria:**

- Yellow warning icon and text
- Clear instructions: "Quit Claude Code and run: claude -c to resume"
- Appears after enable, disable, toggle operations
- Not shown if no changes were made

#### 7. Initialize with Examples (`init`)

Create default configuration files with common MCP examples.

**Acceptance Criteria:**

- Creates mcp.json with filesystem MCP enabled
- Creates mcp.json.disabled with 6 common MCPs (github, sqlite, anthropic, slack, postgres, google_drive)
- Shows placeholder values for API keys and tokens
- Warns if files already exist and asks for confirmation
- Displays summary of what was created

### Technical Requirements

#### File Management

- Read/write `mcp.json` and `mcp.json.disabled` in current directory
- **Auto-scaffold on first run** if files don't exist
- Create files with example configurations automatically
- Preserve JSON formatting (2-space indent)
- Handle malformed JSON gracefully

#### Backup System

- Automatic backup before every configuration change
- Store backups in `./.cc-mcp/backups/` directory
- Keep last 30 backups with auto-cleanup
- Timestamp-based backup naming
- Detect orphaned configs (deleted via Claude Code UI)

#### First Run Experience

- Automatically create configuration files with examples
- Enable only filesystem MCP by default (safe, useful)
- Provide 6 common MCPs in disabled state with clear placeholders
- Show helpful messages about what was created

#### User Experience

- **Orange CC-MCP ASCII logo** similar to Claude Code branding
- Beautiful CLI output using Cliffy colors and formatting
- Clear error messages
- Consistent command aliases for speed
- Help text for all commands
- Version command (`--version`, `-V`)
- **Zero-friction start:** Auto-creates example configs on first run
- **Immediate value:** Filesystem MCP works out of the box

#### Platform Support

- **macOS only for MVP** (simplified testing and distribution)
- Built with Deno (cross-platform capable for future)

#### Installation

- Single-file Deno script
- Install command: `deno install --allow-read --allow-write --name cc-mcp <url>`
- No external dependencies beyond Cliffy

### Out of Scope for MVP

The following features are NOT included in v1.0.0:

- Docker container management
- Automatic updates
- Marketplace integration (beyond manual add)
- Profile management (beyond init)
- MCP health checks
- Log viewing
- Backup/restore (beyond init reset)
- Git-based version control
- Automated MCP discovery
- Configuration wizards (beyond basic prompts)

## User Flows

### First Time User Flow

```
1. User runs: cc-mcp list
2. Tool detects no config files
3. Automatically creates mcp.json and mcp.json.disabled with examples
4. Shows list with filesystem enabled, 6 common MCPs disabled
5. User can immediately start using filesystem MCP
6. User configures API keys for other MCPs as needed
```

### Primary Flow: Toggle MCPs

```
1. User runs: cc-mcp toggle
2. Sees interactive checklist of all MCPs
3. Uses space to toggle selections
4. Presses Enter to confirm
5. Sees success message with count of changes
6. Sees restart reminder with claude -c command
7. Quits Claude Code and runs: claude -c
```

### Quick Enable Flow

```
1. User runs: cc-mcp enable github
2. Sees: "✓ Enabled github"
3. Sees restart reminder
4. Quits Claude Code and runs: claude -c
```

### Add New MCP Flow

```
1. User runs: cc-mcp add weather
2. Answers prompts for command and args
3. MCP added to mcp.json.disabled
4. User runs: cc-mcp enable weather
5. Sees restart reminder
6. Quits Claude Code and runs: claude -c
```

## Success Metrics

- **Time to first value:** < 30 seconds (auto-scaffold with working filesystem MCP)
- **Time to toggle MCP:** < 10 seconds (vs 1-2 minutes manually)
- **JSON syntax errors:** 0 (vs common with manual editing)
- **User errors:** Reduced by 90% through validation
- **Configuration preservation:** 100% (vs 0% with Claude Code UI)
- **Context window efficiency:** Improved by enabling only task-relevant MCPs
- **Adoption:** Used by Claude Code developers daily

## Usage Guidelines & Best Practices

### Critical Warning

⚠️ **DO NOT use Claude Code's built-in disable button for MCPs** - it permanently deletes the configuration. Always use CC-MCP for enabling/disabling to preserve your settings.

### Recommended Workflow

1. **Configure once:** Set up all your MCPs with their API keys, paths, and arguments
2. **Enable per task:** Only enable MCPs needed for current work
3. **Disable when done:** Free up context window for other tasks
4. **Re-enable instantly:** Configurations preserved for immediate reuse

### Context Window Management

Some MCPs consume significant context window space even when idle. Best practices:

- **Heavy MCPs** (Canva, large databases): Enable only when actively using
- **Light MCPs** (filesystem, simple tools): Can leave enabled
- **Task switching:** Disable previous task's MCPs before enabling new ones

### Example Scenarios

- **Web Development:** Enable `filesystem`, `github`; disable `canva`, `database`
- **Design Work:** Enable `canva`, `filesystem`; disable `github`, `database`
- **Data Analysis:** Enable `database`, `sqlite`; disable `canva`, `github`

## Future Vision (Not in MVP)

### Phase 2: Security & Recovery (Partially in MVP)

- **Security Advisory System**: Monitor for compromised/hacked MCPs
- **Automatic Security Checks**: Warn before enabling known vulnerable MCPs
- ~~**Recovery Mechanism**: Restore configs deleted by Claude Code's disable~~ ✅ In MVP
- ~~**Backup System**: Time-based automatic backups~~ ✅ In MVP
- **Vulnerability Database**: Integration with CVE and security advisories

### Phase 3: In-CLI Marketplace & Research

- **Purpose-based Discovery**: "Find MCPs for database access"
- **Side-by-side Comparisons**: Compare features, performance, security
- **AI Recommendations**: Claude analyzes project needs
- **Community Reviews**: Ratings and feedback within CLI
- **Performance Metrics**: Context usage, startup time, stability
- **No Browser Needed**: Complete research workflow in terminal
- **Rate/Report MCPs**: Mark MCPs as unsafe with notes for review

### Phase 4: Import & Settings Management

- **Import from Other Projects**: `cc-mcp import ../other-project`
- **User/Shared/Project Settings**: Similar to Claude Code's structure
  - User-level defaults: `~/.cc-mcp/user-settings.json`
  - Shared team configs: `.cc-mcp/shared/`
  - Project overrides: `.cc-mcp/project.json`
- **Settings Hierarchy**: Project > Shared > User > Defaults
- **Export Configurations**: Share setups with team members
- **Template Library**: Common MCP combinations for different workflows

### Phase 5: Enhanced Management

- Profiles for different project types
- Bulk operations (enable-all, disable-all) ✅ In MVP
- Configuration templates
- JSON schema validation
- Environment-based configs (dev/staging/prod)

### Phase 6: Local Package Management

- Clone MCPs locally instead of using npx
- Git-based update management
- Version pinning and rollback
- Dependency resolution
- Offline mode support

### Phase 7: Advanced Security & Isolation

- Optional Docker containerization
- Resource limits and monitoring
- Network isolation policies
- Sandboxing rules per MCP
- Audit logging

### Phase 8: Enterprise & Team Features

- Shared configuration repositories
- Centralized security policies
- Usage analytics and reporting
- Compliance tracking
- Role-based access control

## Technical Architecture

### Technology Stack

- **Runtime:** Deno 1.40+
- **Language:** TypeScript
- **CLI Framework:** Cliffy
- **File Format:** JSON

### Code Structure

```
cc-mcp.ts           # Single file containing all functionality
├── MCPManager      # Core configuration management
├── CLI Commands    # Cliffy command definitions
├── UI Helpers      # Formatting and display
└── Main            # Entry point
```

### Dependencies

- Cliffy (CLI framework) - via Deno imports
- No other external dependencies

## Delivery

### MVP Deliverables

1. Single TypeScript file (`cc-mcp.ts`)
2. README with installation and usage instructions
3. Examples of common workflows

### Installation Instructions

```bash
# Install from URL
deno install --allow-read --allow-write --name cc-mcp https://example.com/cc-mcp.ts

# Or install locally
deno install --allow-read --allow-write --name cc-mcp ./cc-mcp.ts

# Permissions needed:
# --allow-read: Read mcp.json files
# --allow-write: Write mcp.json files
```

### Testing

- Manual testing of all commands
- Edge cases: missing files (auto-created), malformed JSON, duplicate names
- Verify scaffold creates working configurations
- Test with actual Claude Code to ensure MCPs work
- Cross-platform testing (macOS, Windows, Linux)

## Constraints & Assumptions

### Constraints

- Must work within Claude Code's file system
- Cannot programmatically restart Claude Code
- Limited to file-based configuration
- **macOS only for MVP** (simplified distribution and testing)

### Assumptions

- Users have Deno installed (macOS)
- Users understand basic CLI usage
- MCP configuration format remains stable
- Users have write permissions in project directory
- macOS environment for initial release

## Risk Mitigation

| Risk                                    | Mitigation                                 |
| --------------------------------------- | ------------------------------------------ |
| Corrupted JSON files                    | Validate before writing, keep backups      |
| User accidentally disables critical MCP | Easy to re-enable, clear status display    |
| Claude Code changes MCP format          | Simple architecture easy to update         |
| Users forget to restart                 | Prominent reminder after every change      |
| New users confused about MCPs           | Auto-scaffold with working examples        |
| Complex MCP configurations              | Pre-configured templates with placeholders |

## Conclusion

CC-MCP v1.0.0 provides a minimal but highly useful tool for Claude Code developers. By focusing on the core problem of configuration management and including sensible defaults, we can deliver immediate value with zero learning curve. Users can be productive within seconds of installation. The simple architecture and clear scope ensure we can ship quickly and iterate based on user feedback.
