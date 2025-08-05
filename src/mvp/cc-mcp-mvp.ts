#!/usr/bin/env deno run --allow-read --allow-write

/**
 * CC-MCP MVP: Claude Code MCP Manager
 *
 * A minimal tool that solves one critical problem:
 * Claude Code's disable button permanently deletes MCP configurations.
 *
 * This MVP preserves configurations by moving them between
 * .mcp.json (enabled) and .mcp.json.disabled (disabled).
 */

interface MCPServer {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

interface MCPConfig {
  mcpServers: Record<string, MCPServer>;
}

class SimpleMCPManager {
  private enabledFile = ".mcp.json";
  private disabledFile = ".mcp.json.disabled";

  async init(): Promise<void> {
    // Create default configs if they don't exist
    if (!await this.fileExists(this.enabledFile)) {
      const enabledConfig: MCPConfig = {
        mcpServers: {
          filesystem: {
            command: "bunx",
            args: ["@modelcontextprotocol/server-filesystem", "./"],
          },
        },
      };
      await this.writeConfig(this.enabledFile, enabledConfig);
      console.log("✓ Created .mcp.json with filesystem MCP enabled");
    }

    if (!await this.fileExists(this.disabledFile)) {
      const disabledConfig: MCPConfig = {
        mcpServers: {
          // Core Development Tools
          github: {
            command: "bunx",
            args: ["-y", "@modelcontextprotocol/server-github"],
            env: {
              GITHUB_PERSONAL_ACCESS_TOKEN: "${GITHUB_PAT}",
            },
          },
          coderabbitai: {
            command: "bunx",
            args: ["coderabbitai-mcp@latest"],
            env: {
              GITHUB_PAT: "${GITHUB_PAT}",
            },
          },
          playwright: {
            command: "bunx",
            args: ["@playwright/mcp@latest"],
          },
          
          // Cloud & Infrastructure
          cloudflare: {
            command: "bunx",
            args: ["@cloudflare/mcp-server-cloudflare"],
            env: {
              CLOUDFLARE_API_TOKEN: "${CLOUDFLARE_API_TOKEN}",
            },
          },
          convex: {
            command: "bunx",
            args: ["convex", "mcp"],
            env: {
              CONVEX_DEPLOYMENT: "${CONVEX_DEPLOYMENT}",
            },
          },
          supabase: {
            command: "bunx",
            args: [
              "-y", 
              "@supabase/mcp-server-supabase@latest",
              "--read-only",
              "--project-ref=${SUPABASE_PROJECT_REF}"
            ],
            env: {
              SUPABASE_ACCESS_TOKEN: "${SUPABASE_ACCESS_TOKEN}",
            },
          },
          neon: {
            command: "bunx",
            args: ["-y", "@neondatabase/mcp-server-neon@latest"],
            env: {
              NEON_API_KEY: "${NEON_API_KEY}",
            },
          },
          neo4j: {
            command: "bunx",
            args: ["@alanse/mcp-neo4j-server"],
            env: {
              NEO4J_URI: "bolt://localhost:7687",
              NEO4J_USERNAME: "neo4j",
              NEO4J_PASSWORD: "${NEO4J_PASSWORD}",
            },
          },
          
          // Content & Communication
          firecrawl: {
            command: "bunx",
            args: ["-y", "firecrawl-mcp"],
            env: {
              FIRECRAWL_API_KEY: "${FIRECRAWL_API_KEY}",
            },
          },
          notion: {
            command: "bunx",
            args: ["@modelcontextprotocol/server-notion"],
            env: {
              NOTION_API_KEY: "${NOTION_API_KEY}",
            },
          },
          airtable: {
            command: "bunx",
            args: ["-y", "airtable-mcp-server"],
            env: {
              AIRTABLE_API_KEY: "${AIRTABLE_API_KEY}",
            },
          },
          twilio: {
            command: "bunx",
            args: ["@twilio/mcp-server"],
            env: {
              TWILIO_ACCOUNT_SID: "${TWILIO_ACCOUNT_SID}",
              TWILIO_AUTH_TOKEN: "${TWILIO_AUTH_TOKEN}",
            },
          },
          mailgun: {
            command: "bunx",
            args: ["-y", "@mailgun/mcp-server"],
            env: {
              MAILGUN_API_KEY: "${MAILGUN_API_KEY}",
              MAILGUN_DOMAIN: "${MAILGUN_DOMAIN}",
            },
          },
          zapier: {
            command: "bunx",
            args: ["@zapier/mcp-server"],
            env: {
              ZAPIER_API_KEY: "${ZAPIER_API_KEY}",
            },
          },
          
          // AI & Analysis
          perplexity: {
            command: "bunx",
            args: ["-y", "server-perplexity-ask"],
            env: {
              PERPLEXITY_API_KEY: "${PERPLEXITY_API_KEY}",
            },
          },
          elevenlabs: {
            command: "uvx",
            args: ["elevenlabs-mcp"],
            env: {
              ELEVENLABS_API_KEY: "${ELEVENLABS_API_KEY}",
            },
          },
          bright_data: {
            command: "bunx",
            args: ["@brightdata/mcp-server"],
            env: {
              BRIGHT_DATA_API_KEY: "${BRIGHT_DATA_API_KEY}",
            },
          },
          sentry: {
            command: "bunx",
            args: ["@sentry/mcp-server"],
            env: {
              SENTRY_API_TOKEN: "${SENTRY_API_TOKEN}",
            },
          },
          chart: {
            command: "bunx",
            args: ["@bmacharajun/chart-mcp"],
            env: {
              CHART_OPTIONS: "default",
            },
          },
          context7: {
            command: "bunx",
            args: ["-y", "@upstash/context7-mcp@latest"],
          },
          supadata: {
            command: "bunx",
            args: ["-y", "supadata-mcp"],
            env: {
              SUPADATA_API_KEY: "${SUPADATA_API_KEY}",
            },
          },
          toolbox_databases: {
            command: "bunx",
            args: ["@mcptools/mcp-toolbox-databases"],
            env: {
              DATABASE_CONNECTION: "${DATABASE_CONNECTION}",
            },
          },
        },
      };
      await this.writeConfig(this.disabledFile, disabledConfig);
      console.log("✓ Created .mcp.json.disabled with 22 popular MCP servers ready to configure");
    }
  }

