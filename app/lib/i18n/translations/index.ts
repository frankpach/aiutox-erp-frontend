// Import all translations
// Force module reload: 2026-01-30T20:49:00
import { translations as enTranslations } from "./en";
import { translations as esTranslations } from "./es";
import { searchTranslations as enSearchTranslations } from "./search.en";
import { searchTranslations as esSearchTranslations } from "./search.es";

// Merge translations
const translations = {
  en: {
    ...enTranslations,
    search: {
      ...enTranslations.search,
      ...enSearchTranslations,
    },
    common: {
      ...enTranslations.common,
      ...enSearchTranslations.common,
    },
  },
  es: {
    ...esTranslations,
    search: {
      ...esTranslations.search,
      ...esSearchTranslations,
    },
    common: {
      ...esTranslations.common,
      ...esSearchTranslations.common,
    },
  },
} as const;

export default translations;
