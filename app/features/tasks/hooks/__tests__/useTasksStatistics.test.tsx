/**
 * Tests for useTasksStatistics hook
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ReactNode } from 'react';

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

  const TestWrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch statistics successfully', async () => {
    vi.mocked(tasksStatisticsApi.getStatistics).mockResolvedValue(mockStatisticsData);

    const wrapper = TestWrapper;
    const { result } = renderHook(() => useTasksStatistics(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual(mockStatisticsData);
      expect(result.current.error).toBeNull();
    });

    expect(tasksStatisticsApi.getStatistics).toHaveBeenCalledWith(undefined);
  });

  it('should fetch statistics with filters', async () => {
    const filters = { date_from: '2024-01-01', date_to: '2024-01-07' };
    vi.mocked(tasksStatisticsApi.getStatistics).mockResolvedValue(mockStatisticsData);

    const wrapper = TestWrapper;
    const { result } = renderHook(() => useTasksStatistics(filters), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockStatisticsData);
    });

    expect(tasksStatisticsApi.getStatistics).toHaveBeenCalledWith(filters);
  });

  it('should handle API errors', async () => {
    const error = new Error('API Error');
    vi.mocked(tasksStatisticsApi.getStatistics).mockRejectedValue(error);

    // Create a custom hook without retries for testing error handling
    const { result } = renderHook(
      () => useQuery({
        queryKey: ['tasks', 'statistics', undefined],
        queryFn: () => tasksStatisticsApi.getStatistics(),
        retry: false, // Disable retries for immediate error
      }),
      { wrapper: TestWrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.error).toBeTruthy();
  });

  it('should retry on failure', async () => {
    vi.mocked(tasksStatisticsApi.getStatistics)
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'))
      .mockResolvedValueOnce(mockStatisticsData);

    const { result } = renderHook(() => useTasksStatistics(), { wrapper: TestWrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockStatisticsData);
    }, { timeout: 5000 });

    expect(tasksStatisticsApi.getStatistics).toHaveBeenCalledTimes(3);
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

  const TestWrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should be enabled by default', async () => {
    vi.mocked(tasksStatisticsApi.getStatistics).mockResolvedValue(mockStatisticsData);

    const { result } = renderHook(() => useTasksStatisticsControlled(), { wrapper: TestWrapper });

    expect(result.current.fetchStatus).toBe('fetching');

    await waitFor(() => {
      expect(result.current.data).toEqual(mockStatisticsData);
    });

    expect(tasksStatisticsApi.getStatistics).toHaveBeenCalled();
  });

  it('should not fetch when disabled', () => {
    vi.mocked(tasksStatisticsApi.getStatistics).mockResolvedValue(mockStatisticsData);

    const wrapper = TestWrapper;
    const { result } = renderHook(() => useTasksStatisticsControlled(undefined, false), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(tasksStatisticsApi.getStatistics).not.toHaveBeenCalled();
  });

  it('should fetch when enabled', async () => {
    vi.mocked(tasksStatisticsApi.getStatistics).mockResolvedValue(mockStatisticsData);

    const wrapper = TestWrapper;
    const { result } = renderHook(() => useTasksStatisticsControlled(undefined, true), { wrapper });

    expect(result.current.fetchStatus).toBe('fetching');

    await waitFor(() => {
      expect(result.current.data).toEqual(mockStatisticsData);
    });

    expect(tasksStatisticsApi.getStatistics).toHaveBeenCalled();
  });

  it('should handle enable/disable changes', async () => {
    vi.mocked(tasksStatisticsApi.getStatistics).mockResolvedValue(mockStatisticsData);

    const wrapper = TestWrapper;
    const { result, rerender } = renderHook(
      ({ enabled }) => useTasksStatisticsControlled(undefined, enabled),
      { 
        wrapper,
        initialProps: { enabled: false }
      }
    );

    expect(result.current.fetchStatus).toBe('idle');
    expect(tasksStatisticsApi.getStatistics).not.toHaveBeenCalled();

    rerender({ enabled: true });

    expect(result.current.fetchStatus).toBe('fetching');

    await waitFor(() => {
      expect(result.current.data).toEqual(mockStatisticsData);
    });

    expect(tasksStatisticsApi.getStatistics).toHaveBeenCalled();
  });
});
