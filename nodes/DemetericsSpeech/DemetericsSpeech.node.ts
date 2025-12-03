import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  INodePropertyOptions,
} from 'n8n-workflow';

// Provider options for the dropdown.
const providerOptions: INodePropertyOptions[] = [
  { name: 'OpenAI', value: 'openai' },
  { name: 'ElevenLabs', value: 'elevenlabs' },
  { name: 'Google', value: 'google' },
];

// Map provider to credential field names for BYOK.
const providerToCredentialKey: Record<string, string> = {
  openai: 'providerApiKeyOpenAI',
  elevenlabs: 'providerApiKeyElevenLabs',
  google: 'providerApiKeyGemini',
};

// Voice options per provider
const voiceOptions: Record<string, INodePropertyOptions[]> = {
  openai: [
    { name: 'Alloy', value: 'alloy' },
    { name: 'Echo', value: 'echo' },
    { name: 'Fable', value: 'fable' },
    { name: 'Onyx', value: 'onyx' },
    { name: 'Nova', value: 'nova' },
    { name: 'Shimmer', value: 'shimmer' },
  ],
  elevenlabs: [
    { name: 'Rachel', value: 'rachel' },
    { name: 'Drew', value: 'drew' },
    { name: 'Clyde', value: 'clyde' },
    { name: 'Paul', value: 'paul' },
    { name: 'Domi', value: 'domi' },
    { name: 'Dave', value: 'dave' },
    { name: 'Fin', value: 'fin' },
    { name: 'Sarah', value: 'sarah' },
    { name: 'Antoni', value: 'antoni' },
    { name: 'Thomas', value: 'thomas' },
  ],
  google: [
    { name: 'en-US-Standard-A', value: 'en-US-Standard-A' },
    { name: 'en-US-Standard-B', value: 'en-US-Standard-B' },
    { name: 'en-US-Standard-C', value: 'en-US-Standard-C' },
    { name: 'en-US-Standard-D', value: 'en-US-Standard-D' },
    { name: 'en-US-Wavenet-A', value: 'en-US-Wavenet-A' },
    { name: 'en-US-Wavenet-B', value: 'en-US-Wavenet-B' },
    { name: 'en-US-Wavenet-C', value: 'en-US-Wavenet-C' },
    { name: 'en-US-Wavenet-D', value: 'en-US-Wavenet-D' },
    { name: 'en-US-Neural2-A', value: 'en-US-Neural2-A' },
    { name: 'en-US-Neural2-C', value: 'en-US-Neural2-C' },
  ],
};

// Model options per provider
const modelOptions: Record<string, INodePropertyOptions[]> = {
  openai: [
    { name: 'TTS-1 (Fast)', value: 'tts-1' },
    { name: 'TTS-1-HD (High Quality)', value: 'tts-1-hd' },
  ],
  elevenlabs: [
    { name: 'Eleven Multilingual v2', value: 'eleven_multilingual_v2' },
    { name: 'Eleven Turbo v2.5', value: 'eleven_turbo_v2_5' },
    { name: 'Eleven Turbo v2', value: 'eleven_turbo_v2' },
    { name: 'Eleven Monolingual v1', value: 'eleven_monolingual_v1' },
  ],
  google: [
    { name: 'Standard', value: 'standard' },
    { name: 'WaveNet', value: 'wavenet' },
    { name: 'Neural2', value: 'neural2' },
  ],
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
        options: providerOptions,
        description: 'Select the TTS provider',
      },
      {
        displayName: 'Model',
        name: 'model',
        type: 'options',
        default: 'tts-1',
        options: modelOptions.openai,
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
        default: 'eleven_multilingual_v2',
        options: modelOptions.elevenlabs,
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
        default: 'wavenet',
        options: modelOptions.google,
        displayOptions: {
          show: {
            provider: ['google'],
          },
        },
        description: 'Google Cloud TTS model',
      },
      {
        displayName: 'Voice',
        name: 'voice',
        type: 'options',
        default: 'alloy',
        options: voiceOptions.openai,
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
        default: 'rachel',
        options: voiceOptions.elevenlabs,
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
        default: 'en-US-Wavenet-A',
        options: voiceOptions.google,
        displayOptions: {
          show: {
            provider: ['google'],
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
        description: 'Text to convert to speech',
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
        ],
        description: 'Audio output format',
      },
      {
        displayName: 'Speed',
        name: 'speed',
        type: 'number',
        default: 1.0,
        typeOptions: {
          minValue: 0.25,
          maxValue: 4.0,
          numberStepSize: 0.1,
        },
        description: 'Playback speed (0.25 to 4.0)',
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

        // Make request to Demeterics TTS API
        const response = await this.helpers.request({
          method: 'POST',
          url: `${baseUrl}/tts/v1/generate`,
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            provider,
            model,
            voice,
            input: text,
            format,
            speed,
          }),
          json: true,
        });

        returnData.push({
          json: {
            id: response.id,
            provider: response.provider,
            model: response.model,
            voice: response.voice,
            audio_url: response.audio_url,
            duration_seconds: response.duration_seconds,
            cost_usd: response.cost_usd,
            usage: response.usage,
            metadata: response.metadata,
          },
          pairedItem: { item: i },
        });
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
