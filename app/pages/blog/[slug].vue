<template>
  <!-- Loading State -->
    <div v-if="postPending" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading post...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="postError" class="error-container">
      <h1>Post Not Found</h1>
      <p>{{ postError.message }}</p>
      <NuxtLink to="/blog" class="btn btn-primary">Back to Blog</NuxtLink>
    </div>

    <!-- Post Content -->
    <article v-else-if="post" class="post-detail">
      <div class="container container-narrow">
        <!-- Breadcrumb -->
        <nav class="breadcrumb">
          <NuxtLink to="/">Home</NuxtLink>
          <span class="breadcrumb-separator">/</span>
          <NuxtLink to="/blog">Blog</NuxtLink>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">{{ post.title }}</span>
        </nav>

        <!-- Post Header -->
        <header class="post-header">
          <NuxtLink v-if="post.category" :to="`/category/${post.category.slug}`" class="badge">
            {{ post.category.name }}
          </NuxtLink>
          <h1 class="post-title">{{ post.title }}</h1>
          <div class="post-meta">
            <time class="post-date">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {{ formatDate(post.publishedAt || post.createdAt) }}
            </time>
            <span class="post-read-time">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              {{ estimateReadTime(post.content) }} min read
            </span>
            <span class="post-views">
              👁️ {{ post.viewCount }} views
            </span>
            <span v-if="wasEdited" class="post-edited">
              (Edited {{ formatDateTime(post.updatedAt) }})
            </span>
          </div>
          <!-- Like and Edit Actions -->
          <div class="post-actions">
            <button 
              class="like-btn" 
              :class="{ liked: isLiked }" 
              @click="toggleLike"
              :disabled="liking"
            >
              <svg v-if="isLiked" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>{{ post.likeCount || 0 }}</span>
            </button>
            <NuxtLink 
              v-if="canEdit" 
              :to="`/admin/posts/${post.id}/edit`"
              class="edit-btn-link"
            >
              ✏️ Edit
            </NuxtLink>
          </div>
          <div v-if="post.tags?.length" class="post-tags">
            <NuxtLink 
              v-for="tag in post.tags" 
              :key="tag.id" 
              :to="`/tag/${tag.slug}`"
              class="post-tag"
            >
              #{{ tag.name }}
            </NuxtLink>
          </div>
        </header>

        <!-- Featured Image -->
        <figure v-if="post.featuredImage" class="post-image">
          <img :src="post.featuredImage" :alt="post.title" />
        </figure>

        <!-- Post Content -->
        <div class="post-content" v-html="post.content"></div>

        <!-- Share Section -->
        <div class="share-section">
          <span class="share-label">Share this article:</span>
          <div class="share-buttons">
            <button class="share-btn" @click="shareTwitter" aria-label="Share on Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
            <button class="share-btn" @click="shareFacebook" aria-label="Share on Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            <button class="share-btn" @click="copyLink" aria-label="Copy link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Author Section -->
        <div v-if="post.author" class="author-card">
          <img :src="authorAvatarUrl" alt="Author" class="author-avatar" @error="handleAuthorAvatarError">
          <div class="author-info">
            <span class="author-label">Written by</span>
            <h4 class="author-name">{{ post.author.name }}</h4>
            <p class="author-bio">{{ post.author.bio || 'Passionate about technology and sharing knowledge with the community.' }}</p>
          </div>
        </div>

        <!-- Comments Section -->
        <section class="comments-section">
          <h3 class="comments-title">💬 Comments ({{ comments.length }})</h3>

          <!-- Reply Banner -->
          <div v-if="replyingTo" class="reply-banner">
            <span>Replying to <strong>@{{ replyingTo.name }}</strong></span>
            <button @click="cancelReply" class="cancel-reply">✕ Cancel</button>
          </div>

          <!-- Comment Form -->
          <form class="comment-form" @submit.prevent="submitComment">
            <div class="form-row" v-if="!user">
              <div class="form-group">
                <label for="name" class="form-label">Name</label>
                <input 
                  type="text" 
                  id="name"
                  v-model="commentForm.name"
                  class="input"
                  placeholder="Your name"
                  required
                >
              </div>
              <div class="form-group">
                <label for="email" class="form-label">Email (optional)</label>
                <input 
                  type="email" 
                  id="email"
                  v-model="commentForm.email"
                  class="input"
                  placeholder="your@email.com"
                >
              </div>
            </div>
            <div v-else class="form-user-info">
              <span>Commenting as <strong>{{ user.name }}</strong></span>
              <span v-if="isAdmin" class="admin-badge">Admin</span>
            </div>
            <div class="form-group">
              <label for="comment" class="form-label">Comment</label>
              <textarea 
                id="comment"
                ref="commentInput"
                v-model="commentForm.content"
                class="input"
                :placeholder="replyingTo ? `Reply to @${replyingTo.name}...` : 'Write your comment...'"
                rows="4"
                required
              ></textarea>
            </div>
            <!-- Image Upload -->
            <div class="form-group">
              <label class="form-label">Image (optional)</label>
              <div class="image-upload-area">
                <input type="file" id="commentImage" @change="handleImageUpload" accept="image/*" hidden>
                <div v-if="commentForm.imagePreview" class="image-preview">
                  <img :src="commentForm.imagePreview" alt="Preview">
                  <button type="button" class="remove-image" @click="removeImage">✕</button>
                </div>
                <label v-else for="commentImage" class="image-upload-btn">📷 Add Image</label>
              </div>
            </div>
            <!-- Honeypot field for spam protection -->
            <input type="text" name="website" v-model="honeypot" style="display: none;">
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              {{ submitting ? 'Submitting...' : (replyingTo ? 'Send Reply' : 'Submit Comment') }}
            </button>
          </form>

          <!-- Success/Error Message -->
          <div v-if="submitMessage" class="submit-message" :class="{ error: submitError }">
            {{ submitMessage }}
          </div>

          <!-- Loading Comments -->
          <div v-if="commentsPending" class="comments-loading">
            Loading comments...
          </div>

          <!-- Comments List -->
          <div v-else class="comments-list">
            <template v-for="comment in visibleComments" :key="comment.id">
              <!-- Main Comment -->
              <div class="comment-item" :class="{ 'is-pending': comment.status === 'pending' }">
                <div class="comment-avatar">
                  <img v-if="comment.image" :src="resolveImageUrl(comment.image)" alt="" class="comment-avatar-img" @error="(e: Event) => handleCommentAvatarError(e)" />
                  <span v-else>{{ comment.name.charAt(0).toUpperCase() }}</span>
                </div>
                <div class="comment-body">
                  <div class="comment-header">
                    <span class="comment-author">
                      {{ comment.name }}
                      <span v-if="isAdminComment(comment)" class="comment-admin-badge">Author</span>
                      <span v-if="comment.status === 'pending'" class="comment-pending-badge">Pending</span>
                    </span>
                    <time class="comment-date">{{ formatDate(comment.createdAt) }}</time>
                  </div>
                  <p class="comment-text" v-html="formatCommentContent(comment.content)"></p>
                  <img v-if="comment.image" :src="comment.image" alt="Comment image" class="comment-image">
                  <div class="comment-actions-row">
                    <button class="reply-btn" @click="startReply(comment)">↩ Reply</button>
                    <!-- Inline approve for pending comments (admin/blogger only) -->
                    <button 
                      v-if="canApprove && comment.status === 'pending'" 
                      class="approve-btn"
                      @click="approveComment(comment.id)"
                    >
                      ✓ Approve
                    </button>
                  </div>
                </div>
              </div>
              <!-- Replies -->
              <div v-if="comment.replies?.length" class="replies-container">
                <div v-for="reply in comment.replies" :key="reply.id" class="comment-item is-reply">
                  <div class="comment-avatar small">
                    <img v-if="reply.image" :src="resolveImageUrl(reply.image)" alt="" class="comment-avatar-img" @error="(e: Event) => handleCommentAvatarError(e)" />
                    <span v-else>{{ reply.name.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="comment-body">
                    <div class="comment-header">
                      <span class="comment-author">
                        {{ reply.name }}
                        <span v-if="isAdminComment(reply)" class="comment-admin-badge">Author</span>
                      </span>
                      <time class="comment-date">{{ formatDate(reply.createdAt) }}</time>
                    </div>
                    <p class="comment-text" v-html="formatCommentContent(reply.content)"></p>
                    <img v-if="reply.image" :src="reply.image" alt="Reply image" class="comment-image">
                    <div class="comment-actions-row">
                      <button class="reply-btn" @click="startReply(comment)">↩ Reply</button>
                      <button 
                        v-if="canApprove && reply.status === 'pending'" 
                        class="approve-btn"
                        @click="approveComment(reply.id)"
                      >
                        ✓ Approve
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <div v-if="!visibleComments.length" class="no-comments">
              No comments yet. Be the first to comment!
            </div>
          </div>
        </section>

        <!-- Related Posts -->
        <section v-if="relatedPosts.length" class="related-section">
          <h3 class="related-title">📖 Related Posts</h3>
          <div class="related-grid">
            <BlogPostCard
              v-for="relatedPost in relatedPosts"
              :key="relatedPost.slug"
              :slug="relatedPost.slug"
              :title="relatedPost.title"
              :excerpt="relatedPost.excerpt || ''"
              :image="relatedPost.featuredImage || ''"
              :category="relatedPost.category?.name || 'Uncategorized'"
              :date="formatDate(relatedPost.publishedAt || relatedPost.createdAt)"
              :read-time="estimateReadTime(relatedPost.content)"
            />
          </div>
        </section>
      </div>
    </article>
</template>

<script setup lang="ts">
import { useApi, postsService } from '~/services'

// Initialize API
useApi()

// Helper to resolve image URLs (prefix relative URLs with API base)
const resolveImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null
  if (url.startsWith('/uploads')) {
    const config = useRuntimeConfig()
    return `${config.public.apiBaseUrl}${url}`
  }
  return url
}

const route = useRoute()
const slug = computed(() => route.params.slug as string)

// Auth
const { user, isAdmin } = useAuth()

// Fetch post
const { data: post, isPending: postPending, error: postError } = usePostQuery(slug)

// Author avatar URL - resolved with API base
const authorAvatarUrl = computed(() => {
  const img = post.value?.author?.image
  if (!img) return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  return resolveImageUrl(img) || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
})

// Error handlers for avatar images
const handleAuthorAvatarError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
}

