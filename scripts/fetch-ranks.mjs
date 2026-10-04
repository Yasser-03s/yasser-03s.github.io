import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const outDir = path.resolve('assets/ranks');
await fs.mkdir(outDir, { recursive: true });

// Exact rank-image URLs supplied for DUNK RR.
const urls = {
  'iron1.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Iron_1_Rank.png/120px-Iron_1_Rank.png?a0496',
  'iron2.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Iron_2_Rank.png/120px-Iron_2_Rank.png?650b8',
  'iron3.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Iron_3_Rank.png/120px-Iron_3_Rank.png?14c95',
  'bronze1.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Bronze_1_Rank.png/120px-Bronze_1_Rank.png?f51a6',
  'bronze2.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Bronze_2_Rank.png/120px-Bronze_2_Rank.png?c31e6',
  'bronze3.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Bronze_3_Rank.png/120px-Bronze_3_Rank.png?00125',
  'silver1.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Silver_1_Rank.png/120px-Silver_1_Rank.png?ca291',
  'silver2.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Silver_2_Rank.png/120px-Silver_2_Rank.png?7e41e',
  'silver3.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Silver_3_Rank.png/120px-Silver_3_Rank.png?170a9',
  'gold1.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Gold_1_Rank.png/120px-Gold_1_Rank.png?170a9',
  'gold2.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Gold_2_Rank.png/120px-Gold_2_Rank.png?8410f',
  'gold3.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Gold_3_Rank.png/120px-Gold_3_Rank.png?7c41d',
  'platinum1.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Platinum_1_Rank.png/120px-Platinum_1_Rank.png?46430',
  'platinum2.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Platinum_2_Rank.png/120px-Platinum_2_Rank.png?8b8bd',
  'platinum3.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Platinum_3_Rank.png/120px-Platinum_3_Rank.png?b45e2',
  'diamond1.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Diamond_1_Rank.png/120px-Diamond_1_Rank.png?cd057',
  'diamond2.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Diamond_2_Rank.png/120px-Diamond_2_Rank.png?b23a8',
  'diamond3.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Diamond_3_Rank.png/120px-Diamond_3_Rank.png?e6893',
  'ascendant1.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Ascendant_1_Rank.png/120px-Ascendant_1_Rank.png?c818e',
  'ascendant2.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Ascendant_2_Rank.png/120px-Ascendant_2_Rank.png?8b3d6',
  'ascendant3.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Ascendant_3_Rank.png/120px-Ascendant_3_Rank.png?bc50e',
  'immortal1.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Immortal_1_Rank.png/120px-Immortal_1_Rank.png?d43a7',
  'immortal2.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Immortal_2_Rank.png/120px-Immortal_2_Rank.png?3db80',
  'immortal3.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Immortal_3_Rank.png/120px-Immortal_3_Rank.png?db712',
  'radiant.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Radiant_Rank.png/120px-Radiant_Rank.png?3abd1'
};

// Remove the flat corner background by flood-filling only pixels connected to an edge.
// This is safer than globally deleting a color because similar shades can appear inside the emblem.
function removeCornerBackground(raw, width, height, tolerance = 22) {
  const pixelCount = width * height;
  const visited = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  let head = 0;
  let tail = 0;

  const r0 = raw[0], g0 = raw[1], b0 = raw[2];
  const distSq = (i) => {
    const dr = raw[i] - r0, dg = raw[i + 1] - g0, db = raw[i + 2] - b0;
    return dr * dr + dg * dg + db * db;
  };
  const maxDistSq = tolerance * tolerance;
  const tryPush = (x, y) => {
    const p = y * width + x;
    if (visited[p]) return;
    const i = p * 4;
    if (distSq(i) > maxDistSq) return;
    visited[p] = 1;
    queue[tail++] = p;
  };

  for (let x = 0; x < width; x++) { tryPush(x, 0); tryPush(x, height - 1); }
  for (let y = 0; y < height; y++) { tryPush(0, y); tryPush(width - 1, y); }

  while (head < tail) {
    const p = queue[head++];
    const x = p % width, y = Math.floor(p / width);
    if (x > 0) tryPush(x - 1, y);
    if (x + 1 < width) tryPush(x + 1, y);
    if (y > 0) tryPush(x, y - 1);
    if (y + 1 < height) tryPush(x, y + 1);
  }

  // Remove connected background and soften a tiny fringe around the cut.
  for (let p = 0; p < pixelCount; p++) {
    if (!visited[p]) continue;
    raw[p * 4 + 3] = 0;
  }
  return raw;
}

for (const [name, url] of Object.entries(urls)) {
  console.log(`Fetching ${name}`);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'DUNK-RR asset builder/1.0' }
  });
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);

  const input = Buffer.from(await res.arrayBuffer());
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const cleaned = removeCornerBackground(Buffer.from(data), info.width, info.height, 22);

  // Trim transparent edges, then add a small transparent safety margin.
  await sharp(cleaned, {
    raw: { width: info.width, height: info.height, channels: 4 }
  })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: 5, bottom: 5, left: 5, right: 5, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(outDir, name));
}

console.log(`Done: ${Object.keys(urls).length} transparent rank PNGs written to ${outDir}`);
