import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useApi, postsService, type PostFilters, type PostPagination, type CreatePostData, type UpdatePostData, type BulkAction } from '~/services'

// Query Keys - Enhanced with granular keys for better cache control
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters?: PostFilters, pagination?: PostPagination) => 
    [...postKeys.lists(), { filters, pagination }] as const,
  // Granular list keys
  featured: () => [...postKeys.lists(), 'featured'] as const,
  byCategory: (categoryId: number) => [...postKeys.lists(), 'category', categoryId] as const,
  byStatus: (status: 'draft' | 'published' | 'archived') => [...postKeys.lists(), 'status', status] as const,
  byAuthor: (authorId: string) => [...postKeys.lists(), 'author', authorId] as const,
  // Detail keys
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (slug: string) => [...postKeys.details(), slug] as const,
  detailById: (id: number) => [...postKeys.details(), 'id', id] as const,
}

/**
 * Query hook for fetching paginated posts
 */
export function usePostsQuery(filters?: Ref<PostFilters | undefined>, pagination?: Ref<PostPagination | undefined>) {
  // Initialize API with runtime config
  useApi()
  
  return useQuery({
    queryKey: computed(() => postKeys.list(filters?.value, pagination?.value)),
    queryFn: () => postsService.getPosts(filters?.value, pagination?.value),
  })
}

/**
 * Query hook for fetching a single post by slug
 */
export function usePostQuery(slug: Ref<string> | string) {
  const slugValue = computed(() => typeof slug === 'string' ? slug : slug.value)
  
  return useQuery({
    queryKey: computed(() => postKeys.detail(slugValue.value)),
    queryFn: () => postsService.getPostBySlug(slugValue.value),
    enabled: computed(() => !!slugValue.value),
  })
}

/**
 * Query hook for fetching a single post by ID (admin)
 */
export function usePostQueryById(id: Ref<number> | number) {
  const idValue = computed(() => typeof id === 'number' ? id : id.value)
  
  return useQuery({
    queryKey: computed(() => [...postKeys.details(), 'id', idValue.value] as const),
    queryFn: () => postsService.getPostById(idValue.value),
    enabled: computed(() => !!idValue.value && idValue.value > 0),
  })
}

/**
 * Mutation hook for creating a post
 */
export function useCreatePostMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreatePostData) => postsService.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() })
    },
  })
}

/**
 * Mutation hook for updating a post
 */
export function useUpdatePostMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdatePostData) => postsService.updatePost(data),
    onSuccess: (data, variables) => {
      // Invalidate list caches
      queryClient.invalidateQueries({ queryKey: postKeys.lists() })
      // Invalidate all detail caches (by slug and by ID)
      queryClient.invalidateQueries({ queryKey: postKeys.details() })
      if (data.slug) {
        queryClient.invalidateQueries({ queryKey: postKeys.detail(data.slug) })
      }
    },
  })
}

/**
 * Mutation hook for deleting a post
 */
export function useDeletePostMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => postsService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() })
    },
  })
}

/**
 * Mutation hook for bulk actions on posts
 */
export function useBulkPostActionMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ action, ids }: { action: BulkAction; ids: number[] }) => 
      postsService.bulkAction(action, ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all })
    },
  })
}

/**
 * Mutation hook for liking a post
 */
export function useLikePostMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => postsService.likePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.details() })
    },
  })
}

/**
 * Mutation hook for unliking a post
 */
export function useUnlikePostMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => postsService.unlikePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.details() })
    },
  })
}