const handleCommentAvatarError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
  // Show the initials instead
  const parent = img.parentElement
  if (parent && !parent.querySelector('span')) {
    const span = document.createElement('span')
    span.textContent = '?'
    parent.appendChild(span)
  }
}

// Fetch comments
const postId = computed(() => post.value?.id || 0)
const { data: commentsData, isPending: commentsPending, refetch: refetchComments } = usePostCommentsQuery(postId)
const comments = computed(() => commentsData.value || [])

// Fetch related posts
const relatedFilters = ref({ status: 'published' as const })
const relatedPagination = ref({ page: 1, limit: 2, orderBy: 'newest' as const })
const { data: relatedData } = usePostsQuery(relatedFilters, relatedPagination)
const relatedPosts = computed(() => {
  const all = relatedData.value?.posts || []
  return all.filter(p => p.slug !== slug.value).slice(0, 2)
})

// SEO Meta
useSeoMeta({
  title: () => post.value ? `${post.value.title} - HagBlog` : 'Loading...',
  description: () => post.value?.excerpt || '',
  ogTitle: () => post.value?.title || '',
  ogImage: () => post.value?.featuredImage || '',
  twitterCard: 'summary_large_image',
})

// Comment form with localStorage support
const STORAGE_KEY = 'hagblog_commenter'
const commentForm = ref({
  name: '',
  email: '',
  content: '',
  imagePreview: '',
  imageFile: null as File | null,
})
const honeypot = ref('')
const submitting = ref(false)
const submitMessage = ref('')
const submitError = ref(false)
const replyingTo = ref<{ id: number; name: string } | null>(null)
const commentInput = ref<HTMLTextAreaElement | null>(null)

