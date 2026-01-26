@AGENTS.md

## Critical Boundaries (duplicated for safety)

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

## Quick Reference

Build: `yarn build`
Test: `yarn test`
Lint: `yarn lint`
