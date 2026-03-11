#!/usr/bin/env node

import { resolve } from 'node:path';
import { search } from '../lib/search.js';

function parse_args(argv) {
  const args = argv.slice(2);
  const opts = { vault: process.cwd(), limit: 20, json: false, file: null, command: null };

  let i = 0;
  if (args[i] && !args[i].startsWith('-')) {
    opts.command = args[i++];
  }
  if (args[i] && !args[i].startsWith('-')) {
    opts.file = args[i++];
  }

  while (i < args.length) {
    const arg = args[i];
    if (arg === '--vault' && args[i + 1]) {
      opts.vault = resolve(args[++i]);
    } else if (arg === '--limit' && args[i + 1]) {
      opts.limit = parseInt(args[++i], 10);
    } else if (arg === '--json') {
      opts.json = true;
    } else if (arg === '--help' || arg === '-h') {
      opts.command = 'help';
    }
    i++;
  }

  return opts;
}

function print_usage() {
  console.log(`Usage: smart-connections search <file-path> [options]

Arguments:
  file-path       Path to a note relative to vault root (e.g. "20-Projects/note.md")

Options:
  --vault <path>  Path to the Obsidian vault (default: current directory)
  --limit <n>     Number of results to return (default: 20)
  --json          Output results as a JSON array
  --help, -h      Show this help message`);
}

async function main() {
  const opts = parse_args(process.argv);

  if (opts.command === 'help' || !opts.command) {
    print_usage();
    process.exit(opts.command === 'help' ? 0 : 1);
  }

  if (opts.command !== 'search') {
    console.error(`Unknown command: ${opts.command}`);
    print_usage();
    process.exit(1);
  }

  if (!opts.file) {
    console.error('Error: file path is required');
    print_usage();
    process.exit(1);
  }

  try {
    const results = await search(opts.vault, opts.file, { limit: opts.limit });

    if (opts.json) {
      console.log(JSON.stringify(results));
    } else {
      for (const { score, path } of results) {
        console.log(`${score.toFixed(4)}  ${path}`);
      }
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();
