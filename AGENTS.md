# Kong konnect-portal-dcr-handler

## Overview
An open-source HTTP DCR (Dynamic Client Registration) bridge that acts as a proxy between Konnect Dev Portal and third-party Identity Providers (specifically Okta), translating DCR API calls and managing OAuth2 client lifecycle. This is a reference implementation designed for AWS Lambda deployment, not production use.

## Tech Stack
- **Language:** TypeScript 5.x (Node.js 20.10.0) (Fastify 4.x)
- **Database:** None
- **Testing:** Jest with ts-jest (run with 'yarn test')
- **CI:** GitHub Actions

## Build & Test Commands
```bash
yarn build           # Build the project
yarn test            # Run tests
yarn lint            # Run linter
yarn lint:fix        # Format code
tsc --noEmit         # Type check
```

## Architecture
- `src/` - Main application source code
- `src/handlers/` - Fastify route handlers implementing DCR API endpoints (POST /, DELETE /:client_id, POST /:client_id/new-secret, POST /:client_id/event-hook)
- `src/schemas/` - Request/response validation schemas (ApplicationPayload, ApplicationResponse, EventHook)
- `openapi/` - OpenAPI specification for the HTTP DCR API
- `dist/` - TypeScript compilation output (gitignored)

## Boundaries
- Never modify files in node_modules/ or dist/
- Do not commit .env files or API keys (KONG_API_TOKENS, OKTA_API_TOKEN, OKTA_DOMAIN must be environment variables)
- Follow branch naming conventions: feat/, fix/, test/, refactor/, style/, docs/, ci/
- Always run 'yarn test' and 'yarn lint' before creating a PR
- PRs must be created as drafts for human review
- Comply with CODE_OF_CONDUCT.md standards
- This is a reference implementation - do not treat as production-ready code
- Use Yarn 1.22.x (not npm or other package managers)
- Node.js version must be >=20 (specified in .nvmrc as v20.10.0)
- Maintain ESLint standard-with-typescript config (2-space indentation, single quotes, Unix line endings)
- All environment variables must be set before running (KONG_API_TOKENS, OKTA_DOMAIN, OKTA_API_TOKEN)
- AWS Lambda deployment only occurs on main branch via CI/CD pipeline
