/**
 * Auto-generated configuration from Demeterics API
 * Generated: 2025-12-04T19:19:31.574Z
 * API Version: 1.0
 * API Updated: 2025-12-04T19:19:31Z
 * 
 * DO NOT EDIT MANUALLY - Run "npm run fetch-config" to regenerate
 * 
 * This configuration is generated from a self-describing API schema.
 * The API defines all parameters, their types, validation rules,
 * and conditional visibility - enabling automatic n8n node generation.
 */

import type { INodePropertyOptions, INodeProperties } from 'n8n-workflow';

// =============================================================================
// Text-to-Speech Configuration (V2 Schema)
// =============================================================================

export const ttsProviderOptions: INodePropertyOptions[] = [
  { name: 'OpenAI TTS', value: 'openai' },
  { name: 'ElevenLabs', value: 'elevenlabs' },
  { name: 'Google Cloud TTS', value: 'google' },
  { name: 'Murf.ai', value: 'murf' },
];

/**
 * TTS node properties generated from V2 schema.
 * Each provider has its own set of properties with conditional visibility.
 */
export const ttsProperties: INodeProperties[] = [
  {
    displayName: 'Provider',
    name: 'provider',
    type: 'options',
    default: 'openai',
    options: ttsProviderOptions,
    description: 'Select the TTS provider',
  },
  // --- OpenAI TTS Parameters ---
  {
    displayName: 'Model',
    name: 'model',
    type: 'options',
    default: 'gpt-4o-mini-tts',
    required: true,
    options: [
      { name: 'GPT-4o Mini TTS (Latest)', value: 'gpt-4o-mini-tts', description: 'Newest model with voice instructions support' },
      { name: 'TTS-1 (Standard)', value: 'tts-1', description: 'Fast, good quality' },
      { name: 'TTS-1 HD (High Quality)', value: 'tts-1-hd', description: 'Higher quality, slightly slower' },
    ],
    displayOptions: { show: { provider: ['openai'] } },
  },
  {
    displayName: 'Voice',
    name: 'voice',
    type: 'options',
    default: 'alloy',
    required: true,
    options: [
      { name: 'Alloy (Neutral)', value: 'alloy' },
      { name: 'Ash (Warm Male)', value: 'ash' },
      { name: 'Ballad (Soft Female)', value: 'ballad' },
      { name: 'Coral (Friendly Female)', value: 'coral' },
      { name: 'Echo (Warm Male)', value: 'echo' },
      { name: 'Fable (Expressive)', value: 'fable' },
      { name: 'Onyx (Deep Male)', value: 'onyx' },
      { name: 'Nova (Friendly Female)', value: 'nova' },
      { name: 'Sage (Calm)', value: 'sage' },
      { name: 'Shimmer (Soft Female)', value: 'shimmer' },
      { name: 'Verse (Dynamic Male)', value: 'verse' },
    ],
    displayOptions: { show: { provider: ['openai'] } },
  },
  {
    displayName: 'Text',
    name: 'text',
    type: 'string',
    default: '',
    required: true,
    typeOptions: { rows: 4 },
    displayOptions: { show: { provider: ['openai'] } },
    description: 'Text to convert to speech (max 4096 characters)',
  },
  {
    displayName: 'Output Format',
    name: 'format',
    type: 'options',
    default: 'mp3',
    options: [
      { name: 'MP3', value: 'mp3' },
      { name: 'Opus', value: 'opus' },
      { name: 'AAC', value: 'aac' },
      { name: 'FLAC', value: 'flac' },
      { name: 'WAV', value: 'wav' },
      { name: 'PCM', value: 'pcm' },
    ],
    displayOptions: { show: { provider: ['openai'] } },
  },
  {
    displayName: 'Speed',
    name: 'speed',
    type: 'number',
    default: 1,
    typeOptions: { minValue: 0.25, maxValue: 4, numberStepSize: 0.1 },
    displayOptions: { show: { provider: ['openai'] } },
    description: 'Playback speed (0.25 to 4.0)',
  },
  {
    displayName: 'Voice Instructions',
    name: 'instructions',
    type: 'string',
    default: '',
    typeOptions: { rows: 3 },
    displayOptions: { show: { provider: ['openai'], model: ['gpt-4o-mini-tts'] } },
    description: 'Voice style instructions (gpt-4o-mini-tts only). E.g., \'Speak warmly\' or \'Read as a news anchor\'',
  },
  // --- ElevenLabs Parameters ---
  {
    displayName: 'Model',
    name: 'model',
    type: 'options',
    default: 'eleven_multilingual_v2',
    required: true,
    options: [
      { name: 'Multilingual V2', value: 'eleven_multilingual_v2', description: 'Best quality, supports 29 languages' },
      { name: 'Turbo V2 (Faster)', value: 'eleven_turbo_v2', description: 'Lower latency, English optimized' },
      { name: 'Monolingual V1', value: 'eleven_monolingual_v1', description: 'Legacy English model' },
    ],
    displayOptions: { show: { provider: ['elevenlabs'] } },
  },
  {
    displayName: 'Voice',
    name: 'voice',
    type: 'options',
    default: '21m00Tcm4TlvDq8ikWAM',
    required: true,
    options: [
      { name: 'Rachel', value: '21m00Tcm4TlvDq8ikWAM' },
      { name: 'Domi', value: 'AZnzlk1XvdvUeBnXmlld' },
      { name: 'Bella', value: 'EXAVITQu4vr4xnSDxMaL' },
      { name: 'Antoni', value: 'ErXwobaYiN019PkySvjV' },
      { name: 'Elli', value: 'MF3mGyEYCl7XYWbV9V6O' },
      { name: 'Josh', value: 'TxGEqnHWrfWFTfGW9XjX' },
      { name: 'Arnold', value: 'VR6AewLTigWG4xSOukaG' },
      { name: 'Adam', value: 'pNInz6obpgDQGcFmaJgB' },
      { name: 'Sam', value: 'yoZ06aMxZJJ28mfd3POQ' },
    ],
    displayOptions: { show: { provider: ['elevenlabs'] } },
  },
  {
    displayName: 'Text',
    name: 'text',
    type: 'string',
    default: '',
    required: true,
    typeOptions: { rows: 4 },
    displayOptions: { show: { provider: ['elevenlabs'] } },
    description: 'Text to convert to speech (max 5000 characters)',
  },
  {
    displayName: 'Output Format',
    name: 'format',
    type: 'options',
    default: 'mp3_44100_128',
    options: [
      { name: 'MP3 (44.1kHz, 128kbps)', value: 'mp3_44100_128' },
      { name: 'MP3 (44.1kHz, 192kbps)', value: 'mp3_44100_192' },
      { name: 'PCM (16kHz)', value: 'pcm_16000' },
      { name: 'PCM (22.05kHz)', value: 'pcm_22050' },
      { name: 'PCM (24kHz)', value: 'pcm_24000' },
      { name: 'PCM (44.1kHz)', value: 'pcm_44100' },
    ],
    displayOptions: { show: { provider: ['elevenlabs'] } },
  },
  // --- Google Cloud TTS Parameters ---
  {
    displayName: 'Voice Type',
    name: 'model',
    type: 'options',
    default: 'Neural2',
    required: true,
    options: [
      { name: 'Neural2 (Recommended)', value: 'Neural2', description: 'Best quality neural voices' },
      { name: 'WaveNet', value: 'WaveNet', description: 'High quality, slightly older' },
      { name: 'Standard (Budget)', value: 'Standard', description: 'Lower cost, basic quality' },
      { name: 'Studio (Premium)', value: 'Studio', description: 'Premium studio quality' },
    ],
    displayOptions: { show: { provider: ['google'] } },
  },
  {
    displayName: 'Voice',
    name: 'voice',
    type: 'options',
    default: 'en-US-Neural2-A',
    required: true,
    options: [
      { name: 'US Female A', value: 'en-US-Neural2-A' },
      { name: 'US Female C', value: 'en-US-Neural2-C' },
      { name: 'US Male D', value: 'en-US-Neural2-D' },
      { name: 'US Female E', value: 'en-US-Neural2-E' },
      { name: 'US Female F', value: 'en-US-Neural2-F' },
      { name: 'US Female G', value: 'en-US-Neural2-G' },
      { name: 'US Female H', value: 'en-US-Neural2-H' },
      { name: 'US Male I', value: 'en-US-Neural2-I' },
      { name: 'US Male J', value: 'en-US-Neural2-J' },
      { name: 'UK Female A', value: 'en-GB-Neural2-A' },
      { name: 'UK Male B', value: 'en-GB-Neural2-B' },
      { name: 'UK Female C', value: 'en-GB-Neural2-C' },
      { name: 'UK Male D', value: 'en-GB-Neural2-D' },
    ],
    displayOptions: { show: { provider: ['google'] } },
  },
  {
    displayName: 'Text',
    name: 'text',
    type: 'string',
    default: '',
    required: true,
    typeOptions: { rows: 4 },
    displayOptions: { show: { provider: ['google'] } },
    description: 'Text to convert to speech (max 5000 characters)',
  },
  {
    displayName: 'Output Format',
    name: 'format',
    type: 'options',
    default: 'MP3',
    options: [
      { name: 'MP3', value: 'MP3' },
      { name: 'WAV (LINEAR16)', value: 'LINEAR16' },
      { name: 'OGG Opus', value: 'OGG_OPUS' },
      { name: 'MULAW', value: 'MULAW' },
      { name: 'ALAW', value: 'ALAW' },
    ],
    displayOptions: { show: { provider: ['google'] } },
  },
  {
    displayName: 'Speed',
    name: 'speed',
    type: 'number',
    default: 1,
    typeOptions: { minValue: 0.25, maxValue: 4, numberStepSize: 0.1 },
    displayOptions: { show: { provider: ['google'] } },
    description: 'Speaking rate (0.25 to 4.0)',
  },
  // --- Murf.ai Parameters ---
  {
    displayName: 'Model',
    name: 'model',
    type: 'options',
    default: 'GEN2',
    required: true,
    options: [
      { name: 'GEN2 (Latest)', value: 'GEN2', description: 'Latest generation voices' },
      { name: 'Falcon (Streaming)', value: 'FALCON', description: 'Optimized for streaming' },
    ],
    displayOptions: { show: { provider: ['murf'] } },
  },
  {
    displayName: 'Voice',
    name: 'voice',
    type: 'options',
    default: 'en-US-natalie',
    required: true,
    options: [
      { name: 'Natalie (US Female)', value: 'en-US-natalie' },
      { name: 'Marcus (US Male)', value: 'en-US-marcus' },
      { name: 'Terrell (US Male)', value: 'en-US-terrell' },
      { name: 'Hazel (UK Female)', value: 'en-GB-hazel' },
      { name: 'Harry (UK Male)', value: 'en-GB-harry' },
    ],
    displayOptions: { show: { provider: ['murf'] } },
  },
  {
    displayName: 'Text',
    name: 'text',
    type: 'string',
    default: '',
    required: true,
    typeOptions: { rows: 4 },
    displayOptions: { show: { provider: ['murf'] } },
    description: 'Text to convert to speech (max 10000 characters)',
  },
  {
    displayName: 'Output Format',
    name: 'format',
    type: 'options',
    default: 'MP3',
    options: [
      { name: 'MP3', value: 'MP3' },
      { name: 'WAV', value: 'WAV' },
      { name: 'FLAC', value: 'FLAC' },
      { name: 'OGG', value: 'OGG' },
      { name: 'PCM', value: 'PCM' },
      { name: 'ALAW', value: 'ALAW' },
      { name: 'ULAW', value: 'ULAW' },
    ],
    displayOptions: { show: { provider: ['murf'] } },
  },
  {
    displayName: 'Speed',
    name: 'speed',
    type: 'number',
    default: 1,
    typeOptions: { minValue: 0.25, maxValue: 4, numberStepSize: 0.1 },
    displayOptions: { show: { provider: ['murf'] } },
    description: 'Playback speed (0.25 to 4.0)',
  },
  {
    displayName: 'Language',
    name: 'language',
    type: 'string',
    default: '',
    placeholder: 'e.g., en, es, fr, de',
    displayOptions: { show: { provider: ['murf'] } },
    description: 'Language code (ISO 639-1). Leave empty for auto-detection.',
  },
];

