# Changelog

## 2026-11-11

### Fixed

- Integrated the Home navigation item with the themed navigation styling and added matching icons across desktop and mobile menus.
- Added a Home navigation button beside About on desktop and mobile menus.
- Added CI validation for linting, production builds, dependency audits, and repository data checks.
- Added decoded image dimension validation for admin uploads to reject malformed or oversized images.
- Added Supabase-backed distributed rate limiting for admin sign-in, enquiries, and career applications, with a local fallback for development.
- Corrected project-content spelling errors in public descriptions.
- Added a Content Security Policy covering the app's required fonts, maps, images, and API connections.

- Replaced missing project-card and client-logo fallback image paths with existing public assets.
- Confirmed TypeScript diagnostics are clean for the touched components.
- Confirmed Python syntax, JSON data, featured-project, and data-image checks pass.

### Audit Notes

- Next.js lint, production build, and dependency audit could not run because Node.js and npm are unavailable in the audit environment.
- Apply `supabase/migrations/003_rate_limits.sql` to enable shared rate-limit buckets in hosted deployments.
