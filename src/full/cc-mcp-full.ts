// cc-mcp.ts - Minimal working implementation with backup/recovery
import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";
import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.3/ansi/colors.ts";
import { Table } from "https://deno.land/x/cliffy@v1.0.0-rc.3/table/mod.ts";
import { Checkbox, Confirm } from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/mod.ts";

// ASCII art similar to Claude Code style
const CC_MCP_LOGO = `
${colors.rgb24("█▀▀ █▀▀ ▄▄ █▀▄▀█ █▀▀ █▀█", 0xFF6600)}
${colors.rgb24("█▄▄ █▄▄ ░░ █░▀░█ █▄▄ █▀▀", 0xFF6600)}
`;

interface MCPConfig {
  mcpServers: Record<string, any>;
}

interface Backup {
  timestamp: string;
  operation: string;
  configs: {
    enabled: MCPConfig;
    disabled: MCPConfig;
  };
}

// Default scaffold configurations
const DEFAULT_ENABLED: MCPConfig = {
  mcpServers: {
    filesystem: {
      command: "bunx",
      args: ["@modelcontextprotocol/server-filesystem", "./"],
    },
  },
};

const DEFAULT_DISABLED: MCPConfig = {
  mcpServers: {
    github: {
      command: "bunx",
      args: ["@modelcontextprotocol/server-github"],
      env: {
        GITHUB_PERSONAL_ACCESS_TOKEN: "your-token-here",
      },
    },
    sqlite: {
      command: "bunx",
      args: ["@modelcontextprotocol/server-sqlite", "database.db"],
    },
    anthropic: {
      command: "bunx",
      args: ["@modelcontextprotocol/server-anthropic"],
      env: {
        ANTHROPIC_API_KEY: "your-api-key-here",
      },
    },
    slack: {
      command: "bunx",
      args: ["@modelcontextprotocol/server-slack"],
      env: {
        SLACK_BOT_TOKEN: "xoxb-your-token",
        SLACK_TEAM_ID: "your-team-id",
      },
    },
    postgres: {
      command: "bunx",
      args: ["@modelcontextprotocol/server-postgres", "postgresql://localhost/mydb"],
    },
    google_drive: {
      command: "bunx",
      args: ["@modelcontextprotocol/server-gdrive"],
      env: {
        GOOGLE_DRIVE_CLIENT_ID: "your-client-id",
        GOOGLE_DRIVE_CLIENT_SECRET: "your-client-secret",
      },
    },
  },
};

class BackupManager {
  private backupDir = "./.cc-mcp/backups";

  async ensureBackupDir(): Promise<void> {
    try {
      await Deno.mkdir(this.backupDir, { recursive: true });
    } catch {
      // Directory already exists
    }
  }

  async createBackup(operation: string, enabled: MCPConfig, disabled: MCPConfig): Promise<void> {
    await this.ensureBackupDir();

    const backup: Backup = {
      timestamp: new Date().toISOString(),
      operation,
      configs: { enabled, disabled },
    };

    const backupPath = `${this.backupDir}/${backup.timestamp.replace(/[:.]/g, "-")}.json`;
    await Deno.writeTextFile(backupPath, JSON.stringify(backup, null, 2));

    // Keep only last 30 backups
    await this.cleanOldBackups();
  }

  async cleanOldBackups(): Promise<void> {
    const backups = await this.listBackups();
    if (backups.length > 30) {
      const toDelete = backups.slice(30);
      for (const backup of toDelete) {
        await Deno.remove(`${this.backupDir}/${backup.filename}`);
      }
    }
  }

