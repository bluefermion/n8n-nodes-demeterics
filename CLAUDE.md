# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

n8n community node package for the Demeterics LLM Gateway. Provides unified access to multiple AI providers (Groq, OpenAI, Anthropic, Google Gemini, OpenRouter) through a single API with built-in observability and cost tracking.

## Build Commands

```bash
pnpm install          # Install dependencies
pnpm build            # Build (tsc + gulp icons)
pnpm dev              # Watch mode
pnpm lint             # Run ESLint
pnpm lintfix          # Auto-fix lint issues
pnpm test             # Lint + build + validate
```

## Publishing (Makefile)

Two npm packages are published from this repo:

| Package | Description | n8n Cloud |
|---------|-------------|-----------|
| `n8n-nodes-demeterics-lite` | No LangChain deps, 3 nodes | Compatible |
| `n8n-nodes-demeterics` | Full version with ChatModel | Self-hosted only |

```bash
make package              # Publish BOTH packages
make package-lite         # Publish lite only
make package-full         # Publish full only
make build-variants       # Build without publishing
make check VERSION=x.y.z  # Run n8n security scanner
```

All publish commands accept `BUMP=patch|minor|major` (default: patch).

The `scripts/build-variants.mjs` script generates both package variants into `dist-variants/`.

## Architecture

### Node Types

All nodes implement n8n's `INodeType` interface:

- **DemetericsChatModel** (`nodes/DemetericsChatModel/`) - LangChain-based AI language model sub-node. Uses `@langchain/openai` ChatOpenAI with custom basePath routing. Outputs `NodeConnectionTypes.AiLanguageModel` for use with AI Agent, LLM Chain, etc. This node is excluded from the lite package.

- **DemetericsChat** (`nodes/DemetericsChat/`) - Standalone execution node for one-pass LLM calls via direct HTTP. No LangChain dependency. Supports both `/chat/completions` and `/responses` endpoints.

- **DemetericsCohort** (`nodes/DemetericsCohort/`) - Conversion tracking (submit/retrieve outcomes).

- **DemetericsExtract** (`nodes/DemetericsExtract/`) - Data export (JSON/CSV/Avro).

### Credentials

`credentials/DemetericsApi.credentials.ts` - Single credential type supporting:
- Managed Key mode (Demeterics key only)
- BYOK mode (Demeterics key + per-provider API keys)

### Provider Routing

Both chat nodes share a `PROVIDERS` config mapping provider keys to models. API calls route through Demeterics at `{baseUrl}/{provider}/v1/...`. BYOK mode combines keys as `demetericsKey;vendorKey`.

## n8n Cloud Restrictions

n8n Cloud blocks community nodes with LangChain dependencies via the `@n8n/eslint-plugin-community-nodes` `no-restricted-imports` rule. The lite package excludes ChatModel node and removes `@langchain/openai` dependency to pass verification.
