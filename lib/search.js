import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { resolve_env } from './resolve_env.js';
import { stream_ajson_lines } from './ajson.js';
import { cos_sim } from './cos_sim.js';

/**
 * Search for notes similar to a target file using pre-computed embeddings.
 * Uses two streaming passes to avoid loading all vectors into memory.
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
  const target_key = `smart_sources:${target_file}`;

  // Pass 1: stream all files to find the target vector (last-wins)
  let target_vec = null;
  for (const file of ajson_files) {
    await stream_ajson_lines(join(multi_dir, file), (key, data) => {
      if (key !== target_key) return;
      if (data === null) {
        target_vec = null;
        return;
      }
      const vec = data.embeddings?.[model_key]?.vec;
      if (vec) target_vec = vec;
    });
  }

  if (!target_vec) {
    throw new Error(
      `No embedding found for "${target_file}". ` +
      `Make sure the file exists in the vault and has been indexed by Smart Connections.`
    );
  }

  // Pass 2: stream all files again, scoring each source immediately
  const scores = new Map(); // path → score
  for (const file of ajson_files) {
    await stream_ajson_lines(join(multi_dir, file), (key, data) => {
      if (!key.startsWith('smart_sources:')) return;
      if (data === null) {
        scores.delete(key.slice(14)); // length of 'smart_sources:'
        return;
      }
      const path = data.path;
      if (!path || path === target_file) return;
      const vec = data.embeddings?.[model_key]?.vec;
      if (!vec) return;
      scores.set(path, cos_sim(target_vec, vec));
    });
  }

  // Extract top-N results
  const results = [];
  for (const [path, score] of scores) {
    results.push({ score, path });
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}
