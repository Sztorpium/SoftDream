# SoftDream Frontend

React 19 + Vite frontend for the SoftDream hotel booking application.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the backend URL

Copy `.env.example` to `.env.local` and set the Spring backend base URL:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
VITE_API_BASE_URL=http://localhost:8080
```

> **Note:** Do **not** add a trailing slash. The API client will prepend this value to every request path (e.g. `/api/auth/login`).
>
> If `VITE_API_BASE_URL` is not set, requests are made relative to the Vite dev-server origin (useful when using the Vite proxy).

### 3. Start the dev server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

## Environment variables

| Variable             | Required | Description                                                    |
|----------------------|----------|----------------------------------------------------------------|
| `VITE_API_BASE_URL`  | No       | Base URL of the Spring Boot backend, e.g. `http://localhost:8080` |

## Features

- JWT-based authentication (token stored in `localStorage`)
- Login (`/login`) and Register (`/register`) pages wired to `/api/auth/*`
- Protected route support — redirects to `/login` and returns to the original page after login
- My Bookings (`/my-bookings`) — lists the current user's bookings from `/api/bookings/my-bookings`
- Responsive Material UI navigation with login/register or username/logout depending on auth state
