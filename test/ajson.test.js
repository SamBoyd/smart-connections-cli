import test from 'ava';
import { parse_ajson } from '../lib/ajson.js';

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
