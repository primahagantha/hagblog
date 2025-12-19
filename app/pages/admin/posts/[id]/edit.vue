<template>
  <!-- <NuxtLayout name="admin"> -->
    <div class="editor-page">
      <!-- Loading -->
      <div v-if="isPending" class="loading-state">Loading post...</div>

      <!-- Error -->
      <div v-else-if="error" class="error-state">
        Failed to load: {{ error.message }}
        <NuxtLink to="/admin/posts" class="btn btn-secondary">Back to Posts</NuxtLink>
      </div>

      <template v-else>
        <!-- Header -->
        <div class="editor-header">
          <NuxtLink to="/admin/posts" class="back-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span class="back-text">Back</span>
          </NuxtLink>
          <div class="header-actions">
            <span class="edit-badge">Editing #{{ postId }}</span>
            <span v-if="autoSaved" class="autosave-status">✓ Saved</span>
            <button class="btn btn-outline btn-md" @click="saveDraft" :disabled="saving">
              💾 Save Draft
            </button>
            <button class="btn btn-primary btn-md" @click="updatePost" :disabled="saving">
              ✓ {{ saving ? 'Updating...' : 'Update Post' }}
            </button>
          </div>
        </div>

        <!-- Editor Form -->
        <div class="editor-grid">
          <div class="editor-main">
            <!-- Title -->
            <div class="form-group">
              <label class="form-label">📝 Post Title</label>
              <input type="text" v-model="post.title" @input="generateSlug" placeholder="Enter your post title..." class="title-input">
            </div>

            <!-- Slug -->
            <div class="slug-field">
              <span class="slug-label">🔗 URL:</span>
              <span class="slug-prefix">/blog/</span>
              <input type="text" v-model="post.slug" class="slug-input">
            </div>

            <!-- Editor Mode Toggle -->
            <div class="editor-mode-toggle">
              <button :class="['mode-btn', { active: editorMode === 'wysiwyg' }]" @click="editorMode = 'wysiwyg'">
                ✏️ Visual Editor
              </button>
              <button :class="['mode-btn', { active: editorMode === 'markdown' }]" @click="editorMode = 'markdown'">
                📄 Markdown
              </button>
              <button :class="['mode-btn', { active: editorMode === 'preview' }]" @click="editorMode = 'preview'">
                👁️ Preview
              </button>
            </div>

            <!-- WYSIWYG Editor -->
            <div v-show="editorMode === 'wysiwyg'" class="wysiwyg-container">
              <!-- Toolbar -->
              <div class="editor-toolbar">
                <div class="toolbar-row">
                  <div class="toolbar-group">
                    <button type="button" @click="toggleFormat('bold')" :class="['toolbar-btn', { active: activeFormats.bold }]" title="Bold"><strong>B</strong></button>
                    <button type="button" @click="toggleFormat('italic')" :class="['toolbar-btn', { active: activeFormats.italic }]" title="Italic"><em>I</em></button>
                    <button type="button" @click="toggleFormat('underline')" :class="['toolbar-btn', { active: activeFormats.underline }]" title="Underline"><u>U</u></button>
                    <button type="button" @click="toggleFormat('strikethrough')" :class="['toolbar-btn', { active: activeFormats.strikethrough }]" title="Strikethrough"><s>S</s></button>
                  </div>
                  <div class="toolbar-divider"></div>
                  <div class="toolbar-group">
                    <button type="button" @click="toggleHeading('h1')" :class="['toolbar-btn', { active: activeFormats.h1 }]" title="Heading 1">H1</button>
                    <button type="button" @click="toggleHeading('h2')" :class="['toolbar-btn', { active: activeFormats.h2 }]" title="Heading 2">H2</button>
                    <button type="button" @click="toggleHeading('h3')" :class="['toolbar-btn', { active: activeFormats.h3 }]" title="Heading 3">H3</button>
                  </div>
                  <div class="toolbar-divider"></div>
                  <div class="toolbar-group">
                    <button type="button" @click="toggleFormat('ul')" :class="['toolbar-btn', { active: activeFormats.ul }]" title="Bullet List">☰</button>
                    <button type="button" @click="toggleFormat('ol')" :class="['toolbar-btn', { active: activeFormats.ol }]" title="Numbered List">1.</button>
                    <button type="button" @click="toggleFormat('quote')" :class="['toolbar-btn', { active: activeFormats.quote }]" title="Quote">❝</button>
                  </div>
                  <div class="toolbar-divider"></div>
                  <div class="toolbar-group">
                    <button type="button" @click="insertLink" class="toolbar-btn" title="Insert Link">🔗</button>
                    <button type="button" @click="triggerImageUpload" class="toolbar-btn" title="Insert Image">🖼️</button>
                    <button type="button" @click="toggleFormat('code')" :class="['toolbar-btn', { active: activeFormats.code }]" title="Code">{'<>'}</button>
                  </div>
                </div>
              </div>

              <!-- Content Area -->
              <div 
                ref="contentEditor"
                contenteditable="true"
                class="content-editor"
                @input="onContentInput"
                @paste="onPaste"
                @keyup="updateActiveFormats"
                @mouseup="updateActiveFormats"
                data-placeholder="Start writing your content here..."
              ></div>
            </div>

            <!-- Markdown Editor -->
            <div v-show="editorMode === 'markdown'" class="markdown-container">
              <textarea
                v-model="markdownContent"
                class="markdown-editor"
                placeholder="Write in Markdown format..."
                @input="onMarkdownInput"
              ></textarea>
            </div>

            <!-- Preview Mode -->
            <div v-show="editorMode === 'preview'" class="preview-container">
              <div class="preview-content" v-html="previewHtml"></div>
            </div>

            <input type="file" ref="imageInput" @change="handleImageUpload" accept="image/*" hidden>
          </div>

          <!-- Sidebar -->
          <div class="editor-sidebar">
            <!-- Featured Image -->
            <div class="sidebar-card">
              <h3 class="card-title">🖼️ Featured Image</h3>
              <div class="image-upload" @click="triggerFeaturedUpload" :class="{ 'has-image': post.image }">
                <img v-if="post.image" :src="post.image" alt="Featured" class="preview-image">
                <div v-else class="upload-placeholder">
                  <span class="upload-icon">📷</span>
                  <span class="upload-text">Click to upload</span>
                  <span class="upload-hint">JPG, PNG up to 5MB</span>
                </div>
                <button v-if="post.image" class="remove-image" @click.stop="post.image = ''">×</button>
              </div>
              <input type="file" ref="featuredInput" @change="handleFeaturedUpload" accept="image/*" hidden>
            </div>

            <!-- Category -->
            <div class="sidebar-card">
              <h3 class="card-title">📁 Category</h3>
              <div class="autocomplete-wrapper">
                <input 
                  type="text" 
                  v-model="categorySearch" 
                  @focus="showCategorySuggestions = true"
                  @blur="hideCategorySuggestions"
                  :placeholder="post.category || 'Type to search...'"
                  class="input-lg"
                >
                <div v-if="post.category" class="selected-category">
                  <span class="category-badge">{{ post.category }}</span>
                  <button @click="post.category = ''; categorySearch = ''" class="clear-btn">×</button>
                </div>
                <div v-if="showCategorySuggestions && filteredCategories.length" class="suggestions-dropdown">
                  <button
                    v-for="(cat, i) in filteredCategories"
                    :key="cat"
                    @mousedown.prevent="selectCategory(cat)"
                    :class="['suggestion-item', { active: i === categoryIndex }]"
                  >
                    📁 {{ cat }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Status -->
            <div class="sidebar-card">
              <h3 class="card-title">📊 Status</h3>
              <select v-model="post.status" class="input-lg">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Unpublished</option>
              </select>
            </div>

            <!-- Tags -->
            <div class="sidebar-card">
              <h3 class="card-title">🏷️ Tags</h3>
              <div class="tags-container">
                <div class="tags-list">
                  <span v-for="(tag, i) in post.tags" :key="i" class="tag">
                    {{ tag }}
                    <button @click="removeTag(i)" class="tag-remove">×</button>
                  </span>
                </div>
                <div class="autocomplete-wrapper">
                  <input 
                    type="text" 
                    v-model="tagSearch"
                    @focus="showTagSuggestions = true"
                    @blur="hideTagSuggestions"
                    @keydown.enter.prevent="selectTag(filteredTags[tagIndex] || tagSearch)"
                    placeholder="Type to add tags..."
                    class="input-lg"
                  >
                  <div v-if="showTagSuggestions && (filteredTags.length || tagSearch)" class="suggestions-dropdown">
                    <button
                      v-for="(tag, i) in filteredTags"
                      :key="tag"
                      @mousedown.prevent="selectTag(tag)"
                      :class="['suggestion-item', { active: i === tagIndex }]"
                    >
                      🏷️ {{ tag }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- SEO Summary -->
            <div class="sidebar-card">
              <h3 class="card-title">🔍 SEO Summary</h3>
              <textarea v-model="post.summary" class="input-lg" rows="3" placeholder="Description for search engines..."></textarea>
              <div class="char-count" :class="{ over: post.summary.length > 160 }">
                {{ post.summary.length }}/160
              </div>
            </div>

            <!-- SEO Preview -->
            <div class="sidebar-card seo-card">
              <h3 class="card-title">📊 Search Preview</h3>
              <div class="seo-preview">
                <div class="seo-title">{{ post.title || 'Post Title' }} - HagBlog</div>
                <div class="seo-url">hagblog.com/blog/{{ post.slug || 'post-slug' }}</div>
                <div class="seo-desc">{{ post.summary || 'Your description here...' }}</div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  <!-- </NuxtLayout> -->
</template>

<script setup lang="ts">
import { useApi } from '~/services'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Edit Post - HagBlog Admin' })

useApi()
useAdminProtection()

const route = useRoute()
const router = useRouter()
const postId = computed(() => parseInt(route.params.id as string))

// Fetch existing post
const { data: postData, isPending, error } = usePostQueryById(postId)

const imageInput = ref<HTMLInputElement>()
const featuredInput = ref<HTMLInputElement>()
const contentEditor = ref<HTMLDivElement>()
const autoSaved = ref(false)
const editorMode = ref<'wysiwyg' | 'markdown' | 'preview'>('wysiwyg')
const markdownContent = ref('')

// Category Autocomplete
const categorySearch = ref('')
const showCategorySuggestions = ref(false)
const categoryIndex = ref(0)
const { data: categoriesData } = useCategoriesQuery()
const categories = computed(() => categoriesData.value?.map((c: any) => c.name) || [])

const filteredCategories = computed(() => {
  if (!categorySearch.value) return categories.value
  return categories.value.filter(c => c.toLowerCase().includes(categorySearch.value.toLowerCase()))
})

const selectCategory = (cat: string) => {
  if (cat) {
    post.value.category = cat
    categorySearch.value = ''
    showCategorySuggestions.value = false
  }
}

const hideCategorySuggestions = () => {
  setTimeout(() => { showCategorySuggestions.value = false }, 200)
}

// Tags Autocomplete
const tagSearch = ref('')
const showTagSuggestions = ref(false)
const tagIndex = ref(0)
const { data: tagsData } = useTagsQuery()
const availableTags = computed(() => tagsData.value?.map((t: any) => t.name) || [])

const filteredTags = computed(() => {
  if (!tagSearch.value) return availableTags.value.filter(t => !post.value.tags.includes(t)).slice(0, 8)
  return availableTags.value
    .filter(t => t.includes(tagSearch.value.toLowerCase()) && !post.value.tags.includes(t))
    .slice(0, 8)
})

const selectTag = (tag: string) => {
  if (tag && !post.value.tags.includes(tag.toLowerCase())) {
    post.value.tags.push(tag.toLowerCase())
    tagSearch.value = ''
    showTagSuggestions.value = false
  }
}

const hideTagSuggestions = () => {
  setTimeout(() => { showTagSuggestions.value = false }, 200)
}

const post = ref({
  title: '',
  slug: '',
  content: '',
  summary: '',
  category: '',
  categoryId: undefined as number | undefined,
  tags: [] as string[],
  image: '',
  status: 'draft' as 'draft' | 'published' | 'archived'
})

// Track active formats
const activeFormats = ref({
  bold: false, italic: false, underline: false, strikethrough: false,
  h1: false, h2: false, h3: false, ul: false, ol: false, quote: false, code: false
})

// Load post data when available
watch(postData, (data) => {
  if (data) {
    post.value = {
      title: data.title || '',
      slug: data.slug || '',
      content: data.content || '',
      summary: data.excerpt || '',
      category: data.category?.name || '',
      categoryId: data.categoryId,
      tags: data.tags?.map((t: any) => t.name) || [],
      image: data.featuredImage || '',
      status: data.status || 'draft',
    }
    nextTick(() => {
      if (contentEditor.value && post.value.content) {
        contentEditor.value.innerHTML = post.value.content
      }
      markdownContent.value = htmlToMarkdown(post.value.content)
    })
  }
}, { immediate: true })

const generateSlug = () => {
  post.value.slug = post.value.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const updateActiveFormats = () => {
  activeFormats.value = {
    bold: document.queryCommandState('bold'),
    italic: document.queryCommandState('italic'),
    underline: document.queryCommandState('underline'),
    strikethrough: document.queryCommandState('strikeThrough'),
    h1: isInElement('H1'),
    h2: isInElement('H2'),
    h3: isInElement('H3'),
    ul: document.queryCommandState('insertUnorderedList'),
    ol: document.queryCommandState('insertOrderedList'),
    quote: isInElement('BLOCKQUOTE'),
    code: isInElement('PRE')
  }
}

const isInElement = (tagName: string): boolean => {
  const selection = window.getSelection()
  if (!selection?.anchorNode) return false
  let node: Node | null = selection.anchorNode
  while (node) {
    if (node.nodeName === tagName) return true
    node = node.parentNode
  }
  return false
}

const toggleFormat = (type: string) => {
  const commands: Record<string, () => void> = {
    bold: () => document.execCommand('bold'),
    italic: () => document.execCommand('italic'),
    underline: () => document.execCommand('underline'),
    strikethrough: () => document.execCommand('strikeThrough'),
    ul: () => document.execCommand('insertUnorderedList'),
    ol: () => document.execCommand('insertOrderedList'),
    quote: () => document.execCommand('formatBlock', false, isInElement('BLOCKQUOTE') ? 'p' : 'blockquote'),
    code: () => document.execCommand('formatBlock', false, isInElement('PRE') ? 'p' : 'pre')
  }
  commands[type]?.()
  contentEditor.value?.focus()
  updateActiveFormats()
}

const toggleHeading = (tag: string) => {
  const isActive = isInElement(tag.toUpperCase())
  document.execCommand('formatBlock', false, isActive ? 'p' : tag)
  contentEditor.value?.focus()
  updateActiveFormats()
}

const insertLink = () => {
  const url = prompt('Enter URL:')
  if (url) document.execCommand('createLink', false, url)
}

const onContentInput = () => {
  post.value.content = contentEditor.value?.innerHTML || ''
}

const onPaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const text = e.clipboardData?.getData('text/plain') || ''
  document.execCommand('insertText', false, text)
}

const onMarkdownInput = () => {
  post.value.content = markdownToHtml(markdownContent.value)
}

const markdownToHtml = (md: string): string => {
  return md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    .replace(/\n/gim, '<br>')
}

const previewHtml = computed(() => post.value.content || '<p style="color: var(--text-muted)">No content yet...</p>')

const triggerFeaturedUpload = () => featuredInput.value?.click()
const triggerImageUpload = () => imageInput.value?.click()

const handleFeaturedUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => { post.value.image = ev.target?.result as string }
    reader.readAsDataURL(file)
  }
}

const handleImageUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => { document.execCommand('insertImage', false, ev.target?.result as string) }
    reader.readAsDataURL(file)
  }
}

const removeTag = (index: number) => post.value.tags.splice(index, 1)

// Sync between editor modes
watch(editorMode, (newMode, oldMode) => {
  if (oldMode === 'wysiwyg' && newMode === 'markdown') {
    markdownContent.value = htmlToMarkdown(post.value.content)
  } else if (oldMode === 'markdown' && newMode === 'wysiwyg') {
    post.value.content = markdownToHtml(markdownContent.value)
    nextTick(() => {
      if (contentEditor.value) {
        contentEditor.value.innerHTML = post.value.content
      }
    })
  }
})

const htmlToMarkdown = (html: string): string => {
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// Update mutation
const updateMutation = useUpdatePostMutation()
const saving = ref(false)

const saveDraft = async () => {
  saving.value = true
  try {
    const categoryId = categoriesData.value?.find((c: any) => c.name === post.value.category)?.id
    await updateMutation.mutateAsync({
      id: postId.value,
      title: post.value.title,
      slug: post.value.slug,
      content: post.value.content,
      excerpt: post.value.summary,
      featuredImage: post.value.image,
      categoryId,
      status: 'draft',
      tags: post.value.tags,
    })
    alert('Draft saved!')
  } catch (e: any) {
    alert(e.message || 'Failed to save')
  } finally {
    saving.value = false
  }
}

const updatePost = async () => {
  saving.value = true
  try {
    const categoryId = categoriesData.value?.find((c: any) => c.name === post.value.category)?.id
    await updateMutation.mutateAsync({
      id: postId.value,
      title: post.value.title,
      slug: post.value.slug,
      content: post.value.content,
      excerpt: post.value.summary,
      featuredImage: post.value.image,
      categoryId,
      status: post.value.status,
      tags: post.value.tags,
    })
    alert('Post updated!')
    router.push('/admin/posts')
  } catch (e: any) {
    alert(e.message || 'Failed to update')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* Responsive Editor Layout */
.editor-page { display: flex; flex-direction: column; gap: var(--space-4); }
.loading-state, .error-state { padding: var(--space-8); text-align: center; color: var(--text-muted); }

/* Header */
.editor-header { display: flex; justify-content: space-between; align-items: center; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius-xl); flex-wrap: wrap; gap: var(--space-3); }
.back-btn { display: flex; align-items: center; gap: var(--space-2); color: var(--text-muted); text-decoration: none; font-size: var(--text-base); font-weight: 500; padding: var(--space-2); }
.back-btn:hover { color: var(--primary-500); }
.header-actions { display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; }
.edit-badge { padding: var(--space-2) var(--space-3); background: var(--primary-100); color: var(--primary-700); font-size: var(--text-sm); font-weight: 500; border-radius: var(--radius-full); }
[data-theme="dark"] .edit-badge { background: var(--primary-900); color: var(--primary-300); }
.autosave-status { font-size: var(--text-sm); color: var(--success); padding: var(--space-2); }
.btn-md { padding: var(--space-2) var(--space-4); font-size: var(--text-base); }
.btn-outline { background: transparent; border: 2px solid var(--border-color); color: var(--text-primary); }
.btn-outline:hover { border-color: var(--primary-500); }

/* Editor Grid */
.editor-grid { display: grid; grid-template-columns: 1fr 340px; gap: var(--space-6); }
@media (max-width: 1200px) { .editor-grid { grid-template-columns: 1fr; } }
@media (max-width: 640px) { 
  .back-text { display: none; }
  .header-actions { width: 100%; justify-content: flex-end; }
}

/* Form Elements */
.editor-main { display: flex; flex-direction: column; gap: var(--space-4); }
.form-group { display: flex; flex-direction: column; gap: var(--space-2); }
.form-label { font-size: var(--text-lg); font-weight: 600; color: var(--text-primary); }
.title-input { width: 100%; font-size: clamp(1.25rem, 4vw, 2rem); font-weight: 700; padding: var(--space-4); border: 2px solid var(--border-color); border-radius: var(--radius-lg); background: var(--bg-secondary); color: var(--text-primary); }
.title-input:focus { outline: none; border-color: var(--primary-500); }
.slug-field { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-3); background: var(--bg-tertiary); border-radius: var(--radius-lg); flex-wrap: wrap; }
.slug-label { font-weight: 600; color: var(--text-muted); }
.slug-prefix { color: var(--text-muted); }
.slug-input { border: none; background: none; flex: 1; min-width: 100px; font-weight: 500; color: var(--primary-500); }

/* Editor Mode Toggle */
.editor-mode-toggle { display: flex; gap: var(--space-2); background: var(--bg-tertiary); padding: var(--space-2); border-radius: var(--radius-lg); }
.mode-btn { flex: 1; padding: var(--space-3); font-size: var(--text-base); font-weight: 500; background: transparent; border: none; border-radius: var(--radius-md); cursor: pointer; color: var(--text-muted); transition: all var(--transition-fast); }
.mode-btn:hover { color: var(--text-primary); }
.mode-btn.active { background: var(--bg-primary); color: var(--primary-500); box-shadow: var(--shadow-sm); }

/* WYSIWYG Container */
.wysiwyg-container { display: flex; flex-direction: column; border: 2px solid var(--border-color); border-radius: var(--radius-xl); overflow: hidden; background: var(--bg-secondary); }

/* Toolbar */
.editor-toolbar { padding: var(--space-3); background: var(--bg-tertiary); border-bottom: 2px solid var(--border-color); position: sticky; top: 0; z-index: 10; }
.toolbar-row { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
.toolbar-group { display: flex; gap: var(--space-1); }
.toolbar-divider { width: 2px; height: 32px; background: var(--border-color); margin: 0 var(--space-1); }
.toolbar-btn { min-width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: var(--text-base); font-weight: 600; background: var(--bg-secondary); border: 2px solid transparent; border-radius: var(--radius-md); cursor: pointer; color: var(--text-primary); transition: all var(--transition-fast); }
.toolbar-btn:hover { background: var(--primary-100); border-color: var(--primary-300); }
.toolbar-btn.active { background: var(--primary-500); color: white; border-color: var(--primary-600); }
[data-theme="dark"] .toolbar-btn:hover { background: var(--primary-900); }
[data-theme="dark"] .toolbar-btn.active { background: var(--primary-600); }

/* Content Editor */
.content-editor { min-height: 400px; padding: var(--space-5); font-size: var(--text-lg); line-height: 1.8; color: var(--text-primary); outline: none; overflow-y: auto; }
.content-editor:empty::before { content: attr(data-placeholder); color: var(--text-muted); pointer-events: none; }
.content-editor h1, .content-editor h2, .content-editor h3 { margin: var(--space-4) 0; }
.content-editor blockquote { border-left: 4px solid var(--primary-500); padding: var(--space-3) var(--space-4); margin: var(--space-4) 0; background: var(--bg-tertiary); }
.content-editor pre { background: var(--neutral-900); color: var(--neutral-100); padding: var(--space-4); border-radius: var(--radius-md); font-family: var(--font-mono); }
.content-editor img { max-width: 100%; border-radius: var(--radius-md); margin: var(--space-3) 0; }

/* Markdown Editor */
.markdown-container { border: 2px solid var(--border-color); border-radius: var(--radius-xl); overflow: hidden; }
.markdown-editor { width: 100%; min-height: 400px; padding: var(--space-5); font-size: var(--text-base); font-family: var(--font-mono); line-height: 1.7; background: var(--bg-secondary); border: none; color: var(--text-primary); resize: vertical; }
.markdown-editor:focus { outline: none; }

/* Preview */
.preview-container { border: 2px solid var(--border-color); border-radius: var(--radius-xl); background: var(--bg-secondary); min-height: 400px; }
.preview-content { padding: var(--space-6); font-size: var(--text-lg); line-height: 1.8; }

/* Sidebar */
.editor-sidebar { display: flex; flex-direction: column; gap: var(--space-4); }
@media (max-width: 1200px) { .editor-sidebar { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4); } }
@media (max-width: 768px) { .editor-sidebar { grid-template-columns: 1fr; } }

.sidebar-card { padding: var(--space-4); background: var(--bg-secondary); border: 2px solid var(--border-color); border-radius: var(--radius-xl); }
.card-title { font-size: var(--text-base); font-weight: 600; margin-bottom: var(--space-3); color: var(--text-primary); }

/* Inputs */
.input-lg { width: 100%; padding: var(--space-3); font-size: var(--text-base); background: var(--bg-primary); border: 2px solid var(--border-color); border-radius: var(--radius-lg); color: var(--text-primary); }
.input-lg:focus { outline: none; border-color: var(--primary-500); }

/* Image Upload */
.image-upload { cursor: pointer; border: 2px dashed var(--border-color); border-radius: var(--radius-lg); overflow: hidden; position: relative; }
.image-upload:hover { border-color: var(--primary-400); }
.image-upload.has-image { border-style: solid; }
.preview-image { width: 100%; aspect-ratio: 16/9; object-fit: cover; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); padding: var(--space-6); color: var(--text-muted); text-align: center; }
.upload-icon { font-size: 2rem; }
.upload-text { font-size: var(--text-base); font-weight: 500; }
.upload-hint { font-size: var(--text-sm); }
.remove-image { position: absolute; top: var(--space-2); right: var(--space-2); width: 32px; height: 32px; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: var(--radius-full); cursor: pointer; font-size: var(--text-lg); }

