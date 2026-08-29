// src/lib/queryClient.ts

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered stale after 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests once
      retry: 1,
      // Do not refetch on window focus by default (can be overridden per-query)
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