// Check if user can approve comments (admin or post author)
const canApprove = computed(() => {
  if (!user.value) return false
  const role = (user.value as any).role
  if (role === 'admin') return true
  if (role === 'blogger' && post.value?.author?.id === user.value.id) return true
  return false
})

// Check if user can edit this post (admin or post author)
const canEdit = computed(() => {
  if (!user.value) return false
  const role = (user.value as any).role
  if (role === 'admin') return true
  if ((role === 'blogger' || role === 'writer') && post.value?.author?.id === user.value.id) return true
  return false
})

// Filter visible comments - show pending only to those who can approve
const visibleComments = computed(() => {
  if (!comments.value) return []
  return comments.value.filter((comment: any) => {
    if (comment.status === 'approved') return true
    // Show pending to admin or post author
    if (canApprove.value) return true
    return false
  })
})

// Check if post was edited after publishing
const wasEdited = computed(() => {
  if (!post.value?.publishedAt || !post.value?.updatedAt) return false
  const published = new Date(post.value.publishedAt).getTime()
  const updated = new Date(post.value.updatedAt).getTime()
  // Consider edited if updated > 1 minute after publish
  return updated - published > 60000
})

// Like functionality
const liking = ref(false)
const isLiked = ref(false)
const LIKE_STORAGE_KEY = 'hagblog_likes'
const likePostMutation = useLikePostMutation()
const unlikePostMutation = useUnlikePostMutation()

