#!/usr/bin/env npx ts-node
/**
 * Fetch configuration from Demeterics API and generate TypeScript constants.
 *
 * Usage:
 *   npx ts-node scripts/fetch-config.ts [--url <api-url>] [--output <output-file>]
 *
 * Options:
 *   --url     API base URL (default: https://api.demeterics.com)
 *   --output  Output file path (default: nodes/generated/config.ts)
 *
 * This script fetches the service configuration from /config/v1/services
 * and generates TypeScript types and constants for use in n8n nodes.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

// Parse command line arguments
const args = process.argv.slice(2);
let apiUrl = 'https://api.demeterics.com';
let outputFile = 'nodes/generated/config.ts';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--url' && args[i + 1]) {
    apiUrl = args[++i];
  } else if (args[i] === '--output' && args[i + 1]) {
    outputFile = args[++i];
  }
}

interface SizeOption {
  value: string;
  display_name: string;
  aspect_ratio: string;
}

interface ImageModel {
  id: string;
  display_name: string;
  default?: boolean;
  pricing: Record<string, number>;
}

interface ImageProvider {
  id: string;
  display_name: string;
  models: ImageModel[];
  sizes: SizeOption[];
  aspect_ratios?: string[];
  max_prompt_len: number;
  max_images: number;
  supports_negative_prompt: boolean;
}

interface ParameterOption {
  value: string;
  display_name: string;
  default?: boolean;
}

interface ParameterRange {
  min: number;
  max: number;
  default: number;
}

interface ImageParameters {
  quality: ParameterOption[];
  style: ParameterOption[];
  n: ParameterRange;
  seed: ParameterRange;
}

interface ImageConfig {
  providers: ImageProvider[];
  parameters: ImageParameters;
}

interface Voice {
  id: string;
  display_name: string;
  default?: boolean;
}

interface TTSModel {
  id: string;
  display_name: string;
  default?: boolean;
  price_per_char: number;
}

interface TTSProvider {
  id: string;
  display_name: string;
  models: TTSModel[];
  voices: Voice[];
  formats: string[];
  max_chars: number;
}

interface ParameterRangeFloat {
  min: number;
  max: number;
  default: number;
}

interface TTSParameters {
  speed: ParameterRangeFloat;
}

interface TTSConfig {
  providers: TTSProvider[];
  parameters: TTSParameters;
}

interface ChatModel {
  id: string;
  display_name?: string;
  category: string;
  context_window?: number;
  max_completion?: number;
  input_per_1k: number;
  output_per_1k: number;
  cached_per_1k?: number;
  enabled: boolean;
  note?: string;
}

interface ChatProvider {
  id: string;
  display_name: string;
  base_url: string;
  models: ChatModel[];
}

interface ChatConfig {
  providers: ChatProvider[];
}

interface ServiceConfig {
  version: string;
  updated_at: string;
  chat: ChatConfig;
  image: ImageConfig;
  tts: TTSConfig;
}

function fetch(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

function generateTypeScript(config: ServiceConfig): string {
  const lines: string[] = [];

  lines.push('/**');
  lines.push(' * Auto-generated configuration from Demeterics API');
  lines.push(` * Generated: ${new Date().toISOString()}`);
  lines.push(` * API Version: ${config.version}`);
  lines.push(` * API Updated: ${config.updated_at}`);
  lines.push(' * ');
  lines.push(' * DO NOT EDIT MANUALLY - Run "npm run fetch-config" to regenerate');
  lines.push(' */');
  lines.push('');
  lines.push("import type { INodePropertyOptions } from 'n8n-workflow';");
  lines.push('');

  // Generate Image config
  lines.push('// =============================================================================');
  lines.push('// Image Generation Configuration');
  lines.push('// =============================================================================');
  lines.push('');

  // Provider options
  lines.push('export const imageProviderOptions: INodePropertyOptions[] = [');
  for (const provider of config.image.providers) {
    lines.push(`  { name: '${provider.display_name}', value: '${provider.id}' },`);
  }
  lines.push('];');
  lines.push('');

  // Model options per provider
  lines.push('export const imageModelOptions: Record<string, INodePropertyOptions[]> = {');
  for (const provider of config.image.providers) {
    lines.push(`  ${provider.id}: [`);
    for (const model of provider.models) {
      const defaultStr = model.default ? ', description: "Default"' : '';
      lines.push(`    { name: '${escapeString(model.display_name)}', value: '${model.id}'${defaultStr} },`);
    }
    lines.push('  ],');
  }
  lines.push('};');
  lines.push('');

  // Size options per provider
  lines.push('export const imageSizeOptions: Record<string, INodePropertyOptions[]> = {');
  for (const provider of config.image.providers) {
    lines.push(`  ${provider.id}: [`);
    for (const size of provider.sizes) {
      lines.push(`    { name: '${escapeString(size.display_name)}', value: '${size.value}' },`);
    }
    lines.push('  ],');
  }
  lines.push('};');
  lines.push('');

  // Default models per provider
  lines.push('export const imageDefaultModels: Record<string, string> = {');
  for (const provider of config.image.providers) {
    const defaultModel = provider.models.find(m => m.default) || provider.models[0];
    if (defaultModel) {
      lines.push(`  ${provider.id}: '${defaultModel.id}',`);
    }
  }
  lines.push('};');
  lines.push('');

  // Provider features
  lines.push('export const imageProviderFeatures: Record<string, { supportsNegativePrompt: boolean; maxImages: number; maxPromptLen: number }> = {');
  for (const provider of config.image.providers) {
    lines.push(`  ${provider.id}: { supportsNegativePrompt: ${provider.supports_negative_prompt}, maxImages: ${provider.max_images}, maxPromptLen: ${provider.max_prompt_len} },`);
  }
  lines.push('};');
  lines.push('');

  // Quality options (from parameters)
  lines.push('export const imageQualityOptions: INodePropertyOptions[] = [');
  for (const opt of config.image.parameters.quality) {
    const defaultStr = opt.default ? ', description: "Default"' : '';
    lines.push(`  { name: '${escapeString(opt.display_name)}', value: '${opt.value}'${defaultStr} },`);
  }
  lines.push('];');
  lines.push('');

  // Style options (from parameters)
  lines.push('export const imageStyleOptions: INodePropertyOptions[] = [');
  for (const opt of config.image.parameters.style) {
    const defaultStr = opt.default ? ', description: "Default"' : '';
    lines.push(`  { name: '${escapeString(opt.display_name)}', value: '${opt.value}'${defaultStr} },`);
  }
  lines.push('];');
  lines.push('');

  // Parameter ranges
  lines.push(`export const imageNRange = { min: ${config.image.parameters.n.min}, max: ${config.image.parameters.n.max}, default: ${config.image.parameters.n.default} };`);
  lines.push(`export const imageSeedRange = { min: ${config.image.parameters.seed.min}, max: ${config.image.parameters.seed.max}, default: ${config.image.parameters.seed.default} };`);
  lines.push('');

  // Generate TTS config
  lines.push('// =============================================================================');
  lines.push('// Text-to-Speech Configuration');
  lines.push('// =============================================================================');
  lines.push('');

  // Provider options
  lines.push('export const ttsProviderOptions: INodePropertyOptions[] = [');
  for (const provider of config.tts.providers) {
    lines.push(`  { name: '${provider.display_name}', value: '${provider.id}' },`);
  }
  lines.push('];');
  lines.push('');

  // Model options per provider
  lines.push('export const ttsModelOptions: Record<string, INodePropertyOptions[]> = {');
  for (const provider of config.tts.providers) {
    lines.push(`  ${provider.id}: [`);
    for (const model of provider.models) {
      const defaultStr = model.default ? ', description: "Default"' : '';
      lines.push(`    { name: '${escapeString(model.display_name)}', value: '${model.id}'${defaultStr} },`);
    }
    lines.push('  ],');
  }
  lines.push('};');
  lines.push('');

  // Voice options per provider
  lines.push('export const ttsVoiceOptions: Record<string, INodePropertyOptions[]> = {');
  for (const provider of config.tts.providers) {
    lines.push(`  ${provider.id}: [`);
    for (const voice of provider.voices) {
      const defaultStr = voice.default ? ', description: "Default"' : '';
      lines.push(`    { name: '${escapeString(voice.display_name)}', value: '${voice.id}'${defaultStr} },`);
    }
    lines.push('  ],');
  }
  lines.push('};');
  lines.push('');

  // Format options per provider
  lines.push('export const ttsFormatOptions: Record<string, INodePropertyOptions[]> = {');
  for (const provider of config.tts.providers) {
    lines.push(`  ${provider.id}: [`);
    for (const format of provider.formats) {
      lines.push(`    { name: '${format}', value: '${format.toLowerCase()}' },`);
    }
    lines.push('  ],');
  }
  lines.push('};');
  lines.push('');

  // Default models per provider
  lines.push('export const ttsDefaultModels: Record<string, string> = {');
  for (const provider of config.tts.providers) {
    const defaultModel = provider.models.find(m => m.default) || provider.models[0];
    if (defaultModel) {
      lines.push(`  ${provider.id}: '${defaultModel.id}',`);
    }
  }
  lines.push('};');
  lines.push('');

  // Default voices per provider
  lines.push('export const ttsDefaultVoices: Record<string, string> = {');
  for (const provider of config.tts.providers) {
    const defaultVoice = provider.voices.find(v => v.default) || provider.voices[0];
    if (defaultVoice) {
      lines.push(`  ${provider.id}: '${defaultVoice.id}',`);
    }
  }
  lines.push('};');
  lines.push('');

  // Provider features
  lines.push('export const ttsProviderFeatures: Record<string, { maxChars: number }> = {');
  for (const provider of config.tts.providers) {
    lines.push(`  ${provider.id}: { maxChars: ${provider.max_chars} },`);
  }
  lines.push('};');
  lines.push('');

  // Speed range
  lines.push(`export const ttsSpeedRange = { min: ${config.tts.parameters.speed.min}, max: ${config.tts.parameters.speed.max}, default: ${config.tts.parameters.speed.default} };`);
  lines.push('');

  // Generate Chat config
  lines.push('// =============================================================================');
  lines.push('// Chat/LLM Configuration');
  lines.push('// =============================================================================');
  lines.push('');

  // Provider options
  lines.push('export const chatProviderOptions: INodePropertyOptions[] = [');
  for (const provider of config.chat.providers) {
    lines.push(`  { name: '${provider.display_name}', value: '${provider.id}' },`);
  }
  lines.push('];');
  lines.push('');

  // Model options per provider (only enabled chat models)
  lines.push('export const chatModelOptions: Record<string, INodePropertyOptions[]> = {');
  for (const provider of config.chat.providers) {
    const chatModels = provider.models.filter(m => m.enabled && m.category === 'chat');
    lines.push(`  ${provider.id}: [`);
    for (const model of chatModels) {
      const displayName = model.display_name || model.id;
      lines.push(`    { name: '${escapeString(displayName)}', value: '${model.id}' },`);
    }
    lines.push('  ],');
  }
  lines.push('};');
  lines.push('');

  // Provider base URLs
  lines.push('export const chatProviderBaseUrls: Record<string, string> = {');
  for (const provider of config.chat.providers) {
    lines.push(`  ${provider.id}: '${provider.base_url}',`);
  }
  lines.push('};');
  lines.push('');

  // Export config metadata
  lines.push('// Configuration metadata');
  lines.push(`export const configVersion = '${config.version}';`);
  lines.push(`export const configUpdatedAt = '${config.updated_at}';`);
  lines.push('');

  return lines.join('\n');
}

function escapeString(str: string): string {
  return str.replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

async function main() {
  console.log(`Fetching configuration from ${apiUrl}/config/v1/services...`);

  try {
    const response = await fetch(`${apiUrl}/config/v1/services`);
    const config: ServiceConfig = JSON.parse(response);

    console.log(`API Version: ${config.version}`);
    console.log(`Updated: ${config.updated_at}`);
    console.log(`Chat providers: ${config.chat.providers.length}`);
    console.log(`Image providers: ${config.image.providers.length}`);
    console.log(`TTS providers: ${config.tts.providers.length}`);

    // Generate TypeScript
    const typescript = generateTypeScript(config);

    // Ensure output directory exists
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write output file
    fs.writeFileSync(outputFile, typescript);
    console.log(`\nGenerated: ${outputFile}`);

    // Also save raw JSON for reference
    const jsonFile = outputFile.replace(/\.ts$/, '.json');
    fs.writeFileSync(jsonFile, JSON.stringify(config, null, 2));
    console.log(`Saved raw config: ${jsonFile}`);

  } catch (error) {
    console.error('Error fetching configuration:', error);
    process.exit(1);
  }
}

main();
