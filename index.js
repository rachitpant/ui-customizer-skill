import Anthropic from '@anthropic-ai/sdk';
import { Agent } from '@anthropic-ai/agent-sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Tools
import { analyzeDandybreezeUI } from './tools/analyzeDandybreezeUI.js';
import { getCachedUIStructure } from './tools/getCachedUIStructure.js';
import { listFiles } from './tools/listFiles.js';
import { readFile } from './tools/readFile.js';
import { generateCSSChanges } from './tools/generateCSSChanges.js';
import { applyChanges } from './tools/applyChanges.js';
import { deployToCloudflare } from './tools/deployToCloudflare.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read skill configuration
const skillConfig = JSON.parse(
  await fs.readFile(path.join(__dirname, 'skill.json'), 'utf-8')
);

// Initialize Anthropic client
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Get user request from command line
const userRequest = process.argv[2];
if (!userRequest) {
  console.error('Usage: npm start "<UI changes to make>"');
  process.exit(1);
}

// Create agent with tools
const agent = new Agent({
  client,
  model: 'claude-sonnet-4-5-20250929',
  systemPrompt: skillConfig.instructions.join('\n'),
  tools: [
    analyzeDandybreezeUI,
    getCachedUIStructure,
    listFiles,
    readFile,
    generateCSSChanges,
    applyChanges,
    deployToCloudflare,
  ],
});

// Run the agent
console.log(`🎨 UI Customizer Skill Started`);
console.log(`📝 User Request: ${userRequest}\n`);

const result = await agent.run(userRequest);

console.log('\n✅ Customization Complete!');
console.log(result);
