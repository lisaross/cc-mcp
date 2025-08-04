# Changelog

All notable changes to CC-MCP will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-04

### Added
- Initial public release of CC-MCP MVP
- Core functionality to preserve MCP configurations when disabling
- `cc-mcp list` command to show all MCPs with status
- `cc-mcp enable <name>` command to enable disabled MCPs
- `cc-mcp disable <name>` command to disable MCPs while preserving configuration
- `cc-mcp init` command for first-time setup with working examples
- Auto-scaffolding on first run with filesystem MCP enabled
- GitHub MCP example configuration in disabled state
- Simple CLI with aliases (ls, e, d) for common commands
- MIT License for open source usage
- Comprehensive documentation and installation instructions

### Security
- Validated security practices for Deno TypeScript implementation
- No external dependencies except Deno standard library
- Read/write permissions limited to MCP configuration files only

## [Unreleased]

Future versions will include additional features based on user feedback and community needs.