import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { resolve_env } from './resolve_env.js';
import { parse_ajson_file } from './ajson.js';
import { cos_sim } from './cos_sim.js';

/**
 * Search for notes similar to a target file using pre-computed embeddings.
 * @param {string} vault_path - Absolute path to the Obsidian vault root.
 * @param {string} target_file - Note path relative to vault root (e.g. "20-Projects/note.md").
 * @param {{ limit?: number }} opts
 * @returns {Promise<Array<{ score: number, path: string }>>}
 */
export async function search(vault_path, target_file, { limit = 20 } = {}) {
  const { env_dir, model_key } = await resolve_env(vault_path);

  const multi_dir = join(env_dir, 'multi');
  const files = await readdir(multi_dir);
  const ajson_files = files.filter(f => f.endsWith('.ajson'));

  // Load all source vectors
  const vectors = new Map(); // path → vec
  for (const file of ajson_files) {
    const entries = await parse_ajson_file(join(multi_dir, file));
    for (const [key, data] of entries) {
      if (!key.startsWith('smart_sources:')) continue;
      const path = data.path;
      const vec = data.embeddings?.[model_key]?.vec;
      if (path && vec) {
        vectors.set(path, vec);
      }
    }
  }

  const target_vec = vectors.get(target_file);
  if (!target_vec) {
    throw new Error(
      `No embedding found for "${target_file}". ` +
      `Make sure the file exists in the vault and has been indexed by Smart Connections.`
    );
  }

  // Score all other sources
  const results = [];
  for (const [path, vec] of vectors) {
    if (path === target_file) continue;
    results.push({ score: cos_sim(target_vec, vec), path });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}