// Load like state from localStorage on mount
const loadLikeState = () => {
  if (import.meta.client && post.value?.id) {
    const likes = JSON.parse(localStorage.getItem(LIKE_STORAGE_KEY) || '[]')
    isLiked.value = likes.includes(post.value.id)
  }
}

const toggleLike = async () => {
  if (!post.value?.id || liking.value) return
  liking.value = true
  try {
    const likes = JSON.parse(localStorage.getItem(LIKE_STORAGE_KEY) || '[]')
    if (isLiked.value) {
      await unlikePostMutation.mutateAsync(post.value.id)
      const newLikes = likes.filter((id: number) => id !== post.value!.id)
      localStorage.setItem(LIKE_STORAGE_KEY, JSON.stringify(newLikes))
      isLiked.value = false
    } else {
      await likePostMutation.mutateAsync(post.value.id)
      likes.push(post.value.id)
      localStorage.setItem(LIKE_STORAGE_KEY, JSON.stringify(likes))
      isLiked.value = true
    }
  } catch (e) {
    console.error('Failed to toggle like:', e)
  } finally {
    liking.value = false
  }
}

// Load from localStorage and track view on mount
onMounted(async () => {
  if (import.meta.client) {
    // Load commenter info
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        commentForm.value.name = data.name || ''
        commentForm.value.email = data.email || ''
      } catch {}
    }
    
    // Load like state
    loadLikeState()
    
    // Track view once per session per post
    if (post.value?.id) {
      const viewedKey = `viewed_${post.value.id}`
      if (!sessionStorage.getItem(viewedKey)) {
        try {
          await postsService.trackView(post.value.id)
          sessionStorage.setItem(viewedKey, 'true')
        } catch (e) {
          console.error('Failed to track view:', e)
        }
      }
    }
  }
})

