import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { categoriesService, type CreateCategoryData, type UpdateCategoryData } from '~/services'

// Query Keys
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (slug: string) => [...categoryKeys.details(), slug] as const,
}

/**
 * Query hook for fetching all categories
 */
export function useCategoriesQuery() {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: () => categoriesService.getCategories(),
  })
}

/**
 * Query hook for fetching a single category by slug
 */
export function useCategoryQuery(slug: Ref<string> | string) {
  const slugValue = computed(() => typeof slug === 'string' ? slug : slug.value)
  
  return useQuery({
    queryKey: computed(() => categoryKeys.detail(slugValue.value)),
    queryFn: () => categoriesService.getCategoryBySlug(slugValue.value),
    enabled: computed(() => !!slugValue.value),
  })
}

/**
 * Mutation hook for creating a category
 */
export function useCreateCategoryMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateCategoryData) => categoriesService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
    },
  })
}

/**
 * Mutation hook for updating a category
 */
export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateCategoryData) => categoriesService.updateCategory(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      if (data.slug) {
        queryClient.invalidateQueries({ queryKey: categoryKeys.detail(data.slug) })
      }
    },
  })
}

/**
 * Mutation hook for deleting a category
 */
export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => categoriesService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
    },
  })
}
