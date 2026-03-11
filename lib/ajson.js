import { readFile } from 'node:fs/promises';

/**
 * Parse an .ajson file into a Map with last-wins semantics.
 * Each line is: "key": {json},
 * A null value means the key was deleted.
 * @param {string} file_path
 * @returns {Promise<Map<string, object>>}
 */
export async function parse_ajson_file(file_path) {
  const text = await readFile(file_path, 'utf-8');
  return parse_ajson(text);
}

/**
 * Parse raw .ajson text into a Map with last-wins semantics.
 * @param {string} text
 * @returns {Map<string, object>}
 */
export function parse_ajson(text) {
  const entries = new Map();
  for (const raw_line of text.split('\n')) {
    const line = raw_line.trim();
    if (!line) continue;
    try {
      // Wrap in braces to make valid JSON, strip trailing comma
      const cleaned = line.endsWith(',') ? line.slice(0, -1) : line;
      const obj = JSON.parse(`{${cleaned}}`);
      for (const [key, value] of Object.entries(obj)) {
        if (value === null) {
          entries.delete(key);
        } else {
          entries.set(key, value);
        }
      }
    } catch {
      // Skip malformed lines
    }
  }
  return entries;
}
