/**
 * Cosine similarity between two vectors.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number} similarity in [0, 1] (clamped from [-1, 1])
 */
export function cos_sim(a, b) {
  if (a.length !== b.length) return 0;
  let dot = 0, mag_a = 0, mag_b = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    mag_a += a[i] * a[i];
    mag_b += b[i] * b[i];
  }
  const denom = Math.sqrt(mag_a) * Math.sqrt(mag_b);
  if (denom < 1e-8) return 0;
  return dot / denom;
}
