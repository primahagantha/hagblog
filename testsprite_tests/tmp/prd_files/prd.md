HagBlog - Product Requirements Document (PRD)
1. Ringkasan Produk
HagBlog adalah platform blogging modern full-stack yang dibangun dengan teknologi terkini. Platform ini menyediakan fitur manajemen konten yang lengkap, sistem autentikasi berbasis role, dan dashboard admin yang komprehensif.

Visi Produk
Menyediakan platform blogging yang performant, aman, dan mudah digunakan untuk blogger individual maupun tim konten.

2. Tech Stack
Frontend
Teknologi	Versi	Fungsi
Nuxt	4.2	SSR/SSG Framework
Vue	3.5	UI Framework
TypeScript	5.0	Type Safety
TanStack Query	5.92	Data Fetching & Caching
VueUse	14.1	Utility Composables
Better Auth	1.4	Authentication Client
Backend
Teknologi	Versi	Fungsi
Bun	latest	JavaScript Runtime
Express	5.0	Web Framework
Drizzle ORM	0.41	Database ORM
PostgreSQL	latest	Database
Zod	3.24	Validation
Multer	2.0	File Upload
3. Fitur Utama
3.1 Content Management System (CMS)
Rich Text Editor
Visual Editor: WYSIWYG editor dengan toolbar formatting lengkap
Markdown Editor: Penulisan dengan syntax markdown
Preview Mode: Pratinjau konten sebelum publikasi
Auto-save: Menyimpan draft otomatis ke localStorage
Manajemen Konten
Membuat, mengedit, dan menghapus artikel
Featured image dengan preview
SEO optimization: meta title, description, canonical URL
Penjadwalan publikasi
Status management: Draft, Published, Archived
Organisasi Konten
Kategori: Pengelompokan artikel berdasarkan topik
Tags: Penandaan artikel dengan kata kunci relevan
Slug: URL-friendly path untuk setiap artikel
3.2 Authentication & Authorization
Sistem Autentikasi
Registrasi user dengan email verification
Login dengan email/password
Session management dengan secure cookies
Password reset functionality
Role-Based Access Control (RBAC)
Role	Permissions
Admin	Full access: kelola semua konten, user, dan settings
Blogger	Membuat dan mengelola artikel sendiri
User	Membaca artikel dan berkomentar
Keamanan
Protected routes dengan middleware
CORS configuration
Rate limiting untuk API endpoints
Honeypot spam protection
3.3 Sistem Komentar
Fitur Komentar
Nested comments dengan reply system
Komentar tanpa login (guest comments)
Menyimpan info commenter di browser
Moderasi Komentar
Pending approval untuk komentar baru
Inline approval untuk pemilik artikel
Approve/Reject/Delete actions
Filter berdasarkan status (pending, approved, rejected)
3.4 Admin Dashboard
Overview Analytics
Total posts, views, comments
Recent posts statistics
User registration trends
Popular categories/tags
User Management
CRUD operations untuk user
Role assignment
User status (active/banned)
User activity tracking
Content Management
Post listing dengan filter dan sorting
Bulk actions untuk posts
Category/Tag CRUD
File upload management
Settings
Site title dan description
SEO default settings
Maintenance mode toggle
Data export (JSON/CSV)
Audit Log
Tracking semua aksi penting
User activity history
JSON diff viewer untuk perubahan
Filter berdasarkan action type
3.5 Search & Discovery
Search Functionality
Full-text search across posts
Debounced search query
Search results dengan highlighting
Filter by category/tag
Content Discovery
Category pages dengan filtered posts
Tag pages dengan related content
Related posts recommendation
3.6 Newsletter
Subscription System
Email subscription form
Double opt-in verification
Subscriber management di admin
3.7 File Upload
Image Management
Featured image upload
Inline image dalam editor
Cloudinary integration untuk CDN
Image optimization dan resize
4. Database Schema
┌─────────────────┐     ┌─────────────────┐
│     users       │────<│    sessions     │
└─────────────────┘     └─────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────┐     ┌─────────────────┐
│     posts       │────<│    comments     │
└─────────────────┘     └─────────────────┘
        │
        │ N:N
        ▼
