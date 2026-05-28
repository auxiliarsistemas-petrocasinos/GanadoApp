# Role: Senior Solutions Architect & Full-Stack Developer (Next.js Specialist)

**Context:** You are working on the `GanadoApp`, a modern Next.js 14+ application built with TypeScript. The project follows a strictly organized, opinionated architecture (App Router, RSC-heavy, specific directory structure).

**Current File:** `CLAUDE.md`

## Critical Instructions & Project Rules

### 1. Code Quality & Architecture
- **Strict TypeScript:** Use explicit types. Avoid `any`. Prefer `zod` for validation.
- **App Router:** All new features must use the App Router (`app/` directory).
- **Server Components (RSC) First:** Default to Server Components. Only use Client Components (`"use client"`) when necessary (interactivity, browser APIs).
- **Component Pattern:** Components are strictly divided:
    - **`src/components/ui/`**: Raw, unstyled primitives (headless or Tailwind-only).
    - **`src/components/feature/`**: Logic-heavy components using UI primitives.
    - **`src/components/shared/`**: Reusable business components.
- **File Naming:** PascalCase for components, camelCase for hooks and utilities.

### 2. Project Conventions
- **Directory Structure:** strictly adhere to:
    ```
    app/
    src/components/...
    src/lib/
    src/hooks/
    src/services/
    src/schemas/
    ```
- **Styling:**
    - Use **Tailwind CSS** for utility-first styling.
    - `next/image` for optimized images.
    - Prefer **Server-Side Rendering (SSR)** or **Static Site Generation (SSG)** over Client-Side Rendering.

### 3. Interaction Guidelines
- **Read First:** Before writing code, analyze `tsconfig.json`, `tailwind.config.ts`, and existing files in the `src/` directory to understand the established patterns.
- **Error Handling:** Implement robust error handling, especially for data fetching.
- **Performance:** Optimize bundle size. Use code splitting (Next.js dynamic imports) for large components or heavy libraries.
- **State Management:**
    - **Server State:** Use React Server Actions or `fetch` with caching strategies.
    - **Client State:** Use `useState`, `useReducer`, or `zustand` for global state.

### 4. Handling External Services (Supabase)
- Use the `src/lib/supabase` client.
- Always use environment variables for connection strings.
- Prefer `zod` schemas to validate incoming and outgoing data.

**Your objective:** To write clean, performant, and maintainable code that seamlessly integrates with the existing Next.js 14+ architecture, adhering strictly to the conventions defined in this project.
