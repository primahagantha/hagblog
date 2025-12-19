<div align="center">

# 🚀 HagBlog

### Modern Full-Stack Blogging Platform

[![Nuxt](https://img.shields.io/badge/Nuxt-4.2-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white)](https://nuxt.com)
[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Bun](https://img.shields.io/badge/Bun-Runtime-FBF0DF?style=for-the-badge&logo=bun&logoColor=000)](https://bun.sh)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.4-8B5CF6?style=for-the-badge)](https://better-auth.com)

*A modern, performant, and feature-rich blogging platform built with Nuxt 4, Vue 3, and a custom NestJS-inspired backend.*

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [API Reference](#-api-reference) • [Contributing](#-contributing)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 📝 Content Management
- **Rich Text Editor** - WYSIWYG with markdown support
- **Visual/Markdown/Preview** modes
- **Auto-save drafts** to localStorage
- **SEO optimization** with meta tags & JSON-LD
- **Categories & Tags** organization
- **Featured images** with preview

</td>
<td width="50%">

### 🔐 Authentication & Security
- **Better Auth** integration
- **Role-based access** (Admin, Blogger, User)
- **Session management** with cookies
- **Protected routes** with middleware
- **CORS & rate limiting** support

</td>
</tr>
<tr>
<td width="50%">

### 💬 Community Features
- **Nested comments** with replies
- **Comment moderation** system
- **Inline approval** for post authors
- **Commenter info** remembering
- **Spam protection** with honeypot

</td>
<td width="50%">

### 📊 Admin Dashboard
- **Analytics overview** (posts, views, comments)
- **User management** (CRUD + roles)
- **Post management** with filters
- **Category & tag management**
- **Site settings** configuration
- **Data export** (JSON/CSV)

</td>
</tr>
</table>

---

## 🏗️ Architecture

```mermaid
flowchart TB
    subgraph Client["🖥️ Frontend (Nuxt 4)"]
        direction TB
        Pages["📄 Pages<br/>(SSR/SPA)"]
        Components["🧩 Components"]
        Composables["🔧 Composables"]
        Services["📡 API Services"]
    end

    subgraph Server["⚙️ Backend (Custom Framework)"]
        direction TB
        Routes["🛣️ Routes"]
        Controllers["🎮 Controllers"]
        ServiceLayer["📦 Services"]
        Prisma["🗄️ Prisma ORM"]
    end

    subgraph External["☁️ External Services"]
        DB[(PostgreSQL)]
        BetterAuth["🔐 Better Auth"]
        Cloudinary["📷 Cloudinary"]
    end

    Client --> |"HTTP/REST"| Server
    Pages --> Components
    Components --> Composables
    Composables --> Services
    
    Routes --> Controllers
    Controllers --> ServiceLayer
    ServiceLayer --> Prisma
    
    Prisma --> DB
    Server --> BetterAuth
    Server --> Cloudinary
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18.0.0
- **Bun** (recommended) or npm/pnpm
- **PostgreSQL** database

### 1️⃣ Clone & Install

```bash
# Clone the repository
git clone https://github.com/yourusername/hagblog.git
cd hagblog

# Install frontend dependencies
bun install

# Install backend dependencies
cd server && bun install
```

### 2️⃣ Configure Environment

```bash
# Frontend (.env)
cp .env.example .env

# Backend (server/.env)
cp server/.env.example server/.env
```

<details>
<summary>📋 Environment Variables</summary>

**Frontend (`.env`)**
```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:3001
NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

**Backend (`server/.env`)**
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/hagblog"
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3001"
CORS_ORIGIN="http://localhost:3000"
```
</details>

### 3️⃣ Setup Database

```bash
cd server

# Generate Prisma client
bunx prisma generate

# Run migrations
bunx prisma migrate dev

# (Optional) Seed with sample data
bunx prisma db seed
```

### 4️⃣ Start Development

```bash
# Terminal 1: Backend
cd server && bun run dev

# Terminal 2: Frontend
bun run dev
```

🎉 **Open http://localhost:3000 and start blogging!**

---

## 📁 Project Structure

```
hagblog/
├── 📂 app/                    # Nuxt frontend
│   ├── 📂 assets/            # CSS & static assets
│   ├── 📂 components/        # Vue components
│   │   ├── 📂 Blog/          # Blog-specific components
│   │   ├── 📂 Layout/        # Layout components
│   │   └── 📂 Ui/            # Reusable UI components
│   ├── 📂 composables/       # Vue composables
│   ├── 📂 layouts/           # Nuxt layouts
│   ├── 📂 pages/             # Nuxt pages (file-based routing)
│   │   ├── 📂 admin/         # Admin dashboard pages
│   │   ├── 📂 blog/          # Blog pages
│   │   └── ...
│   └── 📂 services/          # API service layer
│
├── 📂 server/                 # Backend API
│   ├── 📂 prisma/            # Database schema & migrations
│   └── 📂 src/
│       ├── 📂 controllers/   # Route controllers
│       ├── 📂 services/      # Business logic
│       ├── 📂 routes/        # API routes
│       └── 📂 middleware/    # Custom middleware
│
├── 📂 public/                 # Static files
├── 📄 nuxt.config.ts         # Nuxt configuration
└── 📄 package.json
```

---

## 🔌 API Reference

### Authentication

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant A as Better Auth

    U->>F: Login Request
    F->>B: POST /api/auth/sign-in/email
    B->>A: Validate Credentials
    A-->>B: Session Token
    B-->>F: Set Cookie + User Data
    F-->>U: Redirect to Dashboard
```

### Endpoints Overview

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/posts` | List all published posts | ❌ |
| `POST` | `/api/posts` | Create new post | ✅ Admin/Blogger |
| `GET` | `/api/posts/:slug` | Get post by slug | ❌ |
| `PUT` | `/api/posts/:id` | Update post | ✅ Owner/Admin |
| `DELETE` | `/api/posts/:id` | Delete post | ✅ Owner/Admin |
| `GET` | `/api/categories` | List categories | ❌ |
| `POST` | `/api/posts/:id/comments` | Add comment | ❌ |
| `GET` | `/api/admin/users` | List users | ✅ Admin |

<details>
<summary>📖 Full API Documentation</summary>

### Posts

```http
GET /api/posts?page=1&limit=10&status=published&category=tech
```

**Response:**
```json
{
  "posts": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

### Search

```http
GET /api/search?q=vue&limit=10
```

### Comments

```http
POST /api/posts/:postId/comments
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "content": "Great article!"
}
```

</details>

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="20%">
<img src="https://nuxt.com/icon.png" width="48" height="48" alt="Nuxt"><br>
<b>Nuxt 4</b><br>
<sub>Frontend Framework</sub>
</td>
<td align="center" width="20%">
<img src="https://vuejs.org/images/logo.png" width="48" height="48" alt="Vue"><br>
<b>Vue 3</b><br>
<sub>UI Library</sub>
</td>
<td align="center" width="20%">
<img src="https://raw.githubusercontent.com/remojansen/logo.ts/master/ts.png" width="48" height="48" alt="TypeScript"><br>
<b>TypeScript</b><br>
<sub>Type Safety</sub>
</td>
<td align="center" width="20%">
<img src="https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/logos/drizzle-1mzfoq5c7kr690ikgxc7td.png/drizzle-8zyz6due3eudtoaydbswu7.png?_a=DATAg1AAZAA0" width="48" height="48" alt="Drizzle ORM"><br>
<b>Drizzle</b><br>
<sub>Database ORM</sub>
</td>
<td align="center" width="20%">
<img src="https://bun.sh/logo.svg" width="48" height="48" alt="Bun"><br>
<b>Bun</b><br>
<sub>Runtime</sub>
</td>
</tr>
</table>

### Frontend
- **Nuxt 4** - SSR/SSG/SPA framework
- **Vue 3** - Composition API
- **TanStack Query** - Data fetching & caching
- **VueUse** - Utility composables

### Backend
- **Bun** - JavaScript runtime
- **Better Auth** - Authentication
- **Prisma** - Database ORM
- **PostgreSQL** - Database

---

## 🎨 Screenshots

<table>
<tr>
<td width="50%">
<img src="https://via.placeholder.com/600x400?text=Homepage" alt="Homepage">
<p align="center"><b>Homepage</b></p>
</td>
<td width="50%">
<img src="https://via.placeholder.com/600x400?text=Admin+Dashboard" alt="Dashboard">
<p align="center"><b>Admin Dashboard</b></p>
</td>
</tr>
<tr>
<td width="50%">
<img src="https://via.placeholder.com/600x400?text=Post+Editor" alt="Editor">
<p align="center"><b>Post Editor</b></p>
</td>
<td width="50%">
<img src="https://via.placeholder.com/600x400?text=Blog+Post" alt="Blog Post">
<p align="center"><b>Blog Post</b></p>
</td>
</tr>
</table>

---

## 🧪 Testing

```bash
# Run frontend tests
bun test

# Run backend tests
cd server && bun test

# Run E2E tests
bun run test:e2e
```

---

## 📦 Deployment

### Production Build

```bash
# Build frontend
bun run build

# Build backend
cd server && bun run build
```

### Docker

```bash
docker-compose up -d
```

### Environment Variables for Production

```env
# Frontend
NUXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com

# Backend
NODE_ENV=production
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-production-secret
BETTER_AUTH_URL=https://api.yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### Made with ❤️ by [HagBlog Team]

⭐ **Star this repo if you find it useful!** ⭐

</div>
