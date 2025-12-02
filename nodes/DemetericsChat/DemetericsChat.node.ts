import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  INodeProperties,
  INodePropertyOptions,
} from 'n8n-workflow';

const PROVIDERS: Record<string, { name: string; models: INodePropertyOptions[] }> = {
  groq: {
    name: 'Groq',
    models: [
      { name: 'Llama 3.3 70B Versatile', value: 'llama-3.3-70b-versatile' },
      { name: 'Llama 3.1 8B Instant', value: 'llama-3.1-8b-instant' },
      { name: 'meta-llama Maverick 17B', value: 'meta-llama/llama-4-maverick-17b-128e-instruct' },
      { name: 'meta-llama Scout 17B', value: 'meta-llama/llama-4-scout-17b-16e-instruct' },
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
  displayOptions: { show: { provider: [providerKey] } },
  description: `Select the ${provider.name} model to use`,
}));

export class DemetericsChat implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Demeterics Chat',
    name: 'demetericsChatHttp',
    icon: 'file:demeterics-node.svg',
    group: ['transform'],
    version: 1,
    description: 'Chat completions via Demeterics unified API (HTTP)',
    defaults: { name: 'Demeterics Chat' },
    codex: {
      categories: ['AI'],
      subcategories: { AI: ['Root Nodes'] },
      resources: { primaryDocumentation: [{ url: 'https://demeterics.ai/docs/api-reference' }] },
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [{ name: 'demetericsApi', required: true }],
    properties: [
      { displayName: 'Provider', name: 'provider', type: 'options', default: 'groq', options: providerOptions },
      ...modelProperties,
      { displayName: 'Prompt', name: 'prompt', type: 'string', typeOptions: { rows: 4 }, default: '', description: 'User input prompt. If empty, uses incoming item field "message".' },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          { displayName: 'System Prompt', name: 'system', type: 'string', typeOptions: { rows: 3 }, default: '' },
          { displayName: 'Temperature', name: 'temperature', type: 'number', typeOptions: { minValue: 0, maxValue: 2, numberPrecision: 2 }, default: 0.7 },
          { displayName: 'Max Tokens', name: 'maxTokens', type: 'number', typeOptions: { minValue: 1, maxValue: 128000 }, default: 4096 },
          { displayName: 'Top P', name: 'topP', type: 'number', typeOptions: { minValue: 0, maxValue: 1, numberPrecision: 2 }, default: 1 },
          { displayName: 'Cohort ID', name: 'cohortId', type: 'string', default: '' },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const provider = this.getNodeParameter('provider', i) as string;
      const model = this.getNodeParameter('model', i) as string;
      const prompt = (this.getNodeParameter('prompt', i) as string) || (items[i].json as any).message || '';
      const opts = this.getNodeParameter('options', i, {}) as { system?: string; temperature?: number; maxTokens?: number; topP?: number; cohortId?: string };

      const credentials = await this.getCredentials('demetericsApi');
      const baseUrl = ((credentials.baseUrl as string) || 'https://api.demeterics.com').replace(/\/$/, '');

      const providerBaseMap: Record<string, string> = {
        groq: 'groq',
        openai: 'openai',
        anthropic: 'anthropic',
        google: 'google',
        openrouter: 'openrouter',
      };
      const providerBase = providerBaseMap[provider] ?? 'openai';

      // BYOK dual-key handling
      const demetericsKey = (credentials.apiKey as string) || '';
      const byok = Boolean(credentials.byok);
      const providerToCredentialKey: Record<string, string> = {
        groq: 'providerApiKeyGroq',
        openai: 'providerApiKeyOpenAI',
        anthropic: 'providerApiKeyAnthropic',
        google: 'providerApiKeyGemini',
        openrouter: 'providerApiKeyOpenRouter',
      };
      const vendorKeyField = providerToCredentialKey[provider];
      const vendorKey = vendorKeyField ? ((credentials as any)[vendorKeyField] as string) || '' : '';
      const authKey = byok && vendorKey ? `${demetericsKey};${vendorKey}` : demetericsKey;

      // Build messages per OpenAI schema
      const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
      if (opts.system) messages.push({ role: 'system', content: String(opts.system) });
      messages.push({ role: 'user', content: String(prompt) });

      const body: Record<string, any> = {
        model,
        messages,
        temperature: opts.temperature ?? 0.7,
        top_p: opts.topP ?? 1,
        max_tokens: opts.maxTokens ?? 4096,
      };
      if (opts.cohortId) body.meta = { cohort_id: opts.cohortId };

      const response = await this.helpers.httpRequestWithAuthentication.call(this, 'demetericsApi', {
        method: 'POST',
        url: `${baseUrl}/${providerBase}/v1/chat/completions`,
        headers: {
          // Override Authorization to include possible BYOK vendor key
          Authorization: `Bearer ${authKey}`,
        },
        body,
        json: true,
      });

      // Extract assistant text if available
      let text: string | undefined;
      try {
        text = response?.choices?.[0]?.message?.content ?? undefined;
      } catch {}

      returnData.push({ json: { text, raw: response } });
    }

    return [returnData];
  }
}

