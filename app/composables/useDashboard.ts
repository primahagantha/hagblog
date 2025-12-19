import { useQuery } from '@tanstack/vue-query'
import { dashboardService } from '~/services'

// Query Keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  recentPosts: (limit?: number) => [...dashboardKeys.all, 'recentPosts', limit] as const,
  recentComments: (limit?: number) => [...dashboardKeys.all, 'recentComments', limit] as const,
  popularPosts: (limit?: number) => [...dashboardKeys.all, 'popularPosts', limit] as const,
}

/**
 * Query hook for fetching dashboard stats (admin)
 */
export function useDashboardStatsQuery() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardService.getStats(),
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  })
}

/**
 * Query hook for fetching recent posts (admin)
 */
export function useRecentPostsQuery(limit?: number) {
  return useQuery({
    queryKey: dashboardKeys.recentPosts(limit),
    queryFn: () => dashboardService.getRecentPosts(limit),
  })
}

/**
 * Query hook for fetching recent comments (admin)
 */
export function useRecentCommentsQuery(limit?: number) {
  return useQuery({
    queryKey: dashboardKeys.recentComments(limit),
    queryFn: () => dashboardService.getRecentComments(limit),
  })
}

/**
 * Query hook for fetching popular posts (admin)
 */
export function usePopularPostsQuery(limit?: number) {
  return useQuery({
    queryKey: dashboardKeys.popularPosts(limit),
    queryFn: () => dashboardService.getPopularPosts(limit),
  })
}