// Also track view when post data loads (for SSR -> client transition)
watch(() => post.value?.id, async (newId) => {
  if (import.meta.client && newId) {
    loadLikeState()
    const viewedKey = `viewed_${newId}`
    if (!sessionStorage.getItem(viewedKey)) {
      try {
        await postsService.trackView(newId)
        sessionStorage.setItem(viewedKey, 'true')
      } catch (e) {
        console.error('Failed to track view:', e)
      }
    }
  }
}, { immediate: false })

// Save to localStorage when name/email changes
watch(() => [commentForm.value.name, commentForm.value.email], ([name, email]) => {
  if (import.meta.client && name) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, email }))
  }
}, { deep: true })

// Auto-fill name if logged in
watch(user, (u) => {
  if (u) {
    commentForm.value.name = u.name
  }
}, { immediate: true })

// Submit comment mutation
const submitCommentMutation = useSubmitCommentMutation()

const submitComment = async () => {
  // Honeypot check
  if (honeypot.value) return

  submitting.value = true
  submitMessage.value = ''
  submitError.value = false

  try {
    const response = await submitCommentMutation.mutateAsync({
      postId: post.value!.id,
      data: {
        name: user.value?.name || commentForm.value.name,
        email: commentForm.value.email || undefined,
        content: commentForm.value.content,
        // Only include image if user explicitly uploaded one for this comment
        image: commentForm.value.imageFile ? commentForm.value.imagePreview : undefined,
        parentId: replyingTo.value?.id || undefined,
      }
    })

    // Use backend response message (will say "Comment posted!" for auto-approve)
    submitMessage.value = response.message || 'Comment submitted!'
    commentForm.value.content = ''
    commentForm.value.imagePreview = ''
    commentForm.value.imageFile = null
    replyingTo.value = null

    // Refetch comments (auto-approved will appear immediately)
    setTimeout(() => refetchComments(), 500)
  } catch (e: any) {
    submitError.value = true
    submitMessage.value = e.message || 'Failed to submit comment'
  } finally {
    submitting.value = false
  }
}

const startReply = (comment: { id: number; name: string }) => {
  replyingTo.value = { id: comment.id, name: comment.name }
  commentInput.value?.focus()
}

const cancelReply = () => {
  replyingTo.value = null
}

// Image upload handlers
const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert('Image must be less than 2MB')
    return
  }

  commentForm.value.imageFile = file
  
  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    commentForm.value.imagePreview = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  commentForm.value.imagePreview = ''
  commentForm.value.imageFile = null
}

// Inline approve comment
const approveComment = async (commentId: number) => {
  try {
    const config = useRuntimeConfig()
    const baseUrl = config.public.apiBaseUrl || 'http://localhost:3001'
    
    const response = await fetch(`${baseUrl}/api/posts/${post.value!.id}/comments/${commentId}/approve`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to approve')
    }

    // Refetch comments
    refetchComments()
  } catch (e: any) {
    alert(e.message || 'Failed to approve comment')
  }
}

// Format comment content with highlighted mentions
const formatCommentContent = (content: string) => {
  return content.replace(/@(\w+)/g, '<span class="mention">@$1</span>')
}

// Check if comment is from admin/author
const isAdminComment = (comment: { name: string }) => {
  return post.value?.author?.name === comment.name
}

