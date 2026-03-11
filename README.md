# smart-connections-cli

A standalone CLI that queries [Smart Connections](https://github.com/brianpetro/obsidian-smart-connections) embeddings from an Obsidian vault. Find semantically related notes from the command line — no Obsidian required.

Smart Connections pre-computes embedding vectors for every note in your vault and stores them in `.smart-env/`. This tool reads those vectors and ranks notes by cosine similarity. Zero runtime dependencies.

## Install

```bash
npm install -g smart-connections-cli
```

Or clone and link locally:

```bash
git clone https://github.com/your-username/smart-connections-cli.git
cd smart-connections-cli
npm link
```

## Prerequisites

An Obsidian vault with the [Smart Connections](https://obsidian.md/plugins?id=smart-connections) plugin installed and indexed. The plugin must have run at least once to generate the `.smart-env/` directory containing embedding data.

## Usage

```bash
smart-connections search <file-path> [options]
```

### Arguments

| Argument | Description |
|----------|-------------|
| `file-path` | Path to a note relative to the vault root (e.g. `20-Projects/note.md`) |

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

## How it works

1. Reads `.smart-env/smart_env.json` to find the active embedding model
2. Parses `.smart-env/multi/*.ajson` files to load pre-computed embedding vectors
3. Looks up the target file's vector
4. Computes cosine similarity against every other indexed note
5. Returns the top results sorted by score

No model inference happens at query time — all embeddings are pre-computed by the Smart Connections Obsidian plugin.

## Development

```bash
npm install
npm test
```

## License

MIT
