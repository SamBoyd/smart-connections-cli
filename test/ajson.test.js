import test from 'ava';
import { parse_ajson, stream_ajson_lines } from '../lib/ajson.js';
import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

test('parses a single entry', t => {
  const text = '"smart_sources:note.md": {"path":"note.md","embeddings":{}},\n';
  const map = parse_ajson(text);
  t.is(map.size, 1);
  t.is(map.get('smart_sources:note.md').path, 'note.md');
});

test('last entry wins for same key', t => {
  const text = [
    '"smart_sources:note.md": {"path":"note.md","val":1},',
    '"smart_sources:note.md": {"path":"note.md","val":2},',
  ].join('\n');
  const map = parse_ajson(text);
  t.is(map.size, 1);
  t.is(map.get('smart_sources:note.md').val, 2);
});

test('null value deletes key', t => {
  const text = [
    '"smart_sources:note.md": {"path":"note.md"},',
    '"smart_sources:note.md": null,',
  ].join('\n');
  const map = parse_ajson(text);
  t.is(map.size, 0);
});

test('skips empty and malformed lines', t => {
  const text = [
    '',
    'this is not json',
    '"smart_sources:ok.md": {"path":"ok.md"},',
    '   ',
  ].join('\n');
  const map = parse_ajson(text);
  t.is(map.size, 1);
  t.is(map.get('smart_sources:ok.md').path, 'ok.md');
});

test('handles line without trailing comma', t => {
  const text = '"smart_sources:note.md": {"path":"note.md"}';
  const map = parse_ajson(text);
  t.is(map.size, 1);
});

test('parses multiple distinct keys', t => {
  const text = [
    '"smart_sources:a.md": {"path":"a.md"},',
    '"smart_sources:b.md": {"path":"b.md"},',
    '"smart_blocks:a.md#heading": {"text":"hello"},',
  ].join('\n');
  const map = parse_ajson(text);
  t.is(map.size, 3);
});

// --- stream_ajson_lines tests ---

async function write_temp_ajson(lines) {
  const dir = await mkdtemp(join(tmpdir(), 'ajson-test-'));
  const file = join(dir, 'test.ajson');
  await writeFile(file, lines.join('\n') + '\n');
  return { dir, file };
}

test('stream: visits each entry', async t => {
  const { dir, file } = await write_temp_ajson([
    '"smart_sources:a.md": {"path":"a.md"},',
    '"smart_sources:b.md": {"path":"b.md"},',
  ]);
  try {
    const entries = [];
    await stream_ajson_lines(file, (key, value) => {
      entries.push({ key, value });
    });
    t.is(entries.length, 2);
    t.is(entries[0].key, 'smart_sources:a.md');
    t.is(entries[0].value.path, 'a.md');
    t.is(entries[1].key, 'smart_sources:b.md');
  } finally {
    await rm(dir, { recursive: true });
  }
});

test('stream: passes null for deletions', async t => {
  const { dir, file } = await write_temp_ajson([
    '"smart_sources:a.md": {"path":"a.md"},',
    '"smart_sources:a.md": null,',
  ]);
  try {
    const entries = [];
    await stream_ajson_lines(file, (key, value) => {
      entries.push({ key, value });
    });
    t.is(entries.length, 2);
    t.deepEqual(entries[1], { key: 'smart_sources:a.md', value: null });
  } finally {
    await rm(dir, { recursive: true });
  }
});

test('stream: skips empty and malformed lines', async t => {
  const { dir, file } = await write_temp_ajson([
    '',
    'not json at all',
    '"smart_sources:ok.md": {"path":"ok.md"},',
    '   ',
  ]);
  try {
    const entries = [];
    await stream_ajson_lines(file, (key, value) => {
      entries.push({ key, value });
    });
    t.is(entries.length, 1);
    t.is(entries[0].key, 'smart_sources:ok.md');
  } finally {
    await rm(dir, { recursive: true });
  }
});

test('stream: handles lines without trailing comma', async t => {
  const { dir, file } = await write_temp_ajson([
    '"smart_sources:a.md": {"path":"a.md"}',
  ]);
  try {
    const entries = [];
    await stream_ajson_lines(file, (key, value) => {
      entries.push({ key, value });
    });
    t.is(entries.length, 1);
    t.is(entries[0].value.path, 'a.md');
  } finally {
    await rm(dir, { recursive: true });
  }
});
