import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { uploadService } from '~/services'

// Query Keys
export const uploadKeys = {
  all: ['uploads'] as const,
  list: (limit?: number, offset?: number) => [...uploadKeys.all, 'list', { limit, offset }] as const,
}

/**
 * Query hook for fetching uploads (admin)
 */
export function useUploadsQuery(limit?: Ref<number>, offset?: Ref<number>) {
  return useQuery({
    queryKey: computed(() => uploadKeys.list(limit?.value, offset?.value)),
    queryFn: () => uploadService.getUploads(limit?.value, offset?.value),
  })
}

/**
 * Mutation hook for uploading a file (admin)
 */
export function useUploadFileMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (file: File) => uploadService.uploadFile(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uploadKeys.all })
    },
  })
}

/**
 * Mutation hook for deleting an upload (admin)
 */
export function useDeleteUploadMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => uploadService.deleteUpload(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uploadKeys.all })
    },
  })
}
