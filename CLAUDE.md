# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CC-MCP is a **minimal** command-line tool for managing Model Context Protocol (MCP) servers in Claude Code projects. It solves the critical problem that **Claude Code's built-in disable button permanently deletes MCP configurations**. This MVP provides basic configuration preservation, allowing users to disable MCPs without losing their setups.

**Core Value:** Preserve MCP configurations when disabling them, enabling instant re-activation without reconfiguration.

## MVP Architecture (True Minimal)

Following MVP advisor recommendations, this is now a **true MVP** with ~200 lines of code focused solely on configuration preservation.

### Core Components

**SimpleMCPManager Class** (target implementation):

- Handles enable/disable operations by moving configs between files
- Manages `.mcp.json` (enabled) and `.mcp.json.disabled` (disabled)
- Auto-scaffolds minimal configs on first run
- No complex backup system - configuration preservation IS the backup

**Configuration Files**:

- `.mcp.json`: Currently enabled MCP servers
- `.mcp.json.disabled`: Disabled MCP servers (preserves configuration)

### MVP Commands (4 Total)

```bash
# Core MVP commands
cc-mcp [list]        # Show all MCPs with status (default action)
cc-mcp enable <name> # Enable a specific MCP (move from disabled to enabled)
cc-mcp disable <name># Disable a specific MCP (move from enabled to disabled)  
cc-mcp init          # Initialize with minimal example configurations
```

### Default Configurations (Minimal)

**Enabled by Default**:

- `filesystem`: Safe, immediately useful MCP for local file access

**Disabled Example**:

- `github`: Common MCP with placeholder token

### Features Cut from MVP

**Removed for simplicity** (can add in v1.1+):

- ❌ Interactive toggle mode  
- ❌ Add command with complex prompts
- ❌ BackupManager class with 30-file rotation
- ❌ Doctor/recover commands
- ❌ Batch enable-all/disable-all
- ❌ Multiple pre-configured MCPs (just filesystem + github)

## Development Workflow (MVP)

1. **Preserve configurations** - never destructively edit, always move between files
2. **Test with temporary directories** to avoid affecting real MCP configs
3. **Auto-scaffold minimal configs** - tool creates working filesystem MCP on first run
4. **Simple validation** - basic JSON checks with clear error messages
5. **CLI-first design** - optimized for terminal workflow with Claude Code

### MVP Development Commands

```bash
# Run the MVP script directly with Deno
deno run --allow-read --allow-write src/mvp/cc-mcp-mvp.ts
# Or use task runner
deno task mvp

# Install locally for system-wide usage  
deno install --allow-read --allow-write --name cc-mcp src/mvp/cc-mcp-mvp.ts

# Test in safe environment
mkdir test-env && cd test-env
deno run --allow-read --allow-write ../src/mvp/cc-mcp-mvp.ts
```

### Permissions Required

- `--allow-read`: Read .mcp.json configuration files
- `--allow-write`: Write .mcp.json configuration files

## File Structure

```text
cc-mcp/
├── src/
│   ├── mvp/
│   │   └── cc-mcp-mvp.ts        # MVP implementation (~300 lines)
│   └── full/
│       └── cc-mcp-full.ts       # Full-featured version (for reference)
├── docs/                
│   ├── product/
│   │   ├── mvp-prd.md           # MVP requirements
│   │   └── full-prd.md          # Full requirements  
│   ├── user/
│   │   └── installation.md     # User installation guide
│   ├── developer/
│   │   └── architecture.md     # Technical architecture
│   └── reference/               # Reference materials
├── examples/
│   └── configs/                 # Sample MCP configurations
├── install.sh                   # One-command installation script
├── deno.json                    # Deno configuration
└── CLAUDE.md                    # This file
```

## MVP Implementation Notes

- **Single-file design**: All MVP functionality in `src/mvp/cc-mcp-mvp.ts` (~300 lines)
- **Minimal dependencies**: Basic Deno with simple console output (no Cliffy for MVP)
- **File-based state**: Just two JSON files - `.mcp.json` and `.mcp.json.disabled`
- **Safety-first**: Basic validation, clear error messages, restart reminders
- **Claude Code integration**: Works with existing MCP configuration format

## MVP CLI UX Patterns

- Simple console output with ✓/✗ status indicators
- Clear success/error messages
- Consistent command aliases (`ls`, `e`, `d`)
- Prominent restart reminders: "⚠️ Restart Claude Code: claude -c"
- Auto-scaffolding on first run for immediate value

## Target MVP Timeline

- **Day 1:** Core SimpleMCPManager class with enable/disable/list ✅
- **Day 2:** CLI commands, auto-scaffolding, and basic validation ✅
- **Day 3:** Testing, documentation updates, and polish ✅

## Post-MVP: Claude Code Integration Strategy

**CRITICAL INSIGHT**: CC-MCP only provides value if Claude Code environments know to use it instead of the built-in disable button. This is the #1 priority for post-MVP development.

### Phase 1: Claude Code Integration (Priority 1)

**Goal**: Every CC-MCP installation results in Claude Code environments that automatically use CC-MCP for MCP management.

