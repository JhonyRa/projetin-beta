## Setup Instructions

1. Clone the repository
2. Run `pnpm install` to install the dependencies
3. Run `pnpm dev` to start the development server

## Environment Variables

1. Create a `.env` file in the root of the project
2. Copy the contents of `.env.example` and paste them into the `.env` file
3. Replace the placeholders with your own values

## Database Setup

1. Run `pnpm run migration:run` to create the database schema
2. Run `pnpm run migration:revert` to revert the schema to the previous state

## API Documentation

1. Run `pnpm run dev` to start the development server


## S3 configuration

- Configure the S3 bucket
- Configure the CloudFront distribution


## Commits

- Whenever a feature and/or refactor is done, it is interesting to commit to have a stable version of the software at that moment and not cause future errors and facilitate a possible stash, if necessary.

TODO:
- Configurar CDN no Cloud Front;
- Permissionamento do S3;