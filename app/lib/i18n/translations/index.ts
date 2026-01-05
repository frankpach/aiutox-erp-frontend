// Import all translations
import { translations as enTranslations } from "./en";
import { translations as esTranslations } from "./es";
import { searchTranslations as enSearchTranslations } from "./search.en";
import { searchTranslations as esSearchTranslations } from "./search.es";

// Merge translations
const translations = {
  en: {
    ...enTranslations,
    ...enSearchTranslations,
    common: {
      ...enTranslations.common,
      ...enSearchTranslations.common,
    },
  },
  es: {
    ...esTranslations,
    ...esSearchTranslations,
    common: {
      ...esTranslations.common,
      ...esSearchTranslations.common,
    },
  },
} as const;

export default translations;
