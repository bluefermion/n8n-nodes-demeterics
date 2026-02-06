import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import type {
  INodeType,
  INodeTypeDescription,
  ISupplyDataFunctions,
  SupplyData,
  INodePropertyOptions,
  INodeProperties,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { getValidatedBaseUrl } from '../utils/security';
import { N8nLlmTracing } from './N8nLlmTracing';
import { chatModelOptions } from '../generated/config';

// Provider options for the dropdown.
const providerOptions: INodePropertyOptions[] = [
  { name: 'Groq', value: 'groq' },
  { name: 'OpenAI', value: 'openai' },
  { name: 'Anthropic', value: 'anthropic' },
  { name: 'Google', value: 'google' },
  { name: 'OpenRouter', value: 'openrouter' },
];

// Map provider keys to Demeterics API path segments.
const providerBaseMap: Record<string, string> = {
  groq: 'groq',
  openai: 'openai',
  anthropic: 'anthropic',
  google: 'google',
  openrouter: 'openrouter',
};

// Map provider keys to credential field names for BYOK.
const providerToCredentialKey: Record<string, string> = {
  groq: 'providerApiKeyGroq',
  openai: 'providerApiKeyOpenAI',
  anthropic: 'providerApiKeyAnthropic',
  google: 'providerApiKeyGemini',
  openrouter: 'providerApiKeyOpenRouter',
};

// Default model per provider (use dated versions for stability)
const defaultModels: Record<string, string> = {
  groq: 'llama-3.3-70b-versatile',
  openai: 'openai/gpt-4o',
  anthropic: 'anthropic/claude-sonnet-4-5',
  google: 'google/gemini-2.5-flash',
  openrouter: '',
};

/**
 * Format a model ID into a user-friendly display name.
 * E.g., "claude-opus-4-5" -> "Claude Opus 4.5"
 */
function formatModelName(name: string): string {
  // Handle common model naming patterns
  return name
    // Replace hyphens with spaces
    .replace(/-/g, ' ')
    // Capitalize first letter of each word
    .replace(/\b\w/g, (c) => c.toUpperCase())
    // Fix common model name patterns
    .replace(/(\d) (\d)/g, '$1.$2')  // "4 5" -> "4.5"
    .replace(/Gpt/g, 'GPT')
    .replace(/Llama/g, 'LLaMA')
    .replace(/\bAi\b/g, 'AI')
    .replace(/\bMini\b/g, 'Mini')
    .replace(/Gemini/g, 'Gemini')
    .replace(/Claude/g, 'Claude')
    .replace(/Opus/g, 'Opus')
    .replace(/Sonnet/g, 'Sonnet')
    .replace(/Haiku/g, 'Haiku');
}

// Generate model properties for each provider (separate dropdown per provider)
// This fixes the n8n loadOptionsDependsOn sync issue by using displayOptions instead
function generateModelProperties(): INodeProperties[] {
  const properties: INodeProperties[] = [];

  for (const [provider, models] of Object.entries(chatModelOptions)) {
    if (!models || models.length === 0) continue;

    // Deduplicate: prefer short aliases over dated versions when both exist
    // e.g., keep "claude-opus-4-5" and hide "claude-opus-4-5-20251101"
    // Uses model VALUE (API ID) for dedup since display names use dots not hyphens
    const deduplicatedModels: INodePropertyOptions[] = [];

    // First pass: group by base value (strip date suffix from API model ID)
    const modelMap = new Map<string, INodePropertyOptions[]>();
    for (const model of models) {
      // Extract base value by removing date suffix from API ID (e.g., "-20251101")
      const baseValue = (model.value as string).replace(/-\d{8}$/, '');
      if (!modelMap.has(baseValue)) {
        modelMap.set(baseValue, []);
      }
      modelMap.get(baseValue)!.push(model);
    }

    // Second pass: for each base value, prefer the short version (alias without date)
    for (const [baseValue, variants] of modelMap) {
      if (variants.length === 1) {
        // Format name for display
        const model = { ...variants[0] };
        model.name = formatModelName(model.name as string);
        deduplicatedModels.push(model);
      } else {
        // Multiple variants - prefer the one whose value matches the base (no date suffix)
        const shortVersion = variants.find(v => (v.value as string) === baseValue);
        if (shortVersion) {
          const model = { ...shortVersion };
          model.name = formatModelName(model.name as string);
          deduplicatedModels.push(model);
        } else {
          // No short version, use the first one
          const model = { ...variants[0] };
          model.name = formatModelName(model.name as string);
          deduplicatedModels.push(model);
        }
      }
    }

    // Sort alphabetically for better UX
    deduplicatedModels.sort((a, b) => (a.name as string).localeCompare(b.name as string));

    properties.push({
      displayName: 'Model',
      name: 'model',
      type: 'options',
      default: defaultModels[provider] || (deduplicatedModels[0]?.value as string) || '',
      options: deduplicatedModels,
      displayOptions: {
        show: {
          provider: [provider],
        },
      },
      description: 'The model to use for chat completion',
    });
  }

  return properties;
}

// Pre-generate model properties at module load time
const modelProperties = generateModelProperties();

export class DemetericsChatModel implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Demeterics Chat Model',
    name: 'demetericsChatModel',
    icon: { light: 'file:demeterics-node-light.svg', dark: 'file:demeterics-node-dark.svg' },
    group: ['transform'],
    version: 1,
    description: 'Supply an AI Chat Model via Demeterics unified API',
    defaults: { name: 'Demeterics Chat Model' },
    codex: {
      categories: ['AI'],
      subcategories: { AI: ['Language Models', 'Root Nodes'] },
      resources: { primaryDocumentation: [{ url: 'https://demeterics.ai/docs/api-reference' }] },
    },
    inputs: [],
    outputs: [NodeConnectionTypes.AiLanguageModel],
    outputNames: ['Model'],
    credentials: [{ name: 'demetericsApi', required: true }],
    properties: [
      {
        displayName: 'Provider',
        name: 'provider',
        type: 'options',
        default: 'groq',
        options: providerOptions,
        description: 'Select the AI provider',
      },
      // Model dropdowns - one per provider with displayOptions for proper sync
      ...modelProperties,
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          { displayName: 'Temperature', name: 'temperature', type: 'number', typeOptions: { minValue: 0, maxValue: 2, numberPrecision: 1 }, default: 0.7 },
          { displayName: 'Max Tokens', name: 'maxTokens', type: 'number', typeOptions: { minValue: 1, maxValue: 128000 }, default: 4096 },
          { displayName: 'Top P', name: 'topP', type: 'number', typeOptions: { minValue: 0, maxValue: 1, numberPrecision: 2 }, default: 1 },
          { displayName: 'Frequency Penalty', name: 'frequencyPenalty', type: 'number', typeOptions: { minValue: -2, maxValue: 2, numberPrecision: 1 }, default: 0 },
          { displayName: 'Presence Penalty', name: 'presencePenalty', type: 'number', typeOptions: { minValue: -2, maxValue: 2, numberPrecision: 1 }, default: 0 },
          { displayName: 'Timeout (seconds)', name: 'timeout', type: 'number', typeOptions: { minValue: 1, maxValue: 600 }, default: 60 },
        ],
      },
    ],
  };

  async supplyData(this: ISupplyDataFunctions): Promise<SupplyData> {
    const credentials = await this.getCredentials('demetericsApi');
    const demetericsKey = (credentials.apiKey as string) || '';
    const byok = Boolean(credentials.byok);
    const baseUrl = getValidatedBaseUrl(credentials.baseUrl as string);

    const provider = this.getNodeParameter('provider', 0) as string;
    const model = this.getNodeParameter('model', 0) as string;
    const options = this.getNodeParameter('options', 0, {}) as {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
      frequencyPenalty?: number;
      presencePenalty?: number;
      timeout?: number;
    };

    const providerBase = providerBaseMap[provider] ?? 'openai';

    const vendorKeyField = providerToCredentialKey[provider];
    const vendorKey = vendorKeyField ? ((credentials as Record<string, unknown>)[vendorKeyField] as string) || '' : '';
    const apiKey = byok && vendorKey ? `${demetericsKey};${vendorKey}` : demetericsKey;

    // Create the tracing callback for execution tracking in n8n UI
    const tracingCallback = new N8nLlmTracing(this);

    // Use ChatAnthropic for Anthropic provider to get native Anthropic API format
    if (provider === 'anthropic') {
      // Anthropic API constraints:
      // 1. Cannot use both temperature and topP together
      // 2. topP must be between 0 and 1 (LangChain defaults to -1 which is invalid)
      // 3. temperature must be between 0 and 1
      const anthropicOptions: Record<string, unknown> = {
        anthropicApiKey: apiKey,
        anthropicApiUrl: `${baseUrl.replace(/\/$/, '')}/${providerBase}`,
        model,
        callbacks: [tracingCallback],
      };

      // Always set maxTokens (required for Anthropic)
      anthropicOptions.maxTokens = options.maxTokens ?? 4096;

      // Only pass temperature OR topP, never both (Anthropic constraint)
      // Priority: temperature > topP (temperature is more commonly used)
      if (options.temperature !== undefined) {
        anthropicOptions.temperature = options.temperature;
        // Explicitly set topP to undefined to prevent LangChain's -1 default
        anthropicOptions.topP = undefined;
      } else if (options.topP !== undefined && options.topP >= 0 && options.topP <= 1) {
        // Only use topP if it's a valid value
        anthropicOptions.topP = options.topP;
      } else {
        // Default: use temperature 0.7, explicitly disable topP
        anthropicOptions.temperature = 0.7;
        anthropicOptions.topP = undefined;
      }

      const chatModel = new ChatAnthropic(anthropicOptions);

      return { response: chatModel };
    }

    // Use ChatOpenAI for OpenAI-compatible providers (groq, openai, google, openrouter)
    const chatModel = new ChatOpenAI({
      apiKey,
      model,
      temperature: options.temperature ?? 0.7,
      maxTokens: options.maxTokens ?? 4096,
      topP: options.topP ?? 1,
      frequencyPenalty: options.frequencyPenalty ?? 0,
      presencePenalty: options.presencePenalty ?? 0,
      timeout: (options.timeout ?? 60) * 1000,
      configuration: {
        basePath: `${baseUrl.replace(/\/$/, '')}/${providerBase}/v1`,
      },
      callbacks: [tracingCallback],
    });

    return { response: chatModel };
  }
}
