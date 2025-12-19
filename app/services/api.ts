/**
 * Base API configuration and fetch wrapper
 * Enhanced with typed errors, retry logic, and timeout support
 */

// Error codes for typed error handling
export type ApiErrorCode = 
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR'

/**
 * Custom API Error class with typed error codes
 */
export class ApiError extends Error {
  public readonly status: number
  public readonly code: ApiErrorCode
  public readonly details?: unknown

  constructor(message: string, status: number, code: ApiErrorCode, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }

  /**
   * Check if error is a network/connectivity error
   */
  isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR' || this.code === 'TIMEOUT_ERROR'
  }

  /**
   * Check if error is an authentication error
   */
  isAuthError(): boolean {
    return this.code === 'UNAUTHORIZED' || this.code === 'FORBIDDEN'
  }

  /**
   * Check if error is a validation error
   */
  isValidationError(): boolean {
    return this.code === 'VALIDATION_ERROR'
  }

  /**
   * Check if error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.code === 'SERVER_ERROR'
  }
}

export interface ApiResponse<T> {
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  success?: boolean
}

export interface PaginatedResponse<T> {
  posts?: T[]
  data?: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface RequestOptions extends RequestInit {
  timeout?: number
  retries?: number
}

class ApiClient {
  private baseUrl: string
  private defaultTimeout: number = 30000 // 30 seconds
  private defaultRetries: number = 1

  constructor() {
    this.baseUrl = ''
  }

  setBaseUrl(url: string) {
    this.baseUrl = url
  }

  /**
   * Map HTTP status to error code
   */
  private getErrorCode(status: number): ApiErrorCode {
    switch (status) {
      case 400:
        return 'VALIDATION_ERROR'
      case 401:
        return 'UNAUTHORIZED'
      case 403:
        return 'FORBIDDEN'
      case 404:
        return 'NOT_FOUND'
      case 409:
        return 'CONFLICT'
      default:
        return status >= 500 ? 'SERVER_ERROR' : 'UNKNOWN_ERROR'
    }
  }

  /**
   * Parse error response from backend
   */
  private async parseErrorResponse(response: Response): Promise<{ message: string; details?: unknown }> {
    try {
      const data = await response.json()
      return {
        message: typeof data.error === 'string' 
          ? data.error 
          : (data.error?.message || data.message || `HTTP ${response.status}`),
        details: data.error?.details || data.details,
      }
    } catch {
      return { message: `HTTP ${response.status}` }
    }
  }

  /**
   * Execute request with timeout and retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { timeout = this.defaultTimeout, retries = this.defaultRetries, ...fetchOptions } = options
    const url = `${this.baseUrl}/api${endpoint}`

    const config: RequestInit = {
      ...fetchOptions,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    }

    let lastError: Error | null = null
    let attempts = 0

    while (attempts <= retries) {
      attempts++
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      try {
        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const { message, details } = await this.parseErrorResponse(response)
          const code = this.getErrorCode(response.status)
          throw new ApiError(message, response.status, code, details)
        }

        return await response.json()
      } catch (error) {
        clearTimeout(timeoutId)

        // Handle abort/timeout
        if (error instanceof DOMException && error.name === 'AbortError') {
          lastError = new ApiError('Request timed out', 0, 'TIMEOUT_ERROR')
        }
        // Handle network errors
        else if (error instanceof TypeError && error.message.includes('fetch')) {
          lastError = new ApiError('Network error - please check your connection', 0, 'NETWORK_ERROR')
        }
        // Pass through ApiErrors
        else if (error instanceof ApiError) {
          // Only retry on server errors
          if (error.isServerError() && attempts <= retries) {
            lastError = error
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts)) // Exponential backoff
            continue
          }
          throw error
        }
        // Unknown errors
        else {
          throw error
        }

        // Retry on network/timeout errors
        if (attempts <= retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
          continue
        }

        throw lastError
      }
    }

    throw lastError || new ApiError('Request failed', 0, 'UNKNOWN_ERROR')
  }

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    let queryString = ''
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value))
        }
      })
      queryString = searchParams.toString()
    }

    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint
    return this.request<T>(fullEndpoint)
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60s timeout for uploads

    try {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const { message, details } = await this.parseErrorResponse(response)
        const code = this.getErrorCode(response.status)
        throw new ApiError(message, response.status, code, details)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('Upload timed out', 0, 'TIMEOUT_ERROR')
      }
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError('Network error - please check your connection', 0, 'NETWORK_ERROR')
      }
      throw error
    }
  }
}

export const api = new ApiClient()

// Composable to initialize API with runtime config
export function useApi() {
  const config = useRuntimeConfig()
  api.setBaseUrl(config.public.apiBaseUrl as string)
  return api
}

// Alternative export for direct access
export function useApiClient() {
  return useApi()
}
