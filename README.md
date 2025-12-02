# n8n-nodes-demeterics

[![npm version](https://badge.fury.io/js/n8n-nodes-demeterics.svg)](https://www.npmjs.com/package/n8n-nodes-demeterics)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An [n8n](https://n8n.io/) community node for the **[Demeterics](https://demeterics.ai) LLM Gateway** - access multiple AI providers through a unified API with built-in observability, analytics, and cost tracking.

## What is Demeterics?

[Demeterics](https://demeterics.ai) is an LLM observability platform that provides:

- **Unified API**: Access OpenAI, Anthropic, Groq, Google Gemini, and more through a single endpoint
- **Cost Tracking**: Monitor spend across all AI providers in real-time
- **Full Observability**: Log every prompt, response, and token for debugging and compliance
- **Analytics Dashboard**: Understand usage patterns, latency, and performance metrics

Learn more at [demeterics.ai](https://demeterics.ai) or read the [documentation](https://demeterics.ai/docs).

## Features

- **Multi-Provider Access**: Switch between Groq, OpenAI, Anthropic, and Google Gemini with a single credential
- **LangChain Compatible**: Works seamlessly with n8n's AI Agent, LLM Chain, and other AI nodes
- **Built-in Tracking**: Every request is automatically logged to your Demeterics dashboard
- **Cost Visibility**: See exactly what each workflow costs in real-time

## Installation

There are multiple ways to install this node depending on your n8n setup.

### Option 1: GUI Install (Recommended for n8n Cloud & Desktop)

1. Go to **Settings > Community Nodes** in your n8n instance
2. Select **Install**
3. Enter `n8n-nodes-demeterics` and confirm
4. Restart n8n if prompted

For more details, see the [n8n community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

---

### Option 2: Self-Hosted n8n (Docker with Custom Dockerfile)

This is the **recommended approach** for Docker-based self-hosted n8n servers. It bakes the node directly into your Docker image.

#### Step 1: Create a Custom Dockerfile

Create a `Dockerfile` in your n8n project directory:

```dockerfile
FROM n8nio/n8n:latest

USER root

# Install the Demeterics node globally
RUN npm install -g n8n-nodes-demeterics

USER node
```

#### Step 2: Update docker-compose.yml

Modify your `docker-compose.yml` to build from the Dockerfile instead of using the pre-built image:

```yaml
version: '3.8'

services:
  n8n:
    build:
      context: .
      dockerfile: Dockerfile
    # Remove or comment out the 'image:' line if present
    # image: n8nio/n8n:latest
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - GENERIC_TIMEZONE=America/New_York
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
```

#### Step 3: Build and Start

```bash
# Build the custom image
docker-compose build

# Start n8n
docker-compose up -d
```

The Demeterics node will now appear in your n8n node panel.

---

### Option 3: Self-Hosted n8n (Volume Mount Method)

If you prefer not to rebuild the Docker image, you can mount the node directly into the container.

#### Step 1: Install the Node Locally

```bash
# Create a directory for custom nodes
mkdir -p ~/n8n-custom-nodes
cd ~/n8n-custom-nodes

# Install the package
npm install n8n-nodes-demeterics
```

#### Step 2: Update docker-compose.yml

Add a volume mount to your `docker-compose.yml`:

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    restart: unless-stopped
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
      # Mount the custom node
      - ~/n8n-custom-nodes/node_modules/n8n-nodes-demeterics:/home/node/.n8n/custom/node_modules/n8n-nodes-demeterics

volumes:
  n8n_data:
```

#### Step 3: Restart n8n

```bash
docker-compose restart
```

---

### Option 4: Self-Hosted n8n (Manual npm Install - Non-Docker)

For bare-metal or VM installations running n8n directly with Node.js:

#### Step 1: Navigate to n8n Directory

```bash
cd ~/.n8n
```

#### Step 2: Install the Package

```bash
npm install n8n-nodes-demeterics
```

#### Step 3: Restart n8n

```bash
# If running as a service
sudo systemctl restart n8n

# Or if running manually, stop and start again
n8n start
```

---

### Option 5: Install from GitHub (Development/Testing)

To install directly from the GitHub repository:

```bash
# Clone the repository
git clone https://github.com/bluefermion/n8n-nodes-demeterics.git
cd n8n-nodes-demeterics

# Install dependencies
pnpm install

# Build the package
pnpm build

# Create a tarball
npm pack

# Install in your n8n custom directory
cd ~/.n8n
npm install /path/to/n8n-nodes-demeterics-0.1.0.tgz
```

Or install directly from GitHub:

```bash
cd ~/.n8n
npm install git+https://github.com/bluefermion/n8n-nodes-demeterics.git
```

---

### Verifying Installation

After installation, verify the node is available:

1. Open your n8n instance
2. Create a new workflow
3. Click the **+** button to add a node
4. Search for "Demeterics"
5. You should see **Demeterics Chat Model** in the results

If the node doesn't appear, try:
- Restarting n8n completely
- Checking the n8n logs for errors: `docker-compose logs n8n`
- Ensuring the package is installed in the correct location

## Getting Started

### 1. Get Your API Key

1. Sign up at [demeterics.ai](https://demeterics.ai)
2. Navigate to **API Keys** in your dashboard
3. Create a new API key
4. Note both the **prefix** (e.g., `dmt_abc123`) and **secret** parts

### 2. Add Credentials in n8n

1. Go to **Credentials** in n8n
2. Click **Add Credential**
3. Search for "Demeterics API"
4. Enter your single Demeterics API key (e.g., `dmt_xxx...`)
5. Optional (BYOK): Toggle BYOK and add the provider key(s) you plan to use:
   - Groq, OpenAI, Anthropic, Gemini, OpenRouter
   The Chat node will automatically combine keys depending on the selected provider.

### 3. Use in Your Workflow

The **Demeterics Chat Model** node works with:

- **AI Agent** - Build intelligent agents with tool use
- **Basic LLM Chain** - Simple prompt → response workflows
- **Summarization Chain** - Summarize documents
- **Question and Answer Chain** - RAG-based Q&A

## Supported Providers & Models

| Provider | Models |
|----------|--------|
| **Groq** | Llama 3.3 70B, Llama 4 Maverick/Scout, Compound AI, Qwen3 32B, Kimi K2, GPT-OSS |
| **OpenAI** | GPT-5/Mini/Nano/Codex, GPT-4.1/Mini/Nano, GPT-4o/Mini |
| **Anthropic** | Claude Opus 4.5/4.1, Claude Sonnet 4.5/4/3.7, Claude Haiku 4.5/3.5 |
| **Google** | Gemini 3 Pro, Gemini 2.5 Pro/Flash, Gemini 2.0 Flash, Gemini 1.5 Pro/Flash |
| **OpenRouter** | openrouter/auto, plus curated Anthropic/Google/Meta/Qwen/Mistral routes |

See the [full model list](https://demeterics.ai/docs/api-reference) for all supported models and pricing.

## Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| Temperature | Controls randomness (0-2) | 0.7 |
| Max Tokens | Maximum response length | 4096 |
| Top P | Nucleus sampling parameter | 1 |
| Frequency Penalty | Reduce repetition (-2 to 2) | 0 |
| Presence Penalty | Encourage new topics (-2 to 2) | 0 |
| Timeout | Request timeout in seconds | 60 |

## Example Workflows

```
[Chat Trigger] → [AI Agent] ← [Demeterics Chat Model]
                     ↑
                  [Tools]
```

1. Add a **Chat Trigger** node
2. Add an **AI Agent** node
3. Connect **Demeterics Chat Model** to the AI Agent's "Chat Model" input
4. Select your provider and model
5. Add tools as needed (Calculator, Code, HTTP Request, etc.)

### Submit and Retrieve Cohort Outcomes

```
[Any Flow] → [Demeterics Cohort]
```

- Operation: Submit Outcome or Get Outcome
- Fields: `cohortId` (required), optional `outcome`, `outcomeV2`, `label`, `eventDate`

### Export Interaction Data

```
[Any Flow] → [Demeterics Extract]
```

- Operation: Export Interactions (Simple), Create Export Job, or Stream Export by Request ID
- Formats: JSON (parsed items), CSV/Avro (binary file)

## Resources

- [Demeterics Platform](https://demeterics.ai)
- [Demeterics Documentation](https://demeterics.ai/docs)
- [n8n Integration Guide](https://demeterics.ai/docs/n8n)
- [API Reference](https://demeterics.ai/docs/api-reference)
- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)

## Compatibility

- **n8n**: 1.0.0+
- **Node.js**: 18.0+

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Development mode
pnpm dev

# Lint
pnpm lint

# Run n8n package scanner
pnpm check
```

## Pack
- Install CLI (optional): `make cli-install`
- Build: `make build`
- Prepare for submission (recommended): `make prepare`
- Scan only: `make check`
- Pack tarball: `make pack`

- Bump version:
    - Patch: npm version patch --no-git-tag-version
    - Or set manually in package.json under version.
- Build + sanity check:
    - make build (uses n8n-node if present, falls back to tsc+gulp)
    - Optional: npm pack to inspect the tarball contents
- Publish:
    - Using pnpm script: pnpm run release
    - This runs `pnpm build` and `pnpm publish --access public`.
- Or directly with npm: npm publish --access public
    - If prompted, enter your OTP (2FA).
- Verify on npm:
    - npm view n8n-nodes-demeterics version shows the new version.


## Support

- **Documentation**: [demeterics.ai/docs](https://demeterics.ai/docs)
- **GitHub Issues**: [Report a bug](https://github.com/bluefermion/n8n-nodes-demeterics/issues)
- **Email**: support@demeterics.com

## License

[MIT](LICENSE)

---

Built by [Demeterics](https://demeterics.ai) - LLM Observability & Cost Tracking
