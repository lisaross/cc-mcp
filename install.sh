#!/bin/bash
set -euo pipefail

# CC-MCP Installation Script
# Installs CC-MCP globally via Deno with proper PATH configuration and verification

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Configuration
readonly DENO_MIN_VERSION="1.37.0"
readonly CC_MCP_URL="https://raw.githubusercontent.com/lisaross/cc-mcp/main/src/mvp/cc-mcp-mvp.ts"
readonly DENO_BIN_PATH="$HOME/.deno/bin"
readonly LOG_FILE="/tmp/cc-mcp-install.log"

# Global variables
SHELL_CONFIG_FILE=""
DENO_INSTALLED=false
PATH_UPDATED=false
ROLLBACK_NEEDED=false

# Utility functions
log() {
    echo -e "${GREEN}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

# Initialize log file
initialize_logging() {
    echo "CC-MCP Installation Log - $(date)" > "$LOG_FILE"
    log "Starting CC-MCP installation process"
}

# Cleanup function for rollback
cleanup_on_error() {
    if [ "$ROLLBACK_NEEDED" = true ]; then
        warn "Installation failed, performing rollback..."
        
        # Remove CC-MCP if it was installed
        if command -v cc-mcp >/dev/null 2>&1; then
            deno uninstall cc-mcp 2>/dev/null || true
            log "Removed cc-mcp installation"
        fi
        
        # Restore shell config if we modified it
        if [ "$PATH_UPDATED" = true ] && [ -n "$SHELL_CONFIG_FILE" ] && [ -f "$SHELL_CONFIG_FILE.backup" ]; then
            mv "$SHELL_CONFIG_FILE.backup" "$SHELL_CONFIG_FILE"
            log "Restored shell configuration from backup"
        fi
        
        error "Installation rolled back. Check log at $LOG_FILE for details."
    fi
}

# Set trap for cleanup
trap cleanup_on_error ERR INT TERM

# Version comparison function
version_gt() {
    test "$(printf '%s\n' "$@" | sort -V | head -n 1)" != "$1";
}

# Detect shell and set config file
detect_shell_config() {
    local shell_name
    shell_name=$(basename "$SHELL")
    
    case "$shell_name" in
        bash)
            if [[ "$OSTYPE" == "darwin"* ]]; then
                SHELL_CONFIG_FILE="$HOME/.bash_profile"
            else
                SHELL_CONFIG_FILE="$HOME/.bashrc"
            fi
            ;;
        zsh)
            SHELL_CONFIG_FILE="$HOME/.zshrc"
            ;;
        fish)
            SHELL_CONFIG_FILE="$HOME/.config/fish/config.fish"
            ;;
        *)
            SHELL_CONFIG_FILE="$HOME/.profile"
            warn "Unknown shell ($shell_name), using .profile"
            ;;
    esac
    
    log "Detected shell: $shell_name, config file: $SHELL_CONFIG_FILE"
}

# Check if Deno is installed and meets minimum version
check_deno_installation() {
    log "Checking Deno installation..."
    
    if ! command -v deno >/dev/null 2>&1; then
        error "Deno is not installed"
        show_deno_install_instructions
        return 1
    fi
    
    local deno_version
    deno_version=$(deno --version | head -n 1 | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')
    
    if ! version_gt "$deno_version" "$DENO_MIN_VERSION" && [ "$deno_version" != "$DENO_MIN_VERSION" ]; then
        error "Deno version $deno_version is too old (minimum: $DENO_MIN_VERSION)"
        show_deno_install_instructions
        return 1
    fi
    
    success "Deno $deno_version is installed and meets requirements"
}

# Show Deno installation instructions
show_deno_install_instructions() {
    echo
    info "Please install Deno first:"
    echo
    echo "macOS/Linux:"
    echo "  curl -fsSL https://deno.land/install.sh | sh"
    echo
    echo "Windows (PowerShell):"
    echo "  irm https://deno.land/install.ps1 | iex"
    echo
    echo "Package managers:"
    echo "  brew install deno     # macOS"
    echo "  scoop install deno    # Windows"
    echo "  apt install deno      # Ubuntu/Debian"
    echo
    echo "After installation, restart your terminal and run this script again."
    echo
}

# Check and configure PATH
configure_path() {
    log "Checking PATH configuration..."
    
    if echo "$PATH" | grep -q "$DENO_BIN_PATH"; then
        log "Deno binary path already in PATH"
        return 0
    fi
    
    # Create backup of shell config
    if [ -f "$SHELL_CONFIG_FILE" ]; then
        cp "$SHELL_CONFIG_FILE" "$SHELL_CONFIG_FILE.backup"
        log "Created backup of $SHELL_CONFIG_FILE"
    fi
    
    # Add Deno to PATH
    local path_export=""
    case "$(basename "$SHELL")" in
        fish)
            path_export="set -gx PATH $DENO_BIN_PATH \$PATH"
            ;;
        *)
            path_export="export PATH=\"$DENO_BIN_PATH:\$PATH\""
            ;;
    esac
    
    {
        echo ""
        echo "# Added by CC-MCP installer"
        echo "$path_export"
    } >> "$SHELL_CONFIG_FILE"
    
    PATH_UPDATED=true
    success "Added Deno to PATH in $SHELL_CONFIG_FILE"
    
    # Update current session PATH
    export PATH="$DENO_BIN_PATH:$PATH"
}

