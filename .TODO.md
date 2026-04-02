# TODO

## Current State

- SQLite authentication setup is complete.
- Backend compiles and CI pipeline is passing with current fixes.

## Completed

- [x] Prisma datasource configured for SQLite.
- [x] `DATABASE_URL` configured to local SQLite path.
- [x] Prisma client generation working (`pnpm db:generate`).
- [x] Schema sync/push step working in workflow and local flow.
- [x] Auth flow works with current DB setup.

## Follow-up

- [ ] Decide and document one official default DB mode (SQLite vs PostgreSQL).
- [x] Add auth smoke tests (register/login) to prevent regressions.
- [ ] Keep dependency/security updates monitored in CI.

## Notes

- If DB mode changes to PostgreSQL later, update:
  - `.env.example`
  - Prisma datasource
  - README quick-start instructions
- Auth smoke tests are in `apps/backend/src/auth/auth.service.spec.ts`.
