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

Follow the [n8n community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

### Quick Install

1. Go to **Settings > Community Nodes** in your n8n instance
2. Select **Install**
3. Enter `n8n-nodes-demeterics` and confirm

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
4. Enter your API key prefix and secret

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

## Example Workflow

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

## Support

- **Documentation**: [demeterics.ai/docs](https://demeterics.ai/docs)
- **GitHub Issues**: [Report a bug](https://github.com/bluefermion/n8n-nodes-demeterics/issues)
- **Email**: support@demeterics.com

## License

[MIT](LICENSE)

---

Built by [Demeterics](https://demeterics.ai) - LLM Observability & Cost Tracking
