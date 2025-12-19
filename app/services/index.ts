/**
 * API Services Index
 * Re-exports all services for easy imports
 */

export { api, useApi } from './api'
export type { ApiResponse, PaginatedResponse } from './api'

export { postsService } from './posts'
export type { Post, PostFilters, PostPagination, CreatePostData, UpdatePostData, BulkAction } from './posts'

export { categoriesService } from './categories'
export type { Category, CreateCategoryData, UpdateCategoryData } from './categories'

export { tagsService } from './tags'
export type { Tag } from './tags'

export { commentsService } from './comments'
export type { Comment, CommentFilters, CommentCounts, SubmitCommentData, CommentBulkAction } from './comments'

export { settingsService } from './settings'
export type { PublicSettings, GroupedSettings } from './settings'

export { newsletterService } from './newsletter'
export type { Subscriber, NewsletterStats } from './newsletter'

export { dashboardService } from './dashboard'
export type { DashboardStats, RecentPost, RecentComment, PopularPost } from './dashboard'

export { searchService } from './search'
export type { SearchParams } from './search'

export { uploadService } from './upload'
export type { Upload, UploadResponse } from './upload'

export { usersService } from './users'
export type { User, CreateUserData, UpdateUserData } from './users'

export { auditLogsService } from './auditLogs'
export type { AuditLog, AuditLogFilters, AuditLogStats, AuditAction, AuditEntity, AuditDetails, PaginatedAuditLogs } from './auditLogs'

export { exportService } from './export'
export type { ExportFormat, ExportEntity } from './export'
