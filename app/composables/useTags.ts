import { useQuery } from '@tanstack/vue-query'
import { tagsService } from '~/services'

// Query Keys - Enhanced with limit-aware search keys
export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  // Search with limit for cache granularity
  search: (query: string, limit?: number) => [...tagKeys.all, 'search', query, limit] as const,
  // Detail keys
  details: () => [...tagKeys.all, 'detail'] as const,
  detail: (slug: string) => [...tagKeys.details(), slug] as const,
}

/**
 * Query hook for fetching all tags
 */
export function useTagsQuery() {
  return useQuery({
    queryKey: tagKeys.lists(),
    queryFn: () => tagsService.getTags(),
  })
}

/**
 * Query hook for searching tags
 */
export function useSearchTagsQuery(query: Ref<string>, limit?: number) {
  return useQuery({
    queryKey: computed(() => tagKeys.search(query.value, limit)),
    queryFn: () => tagsService.searchTags(query.value, limit),
    enabled: computed(() => query.value.length >= 2),
  })
}

/**
 * Query hook for fetching a single tag by slug
 */
export function useTagQuery(slug: Ref<string> | string) {
  const slugValue = computed(() => typeof slug === 'string' ? slug : slug.value)
  
  return useQuery({
    queryKey: computed(() => tagKeys.detail(slugValue.value)),
    queryFn: () => tagsService.getTagBySlug(slugValue.value),
    enabled: computed(() => !!slugValue.value),
  })
}
