import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { newsletterService } from '~/services'

// Query Keys
export const newsletterKeys = {
  all: ['newsletter'] as const,
  subscribers: () => [...newsletterKeys.all, 'subscribers'] as const,
  stats: () => [...newsletterKeys.all, 'stats'] as const,
}

/**
 * Query hook for fetching all subscribers (admin)
 */
export function useSubscribersQuery() {
  return useQuery({
    queryKey: newsletterKeys.subscribers(),
    queryFn: () => newsletterService.getSubscribers(),
  })
}

/**
 * Query hook for fetching newsletter stats (admin)
 */
export function useNewsletterStatsQuery() {
  return useQuery({
    queryKey: newsletterKeys.stats(),
    queryFn: () => newsletterService.getStats(),
  })
}

/**
 * Mutation hook for subscribing to newsletter
 */
export function useSubscribeMutation() {
  return useMutation({
    mutationFn: (email: string) => newsletterService.subscribe(email),
  })
}

/**
 * Mutation hook for unsubscribing from newsletter
 */
export function useUnsubscribeMutation() {
  return useMutation({
    mutationFn: (email: string) => newsletterService.unsubscribe(email),
  })
}

/**
 * Mutation hook for deleting a subscriber (admin)
 */
export function useDeleteSubscriberMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => newsletterService.deleteSubscriber(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsletterKeys.all })
    },
  })
}
