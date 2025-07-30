#!/usr/bin/env node

import { build } from 'esbuild';
import fs from 'fs';

console.log('Building for Netlify deployment...');

// Create the serverless function
console.log('Creating serverless function...');

// Ensure netlify/functions directory exists
const functionsDir = 'netlify/functions';
if (!fs.existsSync(functionsDir)) {
  fs.mkdirSync(functionsDir, { recursive: true });
}

// Bundle the serverless function
await build({
  entryPoints: ['netlify/functions/api.js'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: 'netlify/functions/api.mjs',
  external: ['@neondatabase/serverless', 'ws', 'bcrypt'],
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});

console.log('✅ Netlify build complete!');
console.log('📁 Static files: dist/public');
console.log('⚡ Serverless function: netlify/functions/api.mjs');