┌─────────────────┐     ┌─────────────────┐
│   categories    │     │      tags       │
└─────────────────┘     └─────────────────┘
┌─────────────────┐     ┌─────────────────┐
│   subscribers   │     │    settings     │
└─────────────────┘     └─────────────────┘
┌─────────────────┐     ┌─────────────────┐
│    uploads      │     │   auditLogs     │
└─────────────────┘     └─────────────────┘
Tabel Utama
Tabel	Deskripsi
users	Data user termasuk role dan profile
sessions	Session tokens untuk autentikasi
accounts	OAuth accounts (jika ada)
verifications	Token verifikasi email
posts	Artikel blog dengan metadata lengkap
categories	Kategori artikel
tags	Tags untuk artikel
comments	Komentar pada artikel
subscribers	Newsletter subscribers
settings	Site-wide settings
uploads	File upload metadata
auditLogs	Activity logging
5. API Endpoints
Public Endpoints
Method	Path	Description
GET	/api/posts	List published posts (paginated)
GET	/api/posts/:slug	Get single post by slug
GET	/api/categories	List all categories
GET	/api/tags	List all tags
GET	/api/search	Search posts
GET	/api/posts/:id/comments	Get post comments
POST	/api/posts/:id/comments	Add comment
POST	/api/newsletter	Subscribe to newsletter
Protected Endpoints (Blogger/Admin)
Method	Path	Description
POST	/api/posts	Create new post
PUT	/api/posts/:id	Update post
DELETE	/api/posts/:id	Delete post
POST	/api/upload	Upload file
DELETE	/api/upload/:id	Delete file
Admin Only Endpoints
Method	Path	Description
GET	/api/admin/dashboard	Dashboard statistics
GET/PUT	/api/admin/settings	Site settings
CRUD	/api/admin/users	User management
CRUD	/api/admin/categories	Category management
PUT/DELETE	/api/comments/:id	Comment moderation
GET	/api/admin/audit-logs	View audit logs
GET	/api/export	Export data
6. Page Structure
Public Pages
/                       → Homepage
/blog                   → Blog listing
/[...slug]              → Single post (dynamic)
/category/:slug         → Category posts
/tag/:slug              → Tag posts
/search                 → Search page
/about                  → About page
/maintenance            → Maintenance mode page
Admin Pages
/admin                  → Dashboard
/admin/login            → Admin login
/admin/posts            → Posts management
/admin/posts/new        → Create post
/admin/posts/:id/edit   → Edit post
/admin/categories       → Categories management
/admin/comments         → Comments moderation
/admin/users            → User management
/admin/settings         → Site settings
/admin/log              → Audit log viewer
7. Non-Functional Requirements
Performance
SSR untuk SEO dan initial load time
TanStack Query caching untuk mengurangi API calls
Image optimization via Cloudinary
Lazy loading untuk images dan komponen berat
Security
HTTPS only production
Secure cookies dengan httpOnly dan sameSite
Rate limiting pada API endpoints
Input validation dengan Zod
CORS whitelist
SEO
Server-side rendering
Meta tags management
JSON-LD structured data
Sitemap generation
Robots.txt configuration
Accessibility
Semantic HTML
ARIA labels pada interactive elements
Keyboard navigation support
Color contrast compliance
8. Future Enhancements
Phase 2
 OAuth login (Google, GitHub)
 Post likes/reactions
 Related posts algorithm
 Analytics integration
Phase 3
 Multi-language support
 Theme customization
 Email notifications
 Scheduled posts
9. Deployment
Environment Variables
Frontend (.env)

NUXT_PUBLIC_API_BASE_URL=http://localhost:3001
NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
Backend (server/.env)

DATABASE_URL="postgresql://user:pass@localhost:5432/hagblog"
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3001"
CORS_ORIGIN="http://localhost:3000"
Commands
# Development
bun run dev           # Frontend (port 3000)
cd server && bun run dev  # Backend (port 3001)
# Production Build
bun run build
cd server && bun run build
# Database
cd server
bunx drizzle-kit generate  # Generate migrations
bunx drizzle-kit migrate   # Run migrations
bun run db:seed            # Seed database
Dokumen ini dibuat pada: 19 Desember 2025 Versi: 1.0