export const ttsDefaultModels: Record<string, string> = {
  openai: 'gpt-4o-mini-tts',
  elevenlabs: 'eleven_multilingual_v2',
  google: 'Neural2',
  murf: 'GEN2',
};

export const ttsDefaultVoices: Record<string, string> = {
  openai: 'alloy',
  elevenlabs: '21m00Tcm4TlvDq8ikWAM',
  google: 'en-US-Neural2-A',
  murf: 'en-US-natalie',
};

export const ttsProviderFeatures: Record<string, { maxChars: number; supportsSpeed: boolean; supportsLanguage: boolean; supportsInstructions: boolean }> = {
  openai: { maxChars: 4096, supportsSpeed: true, supportsLanguage: false, supportsInstructions: true },
  elevenlabs: { maxChars: 5000, supportsSpeed: false, supportsLanguage: false, supportsInstructions: false },
  google: { maxChars: 5000, supportsSpeed: true, supportsLanguage: false, supportsInstructions: false },
  murf: { maxChars: 10000, supportsSpeed: true, supportsLanguage: true, supportsInstructions: false },
};

export const ttsSpeedRange = { min: 0.25, max: 4, default: 1 };

// =============================================================================
// Image Generation Configuration (V2 Schema)
// =============================================================================

export const imageProviderOptions: INodePropertyOptions[] = [
  { name: 'OpenAI Image Generation', value: 'openai' },
  { name: 'Google Imagen', value: 'google' },
  { name: 'Stability AI', value: 'stability' },
];

