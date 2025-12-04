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
 * This script fetches the service configuration from /config/v1/services and
 * generates TypeScript types and constants for use in n8n nodes. The API returns
 * a self-describing schema that includes all parameter definitions, enabling
 * automatic n8n property generation.
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

// =============================================================================
// API Types - Schema-driven configuration
// =============================================================================

interface SelectOption {
  value: string;
  label: string;
  description?: string;
  default?: boolean;
}

interface Condition {
  field: string;
  in: string[];
}

interface ParameterDef {
  name: string;
  ui_name?: string;
  display_name: string;
  description?: string;
  placeholder?: string;
  type: 'string' | 'number' | 'options' | 'boolean';
  required?: boolean;
  default?: string | number | boolean;
  options?: SelectOption[];
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  max_length?: number;
  show_when?: Condition[];
  omit_if_empty?: boolean;
  omit_for?: string[];
}

interface TTSProviderSchemaV2 {
  id: string;
  display_name: string;
  parameters: ParameterDef[];
  api_reference?: string;
}

interface ImageProviderSchemaV2 {
  id: string;
  display_name: string;
  parameters: ParameterDef[];
  api_reference?: string;
}

interface TTSConfigV2 {
  providers: TTSProviderSchemaV2[];
}

interface ImageConfigV2 {
  providers: ImageProviderSchemaV2[];
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

interface ServiceConfigV2 {
  version: string;
  updated_at: string;
  tts: TTSConfigV2;
  image: ImageConfigV2;
  chat: ChatConfig;
}

// =============================================================================
// HTTP Fetch helper
// =============================================================================

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

// =============================================================================
// TypeScript Generator - Generates n8n INodeProperties from API schema
// =============================================================================

function generateTypeScript(config: ServiceConfigV2): string {
  const lines: string[] = [];

  lines.push('/**');
  lines.push(' * Auto-generated configuration from Demeterics API');
  lines.push(` * Generated: ${new Date().toISOString()}`);
  lines.push(` * API Version: ${config.version}`);
  lines.push(` * API Updated: ${config.updated_at}`);
  lines.push(' * ');
  lines.push(' * DO NOT EDIT MANUALLY - Run "npm run fetch-config" to regenerate');
  lines.push(' * ');
  lines.push(' * This configuration is generated from a self-describing API schema.');
  lines.push(' * The API defines all parameters, their types, validation rules,');
  lines.push(' * and conditional visibility - enabling automatic n8n node generation.');
  lines.push(' */');
  lines.push('');
  lines.push("import type { INodePropertyOptions, INodeProperties } from 'n8n-workflow';");
  lines.push('');

  // Generate TTS config
  lines.push('// =============================================================================');
  lines.push('// Text-to-Speech Configuration (V2 Schema)');
  lines.push('// =============================================================================');
  lines.push('');

  // TTS Provider options
  lines.push('export const ttsProviderOptions: INodePropertyOptions[] = [');
  for (const provider of config.tts.providers) {
    lines.push(`  { name: '${escapeString(provider.display_name)}', value: '${provider.id}' },`);
  }
  lines.push('];');
  lines.push('');

  // Generate TTS properties for each provider
  lines.push('/**');
  lines.push(' * TTS node properties generated from V2 schema.');
  lines.push(' * Each provider has its own set of properties with conditional visibility.');
  lines.push(' */');
  lines.push('export const ttsProperties: INodeProperties[] = [');

  // Provider selector
  lines.push('  {');
  lines.push("    displayName: 'Provider',");
  lines.push("    name: 'provider',");
  lines.push("    type: 'options',");
  lines.push("    default: 'openai',");
  lines.push('    options: ttsProviderOptions,');
  lines.push("    description: 'Select the TTS provider',");
  lines.push('  },');

  // Generate properties for each provider's parameters
  for (const provider of config.tts.providers) {
    lines.push(`  // --- ${provider.display_name} Parameters ---`);
    for (const param of provider.parameters) {
      const property = generateNodeProperty(param, provider.id, 'provider');
      if (property) {
        lines.push(property);
      }
    }
  }

  lines.push('];');
  lines.push('');

  // TTS defaults (for convenience)
  lines.push('export const ttsDefaultModels: Record<string, string> = {');
  for (const provider of config.tts.providers) {
    const modelParam = provider.parameters.find(p => p.name === 'model');
    if (modelParam && modelParam.default) {
      lines.push(`  ${provider.id}: '${modelParam.default}',`);
    }
  }
  lines.push('};');
  lines.push('');

  lines.push('export const ttsDefaultVoices: Record<string, string> = {');
  for (const provider of config.tts.providers) {
    const voiceParam = provider.parameters.find(p => p.name === 'voice');
    if (voiceParam && voiceParam.default) {
      lines.push(`  ${provider.id}: '${voiceParam.default}',`);
    }
  }
  lines.push('};');
  lines.push('');

  // TTS feature flags (for runtime use)
  lines.push('export const ttsProviderFeatures: Record<string, { maxChars: number; supportsSpeed: boolean; supportsLanguage: boolean; supportsInstructions: boolean }> = {');
  for (const provider of config.tts.providers) {
    const inputParam = provider.parameters.find(p => p.name === 'input');
    const maxChars = inputParam?.max_length || 4096;
    const speedParam = provider.parameters.find(p => p.name === 'speed');
    const supportsSpeed = speedParam && !speedParam.show_when?.some(c => c.field === 'provider'); // Has speed param
    const langParam = provider.parameters.find(p => p.name === 'language');
    const supportsLanguage = !!langParam;
    const instrParam = provider.parameters.find(p => p.name === 'instructions');
    const supportsInstructions = !!instrParam;
    lines.push(`  ${provider.id}: { maxChars: ${maxChars}, supportsSpeed: ${!!speedParam}, supportsLanguage: ${supportsLanguage}, supportsInstructions: ${supportsInstructions} },`);
  }
  lines.push('};');
  lines.push('');

  // Speed range
  const openaiProvider = config.tts.providers.find(p => p.id === 'openai');
  const speedParam = openaiProvider?.parameters.find(p => p.name === 'speed');
  const speedMin = speedParam?.min ?? 0.25;
  const speedMax = speedParam?.max ?? 4.0;
  const speedDefault = speedParam?.default ?? 1.0;
  lines.push(`export const ttsSpeedRange = { min: ${speedMin}, max: ${speedMax}, default: ${speedDefault} };`);
  lines.push('');

  // Generate Image config
  lines.push('// =============================================================================');
  lines.push('// Image Generation Configuration (V2 Schema)');
  lines.push('// =============================================================================');
  lines.push('');

  // Image Provider options
  lines.push('export const imageProviderOptions: INodePropertyOptions[] = [');
  for (const provider of config.image.providers) {
    lines.push(`  { name: '${escapeString(provider.display_name)}', value: '${provider.id}' },`);
  }
  lines.push('];');
  lines.push('');

  // Generate Image properties
  lines.push('/**');
  lines.push(' * Image node properties generated from V2 schema.');
  lines.push(' */');
  lines.push('export const imageProperties: INodeProperties[] = [');

  // Provider selector
  lines.push('  {');
  lines.push("    displayName: 'Provider',");
  lines.push("    name: 'provider',");
  lines.push("    type: 'options',");
  lines.push("    default: 'openai',");
  lines.push('    options: imageProviderOptions,');
  lines.push("    description: 'Select the image generation provider',");
  lines.push('  },');

  // Generate properties for each provider's parameters
  for (const provider of config.image.providers) {
    lines.push(`  // --- ${provider.display_name} Parameters ---`);
    for (const param of provider.parameters) {
      const property = generateNodeProperty(param, provider.id, 'provider');
      if (property) {
        lines.push(property);
      }
    }
  }

  lines.push('];');
  lines.push('');

  // Image defaults
  lines.push('export const imageDefaultModels: Record<string, string> = {');
  for (const provider of config.image.providers) {
    const modelParam = provider.parameters.find(p => p.name === 'model');
    if (modelParam && modelParam.default) {
      lines.push(`  ${provider.id}: '${modelParam.default}',`);
    }
  }
  lines.push('};');
  lines.push('');

  // Image feature flags
  lines.push('export const imageProviderFeatures: Record<string, { supportsNegativePrompt: boolean; supportsQuality: boolean; supportsStyle: boolean; maxImages: number; maxPromptLen: number }> = {');
  for (const provider of config.image.providers) {
    const negPrompt = provider.parameters.find(p => p.name === 'negative_prompt');
    const supportsNegative = !!negPrompt;
    const qualityParam = provider.parameters.find(p => p.name === 'quality');
    const supportsQuality = !!qualityParam;
    const styleParam = provider.parameters.find(p => p.name === 'style');
    const supportsStyle = !!styleParam;
    const nParam = provider.parameters.find(p => p.name === 'n');
    const maxImages = nParam?.max || 4;
    const promptParam = provider.parameters.find(p => p.name === 'prompt');
    const maxPromptLen = promptParam?.max_length || 4000;
    lines.push(`  ${provider.id}: { supportsNegativePrompt: ${supportsNegative}, supportsQuality: ${supportsQuality}, supportsStyle: ${supportsStyle}, maxImages: ${maxImages}, maxPromptLen: ${maxPromptLen} },`);
  }
  lines.push('};');
  lines.push('');

  // Image parameter ranges
  const openaiImage = config.image.providers.find(p => p.id === 'openai');
  const nParam = openaiImage?.parameters.find(p => p.name === 'n');
  const seedParam = openaiImage?.parameters.find(p => p.name === 'seed');
  lines.push(`export const imageNRange = { min: ${nParam?.min ?? 1}, max: ${nParam?.max ?? 4}, default: ${nParam?.default ?? 1} };`);
  lines.push(`export const imageSeedRange = { min: ${seedParam?.min ?? 0}, max: ${seedParam?.max ?? 4294967295}, default: ${seedParam?.default ?? 0} };`);
  lines.push('');

  // Generate Chat config (same as V1)
  lines.push('// =============================================================================');
  lines.push('// Chat/LLM Configuration');
  lines.push('// =============================================================================');
  lines.push('');

  lines.push('export const chatProviderOptions: INodePropertyOptions[] = [');
  for (const provider of config.chat.providers) {
    lines.push(`  { name: '${provider.display_name}', value: '${provider.id}' },`);
  }
  lines.push('];');
  lines.push('');

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

  lines.push('export const chatProviderBaseUrls: Record<string, string> = {');
  for (const provider of config.chat.providers) {
    lines.push(`  ${provider.id}: '${provider.base_url}',`);
  }
  lines.push('};');
  lines.push('');

  // Also generate legacy V1-style options for backward compatibility
  lines.push('// =============================================================================');
  lines.push('// Legacy V1-style exports (for backward compatibility)');
  lines.push('// =============================================================================');
  lines.push('');

  // TTS model options per provider
  lines.push('export const ttsModelOptions: Record<string, INodePropertyOptions[]> = {');
  for (const provider of config.tts.providers) {
    const modelParam = provider.parameters.find(p => p.name === 'model');
    if (modelParam?.options) {
      lines.push(`  ${provider.id}: [`);
      for (const opt of modelParam.options) {
        const defaultStr = opt.default ? ", description: 'Default'" : '';
        lines.push(`    { name: '${escapeString(opt.label)}', value: '${opt.value}'${defaultStr} },`);
      }
      lines.push('  ],');
    }
  }
  lines.push('};');
  lines.push('');

  // TTS voice options per provider
  lines.push('export const ttsVoiceOptions: Record<string, INodePropertyOptions[]> = {');
  for (const provider of config.tts.providers) {
    const voiceParam = provider.parameters.find(p => p.name === 'voice');
    if (voiceParam?.options) {
      lines.push(`  ${provider.id}: [`);
      for (const opt of voiceParam.options) {
        const defaultStr = opt.default ? ", description: 'Default'" : '';
        lines.push(`    { name: '${escapeString(opt.label)}', value: '${opt.value}'${defaultStr} },`);
      }
      lines.push('  ],');
    }
  }
  lines.push('};');
  lines.push('');

  // TTS format options per provider
  lines.push('export const ttsFormatOptions: Record<string, INodePropertyOptions[]> = {');
  for (const provider of config.tts.providers) {
    const formatParam = provider.parameters.find(p => p.name === 'format');
    if (formatParam?.options) {
      lines.push(`  ${provider.id}: [`);
      for (const opt of formatParam.options) {
        lines.push(`    { name: '${escapeString(opt.label)}', value: '${opt.value}' },`);
      }
      lines.push('  ],');
    }
  }
  lines.push('};');
  lines.push('');

  // Image model options per provider
  lines.push('export const imageModelOptions: Record<string, INodePropertyOptions[]> = {');
  for (const provider of config.image.providers) {
    const modelParam = provider.parameters.find(p => p.name === 'model');
    if (modelParam?.options) {
      lines.push(`  ${provider.id}: [`);
      for (const opt of modelParam.options) {
        const defaultStr = opt.default ? ", description: 'Default'" : '';
        lines.push(`    { name: '${escapeString(opt.label)}', value: '${opt.value}'${defaultStr} },`);
      }
      lines.push('  ],');
    }
  }
  lines.push('};');
  lines.push('');

  // Image size options per provider
  lines.push('export const imageSizeOptions: Record<string, INodePropertyOptions[]> = {');
  for (const provider of config.image.providers) {
    const sizeParam = provider.parameters.find(p => p.name === 'size');
    if (sizeParam?.options) {
      lines.push(`  ${provider.id}: [`);
      for (const opt of sizeParam.options) {
        lines.push(`    { name: '${escapeString(opt.label)}', value: '${opt.value}' },`);
      }
      lines.push('  ],');
    }
  }
  lines.push('};');
  lines.push('');

  // Image quality options
  lines.push('export const imageQualityOptions: Record<string, INodePropertyOptions[]> = {');
  for (const provider of config.image.providers) {
    const qualityParam = provider.parameters.find(p => p.name === 'quality');
    if (qualityParam?.options) {
      lines.push(`  ${provider.id}: [`);
      for (const opt of qualityParam.options) {
        const defaultStr = opt.default ? ", description: 'Default'" : '';
        lines.push(`    { name: '${escapeString(opt.label)}', value: '${opt.value}'${defaultStr} },`);
      }
      lines.push('  ],');
    }
  }
  lines.push('};');
  lines.push('');

  // Image style options
  lines.push('export const imageStyleOptions: Record<string, INodePropertyOptions[]> = {');
  lines.push('  // No providers currently support style (gpt-image-1 removed style support)');
  lines.push('};');
  lines.push('');

  // Config metadata
  lines.push('// Configuration metadata');
  lines.push(`export const configVersion = '${config.version}';`);
  lines.push(`export const configUpdatedAt = '${config.updated_at}';`);
  lines.push('');

  return lines.join('\n');
}

/**
 * Generate an n8n INodeProperties object from a ParameterDef.
 */
function generateNodeProperty(param: ParameterDef, providerId: string, providerField: string): string {
  const lines: string[] = [];
  const indent = '  ';

  // Use ui_name if provided, otherwise use name
  const fieldName = param.ui_name || param.name;

  lines.push(`${indent}{`);
  lines.push(`${indent}  displayName: '${escapeString(param.display_name)}',`);
  lines.push(`${indent}  name: '${fieldName}',`);

  // Map type
  if (param.type === 'string') {
    if (param.rows && param.rows > 1) {
      lines.push(`${indent}  type: 'string',`);
    } else {
      lines.push(`${indent}  type: 'string',`);
    }
  } else if (param.type === 'number') {
    lines.push(`${indent}  type: 'number',`);
  } else if (param.type === 'options') {
    lines.push(`${indent}  type: 'options',`);
  } else if (param.type === 'boolean') {
    lines.push(`${indent}  type: 'boolean',`);
  }

  // Default value
  if (param.default !== undefined) {
    if (typeof param.default === 'string') {
      lines.push(`${indent}  default: '${escapeString(param.default)}',`);
    } else {
      lines.push(`${indent}  default: ${param.default},`);
    }
  } else if (param.type === 'string') {
    lines.push(`${indent}  default: '',`);
  } else if (param.type === 'number') {
    lines.push(`${indent}  default: 0,`);
  } else if (param.type === 'boolean') {
    lines.push(`${indent}  default: false,`);
  }

  // Required
  if (param.required) {
    lines.push(`${indent}  required: true,`);
  }

  // Type options
  const typeOptions: string[] = [];
  if (param.rows && param.rows > 1) {
    typeOptions.push(`rows: ${param.rows}`);
  }
  if (param.min !== undefined && param.type === 'number') {
    typeOptions.push(`minValue: ${param.min}`);
  }
  if (param.max !== undefined && param.type === 'number') {
    typeOptions.push(`maxValue: ${param.max}`);
  }
  if (param.step !== undefined && param.type === 'number') {
    typeOptions.push(`numberStepSize: ${param.step}`);
  }
  if (typeOptions.length > 0) {
    lines.push(`${indent}  typeOptions: { ${typeOptions.join(', ')} },`);
  }

  // Options for select fields
  if (param.options && param.options.length > 0) {
    lines.push(`${indent}  options: [`);
    for (const opt of param.options) {
      const desc = opt.description ? `, description: '${escapeString(opt.description)}'` : '';
      lines.push(`${indent}    { name: '${escapeString(opt.label)}', value: '${opt.value}'${desc} },`);
    }
    lines.push(`${indent}  ],`);
  }

  // Placeholder
  if (param.placeholder) {
    lines.push(`${indent}  placeholder: '${escapeString(param.placeholder)}',`);
  }

  // Display options - always show for specific provider
  const displayConditions: string[] = [];
  displayConditions.push(`${providerField}: ['${providerId}']`);

  // Add show_when conditions
  if (param.show_when && param.show_when.length > 0) {
    for (const cond of param.show_when) {
      displayConditions.push(`${cond.field}: [${cond.in.map(v => `'${v}'`).join(', ')}]`);
    }
  }

  lines.push(`${indent}  displayOptions: { show: { ${displayConditions.join(', ')} } },`);

  // Description
  if (param.description) {
    lines.push(`${indent}  description: '${escapeString(param.description)}',`);
  }

  lines.push(`${indent}},`);

  return lines.join('\n');
}

function escapeString(str: string): string {
  return str.replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  const endpoint = '/config/v1/services';
  console.log(`Fetching configuration from ${apiUrl}${endpoint}...`);

  try {
    const response = await fetch(`${apiUrl}${endpoint}`);
    const config = JSON.parse(response) as ServiceConfigV2;

    console.log(`API Version: ${config.version}`);
    console.log(`Updated: ${config.updated_at}`);
    console.log(`TTS providers: ${config.tts.providers.length}`);
    console.log(`Image providers: ${config.image.providers.length}`);
    console.log(`Chat providers: ${config.chat.providers.length}`);

    // Generate TypeScript from schema
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
