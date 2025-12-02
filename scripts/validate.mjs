#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { cwd: root, ...opts }, (err, stdout, stderr) => {
      if (err) {
        err.stdout = stdout;
        err.stderr = stderr;
        return reject(err);
      }
      resolve({ stdout, stderr });
    });
  });
}

async function readJson(file) {
  const s = await fs.readFile(file, 'utf8');
  return JSON.parse(s);
}

function fail(msg) {
  console.error(`TEST FAILED: ${msg}`);
  process.exitCode = 1;
}

async function main() {
  // 1) Basic package.json sanity
  const pkgPath = path.join(root, 'package.json');
  const pkg = await readJson(pkgPath);

  if (!pkg.name || !/^(@[\w-]+\/)?n8n-nodes-/.test(pkg.name)) {
    fail('package.json name must start with n8n-nodes-* (or be scoped)');
  }
  if (!pkg.n8n || !pkg.n8n.nodes || !Array.isArray(pkg.n8n.nodes) || pkg.n8n.nodes.length === 0) {
    fail('n8n.nodes array must be present with at least one node');
  }
  if (!pkg.files || !pkg.files.includes('dist')) {
    fail('package.json files must include only dist for publish');
  }

  // 2) Dist presence sanity
  const distDir = path.join(root, 'dist');
  try {
    await fs.access(distDir);
  } catch {
    fail('dist/ directory missing. Did you run build?');
  }

  // Required files
  const required = [
    'dist/credentials/DemetericsApi.credentials.js',
    'dist/nodes/DemetericsChat/DemetericsChat.node.js',
    'dist/nodes/DemetericsCohort/DemetericsCohort.node.js',
    'dist/nodes/DemetericsExtract/DemetericsExtract.node.js',
  ];
  for (const rel of required) {
    const p = path.join(root, rel);
    try {
      await fs.access(p);
    } catch {
      fail(`Missing required build artifact: ${rel}`);
    }
  }

  // 3) Scan built JS for disallowed patterns
  const disallowed = [
    "@langchain/",
    "require('fs')",
    'require("fs")',
    "require('child_process')",
    'require("child_process")',
    'requestWithAuthentication(', // deprecated
  ];
  const jsGlobs = [
    'dist/nodes/DemetericsChat/DemetericsChat.node.js',
    'dist/nodes/DemetericsCohort/DemetericsCohort.node.js',
    'dist/nodes/DemetericsExtract/DemetericsExtract.node.js',
  ];
  for (const rel of jsGlobs) {
    const p = path.join(root, rel);
    const s = await fs.readFile(p, 'utf8');
    for (const bad of disallowed) {
      if (s.includes(bad)) fail(`Disallowed pattern '${bad}' in ${rel}`);
    }
  }

  // 4) Pack tarball and validate contents and size
  let tarball;
  try {
    const { stdout } = await run('npm', ['pack']);
    const lines = stdout.trim().split(/\r?\n/);
    tarball = lines[lines.length - 1].trim();
  } catch (err) {
    console.error(err.stderr || err);
    fail('npm pack failed');
    return;
  }

  // Check tarball size (soft threshold 500KB)
  const tbPath = path.join(root, tarball);
  const st = await fs.stat(tbPath);
  const KB = Math.round(st.size / 1024);
  if (st.size > 500 * 1024) fail(`Tarball too large: ${KB}KB (>500KB)`);

  // List files inside tarball and check only dist + readme/license/pkg
  const { stdout: list } = await run('tar', ['-tzf', tarball]);
  const files = list.trim().split(/\r?\n/);
  const allowedRoots = ['package/dist/', 'package/README.md', 'package/LICENSE', 'package/package.json'];
  for (const f of files) {
    if (!allowedRoots.some((a) => f.startsWith(a))) fail(`Unexpected file in tarball: ${f}`);
  }

  // 5) Asset sanity: only small svg/png in dist/credentials and dist/nodes subfolders
  for (const f of files) {
    if (f.match(/\.(png|svg)$/)) {
      const onDisk = path.join(root, f.replace(/^package\//, ''));
      const st2 = await fs.stat(onDisk);
      if (st2.size > 200 * 1024) fail(`Asset too large: ${f} (${Math.round(st2.size / 1024)}KB)`);
    }
  }

  // Cleanup tarball after validation
  await fs.unlink(tbPath).catch(() => {});

  if (process.exitCode === 0 || process.exitCode === undefined) {
    console.log('All validations passed.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

