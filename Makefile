# ==============================================================================
# The Curator - Desktop Binary Packaging Makefile (Tauri + Vite + React)
# ==============================================================================

APP_NAME = "The Curator"
TAURI_CLI = npx @tauri-apps/cli

.PHONY: all help check install install-rust dev dev-web build build-web clean

# Default target
all: build

help:
	@echo "======================================================================"
	@echo "               THE CURATOR - TAURI PACKAGING MAKEFILE                  "
	@echo "======================================================================"
	@echo "Available commands:"
	@echo "  make install        - Install NPM dependencies and Tauri CLI"
	@echo "  make check          - Check prerequisites (Node, NPM, Rust, Cargo)"
	@echo "  make install-rust   - Install Rust compiler via rustup (if missing)"
	@echo "  make dev-web        - Run Vite frontend dev server in browser"
	@echo "  make dev            - Run full desktop app in Tauri dev mode"
	@echo "  make build-web      - Compile production web assets into dist/"
	@echo "  make build          - Build standalone desktop binary (.dmg/.app/.exe)"
	@echo "  make clean          - Clean build directories (dist/, target/)"
	@echo "======================================================================"

# Check system prerequisites
check:
	@echo "==> Checking system dependencies..."
	@which node > /dev/null 2>&1 && echo "  [✓] Node.js: $$(node -v)" || echo "  [✗] Node.js is missing"
	@which npm > /dev/null 2>&1 && echo "  [✓] NPM:     $$(npm -v)" || echo "  [✗] NPM is missing"
	@which cargo > /dev/null 2>&1 && echo "  [✓] Cargo:   $$(cargo -V)" || (echo "  [✗] Cargo / Rust is missing. Run 'make install-rust' to install." && exit 1)
	@which rustc > /dev/null 2>&1 && echo "  [✓] Rustc:   $$(rustc -V)" || true

# Helper to install Rust if not present on macOS/Linux
install-rust:
	@echo "==> Installing Rust toolchain via rustup..."
	curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
	@echo "==> Rust installed! Run 'source $$HOME/.cargo/env' or restart terminal."

# Install npm dependencies & Tauri CLI
install:
	@echo "==> Installing frontend dependencies..."
	npm install
	@echo "==> Ensuring @tauri-apps/cli is installed..."
	npm install --save-dev @tauri-apps/cli@^1.5.11

# Run web dev server
dev-web:
	npm run dev

# Run Tauri desktop app in dev mode
dev: check
	@echo "==> Starting $(APP_NAME) in Tauri desktop dev mode..."
	$(TAURI_CLI) dev

# Build web frontend
build-web:
	@echo "==> Building web frontend..."
	npm run build

# Build standalone native desktop binary
build: check build-web
	@echo "==> Packaging $(APP_NAME) into native desktop binary with Tauri..."
	$(TAURI_CLI) build
	@echo ""
	@echo "======================================================================"
	@echo "  [✓] Binary build complete!"
	@echo "  Output bundles are located at:"
	@echo "    macOS:   src-tauri/target/release/bundle/dmg/"
	@echo "             src-tauri/target/release/bundle/macos/"
	@echo "    Windows: src-tauri/target/release/bundle/msi/"
	@echo "    Linux:   src-tauri/target/release/bundle/deb/ or appimage/"
	@echo "======================================================================"

# Clean build artifacts
clean:
	@echo "==> Cleaning build artifacts..."
	rm -rf dist
	rm -rf src-tauri/target
	@echo "  [✓] Clean complete."
