# This document describes the file structure of the project.

## Directory Structure

ROOT/              # Root project folder - Monorepo structure
├── .turbo/                       # Turborepo cache and config files
├── apps/                        # Main applications folder
    ├── api/                     # Backend API application
        ├── src/                 # Source code for API
            ├── database/        # Database configuration and migrations
                ├── config/      # Configuration files (env, database, etc)
                ├── migrations/  # Database migrations
                ├── scripts/     # Database sql scripts
                └── entities/    # Database entities/models
            ├── controllers/     # Route handlers/controllers
            ├── errors/          # Custom error definitions
            ├── middlewares/     # Express/API middlewares
            ├── models/          # Data models/interfaces
            ├── repositories/    # Database queries/operations
            ├── routes/          # API route definitions
            ├── schemas/         # Validation schemas (zod, joi, etc)
            ├── services/        # Business logic layer
            └── index.ts         # Main API entry point
        ├── package.json         # API dependencies and scripts
        └── tsconfig.json        # TypeScript config for API
    └── web/                     # Frontend application
        ├── src/                 # Source code for frontend
            ├── components/      # Reusable UI components
                └── ui/          # Basic UI elements (buttons, inputs, etc)
            ├── lib/             # Utility functions and shared logic
            ├── pages/           # Page components/routes
            ├── services/        # API integration/external services
            ├── App.tsx          # Main React component
            ├── index.css        # Global styles
            └── env.d.ts         # Environment variables types
        ├── components.json      # UI components config
        ├── index.html          # HTML entry point
        ├── package.json        # Frontend dependencies and scripts
        ├── postcss.config.js   # PostCSS configuration
        ├── tailwind.config.js  # Tailwind CSS configuration
        └── tsconfig.json       # TypeScript config for frontend
├── packages/                   # Shared packages/libraries
    └── backend/                # Shared backend utilities
        └── src/
            ├── controllers/    # Base/shared controllers
            ├── middlewares/    # Shared middlewares
            ├── models/         # Shared data models
            ├── repositories/   # Base repository patterns
            ├── routes/         # Shared route handlers
            ├── types/          # TypeScript type definitions
            ├── services/       # Shared services/business logic
            ├── validations/    # Shared validation logic
            ├── utils/          # Utility functions
            ├── a2e/           # End-to-end tests
            ├── integration/    # Integration tests
            ├── unit/          # Unit tests
            └── public/         # Frontend shared code
                ├── assets/     # Static files (images, fonts)
                ├── components/ # Shared UI components
                ├── common/     # Common utilities/constants
                ├── features/   # Feature-specific code
                ├── hooks/      # React custom hooks
                ├── config/     # Frontend configurations
                ├── pages/      # Shared page templates
                ├── layouts/    # Page layouts/templates
                ├── adapters/   # API/external service adapters
                ├── store/      # State management (Redux/etc)
                ├── middleware/ # Store/state middlewares
                ├── slices/     # Redux slices/reducers
                ├── utils/      # Frontend utilities
                └── types/      # Frontend type definitions
├── node_modules/              # Dependencies (installed packages)
├── project-specifications-and-instructions/  # Project documentation
    ├── backend-instructions.md    # Backend setup/development guide
    └── frontend-instructions.md   # Frontend setup/development guide
├── package.json              # Root dependencies and scripts
├── pnpm-lock.yaml           # Locked dependencies versions
├── pnpm-workspace.yaml      # Monorepo workspace config
└── tsconfig.json            # Root TypeScript configuration
