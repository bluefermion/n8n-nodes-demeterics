# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Prime Objectives

These are the operational principles that govern development. Follow them strictly.

### Universal Prime Objectives (All Blue Fermion Projects)

| # | Objective | Rationale |
|---|-----------|-----------|
| **U1** | **Never deploy to production without explicit user permission** | Prevents accidental releases; ensures human-in-the-loop for all production changes |
| **U2** | **Never destroy user work with git checkout/reset** | Learned from production incident; always preserve uncommitted changes |
| **U3** | **Documentation in `/docs/` only** | Root folder contains only README.md, CLAUDE.md, AGENTS.md; keeps projects clean |
| **U4** | **Use the shared common library** | `github.com/patdeg/common` provides logging, utilities, and LLM integration |
| **U5** | **Use Demeterics for LLM observability** | All LLM calls should be tagged with APP, FLOW, ENV, USER for cost tracking |

### n8n Node Objectives

| # | Objective | Rationale |
|---|-----------|-----------|
| **N1** | **User-centric model names — never expose internal routing prefixes** | Users select provider separately; model values must be clean names users recognize (e.g., `openai/gpt-oss-120b` not `groq/openai/gpt-oss-120b`, `gpt-4-turbo` not `openai/gpt-4-turbo`). Internal routing IDs like `groq/openai/gpt-oss-120b` are for Datastore indexing, never for UI. The `fetch-config.ts` script strips provider prefixes via `stripProviderPrefix()`. |
| **N2** | **Model changes require full cross-modality analysis** | When any model changes, do a comprehensive audit across **all modalities** (Chat/LLM, Image, Voice/TTS) and **all providers** (Groq, OpenAI, Anthropic, Google, OpenRouter, ElevenLabs, Stability, Leonardo, Murf). Identify new/updated/deprecated/deleted models. Then update: (1) `pricing.yaml` in `demeterics-private/api/`, (2) `deprecated_models.go` if needed, (3) Datastore pricing entities, (4) run `fetch-config.ts` to regenerate `config.ts`/`config.json`, (5) rebuild n8n nodes with `pnpm build`. Never partially update — always do the full sweep. |

### Demeterics-Specific Objectives

| # | Objective | Rationale |
|---|-----------|-----------|
| **D0** | **`api/` is the source of truth** | `portal/` vendors from `api/`; never edit `portal/app/vendor-private/api/` directly |
| **D1** | **Run `make sync-vendor` after api changes** | Synchronizes code from api/ to portal/vendor-private/api/ |
| **D2** | **Never delete BigQuery tables directly** | Safe migration: CREATE AS SELECT → QA → DELETE old → RENAME new |
| **D3** | **Never run migrations without explicit request** | Wait for user to explicitly ask before executing any data migration |
| **D4** | **Production = `demetericsai`, UAT = `demeterics`** | Always use `--project=demetericsai` for production GCP operations |
| **D5** | **Validate template-struct alignment** | Every template field must exist in Go struct; mismatches crash the app |
| **D6** | **Web vs API separation** | Web handlers return HTML/HTMX; API handlers return JSON only |
| **D7** | **Add routes to `knownRoutes` whitelist** | New paths must be added to `bot_blocker.go` whitelist |

### Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRIME OBJECTIVES                             │
├─────────────────────────────────────────────────────────────────┤
│  NEVER                              │  ALWAYS                   │
├────────────────────────────────────┼────────────────────────────┤
│  Deploy without permission          │  Ask before npm publish   │
│  Use git checkout on user files     │  Preserve uncommitted work│
│  Run make package without asking    │  Let user run make package│
│  Delete user work with git reset    │  Confirm destructive ops  │
│  Expose internal routing IDs in UI  │  Use clean model names    │
└────────────────────────────────────┴────────────────────────────┘
```

---

## Blue Fermion Brand Integration

**Brand Guidelines Reference:** `/mnt/e/Dev/BLUE_FERMION_BRAND_GUIDELINE.md`

This project is part of **Blue Fermion Labs** - the SaaS business line of Blue Fermion LLC.

### Brand Identity
- **Business Line:** Blue Fermion Labs (SaaS)
- **Product:** n8n Demeterics Nodes (npm: n8n-nodes-demeterics)
- **Parent Product:** Demeterics LLM Gateway
- **Positioning:** Enterprise-Grade AI Tools Built by Executives
- **Brand Promise:** "Deploy AI with the Rigor of CERN and the Speed of Google"

### Color Palette (Labs Tone: Innovative, Technical, Energetic)
| Role | Color | Hex |
|------|-------|-----|
| Primary | Teal | `#1DA7A0` |
| Secondary | Navy | `#123C6B` |
| Accent | Orange | `#FF6B35` |

### Voice & Tone
- Technical but accessible
- Feature-benefit focused
- Developer-friendly
- Action verbs, direct CTAs

### Required Footer Cross-Reference
All documentation should reference sibling business lines:
- Blue Fermion Labs: https://bluefermionlabs.com
- Blue Fermion Advisory: https://bluefermion.com
- Blue Fermion Publishing: https://unscarcity.ai

---

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

**Important:** The `make package` commands require interactive npm login (OTP/2FA). Claude cannot run these - the user must run `make package` directly in their terminal.

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