// Utility functions
const formatDate = (dateString: string | null) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const estimateReadTime = (content: string | null) => {
  if (!content) return 3
  const words = content.split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

const shareTwitter = () => {
  const url = encodeURIComponent(window.location.href)
  const text = encodeURIComponent(post.value?.title || '')
  window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank')
}

const shareFacebook = () => {
  const url = encodeURIComponent(window.location.href)
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
}

const copyLink = async () => {
  await navigator.clipboard.writeText(window.location.href)
  alert('Link copied to clipboard!')
}
</script>

<style scoped>
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: var(--space-4);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.post-detail {
  padding: var(--space-8) 0 var(--space-16);
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-bottom: var(--space-8);
}

.breadcrumb a {
  color: var(--text-muted);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.breadcrumb a:hover {
  color: var(--primary-500);
}

.breadcrumb-separator {
  color: var(--text-muted);
}

.breadcrumb-current {
  color: var(--text-secondary);
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Post Header */
.post-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.post-title {
  font-size: var(--text-4xl);
  line-height: 1.2;
  margin: var(--space-4) 0;
}

.post-meta {
  display: flex;
  justify-content: center;
  gap: var(--space-6);
  margin-bottom: var(--space-4);
}

.post-date, .post-read-time, .post-views {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.post-edited {
  font-size: var(--text-xs);
  color: var(--text-muted);
  font-style: italic;
}

/* Post Actions (Like + Edit) */
.post-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.like-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  color: var(--text-muted);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.like-btn:hover {
  border-color: var(--error-400);
  color: var(--error-500);
}

.like-btn.liked {
  background: linear-gradient(135deg, var(--error-50), var(--error-100));
  border-color: var(--error-300);
  color: var(--error-500);
}

.like-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.edit-btn-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-4);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  color: var(--text-muted);
  font-size: var(--text-sm);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.edit-btn-link:hover {
  border-color: var(--primary-400);
  color: var(--primary-500);
  background: var(--primary-50);
}

.post-tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.post-tag {
  font-size: var(--text-sm);
  color: var(--primary-500);
  text-decoration: none;
}

.post-tag:hover {
  text-decoration: underline;
}

/* Featured Image */
.post-image {
  margin: 0 0 var(--space-8);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.post-image img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

/* Post Content */
.post-content {
  font-size: var(--text-lg);
  line-height: 1.8;
  color: var(--text-secondary);
}

.post-content :deep(h2) {
  font-size: var(--text-2xl);
  color: var(--text-primary);
  margin: var(--space-8) 0 var(--space-4);
}

.post-content :deep(h3) {
  font-size: var(--text-xl);
  color: var(--text-primary);
  margin: var(--space-6) 0 var(--space-3);
}

.post-content :deep(p) {
  margin-bottom: var(--space-4);
}

.post-content :deep(ul), .post-content :deep(ol) {
  margin: var(--space-4) 0;
  padding-left: var(--space-6);
}

.post-content :deep(li) {
  margin-bottom: var(--space-2);
}

.post-content :deep(pre) {
  margin: var(--space-6) 0;
  padding: var(--space-4);
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  overflow-x: auto;
}

.post-content :deep(blockquote) {
  border-left: 4px solid var(--primary-500);
  padding-left: var(--space-4);
  margin: var(--space-6) 0;
  font-style: italic;
  color: var(--text-muted);
}

/* Share Section */
.share-section {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-6) 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  margin: var(--space-8) 0;
}

.share-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.share-buttons {
  display: flex;
  gap: var(--space-2);
}

.share-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--text-muted);
  background-color: var(--bg-tertiary);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.share-btn:hover {
  color: var(--primary-500);
  background-color: var(--primary-50);
}

/* Author Card */
.author-card {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-6);
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-12);
}

.author-avatar {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.author-info {
  flex: 1;
}

.author-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.author-name {
  font-size: var(--text-lg);
  margin: var(--space-1) 0;
}

.author-bio {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
}

/* Comments Section */
.comments-section {
  margin-bottom: var(--space-12);
}

.comments-title {
  font-size: var(--text-xl);
  margin-bottom: var(--space-6);
}

/* Reply Banner */
.reply-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  background: linear-gradient(135deg, var(--primary-50), var(--accent-50));
  border-left: 4px solid var(--primary-500);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
  font-size: var(--text-sm);
}

.cancel-reply {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: var(--text-sm);
}

.cancel-reply:hover {
  color: var(--error-500);
}

