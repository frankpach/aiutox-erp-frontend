/**
 * Sistema de traducciones con autodescubrimiento de módulos
 * Implementa Fase 2: Sistema de Autodescubrimiento
 */

// Importar traducciones comunes
import { translations as commonEn } from "./common/en";
import { translations as commonEs } from "./common/es";

// Importar traducciones legacy existentes
import { translations as enTranslations } from "./en";
import { translations as esTranslations } from "./es";
import { searchTranslations as enSearchTranslations } from "./search.en";
import { searchTranslations as esSearchTranslations } from "./search.es";

// Tipo para claves anidadas
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

// Interfaz para traducciones de módulo
interface ModuleTranslations {
  [key: string]: {
    es: Record<string, unknown>;
    en: Record<string, unknown>;
  };
}

// Descubrir y cargar traducciones de módulos
const loadModuleTranslations = (): ModuleTranslations => {
  const modules: ModuleTranslations = {};
  
  try {
    // Usar Vite's import.meta.glob para descubrir archivos de módulos
    const moduleFiles = import.meta.glob('../../features/**/i18n/*.ts', {
      eager: true,
      import: 'default'
    });
    
    for (const path in moduleFiles) {
      const matches = path.match(/features\/([^/]+)\/i18n\/(.+)\.ts$/);
      if (matches) {
        const moduleName = matches[1];
        const lang = matches[2];
        
        if (moduleName && lang) {
          if (!modules[moduleName]) {
            modules[moduleName] = { es: {}, en: {} };
          }
          
          if (lang === 'es' || lang === 'en') {
            modules[moduleName][lang] = moduleFiles[path] as Record<string, unknown>;
          }
        }
      }
    }
  } catch (error) {
    // Si import.meta.glob no está disponible o hay error, usar objeto vacío
    console.warn('No se pudieron cargar traducciones de módulos automáticamente:', error);
  }
  
  return modules;
};

// Cargar traducciones de módulos
const moduleTranslations = loadModuleTranslations();

// Consolidar todas las traducciones
const translations = {
  en: {
    // Direct task translations (priority keys)
    "tasks.filtersAssignedToPlaceholder": "Filter by assignee...",
    "tasks.advancedFilters": "Advanced Filters",
    "tasks.status.title": "Status",
    "tasks.priority.title": "Priority",
    
    // Agregar traducciones de módulos descubiertos
    ...Object.fromEntries(
      Object.entries(moduleTranslations).map(([name, trans]) => [name, trans.en])
    ),
  },
  es: {
    ...commonEs,
    ...esTranslations,
    search: {
      ...esTranslations.search,
      ...esSearchTranslations,
    },
    common: {
      ...commonEs,
      ...esTranslations.common,
      ...esSearchTranslations.common,
    },
    // Agregar traducciones de módulos descubiertos
    ...Object.fromEntries(
      Object.entries(moduleTranslations).map(([name, trans]) => [name, trans.es])
    ),
  },
} as const;

export default translations;
export type TranslationPath = NestedKeyOf<typeof translations.es>;
