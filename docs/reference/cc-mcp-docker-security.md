# Docker-based MCP Security Architecture

## Overview

Running MCPs in Docker containers provides:

- **Isolation**: Each MCP runs in its own container
- **Resource limits**: Control CPU/memory usage
- **Network security**: Explicit port mapping
- **No global npm packages**: Everything containerized
- **Easy cleanup**: Just remove containers

## Implementation Approach

### 1. Enhanced MCP Configuration

```json
{
  "mcpServers": {
    "filesystem": {
      "mode": "docker",
      "image": "cc-mcp/filesystem:latest",
      "volumes": {
        "./project": "/workspace"
      },
      "environment": {
        "MCP_MODE": "restricted"
      },
      "limits": {
        "memory": "512m",
        "cpus": "0.5"
      }
    },
    "github": {
      "mode": "external",  // Still support external mode
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"]
    }
  }
}
```

### 2. Docker Management in CLI

```typescript
class DockerMCPManager {
  async startMCP(name: string, config: DockerConfig): Promise<void> {
    // Build image if needed
    if (!await this.imageExists(config.image)) {
      await this.buildImage(name, config);
    }
    
    // Start container
    const cmd = new Deno.Command("docker", {
      args: [
        "run",
        "-d",
        "--name", `mcp-${name}`,
        "--restart", "unless-stopped",
        "-p", `${await this.findFreePort()}:3000`,
        ...this.getVolumeArgs(config.volumes),
        ...this.getEnvArgs(config.environment),
        ...this.getLimitArgs(config.limits),
        config.image
      ]
    });
    
    await cmd.output();
  }
  
  async stopMCP(name: string): Promise<void> {
    await new Deno.Command("docker", {
      args: ["stop", `mcp-${name}`]
    }).output();
  }
  
  async updateMCP(name: string): Promise<void> {
    // Pull latest image or rebuild
    await this.stopMCP(name);
    await this.pullOrBuildImage(name);
    await this.startMCP(name);
  }
}
```

### 3. Dockerfile Templates

Each MCP type would have a Dockerfile template:

```dockerfile
# filesystem-mcp.dockerfile
FROM node:20-alpine

# Security: Run as non-root user
RUN addgroup -g 1001 -S mcp && \
    adduser -S mcp -u 1001

# Install MCP
WORKDIR /app
RUN npm install @modelcontextprotocol/server-filesystem

# Copy security policies
COPY policies/filesystem-restrictions.json /app/policies/

USER mcp

EXPOSE 3000
CMD ["node", "/app/node_modules/@modelcontextprotocol/server-filesystem/index.js"]
```

### 4. CLI Commands for Docker Mode

```bash
# Enable Docker mode for an MCP
cc-mcp enable filesystem --mode docker

# Update Docker images
cc-mcp update filesystem
cc-mcp update-all

# View container status
cc-mcp status
# Shows:
# filesystem   ✓ running (docker)   cpu: 0.2%  mem: 120MB
# github       ✓ running (external)  
# sqlite       ✗ stopped (docker)    

# View logs
cc-mcp logs filesystem

# Rebuild image
cc-mcp rebuild filesystem
```

## Local Updates Management

### 1. Git-based Update System

```typescript
interface MCPSource {
  type: "git" | "npm" | "local";
  repository?: string;
  branch?: string;
  package?: string;
  updatePolicy: "startup" | "manual" | "scheduled";
}

class UpdateManager {
  private mcpDir = "~/.cc-mcp/sources";
  
  async checkForUpdates(): Promise<UpdateInfo[]> {
    const updates = [];
    
    for (const [name, source] of Object.entries(this.sources)) {
      if (source.type === "git") {
        const hasUpdate = await this.checkGitUpdate(name, source);
        if (hasUpdate) {
          updates.push({ name, type: "git", currentCommit, latestCommit });
        }
      }
    }
    
    return updates;
  }
  
  async updateMCP(name: string): Promise<void> {
    const source = this.sources[name];
    
    if (source.type === "git") {
      // Pull latest changes
      await this.gitPull(name);
      
      // Rebuild Docker image
      await this.rebuildImage(name);
      
      // Restart instructions
      await this.showRestartInstructions();
    }
  }
  
  async showRestartInstructions() {
    console.log("Please restart Claude Code for changes to take effect.");
    console.log("Quit Claude Code and run: claude -r to resume");
  }
}
```

### 2. Update Policies

```json
{
  "mcpServers": {
    "filesystem": {
      "source": {
        "type": "git",
        "repository": "https://github.com/modelcontextprotocol/servers",
        "path": "filesystem",
        "updatePolicy": "startup",
        "checkInterval": "24h"
      }
    }
  }
}
```

### 3. Smart Update Features

```typescript
// Check for updates on CLI startup
if (await updateManager.hasUpdatesAvailable()) {
  console.log(colors.yellow("📦 Updates available for 3 MCPs"));
  console.log(colors.dim("Run 'cc-mcp update-all' to update"));
}

// Auto-update based on policy
async function handleStartupUpdates() {
  const mcps = await manager.getAllMCPs();
  
  for (const mcp of mcps) {
    if (mcp.source?.updatePolicy === "startup") {
      await updateManager.updateMCP(mcp.name);
    }
  }
}
```

