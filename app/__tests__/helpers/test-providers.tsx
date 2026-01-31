/**
 * Test Providers - Centralized wrapper for testing with multiple providers
 * Provides all necessary context for complex components and hooks
 */

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "~/providers/ThemeProvider";

// Create a single QueryClient instance for tests
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

/**
 * Wrapper with all providers needed for most tests
 */
export const AllTheProviders: React.FC<{ 
  children: React.ReactNode;
  queryClient?: QueryClient;
}> = ({ children, queryClient = createTestQueryClient() }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

/**
 * Wrapper for hooks that don't need routing
 */
export const HookProviders: React.FC<{ 
  children: React.ReactNode;
  queryClient?: QueryClient;
}> = ({ children, queryClient = createTestQueryClient() }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

/**
 * Simple wrapper for components that only need QueryClient
 */
export const QueryProviders: React.FC<{ 
  children: React.ReactNode;
  queryClient?: QueryClient;
}> = ({ children, queryClient = createTestQueryClient() }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

/**
 * Render hook helper with proper providers
 */
export const renderHookWithProviders = (_hook: any, options?: {
  queryClient?: QueryClient;
  initialEntries?: string[];
}) => {
  const { queryClient = createTestQueryClient() } = options || {};
  
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <HookProviders queryClient={queryClient}>
      {children}
    </HookProviders>
  );

  return {
    queryClient,
    wrapper,
  };
};
