# Frontend Documentation - AiutoX ERP

## 🚀 Quick Start

### Requirements
- Node.js 20+
- npm or pnpm

### Setup
1. Navigate to `frontend/`.
2. Run `npm install`.
3. Run `npm run dev` to start the Vite development server.

## 📂 Structure
- `app/components/`: Reusable UI components (shadcn/ui).
- `app/features/`: Feature-specific modules (auth, inventory, etc.).
- `app/hooks/`: Global custom hooks (useAuth, useApi, etc.).
- `app/stores/`: Zustand state stores (authStore, etc.).
- `app/lib/`: Utilities and API clients.
  - `app/lib/api/client.ts`: HTTP client with axios and interceptors
  - `app/lib/utils.ts`: Utility functions (cn, etc.)
- `app/routes/`: Routes and pages (React Router v7).
- `app/__tests__/`: Unit and E2E tests.

## 📏 Rules & Standards
> **CRITICAL**: Before contributing, read:
> - [Naming Conventions](../../rules/naming.md)
> - [Dev Style](../../rules/dev-style.md)
> - [UX Rules](../../rules/ux-frontend.md)

## 🧪 Linting
Run linting:
```bash
../../scripts/lint-frontend.sh
```
