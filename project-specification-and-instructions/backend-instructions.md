# Backend Documentation

## Overview

This project follows a monorepo structure with multiple applications and shared resources. 

## Technology Stack

- **Backend Framework**: Express
- **Database**: PostgreSQL
- **Authentication**: Clerk
- **Storage**: AWS S3
- **ORM**: TypeORM
- **Package Manager**: Pnpm
- **Type Checking**: TypeScript

## Key Files

- `apps/api/src/database/entities/`: Database entity definitions
- `apps/api/src/database/migrations/`: Database migration files
- `apps/api/src/database/config/database.ts`: Database connection configuration
- `apps/api/src/schemas/`: Validation schemas (Zod)
- `apps/api/src/controllers/`: Route handlers/controllers
- `apps/api/src/services/`: Business logic layer
- `apps/api/src/models/`: Data models/interfaces
- `apps/api/src/repositories/`: Database queries/operations
- `apps/api/src/routes/`: API route definitions
- `apps/api/src/middlewares/`: Express/API middlewares
- `apps/api/src/errors/`: Custom error definitions
- `apps/api/src/utils/`: Utility functions
- `apps/api/src/index.ts`: Main API entry point