/**
 * Image node properties generated from V2 schema.
 */
export const imageProperties: INodeProperties[] = [
  {
    displayName: 'Provider',
    name: 'provider',
    type: 'options',
    default: 'openai',
    options: imageProviderOptions,
    description: 'Select the image generation provider',
  },
  // --- OpenAI Image Generation Parameters ---
  {
    displayName: 'Model',
    name: 'model',
    type: 'options',
    default: 'gpt-image-1',
    required: true,
    options: [
      { name: 'GPT Image 1 (Premium)', value: 'gpt-image-1', description: 'Best quality, $0.011-0.167/image' },
      { name: 'GPT Image 1 Mini (~70% cheaper)', value: 'gpt-image-1-mini', description: 'Cost-effective, $0.005-0.052/image' },
    ],
    displayOptions: { show: { provider: ['openai'] } },
  },
  {
    displayName: 'Prompt',
    name: 'prompt',
    type: 'string',
    default: '',
    required: true,
    typeOptions: { rows: 4 },
    displayOptions: { show: { provider: ['openai'] } },
    description: 'Description of the image to generate (max 4000 characters)',
  },
  {
    displayName: 'Size',
    name: 'size',
    type: 'options',
    default: '1024x1024',
    options: [
      { name: '1024x1024 (1:1 Square)', value: '1024x1024' },
      { name: '1536x1024 (3:2 Landscape)', value: '1536x1024' },
      { name: '1024x1536 (2:3 Portrait)', value: '1024x1536' },
      { name: '1792x1024 (16:9 Wide)', value: '1792x1024' },
      { name: '1024x1792 (9:16 Tall)', value: '1024x1792' },
    ],
    displayOptions: { show: { provider: ['openai'] } },
  },
  {
    displayName: 'Quality',
    name: 'quality',
    type: 'options',
    default: 'medium',
    options: [
      { name: 'Low (Fastest)', value: 'low' },
      { name: 'Medium (Balanced)', value: 'medium' },
      { name: 'High (Best Quality)', value: 'high' },
    ],
    displayOptions: { show: { provider: ['openai'] } },
    description: 'Image quality affects generation time and cost',
  },
  {
    displayName: 'Number of Images',
    name: 'n',
    type: 'number',
    default: 1,
    typeOptions: { minValue: 1, maxValue: 4, numberStepSize: 1 },
    displayOptions: { show: { provider: ['openai'] } },
    description: 'Number of images to generate (1-4)',
  },
  {
    displayName: 'Seed',
    name: 'seed',
    type: 'number',
    default: 0,
    typeOptions: { minValue: 0, maxValue: 4294967295, numberStepSize: 1 },
    displayOptions: { show: { provider: ['openai'] } },
    description: 'Seed for reproducibility (0 for random)',
  },
  // --- Google Imagen Parameters ---
  {
    displayName: 'Model',
    name: 'model',
    type: 'options',
    default: 'imagen-3.0-generate-002',
    required: true,
    options: [
      { name: 'Imagen 3.0 Generate', value: 'imagen-3.0-generate-002', description: 'Latest generation model' },
      { name: 'Imagen 3.0 Fast', value: 'imagen-3.0-fast-generate-001', description: 'Faster generation, slightly lower quality' },
    ],
    displayOptions: { show: { provider: ['google'] } },
  },
  {
    displayName: 'Prompt',
    name: 'prompt',
    type: 'string',
    default: '',
    required: true,
    typeOptions: { rows: 4 },
    displayOptions: { show: { provider: ['google'] } },
    description: 'Description of the image to generate (max 5000 characters)',
  },
  {
    displayName: 'Negative Prompt',
    name: 'negativePrompt',
    type: 'string',
    default: '',
    typeOptions: { rows: 2 },
    displayOptions: { show: { provider: ['google'] } },
    description: 'What to avoid in the image',
  },
  {
    displayName: 'Size',
    name: 'size',
    type: 'options',
    default: '1024x1024',
    options: [
      { name: '1024x1024 (1:1 Square)', value: '1024x1024' },
      { name: '1536x1536 (1:1 Large Square)', value: '1536x1536' },
      { name: '1280x768 (5:3 Landscape)', value: '1280x768' },
      { name: '768x1280 (3:5 Portrait)', value: '768x1280' },
    ],
    displayOptions: { show: { provider: ['google'] } },
  },
  {
    displayName: 'Number of Images',
    name: 'n',
    type: 'number',
    default: 1,
    typeOptions: { minValue: 1, maxValue: 4, numberStepSize: 1 },
    displayOptions: { show: { provider: ['google'] } },
    description: 'Number of images to generate (1-4)',
  },
  {
    displayName: 'Seed',
    name: 'seed',
    type: 'number',
    default: 0,
    typeOptions: { minValue: 0, maxValue: 4294967295, numberStepSize: 1 },
    displayOptions: { show: { provider: ['google'] } },
    description: 'Seed for reproducibility (0 for random)',
  },
  // --- Stability AI Parameters ---
  {
    displayName: 'Model',
    name: 'model',
    type: 'options',
    default: 'core',
    required: true,
    options: [
      { name: 'Stable Image Ultra (Highest Quality)', value: 'ultra', description: '$0.08/image' },
      { name: 'Stable Image Core (Balanced)', value: 'core', description: '$0.03/image' },
      { name: 'SD3 Large', value: 'sd3-large', description: '$0.065/image' },
      { name: 'SD3 Medium', value: 'sd3-medium', description: '$0.035/image' },
    ],
    displayOptions: { show: { provider: ['stability'] } },
  },
  {
    displayName: 'Prompt',
    name: 'prompt',
    type: 'string',
    default: '',
    required: true,
    typeOptions: { rows: 4 },
    displayOptions: { show: { provider: ['stability'] } },
    description: 'Description of the image to generate (max 10000 characters)',
  },
  {
    displayName: 'Negative Prompt',
    name: 'negativePrompt',
    type: 'string',
    default: '',
    typeOptions: { rows: 2 },
    displayOptions: { show: { provider: ['stability'] } },
    description: 'What to avoid in the image',
  },
  {
    displayName: 'Size',
    name: 'size',
    type: 'options',
    default: '1024x1024',
    options: [
      { name: '1024x1024 (1:1 Square)', value: '1024x1024' },
      { name: '1344x768 (16:9 Landscape)', value: '1344x768' },
      { name: '768x1344 (9:16 Portrait)', value: '768x1344' },
      { name: '1216x832 (3:2 Landscape)', value: '1216x832' },
      { name: '832x1216 (2:3 Portrait)', value: '832x1216' },
      { name: '1088x896 (5:4 Landscape)', value: '1088x896' },
      { name: '896x1088 (4:5 Portrait)', value: '896x1088' },
      { name: '1536x640 (21:9 Ultra-wide)', value: '1536x640' },
      { name: '640x1536 (9:21 Ultra-tall)', value: '640x1536' },
    ],
    displayOptions: { show: { provider: ['stability'] } },
  },
  {
    displayName: 'Number of Images',
    name: 'n',
    type: 'number',
    default: 1,
    typeOptions: { minValue: 1, maxValue: 4, numberStepSize: 1 },
    displayOptions: { show: { provider: ['stability'] } },
    description: 'Number of images to generate (1-4)',
  },
  {
    displayName: 'Seed',
    name: 'seed',
    type: 'number',
    default: 0,
    typeOptions: { minValue: 0, maxValue: 4294967295, numberStepSize: 1 },
    displayOptions: { show: { provider: ['stability'] } },
    description: 'Seed for reproducibility (0 for random)',
  },
];

