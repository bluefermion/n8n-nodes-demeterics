#!/usr/bin/env node
/**
 * Build script to generate two npm package variants:
 *
 * 1. n8n-nodes-demeterics-lite - Verified community node (no LangChain, n8n Cloud compatible)
 * 2. n8n-nodes-demeterics      - Full version (includes ChatModel with LangChain, self-hosted only)
 *
 * Usage:
 *   node scripts/build-variants.mjs [lite|full|both]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Read the base package.json
const packageJsonPath = path.join(rootDir, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Nodes that require LangChain (excluded from lite version)
const LANGCHAIN_NODES = [
  'dist/nodes/DemetericsChatModel/DemetericsChatModel.node.js'
];

// Dependencies that are not allowed in lite version
const LANGCHAIN_DEPENDENCIES = [
  '@langchain/openai'
];

// Keywords to remove from lite version
const LANGCHAIN_KEYWORDS = [
  'langchain',
  'chat-model'
];

/**
 * Clean package.json for distribution (remove dev-only scripts and deps)
 */
function cleanForDistribution(pkg) {
  // Remove scripts that reference source files (not present in dist)
  delete pkg.scripts;

  // Remove dev dependencies (not needed for published package)
  delete pkg.devDependencies;

  // Remove packageManager (not needed for consumers)
  delete pkg.packageManager;

  return pkg;
}

/**
 * Generate the lite package.json (n8n Cloud compatible, no LangChain)
 */
function generateLitePackage() {
  const lite = JSON.parse(JSON.stringify(packageJson));

  // Change package name
  lite.name = 'n8n-nodes-demeterics-lite';

  // Update description
  lite.description = 'n8n community node for Demeterics LLM Gateway - Access multiple AI providers through a unified API with built-in observability and cost tracking. (Lite version for n8n Cloud)';

  // Remove LangChain-related keywords
  lite.keywords = lite.keywords.filter(k => !LANGCHAIN_KEYWORDS.includes(k));
  lite.keywords.push('n8n-cloud-compatible', 'lite');

  // Remove LangChain nodes from n8n.nodes
  lite.n8n.nodes = lite.n8n.nodes.filter(n => !LANGCHAIN_NODES.includes(n));

  // Update main entry point (since ChatModel is removed)
  lite.main = 'dist/nodes/DemetericsChat/DemetericsChat.node.js';

  // Remove LangChain dependencies
  if (lite.dependencies) {
    for (const dep of LANGCHAIN_DEPENDENCIES) {
      delete lite.dependencies[dep];
    }
    // Remove dependencies object if empty
    if (Object.keys(lite.dependencies).length === 0) {
      delete lite.dependencies;
    }
  }

  // Clean for distribution
  return cleanForDistribution(lite);
}

/**
 * Generate the full package.json (self-hosted, includes LangChain)
 */
function generateFullPackage() {
  const full = JSON.parse(JSON.stringify(packageJson));
  // Clean for distribution
  return cleanForDistribution(full);
}

/**
 * Write package.json variant to a staging directory
 */
function writeVariant(variant, name, isLite = false) {
  const stagingDir = path.join(rootDir, 'dist-variants', name);

  // Create staging directory
  fs.mkdirSync(stagingDir, { recursive: true });

  // Write package.json
  const outputPath = path.join(stagingDir, 'package.json');
  fs.writeFileSync(outputPath, JSON.stringify(variant, null, 2) + '\n');

  // Copy dist folder (exclude ChatModel for lite version)
  const srcDist = path.join(rootDir, 'dist');
  const destDist = path.join(stagingDir, 'dist');
  const excludeDirs = isLite ? ['DemetericsChatModel'] : [];

  if (fs.existsSync(srcDist)) {
    copyDirSync(srcDist, destDist, excludeDirs);
  }

  // Copy LICENSE
  const licenseSrc = path.join(rootDir, 'LICENSE');
  if (fs.existsSync(licenseSrc)) {
    fs.copyFileSync(licenseSrc, path.join(stagingDir, 'LICENSE'));
  }

  // Copy and modify README
  const readmeSrc = path.join(rootDir, 'README.md');
  if (fs.existsSync(readmeSrc)) {
    let readme = fs.readFileSync(readmeSrc, 'utf8');

    if (isLite) {
      // Add lite version notice at the top
      const liteNotice = `> **Note:** This is the **lite** version for n8n Cloud. It excludes the Demeterics Chat Model node (which requires LangChain).
> For the full version with all nodes, use [\`n8n-nodes-demeterics\`](https://www.npmjs.com/package/n8n-nodes-demeterics) (self-hosted only).

`;
      // Insert after the first heading
      readme = readme.replace(/^(# .+\n)/, `$1\n${liteNotice}`);
    } else {
      // Add full version notice
      const fullNotice = `> **Note:** This is the **full** version for self-hosted n8n. It includes all nodes including the Demeterics Chat Model (LangChain-based).
> For n8n Cloud, use [\`n8n-nodes-demeterics-lite\`](https://www.npmjs.com/package/n8n-nodes-demeterics-lite).

`;
      readme = readme.replace(/^(# .+\n)/, `$1\n${fullNotice}`);
    }

    fs.writeFileSync(path.join(stagingDir, 'README.md'), readme);
  }

  console.log(`Generated ${name} package at ${stagingDir}`);
  return stagingDir;
}

/**
 * Recursively copy a directory, with optional exclusions
 */
function copyDirSync(src, dest, excludeDirs = []) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Skip excluded directories
      if (excludeDirs.includes(entry.name)) {
        continue;
      }
      copyDirSync(srcPath, destPath, excludeDirs);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const variant = args[0] || 'both';

  console.log('Building n8n-nodes-demeterics package variants...\n');

  // Clean previous variants
  const variantsDir = path.join(rootDir, 'dist-variants');
  if (fs.existsSync(variantsDir)) {
    fs.rmSync(variantsDir, { recursive: true });
  }

  const results = {};

  if (variant === 'lite' || variant === 'both') {
    const litePackage = generateLitePackage();
    results.lite = writeVariant(litePackage, 'n8n-nodes-demeterics-lite', true);
    console.log(`  - Nodes: ${litePackage.n8n.nodes.length}`);
    console.log(`  - Dependencies: ${litePackage.dependencies ? Object.keys(litePackage.dependencies).join(', ') : 'none'}`);
    console.log('');
  }

  if (variant === 'full' || variant === 'both') {
    const fullPackage = generateFullPackage();
    results.full = writeVariant(fullPackage, 'n8n-nodes-demeterics', false);
    console.log(`  - Nodes: ${fullPackage.n8n.nodes.length}`);
    console.log(`  - Dependencies: ${fullPackage.dependencies ? Object.keys(fullPackage.dependencies).join(', ') : 'none'}`);
    console.log('');
  }

  console.log('Build complete!');
  console.log('\nNext steps:');
  if (results.lite) {
    console.log(`  cd ${results.lite} && npm publish --access public`);
  }
  if (results.full) {
    console.log(`  cd ${results.full} && npm publish --access public`);
  }

  return results;
}

main();
