import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  INodePropertyOptions,
} from 'n8n-workflow';

// Provider options for the dropdown.
const providerOptions: INodePropertyOptions[] = [
  { name: 'OpenAI (DALL-E)', value: 'openai' },
  { name: 'Google (Imagen)', value: 'google' },
  { name: 'Stability AI', value: 'stability' },
];

// Map provider to credential field names for BYOK.
const providerToCredentialKey: Record<string, string> = {
  openai: 'providerApiKeyOpenAI',
  google: 'providerApiKeyGemini',
  stability: 'providerApiKeyStability',
};

// Model options per provider
const modelOptions: Record<string, INodePropertyOptions[]> = {
  openai: [
    { name: 'GPT Image 1', value: 'gpt-image-1' },
  ],
  google: [
    { name: 'Imagen 3.0 Generate', value: 'imagen-3.0-generate-002' },
    { name: 'Imagen 3.0 Fast', value: 'imagen-3.0-fast-generate-001' },
  ],
  stability: [
    { name: 'Stable Image Ultra', value: 'stable-image-ultra' },
    { name: 'Stable Image Core', value: 'stable-image-core' },
    { name: 'SDXL 1.0', value: 'stable-diffusion-xl-1024-v1-0' },
    { name: 'SD 1.6', value: 'stable-diffusion-v1-6' },
  ],
};

// Size options per provider
const sizeOptions: Record<string, INodePropertyOptions[]> = {
  openai: [
    { name: '1024x1024 (Square)', value: '1024x1024' },
    { name: '1792x1024 (Landscape)', value: '1792x1024' },
    { name: '1024x1792 (Portrait)', value: '1024x1792' },
  ],
  google: [
    { name: '1024x1024', value: '1024x1024' },
    { name: '1536x1536', value: '1536x1536' },
    { name: '1280x768', value: '1280x768' },
    { name: '768x1280', value: '768x1280' },
  ],
  stability: [
    { name: '1024x1024', value: '1024x1024' },
    { name: '1152x896', value: '1152x896' },
    { name: '896x1152', value: '896x1152' },
    { name: '1216x832', value: '1216x832' },
    { name: '832x1216', value: '832x1216' },
  ],
};

