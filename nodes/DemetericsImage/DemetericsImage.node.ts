import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

// Import configuration from generated config (fetched from API)
import {
  imageProviderOptions,
  imageModelOptions,
  imageSizeOptions,
  imageDefaultModels,
  imageProviderFeatures,
  imageQualityOptions,
  imageNRange,
} from '../generated/config';

// Map provider to credential field names for BYOK.
const providerToCredentialKey: Record<string, string> = {
  openai: 'providerApiKeyOpenAI',
  google: 'providerApiKeyGemini',
  stability: 'providerApiKeyStability',
  leonardo: 'providerApiKeyLeonardo',
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
        options: imageProviderOptions,
        description: 'Select the image generation provider',
      },
      {
        displayName: 'Model',
        name: 'model',
        type: 'options',
        default: imageDefaultModels.openai || 'gpt-image-1',
        options: imageModelOptions.openai,
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
        default: imageDefaultModels.google || 'imagen-3.0-generate-002',
        options: imageModelOptions.google,
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
        default: imageDefaultModels.stability || 'core',
        options: imageModelOptions.stability,
        displayOptions: {
          show: {
            provider: ['stability'],
          },
        },
        description: 'Stability AI model',
      },
      {
        displayName: 'Model',
        name: 'model',
        type: 'options',
        default: imageDefaultModels.leonardo || 'phoenix',
        options: imageModelOptions.leonardo,
        displayOptions: {
          show: {
            provider: ['leonardo'],
          },
        },
        description: 'Leonardo AI model',
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
        options: imageSizeOptions.openai,
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
        options: imageSizeOptions.google,
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
        options: imageSizeOptions.stability,
        displayOptions: {
          show: {
            provider: ['stability'],
          },
        },
        description: 'Output image size',
      },
      {
        displayName: 'Size',
        name: 'size',
        type: 'options',
        default: '1024x1024',
        options: imageSizeOptions.leonardo,
        displayOptions: {
          show: {
            provider: ['leonardo'],
          },
        },
        description: 'Output image size',
      },
      {
        displayName: 'Quality',
        name: 'quality',
        type: 'options',
        default: 'medium',
        options: imageQualityOptions.openai || [],
        displayOptions: {
          show: {
            provider: ['openai'],
          },
        },
        description: 'Image quality (OpenAI gpt-image-1 only)',
      },
      {
        displayName: 'Quality',
        name: 'quality',
        type: 'options',
        default: 'standard',
        options: imageQualityOptions.leonardo || [],
        displayOptions: {
          show: {
            provider: ['leonardo'],
          },
        },
        description: 'Quality mode (Leonardo Alchemy settings)',
      },
      {
        displayName: 'Number of Images',
        name: 'n',
        type: 'number',
        default: imageNRange.default,
        typeOptions: {
          minValue: imageNRange.min,
          maxValue: imageNRange.max,
        },
        description: `Number of images to generate (${imageNRange.min}-${imageNRange.max})`,
      },
      {
        displayName: 'Seed',
        name: 'seed',
        type: 'number',
        default: 0,
        description: 'Seed for reproducibility (0 for random)',
      },
      {
        displayName: 'Output',
        name: 'outputType',
        type: 'options',
        default: 'binary',
        options: [
          { name: 'Binary Data (Download Image)', value: 'binary', description: 'Return image as binary data for saving/processing' },
          { name: 'URL Only', value: 'url', description: 'Return only the signed URL (expires in 15 minutes)' },
          { name: 'Both', value: 'both', description: 'Return both binary data and URL' },
        ],
        description: 'How to return the generated image',
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
        const outputType = this.getNodeParameter('outputType', i, 'binary') as string;

        // Get provider-specific options based on feature flags
        const features = imageProviderFeatures[provider];
        let quality = 'medium';
        if (features?.supportsQuality) {
          quality = this.getNodeParameter('quality', i) as string;
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

        if (negativePrompt && features?.supportsNegativePrompt) {
          body.negative_prompt = negativePrompt;
        }
        if (features?.supportsQuality) {
          body.quality = quality;
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
          const image = images[j];
          const imageData: INodeExecutionData = {
            json: {
              id: response.id,
              provider: response.provider,
              model: response.model,
              width: image.width || response.usage?.resolution?.split('x')[0],
              height: image.height || response.usage?.resolution?.split('x')[1],
              size_bytes: image.size_bytes,
              cost_usd: response.cost_usd / images.length, // Cost per image
              total_cost_usd: response.cost_usd,
              usage: response.usage,
              metadata: response.metadata,
              revised_prompt: response.metadata?.revised_prompt,
              seed: response.metadata?.seed,
            },
            pairedItem: { item: i },
          };

          const wantsBinary = outputType === 'binary' || outputType === 'both';
          const wantsUrl = outputType === 'url' || outputType === 'both';

          // Include URL in JSON if requested
          if (image.url && wantsUrl) {
            (imageData.json as Record<string, unknown>).image_url = image.url;
          }

          // Handle binary data if requested
          if (wantsBinary) {
            let binaryData: Buffer | null = null;

            // If API returned base64, use it directly
            if (image.base64) {
              binaryData = Buffer.from(image.base64, 'base64');
            }
            // If API returned URL and we want binary, fetch the image
            else if (image.url) {
              try {
                // Don't use returnFullResponse to avoid circular reference issues
                const imageBuffer = await this.helpers.httpRequest({
                  method: 'GET',
                  url: image.url,
                  encoding: 'arraybuffer',
                }) as ArrayBuffer;
                binaryData = Buffer.from(imageBuffer);
              } catch {
                // If fetch fails, just include URL
                (imageData.json as Record<string, unknown>).image_url = image.url;
                (imageData.json as Record<string, unknown>).binary_fetch_error = 'Failed to download image from URL';
              }
            }

            if (binaryData) {
              // Detect mime type from response or default to PNG
              const mimeType = image.mime_type || 'image/png';
              const extension = mimeType.split('/')[1] || 'png';
              imageData.binary = {
                data: await this.helpers.prepareBinaryData(binaryData, `image.${extension}`, mimeType),
              };
            }
          }

          returnData.push(imageData);
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
