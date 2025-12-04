/**
 * Auto-generated configuration from Demeterics API
 * Generated: 2024-12-04T17:00:00.000Z
 * API Version: 1.0
 * API Updated: 2024-12-04T17:00:00.000Z
 *
 * DO NOT EDIT MANUALLY - Run "npm run fetch-config" to regenerate
 */

import type { INodePropertyOptions } from 'n8n-workflow';

// =============================================================================
// Image Generation Configuration
// =============================================================================

export const imageProviderOptions: INodePropertyOptions[] = [
  { name: 'OpenAI Image Generation', value: 'openai' },
  { name: 'Google Imagen', value: 'google' },
  { name: 'Stability AI', value: 'stability' },
];

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

export const imageQualityOptions: Record<string, INodePropertyOptions[]> = {
  openai: [
    { name: 'Low (Fastest)', value: 'low' },
    { name: 'Medium (Balanced)', value: 'medium', description: 'Default' },
    { name: 'High (Best Quality)', value: 'high' },
  ],
};

export const imageStyleOptions: Record<string, INodePropertyOptions[]> = {
  // No providers currently support style (was DALL-E 3 only, gpt-image-1 doesn't support it)
};

export const imageNRange = { min: 1, max: 4, default: 1 };
export const imageSeedRange = { min: 0, max: 4294967295, default: 0 };

// =============================================================================
// Text-to-Speech Configuration
// =============================================================================

export const ttsProviderOptions: INodePropertyOptions[] = [
  { name: 'OpenAI TTS', value: 'openai' },
  { name: 'ElevenLabs', value: 'elevenlabs' },
  { name: 'Google Cloud TTS', value: 'google' },
  { name: 'Murf.ai', value: 'murf' },
];

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
    { name: 'Echo (Male)', value: 'echo' },
    { name: 'Fable (British)', value: 'fable' },
    { name: 'Onyx (Deep Male)', value: 'onyx' },
    { name: 'Nova (Female)', value: 'nova' },
    { name: 'Shimmer (Female)', value: 'shimmer' },
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
    { name: 'mp3', value: 'mp3' },
    { name: 'opus', value: 'opus' },
    { name: 'aac', value: 'aac' },
    { name: 'flac', value: 'flac' },
    { name: 'wav', value: 'wav' },
    { name: 'pcm', value: 'pcm' },
  ],
  elevenlabs: [
    { name: 'mp3_44100_128', value: 'mp3_44100_128' },
    { name: 'mp3_44100_192', value: 'mp3_44100_192' },
    { name: 'pcm_16000', value: 'pcm_16000' },
    { name: 'pcm_22050', value: 'pcm_22050' },
    { name: 'pcm_24000', value: 'pcm_24000' },
    { name: 'pcm_44100', value: 'pcm_44100' },
  ],
  google: [
    { name: 'MP3', value: 'mp3' },
    { name: 'LINEAR16', value: 'linear16' },
    { name: 'OGG_OPUS', value: 'ogg_opus' },
    { name: 'MULAW', value: 'mulaw' },
    { name: 'ALAW', value: 'alaw' },
  ],
  murf: [
    { name: 'MP3', value: 'mp3' },
    { name: 'WAV', value: 'wav' },
    { name: 'FLAC', value: 'flac' },
    { name: 'OGG', value: 'ogg' },
    { name: 'PCM', value: 'pcm' },
    { name: 'ALAW', value: 'alaw' },
    { name: 'ULAW', value: 'ulaw' },
  ],
};

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

export const ttsProviderFeatures: Record<string, { maxChars: number }> = {
  openai: { maxChars: 4096 },
  elevenlabs: { maxChars: 5000 },
  google: { maxChars: 5000 },
  murf: { maxChars: 10000 },
};

export const ttsSpeedRange = { min: 0.25, max: 4, default: 1 };

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
    { name: 'llama-3.3-70b-versatile', value: 'llama-3.3-70b-versatile' },
    { name: 'llama-3.1-8b-instant', value: 'llama-3.1-8b-instant' },
    { name: 'openai/gpt-oss-120b', value: 'openai/gpt-oss-120b' },
    { name: 'openai/gpt-oss-20b', value: 'openai/gpt-oss-20b' },
    { name: 'groq/compound', value: 'groq/compound' },
    { name: 'groq/compound-mini', value: 'groq/compound-mini' },
  ],
  openai: [
    { name: 'gpt-5', value: 'openai/gpt-5' },
    { name: 'gpt-5-mini', value: 'openai/gpt-5-mini' },
    { name: 'gpt-4o', value: 'openai/gpt-4o' },
    { name: 'gpt-4o-mini', value: 'openai/gpt-4o-mini' },
    { name: 'gpt-4.1', value: 'openai/gpt-4.1' },
    { name: 'gpt-4.1-mini', value: 'openai/gpt-4.1-mini' },
  ],
  anthropic: [
    { name: 'claude-opus-4-5', value: 'anthropic/claude-opus-4-5' },
    { name: 'claude-opus-4-1', value: 'anthropic/claude-opus-4-1' },
    { name: 'claude-sonnet-4-5', value: 'anthropic/claude-sonnet-4-5' },
    { name: 'claude-3-5-sonnet-20241022', value: 'anthropic/claude-3-5-sonnet-20241022' },
  ],
  gemini: [
    { name: 'gemini-2.5-flash', value: 'google/gemini-2.5-flash' },
    { name: 'gemini-2.5-pro', value: 'google/gemini-2.5-pro' },
    { name: 'gemini-2.0-flash', value: 'google/gemini-2.0-flash' },
  ],
  google: [
    { name: 'gemini-2.5-flash', value: 'google/gemini-2.5-flash' },
    { name: 'gemini-2.5-pro', value: 'google/gemini-2.5-pro' },
  ],
  openrouter: [
    { name: 'See OpenRouter for available models', value: '' },
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

// Configuration metadata
export const configVersion = '1.0';
export const configUpdatedAt = '2024-12-04T17:00:00.000Z';