export const imageDefaultModels: Record<string, string> = {
  openai: 'gpt-image-1',
  google: 'imagen-3.0-generate-002',
  stability: 'core',
};

export const imageProviderFeatures: Record<string, { supportsNegativePrompt: boolean; supportsQuality: boolean; supportsStyle: boolean; maxImages: number; maxPromptLen: number }> = {
  openai: { supportsNegativePrompt: false, supportsQuality: true, supportsStyle: false, maxImages: 4, maxPromptLen: 4000 },
  google: { supportsNegativePrompt: true, supportsQuality: false, supportsStyle: false, maxImages: 4, maxPromptLen: 5000 },
  stability: { supportsNegativePrompt: true, supportsQuality: false, supportsStyle: false, maxImages: 4, maxPromptLen: 10000 },
};

export const imageNRange = { min: 1, max: 4, default: 1 };
export const imageSeedRange = { min: 0, max: 4294967295, default: 0 };

// =============================================================================
// Chat/LLM Configuration
// =============================================================================

export const chatProviderOptions: INodePropertyOptions[] = [
  { name: 'Groq', value: 'groq' },
  { name: 'OpenAI', value: 'openai' },
  { name: 'Anthropic', value: 'anthropic' },
  { name: 'Google Gemini', value: 'gemini' },
  { name: 'Google AI', value: 'google' },
  { name: 'OpenRouter', value: 'openrouter' },
];

