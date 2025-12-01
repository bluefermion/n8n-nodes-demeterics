.PHONY: install build dev lint lintfix format clean check publish help

# Install dependencies
install:
	pnpm install

# Build the node package
build:
	pnpm build

# Development mode with watch
dev:
	pnpm dev

# Run linter
lint:
	pnpm lint

# Fix linting issues
lintfix:
	pnpm lintfix

# Format code
format:
	pnpm format

# Clean build artifacts
clean:
	rm -rf dist node_modules

# Run n8n community package scanner (for verification)
check:
	pnpm check

# Link for local n8n testing
link:
	@echo "To test locally in n8n:"
	@echo "1. Build the package: make build"
	@echo "2. In your n8n directory, run: pnpm link /path/to/n8n-nodes-demeterics"
	@echo "3. Restart n8n"

# Publish to npm (requires npm login)
publish:
	pnpm release

# Show help
help:
	@echo "n8n-nodes-demeterics Makefile"
	@echo ""
	@echo "Usage:"
	@echo "  make install   - Install dependencies"
	@echo "  make build     - Build the package"
	@echo "  make dev       - Watch mode for development"
	@echo "  make lint      - Run linter"
	@echo "  make lintfix   - Fix linting issues"
	@echo "  make format    - Format code with prettier"
	@echo "  make clean     - Remove build artifacts"
	@echo "  make check     - Run n8n community package scanner"
	@echo "  make link      - Instructions for local testing"
	@echo "  make publish   - Publish to npm registry"
