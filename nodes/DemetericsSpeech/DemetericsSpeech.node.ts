import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

// Import configuration from generated config (fetched from API)
import {
  ttsProviderOptions,
  ttsModelOptions,
  ttsVoiceOptions,
  ttsDefaultModels,
  ttsDefaultVoices,
  ttsSpeedRange,
} from '../generated/config';

// Map provider to credential field names for BYOK.
const providerToCredentialKey: Record<string, string> = {
  openai: 'providerApiKeyOpenAI',
  elevenlabs: 'providerApiKeyElevenLabs',
  google: 'providerApiKeyGemini',
  murf: 'providerApiKeyMurf',
};

export class DemetericsSpeech implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Demeterics Speech Gen',
    name: 'demetericsSpeech',
    icon: { light: 'file:demeterics-node-light.svg', dark: 'file:demeterics-node-dark.svg' },
    group: ['transform'],
    version: 1,
    description: 'Generate speech from text using multiple TTS providers via Demeterics API',
    defaults: {
      name: 'Demeterics Speech Gen',
    },
    codex: {
      categories: ['AI'],
      subcategories: {
        AI: ['Audio'],
      },
      resources: {
        primaryDocumentation: [
          { url: 'https://demeterics.ai/docs/speech' },
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
        options: ttsProviderOptions,
        description: 'Select the TTS provider',
      },
      // Model options per provider
      {
        displayName: 'Model',
        name: 'model',
        type: 'options',
        default: ttsDefaultModels.openai || 'gpt-4o-mini-tts',
        options: ttsModelOptions.openai,
        displayOptions: {
          show: {
            provider: ['openai'],
          },
        },
        description: 'OpenAI TTS model',
      },
      {
        displayName: 'Model',
        name: 'model',
        type: 'options',
        default: ttsDefaultModels.elevenlabs || 'eleven_multilingual_v2',
        options: ttsModelOptions.elevenlabs,
        displayOptions: {
          show: {
            provider: ['elevenlabs'],
          },
        },
        description: 'ElevenLabs TTS model',
      },
      {
        displayName: 'Model',
        name: 'model',
        type: 'options',
        default: ttsDefaultModels.google || 'Neural2',
        options: ttsModelOptions.google,
        displayOptions: {
          show: {
            provider: ['google'],
          },
        },
        description: 'Google Cloud TTS model',
      },
      {
        displayName: 'Model',
        name: 'model',
        type: 'options',
        default: ttsDefaultModels.murf || 'GEN2',
        options: ttsModelOptions.murf,
        displayOptions: {
          show: {
            provider: ['murf'],
          },
        },
        description: 'Murf.ai TTS model',
      },
      // Voice options per provider
      {
        displayName: 'Voice',
        name: 'voice',
        type: 'options',
        default: ttsDefaultVoices.openai || 'alloy',
        options: ttsVoiceOptions.openai,
        displayOptions: {
          show: {
            provider: ['openai'],
          },
        },
        description: 'Voice to use for speech generation',
      },
      {
        displayName: 'Voice',
        name: 'voice',
        type: 'options',
        default: ttsDefaultVoices.elevenlabs || '21m00Tcm4TlvDq8ikWAM',
        options: ttsVoiceOptions.elevenlabs,
        displayOptions: {
          show: {
            provider: ['elevenlabs'],
          },
        },
        description: 'Voice to use for speech generation',
      },
      {
        displayName: 'Voice',
        name: 'voice',
        type: 'options',
        default: ttsDefaultVoices.google || 'en-US-Neural2-A',
        options: ttsVoiceOptions.google,
        displayOptions: {
          show: {
            provider: ['google'],
          },
        },
        description: 'Voice to use for speech generation',
      },
      {
        displayName: 'Voice',
        name: 'voice',
        type: 'options',
        default: ttsDefaultVoices.murf || 'en-US-natalie',
        options: ttsVoiceOptions.murf,
        displayOptions: {
          show: {
            provider: ['murf'],
          },
        },
        description: 'Voice to use for speech generation',
      },
      {
        displayName: 'Text',
        name: 'text',
        type: 'string',
        default: '',
        required: true,
        typeOptions: {
          rows: 4,
        },
        description: 'Text to convert to speech (max varies by provider: OpenAI 4096, ElevenLabs 5000, Google 5000, Murf 10000)',
      },
      {
        displayName: 'Output Format',
        name: 'format',
        type: 'options',
        default: 'mp3',
        options: [
          { name: 'MP3', value: 'mp3' },
          { name: 'WAV', value: 'wav' },
          { name: 'Opus', value: 'opus' },
          { name: 'FLAC', value: 'flac' },
          { name: 'AAC', value: 'aac' },
          { name: 'OGG', value: 'ogg' },
          { name: 'PCM', value: 'pcm' },
        ],
        description: 'Audio output format (availability varies by provider)',
      },
      {
        displayName: 'Speed',
        name: 'speed',
        type: 'number',
        default: ttsSpeedRange.default,
        typeOptions: {
          minValue: ttsSpeedRange.min,
          maxValue: ttsSpeedRange.max,
          numberStepSize: 0.1,
        },
        description: `Playback speed (${ttsSpeedRange.min} to ${ttsSpeedRange.max})`,
      },
      {
        displayName: 'Language',
        name: 'language',
        type: 'string',
        default: '',
        placeholder: 'e.g., en, es, fr, de',
        description: 'Language code (ISO 639-1). Leave empty for auto-detection or use voice locale.',
      },
      {
        displayName: 'Output',
        name: 'outputType',
        type: 'options',
        default: 'binary',
        options: [
          { name: 'Binary Data (Download Audio)', value: 'binary', description: 'Return audio as binary data for saving/processing' },
          { name: 'URL Only', value: 'url', description: 'Return only the signed URL (expires in 15 minutes)' },
          { name: 'Both', value: 'both', description: 'Return both binary data and URL' },
        ],
        description: 'How to return the generated audio',
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
        const voice = this.getNodeParameter('voice', i) as string;
        const text = this.getNodeParameter('text', i) as string;
        const format = this.getNodeParameter('format', i) as string;
        const speed = this.getNodeParameter('speed', i) as number;
        const language = this.getNodeParameter('language', i, '') as string;
        const outputType = this.getNodeParameter('outputType', i, 'binary') as string;

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
          voice,
          input: text,
          format,
          speed,
        };

        if (language) {
          body.language = language;
        }

        // Make request to Demeterics TTS API
        const response = await this.helpers.httpRequest({
          method: 'POST',
          url: `${baseUrl}/tts/v1/generate`,
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body,
        });

        const audioData: INodeExecutionData = {
          json: {
            id: response.id,
            provider: response.provider,
            model: response.model,
            voice: response.voice,
            duration_seconds: response.duration_seconds,
            cost_usd: response.cost_usd,
            usage: response.usage,
            metadata: response.metadata,
          },
          pairedItem: { item: i },
        };

        const wantsBinary = outputType === 'binary' || outputType === 'both';
        const wantsUrl = outputType === 'url' || outputType === 'both';

        // Include URL in JSON if available and requested
        if (response.audio_url && wantsUrl) {
          (audioData.json as Record<string, unknown>).audio_url = response.audio_url;
        }

        // Handle binary data if requested
        if (wantsBinary) {
          let binaryData: Buffer | null = null;

          // If API returned base64 audio directly
          if (response.audio || response.audio_base64) {
            const base64Data = response.audio || response.audio_base64;
            binaryData = Buffer.from(base64Data, 'base64');
          }
          // If API returned URL and we want binary, fetch the audio
          else if (response.audio_url) {
            try {
              const audioResponse = await this.helpers.httpRequest({
                method: 'GET',
                url: response.audio_url,
                encoding: 'arraybuffer',
                returnFullResponse: true,
              });
              binaryData = Buffer.from(audioResponse.body as ArrayBuffer);
            } catch {
              // If fetch fails, include URL and error
              (audioData.json as Record<string, unknown>).audio_url = response.audio_url;
              (audioData.json as Record<string, unknown>).binary_fetch_error = 'Failed to download audio from URL';
            }
          }

          if (binaryData) {
            // Determine mime type based on format
            const mimeTypes: Record<string, string> = {
              mp3: 'audio/mpeg',
              wav: 'audio/wav',
              opus: 'audio/opus',
              flac: 'audio/flac',
              aac: 'audio/aac',
              ogg: 'audio/ogg',
              pcm: 'audio/pcm',
            };
            const mimeType = mimeTypes[format] || 'audio/mpeg';
            audioData.binary = {
              data: await this.helpers.prepareBinaryData(binaryData, `audio.${format}`, mimeType),
            };
          }
        }

        returnData.push(audioData);
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
