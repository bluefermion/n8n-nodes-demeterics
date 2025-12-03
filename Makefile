.PHONY: install build dev lint lintfix format clean check publish help pack install-local uninstall-local install-custom uninstall-custom cli-build cli-install prepare verify version bump package package-lite package-full wait-publish wait-publish-pkg build-variants

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
	VER_ARG="$(VERSION)"; \
	if [ -z "$$PKG_NAME" ]; then \
		echo "Could not determine package name; skipping scan"; exit 0; \
	fi; \
	if [ -n "$$VER_ARG" ]; then \
		echo "Scanning $$PKG_NAME@$$VER_ARG"; \
		npx @n8n/scan-community-package "$$PKG_NAME@$$VER_ARG"; \
		exit $$?; \
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

# Show local and npm registry versions
version:
	@set -e; \
	PKG=$$(node -p "require('./package.json').name"); \
	LOCAL=$$(node -p "require('./package.json').version"); \
	echo "Package: $$PKG"; \
	echo "Local version: $$LOCAL"; \
	NPM_VER=$$(npm view $$PKG version 2>/dev/null || echo "(not published) "); \
	TAGS=$$(npm view $$PKG dist-tags --json 2>/dev/null || echo "{}"); \
	VERS=$$(npm view $$PKG versions --json 2>/dev/null || echo "[]"); \
	echo "NPM latest: $$NPM_VER"; \
	echo "NPM dist-tags: $$TAGS"; \
	echo "NPM versions: $$VERS"

# Bump version without creating a git tag.
# Usage: make bump [BUMP=patch|minor|major]
BUMP ?= patch
bump:
	@echo "Bumping package version ($(BUMP)) without git tag…"
	@npm version $(BUMP) --no-git-tag-version
	@echo "New version: $$(node -p "require('./package.json').version")"

# Build both package variants (lite + full) into dist-variants/
build-variants: build
	@echo "Building package variants…"
	@node scripts/build-variants.mjs both

# End-to-end packaging and publish flow for BOTH packages:
# - bump version
# - commit and push changes
# - run validations (lint+build+validate)
# - publish both lite and full to npm
# - run scanner against published versions
# Usage: make package [BUMP=patch|minor|major]
package: bump
	@set -e; \
	VERSION=$$(node -p "require('./package.json').version"); \
	echo "Committing release v$$VERSION"; \
	git add -A; \
	git commit -m "chore: release v$$VERSION" || echo "No changes to commit"; \
	git push origin HEAD:main; \
	echo "Running local validations…"; \
	pnpm test; \
	echo ""; \
	echo "=== Building package variants ==="; \
	node scripts/build-variants.mjs both; \
	echo ""; \
	echo "=== Publishing n8n-nodes-demeterics-lite@$$VERSION (n8n Cloud compatible) ==="; \
	cd dist-variants/n8n-nodes-demeterics-lite && npm publish --access public; \
	echo ""; \
	echo "=== Publishing n8n-nodes-demeterics@$$VERSION (full, self-hosted) ==="; \
	cd dist-variants/n8n-nodes-demeterics && npm publish --access public; \
	echo ""; \
	echo "Waiting for packages to propagate…"; \
	$(MAKE) wait-publish-pkg PKG=n8n-nodes-demeterics-lite VER=$$VERSION; \
	$(MAKE) wait-publish-pkg PKG=n8n-nodes-demeterics VER=$$VERSION; \
	echo ""; \
	echo "=== Running post-publish scanner for lite version ==="; \
	npx @n8n/scan-community-package "n8n-nodes-demeterics-lite@$$VERSION" || echo "Scanner failed — continuing."; \
	echo ""; \
	echo "=== Done! Both packages published successfully ==="

