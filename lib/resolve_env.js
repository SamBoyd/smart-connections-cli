import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { parse_ajson_file } from './ajson.js';

/**
 * Locate .smart-env/ in a vault and resolve the active embedding model key.
 * @param {string} vault_path - Absolute path to the Obsidian vault root.
 * @returns {Promise<{ env_dir: string, model_key: string, dims: number }>}
 */
export async function resolve_env(vault_path) {
  const env_dir = join(vault_path, '.smart-env');
  if (!existsSync(env_dir)) {
    throw new Error(`No .smart-env/ directory found in ${vault_path}`);
  }

  const config_path = join(env_dir, 'smart_env.json');
  const config = JSON.parse(await readFile(config_path, 'utf-8'));

  const default_model_key = config?.embedding_models?.default_model_key;
  if (!default_model_key) {
    throw new Error('No default embedding model key found in smart_env.json');
  }

  const models_path = join(env_dir, 'embedding_models', 'embedding_models.ajson');
  const models = await parse_ajson_file(models_path);
  const model_entry = models.get(`embedding_models:${default_model_key}`);
  if (!model_entry) {
    throw new Error(`Embedding model "${default_model_key}" not found in embedding_models.ajson`);
  }

  return {
    env_dir,
    model_key: model_entry.model_key,
    dims: model_entry.dims || 384,
  };
}