export const chatModelOptions: Record<string, INodePropertyOptions[]> = {
  groq: [
  ],
  openai: [
  ],
  anthropic: [
  ],
  gemini: [
  ],
  google: [
  ],
  openrouter: [
  ],
};

export const chatProviderBaseUrls: Record<string, string> = {
  groq: 'https://api.demeterics.com/groq/v1',
  openai: 'https://api.demeterics.com/openai/v1',
  anthropic: 'https://api.demeterics.com/anthropic/v1',
  gemini: 'https://api.demeterics.com/gemini/v1',
  google: 'https://api.demeterics.com/google/v1',
  openrouter: 'https://api.demeterics.com/openrouter/v1',
};

// =============================================================================
// Legacy V1-style exports (for backward compatibility)
// =============================================================================

export const ttsModelOptions: Record<string, INodePropertyOptions[]> = {
  openai: [
    { name: 'GPT-4o Mini TTS (Latest)', value: 'gpt-4o-mini-tts', description: 'Default' },
    { name: 'TTS-1 (Standard)', value: 'tts-1' },
    { name: 'TTS-1 HD (High Quality)', value: 'tts-1-hd' },
  ],
  elevenlabs: [
    { name: 'Multilingual V2', value: 'eleven_multilingual_v2', description: 'Default' },
    { name: 'Turbo V2 (Faster)', value: 'eleven_turbo_v2' },
    { name: 'Monolingual V1', value: 'eleven_monolingual_v1' },
  ],
  google: [
    { name: 'Neural2 (Recommended)', value: 'Neural2', description: 'Default' },
    { name: 'WaveNet', value: 'WaveNet' },
    { name: 'Standard (Budget)', value: 'Standard' },
    { name: 'Studio (Premium)', value: 'Studio' },
  ],
  murf: [
    { name: 'GEN2 (Latest)', value: 'GEN2', description: 'Default' },
    { name: 'Falcon (Streaming)', value: 'FALCON' },
  ],
};

