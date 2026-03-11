---
name: smart-connections
description: Find semantically related Obsidian notes using pre-computed Smart Connections embeddings. Use when looking for notes related to a specific file, discovering semantic connections between notes, or exploring what content is similar to a given note. Triggers on requests about related notes, similar notes, semantic search, or finding connections.
allowed-tools: Bash(smart-connections:*)
compatibility: Requires smart-connections-cli (npm install -g smart-connections-cli) and an Obsidian vault with the Smart Connections plugin installed and indexed.
---

# Smart Connections Search

Find semantically related notes in an Obsidian vault by querying pre-computed embedding vectors from the Smart Connections plugin.

## When to use

- User asks for notes related to a specific file
- You want to discover what other notes are semantically similar to one you're reading
- Building context by finding thematically connected notes
- User mentions "smart connections", "related notes", "similar notes", or "semantic search"

## Prerequisites

- `smart-connections-cli` must be installed (`npm install -g smart-connections-cli`)
- The Obsidian vault must have the [Smart Connections](https://obsidian.md/plugins?id=smart-connections) plugin installed and indexed (a `.smart-env/` directory must exist in the vault root)

## Usage

```bash
smart-connections search <file-path> [--vault <path>] [--limit <n>] [--json]
```

- `<file-path>` — path to a note relative to the vault root (e.g. `20-Projects/my-note.md`)
- `--vault <path>` — path to the Obsidian vault (defaults to the current working directory)
- `--limit <n>` — number of results to return (default: 20)
- `--json` — output as a JSON array instead of human-readable lines

## Examples

Find the 10 most related notes:

```bash
smart-connections search "Projects/my-note.md" --vault /path/to/vault --limit 10
```

Get results as JSON:

```bash
smart-connections search "Projects/my-note.md" --vault /path/to/vault --json
```

If already in the vault directory:

```bash
smart-connections search "Projects/my-note.md"
```

## Interpreting results

Default output shows a similarity score and file path per line:

```
0.8339  20-Projects/experiments/git-retro.md
0.8183  40-Resources/notes/Experiment viability filter.md
0.8178  10-DailyNotes/2026/02/27.md
```

- Scores range from -1 to 1 (higher = more similar)
- Scores above 0.80 indicate strong semantic similarity
- The target file itself is excluded from results

JSON output (`--json`):

```json
[{"score":0.8339,"path":"20-Projects/experiments/git-retro.md"},{"score":0.8183,"path":"40-Resources/notes/Experiment viability filter.md"}]
```

## Common patterns

**Build context for a task:** Search for related notes, then read the top results to gather relevant background.

```bash
# Find related notes
smart-connections search "20-Projects/my-project.md" --vault /path/to/vault --limit 5 --json
# Then read the top results to build context
```

**Discover connections across areas:** Use search to find unexpected links between notes in different folders or topics.
