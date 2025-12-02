.PHONY: install build dev lint lintfix format clean check publish help pack install-local uninstall-local install-custom uninstall-custom cli-build cli-install prepare verify version package

# Default n8n user folder (override with: make install-custom DIR=/your/path)
DIR ?= /opt/n8n/n8n_data

# Install dependencies
install:
	pnpm install

# Prefer the official n8n-node CLI when available
# Falls back to the existing TypeScript + gulp build
build: cli-build

# Use n8n-node CLI if present, otherwise try via pnpm dlx, else fallback
cli-build:
	@echo "Building with n8n-node CLI when available…"
	@if command -v n8n-node >/dev/null 2>&1; then \
	  n8n-node build || pnpm build; \
	else \
	  pnpm dlx n8n-node build || pnpm build; \
	fi

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
	@echo "Running n8n community package scanner…"
	@PKG_NAME=$$(node -p "require('./package.json').name" 2>/dev/null || echo ""); \
	if [ -z "$$PKG_NAME" ]; then \
		echo "Could not determine package name; skipping scan"; \
		exit 0; \
	fi; \
	if npm view "$$PKG_NAME" name >/dev/null 2>&1; then \
		npx @n8n/scan-community-package "$$PKG_NAME"; \
	else \
		echo "Package '$$PKG_NAME' is not published on npm yet. Skipping scanner."; \
	fi

# Prepare for submission: build with CLI, run scanner, create npm pack
prepare: build check pack

# Create a publishable tarball from dist/
pack: build
	@echo "Packing npm tarball…"
	@TARBALL=$$(npm pack | tail -n1); \
	 echo "Created $$TARBALL";

# Default install to custom path
install: install-custom

# Install into a local n8n user folder (default DIR=/opt/n8n)
# Usage: make install-local [DIR=/opt/n8n]
install-local: build
	@echo "Installing to $(DIR)"; \
	 TARBALL=$$(npm pack | tail -n1); \
	 echo "Using $$TARBALL"; \
	 npm install --prefix "$(DIR)" "./$$TARBALL"; \
	 echo "Installed at $(DIR)/node_modules/n8n-nodes-demeterics";

# Uninstall from a local n8n user folder (default DIR=/opt/n8n)
# Usage: make uninstall-local [DIR=/opt/n8n]
uninstall-local:
	@echo "Uninstalling from $(DIR)"; \
	 npm remove --prefix "$(DIR)" n8n-nodes-demeterics || true; \
	 echo "Done."

# Install into custom folder: $(DIR)/custom/node_modules
# Usage: make install-custom [DIR=/opt/n8n/n8n_data]
install-custom: build
	@echo "Installing to $(DIR)/custom"; \
	 mkdir -p "$(DIR)/custom"; \
	 TARBALL=$$(npm pack | tail -n1); \
	 echo "Using $$TARBALL"; \
	 npm install --prefix "$(DIR)/custom" "./$$TARBALL"; \
	 echo "Installed at $(DIR)/custom/node_modules/n8n-nodes-demeterics";

# Uninstall from custom folder
uninstall-custom:
	@echo "Uninstalling from $(DIR)/custom"; \
	 npm remove --prefix "$(DIR)/custom" n8n-nodes-demeterics || true; \
	 echo "Done."

# Link for local n8n testing
link:
	@echo "To test locally in n8n:"
	@echo "1. Build the package: make build"
	@echo "2. In your n8n directory, run: pnpm link /path/to/n8n-nodes-demeterics"
	@echo "3. Restart n8n"

# Publish to npm (requires npm login)
publish:
	pnpm release

# Run local validations (lint + build + custom validator)
verify:
	pnpm test

# Bump version without creating a git tag.
# Usage: make version [BUMP=patch|minor|major]
BUMP ?= patch
version:
	@echo "Bumping package version ($(BUMP)) without git tag…"
	@npm version $(BUMP) --no-git-tag-version
	@echo "New version: $$(node -p "require('./package.json').version")"

# End-to-end packaging and publish flow:
# - bump version
# - commit and push changes
# - run validations (lint+build+validate)
# - publish to npm (interactive for 2FA)
# - run scanner against published version
# Usage: make package [BUMP=patch|minor|major]
package: version
	@set -e; \
	VERSION=$$(node -p "require('./package.json').version"); \
	echo "Committing release v$$VERSION"; \
	git add -A; \
	git commit -m "chore: release v$$VERSION" || echo "No changes to commit"; \
	git push origin HEAD:main; \
	echo "Running local validations…"; \
	pnpm test; \
	echo "Publishing n8n-nodes-demeterics@$$VERSION to npm…"; \
	pnpm publish --access public; \
	echo "Running post-publish scanner…"; \
	$(MAKE) check;

# Attempt to install the n8n-node CLI globally (optional). If this fails,
# you can still build via the fallback path in the build target.
cli-install:
	@echo "Installing n8n-node CLI globally (optional)…"
	@if command -v pnpm >/dev/null 2>&1; then \
	  pnpm add -g n8n-node || true; \
	else \
	  npm i -g n8n-node || true; \
	fi

# Show help
help:
	@echo "n8n-nodes-demeterics Makefile"
	@echo ""
	@echo "Usage:"
	@echo "  make install   - Install dependencies"
	@echo "  make build     - Build the package (prefers n8n-node CLI)"
	@echo "  make dev       - Watch mode for development"
	@echo "  make lint      - Run linter"
	@echo "  make lintfix   - Fix linting issues"
	@echo "  make format    - Format code with prettier"
	@echo "  make clean     - Remove build artifacts"
	@echo "  make check     - Run n8n community package scanner"
	@echo "  make verify    - Run local validations (lint+build+validate)"
	@echo "  make prepare   - Build with CLI, scan, and pack tarball"
	@echo "  make version   - Bump version without git tag (BUMP=patch|minor|major)"
	@echo "  make package   - Full flow: bump, commit, push, test, publish, scan"
	@echo "  make link      - Instructions for local testing"
	@echo "  make publish   - Publish to npm registry"
	@echo "  make cli-install - Attempt to install n8n-node CLI globally"
