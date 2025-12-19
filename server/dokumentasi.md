# HagBlog API Documentation

## Base URL

```
http://localhost:3001/api
```

## Authentication

API uses session-based authentication with BetterAuth. Auth endpoints are at `/api/auth/*`.

### Register User

```http
POST /api/auth/sign-up/email
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login

```http
POST /api/auth/sign-in/email
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Session

```http
GET /api/auth/session
```

### Logout

```http
POST /api/auth/sign-out
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": [...]
  }
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `BAD_REQUEST` | 400 | Invalid request parameters |
| `INVALID_JSON` | 400 | Malformed JSON in request body |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `DUPLICATE_ENTRY` | 409 | Unique constraint violation |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Endpoints

### Posts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/posts` | Public | List all published posts |
| GET | `/posts/:slug` | Public | Get post by slug |
| POST | `/posts` | Admin | Create post |
| PUT | `/posts/:id` | Admin | Update post |
| DELETE | `/posts/:id` | Admin | Delete post |
| POST | `/posts/bulk` | Admin | Bulk operations |

#### Create Post

```http
POST /api/posts
Content-Type: application/json
Cookie: better-auth.session_token=...

{
  "title": "My Post Title",
  "slug": "my-post-title",
  "content": "Post content here...",
  "excerpt": "Short description",
  "categoryId": 1,
  "status": "draft",
  "featured": false,
  "tags": [1, 2, 3]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "My Post Title",
    "slug": "my-post-title",
    "status": "draft",
    ...
  },
  "message": "Post created successfully"
}
```

**Validation Errors:**

- `title`: Required, min 1 character
- `slug`: Required, lowercase alphanumeric with dashes only
- `status`: Must be `draft`, `published`, or `archived`

---

### Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | Public | List all categories |
| GET | `/categories/:slug` | Public | Get category by slug |
| POST | `/categories` | Admin | Create category |
| PUT | `/categories/:id` | Admin | Update category |
| DELETE | `/categories/:id` | Admin | Delete category |

#### Create Category

```http
POST /api/categories
Content-Type: application/json

{
  "name": "Technology",
  "slug": "technology",
  "icon": "💻",
  "description": "Tech articles"
}
```

---

### Tags

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tags` | Public | List all tags |
| GET | `/tags/:slug` | Public | Get tag by slug |
| POST | `/tags` | Admin | Create tag |
| PUT | `/tags/:id` | Admin | Update tag |
| DELETE | `/tags/:id` | Admin | Delete tag |

---

### Comments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/comments` | Admin | List all comments |
| GET | `/posts/:postId/comments` | Public | Get comments for post |
| POST | `/posts/:postId/comments` | Public | Add comment |
| PATCH | `/comments/:id/status` | Admin | Update comment status |
| DELETE | `/comments/:id` | Admin | Delete comment |

#### Add Comment

```http
POST /api/posts/1/comments
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "content": "Great article!"
}
```

---

### Newsletter

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/newsletter/subscribe` | Public | Subscribe to newsletter |
| POST | `/newsletter/unsubscribe` | Public | Unsubscribe |
| GET | `/newsletter/subscribers` | Admin | List subscribers |

#### Subscribe

```http
POST /api/newsletter/subscribe
Content-Type: application/json

{
  "email": "subscriber@example.com"
}
```

---

### Settings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/settings` | Admin | Get all settings |
| GET | `/settings/:key` | Public | Get setting by key |
| PUT | `/settings` | Admin | Update settings |

---

### Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard/stats` | Admin | Get dashboard statistics |
| GET | `/dashboard/recent-posts` | Admin | Get recent posts |
| GET | `/dashboard/recent-comments` | Admin | Get recent comments |

---

### Search

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/search?q=query` | Public | Search posts |

---

## Rate Limits

| Endpoint Group | Limit |
|----------------|-------|
| Auth (`/api/auth/*`) | 10 requests per 15 minutes |
| General API | 100 requests per 15 minutes |
| Submissions | 20 requests per 15 minutes |

---

## Health Check

```http
GET /api/health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-12-18T12:00:00.000Z"
}
```
