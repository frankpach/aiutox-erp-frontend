/**
 * Tests for common translations
 */

import { describe, test, expect } from 'vitest';
import { translations as esTranslations } from '../common/es';
import { translations as enTranslations } from '../common/en';

describe('Common Translations', () => {
  describe('Spanish translations', () => {
    test('should have all required common keys', () => {
      // Common actions
      expect(esTranslations.save).toBe('Guardar');
      expect(esTranslations.cancel).toBe('Cancelar');
      expect(esTranslations.delete).toBe('Eliminar');
      expect(esTranslations.edit).toBe('Editar');
      expect(esTranslations.create).toBe('Crear');

      // Common states
      expect(esTranslations.loading).toBe('Cargando...');
      expect(esTranslations.saving).toBe('Guardando...');
      expect(esTranslations.error).toBe('Error');

      // Common labels
      expect(esTranslations.name).toBe('Nombre');
      expect(esTranslations.email).toBe('Email');
      expect(esTranslations.status).toBe('Estado');
      expect(esTranslations.actions).toBe('Acciones');

      // Common messages
      expect(esTranslations.noData).toBe('No hay datos disponibles');
      expect(esTranslations.selectAll).toBe('Seleccionar todo');
      expect(esTranslations.all).toBe('Todos');
    });

    test('should have consistent structure', () => {
      const keys = Object.keys(esTranslations);
      expect(keys.length).toBeGreaterThan(0);
      
      // Verify no undefined values
      keys.forEach(key => {
        expect(esTranslations[key as keyof typeof esTranslations]).toBeDefined();
        expect(typeof esTranslations[key as keyof typeof esTranslations]).toBe('string');
      });
    });
  });

  describe('English translations', () => {
    test('should have all required common keys', () => {
      // Common actions
      expect(enTranslations.save).toBe('Save');
      expect(enTranslations.cancel).toBe('Cancel');
      expect(enTranslations.delete).toBe('Delete');
      expect(enTranslations.edit).toBe('Edit');
      expect(enTranslations.create).toBe('Create');

      // Common states
      expect(enTranslations.loading).toBe('Loading...');
      expect(enTranslations.saving).toBe('Saving...');
      expect(enTranslations.error).toBe('Error');

      // Common labels
      expect(enTranslations.name).toBe('Name');
      expect(enTranslations.email).toBe('Email');
      expect(enTranslations.status).toBe('Status');
      expect(enTranslations.actions).toBe('Actions');

      // Common messages
      expect(enTranslations.noData).toBe('No data available');
      expect(enTranslations.selectAll).toBe('Select all');
      expect(enTranslations.all).toBe('All');
    });

    test('should have consistent structure', () => {
      const keys = Object.keys(enTranslations);
      expect(keys.length).toBeGreaterThan(0);
      
      // Verify no undefined values
      keys.forEach(key => {
        expect(enTranslations[key as keyof typeof enTranslations]).toBeDefined();
        expect(typeof enTranslations[key as keyof typeof enTranslations]).toBe('string');
      });
    });
  });

  describe('Translation consistency', () => {
    test('should have same keys in both languages', () => {
      const esKeys = Object.keys(esTranslations).sort();
      const enKeys = Object.keys(enTranslations).sort();
      
      expect(esKeys).toEqual(enKeys);
    });

    test('should have non-empty translations', () => {
      const esKeys = Object.keys(esTranslations);
      const enKeys = Object.keys(enTranslations);
      
      esKeys.forEach(key => {
        expect(esTranslations[key as keyof typeof esTranslations].trim()).not.toBe('');
      });
      
      enKeys.forEach(key => {
        expect(enTranslations[key as keyof typeof enTranslations].trim()).not.toBe('');
      });
    });
  });
});
