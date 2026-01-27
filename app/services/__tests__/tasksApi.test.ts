import { tasksApi } from '../tasksApi';
import { TaskStatus, TaskPriority } from '@/types/tasks';

// Mock de axios
jest.mock('axios');
const mockedAxios = require('axios');

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Tasks API Service', () => {
  const mockTenantId = 'tenant-1';
  const mockTask = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    assigned_to_id: 'user-1',
    created_by_id: 'user-2',
    tenant_id: mockTenantId,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('mock-token');
    mockedAxios.create.mockReturnValue({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    });
  });

  describe('getTasks', () => {
    it('fetches tasks with default parameters', async () => {
      const mockResponse = {
        data: {
          data: [mockTask],
          meta: {
            total: 1,
            page: 1,
            page_size: 20,
            total_pages: 1,
            has_next: false,
            has_prev: false,
          },
        },
      };

      mockedAxios.create().get.mockResolvedValue(mockResponse);

      const result = await tasksApi.getTasks();

      expect(mockedAxios.create().get).toHaveBeenCalledWith('/tasks', {
        params: {
          page: 1,
          page_size: 20,
          sort_by: 'created_at',
          sort_order: 'desc',
        },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('fetches tasks with custom parameters', async () => {
      const mockResponse = {
        data: {
          data: [mockTask],
          meta: {
            total: 1,
            page: 2,
            page_size: 10,
            total_pages: 1,
            has_next: false,
            has_prev: true,
          },
        },
      };

      mockedAxios.create().get.mockResolvedValue(mockResponse);

      const params = {
        page: 2,
        page_size: 10,
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        assigned_to: 'user-1',
        search: 'test query',
      };

      const result = await tasksApi.getTasks(params);

      expect(mockedAxios.create().get).toHaveBeenCalledWith('/tasks', {
        params: {
          page: 2,
          page_size: 10,
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
          assigned_to: 'user-1',
          search: 'test query',
          sort_by: 'created_at',
          sort_order: 'desc',
        },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('handles API errors', async () => {
      const error = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
      };

      mockedAxios.create().get.mockRejectedValue(error);

      await expect(tasksApi.getTasks()).rejects.toThrow('Internal Server Error');
    });

    it('includes authentication headers', async () => {
      const mockResponse = { data: { data: [], meta: {} } };
      mockedAxios.create().get.mockResolvedValue(mockResponse);

      await tasksApi.getTasks();

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: expect.any(String),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
          'X-Tenant-ID': mockTenantId,
        },
      });
    });
  });

  describe('getTask', () => {
    it('fetches a single task', async () => {
      const mockResponse = { data: mockTask };
      mockedAxios.create().get.mockResolvedValue(mockResponse);

      const result = await tasksApi.getTask('task-1');

      expect(mockedAxios.create().get).toHaveBeenCalledWith('/tasks/task-1');
      expect(result).toEqual(mockTask);
    });

    it('handles not found error', async () => {
      const error = {
        response: {
          status: 404,
          data: { message: 'Task not found' },
        },
      };

      mockedAxios.create().get.mockRejectedValue(error);

      await expect(tasksApi.getTask('nonexistent')).rejects.toThrow('Task not found');
    });
  });

  describe('createTask', () => {
    it('creates a new task', async () => {
      const newTask = {
        title: 'New Task',
        description: 'New Description',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        assigned_to_id: 'user-1',
        due_date: '2026-12-31',
      };

      const mockResponse = { data: { ...mockTask, ...newTask } };
      mockedAxios.create().post.mockResolvedValue(mockResponse);

      const result = await tasksApi.createTask(newTask);

      expect(mockedAxios.create().post).toHaveBeenCalledWith('/tasks', newTask);
      expect(result).toEqual(mockResponse.data);
    });

    it('validates required fields', async () => {
      const invalidTask = {
        description: 'Missing title',
      };

      const error = {
        response: {
          status: 400,
          data: { message: 'Title is required' },
        },
      };

      mockedAxios.create().post.mockRejectedValue(error);

      await expect(tasksApi.createTask(invalidTask)).rejects.toThrow('Title is required');
    });

    it('handles file attachments', async () => {
      const taskWithFiles = {
        title: 'Task with files',
        files: [
          new File(['content'], 'test.txt', { type: 'text/plain' }),
        ],
      };

      const mockResponse = { data: { ...mockTask, ...taskWithFiles } };
      mockedAxios.create().post.mockResolvedValue(mockResponse);

      const result = await tasksApi.createTask(taskWithFiles);

      expect(mockedAxios.create().post).toHaveBeenCalledWith(
        '/tasks',
        expect.objectContaining({
          title: 'Task with files',
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'multipart/form-data',
          }),
        })
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateTask', () => {
    it('updates an existing task', async () => {
      const updates = {
        title: 'Updated Task',
        status: TaskStatus.IN_PROGRESS,
      };

      const mockResponse = { data: { ...mockTask, ...updates } };
      mockedAxios.create().put.mockResolvedValue(mockResponse);

      const result = await tasksApi.updateTask('task-1', updates);

      expect(mockedAxios.create().put).toHaveBeenCalledWith('/tasks/task-1', updates);
      expect(result).toEqual(mockResponse.data);
    });

    it('handles partial updates', async () => {
      const partialUpdate = {
        status: TaskStatus.DONE,
      };

      const mockResponse = { data: { ...mockTask, ...partialUpdate } };
      mockedAxios.create().put.mockResolvedValue(mockResponse);

      const result = await tasksApi.updateTask('task-1', partialUpdate);

      expect(mockedAxios.create().put).toHaveBeenCalledWith('/tasks/task-1', partialUpdate);
      expect(result).toEqual(mockResponse.data);
    });

    it('handles validation errors', async () => {
      const invalidUpdate = {
        status: 'invalid_status',
      };

      const error = {
        response: {
          status: 400,
          data: { message: 'Invalid status' },
        },
      };

      mockedAxios.create().put.mockRejectedValue(error);

      await expect(tasksApi.updateTask('task-1', invalidUpdate)).rejects.toThrow('Invalid status');
    });
  });

  describe('deleteTask', () => {
    it('deletes a task', async () => {
      const mockResponse = { data: { success: true } };
      mockedAxios.create().delete.mockResolvedValue(mockResponse);

      const result = await tasksApi.deleteTask('task-1');

      expect(mockedAxios.create().delete).toHaveBeenCalledWith('/tasks/task-1');
      expect(result).toEqual(mockResponse.data);
    });

    it('handles deletion of non-existent task', async () => {
      const error = {
        response: {
          status: 404,
          data: { message: 'Task not found' },
        },
      };

      mockedAxios.create().delete.mockRejectedValue(error);

      await expect(tasksApi.deleteTask('nonexistent')).rejects.toThrow('Task not found');
    });
  });

  describe('assignTask', () => {
    it('assigns task to user', async () => {
      const mockResponse = { data: { ...mockTask, assigned_to_id: 'user-3' } };
      mockedAxios.create().post.mockResolvedValue(mockResponse);

      const result = await tasksApi.assignTask('task-1', 'user-3');

      expect(mockedAxios.create().post).toHaveBeenCalledWith('/tasks/task-1/assign', {
        assigned_to_id: 'user-3',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('handles assignment to invalid user', async () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'User not found' },
        },
      };

      mockedAxios.create().post.mockRejectedValue(error);

      await expect(tasksApi.assignTask('task-1', 'invalid-user')).rejects.toThrow('User not found');
    });
  });

  describe('unassignTask', () => {
    it('unassigns task', async () => {
      const mockResponse = { data: { ...mockTask, assigned_to_id: null } };
      mockedAxios.create().post.mockResolvedValue(mockResponse);

      const result = await tasksApi.unassignTask('task-1');

      expect(mockedAxios.create().post).toHaveBeenCalledWith('/tasks/task-1/unassign');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateTaskStatus', () => {
    it('updates task status', async () => {
      const mockResponse = { data: { ...mockTask, status: TaskStatus.DONE } };
      mockedAxios.create().put.mockResolvedValue(mockResponse);

      const result = await tasksApi.updateTaskStatus('task-1', TaskStatus.DONE);

      expect(mockedAxios.create().put).toHaveBeenCalledWith('/tasks/task-1/status', {
        status: TaskStatus.DONE,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('handles invalid status transition', async () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Invalid status transition' },
        },
      };

      mockedAxios.create().put.mockRejectedValue(error);

      await expect(tasksApi.updateTaskStatus('task-1', 'invalid')).rejects.toThrow('Invalid status transition');
    });
  });

  describe('searchTasks', () => {
    it('searches tasks with query', async () => {
      const mockResponse = {
        data: {
          data: [mockTask],
          meta: {
            total: 1,
            page: 1,
            page_size: 20,
            total_pages: 1,
            has_next: false,
            has_prev: false,
          },
        },
      };

      mockedAxios.create().get.mockResolvedValue(mockResponse);

      const result = await tasksApi.searchTasks('test query');

      expect(mockedAxios.create().get).toHaveBeenCalledWith('/tasks/search', {
        params: {
          q: 'test query',
          page: 1,
          page_size: 20,
        },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('searches tasks with filters', async () => {
      const mockResponse = {
        data: {
          data: [mockTask],
          meta: { total: 1, page: 1, page_size: 20, total_pages: 1, has_next: false, has_prev: false },
        },
      };

      mockedAxios.create().get.mockResolvedValue(mockResponse);

      const filters = {
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
      };

      const result = await tasksApi.searchTasks('test query', filters);

      expect(mockedAxios.create().get).toHaveBeenCalledWith('/tasks/search', {
        params: {
          q: 'test query',
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
          page: 1,
          page_size: 20,
        },
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getTaskStatistics', () => {
    it('fetches task statistics', async () => {
      const mockStats = {
        total_tasks: 100,
        completed_tasks: 60,
        pending_tasks: 30,
        overdue_tasks: 10,
        completion_rate: 0.6,
      };

      const mockResponse = { data: mockStats };
      mockedAxios.create().get.mockResolvedValue(mockResponse);

      const result = await tasksApi.getTaskStatistics();

      expect(mockedAxios.create().get).toHaveBeenCalledWith('/tasks/statistics');
      expect(result).toEqual(mockStats);
    });

    it('fetches statistics with date range', async () => {
      const mockResponse = { data: {} };
      mockedAxios.create().get.mockResolvedValue(mockResponse);

      const dateRange = {
        start_date: '2026-01-01',
        end_date: '2026-01-31',
      };

      await tasksApi.getTaskStatistics(dateRange);

      expect(mockedAxios.create().get).toHaveBeenCalledWith('/tasks/statistics', {
        params: dateRange,
      });
    });
  });

  describe('uploadTaskFile', () => {
    it('uploads file to task', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const mockResponse = {
        data: {
          id: 'file-1',
          filename: 'test.txt',
          size: 7,
          url: 'https://example.com/files/test.txt',
        },
      };

      mockedAxios.create().post.mockResolvedValue(mockResponse);

      const result = await tasksApi.uploadTaskFile('task-1', file);

      expect(mockedAxios.create().post).toHaveBeenCalledWith(
        '/tasks/task-1/files',
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'multipart/form-data',
          }),
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('validates file size', async () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.txt', { type: 'text/plain' });
      const error = {
        response: {
          status: 400,
          data: { message: 'File too large' },
        },
      };

      mockedAxios.create().post.mockRejectedValue(error);

      await expect(tasksApi.uploadTaskFile('task-1', largeFile)).rejects.toThrow('File too large');
    });

    it('validates file type', async () => {
      const invalidFile = new File(['content'], 'virus.exe', { type: 'application/x-msdownload' });
      const error = {
        response: {
          status: 400,
          data: { message: 'Invalid file type' },
        },
      };

      mockedAxios.create().post.mockRejectedValue(error);

      await expect(tasksApi.uploadTaskFile('task-1', invalidFile)).rejects.toThrow('Invalid file type');
    });
  });

  describe('deleteTaskFile', () => {
    it('deletes task file', async () => {
      const mockResponse = { data: { success: true } };
      mockedAxios.create().delete.mockResolvedValue(mockResponse);

      const result = await tasksApi.deleteTaskFile('task-1', 'file-1');

      expect(mockedAxios.create().delete).toHaveBeenCalledWith('/tasks/task-1/files/file-1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Error handling', () => {
    it('handles network errors', async () => {
      const networkError = new Error('Network Error');
      mockedAxios.create().get.mockRejectedValue(networkError);

      await expect(tasksApi.getTasks()).rejects.toThrow('Network Error');
    });

    it('handles timeout errors', async () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'Request timeout',
      };
      mockedAxios.create().get.mockRejectedValue(timeoutError);

      await expect(tasksApi.getTasks()).rejects.toThrow('Request timeout');
    });

    it('handles unauthorized errors', async () => {
      const authError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };
      mockedAxios.create().get.mockRejectedValue(authError);

      await expect(tasksApi.getTasks()).rejects.toThrow('Unauthorized');
    });

    it('handles forbidden errors', async () => {
      const forbiddenError = {
        response: {
          status: 403,
          data: { message: 'Forbidden' },
        },
      };
      mockedAxios.create().get.mockRejectedValue(forbiddenError);

      await expect(tasksApi.getTasks()).rejects.toThrow('Forbidden');
    });

    it('handles rate limiting errors', async () => {
      const rateLimitError = {
        response: {
          status: 429,
          data: { message: 'Too Many Requests' },
        },
      };
      mockedAxios.create().get.mockRejectedValue(rateLimitError);

      await expect(tasksApi.getTasks()).rejects.toThrow('Too Many Requests');
    });
  });

  describe('Request interceptors', () => {
    it('adds authentication token to requests', () => {
      localStorageMock.getItem.mockReturnValue('new-token');

      tasksApi.getTasks();

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: expect.any(String),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer new-token',
          'X-Tenant-ID': mockTenantId,
        },
      });
    });

    it('handles missing authentication token', () => {
      localStorageMock.getItem.mockReturnValue(null);

      expect(() => tasksApi.getTasks()).toThrow('Authentication token not found');
    });

    it('adds tenant ID to requests', () => {
      tasksApi.getTasks();

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Tenant-ID': mockTenantId,
          }),
        })
      );
    });
  });

  describe('Response interceptors', () => {
    it('handles successful responses', async () => {
      const mockResponse = { data: { data: [] }, status: 200 };
      mockedAxios.create().get.mockResolvedValue(mockResponse);

      const result = await tasksApi.getTasks();

      expect(result).toEqual(mockResponse.data);
    });

    it('handles error responses with custom error messages', async () => {
      const error = {
        response: {
          status: 422,
          data: {
            message: 'Validation failed',
            errors: {
              title: ['Title is required'],
            },
          },
        },
      };

      mockedAxios.create().post.mockRejectedValue(error);

      try {
        await tasksApi.createTask({});
      } catch (e) {
        expect(e.message).toBe('Validation failed');
        expect(e.errors).toEqual({ title: ['Title is required'] });
      }
    });

    it('handles server errors gracefully', async () => {
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
      };

      mockedAxios.create().get.mockRejectedValue(serverError);

      await expect(tasksApi.getTasks()).rejects.toThrow('Internal Server Error');
    });
  });
});
