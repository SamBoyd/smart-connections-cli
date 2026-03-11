import test from 'ava';
import { cos_sim } from '../lib/cos_sim.js';

test('identical vectors return 1', t => {
  const v = [1, 2, 3, 4, 5];
  t.is(cos_sim(v, v), 1);
});

test('orthogonal vectors return 0', t => {
  const a = [1, 0, 0];
  const b = [0, 1, 0];
  t.is(cos_sim(a, b), 0);
});

test('opposite vectors return -1', t => {
  const a = [1, 0, 0];
  const b = [-1, 0, 0];
  t.true(Math.abs(cos_sim(a, b) - (-1)) < 1e-8);
});

test('zero vector returns 0', t => {
  const a = [0, 0, 0];
  const b = [1, 2, 3];
  t.is(cos_sim(a, b), 0);
});

test('mismatched lengths return 0', t => {
  t.is(cos_sim([1, 2], [1, 2, 3]), 0);
});

test('known similarity value', t => {
  const a = [1, 1, 0];
  const b = [1, 0, 1];
  // dot=1, |a|=sqrt(2), |b|=sqrt(2), sim=0.5
  t.true(Math.abs(cos_sim(a, b) - 0.5) < 1e-8);
});
