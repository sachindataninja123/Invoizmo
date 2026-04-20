# Invoizmo

Invoizmo is a backend-first invoice generation SaaS project for freelancers and small businesses.  
It provides secure authentication, client management, invoice lifecycle tracking, and dashboard APIs.

## Current Status

- Backend foundation is implemented in `backend/`
- Frontend is planned for next phase
- Main branch is active and synced to GitHub

## Tech Stack

- Node.js + Express.js
- TypeScript (strict mode)
- MongoDB (Mongoose)
- JWT auth (access + refresh token)
- Security: `helmet`, `cors`, `express-rate-limit`
- Testing: Vitest + Supertest

## Repository Structure

```text
.
├── backend/            # Complete backend API project
├── instruction.md      # Project instructions/spec notes
└── invoizmo_prd.md     # Product requirements document
```

## Quick Start

### 1) Go to backend

```bash
cd backend
```

### 2) Install dependencies

```bash
npm install
```

### 3) Configure environment

```bash
.env
```

Default local port is `5001`.

### 4) Run development server

```bash
npm run dev
```

## Useful Local URLs

- `http://localhost:5001/`
- `http://localhost:5001/health`
- `http://localhost:5001/ready`
- `http://localhost:5001/users`
- `http://localhost:5001/contact`
- `http://localhost:5001/business`
- `http://localhost:5001/clients`

## Available Scripts (backend)

- `npm run dev` - Start dev server with watch mode
- `npm run build` - Compile TypeScript
- `npm run start` - Run compiled server
- `npm run lint` - Lint TypeScript files
- `npm test` - Run test suite

## API Modules

- Auth: `/api/v1/auth/*`
- Users: `/api/v1/users/*`
- Business: `/api/v1/business/*`
- Clients: `/api/v1/clients/*`
- Invoices: `/api/v1/invoices/*`
- Dashboard: `/api/v1/dashboard/stats`
- Contact: `/api/v1/contact`
- Health: `/health`, `/ready`

## Authentication Notes

- `register` and `login` return:
  - full `user` payload (without password)
  - `accessToken`
- `refreshToken` is stored in an HTTP-only cookie.

## GitHub Repository

[https://github.com/sachindataninja123/Invoizmo](https://github.com/sachindataninja123/Invoizmo)