  async list(): Promise<void> {
    await this.ensureInitialized();

    const enabled = await this.readConfig(this.enabledFile);
    const disabled = await this.readConfig(this.disabledFile);

    console.log("\nMCP Status:");
    console.log("===========");

    // Show enabled MCPs
    const enabledNames = Object.keys(enabled.mcpServers);
    if (enabledNames.length > 0) {
      enabledNames.forEach((name) => {
        console.log(`✓ ${name}`);
      });
    }

    // Show disabled MCPs
    const disabledNames = Object.keys(disabled.mcpServers);
    if (disabledNames.length > 0) {
      disabledNames.forEach((name) => {
        console.log(`✗ ${name}`);
      });
    }

    if (enabledNames.length === 0 && disabledNames.length === 0) {
      console.log("No MCPs found. Run 'cc-mcp init' to create examples.");
    }
    console.log();
  }

  async enable(name: string): Promise<void> {
    await this.ensureInitialized();

    const enabled = await this.readConfig(this.enabledFile);
    const disabled = await this.readConfig(this.disabledFile);

    // Check if already enabled
    if (enabled.mcpServers[name]) {
      console.log(`⚠️  ${name} is already enabled`);
      return;
    }

    // Check if exists in disabled
    if (!disabled.mcpServers[name]) {
      console.log(`❌ ${name} not found in disabled MCPs`);
      console.log("Available disabled MCPs:", Object.keys(disabled.mcpServers).join(", "));
      return;
    }

    // Move from disabled to enabled
    enabled.mcpServers[name] = disabled.mcpServers[name];
    delete disabled.mcpServers[name];

    await this.writeConfig(this.enabledFile, enabled);
    await this.writeConfig(this.disabledFile, disabled);

    console.log(`✓ Enabled ${name}`);
    this.showRestartReminder();
  }

  async disable(name: string): Promise<void> {
    await this.ensureInitialized();

    const enabled = await this.readConfig(this.enabledFile);
    const disabled = await this.readConfig(this.disabledFile);

    // Check if already disabled
    if (disabled.mcpServers[name]) {
      console.log(`⚠️  ${name} is already disabled`);
      return;
    }

    // Check if exists in enabled
    if (!enabled.mcpServers[name]) {
      console.log(`❌ ${name} not found in enabled MCPs`);
      console.log("Available enabled MCPs:", Object.keys(enabled.mcpServers).join(", "));
      return;
    }

    // Move from enabled to disabled
    disabled.mcpServers[name] = enabled.mcpServers[name];
    delete enabled.mcpServers[name];

    await this.writeConfig(this.enabledFile, enabled);
    await this.writeConfig(this.disabledFile, disabled);

    console.log(`✓ Disabled ${name} (configuration preserved)`);
    this.showRestartReminder();
  }

