import { writable, derived, get } from 'svelte/store';
import en from './messages/en.json';
import sv from './messages/sv.json';

type TranslationCatalog = Record<string, string>;

function flattenCatalog(value: unknown, prefix = '', result: TranslationCatalog = {}): TranslationCatalog {
  if (typeof value === 'string') {
    if (prefix) result[prefix] = value;
    return result;
  }

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, nestedValue] of Object.entries(value)) {
      flattenCatalog(nestedValue, prefix ? `${prefix}.${key}` : key, result);
    }
  }

  return result;
}

const translations: Record<string, TranslationCatalog> = {
  en: flattenCatalog(en),
  sv: flattenCatalog(sv)
};

// Static builds are published on two language-specific domains. Seed the
// prerendered HTML with the matching language; the browser still selects its
// domain locale in the root layout before hydrating the page.
const initialLocale = import.meta.env.SSR && import.meta.env.VITE_PRERENDER_LOCALE === 'sv' ? 'sv' : 'en';
export const locale = writable(initialLocale);
export const fallbackLocale = 'en';

export async function loadLocale(lang: string) {
  // Both supported catalogs are bundled up front so the initial locale change
  // never waits on a dynamic import after the launcher has started rendering.
  return translations[lang.toLowerCase().startsWith('sv') ? 'sv' : 'en'];
}

export function setLocale(lang: string) {
  const selectedLanguage = lang.toLowerCase().startsWith('sv') ? 'sv' : 'en';
  locale.set(selectedLanguage);
  if (typeof document !== 'undefined') document.documentElement.lang = selectedLanguage;
}

export const t = derived(locale, ($locale) => {
  return (key: string, params?: Record<string, string>): string => {
    const dict = translations[$locale] || translations[fallbackLocale];
    let val = dict[key] ?? translations[fallbackLocale]?.[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        val = val.replace(`{${k}}`, v);
      }
    }
    return val;
  };
});
