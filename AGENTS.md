# AGENTS.md

Guidance for Codex and other AI agents working in this repository.

## Project Context

This repo contains **عروضي / Oroudi**, a static Arabic RTL quotation editor for Saudi engineering and architecture offices. It creates polished A4 quotation documents/PDFs from editable client, project, scope, deliverables, financial, optional-service, and office-brand data.

Business direction: keep the product useful as an MVP first. The app should feel fast, clean, and practical for office staff preparing quotations. It is SaaS-ready through Supabase auth/sync and Cloudflare deployment, but it should not become overbuilt.

The deployable app lives in `public/`. The current stack is intentionally small: plain HTML, CSS, and JavaScript, with no build step and no runtime npm dependencies.

## Inspect Before Editing

Before changing anything:

1. Check git state:
   - `git status --short --branch`
   - `git log --oneline --decorate -n 10`
2. Inspect the request against the current code and docs. Do not assume previous handoff notes are fully current.
3. Identify whether the change affects app behavior, data/storage, auth, deployment, print/PDF output, setup, or docs.
4. Keep any existing user or generated changes. Do not revert unrelated work.

Read these files first when relevant:

- `README.md` - product overview and repo structure.
- `DEPLOYMENT.md` - GitHub, Cloudflare, and Supabase deployment expectations.
- `INSTALL.md` - local Windows/offline install flow.
- `SESSION_LOG.md` - historical handoff notes; useful context, not guaranteed truth.
- `package.json` - available scripts and no-dependency intent.
- `wrangler.toml` and `.github/workflows/ci.yml` - deployment and CI behavior.
- `public/index.html` - app shell and script load order.
- `public/app.js` - main application state, rendering, persistence, auth, sync, settings, and print logic.
- `public/styles.css` - UI, A4 preview, and print CSS.
- `public/supabase-config.js` - public Supabase URL/anon key config.
- `supabase/schema.sql` and `supabase/self-serve-signup.sql` - database, RLS, and signup workspace behavior.
- `tests/quotation-static.test.js` - current regression coverage and stack assumptions.

## Superpowers And Plugins

Use Superpowers/plugins when they genuinely help the task: debugging, substantial planning, verification, GitHub workflows, browser QA, or document/PDF-specific checks.

Do not turn small repo edits into heavy ceremony. For a narrow doc or config change, inspect the relevant files, make the smallest change, run the appropriate check, and summarize clearly.

## Change Rules

- Keep changes small, focused, and reviewable.
- Prefer the existing static architecture and plain JavaScript style.
- Do not introduce frameworks, build systems, packages, bundlers, or server code unless explicitly approved.
- Avoid large refactors while implementing product changes.
- Avoid broad formatting churn.
- Avoid unnecessary docs. Update docs only when setup, architecture, deployment, or user-facing usage changes.
- Preserve the Arabic RTL product experience and print/PDF quality.
- Treat `public/app.js` as high-risk because it is large and owns many concerns. Make surgical edits and verify affected paths.

Ask for approval before:

- Architecture changes or splitting/restructuring major files.
- Database/schema/RLS changes.
- Auth/session/signup/sync behavior changes.
- Dependency, build, framework, or package changes.
- Deployment, Cloudflare, GitHub Actions, or domain changes.
- Major UI redesigns or print/PDF layout changes.
- Large refactors or migrations.

## Development Workflow

Default workflow:

1. Inspect current state and relevant files.
2. Make a brief plan for non-trivial work.
3. Implement the smallest coherent change.
4. Run checks.
5. Summarize what changed, which files changed, and what was verified.

For simple one-file docs changes, a short inspect -> edit -> verify loop is enough.

## Checks

Primary test command:

```powershell
npm test
```

Equivalent direct command:

```powershell
node tests/quotation-static.test.js
```

Useful read-only inspection commands:

```powershell
git status --short --branch
git diff --stat
rg --files -g '!node_modules' -g '!dist' -g '!build' -g '!coverage'
rg -n "TODO|FIXME|HACK|debugger|console\\.log"
```

For changes affecting UI, print/PDF, auth, sync, storage, or responsive behavior, static tests are not enough. Also perform browser/manual QA where possible and report exactly what was and was not verified.

## Product Priorities

- MVP first: solve real quotation workflow problems before adding platform complexity.
- Clean UX: fast editing, clear saved-project flow, polished Arabic RTL interface.
- Fast user flow: office staff should be able to create, adjust, print, and share quotations quickly.
- SaaS-ready, not overbuilt: Supabase/Cloudflare support should remain practical and understandable.
- Protect data integrity: be careful with migrations, localStorage keys, Supabase rows, RLS, and cloud-vs-local sync rules.
- Protect print quality: A4 sizing, page numbering, footer behavior, page fitting, and Arabic typography are core product features.

## Documentation Expectations

Update documentation only when a change affects:

- Setup or installation.
- Deployment or credentials/configuration.
- Architecture or data model.
- User-facing behavior or usage.
- Operational runbooks or handoff context.

When updating docs, keep them consistent. In particular, ensure `README.md`, `DEPLOYMENT.md`, `.env.example`, and `public/supabase-config.js` tell the same story about Supabase configuration.
