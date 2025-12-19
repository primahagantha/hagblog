/**
 * Cloudinary Upload Utility
 * For uploading images to Cloudinary CDN
 */

interface UploadOptions {
  folder?: string
  transformation?: string
  eager?: string
}

interface UploadResult {
  url: string
  publicId: string
  width: number
  height: number
  format: string
}

export const useCloudinary = () => {
  const config = useRuntimeConfig()
  const cloudName = config.public.cloudinaryCloudName

  /**
   * Get optimized image URL with transformations
   */
  const getOptimizedUrl = (publicId: string, options?: {
    width?: number
    height?: number
    quality?: number
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png'
    crop?: 'fill' | 'fit' | 'scale' | 'thumb'
  }) => {
    if (!cloudName) return ''
    
    const transforms = []
    
    if (options?.width) transforms.push(`w_${options.width}`)
    if (options?.height) transforms.push(`h_${options.height}`)
    if (options?.quality) transforms.push(`q_${options.quality}`)
    if (options?.format) transforms.push(`f_${options.format}`)
    if (options?.crop) transforms.push(`c_${options.crop}`)
    
    // Default optimizations
    if (!options?.quality) transforms.push('q_auto')
    if (!options?.format) transforms.push('f_auto')
    
    const transformString = transforms.join(',')
    
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`
  }

  /**
   * Get responsive image srcset
   */
  const getResponsiveSrcset = (publicId: string, sizes: number[] = [320, 640, 960, 1280]) => {
    return sizes.map(size => {
      const url = getOptimizedUrl(publicId, { width: size })
      return `${url} ${size}w`
    }).join(', ')
  }

  /**
   * Upload image to Cloudinary (client-side unsigned upload)
   * Note: For production, use server-side upload with signed requests
   */
  const uploadImage = async (file: File, options?: UploadOptions): Promise<UploadResult | null> => {
    if (!cloudName) {
      console.warn('Cloudinary not configured')
      return null
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'hagblog_unsigned') // Create this in Cloudinary dashboard
    if (options?.folder) formData.append('folder', options.folder)

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      )
      
      if (!response.ok) throw new Error('Upload failed')
      
      const data = await response.json()
      
      return {
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
        format: data.format
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      return null
    }
  }

  /**
   * Delete image from Cloudinary (requires server-side)
   */
  const deleteImage = async (publicId: string): Promise<boolean> => {
    // This should be done server-side for security
    console.warn('Delete should be done server-side')
    return false
  }

  return {
    getOptimizedUrl,
    getResponsiveSrcset,
    uploadImage,
    deleteImage,
    isConfigured: !!cloudName
  }
}