# Publish only the lite package (n8n Cloud compatible)
# Usage: make package-lite [BUMP=patch|minor|major]
package-lite: bump
	@set -e; \
	VERSION=$$(node -p "require('./package.json').version"); \
	echo "Committing release v$$VERSION"; \
	git add -A; \
	git commit -m "chore: release v$$VERSION" || echo "No changes to commit"; \
	git push origin HEAD:main; \
	echo "Running local validations…"; \
	pnpm test; \
	echo "Building lite variant…"; \
	node scripts/build-variants.mjs lite; \
	echo "Publishing n8n-nodes-demeterics-lite@$$VERSION to npm…"; \
	cd dist-variants/n8n-nodes-demeterics-lite && npm publish --access public; \
	echo "Waiting for $$VERSION to propagate…"; \
	$(MAKE) wait-publish-pkg PKG=n8n-nodes-demeterics-lite VER=$$VERSION; \
	echo "Running post-publish scanner…"; \
	npx @n8n/scan-community-package "n8n-nodes-demeterics-lite@$$VERSION" || echo "Scanner failed — continuing."

# Publish only the full package (self-hosted, includes LangChain)
# Usage: make package-full [BUMP=patch|minor|major]
package-full: bump
	@set -e; \
	VERSION=$$(node -p "require('./package.json').version"); \
	echo "Committing release v$$VERSION"; \
	git add -A; \
	git commit -m "chore: release v$$VERSION" || echo "No changes to commit"; \
	git push origin HEAD:main; \
	echo "Running local validations…"; \
	pnpm test; \
	echo "Building full variant…"; \
	node scripts/build-variants.mjs full; \
	echo "Publishing n8n-nodes-demeterics@$$VERSION to npm…"; \
	cd dist-variants/n8n-nodes-demeterics && npm publish --access public; \
	echo "Waiting for $$VERSION to propagate…"; \
	$(MAKE) wait-publish-pkg PKG=n8n-nodes-demeterics VER=$$VERSION; \
	echo "Note: Full package includes LangChain — scanner will report violations (expected).";

# Wait until npm shows the published version as latest (uses package.json name)
wait-publish:
	@set -e; \
	PKG=$$(node -p "require('./package.json').name"); \
	VER=$$(node -p "require('./package.json').version"); \
	$(MAKE) wait-publish-pkg PKG=$$PKG VER=$$VER

# Wait for a specific package@version to appear on npm
# Usage: make wait-publish-pkg PKG=package-name VER=1.0.0
wait-publish-pkg:
	@set -e; \
	echo "Waiting for $(PKG)@$(VER) on npm registry…"; \
	for i in $$(seq 1 24); do \
	  CUR=$$(npm view $(PKG) version 2>/dev/null || echo ""); \
	  if [ "$$CUR" = "$(VER)" ]; then echo "Found $(PKG)@$(VER)"; exit 0; fi; \
	  echo "Still sees '$$CUR' (try $$i), sleeping 5s…"; \
	  sleep 5; \
	done; \
	echo "Timed out waiting for $(PKG)@$(VER)"; exit 1

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
	@echo "  make install       - Install dependencies"
	@echo "  make build         - Build the package (prefers n8n-node CLI)"
	@echo "  make build-variants- Build both lite and full package variants"
	@echo "  make dev           - Watch mode for development"
	@echo "  make lint          - Run linter"
	@echo "  make lintfix       - Fix linting issues"
	@echo "  make format        - Format code with prettier"
	@echo "  make clean         - Remove build artifacts"
	@echo "  make check         - Run n8n community package scanner"
	@echo "  make verify        - Run local validations (lint+build+validate)"
	@echo "  make prepare       - Build with CLI, scan, and pack tarball"
	@echo "  make bump          - Bump version without git tag (BUMP=patch|minor|major)"
	@echo ""
	@echo "Publishing (all use BUMP=patch|minor|major):"
	@echo "  make package       - Publish BOTH lite + full packages"
	@echo "  make package-lite  - Publish only n8n-nodes-demeterics-lite (n8n Cloud)"
	@echo "  make package-full  - Publish only n8n-nodes-demeterics (self-hosted)"
	@echo ""
	@echo "Package variants:"
	@echo "  n8n-nodes-demeterics-lite - Verified, n8n Cloud compatible (no LangChain)"
	@echo "  n8n-nodes-demeterics      - Full version with ChatModel (self-hosted only)"
	@echo ""
	@echo "Other:"
	@echo "  make link          - Instructions for local testing"
	@echo "  make publish       - Publish to npm registry (legacy)"
	@echo "  make cli-install   - Attempt to install n8n-node CLI globally"
	@echo "  make version       - Show local and npm registry versions"