/* Tags */
.tags-container { display: flex; flex-direction: column; gap: var(--space-2); }
.tags-list { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.tag { display: flex; align-items: center; gap: var(--space-1); padding: var(--space-2) var(--space-3); background: var(--primary-100); color: var(--primary-700); font-size: var(--text-sm); font-weight: 500; border-radius: var(--radius-full); }
[data-theme="dark"] .tag { background: var(--primary-900); color: var(--primary-300); }
.tag-remove { background: none; border: none; cursor: pointer; color: inherit; font-size: var(--text-base); }

/* Char Count */
.char-count { font-size: var(--text-sm); color: var(--text-muted); text-align: right; margin-top: var(--space-1); }
.char-count.over { color: var(--error); font-weight: 600; }

/* SEO Preview */
.seo-card { background: var(--bg-tertiary); }
.seo-preview { padding: var(--space-3); background: var(--bg-primary); border-radius: var(--radius-md); border: 1px solid var(--border-color); }
.seo-title { color: #1a0dab; font-size: var(--text-base); font-weight: 500; margin-bottom: 2px; }
.seo-url { color: #006621; font-size: var(--text-sm); margin-bottom: 2px; }
.seo-desc { color: #545454; font-size: var(--text-sm); line-height: 1.4; }
[data-theme="dark"] .seo-title { color: #8ab4f8; }
[data-theme="dark"] .seo-url, [data-theme="dark"] .seo-desc { color: #bdc1c6; }

/* Autocomplete */
.autocomplete-wrapper { position: relative; }
.suggestions-dropdown { position: absolute; top: 100%; left: 0; right: 0; margin-top: 4px; background: var(--bg-primary); border: 2px solid var(--border-color); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); z-index: 50; max-height: 240px; overflow-y: auto; }
.suggestion-item { width: 100%; padding: var(--space-3); font-size: var(--text-base); text-align: left; background: none; border: none; cursor: pointer; color: var(--text-primary); transition: background var(--transition-fast); display: block; }
.suggestion-item:hover, .suggestion-item.active { background: var(--primary-100); color: var(--primary-700); }
[data-theme="dark"] .suggestion-item:hover, [data-theme="dark"] .suggestion-item.active { background: var(--primary-900); color: var(--primary-300); }
.selected-category { display: flex; align-items: center; gap: var(--space-2); margin-top: var(--space-2); }
.category-badge { padding: var(--space-2) var(--space-3); background: var(--primary-100); color: var(--primary-700); font-size: var(--text-sm); font-weight: 500; border-radius: var(--radius-full); }
[data-theme="dark"] .category-badge { background: var(--primary-900); color: var(--primary-300); }
.clear-btn { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: var(--bg-tertiary); border: none; border-radius: var(--radius-full); cursor: pointer; color: var(--text-muted); font-size: var(--text-base); }
.clear-btn:hover { background: var(--error); color: white; }
</style>
