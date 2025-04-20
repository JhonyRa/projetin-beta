# Frontend Documentation

## Overview

This project follows a monorepo structure with multiple applications and shared resources.

## Technology Stack

- **Frontend Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Build Tool**: Nextjs
- **Package Manager**: Pnpm
- **Type Checking**: TypeScript
- **Data Fetching**: React Query (TanStack Query)
- **API Integration**: Axios (recommended for use with React Query)

## Key Files

- `src/app/page.tsx`: Main application component
- `src/app/layout.tsx`: Main application layout
- `src/index.tsx`: Application entry point
- `src/global.css`: Global CSS styles
- `package.json`: Project dependencies and scripts
- `postcss.config.js`: PostCSS configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration
- `next.config.ts`: Nextjs bundler configuration

## Development Guidelines

### File Naming Conventions

- React components: camelCase (e.g., `button.tsx`)
- Utilities and services: kebab-case (e.g., `auth-service.ts`)
- Test files: Same name as the file being tested with `.spec` suffix

### Code Organization

1. **Components**

- Each component should have its own directory
- Export the component from the index file
- Use Shadcn UI components when possible

2. **Pages**

- Follow React Router file-based routing convention
- Keep page components focused on layout and composition

3. **Services**

- Organize by domain/feature
- Include type definitions
- Implement proper error handling
- Use React Query for data fetching and caching

4. **Types**

- Separate type definitions by domain
- Use interfaces for object shapes
- Export types from dedicated files

### Best Practices

1 **Component Structure**

- Use functional components with hooks
- Implement proper prop typing
- Keep components focused and reusable
- Utilize Shadcn UI components for consistent design

2 **State Management**

- Use React hooks for local state
- Implement React Query for server state management
- Handle loading and error states using React Query's built-in states

3 **Styling**

- Follow Tailwind CSS conventions
- Use utility classes
- Maintain consistent spacing and layout
- Customize Shadcn UI components using Tailwind classes

4 **Performance**

- Implement proper code splitting
- Optimize images and assets
- Use proper caching strategies with React Query

5 **Data Fetching with React Query**

- Use `useQuery` for fetching data
- Use `useMutation` for modifying data
- Implement proper error handling and retries
- Utilize React Query's caching capabilities

6 **API Integration**

- Create a centralized API client using Axios
- Define reusable query and mutation hooks
- Use React Query's `QueryClientProvider` at the root of your `App.tsx`

7 **Shadcn UI Usage**

- Customize components using Tailwind classes
- Extend Shadcn UI components when necessary

## Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Nextjs Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Shadcn UI Documentation](https://ui.shadcn.com)
