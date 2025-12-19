import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { usersService, type CreateUserData, type UpdateUserData } from '~/services/users'

// Query Keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
}

/**
 * Query hook for fetching all users (admin only)
 */
export function useUsersQuery() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: () => usersService.getUsers(),
  })
}

/**
 * Query hook for fetching a single user by ID (admin only)
 */
export function useUserQuery(id: Ref<string> | string) {
  const idValue = computed(() => typeof id === 'string' ? id : id.value)
  
  return useQuery({
    queryKey: computed(() => userKeys.detail(idValue.value)),
    queryFn: () => usersService.getUserById(idValue.value),
    enabled: computed(() => !!idValue.value),
  })
}

/**
 * Mutation hook for creating a user (admin only)
 */
export function useCreateUserMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateUserData) => usersService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

/**
 * Mutation hook for updating a user (admin only)
 */
export function useUpdateUserMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) => 
      usersService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

/**
 * Mutation hook for deleting a user (admin only)
 */
export function useDeleteUserMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => usersService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

/**
 * Mutation hook for uploading user avatar
 */
export function useUploadAvatarMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) => 
      usersService.uploadAvatar(userId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

/**
 * Mutation hook for removing user avatar
 */
export function useRemoveAvatarMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (userId: string) => usersService.removeAvatar(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}
