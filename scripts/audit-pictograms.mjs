import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const catalogUrl = 'https://api.arasaac.org/v1/pictograms/all/en';
const lookupPath = new URL('../static/arasaac-sv.json', import.meta.url);
const trafficPath = new URL('../static/pictograms/traffic-safety', import.meta.url);
const pictogramSourcePath = new URL('../src/lib/data/arasaac-data.js', import.meta.url);

// Human-reviewed semantic overrides where the exact English catalog keyword is
// misleading or the closest suitable ARASAAC image uses a different keyword.
const reviewedOverrides = new Map([
  ['park', { id: '2859', reason: 'A playground pictogram is a clearer park symbol than the catalog result showing a parked car.' }],
  ['mix', { id: '7162', reason: 'Shows mixing food rather than mixing flags.' }],
  ['blend', { id: '7162', reason: 'Shows mixing food rather than mixing flags.' }],
  ['seat', { id: '3155', reason: 'A chair is a clear visual representation of a seat; the exact catalog result was the letter h.' }],
  ['safe', { id: '12260', reason: 'Represents protection/security; the exact catalog result was a strongbox.' }]
]);

function normalizeKeyword(value) {
  return value.trim().toLocaleLowerCase('en').replace(/^\\(["\\])$/, '$1');
}

const [lookupText, trafficFiles, pictogramSource, catalogResponse] = await Promise.all([
  readFile(lookupPath, 'utf8'),
  readdir(trafficPath),
  readFile(pictogramSourcePath, 'utf8'),
  fetch(catalogUrl)
]);

if (!catalogResponse.ok) {
  throw new Error(`ARASAAC catalog request failed: HTTP ${catalogResponse.status}`);
}

const lookup = JSON.parse(lookupText.replace(/^\uFEFF/, ''));
const catalog = await catalogResponse.json();
const byId = new Map(catalog.map((pictogram) => [String(pictogram._id), pictogram]));
const errors = [];
let uniqueIds = new Set();

// Parse the simple numeric map from the source used by the UI so the card
// mappings and the local PNG bundle cannot silently drift apart.
const idsBlock = pictogramSource.match(/export const ARASAAC_IDS = \{([\s\S]*?)\n\};/);
if (!idsBlock) {
  errors.push('ARASAAC_IDS: could not find the exported pictogram map');
}
const pictogramIds = Object.fromEntries(
  [...(idsBlock?.[1] ?? '').matchAll(/^\s*([A-Za-z]\w*):\s*(\d+|null)\s*(?:,|$)/gm)]
    .map(([, key, value]) => [key, value === 'null' ? null : Number(value)])
);
const localPngIds = new Set(trafficFiles.filter((file) => file.endsWith('.png')).map((file) => file.slice(0, -4)));
for (const [key, id] of Object.entries(pictogramIds)) {
  if (id !== null && !localPngIds.has(String(id))) errors.push(`ARASAAC_IDS.${key}: missing local PNG ${id}.png`);
}
for (const [key, id] of Object.entries({ trafficLight: 2567, crosswalk: 3430, warning: 25315, safePlace: 6964, reflector: 39534, car: 2339 })) {
  if (pictogramIds[key] !== id) errors.push(`traffic-safety card ${key}: expected pictogram ${id}, got ${pictogramIds[key] ?? 'missing'}`);
}

// Keep the traffic-safety tile on the locally bundled house illustration.
// The generic "safe" lookup is a strongbox, which is misleading for this app.
if (!byId.has('6964')) errors.push('safe-place tile: ARASAAC house pictogram 6964 is missing from the catalog');
if (!trafficFiles.includes('6964.png')) errors.push('safe-place tile: expected local house pictogram 6964.png');

for (const [term, entry] of Object.entries(lookup)) {
  const pictogram = byId.get(String(entry.id));
  uniqueIds.add(entry.id);

  if (!pictogram) {
    errors.push(`${JSON.stringify(term)}: missing catalog ID ${entry.id}`);
    continue;
  }

  const keywords = new Set((pictogram.keywords ?? []).map(({ keyword }) => normalizeKeyword(keyword)));
  const override = reviewedOverrides.get(term);
  if (override) {
    if (String(entry.id) !== override.id) errors.push(`${JSON.stringify(term)}: reviewed override expected ID ${override.id}, got ${entry.id}`);
  } else if (!keywords.has(normalizeKeyword(term))) {
    errors.push(`${JSON.stringify(term)} -> ${entry.id}: not an official keyword (${[...keywords].join('; ')})`);
  }
}

const pngFiles = trafficFiles.filter((file) => file.endsWith('.png'));
for (const file of pngFiles) {
  const id = file.slice(0, -4);
  if (!byId.has(id)) errors.push(`traffic-safety/${file}: missing catalog ID`);
  const bytes = await readFile(join(trafficPath.pathname, file));
  if (!bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    errors.push(`traffic-safety/${file}: invalid PNG signature`);
  }
}

console.log(`Checked ${Object.keys(lookup).length} Swedish lookup entries across ${uniqueIds.size} pictogram IDs.`);
console.log(`Checked ${pngFiles.length} local traffic-safety PNGs against the catalog and PNG signature.`);
console.log(`Checked ${Object.values(pictogramIds).filter((id) => id !== null).length} source ID assignments and six traffic-safety card mappings against the local PNG bundle.`);
console.log(`ARASAAC English catalog: ${catalog.length} pictograms.`);

if (errors.length) {
  console.error(`${errors.length} pictogram issue(s):\n${errors.map((error) => `- ${error}`).join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`All non-overridden lookup terms match official keywords; ${reviewedOverrides.size} documented visual overrides and all local traffic images are valid.`);
}