export const ttsVoiceOptions: Record<string, INodePropertyOptions[]> = {
  openai: [
    { name: 'Alloy (Neutral)', value: 'alloy', description: 'Default' },
    { name: 'Ash (Warm Male)', value: 'ash' },
    { name: 'Ballad (Soft Female)', value: 'ballad' },
    { name: 'Coral (Friendly Female)', value: 'coral' },
    { name: 'Echo (Warm Male)', value: 'echo' },
    { name: 'Fable (Expressive)', value: 'fable' },
    { name: 'Onyx (Deep Male)', value: 'onyx' },
    { name: 'Nova (Friendly Female)', value: 'nova' },
    { name: 'Sage (Calm)', value: 'sage' },
    { name: 'Shimmer (Soft Female)', value: 'shimmer' },
    { name: 'Verse (Dynamic Male)', value: 'verse' },
  ],
  elevenlabs: [
    { name: 'Rachel', value: '21m00Tcm4TlvDq8ikWAM', description: 'Default' },
    { name: 'Domi', value: 'AZnzlk1XvdvUeBnXmlld' },
    { name: 'Bella', value: 'EXAVITQu4vr4xnSDxMaL' },
    { name: 'Antoni', value: 'ErXwobaYiN019PkySvjV' },
    { name: 'Elli', value: 'MF3mGyEYCl7XYWbV9V6O' },
    { name: 'Josh', value: 'TxGEqnHWrfWFTfGW9XjX' },
    { name: 'Arnold', value: 'VR6AewLTigWG4xSOukaG' },
    { name: 'Adam', value: 'pNInz6obpgDQGcFmaJgB' },
    { name: 'Sam', value: 'yoZ06aMxZJJ28mfd3POQ' },
  ],
  google: [
    { name: 'US Female A', value: 'en-US-Neural2-A', description: 'Default' },
    { name: 'US Female C', value: 'en-US-Neural2-C' },
    { name: 'US Male D', value: 'en-US-Neural2-D' },
    { name: 'US Female E', value: 'en-US-Neural2-E' },
    { name: 'US Female F', value: 'en-US-Neural2-F' },
    { name: 'US Female G', value: 'en-US-Neural2-G' },
    { name: 'US Female H', value: 'en-US-Neural2-H' },
    { name: 'US Male I', value: 'en-US-Neural2-I' },
    { name: 'US Male J', value: 'en-US-Neural2-J' },
    { name: 'UK Female A', value: 'en-GB-Neural2-A' },
    { name: 'UK Male B', value: 'en-GB-Neural2-B' },
    { name: 'UK Female C', value: 'en-GB-Neural2-C' },
    { name: 'UK Male D', value: 'en-GB-Neural2-D' },
  ],
  murf: [
    { name: 'Natalie (US Female)', value: 'en-US-natalie', description: 'Default' },
    { name: 'Marcus (US Male)', value: 'en-US-marcus' },
    { name: 'Terrell (US Male)', value: 'en-US-terrell' },
    { name: 'Hazel (UK Female)', value: 'en-GB-hazel' },
    { name: 'Harry (UK Male)', value: 'en-GB-harry' },
  ],
};

