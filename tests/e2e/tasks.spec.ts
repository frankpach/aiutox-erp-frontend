import { test, expect, type Page } from '@playwright/test';

class TasksPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/tasks');
    await expect(this.page).toHaveTitle(/Tasks - AiutoX ERP/);
  }

  async createTask(taskData: {
    title: string;
    description?: string;
    priority?: string;
    assignedTo?: string;
    dueDate?: string;
  }) {
    // Click create button
    await this.page.click('[data-testid="create-task-button"]');
    
    // Wait for modal to appear
    await expect(this.page.locator('[data-testid="task-form-modal"]')).toBeVisible();
    
    // Fill form
    await this.page.fill('[data-testid="task-title"]', taskData.title);
    
    if (taskData.description) {
      await this.page.fill('[data-testid="task-description"]', taskData.description);
    }
    
    if (taskData.priority) {
      await this.page.selectOption('[data-testid="task-priority"]', taskData.priority);
    }
    
    if (taskData.assignedTo) {
      await this.page.selectOption('[data-testid="task-assigned-to"]', taskData.assignedTo);
    }
    
    if (taskData.dueDate) {
      await this.page.fill('[data-testid="task-due-date"]', taskData.dueDate);
    }
    
    // Submit form
    await this.page.click('[data-testid="save-task-button"]');
    
    // Wait for success message
    await expect(this.page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Wait for modal to close
    await expect(this.page.locator('[data-testid="task-form-modal"]')).not.toBeVisible();
  }

  async editTask(taskId: string, updates: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
  }) {
    // Find and click edit button
    await this.page.click(`[data-testid="edit-task-${taskId}"]`);
    
    // Wait for modal
    await expect(this.page.locator('[data-testid="task-form-modal"]')).toBeVisible();
    
    // Update fields
    if (updates.title) {
      await this.page.fill('[data-testid="task-title"]', updates.title);
    }
    
    if (updates.description) {
      await this.page.fill('[data-testid="task-description"]', updates.description);
    }
    
    if (updates.status) {
      await this.page.selectOption('[data-testid="task-status"]', updates.status);
    }
    
    if (updates.priority) {
      await this.page.selectOption('[data-testid="task-priority"]', updates.priority);
    }
    
    // Submit
    await this.page.click('[data-testid="save-task-button"]');
    
    // Wait for success
    await expect(this.page.locator('[data-testid="success-message"]')).toBeVisible();
  }

  async deleteTask(taskId: string) {
    // Click delete button
    await this.page.click(`[data-testid="delete-task-${taskId}"]`);
    
    // Wait for confirmation modal
    await expect(this.page.locator('[data-testid="delete-confirmation-modal"]')).toBeVisible();
    
    // Confirm deletion
    await this.page.click('[data-testid="confirm-delete-button"]');
    
    // Wait for success message
    await expect(this.page.locator('[data-testid="success-message"]')).toBeVisible();
  }

  async assignTask(taskId: string, userId: string) {
    // Click assign button
    await this.page.click(`[data-testid="assign-task-${taskId}"]`);
    
    // Wait for assign modal
    await expect(this.page.locator('[data-testid="assign-modal"]')).toBeVisible();
    
    // Select user
    await this.page.selectOption('[data-testid="user-select"]', userId);
    
    // Confirm assignment
    await this.page.click('[data-testid="confirm-assign-button"]');
    
    // Wait for success
    await expect(this.page.locator('[data-testid="success-message"]')).toBeVisible();
  }

  async updateTaskStatus(taskId: string, status: string) {
    // Click status dropdown
    await this.page.click(`[data-testid="status-dropdown-${taskId}"]`);
    
    // Select new status
    await this.page.click(`[data-testid="status-${status}"]`);
    
    // Wait for success
    await expect(this.page.locator('[data-testid="success-message"]')).toBeVisible();
  }

  async searchTasks(query: string) {
    // Fill search input
    await this.page.fill('[data-testid="search-input"]', query);
    
    // Wait for search results
    await this.page.waitForTimeout(500); // Debounce delay
  }

  async filterTasks(filters: {
    status?: string;
    priority?: string;
    assignedTo?: string;
  }) {
    // Open filters
    await this.page.click('[data-testid="filters-button"]');
    
    // Apply filters
    if (filters.status) {
      await this.page.selectOption('[data-testid="filter-status"]', filters.status);
    }
    
    if (filters.priority) {
      await this.page.selectOption('[data-testid="filter-priority"]', filters.priority);
    }
    
    if (filters.assignedTo) {
      await this.page.selectOption('[data-testid="filter-assigned-to"]', filters.assignedTo);
    }
    
    // Apply filters
    await this.page.click('[data-testid="apply-filters"]');
    
    // Wait for results
    await this.page.waitForTimeout(500);
  }

  async getTaskCard(taskId: string) {
    return this.page.locator(`[data-testid="task-card-${taskId}"]`);
  }

  async getTaskCount() {
    return this.page.locator('[data-testid="task-card"]').count();
  }

  async verifyTaskExists(taskId: string, expectedData: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    assignedTo?: string;
  }) {
    const taskCard = await this.getTaskCard(taskId);
    await expect(taskCard).toBeVisible();
    
    if (expectedData.title) {
      await expect(taskCard.locator('[data-testid="task-title"]')).toHaveText(expectedData.title);
    }
    
    if (expectedData.description) {
      await expect(taskCard.locator('[data-testid="task-description"]')).toHaveText(expectedData.description);
    }
    
    if (expectedData.status) {
      await expect(taskCard.locator('[data-testid="task-status"]')).toHaveText(expectedData.status);
    }
    
    if (expectedData.priority) {
      await expect(taskCard.locator('[data-testid="task-priority"]')).toHaveClass(/priority-${expectedData.priority}/);
    }
    
    if (expectedData.assignedTo) {
      await expect(taskCard.locator('[data-testid="task-assigned-to"]')).toHaveText(expectedData.assignedTo);
    }
  }

  async verifyTaskDoesNotExist(taskId: string) {
    const taskCard = await this.getTaskCard(taskId);
    await expect(taskCard).not.toBeVisible();
  }
}

