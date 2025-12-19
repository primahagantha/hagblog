import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { commentsService, type CommentFilters, type SubmitCommentData, type CommentBulkAction } from '~/services'

// Query Keys - Enhanced with pagination and filter-aware keys
export const commentKeys = {
  all: ['comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  list: (filters?: CommentFilters, page?: number, limit?: number) => 
    [...commentKeys.lists(), { filters, page, limit }] as const,
  // Granular list keys
  byStatus: (status: 'pending' | 'approved' | 'spam') => [...commentKeys.lists(), 'status', status] as const,
  byPost: (postId: number) => [...commentKeys.lists(), 'post', postId] as const,
  // Counts and post comments
  counts: () => [...commentKeys.all, 'counts'] as const,
  postComments: (postId: number) => [...commentKeys.all, 'postDetail', postId] as const,
}

/**
 * Query hook for fetching all comments with filters (admin)
 */
export function useCommentsQuery(filters?: Ref<CommentFilters | undefined>, page?: Ref<number>, limit?: Ref<number>) {
  return useQuery({
    queryKey: computed(() => commentKeys.list(filters?.value, page?.value, limit?.value)),
    queryFn: () => commentsService.getComments(filters?.value, page?.value, limit?.value),
  })
}

/**
 * Query hook for fetching comment counts (admin)
 */
export function useCommentCountsQuery() {
  return useQuery({
    queryKey: commentKeys.counts(),
    queryFn: () => commentsService.getCommentCounts(),
  })
}

/**
 * Query hook for fetching comments for a specific post
 */
export function usePostCommentsQuery(postId: Ref<number> | number) {
  const postIdValue = computed(() => typeof postId === 'number' ? postId : postId.value)
  
  return useQuery({
    queryKey: computed(() => commentKeys.postComments(postIdValue.value)),
    queryFn: () => commentsService.getPostComments(postIdValue.value),
    enabled: computed(() => !!postIdValue.value),
  })
}

/**
 * Mutation hook for submitting a comment
 */
export function useSubmitCommentMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ postId, data }: { postId: number; data: SubmitCommentData }) => 
      commentsService.submitComment(postId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.postComments(variables.postId) })
    },
  })
}

/**
 * Mutation hook for approving a comment (admin)
 */
export function useApproveCommentMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => commentsService.approveComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.all })
    },
  })
}

/**
 * Mutation hook for marking a comment as spam (admin)
 */
export function useMarkSpamMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => commentsService.markSpam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.all })
    },
  })
}

/**
 * Mutation hook for deleting a comment (admin)
 */
export function useDeleteCommentMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => commentsService.deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.all })
    },
  })
}

/**
 * Mutation hook for bulk actions on comments (admin)
 */
export function useBulkCommentActionMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ action, ids }: { action: CommentBulkAction; ids: number[] }) => 
      commentsService.bulkAction(action, ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.all })
    },
  })
}
