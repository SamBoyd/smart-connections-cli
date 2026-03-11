import { readFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

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

/**
 * Stream an .ajson file line-by-line, calling `visitor` for each parsed entry.
 * Skips malformed lines. Passes null values through for deletions.
 * @param {string} file_path
 * @param {(key: string, value: object | null) => void} visitor
 * @returns {Promise<void>}
 */
export async function stream_ajson_lines(file_path, visitor) {
  const rl = createInterface({
    input: createReadStream(file_path, 'utf-8'),
    crlfDelay: Infinity,
  });
  for await (const raw_line of rl) {
    const line = raw_line.trim();
    if (!line) continue;
    try {
      const cleaned = line.endsWith(',') ? line.slice(0, -1) : line;
      const obj = JSON.parse(`{${cleaned}}`);
      for (const [key, value] of Object.entries(obj)) {
        visitor(key, value);
      }
    } catch {
      // Skip malformed lines
    }
  }
}
