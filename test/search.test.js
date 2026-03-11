import test from 'ava';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { search } from '../lib/search.js';

async function create_fixture() {
  const vault = await mkdtemp(join(tmpdir(), 'sc-cli-test-'));
  const env_dir = join(vault, '.smart-env');
  const multi_dir = join(env_dir, 'multi');
  const models_dir = join(env_dir, 'embedding_models');
  await mkdir(multi_dir, { recursive: true });
  await mkdir(models_dir, { recursive: true });

  // smart_env.json
  await writeFile(join(env_dir, 'smart_env.json'), JSON.stringify({
    embedding_models: { default_model_key: 'transformers#123' },
  }));

  // embedding_models.ajson
  await writeFile(join(models_dir, 'embedding_models.ajson'),
    '"embedding_models:transformers#123": {"model_key":"test-model","dims":3},\n'
  );

  // Three sources with known vectors
  const sources = [
    { path: 'note-a.md', vec: [1, 0, 0] },
    { path: 'note-b.md', vec: [0.9, 0.1, 0] },   // very similar to A
    { path: 'note-c.md', vec: [0, 0, 1] },         // orthogonal to A
    { path: 'note-d.md', vec: [0.5, 0.5, 0.5] },   // moderate similarity
  ];
  const lines = sources.map(s =>
    `"smart_sources:${s.path}": {"path":"${s.path}","embeddings":{"test-model":{"vec":[${s.vec}]}}},`
  ).join('\n');
  await writeFile(join(multi_dir, 'notes.ajson'), lines + '\n');

  return vault;
}

test('returns results sorted by similarity', async t => {
  const vault = await create_fixture();
  try {
    const results = await search(vault, 'note-a.md', { limit: 10 });
    t.is(results.length, 3);
    // note-b should be most similar to note-a
    t.is(results[0].path, 'note-b.md');
    // note-c should be least similar (orthogonal)
    t.is(results[results.length - 1].path, 'note-c.md');
    // scores should be descending
    for (let i = 1; i < results.length; i++) {
      t.true(results[i - 1].score >= results[i].score);
    }
  } finally {
    await rm(vault, { recursive: true });
  }
});

test('respects limit', async t => {
  const vault = await create_fixture();
  try {
    const results = await search(vault, 'note-a.md', { limit: 1 });
    t.is(results.length, 1);
    t.is(results[0].path, 'note-b.md');
  } finally {
    await rm(vault, { recursive: true });
  }
});

test('excludes the target file from results', async t => {
  const vault = await create_fixture();
  try {
    const results = await search(vault, 'note-a.md', { limit: 10 });
    t.false(results.some(r => r.path === 'note-a.md'));
  } finally {
    await rm(vault, { recursive: true });
  }
});

test('throws for missing file', async t => {
  const vault = await create_fixture();
  try {
    await t.throwsAsync(() => search(vault, 'nonexistent.md'), {
      message: /No embedding found/,
    });
  } finally {
    await rm(vault, { recursive: true });
  }
});

test('throws for missing .smart-env', async t => {
  const vault = await mkdtemp(join(tmpdir(), 'sc-cli-empty-'));
  try {
    await t.throwsAsync(() => search(vault, 'note.md'), {
      message: /No .smart-env/,
    });
  } finally {
    await rm(vault, { recursive: true });
  }
});