test.describe('Tasks E2E Tests', () => {
  let tasksPage: TasksPage;

  test.beforeEach(async ({ page }) => {
    tasksPage = new TasksPage(page);
    
    // Mock authentication
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should display tasks page', async ({ page }) => {
    await tasksPage.goto();
    
    // Verify page elements
    await expect(page.locator('[data-testid="tasks-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="create-task-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="filters-button"]')).toBeVisible();
  });

  test('should create a new task', async ({ page }) => {
    await tasksPage.goto();
    
    const taskData = {
      title: 'Test Task E2E',
      description: 'This is a test task created by E2E test',
      priority: 'high',
      assignedTo: 'user-1',
      dueDate: '2026-12-31',
    };
    
    await tasksPage.createTask(taskData);
    
    // Verify task was created
    await expect(page.locator('[data-testid="task-card"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="task-title"]')).toHaveText(taskData.title);
    await expect(page.locator('[data-testid="task-description"]')).toHaveText(taskData.description);
    await expect(page.locator('[data-testid="task-priority"]')).toHaveClass(/priority-high/);
  });

  test('should edit an existing task', async ({ page: _page }) => {
    await tasksPage.goto();
    
    // First create a task
    await tasksPage.createTask({
      title: 'Original Task',
      description: 'Original description',
    });
    
    // Get the task ID (assuming it's the first task)
    const taskId = 'task-1'; // This would come from the actual task creation response
    
    // Edit the task
    await tasksPage.editTask(taskId, {
      title: 'Updated Task',
      description: 'Updated description',
      status: 'in_progress',
      priority: 'urgent',
    });
    
    // Verify updates
    await tasksPage.verifyTaskExists(taskId, {
      title: 'Updated Task',
      description: 'Updated description',
      status: 'En Progreso',
      priority: 'urgent',
    });
  });

  test('should delete a task', async ({ page: _page }) => {
    await tasksPage.goto();
    
    // Create a task first
    await tasksPage.createTask({
      title: 'Task to Delete',
    });
    
    const taskId = 'task-1';
    
    // Delete the task
    await tasksPage.deleteTask(taskId);
    
    // Verify task was deleted
    await tasksPage.verifyTaskDoesNotExist(taskId);
  });

  test('should assign task to user', async ({ page: _page }) => {
    await tasksPage.goto();
    
    // Create a task
    await tasksPage.createTask({
      title: 'Task to Assign',
    });
    
    const taskId = 'task-1';
    
    // Assign task
    await tasksPage.assignTask(taskId, 'user-2');
    
    // Verify assignment
    await tasksPage.verifyTaskExists(taskId, {
      assignedTo: 'Jane Smith', // This would be the user's name
    });
  });

  test('should update task status', async ({ page: _page }) => {
    await tasksPage.goto();
    
    // Create a task
    await tasksPage.createTask({
      title: 'Task Status Test',
    });
    
    const taskId = 'task-1';
    
    // Update status
    await tasksPage.updateTaskStatus(taskId, 'done');
    
    // Verify status update
    await tasksPage.verifyTaskExists(taskId, {
      status: 'Completado',
    });
  });

  test('should search tasks', async ({ page: _page }) => {
    await tasksPage.goto();
    
    // Create multiple tasks
    await tasksPage.createTask({ title: 'Important Task' });
    await tasksPage.createTask({ title: 'Regular Task' });
    await tasksPage.createTask({ title: 'Urgent Task' });
    
    // Search for specific task
    await tasksPage.searchTasks('Important');
    
    // Verify search results
    await expect(_page.locator('[data-testid="task-card"]')).toHaveCount(1);
    await expect(_page.locator('[data-testid="task-title"]')).toHaveText('Important Task');
  });

  test('should filter tasks', async ({ page: _page }) => {
    await tasksPage.goto();
    
    // Create tasks with different priorities
    await tasksPage.createTask({ title: 'High Priority Task', priority: 'high' });
    await tasksPage.createTask({ title: 'Low Priority Task', priority: 'low' });
    await tasksPage.createTask({ title: 'Medium Priority Task', priority: 'medium' });
    
    // Filter by high priority
    await tasksPage.filterTasks({ priority: 'high' });
    
    // Verify filter results
    await expect(_page.locator('[data-testid="task-card"]')).toHaveCount(1);
    await expect(_page.locator('[data-testid="task-title"]')).toHaveText('High Priority Task');
    await expect(_page.locator('[data-testid="task-priority"]')).toHaveClass(/priority-high/);
  });

  test('should handle pagination', async ({ page }) => {
    await tasksPage.goto();
    
    // Create many tasks (more than page size)
    for (let i = 1; i <= 25; i++) {
      await tasksPage.createTask({ title: `Task ${i}` });
    }
    
    // Verify first page
    await expect(page.locator('[data-testid="task-card"]')).toHaveCount(20);
    await expect(page.locator('[data-testid="pagination-info"]')).toContainText('1-20 of 25');
    
    // Go to next page
    await page.click('[data-testid="next-page"]');
    
    // Verify second page
    await expect(page.locator('[data-testid="task-card"]')).toHaveCount(5);
    await expect(page.locator('[data-testid="pagination-info"]')).toContainText('21-25 of 25');
  });

  test('should handle task with checklist', async ({ page }) => {
    await tasksPage.goto();
    
    // Create task with checklist
    await tasksPage.createTask({ title: 'Task with Checklist' });
    
    const taskId = 'task-1';
    
    // Add checklist items
    await page.click(`[data-testid="add-checklist-${taskId}"]`);
    await page.fill('[data-testid="checklist-item-input"]', 'First item');
    await page.click('[data-testid="add-checklist-item"]');
    
    await page.fill('[data-testid="checklist-item-input"]', 'Second item');
    await page.click('[data-testid="add-checklist-item"]');
    
    // Verify checklist items
    await expect(page.locator('[data-testid="checklist-item"]')).toHaveCount(2);
    
    // Mark item as complete
    await page.click('[data-testid="checklist-item-0-checkbox"]');
    
    // Verify completion
    await expect(page.locator('[data-testid="checklist-item-0"]')).toHaveClass(/completed/);
    await expect(page.locator('[data-testid="completion-percentage"]')).toHaveText('50%');
  });

  test('should handle file attachments', async ({ page }) => {
    await tasksPage.goto();
    
    // Create task
    await tasksPage.createTask({ title: 'Task with Files' });
    
    const taskId = 'task-1';
    
    // Upload file
    await page.click(`[data-testid="attach-file-${taskId}"]`);
    
    // Handle file upload
    const fileInput = page.locator('[data-testid="file-input"]');
    await fileInput.setInputFiles('test-files/sample.txt');
    
    await page.click('[data-testid="upload-button"]');
    
    // Verify file attachment
    await expect(page.locator('[data-testid="file-attachment"]')).toBeVisible();
    await expect(page.locator('[data-testid="file-name"]')).toHaveText('sample.txt');
  });

  test('should handle task tags', async ({ page }) => {
    await tasksPage.goto();
    
    // Create task
    await tasksPage.createTask({ title: 'Task with Tags' });
    
    const taskId = 'task-1';
    
    // Add tags
    await page.click(`[data-testid="add-tag-${taskId}"]`);
    await page.fill('[data-testid="tag-input"]', 'urgent');
    await page.keyboard.press('Enter');
    
    await page.fill('[data-testid="tag-input"]', 'frontend');
    await page.keyboard.press('Enter');
    
    // Verify tags
    await expect(page.locator('[data-testid="tag-urgent"]')).toBeVisible();
    await expect(page.locator('[data-testid="tag-frontend"]')).toBeVisible();
    
    // Filter by tag
    await page.click('[data-testid="tag-urgent"]');
    
    // Verify tag filter
    await expect(page.locator('[data-testid="task-card"]')).toHaveCount(1);
  });

  test('should handle task dependencies', async ({ page }) => {
    await tasksPage.goto();
    
    // Create parent task
    await tasksPage.createTask({ title: 'Parent Task' });
    const parentTaskId = 'task-1';
    
    // Create child task
    await tasksPage.createTask({ title: 'Child Task' });
    const childTaskId = 'task-2';
    
    // Add dependency
    await page.click(`[data-testid="add-dependency-${childTaskId}"]`);
    await page.selectOption('[data-testid="dependency-task-select"]', parentTaskId);
    await page.click('[data-testid="add-dependency-button"]');
    
    // Verify dependency
    await expect(page.locator(`[data-testid="dependency-${parentTaskId}"]`)).toBeVisible();
    
    // Try to complete parent task (should fail due to dependency)
    await tasksPage.updateTaskStatus(parentTaskId, 'done');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Cannot complete task with dependent tasks');
  });

  test('should handle bulk operations', async ({ page }) => {
    await tasksPage.goto();
    
    // Create multiple tasks
    for (let i = 1; i <= 5; i++) {
      await tasksPage.createTask({ title: `Bulk Task ${i}` });
    }
    
    // Select tasks
    await page.click('[data-testid="select-all-tasks"]');
    
    // Verify all tasks selected
    await expect(page.locator('[data-testid="task-checkbox"]:checked')).toHaveCount(5);
    
    // Bulk update status
    await page.click('[data-testid="bulk-actions-button"]');
    await page.selectOption('[data-testid="bulk-status-select"]', 'done');
    await page.click('[data-testid="apply-bulk-update"]');
    
    // Verify bulk update
    await expect(page.locator('[data-testid="success-message"]')).toContainText('5 tasks updated');
    
    // Verify all tasks have done status
    await expect(page.locator('[data-testid="task-status"]')).toHaveText('Completado');
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await tasksPage.goto();
    
    // Create a task
    await tasksPage.createTask({ title: 'Keyboard Navigation Test' });
    
    // Navigate with keyboard
    await page.keyboard.press('Tab'); // Focus first task
    await expect(page.locator('[data-testid="task-card"]:first-child')).toBeFocused();
    
    await page.keyboard.press('Enter'); // Open task details
    await expect(page.locator('[data-testid="task-details-modal"]')).toBeVisible();
    
    await page.keyboard.press('Escape'); // Close modal
    await expect(page.locator('[data-testid="task-details-modal"]')).not.toBeVisible();
    
    // Navigate to create button
    await page.keyboard.press('Tab'); // Navigate through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter'); // Click create button
    
    await expect(page.locator('[data-testid="task-form-modal"]')).toBeVisible();
  });

  test('should handle error states', async ({ page }) => {
    await tasksPage.goto();
    
    // Try to create task with invalid data
    await page.click('[data-testid="create-task-button"]');
    await page.click('[data-testid="save-task-button"]'); // Submit empty form
    
    // Verify validation errors
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error"]')).toHaveText('Title is required');
    
    // Try to create task with title too long
    await page.fill('[data-testid="task-title"]', 'a'.repeat(201));
    await page.click('[data-testid="save-task-button"]');
    
    await expect(page.locator('[data-testid="validation-error"]')).toHaveText('Title too long');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/tasks', route => route.abort('failed'));
    
    await tasksPage.goto();
    
    // Try to create task
    await tasksPage.createTask({ title: 'Network Error Test' });
    
    // Verify error handling
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toHaveText('Network error occurred');
    
    // Verify retry button
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('should be accessible', async ({ page }) => {
    await tasksPage.goto();
    
    // Check ARIA labels
    await expect(page.locator('[aria-label="Create new task"]')).toBeVisible();
    await expect(page.locator('[aria-label="Search tasks"]')).toBeVisible();
    await expect(page.locator('[aria-label="Filter tasks"]')).toBeVisible();
    
    // Check keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="create-task-button"]')).toBeFocused();
    
    // Check screen reader support
    const createButton = page.locator('[data-testid="create-task-button"]');
    await expect(createButton).toHaveAttribute('aria-describedby');
    await expect(createButton).toHaveAttribute('role', 'button');
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await tasksPage.goto();
    
    // Verify mobile layout
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-card"]')).toHaveCSS('display', 'block');
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Verify tablet layout
    await expect(page.locator('[data-testid="tasks-grid"]')).toHaveCSS('grid-template-columns', 'repeat(2, 1fr)');
    
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Verify desktop layout
    await expect(page.locator('[data-testid="tasks-grid"]')).toHaveCSS('grid-template-columns', 'repeat(3, 1fr)');
  });

  test('should handle concurrent operations', async ({ page }) => {
    await tasksPage.goto();
    
    // Create task
    await tasksPage.createTask({ title: 'Concurrent Test' });
    const taskId = 'task-1';
    
    // Start editing task
    await page.click(`[data-testid="edit-task-${taskId}"]`);
    await expect(page.locator('[data-testid="task-form-modal"]')).toBeVisible();
    
    // Try to delete same task (should be blocked)
    await page.click(`[data-testid="delete-task-${taskId}"]`);
    await expect(page.locator('[data-testid="error-message"]')).toHaveText('Task is being edited');
    
    // Complete edit first
    await page.fill('[data-testid="task-title"]', 'Updated Concurrent Test');
    await page.click('[data-testid="save-task-button"]');
    
    // Now try to delete
    await page.click(`[data-testid="delete-task-${taskId}"]`);
    await page.click('[data-testid="confirm-delete-button"]');
    
    // Verify deletion worked
    await tasksPage.verifyTaskDoesNotExist(taskId);
  });
});
