# CC-MCP Manager Architecture & Implementation Plan

## Project Structure

```
cc-mcp/
├── src/
│   ├── commands/
│   │   ├── enable.ts
│   │   ├── disable.ts
│   │   ├── toggle.ts
│   │   ├── list.ts
│   │   ├── add.ts
│   │   ├── profile.ts
│   │   └── validate.ts
│   ├── utils/
│   │   ├── config.ts      # Read/write MCP configs
│   │   ├── validator.ts   # Validate MCP structures
│   │   ├── marketplace.ts # Fetch from marketplace
│   │   └── restart.ts     # Restart notifications
│   ├── types/
│   │   └── mcp.ts        # TypeScript interfaces
│   └── cli.ts            # Main Cliffy setup
├── templates/            # MCP config templates
├── deno.json
└── README.md
```

## Core Implementation

### 1. Configuration Manager

```typescript
// utils/config.ts
interface MCPConfig {
  mcpServers: Record<string, MCPServer>;
}

interface MCPServer {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

class ConfigManager {
  private configPath = "./mcp.json";
  private disabledPath = "./mcp.json.disabled";
  
  async getEnabled(): Promise<MCPConfig> {}
  async getDisabled(): Promise<MCPConfig> {}
  async enableMCP(name: string): Promise<void> {}
  async disableMCP(name: string): Promise<void> {}
  async getAllMCPs(): Promise<{name: string, enabled: boolean}[]> {}
}
```

### 2. CLI Structure with Cliffy

```typescript
// cli.ts
import { Command } from "https://deno.land/x/cliffy/command/mod.ts";

const cli = new Command()
  .name("cc-mcp")
  .version("1.0.0")
  .description("Claude Code MCP Manager")
  
  // List command
  .command("list", "List all MCPs and their status")
  .alias("ls")
  .action(listCommand)
  
  // Enable command
  .command("enable <name:string>", "Enable an MCP")
  .action(enableCommand)
  
  // Disable command
  .command("disable <name:string>", "Disable an MCP")
  .action(disableCommand)
  
  // Interactive toggle
  .command("toggle", "Interactive MCP toggle")
  .action(toggleCommand)
  
  // Add from marketplace
  .command("add <package:string>", "Add MCP from marketplace")
  .action(addCommand)
  
  // Profile management
  .command("profile", new Command()
    .command("save <name:string>", "Save current config as profile")
    .command("load <name:string>", "Load a saved profile")
    .command("list", "List saved profiles")
  );
```

### 3. Interactive Toggle Feature

```typescript
// commands/toggle.ts
import { Checkbox } from "https://deno.land/x/cliffy/prompt/mod.ts";

export async function toggleCommand() {
  const mcps = await configManager.getAllMCPs();
  
  const selected = await Checkbox.prompt({
    message: "Select MCPs to toggle:",
    options: mcps.map(mcp => ({
      name: `${mcp.enabled ? '✓' : '✗'} ${mcp.name}`,
      value: mcp.name,
      checked: mcp.enabled
    }))
  });
  
  // Update configurations based on selection
  for (const mcp of mcps) {
    if (selected.includes(mcp.name) && !mcp.enabled) {
      await configManager.enableMCP(mcp.name);
    } else if (!selected.includes(mcp.name) && mcp.enabled) {
      await configManager.disableMCP(mcp.name);
    }
  }
  
  showRestartReminder();
}
```

### 4. Marketplace Integration

```typescript
// utils/marketplace.ts
interface MarketplaceMCP {
  name: string;
  description: string;
  config: MCPServer;
  repository: string;
  verified: boolean;
}

class Marketplace {
  private apiUrl = "https://mcp-marketplace.example.com/api";
  
  async search(query: string): Promise<MarketplaceMCP[]> {}
  async getPackage(name: string): Promise<MarketplaceMCP> {}
  async install(package: MarketplaceMCP): Promise<void> {}
}
```

## Key Features Implementation

### 1. Restart Reminder

```typescript
function showRestartReminder() {
  console.log(colors.yellow("\n⚠️  Configuration changed!"));
  console.log(colors.yellow("Please restart Claude Code for changes to take effect."));
  console.log(colors.dim("Quit Claude Code and run: ") + colors.cyan("claude -r") + colors.dim(" to resume"));
}
```

### 2. Configuration Validation

```typescript
// utils/validator.ts
function validateMCPConfig(config: unknown): config is MCPServer {
  // Check required fields
  if (!config.command) return false;
  
  // Validate command exists
  try {
    const result = await Deno.command(config.command, { args: ["--version"] }).output();
    return result.success;
  } catch {
    return false;
  }
}
```

### 3. Profile Management

```typescript
// Store profiles in ~/.cc-mcp/profiles/
class ProfileManager {
  async saveProfile(name: string) {
    const current = await configManager.getEnabled();
    await Deno.writeTextFile(
      `~/.cc-mcp/profiles/${name}.json`,
      JSON.stringify(current, null, 2)
    );
  }
  
  async loadProfile(name: string) {
    const profile = await Deno.readTextFile(`~/.cc-mcp/profiles/${name}.json`);
    // Apply profile configuration
  }
}
```

## Visual Design with Cliffy

### Beautiful List Output

```typescript
function formatMCPList(mcps: MCPInfo[]) {
  const table = new Table()
    .header(["Status", "Name", "Command", "Description"])
    .body(mcps.map(mcp => [
      mcp.enabled ? colors.green("✓") : colors.red("✗"),
      colors.bold(mcp.name),
      colors.dim(mcp.command),
      mcp.description || colors.dim("No description")
    ]))
    .border(true)
    .render();
}
```

### Interactive Prompts

```typescript
// Beautiful confirmation prompts
const confirm = await Confirm.prompt({
  message: "This will disable all MCPs. Continue?",
  default: false,
});

// Progress indicators
const spinner = new Spinner({ message: "Fetching from marketplace..." });
spinner.start();
// ... do work
spinner.stop();
```

## Installation & Usage

### Installation

```bash
deno install --allow-read --allow-write --allow-net --name cc-mcp https://raw.githubusercontent.com/user/cc-mcp/main/cli.ts
```

### Basic Usage

```bash
# Initialize with examples (first time)
cc-mcp init

# List all MCPs
cc-mcp list

# Enable/disable specific MCP
cc-mcp enable filesystem
cc-mcp disable github

# Interactive mode
cc-mcp toggle

# Add from marketplace
cc-mcp add @smithery/weather-mcp

# Profile management
cc-mcp profile save "web-dev"
cc-mcp profile load "data-science"
```

## Future Enhancements

1. **Auto-restart** - Possibly automate `claude -r` command after changes
2. **Dependency Management** - Handle MCP dependencies
3. **Version Control** - Track MCP versions and updates
4. **Import/Export** - Share configurations with team
5. **MCP Templates** - Quick setup for common scenarios
6. **Health Checks** - Verify MCPs are working correctly
7. **Usage Analytics** - Track which MCPs are used most
8. **Config Migration** - Update configs when MCP APIs change

## Development Tips

1. Use Deno for modern TypeScript and built-in tools
2. Cliffy provides excellent CLI UX components
3. Store user data in `~/.cc-mcp/` for persistence
4. Add `--dry-run` flag for testing changes
5. Include comprehensive `--help` for all commands
6. Add JSON output format for scripting: `--json`