  async listBackups(): Promise<Array<{ filename: string; timestamp: Date; operation: string }>> {
    await this.ensureBackupDir();

    const entries = [];
    for await (const entry of Deno.readDir(this.backupDir)) {
      if (entry.isFile && entry.name.endsWith(".json")) {
        try {
          const content = await Deno.readTextFile(`${this.backupDir}/${entry.name}`);
          const backup = JSON.parse(content) as Backup;
          entries.push({
            filename: entry.name,
            timestamp: new Date(backup.timestamp),
            operation: backup.operation,
          });
        } catch {
          // Invalid backup file
        }
      }
    }

    return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getBackup(filename: string): Promise<Backup | null> {
    try {
      const content = await Deno.readTextFile(`${this.backupDir}/${filename}`);
      return JSON.parse(content) as Backup;
    } catch {
      return null;
    }
  }

  async detectOrphans(currentEnabled: MCPConfig, currentDisabled: MCPConfig): Promise<string[]> {
    const backups = await this.listBackups();
    if (backups.length === 0) return [];

    const latestBackup = await this.getBackup(backups[0].filename);
    if (!latestBackup) return [];

    const orphans: string[] = [];
    const currentMCPs = new Set([
      ...Object.keys(currentEnabled.mcpServers),
      ...Object.keys(currentDisabled.mcpServers),
    ]);

    // Check enabled MCPs from backup
    for (const name of Object.keys(latestBackup.configs.enabled.mcpServers)) {
      if (!currentMCPs.has(name)) {
        orphans.push(name);
      }
    }

    // Check disabled MCPs from backup
    for (const name of Object.keys(latestBackup.configs.disabled.mcpServers)) {
      if (!currentMCPs.has(name)) {
        orphans.push(name);
      }
    }

    return [...new Set(orphans)]; // Remove duplicates
  }
}

class MCPManager {
  configPath = "./mcp.json";
  disabledPath = "./mcp.json.disabled";
  private backupManager = new BackupManager();

  async readConfig(path: string): Promise<MCPConfig> {
    try {
      const content = await Deno.readTextFile(path);
      return JSON.parse(content);
    } catch {
      return { mcpServers: {} };
    }
  }

  async writeConfig(path: string, config: MCPConfig): Promise<void> {
    await Deno.writeTextFile(path, JSON.stringify(config, null, 2));
  }

  async ensureConfigFiles(): Promise<void> {
    // Check if files exist
    const enabledExists = await this.fileExists(this.configPath);
    const disabledExists = await this.fileExists(this.disabledPath);

    // Create with defaults if they don't exist
    if (!enabledExists) {
      console.log(colors.dim("Creating mcp.json with default configuration..."));
      await this.writeConfig(this.configPath, DEFAULT_ENABLED);
    }

    if (!disabledExists) {
      console.log(colors.dim("Creating mcp.json.disabled with example configurations..."));
      await this.writeConfig(this.disabledPath, DEFAULT_DISABLED);
    }
  }

  async fileExists(path: string): Promise<boolean> {
    try {
      await Deno.stat(path);
      return true;
    } catch {
      return false;
    }
  }

  async getAllMCPs(): Promise<Array<{ name: string; enabled: boolean; config: any }>> {
    await this.ensureConfigFiles();

    const enabled = await this.readConfig(this.configPath);
    const disabled = await this.readConfig(this.disabledPath);

    const mcps = [];

    for (const [name, config] of Object.entries(enabled.mcpServers)) {
      mcps.push({ name, enabled: true, config });
    }

    for (const [name, config] of Object.entries(disabled.mcpServers)) {
      mcps.push({ name, enabled: false, config });
    }

    return mcps.sort((a, b) => a.name.localeCompare(b.name));
  }

  async enableMCP(name: string): Promise<boolean> {
    await this.ensureConfigFiles();
    const enabled = await this.readConfig(this.configPath);
    const disabled = await this.readConfig(this.disabledPath);

    // Create backup before change
    await this.backupManager.createBackup(`Enable ${name}`, enabled, disabled);

    if (disabled.mcpServers[name]) {
      enabled.mcpServers[name] = disabled.mcpServers[name];
      delete disabled.mcpServers[name];

      await this.writeConfig(this.configPath, enabled);
      await this.writeConfig(this.disabledPath, disabled);
      return true;
    }

    return false;
  }

