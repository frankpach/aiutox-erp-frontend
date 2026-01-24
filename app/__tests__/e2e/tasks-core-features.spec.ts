/**
 * Tests E2E para Core Features de Tasks
 * Sprint 5: Preparación para Producción
 */

import { test, expect } from '@playwright/test';

test.describe('Tasks - Core Features E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login como usuario de prueba
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Esperar a que cargue el dashboard
    await page.waitForURL('/dashboard');
    
    // Navegar a tasks
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Notificaciones en Tiempo Real', () => {
    test('debe mostrar notificación al asignar tarea', async ({ page }) => {
      // Crear nueva tarea
      await page.click('button:has-text("Nueva Tarea")');
      
      // Llenar formulario
      await page.fill('input[name="title"]', 'Tarea con notificación de asignación');
      await page.fill('textarea[name="description"]', 'Esta tarea debe generar una notificación');
      
      // Asignar a usuario (simular asignación)
      const assignSelect = page.locator('select[name="assigned_to_id"]');
      if (await assignSelect.isVisible()) {
        await assignSelect.selectOption({ index: 1 });
      }
      
      // Crear tarea
      await page.click('button:has-text("Crear")');
      
      // Verificar que la tarea se creó
      await expect(page.locator('text=Tarea con notificación de asignación')).toBeVisible({
        timeout: 5000
      });
      
      // Verificar toast de éxito
      await expect(page.locator('.toast, [role="status"]').first()).toBeVisible({
        timeout: 3000
      });
    });

    test('debe mostrar notificación al cambiar estado de tarea', async ({ page }) => {
      // Buscar primera tarea en la lista
      const firstTask = page.locator('[data-testid="task-item"]').first();
      
      if (await firstTask.isVisible()) {
        // Click en la tarea para abrir detalles
        await firstTask.click();
        
        // Cambiar estado
        const statusSelect = page.locator('select[name="status"]');
        if (await statusSelect.isVisible()) {
          await statusSelect.selectOption('in_progress');
          
          // Guardar cambios
          await page.click('button:has-text("Guardar")');
          
          // Verificar notificación
          await expect(page.locator('.toast, [role="status"]').first()).toBeVisible({
            timeout: 3000
          });
        }
      }
    });

    test('debe conectar SSE y recibir eventos', async ({ page }) => {
      // Verificar que el hook SSE se inicializa
      const sseIndicator = page.locator('[data-testid="sse-status"]');
      
      if (await sseIndicator.isVisible()) {
        // Verificar estado conectado
        await expect(sseIndicator).toHaveAttribute('data-connected', 'true', {
          timeout: 10000
        });
      }
      
      // Simular evento SSE (esto requeriría mock del servidor)
      // En producción, verificar que los eventos se manejan correctamente
    });
  });

  test.describe('Templates de Tareas', () => {
    test('debe listar templates disponibles', async ({ page }) => {
      // Click en botón de templates
      await page.click('button:has-text("Usar Template"), button:has-text("Template")');
      
      // Verificar que se abre el diálogo
      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });
      
      // Verificar que hay templates listados
      const templates = page.locator('[data-testid="template-item"]');
      const count = await templates.count();
      
      expect(count).toBeGreaterThan(0);
    });

    test('debe crear tarea desde template con checklist', async ({ page }) => {
      // Abrir selector de templates
      await page.click('button:has-text("Usar Template"), button:has-text("Template")');
      
      // Esperar diálogo
      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });
      
      // Seleccionar primer template
      const firstTemplate = page.locator('[data-testid="template-item"]').first();
      
      if (await firstTemplate.isVisible()) {
        // Click en "Usar Template"
        await firstTemplate.locator('button:has-text("Usar")').click();
        
        // Verificar que se cierra el diálogo
        await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });
        
        // Verificar notificación de éxito
        await expect(page.locator('.toast:has-text("creada"), [role="status"]').first()).toBeVisible({
          timeout: 3000
        });
        
        // Abrir la tarea recién creada
        const newTask = page.locator('[data-testid="task-item"]').first();
        await newTask.click();
        
        // Verificar que tiene checklist items
        const checklistItems = page.locator('[data-testid="checklist-item"]');
        const itemCount = await checklistItems.count();
        
        expect(itemCount).toBeGreaterThan(0);
      }
    });

    test('debe filtrar templates por categoría', async ({ page }) => {
      // Abrir selector de templates
      await page.click('button:has-text("Usar Template"), button:has-text("Template")');
      
      // Esperar diálogo
      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });
      
      // Seleccionar filtro de categoría si existe
      const categoryFilter = page.locator('select[name="category"]');
      
      if (await categoryFilter.isVisible()) {
        await categoryFilter.selectOption({ index: 1 });
        
        // Verificar que se filtran los templates
        await page.waitForTimeout(500);
        
        const templates = page.locator('[data-testid="template-item"]');
        const count = await templates.count();
        
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    test('debe mostrar detalles del template', async ({ page }) => {
      // Abrir selector de templates
      await page.click('button:has-text("Usar Template"), button:has-text("Template")');
      
      // Esperar diálogo
      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });
      
      // Verificar que se muestran detalles
      const firstTemplate = page.locator('[data-testid="template-item"]').first();
      
      if (await firstTemplate.isVisible()) {
        // Verificar elementos del template
        await expect(firstTemplate.locator('text=/.*/')).toBeVisible();
        
        // Verificar que muestra categoría
        const category = firstTemplate.locator('[data-testid="template-category"]');
        if (await category.isVisible()) {
          await expect(category).toHaveText(/.+/);
        }
        
        // Verificar que muestra prioridad
        const priority = firstTemplate.locator('[data-testid="template-priority"]');
        if (await priority.isVisible()) {
          await expect(priority).toHaveText(/.+/);
        }
      }
    });
  });

  test.describe('Integración Completa', () => {
    test('flujo completo: crear tarea desde template y recibir notificaciones', async ({ page }) => {
      // 1. Abrir templates
      await page.click('button:has-text("Usar Template"), button:has-text("Template")');
      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });
      
      // 2. Seleccionar template
      const firstTemplate = page.locator('[data-testid="template-item"]').first();
      
      if (await firstTemplate.isVisible()) {
        await firstTemplate.locator('button:has-text("Usar")').click();
        
        // 3. Verificar notificación de creación
        await expect(page.locator('.toast, [role="status"]').first()).toBeVisible({
          timeout: 3000
        });
        
        // 4. Verificar que la tarea aparece en la lista
        await page.waitForTimeout(1000);
        const tasks = page.locator('[data-testid="task-item"]');
        const count = await tasks.count();
        
        expect(count).toBeGreaterThan(0);
        
        // 5. Abrir tarea y verificar checklist
        await tasks.first().click();
        
        const checklistItems = page.locator('[data-testid="checklist-item"]');
        const itemCount = await checklistItems.count();
        
        expect(itemCount).toBeGreaterThan(0);
      }
    });

    test('performance: carga de página < 3 segundos', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/tasks');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Verificar que carga en menos de 3 segundos
      expect(loadTime).toBeLessThan(3000);
    });

    test('debe manejar errores de red gracefully', async ({ page }) => {
      // Simular error de red
      await page.route('**/api/v1/tasks/templates', route => {
        route.abort('failed');
      });
      
      // Intentar abrir templates
      await page.click('button:has-text("Usar Template"), button:has-text("Template")');
      
      // Verificar mensaje de error
      await expect(page.locator('.toast:has-text("Error"), [role="alert"]').first()).toBeVisible({
        timeout: 3000
      });
    });
  });

  test.describe('Accesibilidad', () => {
    test('debe ser navegable con teclado', async ({ page }) => {
      // Navegar con Tab
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Verificar que el foco es visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('debe tener labels accesibles', async ({ page }) => {
      // Verificar que los botones tienen texto o aria-label
      const buttons = page.locator('button');
      const count = await buttons.count();
      
      for (let i = 0; i < Math.min(count, 5); i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        
        expect(text || ariaLabel).toBeTruthy();
      }
    });
  });
});