/* Comment Form */
.comment-form {
  background-color: var(--bg-tertiary);
  padding: var(--space-6);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-6);
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  margin-bottom: var(--space-2);
}

.form-user-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  font-size: var(--text-sm);
}

.admin-badge, .comment-admin-badge {
  padding: var(--space-1) var(--space-2);
  background: linear-gradient(135deg, var(--primary-500), var(--accent-500));
  color: white;
  font-size: var(--text-xs);
  font-weight: 600;
  border-radius: var(--radius-full);
}

.comment-pending-badge {
  padding: var(--space-1) var(--space-2);
  background: var(--warning-100);
  color: var(--warning-700);
  font-size: var(--text-xs);
  font-weight: 600;
  border-radius: var(--radius-full);
}

.comment-item.is-pending {
  opacity: 0.8;
  border-style: dashed;
}

.submit-message {
  padding: var(--space-3);
  background-color: #d1fae5;
  color: #059669;
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
  font-size: var(--text-sm);
}

.submit-message.error {
  background-color: #fee2e2;
  color: #dc2626;
}

/* Comments List */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.comments-loading, .no-comments {
  padding: var(--space-6);
  text-align: center;
  color: var(--text-muted);
}

.comment-item {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.comment-item.is-reply {
  margin-left: var(--space-8);
  border-left: 3px solid var(--primary-300);
}

.comment-avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-500), var(--accent-500));
  color: white;
  font-weight: 600;
  border-radius: var(--radius-full);
  flex-shrink: 0;
  overflow: hidden;
}

.comment-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-full);
}

.comment-avatar.small {
  width: 32px;
  height: 32px;
  font-size: var(--text-sm);
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.comment-author {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: 600;
  font-size: var(--text-sm);
}

.comment-date {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.comment-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--space-2);
}

.comment-text :deep(.mention) {
  color: var(--primary-500);
  font-weight: 600;
}

.reply-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: var(--text-xs);
  cursor: pointer;
  padding: 0;
}

.reply-btn:hover {
  color: var(--primary-500);
}

/* Form Row */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

/* Image Upload */
.image-upload-area {
  margin-top: var(--space-2);
}

.image-upload-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--bg-secondary);
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.image-upload-btn:hover {
  border-color: var(--primary-400);
  color: var(--primary-500);
}

.image-preview {
  position: relative;
  display: inline-block;
}

.image-preview img {
  max-width: 200px;
  max-height: 150px;
  border-radius: var(--radius-md);
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: var(--error-500);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: var(--text-xs);
}

/* Comment Image */
.comment-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: var(--radius-md);
  margin: var(--space-3) 0;
}

/* Replies Container */
.replies-container {
  margin-left: var(--space-6);
  padding-left: var(--space-4);
  border-left: 2px solid var(--primary-200);
}

.comment-body {
  flex: 1;
}

.comment-avatar.small {
  width: 32px;
  height: 32px;
  font-size: var(--text-xs);
}

/* Comment Actions Row */
.comment-actions-row {
  display: flex;
  gap: var(--space-4);
  align-items: center;
}

.approve-btn {
  background: none;
  border: none;
  color: var(--success-500);
  font-size: var(--text-xs);
  cursor: pointer;
  padding: 0;
  font-weight: 600;
}

.approve-btn:hover {
  text-decoration: underline;
}

/* Related Section */
.related-section {
  padding-top: var(--space-8);
  border-top: 1px solid var(--border-color);
}

.related-title {
  font-size: var(--text-xl);
  margin-bottom: var(--space-6);
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6);
}

@media (max-width: 768px) {
  .post-title {
    font-size: var(--text-2xl);
  }

  .post-meta {
    flex-direction: column;
    gap: var(--space-2);
  }

  .share-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .author-card {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }

  .related-grid {
    grid-template-columns: 1fr;
  }

  .comment-item.is-reply {
    margin-left: var(--space-4);
  }
}
</style>
