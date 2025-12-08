import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

import { getValidatedBaseUrl } from '../utils/security';

export class DemetericsCouncil implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Demeterics Council',
    name: 'demetericsCouncil',
    icon: { light: 'file:demeterics-node-light.svg', dark: 'file:demeterics-node-dark.svg' },
    group: ['transform'],
    version: 1,
    description: 'Get diverse feedback on any content from 18 AI personas representing different US demographics',
    defaults: {
      name: 'Demeterics Council',
    },
    codex: {
      categories: ['AI'],
      subcategories: {
        AI: ['Agents'],
      },
      resources: {
        primaryDocumentation: [
          { url: 'https://demeterics.com/docs/council' },
        ],
      },
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [{ name: 'demetericsApi', required: true }],
    properties: [
      {
        displayName: 'Question',
        name: 'question',
        type: 'string',
        default: 'How engaging is this content?',
        required: true,
        typeOptions: {
          rows: 2,
        },
        description: 'The evaluation question to ask the council (e.g., "How would you rate this video hook?")',
      },
      {
        displayName: 'Content',
        name: 'content',
        type: 'string',
        default: '',
        required: true,
        typeOptions: {
          rows: 4,
        },
        description: 'The content to be evaluated by the council (text, script, hook, etc.)',
      },
      {
        displayName: 'Number of Personas',
        name: 'numPersonas',
        type: 'number',
        default: 8,
        typeOptions: {
          minValue: 2,
          maxValue: 18,
        },
        description: 'Number of AI personas to query (2-18). More personas = more diverse perspectives but higher cost.',
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Persona Model',
            name: 'model',
            type: 'string',
            default: 'openai/gpt-oss-20b',
            description: 'Groq model for persona evaluations (default: openai/gpt-oss-20b)',
          },
          {
            displayName: 'Aggregation Model',
            name: 'aggregationModel',
            type: 'string',
            default: 'openai/gpt-oss-120b',
            description: 'Model for final synthesis (default: openai/gpt-oss-120b)',
          },
          {
            displayName: 'Temperature',
            name: 'temperature',
            type: 'number',
            default: 0.8,
            typeOptions: {
              minValue: 0,
              maxValue: 1,
              numberStepSize: 0.1,
            },
            description: 'Response diversity (0-1). Higher = more varied perspectives.',
          },
          {
            displayName: 'Max Tokens',
            name: 'maxTokens',
            type: 'number',
            default: 500,
            typeOptions: {
              minValue: 50,
              maxValue: 4096,
            },
            description: 'Maximum tokens per persona response (50-4096)',
          },
          {
            displayName: 'Include Raw Responses',
            name: 'includeRawResponses',
            type: 'boolean',
            default: true,
            description: 'Include individual persona responses in output',
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const credentials = await this.getCredentials('demetericsApi');
    const byokMode = credentials.byokMode as boolean;
    const demetericsApiKey = credentials.apiKey as string;
    const baseUrl = getValidatedBaseUrl(credentials.baseUrl as string);

    for (let i = 0; i < items.length; i++) {
      try {
        const question = this.getNodeParameter('question', i) as string;
        const content = this.getNodeParameter('content', i) as string;
        const numPersonas = this.getNodeParameter('numPersonas', i) as number;
        const options = this.getNodeParameter('options', i, {}) as {
          model?: string;
          aggregationModel?: string;
          temperature?: number;
          maxTokens?: number;
          includeRawResponses?: boolean;
        };

        // Build Authorization header with BYOK support for Groq
        let authHeader = `Bearer ${demetericsApiKey}`;
        if (byokMode) {
          // Council uses Groq, check for Groq API key
          const groqKey = credentials.providerApiKeyGroq as string;
          if (groqKey) {
            authHeader = `Bearer ${demetericsApiKey};${groqKey}`;
          }
        }

        // Build request body
        const body: Record<string, unknown> = {
          question,
          content,
          num_personas: numPersonas,
        };

        // Add optional parameters
        if (options.model) {
          body.model = options.model;
        }
        if (options.aggregationModel) {
          body.aggregation_model = options.aggregationModel;
        }
        if (options.temperature !== undefined) {
          body.temperature = options.temperature;
        }
        if (options.maxTokens !== undefined) {
          body.max_tokens = options.maxTokens;
        }
        if (options.includeRawResponses !== undefined) {
          body.include_raw_responses = options.includeRawResponses;
        }

        // Make request to Demeterics Council API
        const response = await this.helpers.httpRequest({
          method: 'POST',
          url: `${baseUrl}/council/v1/evaluate`,
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body,
        });

        // Build output data
        const outputData: INodeExecutionData = {
          json: {
            id: response.id,
            score: response.score,
            summary: response.summary,
            stats: response.stats,
            usage: response.usage,
          },
          pairedItem: { item: i },
        };

        // Include persona responses if available
        if (response.persona_responses) {
          (outputData.json as Record<string, unknown>).persona_responses = response.persona_responses;
        }

        // Include error if present
        if (response.error) {
          (outputData.json as Record<string, unknown>).error = response.error;
        }

        returnData.push(outputData);
      } catch (error) {
        // Extract detailed error information from axios/HTTP errors
        let errorMessage = 'Unknown error';
        let statusCode: number | undefined;
        let apiError: Record<string, unknown> | undefined;
        const requestUrl = `${baseUrl}/council/v1/evaluate`;

        if (error instanceof Error) {
          errorMessage = error.message;

          // Check for axios-style error with response data
          const axiosError = error as Error & {
            response?: {
              status?: number;
              data?: unknown;
            };
            statusCode?: number;
          };

          if (axiosError.response) {
            statusCode = axiosError.response.status;
            const responseData = axiosError.response.data;

            // Try to extract API error message
            if (responseData && typeof responseData === 'object') {
              const data = responseData as Record<string, unknown>;
              if (data.error && typeof data.error === 'object') {
                apiError = data.error as Record<string, unknown>;
                const apiMessage = (apiError.message as string) || (apiError.type as string);
                if (apiMessage) {
                  errorMessage = `API Error: ${apiMessage}`;
                }
              } else if (data.message) {
                errorMessage = `API Error: ${data.message}`;
              }
            }
          } else if (axiosError.statusCode) {
            statusCode = axiosError.statusCode;
          }
        }

        // Build hint based on status code
        let hint = '';
        if (statusCode === 404) {
          hint = 'The Council API endpoint was not found. Please ensure the API is deployed and the base URL is correct.';
        } else if (statusCode === 401) {
          hint = 'Authentication failed. Please check your Demeterics API key.';
        } else if (statusCode === 402) {
          hint = 'Insufficient credits. Please add credits to your account.';
        } else if (statusCode === 400) {
          hint = 'Invalid request. Check your question and content parameters.';
        }

        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: errorMessage,
              request_url: requestUrl,
              status_code: statusCode || null,
              hint: hint || null,
              api_error: apiError || null,
            },
            pairedItem: { item: i },
          });
          continue;
        }

        // For non-continue mode, throw a more descriptive error
        const detailedMessage = statusCode
          ? `Council API request failed (HTTP ${statusCode}): ${errorMessage}`
          : `Council API request failed: ${errorMessage}`;
        throw new Error(detailedMessage);
      }
    }

    return [returnData];
  }
}
