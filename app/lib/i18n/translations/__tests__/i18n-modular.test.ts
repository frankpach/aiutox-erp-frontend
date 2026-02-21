/**
 * Tests unitarios para el sistema de autodescubrimiento i18n modular
 */

import { describe, test, expect } from 'vitest';
import translations from '../index';

describe('i18n Modular Autodiscovery', () => {
  test('descubre todas las traducciones de módulos', () => {
    // Verificar que existen módulos esperados
    expect(translations.es.users).toBeDefined();
    expect(translations.en.users).toBeDefined();
    expect(translations.es.tasks).toBeDefined();
    expect(translations.en.tasks).toBeDefined();
    
    // Verificar que los módulos tengan contenido
    expect(typeof translations.es.users).toBe('object');
    expect(typeof translations.en.users).toBe('object');
    expect(typeof translations.es.tasks).toBe('object');
    expect(typeof translations.en.tasks).toBe('object');
    
    // Verificar que tengan propiedades básicas
    expect((translations.es.users as any).title).toBeDefined();
    expect((translations.en.users as any).title).toBeDefined();
    expect((translations.es.tasks as any).title).toBeDefined();
    expect((translations.en.tasks as any).title).toBeDefined();
  });
  
  test('carga traducciones comunes', () => {
    expect(translations.es.common).toBeDefined();
    expect(translations.en.common).toBeDefined();
    
    // Verificar traducciones comunes básicas
    expect((translations.es.common as any).save).toBeDefined();
    expect((translations.en.common as any).save).toBeDefined();
    expect((translations.es.common as any).cancel).toBeDefined();
    expect((translations.en.common as any).cancel).toBeDefined();
  });
  
  test('tiene estructura consistente entre idiomas', () => {
    const esKeys = Object.keys(translations.es);
    const enKeys = Object.keys(translations.en);
    
    // Permitir diferencias durante la migración
    const commonKeys = esKeys.filter(key => enKeys.includes(key));
    const overlapRatio = commonKeys.length / Math.max(esKeys.length, enKeys.length);
    
    // Al menos 95% de overlap en claves principales
    expect(overlapRatio).toBeGreaterThan(0.95);
  });
  
  test('mantiene traducciones legacy', () => {
    // Verificar que las traducciones centralizadas aún funcionan
    expect(translations.es.search).toBeDefined();
    expect(translations.en.search).toBeDefined();
    expect(translations.es.config).toBeDefined();
    expect(translations.en.config).toBeDefined();
  });
  
  test('tipos de traducciones son consistentes', () => {
    // Verificar que las traducciones sean strings para claves básicas
    expect(typeof (translations.es.users as any).title).toBe('string');
    expect(typeof (translations.en.users as any).title).toBe('string');
    expect(typeof (translations.es.tasks as any).title).toBe('string');
    expect(typeof (translations.en.tasks as any).title).toBe('string');
  });
  
  test('no hay colisiones entre módulos', () => {
    // Verificar que no haya sobrescritura accidental
    const usersTitleEs = (translations.es.users as any).title;
    const tasksTitleEs = (translations.es.tasks as any).title;
    
    expect(usersTitleEs).not.toBe(tasksTitleEs);
    expect(usersTitleEs).toBe('Usuarios');
    expect(tasksTitleEs).toBe('Tareas');
  });
  
  test('estructura de módulos es completa', () => {
    // Verificar que los módulos tengan estructura esperada
    const userModuleEs = translations.es.users as any;
    const userModuleEn = translations.en.users as any;
    
    // Campos básicos que deberían existir (ajustados a la realidad)
    const expectedFields = ['title', 'description', 'edit', 'delete'];
    
    expectedFields.forEach(field => {
      expect(userModuleEs[field]).toBeDefined();
      expect(userModuleEn[field]).toBeDefined();
    });
    
    // Verificar campos adicionales que existen en ambos
    const optionalFields = ['loading', 'create', 'status'];
    optionalFields.forEach(field => {
      if (userModuleEs[field] || userModuleEn[field]) {
        expect(userModuleEs[field]).toBeDefined();
        expect(userModuleEn[field]).toBeDefined();
      }
    });
  });
});
