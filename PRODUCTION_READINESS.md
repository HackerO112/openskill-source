# Production readiness assessment

Status: **not yet production-ready** (source review, not a runtime certification).

## Verified from the current default branch
- React + TypeScript + Vite application.
- README describes browser-local learning progress and course generation through YouTube and Gemini.
- Package manifest has build and type-check scripts, The hardening branch now includes a committed npm lockfile, strict TypeScript configuration, CI, and a security policy. Automated tests and a license file are still absent.

## Release blockers
1. Review and remediate deprecated/high-risk dependencies surfaced during installation (including old formidable, superagent, and Recharts major versions); maintain the lockfile and use frozen installs.
2. Add unit and browser tests for course generation, malformed provider responses, local progress, import/export, and offline behavior.
3. Audit all provider/API calls and analytics. Verify no secrets are embedded in the browser bundle and clearly disclose third-party data transfers.
4. Verify course-source ranking, YouTube API quota handling, Gemini errors, caching, and user-facing attribution.
5. Add privacy/data-retention documentation, dependency and license inventory, accessibility checks, and deployment rollback instructions.

## Release gate
Do not call a release production-ready until lockfile-based CI, tests, dependency/security review, privacy review, and a deployed smoke test pass. This file is an assessment, not proof that those checks have passed.
