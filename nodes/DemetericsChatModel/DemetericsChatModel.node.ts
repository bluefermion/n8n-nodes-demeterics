import { ChatOpenAI } from '@langchain/openai';
import type {
  INodeType,
  INodeTypeDescription,
  ISupplyDataFunctions,
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
        type: 'string',
        default: 'llama-3.3-70b-versatile',
        placeholder: 'e.g., groq/compound, llama-3.3-70b-versatile',
        description: 'The model ID to use. See provider documentation for available models.',
        hint: 'Groq: groq/compound, llama-3.3-70b-versatile | OpenAI: gpt-4o, gpt-4-turbo | Anthropic: claude-sonnet-4',
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

