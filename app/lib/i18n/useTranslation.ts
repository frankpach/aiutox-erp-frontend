/**
 * Simple i18n hook for translations
 * Provides type-safe access to translation strings
 */

import { translations } from "./translations/es";

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

type TranslationPath = NestedKeyOf<typeof translations>;

/**
 * Get nested value from object by dot-notation path
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  return (path.split(".").reduce((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return current[key] as Record<string, unknown> | string;
    }
    return undefined;
  }, obj as Record<string, unknown> | string | undefined) as string) || path;
}

/**
 * Hook to access translations
 * Usage: const t = useTranslation(); t('savedFilters.title')
 */
export function useTranslation() {
  const t = (key: TranslationPath): string => {
    return getNestedValue(translations, key);
  };

  return { t };
}

