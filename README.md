# smart-connections-cli

Give your coding agent semantic search over your [Obsidian](https://obsidian.md/) vault, powered embeddings created by the [Smart Connections plugin](https://github.com/brianpetro/obsidian-smart-connections).

Coding agents like [Claude Code](https://claude.ai/code), [Codex](https://github.com/openai/codex), and others can only discover related notes through manually-created links. This CLI lets them query the embedding vectors that Smart Connections has already computed for every note in your vault — finding semantically related notes from the command line, no Obsidian required.

Zero runtime dependencies. No model inference at query time.

## Install

### 1. Install the CLI

```bash
npm install -g smart-connections-cli
```

### 2. Install the Agent Skill

The included [Agent Skill](https://agentskills.io/) teaches your coding agent when and how to use the CLI. Install it with [`npx skills`](https://github.com/vercel-labs/skills):

```bash
npx skills add SamBoyd/smart-connections-cli
```

This works with any skills-compatible agent (Claude Code, Codex, Cursor, and [many more](https://agentskills.io/)).

## Prerequisites

An Obsidian vault with the [Smart Connections](https://obsidian.md/plugins?id=smart-connections) plugin installed and indexed. The plugin must have run at least once to generate the `.smart-env/` directory containing embedding data.

## Usage

```bash
smart-connections search <file-path> [options]
```

### Arguments

| Argument | Description |
|----------|-------------|
| `file-path` | Path to a note relative to the vault root (e.g. `Projects/note.md`) |

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `--vault <path>` | current directory | Path to the Obsidian vault |
| `--limit <n>` | `20` | Number of results to return |
| `--json` | off | Output as a JSON array |

### Examples

```bash
# Find the 10 most related notes
smart-connections search "Projects/my-note.md" --vault ~/Obsidian/MyVault --limit 10

# Output as JSON for piping into other tools
smart-connections search "Projects/my-note.md" --vault ~/Obsidian/MyVault --json

# Use from within the vault directory
cd ~/Obsidian/MyVault
smart-connections search "Projects/my-note.md"
```

### Output

Default (human-readable):

```
0.8339  20-Projects/experiments/git-retro.md
0.8183  40-Resources/notes/Experiment viability filter.md
0.8178  10-DailyNotes/2026/02/27.md
```

JSON (`--json`):

```json
[{"score":0.8339,"path":"20-Projects/experiments/git-retro.md"},{"score":0.8183,"path":"40-Resources/notes/Experiment viability filter.md"}]
```

## License

MIT
