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
  },
  es: {
    ...esTranslations,
    ...esSearchTranslations,
  },
} as const;

export default translations;
