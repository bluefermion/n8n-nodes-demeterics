/**
 * Auto-generated configuration from Demeterics API
 * Generated: 2026-02-05T12:00:00.000Z
 * API Version: 1.0
 * API Updated: 2026-02-05T12:00:00Z
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
  { name: 'Groq Orpheus (Fast & Cheap)', value: 'groq' },
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
  // --- Groq Orpheus (Fast & Cheap) Parameters ---
  {
    displayName: 'Model',
    name: 'model',
    type: 'options',
    default: 'canopylabs/orpheus-v1-english',
    required: true,
    options: [
      { name: 'Orpheus English', value: 'canopylabs/orpheus-v1-english', description: 'High quality Orpheus voices' },
    ],
    displayOptions: { show: { provider: ['groq'] } },
  },
  {
    displayName: 'Voice',
    name: 'voice',
    type: 'options',
    default: 'tara',
    required: true,
    options: [
      { name: 'Tara (Conversational Female)', value: 'tara' },
      { name: 'Leah (Female)', value: 'leah' },
      { name: 'Jess (Female)', value: 'jess' },
      { name: 'Mia (Female)', value: 'mia' },
      { name: 'Zoe (Female)', value: 'zoe' },
      { name: 'Leo (Male)', value: 'leo' },
      { name: 'Dan (Male)', value: 'dan' },
      { name: 'Zac (Male)', value: 'zac' },
    ],
    displayOptions: { show: { provider: ['groq'] } },
  },
  {
    displayName: 'Text',
    name: 'text',
    type: 'string',
    default: '',
    required: true,
    typeOptions: { rows: 4 },
    displayOptions: { show: { provider: ['groq'] } },
    description: 'Text to convert to speech (max 200 chars per request, chunked automatically)',
  },
  {
    displayName: 'Output Format',
    name: 'format',
    type: 'options',
    default: 'wav',
    options: [
      { name: 'WAV', value: 'wav' },
    ],
    displayOptions: { show: { provider: ['groq'] } },
    description: 'Groq Orpheus only supports WAV format',
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
  groq: 'canopylabs/orpheus-v1-english',
  openai: 'gpt-4o-mini-tts',
  elevenlabs: 'eleven_multilingual_v2',
  google: 'Neural2',
  murf: 'GEN2',
};

export const ttsDefaultVoices: Record<string, string> = {
  groq: 'tara',
  openai: 'alloy',
  elevenlabs: '21m00Tcm4TlvDq8ikWAM',
  google: 'en-US-Neural2-A',
  murf: 'en-US-natalie',
};

export const ttsProviderFeatures: Record<string, { maxChars: number; supportsSpeed: boolean; supportsLanguage: boolean; supportsInstructions: boolean }> = {
  groq: { maxChars: 200, supportsSpeed: false, supportsLanguage: false, supportsInstructions: false },
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
  { name: 'Leonardo AI', value: 'leonardo' },
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
    default: 'gpt-image-1.5',
    required: true,
    options: [
      { name: 'GPT Image 1.5 (Recommended)', value: 'gpt-image-1.5', description: 'Latest model (Dec 2025), 20% cheaper, better text/logo preservation, $0.009-0.134/image' },
      { name: 'GPT Image 1 (Premium)', value: 'gpt-image-1', description: 'Previous premium model, $0.011-0.167/image' },
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
      { name: 'Auto (Let AI choose)', value: 'auto' },
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
    default: 'gemini-2.5-flash-image',
    required: true,
    options: [
      { name: 'Gemini 2.5 Flash Image (Nano Banana)', value: 'gemini-2.5-flash-image', description: 'Native Gemini image generation - fast, high quality' },
      { name: 'Imagen 4.0', value: 'imagen-4.0-generate-001', description: 'Vertex AI Imagen 4.0 model' },
      { name: 'Imagen 3.0 Generate', value: 'imagen-3.0-generate-002', description: 'Previous generation model' },
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
  // --- Leonardo AI Parameters ---
  {
    displayName: 'Model',
    name: 'model',
    type: 'options',
    default: 'phoenix',
    required: true,
    options: [
      { name: 'Phoenix 1.0 (Flagship)', value: 'phoenix', description: 'Latest flagship model, best quality' },
      { name: 'Kino XL (Cinematic)', value: 'kino-xl', description: 'Cinematic and dramatic style' },
      { name: 'Vision XL (Photorealistic)', value: 'vision-xl', description: 'High-fidelity photorealistic images' },
      { name: 'Diffusion XL (Versatile)', value: 'diffusion-xl', description: 'General purpose, versatile output' },
      { name: 'Lightning XL (Fast)', value: 'lightning-xl', description: 'Fast generation, lower cost' },
      { name: 'Anime XL (Anime)', value: 'anime-xl', description: 'Optimized for anime style' },
    ],
    displayOptions: { show: { provider: ['leonardo'] } },
  },
  {
    displayName: 'Prompt',
    name: 'prompt',
    type: 'string',
    default: '',
    required: true,
    typeOptions: { rows: 4 },
    displayOptions: { show: { provider: ['leonardo'] } },
    description: 'Description of the image to generate (max 1000 characters)',
  },
  {
    displayName: 'Negative Prompt',
    name: 'negativePrompt',
    type: 'string',
    default: '',
    typeOptions: { rows: 2 },
    displayOptions: { show: { provider: ['leonardo'] } },
    description: 'What to avoid in the image',
  },
  {
    displayName: 'Size',
    name: 'size',
    type: 'options',
    default: '1024x1024',
    options: [
      { name: '1024x1024 (1:1 Square)', value: '1024x1024' },
      { name: '1472x832 (16:9 Landscape)', value: '1472x832' },
      { name: '832x1472 (9:16 Portrait)', value: '832x1472' },
      { name: '1280x832 (3:2 Landscape)', value: '1280x832' },
      { name: '832x1280 (2:3 Portrait)', value: '832x1280' },
      { name: '1152x896 (4:3 Landscape)', value: '1152x896' },
      { name: '896x1152 (3:4 Portrait)', value: '896x1152' },
      { name: '512x512 (1:1 Small)', value: '512x512' },
    ],
    displayOptions: { show: { provider: ['leonardo'] } },
  },
  {
    displayName: 'Quality',
    name: 'quality',
    type: 'options',
    default: 'standard',
    options: [
      { name: 'Fast (No Alchemy)', value: 'fast', description: 'Fastest generation' },
      { name: 'Standard (Alchemy v1)', value: 'standard', description: 'Balanced quality' },
      { name: 'High (Alchemy v2)', value: 'high', description: 'Best quality enhancement' },
    ],
    displayOptions: { show: { provider: ['leonardo'] } },
    description: 'Alchemy quality enhancement mode',
  },
  {
    displayName: 'Number of Images',
    name: 'n',
    type: 'number',
    default: 1,
    typeOptions: { minValue: 1, maxValue: 4, numberStepSize: 1 },
    displayOptions: { show: { provider: ['leonardo'] } },
    description: 'Number of images to generate (1-4)',
  },
  {
    displayName: 'Seed',
    name: 'seed',
    type: 'number',
    default: 0,
    typeOptions: { minValue: 0, maxValue: 4294967295, numberStepSize: 1 },
    displayOptions: { show: { provider: ['leonardo'] } },
    description: 'Seed for reproducibility (0 for random)',
  },
];

export const imageDefaultModels: Record<string, string> = {
  openai: 'gpt-image-1.5',
  google: 'gemini-2.5-flash-image',
  stability: 'core',
  leonardo: 'phoenix',
};

export const imageProviderFeatures: Record<string, { supportsNegativePrompt: boolean; supportsQuality: boolean; supportsStyle: boolean; maxImages: number; maxPromptLen: number }> = {
  openai: { supportsNegativePrompt: false, supportsQuality: true, supportsStyle: false, maxImages: 4, maxPromptLen: 4000 },
  google: { supportsNegativePrompt: true, supportsQuality: false, supportsStyle: false, maxImages: 4, maxPromptLen: 5000 },
  stability: { supportsNegativePrompt: true, supportsQuality: false, supportsStyle: false, maxImages: 4, maxPromptLen: 10000 },
  leonardo: { supportsNegativePrompt: true, supportsQuality: true, supportsStyle: false, maxImages: 4, maxPromptLen: 1000 },
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
  { name: 'Google', value: 'google' },
  { name: 'OpenRouter', value: 'openrouter' },
];

export const chatModelOptions: Record<string, INodePropertyOptions[]> = {
  groq: [
    { name: 'ALLaM 2.7b', value: 'groq/allam-2-7b' },
    { name: 'Groq/compound', value: 'groq/groq/compound' },
    { name: 'Groq/compound Mini', value: 'groq/groq/compound-mini' },
    { name: 'LLaMA 3.1.8b Instant', value: 'groq/llama-3.1-8b-instant' },
    { name: 'LLaMA 3.3.70b Versatile', value: 'groq/llama-3.3-70b-versatile' },
    { name: 'Meta LLaMA/llama 4 Maverick 17b 128e Instruct', value: 'groq/meta-llama/llama-4-maverick-17b-128e-instruct' },
    { name: 'Meta LLaMA/llama 4 Scout 17b 16e Instruct', value: 'groq/meta-llama/llama-4-scout-17b-16e-instruct' },
    { name: 'Moonshotai/kimi K2 Instruct', value: 'groq/moonshotai/kimi-k2-instruct' },
    { name: 'Moonshotai/kimi K2 Instruct 0905', value: 'groq/moonshotai/kimi-k2-instruct-0905' },
    { name: 'Openai/gpt OSS 120b', value: 'groq/openai/gpt-oss-120b' },
    { name: 'Openai/gpt OSS 20b', value: 'groq/openai/gpt-oss-20b' },
    { name: 'Qwen/qwen3.32b', value: 'groq/qwen/qwen3-32b' },
  ],
  openai: [
    { name: 'GPT 5.2', value: 'openai/gpt-5.2' },
    { name: 'GPT 5.1', value: 'openai/gpt-5.1' },
    { name: 'GPT 5', value: 'openai/gpt-5' },
    { name: 'GPT 5 Chat Latest', value: 'openai/gpt-5-chat-latest' },
    { name: 'GPT 5 Codex', value: 'openai/gpt-5-codex' },
    { name: 'GPT 5 Search Api', value: 'openai/gpt-5-search-api' },
    { name: 'GPT 5 Mini', value: 'openai/gpt-5-mini' },
    { name: 'GPT 5 Nano', value: 'openai/gpt-5-nano' },
    { name: 'GPT 4.1', value: 'openai/gpt-4.1' },
    { name: 'GPT 4.1 Mini', value: 'openai/gpt-4.1-mini' },
    { name: 'GPT 4.1 Nano', value: 'openai/gpt-4.1-nano' },
    { name: 'GPT 4o', value: 'openai/gpt-4o' },
    { name: 'GPT 4o Mini', value: 'openai/gpt-4o-mini' },
    { name: 'GPT 4o Search Preview', value: 'openai/gpt-4o-search-preview' },
    { name: 'GPT 4o Mini Search Preview', value: 'openai/gpt-4o-mini-search-preview' },
    { name: 'GPT 4 Turbo', value: 'openai/gpt-4-turbo' },
    { name: 'GPT 3.5 Turbo', value: 'openai/gpt-3.5-turbo' },
  ],
  anthropic: [
    { name: 'Claude Opus 4.6', value: 'anthropic/claude-opus-4-6' },
    { name: 'Claude Opus 4.5', value: 'anthropic/claude-opus-4-5' },
    { name: 'Claude Opus 4.5.20251101', value: 'anthropic/claude-opus-4-5-20251101' },
    { name: 'Claude Opus 4.1', value: 'anthropic/claude-opus-4-1' },
    { name: 'Claude Opus 4', value: 'anthropic/claude-opus-4' },
    { name: 'Claude Sonnet 4.5', value: 'anthropic/claude-sonnet-4-5' },
    { name: 'Claude Sonnet 4', value: 'anthropic/claude-sonnet-4' },
    { name: 'Claude Haiku 4.5', value: 'anthropic/claude-haiku-4-5' },
    { name: 'Claude Haiku 4.5.20251001', value: 'anthropic/claude-haiku-4-5-20251001' },
    { name: 'Claude Haiku 4.5.20250514', value: 'anthropic/claude-haiku-4-5-20250514' },
    { name: 'Claude 3 Haiku 20240307', value: 'anthropic/claude-3-haiku-20240307' },
  ],
  google: [
    { name: 'Gemini 3 Flash Preview', value: 'google/gemini-3-flash-preview' },
    { name: 'Gemini 3 Pro Preview', value: 'google/gemini-3-pro-preview' },
    { name: 'Gemini 2.5 Pro', value: 'google/gemini-2.5-pro' },
    { name: 'Gemini 2.5 Flash', value: 'google/gemini-2.5-flash' },
    { name: 'Gemini 2.5 Flash Lite', value: 'google/gemini-2.5-flash-lite' },
    { name: 'Gemini 1.5 Pro', value: 'google/gemini-1.5-pro' },
    { name: 'Gemini 1.5 Flash', value: 'google/gemini-1.5-flash' },
  ],
  openrouter: [
  ],
};

export const chatProviderBaseUrls: Record<string, string> = {
  groq: 'https://api.demeterics.com/groq/v1',
  openai: 'https://api.demeterics.com/openai/v1',
  anthropic: 'https://api.demeterics.com/anthropic/v1',
  google: 'https://api.demeterics.com/google/v1',
  openrouter: 'https://api.demeterics.com/openrouter/v1',
};

// =============================================================================
// Legacy V1-style exports (for backward compatibility)
// =============================================================================

export const ttsModelOptions: Record<string, INodePropertyOptions[]> = {
  groq: [
    { name: 'Orpheus English', value: 'canopylabs/orpheus-v1-english', description: 'Default' },
  ],
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
  groq: [
    { name: 'Tara (Conversational Female)', value: 'tara', description: 'Default' },
    { name: 'Leah (Female)', value: 'leah' },
    { name: 'Jess (Female)', value: 'jess' },
    { name: 'Mia (Female)', value: 'mia' },
    { name: 'Zoe (Female)', value: 'zoe' },
    { name: 'Leo (Male)', value: 'leo' },
    { name: 'Dan (Male)', value: 'dan' },
    { name: 'Zac (Male)', value: 'zac' },
  ],
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
  groq: [
    { name: 'WAV', value: 'wav' },
  ],
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
    { name: 'GPT Image 1.5 (Recommended)', value: 'gpt-image-1.5', description: 'Default' },
    { name: 'GPT Image 1 (Premium)', value: 'gpt-image-1' },
    { name: 'GPT Image 1 Mini (~70% cheaper)', value: 'gpt-image-1-mini' },
  ],
  google: [
    { name: 'Gemini 2.5 Flash Image (Nano Banana)', value: 'gemini-2.5-flash-image', description: 'Default' },
    { name: 'Imagen 4.0', value: 'imagen-4.0-generate-001' },
    { name: 'Imagen 3.0 Generate', value: 'imagen-3.0-generate-002' },
    { name: 'Imagen 3.0 Fast', value: 'imagen-3.0-fast-generate-001' },
  ],
  stability: [
    { name: 'Stable Image Ultra (Highest Quality)', value: 'ultra' },
    { name: 'Stable Image Core (Balanced)', value: 'core', description: 'Default' },
    { name: 'SD3 Large', value: 'sd3-large' },
    { name: 'SD3 Medium', value: 'sd3-medium' },
  ],
  leonardo: [
    { name: 'Phoenix 1.0 (Flagship)', value: 'phoenix', description: 'Default' },
    { name: 'Kino XL (Cinematic)', value: 'kino-xl' },
    { name: 'Vision XL (Photorealistic)', value: 'vision-xl' },
    { name: 'Diffusion XL (Versatile)', value: 'diffusion-xl' },
    { name: 'Lightning XL (Fast)', value: 'lightning-xl' },
    { name: 'Anime XL (Anime)', value: 'anime-xl' },
  ],
};

export const imageSizeOptions: Record<string, INodePropertyOptions[]> = {
  openai: [
    { name: '1024x1024 (1:1 Square)', value: '1024x1024' },
    { name: '1536x1024 (3:2 Landscape)', value: '1536x1024' },
    { name: '1024x1536 (2:3 Portrait)', value: '1024x1536' },
    { name: 'Auto (Let AI choose)', value: 'auto' },
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
  leonardo: [
    { name: '1024x1024 (1:1 Square)', value: '1024x1024' },
    { name: '1472x832 (16:9 Landscape)', value: '1472x832' },
    { name: '832x1472 (9:16 Portrait)', value: '832x1472' },
    { name: '1280x832 (3:2 Landscape)', value: '1280x832' },
    { name: '832x1280 (2:3 Portrait)', value: '832x1280' },
    { name: '1152x896 (4:3 Landscape)', value: '1152x896' },
    { name: '896x1152 (3:4 Portrait)', value: '896x1152' },
    { name: '512x512 (1:1 Small)', value: '512x512' },
  ],
};

export const imageQualityOptions: Record<string, INodePropertyOptions[]> = {
  openai: [
    { name: 'Low (Fastest)', value: 'low' },
    { name: 'Medium (Balanced)', value: 'medium', description: 'Default' },
    { name: 'High (Best Quality)', value: 'high' },
  ],
  leonardo: [
    { name: 'Fast (No Alchemy)', value: 'fast' },
    { name: 'Standard (Alchemy v1)', value: 'standard', description: 'Default' },
    { name: 'High (Alchemy v2)', value: 'high' },
  ],
};

export const imageStyleOptions: Record<string, INodePropertyOptions[]> = {
  // No providers currently support style (gpt-image-1 removed style support)
};

// Configuration metadata
export const configVersion = '1.0';
export const configUpdatedAt = '2026-02-05T12:00:00Z';
