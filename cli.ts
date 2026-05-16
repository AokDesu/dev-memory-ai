#!/usr/bin/env node
// Load .env.local then .env from CWD (for API keys)
import { existsSync } from 'fs';
import { resolve } from 'path';
const envFiles = ['.env.local', '.env'];
for (const f of envFiles) {
  const p = resolve(process.cwd(), f);
  if (existsSync(p)) {
    const { config } = await import('dotenv');
    config({ path: p });
    break;
  }
}

import { program } from 'commander';
import { initCmd } from './src/cli/commands/init.js';
import { askCmd } from './src/cli/commands/ask.js';
import { searchCmd } from './src/cli/commands/search.js';
import { watchCmd } from './src/cli/commands/watch.js';
import { statusCmd } from './src/cli/commands/status.js';
import { mcpCmd } from './src/cli/commands/mcp.js';

program
  .name('memory-dev')
  .description('AI-powered semantic memory for your codebase')
  .version('1.0.0');

program.addCommand(initCmd);
program.addCommand(askCmd);
program.addCommand(searchCmd);
program.addCommand(watchCmd);
program.addCommand(statusCmd);
program.addCommand(mcpCmd);

program.parse();