# Install CC-MCP
install_cc_mcp() {
    log "Installing CC-MCP..."
    ROLLBACK_NEEDED=true
    
    # Test URL accessibility
    if ! curl -sSf --head "$CC_MCP_URL" >/dev/null 2>&1; then
        error "Cannot access CC-MCP installation URL: $CC_MCP_URL"
        error "Please check your internet connection and try again"
        return 1
    fi
    
    # Install CC-MCP
    if ! deno install --global --allow-read --allow-write --name cc-mcp --force "$CC_MCP_URL" 2>>"$LOG_FILE"; then
        error "Failed to install CC-MCP with Deno"
        return 1
    fi
    
    success "CC-MCP installed successfully"
}

# Verify installation
verify_installation() {
    log "Verifying CC-MCP installation..."
    
    # Check if cc-mcp command is available
    if ! command -v cc-mcp >/dev/null 2>&1; then
        # Try with explicit path
        if [ -f "$DENO_BIN_PATH/cc-mcp" ]; then
            warn "cc-mcp installed but not in current PATH"
            info "You may need to restart your terminal or run: source $SHELL_CONFIG_FILE"
        else
            error "cc-mcp command not found after installation"
            return 1
        fi
    fi
    
    # Test help command
    local help_output
    if command -v cc-mcp >/dev/null 2>&1; then
        if help_output=$(cc-mcp --help 2>&1); then
            success "CC-MCP is working correctly"
            return 0
        else
            error "cc-mcp command failed to run"
            echo "Output: $help_output"
            return 1
        fi
    else
        # Try with explicit path for verification message
        if [ -f "$DENO_BIN_PATH/cc-mcp" ]; then
            if help_output=$("$DENO_BIN_PATH/cc-mcp" --help 2>&1); then
                warn "CC-MCP installed successfully but PATH needs refresh"
                return 0
            fi
        fi
        error "Cannot verify CC-MCP installation"
        return 1
    fi
}

# Show post-installation instructions
show_post_install_instructions() {
    echo
    success "🎉 CC-MCP installation completed successfully!"
    echo
    
    if [ "$PATH_UPDATED" = true ]; then
        info "PATH was updated. To use cc-mcp in this terminal session:"
        echo "  source $SHELL_CONFIG_FILE"
        echo
        info "Or restart your terminal to apply PATH changes automatically."
        echo
    fi
    
    info "Quick start:"
    echo "  cc-mcp          # Show all MCPs with status"
    echo "  cc-mcp init     # Initialize with example configurations"
    echo "  cc-mcp --help   # Show all available commands"
    echo
    
    info "Important: Add this to your Claude Code memory (~/.claude/CLAUDE.md):"
    echo "## CC-MCP Usage Notes"
    echo "- When CC-MCP shows \"⚠️ Restart Claude Code for changes to take effect:\", inform the user that a restart is required before MCP changes take effect"
    echo "- If no restart occurs within 30 seconds, continue with a warning that MCP changes may not be active"
    echo "- MCP changes only take effect after Claude Code restarts"
    echo
    
    info "For more information, visit: https://github.com/lisaross/cc-mcp"
    echo
    log "Installation log saved to: $LOG_FILE"
}

# Main installation function
main() {
    echo "CC-MCP Installation Script"
    echo "========================="
    echo
    
    initialize_logging
    
    # Pre-flight checks
    detect_shell_config
    
    if ! check_deno_installation; then
        exit 1
    fi
    
    # Configuration
    configure_path
    
    # Installation
    install_cc_mcp
    
    # Verification
    verify_installation
    
    # Success
    ROLLBACK_NEEDED=false
    show_post_install_instructions
    
    success "CC-MCP installation completed! 🚀"
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "CC-MCP Installation Script"
        echo
        echo "Usage: $0 [OPTIONS]"
        echo
        echo "Options:"
        echo "  --help, -h    Show this help message"
        echo "  --version     Show version information"
        echo "  --dry-run     Show what would be done without making changes"
        echo
        echo "This script will:"
        echo "1. Check for Deno installation (minimum version $DENO_MIN_VERSION)"
        echo "2. Configure PATH to include Deno binary directory"
        echo "3. Install CC-MCP globally using Deno"
        echo "4. Verify the installation"
        echo "5. Show post-installation instructions"
        echo
        exit 0
        ;;
    --version)
        echo "CC-MCP Installation Script v1.0.0"
        exit 0
        ;;
    --dry-run)
        echo "DRY RUN: Would perform the following actions:"
        echo "1. Check Deno installation (minimum $DENO_MIN_VERSION)"
        echo "2. Add $DENO_BIN_PATH to PATH if needed"
        echo "3. Install CC-MCP from: $CC_MCP_URL"
        echo "4. Verify installation with cc-mcp --help"
        echo "5. Show usage instructions"
        exit 0
        ;;
    "")
        # No arguments, proceed with installation
        main
        ;;
    *)
        error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac