import { ChatOpenAI } from '@langchain/openai';
import type {
  INodeType,
  INodeTypeDescription,
  ISupplyDataFunctions,
  ILoadOptionsFunctions,
  SupplyData,
  INodePropertyOptions,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

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

// Fallback models when API call fails
const fallbackModels: Record<string, INodePropertyOptions[]> = {
  groq: [
    { name: 'llama-3.3-70b-versatile', value: 'llama-3.3-70b-versatile' },
    { name: 'llama-3.1-8b-instant', value: 'llama-3.1-8b-instant' },
    { name: 'groq/compound', value: 'groq/compound' },
    { name: 'groq/compound-mini', value: 'groq/compound-mini' },
    { name: 'meta-llama/llama-4-maverick-17b-128e-instruct', value: 'meta-llama/llama-4-maverick-17b-128e-instruct' },
    { name: 'qwen/qwen3-32b', value: 'qwen/qwen3-32b' },
  ],
  openai: [
    { name: 'gpt-4o', value: 'gpt-4o' },
    { name: 'gpt-4o-mini', value: 'gpt-4o-mini' },
    { name: 'gpt-4-turbo', value: 'gpt-4-turbo' },
    { name: 'gpt-4', value: 'gpt-4' },
    { name: 'gpt-3.5-turbo', value: 'gpt-3.5-turbo' },
  ],
  anthropic: [
    { name: 'claude-sonnet-4-20250514', value: 'claude-sonnet-4-20250514' },
    { name: 'claude-3-5-sonnet-20241022', value: 'claude-3-5-sonnet-20241022' },
    { name: 'claude-3-5-haiku-20241022', value: 'claude-3-5-haiku-20241022' },
    { name: 'claude-3-opus-20240229', value: 'claude-3-opus-20240229' },
  ],
  google: [
    { name: 'gemini-2.0-flash', value: 'gemini-2.0-flash' },
    { name: 'gemini-1.5-pro', value: 'gemini-1.5-pro' },
    { name: 'gemini-1.5-flash', value: 'gemini-1.5-flash' },
  ],
  openrouter: [
    { name: 'openrouter/auto', value: 'openrouter/auto' },
    { name: 'anthropic/claude-3.5-sonnet', value: 'anthropic/claude-3.5-sonnet' },
    { name: 'google/gemini-pro-1.5', value: 'google/gemini-pro-1.5' },
    { name: 'meta-llama/llama-3.1-70b-instruct', value: 'meta-llama/llama-3.1-70b-instruct' },
  ],
};

// Default model per provider
const defaultModels: Record<string, string> = {
  groq: 'llama-3.3-70b-versatile',
  openai: 'gpt-4o',
  anthropic: 'claude-sonnet-4-20250514',
  google: 'gemini-2.0-flash',
  openrouter: 'openrouter/auto',
};

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
      { displayName: 'Provider', name: 'provider', type: 'options', default: 'groq', options: providerOptions },
      {
        displayName: 'Model',
        name: 'model',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getModels',
          loadOptionsDependsOn: ['provider'],
        },
        default: '',
        description: 'The model to use for chat completion',
      },
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

  methods = {
    loadOptions: {
      async getModels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const provider = this.getCurrentNodeParameter('provider') as string;
        const providerBase = providerBaseMap[provider] ?? provider;

        try {
          const credentials = await this.getCredentials('demetericsApi');
          const demetericsKey = (credentials.apiKey as string) || '';
          const byok = Boolean(credentials.byok);
          const baseUrl = ((credentials.baseUrl as string) || 'https://api.demeterics.com').replace(/\/$/, '');

          // Build API key (combine with vendor key if BYOK)
          const vendorKeyField = providerToCredentialKey[provider];
          const vendorKey = vendorKeyField ? ((credentials as Record<string, unknown>)[vendorKeyField] as string) || '' : '';
          const apiKey = byok && vendorKey ? `${demetericsKey};${vendorKey}` : demetericsKey;

          const response = await this.helpers.httpRequest({
            method: 'GET',
            url: `${baseUrl}/${providerBase}/v1/models`,
            headers: {
              'Authorization': `Bearer ${apiKey}`,
            },
            timeout: 10000,
          });

          const models: INodePropertyOptions[] = [];
          const data = response?.data || response || [];

          for (const model of data) {
            const modelId = model.id || model.name || model;
            if (typeof modelId === 'string') {
              models.push({
                name: modelId,
                value: modelId,
              });
            }
          }

          // Sort models alphabetically
          models.sort((a, b) => (a.name as string).localeCompare(b.name as string));

          // If we got models, return them; otherwise fall back
          if (models.length > 0) {
            return models;
          }
        } catch {
          // Fall through to fallback models
        }

        // Return fallback models for the provider
        return fallbackModels[provider] || [{ name: defaultModels[provider] || 'default', value: defaultModels[provider] || 'default' }];
      },
    },
  };

  async supplyData(this: ISupplyDataFunctions): Promise<SupplyData> {
    const credentials = await this.getCredentials('demetericsApi');
    const demetericsKey = (credentials.apiKey as string) || '';
    const byok = Boolean(credentials.byok);
    const baseUrl = (credentials.baseUrl as string) || 'https://api.demeterics.com';

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
    });

    return { response: chatModel };
  }
}
