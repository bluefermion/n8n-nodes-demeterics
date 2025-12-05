import type {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  INodePropertyOptions,
} from 'n8n-workflow';

import { getValidatedBaseUrl } from '../utils/security';

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

export class DemetericsChat implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Demeterics Chat',
    name: 'demetericsChat',
    icon: { light: 'file:demeterics-node-light.svg', dark: 'file:demeterics-node-dark.svg' },
    group: ['transform'],
    version: 1,
    description: 'Make a one-pass LLM call via the Demeterics unified API',
    defaults: {
      name: 'Demeterics Chat',
    },
    codex: {
      categories: ['AI'],
      subcategories: {
        AI: ['Language Models'],
      },
      resources: {
        primaryDocumentation: [
          { url: 'https://demeterics.ai/docs/api-reference' },
        ],
      },
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [{ name: 'demetericsApi', required: true }],
    properties: [
      {
        displayName: 'API Endpoint',
        name: 'apiEndpoint',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Chat Completions',
            value: 'completions',
            description: 'OpenAI-compatible /chat/completions endpoint',
          },
          {
            name: 'Responses',
            value: 'responses',
            description: 'Demeterics /responses endpoint with extended features',
          },
        ],
        default: 'completions',
        description: 'Which API endpoint to call',
      },
      {
        displayName: 'Provider',
        name: 'provider',
        type: 'options',
        default: 'groq',
        options: providerOptions,
        description: 'Select the LLM provider',
      },
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
        displayName: 'System Prompt',
        name: 'systemPrompt',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        placeholder: 'You are a helpful assistant...',
        description: 'Optional system message to set the model behavior',
      },
      {
        displayName: 'User Message',
        name: 'userMessage',
        type: 'string',
        typeOptions: {
          rows: 6,
        },
        default: '',
        required: true,
        placeholder: 'Hello, how can you help me today?',
        description: 'The user message to send to the model',
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Temperature',
            name: 'temperature',
            type: 'number',
            typeOptions: { minValue: 0, maxValue: 2, numberPrecision: 1 },
            default: 0.7,
            description: 'Controls randomness. Lower = more deterministic.',
          },
          {
            displayName: 'Max Tokens',
            name: 'maxTokens',
            type: 'number',
            typeOptions: { minValue: 1, maxValue: 128000 },
            default: 4096,
            description: 'Maximum number of tokens to generate',
          },
          {
            displayName: 'Top P',
            name: 'topP',
            type: 'number',
            typeOptions: { minValue: 0, maxValue: 1, numberPrecision: 2 },
            default: 1,
            description: 'Nucleus sampling parameter',
          },
          {
            displayName: 'Frequency Penalty',
            name: 'frequencyPenalty',
            type: 'number',
            typeOptions: { minValue: -2, maxValue: 2, numberPrecision: 1 },
            default: 0,
            description: 'Penalizes repeated tokens based on frequency',
          },
          {
            displayName: 'Presence Penalty',
            name: 'presencePenalty',
            type: 'number',
            typeOptions: { minValue: -2, maxValue: 2, numberPrecision: 1 },
            default: 0,
            description: 'Penalizes tokens that have appeared at all',
          },
          {
            displayName: 'Cohort ID',
            name: 'cohortId',
            type: 'string',
            default: '',
            description: 'Optional cohort identifier for conversion tracking',
          },
          {
            displayName: 'User ID',
            name: 'userId',
            type: 'string',
            default: '',
            description: 'Optional user identifier for analytics',
          },
          {
            displayName: 'Timeout (seconds)',
            name: 'timeout',
            type: 'number',
            typeOptions: { minValue: 1, maxValue: 600 },
            default: 60,
            description: 'Request timeout in seconds',
          },
          {
            displayName: 'Response Format',
            name: 'responseFormat',
            type: 'options',
            options: [
              { name: 'Text (Default)', value: 'text' },
              { name: 'JSON Object', value: 'json_object', description: 'Enable JSON mode - model will output valid JSON' },
              { name: 'JSON Schema', value: 'json_schema', description: 'Structured output with a JSON schema' },
            ],
            default: 'text',
            description: 'Output format. JSON modes require the model to support structured outputs.',
          },
          {
            displayName: 'JSON Schema',
            name: 'jsonSchema',
            type: 'json',
            default: '{\n  "type": "object",\n  "properties": {\n    "result": { "type": "string" }\n  },\n  "required": ["result"]\n}',
            displayOptions: {
              show: { responseFormat: ['json_schema'] },
            },
            description: 'JSON Schema definition for structured output',
          },
          {
            displayName: 'Seed',
            name: 'seed',
            type: 'number',
            default: '',
            description: 'Random seed for deterministic outputs. Use the same seed for reproducible results.',
          },
          {
            displayName: 'Stop Sequences',
            name: 'stop',
            type: 'string',
            default: '',
            placeholder: 'e.g., \\n\\n, END, ###',
            description: 'Up to 4 sequences where the model will stop generating. Separate multiple with commas.',
          },
          {
            displayName: 'Reasoning (Groq)',
            name: 'reasoning',
            type: 'fixedCollection',
            default: {},
            placeholder: 'Add Reasoning Settings',
            description: 'Reasoning settings for models that support it (Groq-specific)',
            options: [
              {
                name: 'settings',
                displayName: 'Settings',
                values: [
                  {
                    displayName: 'Include Reasoning',
                    name: 'includeReasoning',
                    type: 'boolean',
                    default: false,
                    description: 'Whether to include reasoning in the response',
                  },
                  {
                    displayName: 'Reasoning Effort',
                    name: 'reasoningEffort',
                    type: 'options',
                    options: [
                      { name: 'None', value: 'none' },
                      { name: 'Low', value: 'low' },
                      { name: 'Default', value: 'default' },
                      { name: 'Medium', value: 'medium' },
                      { name: 'High', value: 'high' },
                    ],
                    default: 'default',
                    description: 'How much effort the model should put into reasoning',
                  },
                  {
                    displayName: 'Reasoning Format',
                    name: 'reasoningFormat',
                    type: 'options',
                    options: [
                      { name: 'Hidden', value: 'hidden' },
                      { name: 'Raw', value: 'raw' },
                      { name: 'Parsed', value: 'parsed' },
                    ],
                    default: 'raw',
                    description: 'Format of the reasoning output',
                  },
                ],
              },
            ],
          },
          {
            displayName: 'Web Search (Groq Compound)',
            name: 'webSearch',
            type: 'fixedCollection',
            default: {},
            placeholder: 'Add Web Search Settings',
            description: 'Web search settings for Groq Compound models',
            options: [
              {
                name: 'settings',
                displayName: 'Settings',
                values: [
                  {
                    displayName: 'Enable Citations',
                    name: 'enableCitations',
                    type: 'boolean',
                    default: true,
                    description: 'Whether to include citations in the response',
                  },
                  {
                    displayName: 'Include Domains',
                    name: 'includeDomains',
                    type: 'string',
                    default: '',
                    placeholder: 'e.g., wikipedia.org, docs.python.org',
                    description: 'Comma-separated list of domains to include in web search',
                  },
                  {
                    displayName: 'Exclude Domains',
                    name: 'excludeDomains',
                    type: 'string',
                    default: '',
                    placeholder: 'e.g., reddit.com, twitter.com',
                    description: 'Comma-separated list of domains to exclude from web search',
                  },
                ],
              },
            ],
          },
          {
            displayName: 'Service Tier (Groq)',
            name: 'serviceTier',
            type: 'options',
            options: [
              { name: 'On Demand (Default)', value: 'on_demand' },
              { name: 'Auto', value: 'auto', description: 'Automatically select best tier' },
              { name: 'Flex', value: 'flex', description: 'Flexible tier for cost optimization' },
              { name: 'Performance', value: 'performance', description: 'Performance tier for speed' },
            ],
            default: 'on_demand',
            description: 'Groq service tier for request processing',
          },
          {
            displayName: 'Documents (RAG)',
            name: 'documents',
            type: 'json',
            default: '',
            placeholder: '[{"content": "Document text here...", "title": "Doc Title"}]',
            description: 'JSON array of documents to provide context. Each document can have "content" (required), "title", "url", and "id" fields. Used with Groq Compound for RAG.',
          },
          {
            displayName: 'Tools (Function Calling)',
            name: 'tools',
            type: 'json',
            default: '',
            placeholder: '[{"type": "function", "function": {"name": "get_weather", "description": "Get weather", "parameters": {...}}}]',
            description: 'JSON array of tools/functions the model can call. Each tool has type "function" and a function object with name, description, and parameters (JSON Schema).',
          },
          {
            displayName: 'Tool Choice',
            name: 'toolChoice',
            type: 'options',
            options: [
              { name: 'Auto (Default)', value: 'auto', description: 'Model decides whether to call tools' },
              { name: 'None', value: 'none', description: 'Model will not call any tools' },
              { name: 'Required', value: 'required', description: 'Model must call at least one tool' },
            ],
            default: 'auto',
            description: 'Controls how the model uses tools. Only applies when tools are defined.',
          },
          {
            displayName: 'Parallel Tool Calls',
            name: 'parallelToolCalls',
            type: 'boolean',
            default: true,
            description: 'Whether to allow the model to call multiple tools in parallel',
          },
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
          const baseUrl = getValidatedBaseUrl(credentials.baseUrl as string);

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

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const apiEndpoint = this.getNodeParameter('apiEndpoint', i) as 'completions' | 'responses';
      const provider = this.getNodeParameter('provider', i) as string;
      const model = this.getNodeParameter('model', i) as string;
      const systemPrompt = this.getNodeParameter('systemPrompt', i, '') as string;
      const userMessage = this.getNodeParameter('userMessage', i) as string;
      const options = this.getNodeParameter('options', i, {}) as {
        temperature?: number;
        maxTokens?: number;
        topP?: number;
        frequencyPenalty?: number;
        presencePenalty?: number;
        cohortId?: string;
        userId?: string;
        timeout?: number;
        responseFormat?: string;
        jsonSchema?: string;
        seed?: number;
        stop?: string;
        reasoning?: { settings?: { includeReasoning?: boolean; reasoningEffort?: string; reasoningFormat?: string } };
        webSearch?: { settings?: { enableCitations?: boolean; includeDomains?: string; excludeDomains?: string } };
        serviceTier?: string;
        documents?: string;
        tools?: string;
        toolChoice?: string;
        parallelToolCalls?: boolean;
      };

      const credentials = await this.getCredentials('demetericsApi');
      const demetericsKey = (credentials.apiKey as string) || '';
      const byok = Boolean(credentials.byok);
      const baseUrl = getValidatedBaseUrl(credentials.baseUrl as string);

      // Build API key (combine with vendor key if BYOK)
      const vendorKeyField = providerToCredentialKey[provider];
      const vendorKey = vendorKeyField ? ((credentials as Record<string, unknown>)[vendorKeyField] as string) || '' : '';
      const apiKey = byok && vendorKey ? `${demetericsKey};${vendorKey}` : demetericsKey;

      // Build messages array
      const messages: Array<{ role: string; content: string }> = [];
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ role: 'user', content: userMessage });

      // Build request body
      const body: Record<string, unknown> = {
        model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 4096,
        top_p: options.topP ?? 1,
        frequency_penalty: options.frequencyPenalty ?? 0,
        presence_penalty: options.presencePenalty ?? 0,
      };

      // Add optional tracking fields
      if (options.cohortId) {
        body.cohort_id = options.cohortId;
      }
      if (options.userId) {
        body.user = options.userId;
      }

      // Response format (JSON mode)
      if (options.responseFormat && options.responseFormat !== 'text') {
        if (options.responseFormat === 'json_object') {
          body.response_format = { type: 'json_object' };
        } else if (options.responseFormat === 'json_schema' && options.jsonSchema) {
          try {
            const schema = JSON.parse(options.jsonSchema);
            body.response_format = {
              type: 'json_schema',
              json_schema: {
                name: 'response',
                schema,
              },
            };
          } catch {
            // If JSON parsing fails, fall back to json_object
            body.response_format = { type: 'json_object' };
          }
        }
      }

      // Seed for deterministic outputs
      if (options.seed !== undefined && options.seed !== null) {
        body.seed = options.seed;
      }

      // Stop sequences
      if (options.stop) {
        const stopSequences = options.stop.split(',').map((s) => s.trim()).filter((s) => s);
        if (stopSequences.length > 0) {
          body.stop = stopSequences.slice(0, 4); // Max 4 stop sequences
        }
      }

      // Groq-specific: Reasoning settings
      const reasoningSettings = options.reasoning?.settings;
      if (reasoningSettings) {
        if (reasoningSettings.includeReasoning !== undefined) {
          body.include_reasoning = reasoningSettings.includeReasoning;
        }
        if (reasoningSettings.reasoningEffort && reasoningSettings.reasoningEffort !== 'default') {
          body.reasoning_effort = reasoningSettings.reasoningEffort;
        }
        if (reasoningSettings.reasoningFormat) {
          body.reasoning_format = reasoningSettings.reasoningFormat;
        }
      }

      // Groq-specific: Web search settings (for Compound models)
      const webSearchSettings = options.webSearch?.settings;
      if (webSearchSettings) {
        if (webSearchSettings.enableCitations !== undefined) {
          body.citation_options = webSearchSettings.enableCitations ? 'enabled' : 'disabled';
        }
        if (webSearchSettings.includeDomains || webSearchSettings.excludeDomains) {
          const searchSettings: Record<string, string[]> = {};
          if (webSearchSettings.includeDomains) {
            searchSettings.include_domains = webSearchSettings.includeDomains.split(',').map((d) => d.trim()).filter((d) => d);
          }
          if (webSearchSettings.excludeDomains) {
            searchSettings.exclude_domains = webSearchSettings.excludeDomains.split(',').map((d) => d.trim()).filter((d) => d);
          }
          body.search_settings = searchSettings;
        }
      }

      // Groq-specific: Service tier
      if (options.serviceTier && options.serviceTier !== 'on_demand') {
        body.service_tier = options.serviceTier;
      }

      // Documents for RAG (Groq Compound)
      if (options.documents) {
        try {
          const docs = JSON.parse(options.documents);
          if (Array.isArray(docs) && docs.length > 0) {
            body.documents = docs;
          }
        } catch {
          // Invalid JSON, skip
        }
      }

      // Tools / Function calling
      if (options.tools) {
        try {
          const tools = JSON.parse(options.tools);
          if (Array.isArray(tools) && tools.length > 0) {
            body.tools = tools;

            // Only set tool_choice if tools are defined
            if (options.toolChoice && options.toolChoice !== 'auto') {
              body.tool_choice = options.toolChoice;
            }

            // Parallel tool calls (default true, so only set if false)
            if (options.parallelToolCalls === false) {
              body.parallel_tool_calls = false;
            }
          }
        } catch {
          // Invalid JSON, skip
        }
      }

      // Determine endpoint URL and request format
      const providerBase = providerBaseMap[provider] ?? 'openai';
      let url: string;
      let requestBody: Record<string, unknown>;
      let requestHeaders: Record<string, string>;
      const isAnthropic = provider === 'anthropic';

      if (isAnthropic) {
        // Anthropic uses /v1/messages with a different request format
        url = `${baseUrl}/${providerBase}/v1/messages`;
        requestHeaders = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        };

        // Convert OpenAI-style messages to Anthropic format
        // Anthropic has separate 'system' field and 'messages' array (no system role in messages)
        const anthropicMessages: Array<{ role: string; content: string }> = [];
        let systemContent = '';

        for (const msg of messages) {
          if (msg.role === 'system') {
            systemContent = msg.content;
          } else {
            anthropicMessages.push({
              role: msg.role === 'assistant' ? 'assistant' : 'user',
              content: msg.content,
            });
          }
        }

        requestBody = {
          model,
          messages: anthropicMessages,
          max_tokens: options.maxTokens ?? 4096,
        };

        if (systemContent) {
          requestBody.system = systemContent;
        }
        if (options.temperature !== undefined) {
          requestBody.temperature = options.temperature;
        }
        if (options.topP !== undefined) {
          requestBody.top_p = options.topP;
        }
        if (options.stop) {
          const stopSequences = options.stop.split(',').map((s) => s.trim()).filter((s) => s);
          if (stopSequences.length > 0) {
            requestBody.stop_sequences = stopSequences.slice(0, 4);
          }
        }
      } else {
        // OpenAI-compatible providers
        if (apiEndpoint === 'responses') {
          url = `${baseUrl}/${providerBase}/v1/responses`;
        } else {
          url = `${baseUrl}/${providerBase}/v1/chat/completions`;
        }
        requestHeaders = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        };
        requestBody = body;
      }

      const response = await this.helpers.httpRequest({
        method: 'POST',
        url,
        headers: requestHeaders,
        body: requestBody,
        timeout: (options.timeout ?? 60) * 1000,
      });

      // Extract the response content for easier downstream use
      let content = '';
      let toolCalls = null;
      const fullResponse = response;

      if (isAnthropic) {
        // Anthropic response format: { content: [{ type: 'text', text: '...' }], ... }
        if (response?.content && Array.isArray(response.content)) {
          const textBlocks = response.content.filter((block: { type: string }) => block.type === 'text');
          content = textBlocks.map((block: { text: string }) => block.text).join('');
        }
        // Extract tool use blocks if present
        if (response?.content && Array.isArray(response.content)) {
          const toolUseBlocks = response.content.filter((block: { type: string }) => block.type === 'tool_use');
          if (toolUseBlocks.length > 0) {
            toolCalls = toolUseBlocks;
          }
        }
      } else if (apiEndpoint === 'completions') {
        // OpenAI-compatible response format
        const message = response?.choices?.[0]?.message;
        if (message?.content) {
          content = message.content;
        }
        // Extract tool calls if present
        if (message?.tool_calls && Array.isArray(message.tool_calls)) {
          toolCalls = message.tool_calls;
        }
      } else {
        // Responses endpoint format
        if (response?.output?.[0]?.content?.[0]?.text) {
          content = response.output[0].content[0].text;
        } else if (response?.content) {
          content = response.content;
        }
      }

      returnData.push({
        json: {
          content,
          toolCalls,
          model,
          provider,
          apiEndpoint,
          usage: response?.usage || null,
          fullResponse,
        },
      });
    }

    return [returnData];
  }
}
