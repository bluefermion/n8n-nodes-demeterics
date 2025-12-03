import { ChatOpenAI } from '@langchain/openai';
import type {
  INodeType,
  INodeTypeDescription,
  ISupplyDataFunctions,
  SupplyData,
  INodeProperties,
  INodePropertyOptions,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

// Provider configurations with their supported models.
const PROVIDERS: Record<string, { name: string; models: INodePropertyOptions[] }> = {
  groq: {
    name: 'Groq',
    models: [
      { name: 'Llama 3.3 70B Versatile', value: 'llama-3.3-70b-versatile' },
      { name: 'Llama 3.1 8B Instant', value: 'llama-3.1-8b-instant' },
      { name: 'Llama 4 Maverick 17B', value: 'meta-llama/llama-4-maverick-17b-128e-instruct' },
      { name: 'Llama 4 Scout 17B', value: 'meta-llama/llama-4-scout-17b-16e-instruct' },
      { name: 'Compound (Multi-model)', value: 'groq/compound' },
      { name: 'Compound Mini', value: 'groq/compound-mini' },
      { name: 'Qwen3 32B', value: 'qwen/qwen3-32b' },
      { name: 'Kimi K2 Instruct', value: 'moonshotai/kimi-k2-instruct' },
      { name: 'GPT-OSS 120B', value: 'openai/gpt-oss-120b' },
      { name: 'GPT-OSS 20B', value: 'openai/gpt-oss-20b' },
    ],
  },
  openai: {
    name: 'OpenAI',
    models: [
      { name: 'GPT-5', value: 'gpt-5' },
      { name: 'GPT-5 Mini', value: 'gpt-5-mini' },
      { name: 'GPT-5 Nano', value: 'gpt-5-nano' },
      { name: 'GPT-5 Codex', value: 'gpt-5-codex' },
      { name: 'GPT-4.1', value: 'gpt-4.1' },
      { name: 'GPT-4.1 Mini', value: 'gpt-4.1-mini' },
      { name: 'GPT-4.1 Nano', value: 'gpt-4.1-nano' },
      { name: 'GPT-4o', value: 'gpt-4o' },
      { name: 'GPT-4o Mini', value: 'gpt-4o-mini' },
      { name: 'GPT-4o Search Preview', value: 'gpt-4o-search-preview' },
      { name: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
      { name: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
    ],
  },
  anthropic: {
    name: 'Anthropic',
    models: [
      { name: 'Claude Opus 4.5', value: 'claude-opus-4-5' },
      { name: 'Claude Opus 4.1', value: 'claude-opus-4-1' },
      { name: 'Claude 3 Opus', value: 'claude-3-opus-20240229' },
      { name: 'Claude Sonnet 4.5', value: 'claude-sonnet-4-5' },
      { name: 'Claude Sonnet 4', value: 'claude-sonnet-4' },
      { name: 'Claude 3.7 Sonnet', value: 'claude-3-7-sonnet' },
      { name: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-20241022' },
      { name: 'Claude Haiku 4.5', value: 'claude-haiku-4-5' },
      { name: 'Claude 3.5 Haiku', value: 'claude-3-5-haiku-20241022' },
    ],
  },
  google: {
    name: 'Google',
    models: [
      { name: 'Gemini 3 Pro Preview', value: 'gemini-3-pro-preview' },
      { name: 'Gemini 2.5 Pro', value: 'gemini-2.5-pro' },
      { name: 'Gemini 2.5 Flash', value: 'gemini-2.5-flash' },
      { name: 'Gemini 2.5 Flash Lite', value: 'gemini-2.5-flash-lite' },
      { name: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
      { name: 'Gemini 2.0 Flash Lite', value: 'gemini-2.0-flash-lite' },
      { name: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
      { name: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash' },
    ],
  },
  openrouter: {
    name: 'OpenRouter',
    models: [
      { name: 'OpenRouter Auto', value: 'openrouter/auto' },
      { name: 'Claude 3.5 Sonnet', value: 'anthropic/claude-3.5-sonnet' },
      { name: 'Gemini 1.5 Pro', value: 'google/gemini-1.5-pro' },
      { name: 'Llama 3.1 70B Instruct', value: 'meta-llama/llama-3.1-70b-instruct' },
      { name: 'Qwen 2.5 72B Instruct', value: 'qwen/qwen-2.5-72b-instruct' },
      { name: 'Mixtral 8x7B Instruct', value: 'mistralai/mixtral-8x7b-instruct' },
    ],
  },
};

const providerOptions: INodePropertyOptions[] = Object.entries(PROVIDERS).map(([key, value]) => ({
  name: value.name,
  value: key,
}));

const modelProperties: INodeProperties[] = Object.entries(PROVIDERS).map(([providerKey, provider]) => ({
  displayName: 'Model',
  name: 'model',
  type: 'options',
  default: provider.models[0]?.value || '',
  options: provider.models,
  displayOptions: {
    show: { provider: [providerKey] },
  },
  description: `Select the ${provider.name} model to use`,
}));

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

    const providerBaseMap: Record<string, string> = {
      groq: 'groq',
      openai: 'openai',
      anthropic: 'anthropic',
      google: 'google',
      openrouter: 'openrouter',
    };
    const providerBase = providerBaseMap[provider] ?? 'openai';

    const providerToCredentialKey: Record<string, string> = {
      groq: 'providerApiKeyGroq',
      openai: 'providerApiKeyOpenAI',
      anthropic: 'providerApiKeyAnthropic',
      google: 'providerApiKeyGemini',
      openrouter: 'providerApiKeyOpenRouter',
    };
    const vendorKeyField = providerToCredentialKey[provider];
    const vendorKey = vendorKeyField ? ((credentials as any)[vendorKeyField] as string) || '' : '';
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