export class DemetericsImage implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Demeterics Image Gen',
    name: 'demetericsImage',
    icon: { light: 'file:demeterics-node-light.svg', dark: 'file:demeterics-node-dark.svg' },
    group: ['transform'],
    version: 1,
    description: 'Generate images from text prompts using multiple providers via Demeterics API',
    defaults: {
      name: 'Demeterics Image Gen',
    },
    codex: {
      categories: ['AI'],
      subcategories: {
        AI: ['Image'],
      },
      resources: {
        primaryDocumentation: [
          { url: 'https://demeterics.ai/docs/image' },
        ],
      },
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [{ name: 'demetericsApi', required: true }],
    properties: [
      {
        displayName: 'Provider',
        name: 'provider',
        type: 'options',
        default: 'openai',
        options: providerOptions,
        description: 'Select the image generation provider',
      },
      {
        displayName: 'Model',
        name: 'model',
        type: 'options',
        default: 'gpt-image-1',
        options: modelOptions.openai,
        displayOptions: {
          show: {
            provider: ['openai'],
          },
        },
        description: 'OpenAI image generation model',
      },
      {
        displayName: 'Model',
        name: 'model',
        type: 'options',
        default: 'imagen-3.0-generate-002',
        options: modelOptions.google,
        displayOptions: {
          show: {
            provider: ['google'],
          },
        },
        description: 'Google Imagen model',
      },
      {
        displayName: 'Model',
        name: 'model',
        type: 'options',
        default: 'stable-image-core',
        options: modelOptions.stability,
        displayOptions: {
          show: {
            provider: ['stability'],
          },
        },
        description: 'Stability AI model',
      },
      {
        displayName: 'Prompt',
        name: 'prompt',
        type: 'string',
        default: '',
        required: true,
        typeOptions: {
          rows: 4,
        },
        description: 'Description of the image to generate',
      },
      {
        displayName: 'Negative Prompt',
        name: 'negativePrompt',
        type: 'string',
        default: '',
        typeOptions: {
          rows: 2,
        },
        description: 'What to avoid in the image (supported by Stability and Google)',
      },
      {
        displayName: 'Size',
        name: 'size',
        type: 'options',
        default: '1024x1024',
        options: sizeOptions.openai,
        displayOptions: {
          show: {
            provider: ['openai'],
          },
        },
        description: 'Output image size',
      },
      {
        displayName: 'Size',
        name: 'size',
        type: 'options',
        default: '1024x1024',
        options: sizeOptions.google,
        displayOptions: {
          show: {
            provider: ['google'],
          },
        },
        description: 'Output image size',
      },
      {
        displayName: 'Size',
        name: 'size',
        type: 'options',
        default: '1024x1024',
        options: sizeOptions.stability,
        displayOptions: {
          show: {
            provider: ['stability'],
          },
        },
        description: 'Output image size',
      },
      {
        displayName: 'Quality',
        name: 'quality',
        type: 'options',
        default: 'standard',
        options: [
          { name: 'Standard', value: 'standard' },
          { name: 'HD', value: 'hd' },
        ],
        displayOptions: {
          show: {
            provider: ['openai'],
          },
        },
        description: 'Image quality (OpenAI only)',
      },
      {
        displayName: 'Style',
        name: 'style',
        type: 'options',
        default: 'natural',
        options: [
          { name: 'Natural', value: 'natural' },
          { name: 'Vivid', value: 'vivid' },
        ],
        displayOptions: {
          show: {
            provider: ['openai'],
          },
        },
        description: 'Image style (OpenAI only)',
      },
      {
        displayName: 'Number of Images',
        name: 'n',
        type: 'number',
        default: 1,
        typeOptions: {
          minValue: 1,
          maxValue: 4,
        },
        description: 'Number of images to generate (1-4)',
      },
      {
        displayName: 'Seed',
        name: 'seed',
        type: 'number',
        default: 0,
        description: 'Seed for reproducibility (0 for random)',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const credentials = await this.getCredentials('demetericsApi');
    const byokMode = credentials.byokMode as boolean;
    const demetericsApiKey = credentials.apiKey as string;
    const baseUrl = (credentials.baseUrl as string) || 'https://api.demeterics.com';

    for (let i = 0; i < items.length; i++) {
      try {
        const provider = this.getNodeParameter('provider', i) as string;
        const model = this.getNodeParameter('model', i) as string;
        const prompt = this.getNodeParameter('prompt', i) as string;
        const negativePrompt = this.getNodeParameter('negativePrompt', i) as string;
        const size = this.getNodeParameter('size', i) as string;
        const n = this.getNodeParameter('n', i) as number;
        const seed = this.getNodeParameter('seed', i) as number;

        // Get provider-specific options
        let quality = 'standard';
        let style = 'natural';
        if (provider === 'openai') {
          quality = this.getNodeParameter('quality', i) as string;
          style = this.getNodeParameter('style', i) as string;
        }

        // Build Authorization header with BYOK support
        let authHeader = `Bearer ${demetericsApiKey}`;
        if (byokMode) {
          const credKey = providerToCredentialKey[provider];
          if (credKey) {
            const providerKey = credentials[credKey] as string;
            if (providerKey) {
              authHeader = `Bearer ${demetericsApiKey};${providerKey}`;
            }
          }
        }

        // Build request body
        const body: Record<string, unknown> = {
          provider,
          model,
          prompt,
          size,
          n,
        };

        if (negativePrompt) {
          body.negative_prompt = negativePrompt;
        }
        if (provider === 'openai') {
          body.quality = quality;
          body.style = style;
        }
        if (seed > 0) {
          body.seed = seed;
        }

        // Make request to Demeterics Imagen API
        const response = await this.helpers.httpRequest({
          method: 'POST',
          url: `${baseUrl}/imagen/v1/generate`,
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body,
        });

        // Return each image as a separate item if multiple
        const images = response.images || [];
        for (let j = 0; j < images.length; j++) {
          returnData.push({
            json: {
              id: response.id,
              provider: response.provider,
              model: response.model,
              image_url: images[j].url,
              width: images[j].width,
              height: images[j].height,
              size_bytes: images[j].size_bytes,
              cost_usd: response.cost_usd / images.length, // Cost per image
              total_cost_usd: response.cost_usd,
              usage: response.usage,
              metadata: response.metadata,
              revised_prompt: response.metadata?.revised_prompt,
              seed: response.metadata?.seed,
            },
            pairedItem: { item: i },
          });
        }
      } catch (error) {
        if (this.continueOnFail()) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          returnData.push({
            json: {
              error: errorMessage,
            },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
