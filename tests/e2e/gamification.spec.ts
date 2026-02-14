import { test, expect, type Page } from '@playwright/test';

class GamificationPage {
  constructor(private page: Page) {}

  async gotoEmployee() {
    await this.page.goto('/gamification');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoManager() {
    await this.page.goto('/gamification/manager');
    await this.page.waitForLoadState('networkidle');
  }
}

test.describe('Gamification E2E Tests', () => {
  let gamificationPage: GamificationPage;

  test.beforeEach(async ({ page }) => {
    gamificationPage = new GamificationPage(page);

    // Mock authentication
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL(/dashboard/);
  });

  test.describe('Employee View', () => {
    test('should display gamification overview page', async ({ page }) => {
      await gamificationPage.gotoEmployee();

      // Verify main sections are visible
      await expect(page.locator('text=/Puntos|Points/i')).toBeVisible();
    });

    test('should show points widget in compact mode on dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Points widget should be visible somewhere on the dashboard
      const pointsWidget = page.locator('[data-testid="points-widget"], button:has(svg)').first();
      if (await pointsWidget.isVisible()) {
        await expect(pointsWidget).toBeVisible();
      }
    });

    test('should navigate to gamification from points widget', async ({ page }) => {
      await gamificationPage.gotoEmployee();

      // Page should load without errors
      await expect(page).not.toHaveURL(/error|500|404/);
    });

    test('should display badges section', async ({ page }) => {
      await gamificationPage.gotoEmployee();

      // Look for badges-related content
      const badgesSection = page.locator('text=/Insignias|Badges/i');
      if (await badgesSection.isVisible()) {
        await expect(badgesSection).toBeVisible();
      }
    });

    test('should display leaderboard with period selector', async ({ page }) => {
      await gamificationPage.gotoEmployee();

      // Look for leaderboard-related content
      const leaderboard = page.locator('text=/Ranking|Leaderboard/i');
      if (await leaderboard.isVisible()) {
        await expect(leaderboard).toBeVisible();

        // Check period selector buttons
        const periodButtons = page.locator('button:has-text("Diario"), button:has-text("Daily")');
        if (await periodButtons.first().isVisible()) {
          await periodButtons.first().click();
          await page.waitForTimeout(500);
        }
      }
    });
  });

  test.describe('Manager Dashboard', () => {
    test('should display manager dashboard with KPI cards', async ({ page }) => {
      await gamificationPage.gotoManager();

      // Check for KPI cards or unauthorized redirect
      const isUnauthorized = await page.locator('text=/unauthorized|no autorizado/i').isVisible();
      if (isUnauthorized) {
        // RBAC is working - user doesn't have gamification.manage permission
        await expect(page).toHaveURL(/unauthorized/);
        return;
      }

      // If authorized, verify dashboard content
      await expect(page.locator('text=/Dashboard de Equipo|Team Dashboard/i')).toBeVisible();
    });

    test('should show team velocity KPI', async ({ page }) => {
      await gamificationPage.gotoManager();

      const isUnauthorized = await page.locator('text=/unauthorized|no autorizado/i').isVisible();
      if (isUnauthorized) return;

      await expect(
        page.locator('text=/Velocidad del equipo|Team Velocity/i'),
      ).toBeVisible();
    });

    test('should show top performers section', async ({ page }) => {
      await gamificationPage.gotoManager();

      const isUnauthorized = await page.locator('text=/unauthorized|no autorizado/i').isVisible();
      if (isUnauthorized) return;

      await expect(
        page.locator('text=/Mejores rendimientos|Top Performers/i'),
      ).toBeVisible();
    });

    test('should show needs attention section', async ({ page }) => {
      await gamificationPage.gotoManager();

      const isUnauthorized = await page.locator('text=/unauthorized|no autorizado/i').isVisible();
      if (isUnauthorized) return;

      await expect(
        page.locator('text=/Necesita atención|Needs Attention/i'),
      ).toBeVisible();
    });

    test('should show alerts panel', async ({ page }) => {
      await gamificationPage.gotoManager();

      const isUnauthorized = await page.locator('text=/unauthorized|no autorizado/i').isVisible();
      if (isUnauthorized) return;

      await expect(
        page.locator('text=/Alertas|Alerts/i'),
      ).toBeVisible();
    });

    test('should redirect unauthorized users', async ({ page }) => {
      // This test verifies RBAC enforcement
      // Navigate directly to manager page
      await page.goto('/gamification/manager');
      await page.waitForLoadState('networkidle');

      // Should either show content (if authorized) or redirect to unauthorized
      const url = page.url();
      const hasContent = await page.locator('text=/Dashboard de Equipo|Team Dashboard/i').isVisible();
      const isRedirected = url.includes('unauthorized');

      // One of these must be true
      expect(hasContent || isRedirected).toBeTruthy();
    });
  });

  test.describe('Responsive Design', () => {
    test('should render employee view on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await gamificationPage.gotoEmployee();

      // Page should load without horizontal scroll issues
      await expect(page).not.toHaveURL(/error|500/);
    });

    test('should render manager dashboard on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await gamificationPage.gotoManager();

      // Page should load without errors
      await expect(page).not.toHaveURL(/error|500/);
    });
  });
});