export const ttsFormatOptions: Record<string, INodePropertyOptions[]> = {
  openai: [
    { name: 'MP3', value: 'mp3' },
    { name: 'Opus', value: 'opus' },
    { name: 'AAC', value: 'aac' },
    { name: 'FLAC', value: 'flac' },
    { name: 'WAV', value: 'wav' },
    { name: 'PCM', value: 'pcm' },
  ],
  elevenlabs: [
    { name: 'MP3 (44.1kHz, 128kbps)', value: 'mp3_44100_128' },
    { name: 'MP3 (44.1kHz, 192kbps)', value: 'mp3_44100_192' },
    { name: 'PCM (16kHz)', value: 'pcm_16000' },
    { name: 'PCM (22.05kHz)', value: 'pcm_22050' },
    { name: 'PCM (24kHz)', value: 'pcm_24000' },
    { name: 'PCM (44.1kHz)', value: 'pcm_44100' },
  ],
  google: [
    { name: 'MP3', value: 'MP3' },
    { name: 'WAV (LINEAR16)', value: 'LINEAR16' },
    { name: 'OGG Opus', value: 'OGG_OPUS' },
    { name: 'MULAW', value: 'MULAW' },
    { name: 'ALAW', value: 'ALAW' },
  ],
  murf: [
    { name: 'MP3', value: 'MP3' },
    { name: 'WAV', value: 'WAV' },
    { name: 'FLAC', value: 'FLAC' },
    { name: 'OGG', value: 'OGG' },
    { name: 'PCM', value: 'PCM' },
    { name: 'ALAW', value: 'ALAW' },
    { name: 'ULAW', value: 'ULAW' },
  ],
};

