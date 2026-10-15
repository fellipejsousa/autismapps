/**
 * Bildstöd — Local Swedish pictogram service.
 * Provides Swedish/Nordic and NPF-specific pictograms not available in ARASAAC.
 * Hosted at autismappar.se/bildstod
 */

const REMOTE_BILDSTOD_BASE = 'https://autismappar.se/bildstod/bildstod-service';
const BILDSTOD_API = `${REMOTE_BILDSTOD_BASE}/api/pictograms.json`;

export interface BildstodPictogram {
  id: number;
  slug: string;
  keywords: { sv: string[]; en: string[] };
  categories: string[];
  description: { sv: string; en: string };
  files: { svg: string; png_500: string };
  tags: string[];
}

interface BildstodData {
  version: string;
  pictograms: BildstodPictogram[];
  categories: { id: string; name: { sv: string; en: string } }[];
}

let cache: BildstodData | null = null;

function isBildstodData(value: unknown): value is BildstodData {
  if (!value || typeof value !== 'object') return false;
  const pictograms = (value as { pictograms?: unknown }).pictograms;
  return Array.isArray(pictograms) && pictograms.every((item) => {
    if (!item || typeof item !== 'object') return false;
    const pictogram = item as Partial<BildstodPictogram>;
    return typeof pictogram.id === 'number'
      && Array.isArray(pictogram.keywords?.sv)
      && Array.isArray(pictogram.keywords?.en)
      && Array.isArray(pictogram.categories)
      && typeof pictogram.slug === 'string'
      && typeof pictogram.files?.png_500 === 'string';
  });
}

async function fetchWithTimeout(url: string, timeoutMs = 1500): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Load the bildstöd pictogram catalog.
 * Loads the catalog from the matching remote API.
 */
export async function loadBildstod(): Promise<BildstodData> {
  if (cache) return cache;
  
  try {
    const res = await fetchWithTimeout(BILDSTOD_API);
    const ct = res.headers.get('content-type') || '';
    if (res.ok && ct.includes('json')) {
      const data: unknown = await res.json();
      if (isBildstodData(data)) {
        cache = data;
        return cache;
      }
    }
  } catch {}
  
  cache = { version: '0.0.0', pictograms: [], categories: [] };
  return cache;
}

/**
 * Search bildstöd pictograms by Swedish or English keyword.
 * Returns results compatible with the ARASAAC search format.
 */
export async function searchBildstod(
  query: string,
  lang: string = 'sv'
): Promise<{ id: number; keyword: string; url: string; slug: string; source: 'bildstod' }[]> {
  const data = await loadBildstod();
  const q = query.toLowerCase().trim();
  
  if (!q) return [];
  
  const results: { id: number; keyword: string; url: string; slug: string; source: 'bildstod'; score: number }[] = [];
  
  for (const p of data.pictograms) {
    let score = 0;
    let matchedKeyword = '';
    
    // Check Swedish keywords
    for (const kw of p.keywords.sv ?? []) {
      const kwLower = kw.toLowerCase();
      if (kwLower === q) {
        score = 100; // Exact match
        matchedKeyword = kw;
        break;
      } else if (kwLower.startsWith(q)) {
        score = Math.max(score, 80);
        if (!matchedKeyword) matchedKeyword = kw;
      } else if (kwLower.includes(q)) {
        score = Math.max(score, 50);
        if (!matchedKeyword) matchedKeyword = kw;
      }
    }
    
    // Check English keywords (lower priority)
    if (score === 0) {
      for (const kw of p.keywords.en ?? []) {
        const kwLower = kw.toLowerCase();
        if (kwLower === q) {
          score = 70;
          matchedKeyword = p.keywords.sv[0] || kw; // Show Swedish
          break;
        } else if (kwLower.includes(q)) {
          score = Math.max(score, 30);
          if (!matchedKeyword) matchedKeyword = p.keywords.sv[0] || kw;
        }
      }
    }
    
    // Check categories and tags
    if (score === 0) {
      const allMeta = [...(p.categories ?? []), ...(p.tags ?? []), p.slug ?? ''].join(' ').toLowerCase();
      if (allMeta.includes(q)) {
        score = 20;
        matchedKeyword = p.keywords.sv[0];
      }
    }
    
    if (score > 0) {
      results.push({
        id: p.id >= 900000 ? p.id : p.id + 900000, // Offset only if not already offset
        keyword: matchedKeyword,
        url: `${REMOTE_BILDSTOD_BASE}/${p.files.png_500}`,
        slug: p.slug,
        source: 'bildstod' as const,
        score
      });
    }
  }
  
  // Sort by score (best matches first)
  results.sort((a, b) => b.score - a.score);
  return results.map(({ score, ...r }) => r);
}

/**
 * Get a specific bildstöd pictogram by slug.
 */
export async function getBildstodBySlug(slug: string): Promise<BildstodPictogram | null> {
  const data = await loadBildstod();
  return data.pictograms.find(p => p.slug === slug) || null;
}

/**
 * Get bildstöd pictogram image URL.
 */
export function getBildstodUrl(slug: string, format: 'svg' | 'png' = 'png'): string {
  const ext = format === 'svg' ? `${slug}.svg` : `${slug}.png`;
  return `${REMOTE_BILDSTOD_BASE}/pictograms/${ext}`;
}
