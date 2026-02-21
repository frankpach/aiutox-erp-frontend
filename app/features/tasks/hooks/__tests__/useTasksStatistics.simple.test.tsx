/**
 * Simple tests for useTasksStatistics hook
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useTasksStatistics, useTasksStatisticsControlled } from '../useTasksStatistics';
import { tasksStatisticsApi } from '../../api/statistics.api';

// Mock the API
vi.mock('../../api/statistics.api', () => ({
  tasksStatisticsApi: {
    getStatistics: vi.fn(),
  },
}));

// Mock data
const mockStatisticsData = {
  total_tasks: 100,
  by_status: { todo: 40, in_progress: 30, done: 30 },
  by_priority: { high: 20, medium: 50, low: 30 },
  by_custom_state: { 'Vendido': 15, 'Llamado': 10 },
  completion_rate: 30.0,
  completed_tasks: 30,
  overdue_tasks: 5,
};

describe('useTasksStatistics', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  it('should fetch statistics successfully', async () => {
    vi.mocked(tasksStatisticsApi.getStatistics).mockResolvedValue(mockStatisticsData);

    const { result } = renderHook(() => useTasksStatistics(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual(mockStatisticsData);
    });

    expect(tasksStatisticsApi.getStatistics).toHaveBeenCalledWith(undefined);
  });

  it('should fetch statistics with filters', async () => {
    const filters = {
      date_from: '2026-01-01',
      date_to: '2026-01-31',
      status: 'todo',
      priority: 'high',
    };

    vi.mocked(tasksStatisticsApi.getStatistics).mockResolvedValue(mockStatisticsData);

    const { result } = renderHook(() => useTasksStatistics(filters), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockStatisticsData);
    });

    expect(tasksStatisticsApi.getStatistics).toHaveBeenCalledWith(filters);
  });

  it('should handle API errors', async () => {
    vi.useFakeTimers();
    const error = new Error('API Error');
    vi.mocked(tasksStatisticsApi.getStatistics).mockRejectedValue(error);

    const errorQueryClient = new QueryClient({
      defaultOptions: {
        queries: { throwOnError: false },
      },
    });

    const { result } = renderHook(() => useTasksStatistics(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={errorQueryClient}>{children}</QueryClientProvider>
      ),
    });

    // Fast-forward through all retry delays (1s + 2s + 4s = 7s)
    await vi.advanceTimersByTimeAsync(10000);
    vi.useRealTimers();

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    }, { timeout: 3000 });

    expect(result.current.data).toBeUndefined();
  });
});

describe('useTasksStatisticsControlled', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  it('should be enabled by default', async () => {
    vi.mocked(tasksStatisticsApi.getStatistics).mockResolvedValue(mockStatisticsData);

    const { result } = renderHook(() => useTasksStatisticsControlled(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    expect(result.current.fetchStatus).toBe('fetching');

    await waitFor(() => {
      expect(result.current.data).toEqual(mockStatisticsData);
    });

    expect(tasksStatisticsApi.getStatistics).toHaveBeenCalled();
  });

  it('should not fetch when disabled', () => {
    vi.mocked(tasksStatisticsApi.getStatistics).mockResolvedValue(mockStatisticsData);

    const { result } = renderHook(() => useTasksStatisticsControlled(undefined, false), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(tasksStatisticsApi.getStatistics).not.toHaveBeenCalled();
  });
});
