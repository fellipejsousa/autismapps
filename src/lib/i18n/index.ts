import { writable, derived, get } from 'svelte/store';
import en from './messages/en.json';

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

const translations: Record<string, TranslationCatalog> = { en: flattenCatalog(en) };
const loadedLocales = new Set(['en']);

export const locale = writable('en');
export const fallbackLocale = 'en';

export async function loadLocale(lang: string) {
  if (loadedLocales.has(lang)) return;
  try {
    const mod = await import(`./messages/${lang}.json`);
    translations[lang] = flattenCatalog(mod.default);
    loadedLocales.add(lang);
  } catch {
    console.warn(`Locale ${lang} not found, falling back to ${fallbackLocale}`);
  }
}

export function setLocale(lang: string) {
  const selectedLanguage = lang.toLowerCase().startsWith('sv') ? 'sv' : 'en';
  loadLocale(selectedLanguage).then(() => {
    locale.set(selectedLanguage);
    if (typeof document !== 'undefined') document.documentElement.lang = selectedLanguage;
  });
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
