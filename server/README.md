# HagBlog Backend Server

Express.js API server for HagBlog with DrizzleORM, PostgreSQL, and BetterAuth.

## Setup

1. Start PostgreSQL with Docker:
   ```bash
   docker compose up -d
   ```

2. Copy environment file (credentials already match Docker defaults):
   ```bash
   cp .env.example .env
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Push database schema:
   ```bash
   npm run db:push
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run Drizzle migrations |
| `npm run db:push` | Push schema to database (dev) |
| `npm run db:studio` | Open Drizzle Studio |

## API Endpoints

### Authentication (BetterAuth)
- `POST /api/auth/sign-up` - Register new user
- `POST /api/auth/sign-in` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get current session

### Posts
- `GET /api/posts` - List posts
- `GET /api/posts/:slug` - Get post by slug
- `POST /api/posts` - Create post (admin)
- `PUT /api/posts/:id` - Update post (admin)
- `DELETE /api/posts/:id` - Delete post (admin)
- `POST /api/posts/bulk` - Bulk actions (admin)

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Comments
- `GET /api/posts/:postId/comments` - Get post comments
- `POST /api/posts/:postId/comments` - Submit comment
- `GET /api/comments` - List all comments (admin)
- `POST /api/comments/:id/approve` - Approve comment (admin)
- `POST /api/comments/:id/spam` - Mark as spam (admin)
- `DELETE /api/comments/:id` - Delete comment (admin)

### Settings
- `GET /api/settings` - Get settings (admin)
- `PUT /api/settings` - Update settings (admin)
- `GET /api/settings/public` - Get public settings

### Newsletter
- `POST /api/newsletter/subscribe` - Subscribe
- `POST /api/newsletter/unsubscribe` - Unsubscribe

### Dashboard
- `GET /api/dashboard/stats` - Get statistics (admin)
- `GET /api/dashboard/recent-posts` - Get recent posts (admin)
- `GET /api/dashboard/recent-comments` - Get recent comments (admin)

### Search
- `GET /api/search?q=query` - Search posts