  private async ensureInitialized(): Promise<void> {
    if (!await this.fileExists(this.enabledFile) || !await this.fileExists(this.disabledFile)) {
      console.log("Initializing configuration files...");
      await this.init();
    }
  }

  private async fileExists(path: string): Promise<boolean> {
    try {
      await Deno.stat(path);
      return true;
    } catch {
      return false;
    }
  }

  private async readConfig(path: string): Promise<MCPConfig> {
    try {
      const content = await Deno.readTextFile(path);
      return JSON.parse(content);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return { mcpServers: {} };
      }
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in ${path}: ${error.message}`);
      }
      throw new Error(`Failed to read ${path}: ${(error as Error).message}`);
    }
  }

  private async writeConfig(path: string, config: MCPConfig): Promise<void> {
    try {
      const content = JSON.stringify(config, null, 2);
      await Deno.writeTextFile(path, content);
    } catch (error) {
      throw new Error(`Failed to write ${path}: ${(error as Error).message}`);
    }
  }

  private showRestartReminder(): void {
    console.log("\n⚠️  Restart Claude Code for changes to take effect:");
    console.log("   claude -c");
    console.log();
  }
}

// CLI Interface
async function main() {
  const manager = new SimpleMCPManager();
  const args = Deno.args;

  if (args.length === 0) {
    // Default action: list
    await manager.list();
    return;
  }

  const command = args[0].toLowerCase();

  switch (command) {
    case "list":
    case "ls":
      await manager.list();
      break;

    case "enable":
    case "e":
      if (args.length < 2) {
        console.log("Usage: cc-mcp enable <name>");
        console.log("Example: cc-mcp enable github");
        Deno.exit(1);
      }
      await manager.enable(args[1]);
      break;

    case "disable":
    case "d":
      if (args.length < 2) {
        console.log("Usage: cc-mcp disable <name>");
        console.log("Example: cc-mcp disable github");
        Deno.exit(1);
      }
      await manager.disable(args[1]);
      break;

    case "init":
      await manager.init();
      console.log("\n✓ Initialization complete");
      await manager.list();
      break;

    case "--help":
    case "-h":
    case "help":
      showHelp();
      break;

    case "--version":
    case "-v":
      console.log("CC-MCP MVP v1.0.0");
      break;

    default:
      console.log(`Unknown command: ${command}`);
      showHelp();
      Deno.exit(1);
  }
}

function showHelp(): void {
  console.log(`
CC-MCP MVP: Claude Code MCP Manager

PROBLEM: Claude Code's disable button permanently deletes MCP configurations.
SOLUTION: CC-MCP preserves configurations when disabling MCPs.

USAGE:
  cc-mcp [list]         Show all MCPs with status (default)
  cc-mcp enable <name>  Enable an MCP (move from disabled to enabled)
  cc-mcp disable <name> Disable an MCP (move from enabled to disabled)
  cc-mcp init           Initialize with working examples

ALIASES:
  list: ls
  enable: e  
  disable: d

EXAMPLES:
  cc-mcp                # Show status of all MCPs
  cc-mcp enable github  # Enable GitHub MCP
  cc-mcp disable github # Disable GitHub MCP (config preserved)
  cc-mcp init           # Create example configurations

FILES:
  .mcp.json              Currently enabled MCP servers
  .mcp.json.disabled     Disabled MCP servers (configurations preserved)

FIRST RUN:
  Automatically creates working filesystem MCP and GitHub example.
  You can use filesystem MCP immediately, configure others as needed.

WARNING:
  Do not use Claude Code's built-in disable button - it deletes configurations.
  Always use CC-MCP to preserve your setups.
`);
}

// Error handling
if ((import.meta as { main?: boolean }).main) {
  try {
    await main();
  } catch (error) {
    console.error("Error:", (error as Error).message);
    Deno.exit(1);
  }
}

// Make this a module to support top-level await
export {};