**Key Features**:

- `cc-mcp setup-claude-integration` - Interactive wizard that configures CLAUDE.md files
- Auto-detection of Claude Code projects and integration status  
- CLAUDE.md templates with CC-MCP usage instructions
- Integration verification and health checks
- Migration from manual MCP management patterns

**Success Criteria**: Users install CC-MCP once and never accidentally use Claude Code's destructive disable button again.

### Implementation Approach

**Integration Commands**:

- `cc-mcp setup-claude-integration` - Setup wizard for Claude Code integration
- `cc-mcp check-claude-integration` - Verify integration is working
- `cc-mcp generate-claude-template` - Create CLAUDE.md templates
- `cc-mcp migrate-claude-setup` - Migrate existing manual MCP management

**CLAUDE.md Templates**:

- Global template (`~/.claude/CLAUDE.md`) with CC-MCP usage patterns
- Project-specific templates with current MCP context
- Backup and recovery instructions for CLAUDE.md files
- Integration troubleshooting guidance

**Auto-Detection**:

- Detect Claude Code projects (look for `.claude/` directory)
- Check for existing CLAUDE.md files and CC-MCP instructions
- Warn when integration is missing or broken
- Suggest setup steps when running in unintegrated projects

## ✅ Phase 1.1 Implementation Complete - Public Release Success

**Status**: **COMPLETED** - CC-MCP v1.0.0 Public Release Live (August 2025)

### 🎉 Mission Accomplished

Successfully delivered CC-MCP Phase 1.1 using **parallel agent execution with git worktrees**, completing 9 GitHub issues (20 story points) in record time.

### Implementation Results

**Phase 1A: Foundation Work** ✅ **COMPLETED**
- ✅ **Issue #11**: MIT License File (2 pts) - Agent 1 (License & Security)
- ✅ **Issue #17**: Security Validation (1 pt) - Agent 1 (License & Security)  
- ✅ **Issue #6**: Public GitHub Repository (3 pts) - Agent 2 (Repository Infrastructure)
- ✅ **Issue #7**: Repository Settings (2 pts) - Agent 2 (Repository Infrastructure)

**Phase 1B: Content & Release** ✅ **COMPLETED**
- ✅ **Issue #9**: Update README URLs (2 pts) - Agent 3 (Documentation)
- ✅ **Issue #10**: Documentation Validation (2 pts) - Agent 3 (Documentation)
- ✅ **Issue #8**: Push Initial Codebase (3 pts) - Agent 4 (Release & Testing)
- ✅ **Issue #12**: v1.0.0 Release (3 pts) - Agent 4 (Release & Testing)
- ✅ **Issue #13**: Installation Validation (2 pts) - Agent 4 (Release & Testing)

### 🚀 Key Achievements

**✅ Business Value Delivered:**
- **Public Repository**: https://github.com/lisaross/cc-mcp
- **v1.0.0 Release**: Tagged and installable
- **One-Command Installation**: `curl -fsSL https://raw.githubusercontent.com/lisaross/cc-mcp/main/install.sh | sh`
- **Manual Installation**: `deno install --global --allow-read --allow-write --name cc-mcp --force https://raw.githubusercontent.com/lisaross/cc-mcp/main/src/mvp/cc-mcp-mvp.ts`

**✅ Workflow Innovation Validated:**
- **Parallel Agent Execution**: 4 agents working simultaneously in git worktrees
- **Time Savings**: Reduced weeks of sequential work to hours of parallel execution
- **Zero Major Conflicts**: Clean merge coordination with proper dependency management

**✅ Professional Standards Met:**
- MIT License added for open source distribution
- Comprehensive security validation (SECURITY_VALIDATION.md)
- Repository properly configured with topics and protection
- Documentation MVP-aligned and complete

### Parallel Agent Execution Pattern (PROVEN)

**Git Worktree Strategy:**
```bash
# Create parallel execution environment
git worktree add worktrees/license-security feature/license-security
git worktree add worktrees/repo-setup feature/repo-setup  
git worktree add worktrees/docs-update feature/docs-update
git worktree add worktrees/release-validation feature/release-validation

# Agents work simultaneously, merge sequentially by dependency
```

**Agent Specialization:**
- **Agent 1**: License & Security (chore + security specialist)
- **Agent 2**: Repository Infrastructure (automation-builder)  
- **Agent 3**: Documentation (knowledge-worker)
- **Agent 4**: Release & Testing (feature-developer)

### Phase 1.2 Enhancements (In Progress)

- **Issue #14**: Research Deno Land Registry (1 pt)
- **Issue #15**: Submit to Deno Land Registry (1 pt)  
- ✅ **Issue #16**: Create Installation Script (1 pt) - **COMPLETED**

### Workflow Integration Notes for Future Development

- **Parallel Agent System**: Validated and ready for larger development phases
- **Git Worktree Management**: Proven pattern for conflict-free parallel development
- **Issue Traceability**: Complete GitHub PM infrastructure with proper labeling and story points
- **Professional Standards**: Security validation, proper licensing, comprehensive documentation established