## Marketplace Integration

### 1. Complete Installation Flow

```typescript
class MarketplaceInstaller {
  async install(packageName: string): Promise<void> {
    // 1. Fetch package metadata
    const metadata = await this.fetchPackageInfo(packageName);
    
    // 2. Check compatibility
    if (!this.isCompatible(metadata)) {
      throw new Error(`Package requires Claude Code ${metadata.minVersion}`);
    }
    
    // 3. Download source
    const source = await this.downloadSource(metadata);
    
    // 4. Build Docker image
    const image = await this.buildDockerImage(source, metadata);
    
    // 5. Run tests
    const testResult = await this.runTests(image, metadata.tests);
    
    if (!testResult.success) {
      throw new Error(`Tests failed: ${testResult.error}`);
    }
    
    // 6. Generate configuration
    const config = this.generateConfig(metadata, image);
    
    // 7. Add to mcp.json
    await this.addToConfig(packageName, config);
    
    console.log(colors.green(`✓ Installed ${packageName}`));
    console.log(colors.dim(`Run 'cc-mcp enable ${packageName}' to activate`));
  }
}
```

### 2. Marketplace Package Format

```typescript
interface MarketplacePackage {
  name: string;
  version: string;
  description: string;
  author: string;
  source: {
    type: "git" | "npm" | "docker";
    url: string;
  };
  docker?: {
    dockerfile?: string;
    baseImage?: string;
    buildArgs?: Record<string, string>;
  };
  config: {
    volumes?: string[];
    environment?: Record<string, string>;
    ports?: number[];
    capabilities?: string[];
  };
  tests: {
    connection: string;  // Test command
    timeout: number;
  };
  security: {
    permissions: string[];
    sandbox: boolean;
  };
}
```

### 3. Testing Framework

```typescript
class MCPTester {
  async testMCP(config: TestConfig): Promise<TestResult> {
    // 1. Start container in test mode
    const container = await this.startTestContainer(config);
    
    try {
      // 2. Wait for startup
      await this.waitForReady(container, config.timeout);
      
      // 3. Test connection
      const connected = await this.testConnection(container);
      
      // 4. Run capability tests
      const capabilities = await this.testCapabilities(container, config.tests);
      
      // 5. Security scan
      const security = await this.securityScan(container);
      
      return {
        success: connected && capabilities.passed && security.safe,
        details: { connected, capabilities, security }
      };
    } finally {
      // Cleanup
      await this.stopContainer(container);
    }
  }
}
```

### 4. Marketplace CLI Commands

```bash
# Search marketplace
cc-mcp search "database"
# Results:
# postgres-mcp     - PostgreSQL integration (★ 4.8)
# mysql-mcp        - MySQL integration (★ 4.6)
# sqlite-mcp       - SQLite integration (★ 4.9)

# View package details
cc-mcp info postgres-mcp
# Shows description, requirements, config options

# Install with testing
cc-mcp install postgres-mcp --test
# ⏳ Downloading postgres-mcp...
# ⏳ Building Docker image...
# ⏳ Running tests...
# ✓ Connection test passed
# ✓ Query test passed
# ✓ Security scan passed
# ✓ Installed postgres-mcp

# Install specific version
cc-mcp install postgres-mcp@2.1.0

# Install with custom config
cc-mcp install postgres-mcp --volume ./data:/var/lib/postgresql/data
```

## Architecture Summary

### Security Benefits

1. **Isolation**: Each MCP in its own container
2. **No global pollution**: No npm globals needed
3. **Resource limits**: Prevent runaway processes
4. **Network isolation**: Only exposed ports accessible
5. **Easy cleanup**: Just remove containers

### Update Benefits

1. **Version control**: Git-based tracking
2. **Rollback capability**: Keep previous images
3. **Automated updates**: Based on policies
4. **Testing before deploy**: Ensure updates work

### Marketplace Benefits

1. **Verified packages**: Tested before installation
2. **Dependency management**: Handle complex setups
3. **Security scanning**: Check for vulnerabilities
4. **Easy discovery**: Search and browse MCPs

## Migration Path

Start simple, add Docker later:

```typescript
// Phase 1: Basic CLI (current)
"filesystem": {
  "command": "npx",
  "args": ["@modelcontextprotocol/server-filesystem"]
}

// Phase 2: Add Docker support
"filesystem": {
  "mode": "docker",  // New field
  "command": "npx",  // Fallback
  "docker": {
    "image": "cc-mcp/filesystem:latest"
  }
}

// Phase 3: Full Docker with updates
"filesystem": {
  "mode": "docker",
  "source": {
    "type": "git",
    "repository": "...",
    "updatePolicy": "startup"
  },
  "docker": {
    "image": "cc-mcp/filesystem:latest",
    "volumes": {"./": "/workspace"}
  }
}
```
