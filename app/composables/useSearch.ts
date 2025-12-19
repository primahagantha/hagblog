import { useQuery } from '@tanstack/vue-query'
import { searchService, type SearchParams } from '~/services'

// Query Keys
export const searchKeys = {
  all: ['search'] as const,
  query: (params: SearchParams) => [...searchKeys.all, params] as const,
}

/**
 * Query hook for searching posts
 */
export function useSearchQuery(params: Ref<SearchParams> | SearchParams) {
  const paramsValue = computed(() => 
    'value' in params ? params.value : params
  )
  
  return useQuery({
    queryKey: computed(() => searchKeys.query(paramsValue.value)),
    queryFn: () => searchService.search(paramsValue.value),
    enabled: computed(() => !!paramsValue.value.q && paramsValue.value.q.length >= 2),
    staleTime: 1000 * 60 * 2, // 2 minutes - search results can be fresh for a while
  })
}

/**
 * Query hook for debounced search (useful for search-as-you-type)
 */
export function useDebouncedSearchQuery(
  query: Ref<string>,
  options?: { page?: Ref<number>; limit?: Ref<number>; debounceMs?: number }
) {
  const debouncedQuery = ref('')
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  // Watch for query changes and debounce
  watch(query, (newQuery) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(() => {
      debouncedQuery.value = newQuery
    }, options?.debounceMs ?? 300)
  }, { immediate: true })

  const params = computed<SearchParams>(() => ({
    q: debouncedQuery.value,
    page: options?.page?.value ?? 1,
    limit: options?.limit?.value ?? 10,
  }))

  return useQuery({
    queryKey: computed(() => searchKeys.query(params.value)),
    queryFn: () => searchService.search(params.value),
    enabled: computed(() => debouncedQuery.value.length >= 2),
    staleTime: 1000 * 60 * 2,
  })
}