  async disableMCP(name: string): Promise<boolean> {
    await this.ensureConfigFiles();
    const enabled = await this.readConfig(this.configPath);
    const disabled = await this.readConfig(this.disabledPath);

    // Create backup before change
    await this.backupManager.createBackup(`Disable ${name}`, enabled, disabled);

    if (enabled.mcpServers[name]) {
      disabled.mcpServers[name] = enabled.mcpServers[name];
      delete enabled.mcpServers[name];

      await this.writeConfig(this.configPath, enabled);
      await this.writeConfig(this.disabledPath, disabled);
      return true;
    }

    return false;
  }

  async checkForOrphans(): Promise<string[]> {
    const enabled = await this.readConfig(this.configPath);
    const disabled = await this.readConfig(this.disabledPath);
    return this.backupManager.detectOrphans(enabled, disabled);
  }

  getBackupManager(): BackupManager {
    return this.backupManager;
  }
}

const manager = new MCPManager();

function showRestartReminder() {
  console.log();
  console.log(colors.yellow("⚠️  Configuration changed!"));
  console.log(colors.yellow("Please restart Claude Code for changes to take effect."));
  console.log(
    colors.dim("Quit Claude Code and run: ") + colors.cyan("claude -c") + colors.dim(" to resume"),
  );
  console.log();
}

function showLogo() {
  console.log(CC_MCP_LOGO);
  console.log(colors.dim("MCP Manager for Claude Code\n"));
}

// List command
async function listCommand() {
  showLogo();
  const mcps = await manager.getAllMCPs();

  if (mcps.length === 0) {
    console.log(
      colors.yellow("No MCP servers found. Run 'cc-mcp init' to create example configurations."),
    );
    return;
  }

  const table = new Table()
    .header([colors.bold("Status"), colors.bold("Name"), colors.bold("Command")])
    .body(mcps.map((mcp) => [
      mcp.enabled ? colors.green("✓ enabled") : colors.dim("✗ disabled"),
      mcp.name,
      colors.dim(mcp.config.command || "N/A"),
    ]))
    .maxColWidth(40)
    .padding(1)
    .indent(2);

  console.log(table.toString());
  console.log();
  console.log(colors.dim("  Example: bunx, bun x, npx, node, python, etc."));

  // Check for orphaned MCPs
  const orphans = await manager.checkForOrphans();
  if (orphans.length > 0) {
    console.log();
    console.log(colors.yellow(`⚠️  Detected ${orphans.length} missing MCP configuration(s)`));
    console.log(colors.dim("  These may have been deleted using Claude Code's UI"));
    console.log(colors.dim("  Run 'cc-mcp doctor' to see details"));
  }

  console.log();
}

// Enable command
async function enableCommand(_: any, name: string) {
  const success = await manager.enableMCP(name);

  if (success) {
    console.log(colors.green(`✓ Enabled ${name}`));
    showRestartReminder();
  } else {
    console.log(colors.red(`✗ MCP '${name}' not found in disabled list`));
    console.log(colors.dim("Run 'cc-mcp list' to see available MCPs"));
  }
}

// Disable command
async function disableCommand(_: any, name: string) {
  const success = await manager.disableMCP(name);

  if (success) {
    console.log(colors.green(`✓ Disabled ${name}`));
    showRestartReminder();
  } else {
    console.log(colors.red(`✗ MCP '${name}' not found in enabled list`));
    console.log(colors.dim("Run 'cc-mcp list' to see available MCPs"));
  }
}

// Interactive toggle command
async function toggleCommand() {
  showLogo();
  const mcps = await manager.getAllMCPs();

  if (mcps.length === 0) {
    console.log(
      colors.yellow("No MCP servers found. Run 'cc-mcp init' to create example configurations."),
    );
    return;
  }

  // Create backup before toggle
  const enabled = await manager.readConfig(manager.configPath);
  const disabled = await manager.readConfig(manager.disabledPath);
  await manager.getBackupManager().createBackup("Toggle MCPs", enabled, disabled);

  const selected = await Checkbox.prompt({
    message: "Select MCPs to enable (space to toggle, enter to confirm):",
    options: mcps.map((mcp) => ({
      name: `${mcp.name} (${mcp.config.command || "N/A"})`,
      value: mcp.name,
      checked: mcp.enabled,
    })),
  });

  let changes = 0;

  for (const mcp of mcps) {
    const shouldBeEnabled = selected.includes(mcp.name);

    if (shouldBeEnabled && !mcp.enabled) {
      await manager.enableMCP(mcp.name);
      changes++;
    } else if (!shouldBeEnabled && mcp.enabled) {
      await manager.disableMCP(mcp.name);
      changes++;
    }
  }

  if (changes > 0) {
    console.log(colors.green(`\n✓ Updated ${changes} MCP(s)`));
    showRestartReminder();
  } else {
    console.log(colors.dim("\nNo changes made."));
  }
}

// Doctor command - check for issues and orphaned configs
async function doctorCommand() {
  showLogo();
  console.log(colors.bold("CC-MCP Health Check\n"));

  // Check for orphaned MCPs
  const orphans = await manager.checkForOrphans();

  if (orphans.length === 0) {
    console.log(colors.green("✓ No issues detected"));
    console.log(colors.dim("  All MCP configurations are intact"));
    return;
  }

  console.log(colors.yellow(`⚠️  Found ${orphans.length} missing MCP configuration(s):`));
  console.log();

  for (const orphan of orphans) {
    console.log(colors.red(`  • ${orphan}`));
  }

  console.log();
  console.log(colors.dim("These configurations may have been deleted using Claude Code's UI."));
  console.log(colors.dim("Run 'cc-mcp recover' to restore from backup."));
}

// Recover command - restore deleted MCPs
async function recoverCommand() {
  showLogo();
  const backupManager = manager.getBackupManager();
  const backups = await backupManager.listBackups();

  if (backups.length === 0) {
    console.log(colors.yellow("No backups found."));
    return;
  }

  const orphans = await manager.checkForOrphans();

  if (orphans.length === 0) {
    console.log(colors.green("✓ No missing MCPs detected"));
    console.log(colors.dim("  All configurations are intact"));
    return;
  }

  console.log(colors.yellow(`Found ${orphans.length} missing MCP(s):`));
  for (const orphan of orphans) {
    console.log(colors.dim(`  • ${orphan}`));
  }
  console.log();

  // Find the most recent backup containing the orphans
  let recoveryBackup = null;
  for (const backupInfo of backups) {
    const backup = await backupManager.getBackup(backupInfo.filename);
    if (!backup) continue;

    const backupMCPs = new Set([
      ...Object.keys(backup.configs.enabled.mcpServers),
      ...Object.keys(backup.configs.disabled.mcpServers),
    ]);

    if (orphans.every((orphan) => backupMCPs.has(orphan))) {
      recoveryBackup = backup;
      break;
    }
  }

  if (!recoveryBackup) {
    console.log(colors.red("Could not find a backup containing all missing MCPs"));
    return;
  }

  const confirm = await Confirm.prompt({
    message: `Recover ${orphans.length} MCP(s) from backup?`,
    default: true,
  });

  if (!confirm) {
    console.log(colors.dim("Recovery cancelled"));
    return;
  }

  // Perform recovery
  const currentEnabled = await manager.readConfig(manager.configPath);
  const currentDisabled = await manager.readConfig(manager.disabledPath);

  let recovered = 0;
  for (const orphan of orphans) {
    // Check if it was in enabled or disabled in the backup
    if (recoveryBackup.configs.enabled.mcpServers[orphan]) {
      currentDisabled.mcpServers[orphan] = recoveryBackup.configs.enabled.mcpServers[orphan];
      recovered++;
    } else if (recoveryBackup.configs.disabled.mcpServers[orphan]) {
      currentDisabled.mcpServers[orphan] = recoveryBackup.configs.disabled.mcpServers[orphan];
      recovered++;
    }
  }

  await manager.writeConfig(manager.configPath, currentEnabled);
  await manager.writeConfig(manager.disabledPath, currentDisabled);

  console.log(colors.green(`\n✓ Recovered ${recovered} MCP(s) to disabled state`));
  console.log(colors.dim("  Run 'cc-mcp list' to see all MCPs"));
  console.log(colors.dim("  Run 'cc-mcp enable <name>' to re-enable specific MCPs"));
}

// History command - show backup history
async function historyCommand() {
  showLogo();
  const backupManager = manager.getBackupManager();
  const backups = await backupManager.listBackups();

  if (backups.length === 0) {
    console.log(colors.yellow("No backup history found."));
    return;
  }

  console.log(colors.bold("Backup History:\n"));

  const table = new Table()
    .header([colors.bold("Time"), colors.bold("Operation")])
    .body(
      backups.slice(0, 20).map((backup) => [
        colors.dim(backup.timestamp.toLocaleString()),
        backup.operation,
      ]),
    )
    .padding(1)
    .indent(2);

  console.log(table.toString());

  if (backups.length > 20) {
    console.log(colors.dim(`\n  ... and ${backups.length - 20} more`));
  }

  console.log(colors.dim("\n  Keeping last 30 backups automatically"));
}

// Main CLI
const cli = new Command()
  .name("cc-mcp")
  .version("1.0.0")
  .description("Claude Code MCP Manager - Easily manage your MCP servers")
  .action(() => {
    // Default action shows list
    listCommand();
  })
  // List command
  .command("list", "List all MCPs and their status")
  .alias("ls")
  .action(listCommand)
  // Enable command
  .command("enable <name:string>", "Enable an MCP server")
  .alias("e")
  .action(enableCommand)
  // Disable command
  .command("disable <name:string>", "Disable an MCP server")
  .alias("d")
  .action(disableCommand)
  // Toggle command
  .command("toggle", "Interactive toggle for MCP servers")
  .alias("t")
  .action(toggleCommand)
  // Doctor command
  .command("doctor", "Check for issues and missing MCPs")
  .action(doctorCommand)
  // Recover command
  .command("recover", "Recover deleted MCP configurations")
  .alias("r")
  .action(recoverCommand)
  // History command
  .command("history", "Show backup history")
  .action(historyCommand)
  // Quick enable/disable all
  .command("enable-all", "Enable all MCP servers")
  .action(async () => {
    const confirm = await Confirm.prompt("Enable all MCP servers?");
    if (!confirm) return;

    const mcps = await manager.getAllMCPs();
    let count = 0;

    for (const mcp of mcps) {
      if (!mcp.enabled) {
        await manager.enableMCP(mcp.name);
        count++;
      }
    }

    console.log(colors.green(`✓ Enabled ${count} MCP(s)`));
    if (count > 0) showRestartReminder();
  })
  .command("disable-all", "Disable all MCP servers")
  .action(async () => {
    const confirm = await Confirm.prompt({
      message: "Disable all MCP servers?",
      default: false,
    });
    if (!confirm) return;

    const mcps = await manager.getAllMCPs();
    let count = 0;

    for (const mcp of mcps) {
      if (mcp.enabled) {
        await manager.disableMCP(mcp.name);
        count++;
      }
    }

    console.log(colors.green(`✓ Disabled ${count} MCP(s)`));
    if (count > 0) showRestartReminder();
  })
  // Add new MCP command
  .command("add <name:string>", "Add a new MCP configuration")
  .alias("a")
  .action(async (_, name: string) => {
    const { Input, Select } = await import("https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/mod.ts");

    showLogo();
    console.log(colors.cyan(`Adding new MCP: ${name}\n`));

    // Command selection with common options
    const command = await Select.prompt({
      message: "Select command type:",
      options: [
        { name: "bunx (recommended for Bun users)", value: "bunx" },
        { name: "bun x", value: "bun" },
        { name: "npx (Node.js)", value: "npx" },
        { name: "node", value: "node" },
        { name: "python", value: "python" },
        { name: "Other (custom)", value: "custom" },
      ],
    });

    let finalCommand = command;
    if (command === "custom") {
      finalCommand = await Input.prompt("Enter command:");
    }

    // Arguments
    const argsInput = await Input.prompt({
      message: "Enter arguments (comma-separated):",
      hint: "e.g., @modelcontextprotocol/server-filesystem, ./",
    });

    const args = argsInput ? argsInput.split(",").map((arg) => arg.trim()) : [];

    // Special handling for bun x
    if (command === "bun" && !args.includes("x")) {
      args.unshift("x");
    }

    // Environment variables
    const envVars: Record<string, string> = {};
    const addEnv = await Confirm.prompt("Add environment variables?");

    if (addEnv) {
      let addMore = true;
      while (addMore) {
        const envName = await Input.prompt("Environment variable name:");
        const envValue = await Input.prompt({
          message: `Value for ${envName}:`,
          transform: (value) => value.includes("TOKEN") || value.includes("KEY") ? "****" : value,
        });

        if (envName && envValue) {
          envVars[envName] = envValue;
        }

        addMore = await Confirm.prompt("Add another environment variable?");
      }
    }

    // Build config
    const config: any = {
      command: finalCommand,
      args: args.length > 0 ? args : undefined,
      env: Object.keys(envVars).length > 0 ? envVars : undefined,
    };

    // Ensure config files exist
    await manager.ensureConfigFiles();

    // Add to disabled by default
    const disabled = await manager.readConfig(manager.disabledPath);
    disabled.mcpServers[name] = config;
    await manager.writeConfig(manager.disabledPath, disabled);

    console.log(colors.green(`\n✓ Added '${name}' to disabled MCPs`));
    console.log(colors.dim(`Run 'cc-mcp enable ${name}' to activate\n`));
  })
  // Init command to create scaffold
  .command("init", "Initialize with example MCP configurations")
  .action(async () => {
    showLogo();
    const enabledExists = await manager.fileExists(manager.configPath);
    const disabledExists = await manager.fileExists(manager.disabledPath);

    if (enabledExists || disabledExists) {
      const overwrite = await Confirm.prompt({
        message: "Configuration files already exist. Overwrite with defaults?",
        default: false,
      });

      if (!overwrite) {
        console.log(colors.dim("Initialization cancelled."));
        return;
      }
    }

    await manager.writeConfig(manager.configPath, DEFAULT_ENABLED);
    await manager.writeConfig(manager.disabledPath, DEFAULT_DISABLED);

    console.log(colors.green("✓ Initialized with example configurations"));
    console.log(colors.dim("\nEnabled MCPs:"));
    console.log(colors.dim("  - filesystem (access to current directory)"));
    console.log(colors.dim("\nDisabled MCPs (configure before enabling):"));
    console.log(colors.dim("  - github (needs GITHUB_PERSONAL_ACCESS_TOKEN)"));
    console.log(colors.dim("  - sqlite (configure database path)"));
    console.log(colors.dim("  - anthropic (needs ANTHROPIC_API_KEY)"));
    console.log(colors.dim("  - slack (needs tokens and team ID)"));
    console.log(colors.dim("  - postgres (configure connection string)"));
    console.log(colors.dim("  - google_drive (needs OAuth credentials)"));
    console.log(colors.dim("\nRun 'cc-mcp list' to see all MCPs"));
  });

// Run CLI
if (import.meta.main) {
  await cli.parse(Deno.args);
}