export const imageModelOptions: Record<string, INodePropertyOptions[]> = {
  openai: [
    { name: 'GPT Image 1 (Premium)', value: 'gpt-image-1', description: 'Default' },
    { name: 'GPT Image 1 Mini (~70% cheaper)', value: 'gpt-image-1-mini' },
  ],
  google: [
    { name: 'Imagen 3.0 Generate', value: 'imagen-3.0-generate-002', description: 'Default' },
    { name: 'Imagen 3.0 Fast', value: 'imagen-3.0-fast-generate-001' },
  ],
  stability: [
    { name: 'Stable Image Ultra (Highest Quality)', value: 'ultra' },
    { name: 'Stable Image Core (Balanced)', value: 'core', description: 'Default' },
    { name: 'SD3 Large', value: 'sd3-large' },
    { name: 'SD3 Medium', value: 'sd3-medium' },
  ],
};

export const imageSizeOptions: Record<string, INodePropertyOptions[]> = {
  openai: [
    { name: '1024x1024 (1:1 Square)', value: '1024x1024' },
    { name: '1536x1024 (3:2 Landscape)', value: '1536x1024' },
    { name: '1024x1536 (2:3 Portrait)', value: '1024x1536' },
    { name: '1792x1024 (16:9 Wide)', value: '1792x1024' },
    { name: '1024x1792 (9:16 Tall)', value: '1024x1792' },
  ],
  google: [
    { name: '1024x1024 (1:1 Square)', value: '1024x1024' },
    { name: '1536x1536 (1:1 Large Square)', value: '1536x1536' },
    { name: '1280x768 (5:3 Landscape)', value: '1280x768' },
    { name: '768x1280 (3:5 Portrait)', value: '768x1280' },
  ],
  stability: [
    { name: '1024x1024 (1:1 Square)', value: '1024x1024' },
    { name: '1344x768 (16:9 Landscape)', value: '1344x768' },
    { name: '768x1344 (9:16 Portrait)', value: '768x1344' },
    { name: '1216x832 (3:2 Landscape)', value: '1216x832' },
    { name: '832x1216 (2:3 Portrait)', value: '832x1216' },
    { name: '1088x896 (5:4 Landscape)', value: '1088x896' },
    { name: '896x1088 (4:5 Portrait)', value: '896x1088' },
    { name: '1536x640 (21:9 Ultra-wide)', value: '1536x640' },
    { name: '640x1536 (9:21 Ultra-tall)', value: '640x1536' },
  ],
};

export const imageQualityOptions: Record<string, INodePropertyOptions[]> = {
  openai: [
    { name: 'Low (Fastest)', value: 'low' },
    { name: 'Medium (Balanced)', value: 'medium', description: 'Default' },
    { name: 'High (Best Quality)', value: 'high' },
  ],
};

export const imageStyleOptions: Record<string, INodePropertyOptions[]> = {
  // No providers currently support style (gpt-image-1 removed style support)
};

// Configuration metadata
export const configVersion = '1.0';
export const configUpdatedAt = '2025-12-04T19:19:31Z';
