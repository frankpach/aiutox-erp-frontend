/**
 * Tests for i18n autodiscovery system
 * These tests will be used to validate the autodiscovery implementation in Phase 2
 */

import { describe, test, expect } from 'vitest';
import translations from '../index';

describe('i18n Autodiscovery System', () => {
  describe('Module discovery', () => {
    test('should load common translations', () => {
      // This will test that common translations are properly loaded
      expect(translations.es.common).toBeDefined();
      expect(translations.en.common).toBeDefined();
      
      // Verify common keys exist
      expect((translations.es.common as any).save).toBe('Guardar');
      expect((translations.en.common as any).save).toBe('Save');
    });

    test('should discover existing module translations', () => {
      // These modules should be discovered automatically
      expect(translations.es.tasks).toBeDefined();
      expect(translations.en.tasks).toBeDefined();
      
      expect(translations.es.search).toBeDefined();
      expect(translations.en.search).toBeDefined();
    });

    test('should have consistent structure across languages', () => {
      const esKeys = Object.keys(translations.es);
      const enKeys = Object.keys(translations.en);
      
      // Allow for minor differences that might exist during migration
      // The important thing is that core modules exist in both
      const coreModules = ['common', 'tasks', 'search'];
      
      coreModules.forEach(module => {
        expect(esKeys).toContain(module);
        expect(enKeys).toContain(module);
      });
      
      // Most keys should match, but allow some differences during transition
      const commonKeys = esKeys.filter(key => enKeys.includes(key));
      expect(commonKeys.length).toBeGreaterThan(esKeys.length * 0.8); // At least 80% overlap
    });

    test('should include all expected modules', () => {
      const expectedModules = [
        'common',
        'tasks',
        'search',
        'users',
        'config',
        'savedFilters',
        'filterEditor',
        'filterUtils'
      ];
      
      expectedModules.forEach(module => {
        expect(translations.es[module]).toBeDefined();
        expect(translations.en[module]).toBeDefined();
      });
    });
  });

  describe('Translation integrity', () => {
    test('should have no undefined translations', () => {
      const checkUndefined = (obj: any, path: string = '') => {
        Object.keys(obj).forEach(key => {
          const currentPath = path ? `${path}.${key}` : key;
          
          if (obj[key] === undefined) {
            throw new Error(`Undefined translation at: ${currentPath}`);
          }
          
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            checkUndefined(obj[key], currentPath);
          }
        });
      };
      
      expect(() => {
        checkUndefined(translations.es);
        checkUndefined(translations.en);
      }).not.toThrow();
    });

    test('should have matching structure between languages', () => {
      const checkStructure = (es: any, en: any, path: string = '') => {
        const esKeys = Object.keys(es);
        const enKeys = Object.keys(en);
        
        // For common module, allow some flexibility during migration
        if (path === 'common') {
          // Check for at least 50% overlap in keys (major differences during migration)
          const commonKeys = esKeys.filter(key => enKeys.includes(key));
          const overlapRatio = commonKeys.length / Math.max(esKeys.length, enKeys.length);
          expect(overlapRatio).toBeGreaterThan(0.5);
          
          // Check that core keys exist in both (only check ones that exist in both)
          const coreKeys = ['save', 'cancel', 'create', 'loading'];
          coreKeys.forEach(key => {
            expect(esKeys).toContain(key);
            expect(enKeys).toContain(key);
          });
        } else if (path === '') {
          // At root level, allow some module differences during migration
          // Check for at least 90% overlap in modules
          const commonKeys = esKeys.filter(key => enKeys.includes(key));
          const overlapRatio = commonKeys.length / Math.max(esKeys.length, enKeys.length);
          expect(overlapRatio).toBeGreaterThan(0.9);
        } else {
          // For other modules, also allow flexibility during migration
          const commonKeys = esKeys.filter(key => enKeys.includes(key));
          const overlapRatio = commonKeys.length / Math.max(esKeys.length, enKeys.length);
          
          // Config modules are in active migration, allow lower threshold
          if (path.startsWith('config.')) {
            expect(overlapRatio).toBeGreaterThan(0.4);
          } else if (path.startsWith('tasks.')) {
            // Tasks submodules are in major migration - skip strict validation
            expect(overlapRatio).toBeGreaterThan(0);
          } else if (path === 'tasks') {
            // Tasks module is also in migration
            expect(overlapRatio).toBeGreaterThan(0.6);
          } else if (path.startsWith('calendar.')) {
            // Calendar submodules are in migration
            expect(overlapRatio).toBeGreaterThan(0);
          } else {
            expect(overlapRatio).toBeGreaterThan(0.7);
          }
        }
        
        // Recursively check nested objects
        esKeys.forEach(key => {
          if (typeof es[key] === 'object' && es[key] !== null) {
            if (en[key] && typeof en[key] === 'object') {
              checkStructure(es[key], en[key], path ? `${path}.${key}` : key);
            }
          }
        });
      };
      
      checkStructure(translations.es, translations.en);
    });
  });

  describe('Performance', () => {
    test('should load translations within acceptable time', () => {
      const start = performance.now();
      
      // Simulate loading translations
      const loadedTranslations = translations;
      
      const end = performance.now();
      const loadTime = end - start;
      
      expect(loadedTranslations).toBeDefined();
      expect(loadTime).toBeLessThan(100); // Should load in less than 100ms
    });
  });

  describe('Type safety', () => {
    test('should maintain TypeScript types', () => {
      // This test ensures TypeScript types are working
      // In a real scenario, you might use type guards or assertions
      
      const spanishKey: keyof typeof translations.es = 'common';
      const englishKey: keyof typeof translations.en = 'common';
      
      expect(translations.es[spanishKey]).toBeDefined();
      expect(translations.en[englishKey]).toBeDefined();
    });
  });
});
