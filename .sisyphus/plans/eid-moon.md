# Eid Moon — Eid Mubarak Messaging App

## TL;DR

> **Quick Summary**: Build a mobile-first Eid greeting app where users send anonymous/named messages to friends, locked until Eid day. Golden Serenity aesthetic, Google OAuth, envelope reveal animations.
>
> **Deliverables**:
> - Database schema (profiles, messages, wishes, events, app_settings) with RLS
> - Google OAuth flow (replace email/password)
> - Golden Serenity design system (light-only, serif headings, gold accents)
> - Message sending with 280-char limit, anonymous toggle, self-send block
> - Locked inbox with envelope animations (Framer Motion tap-to-reveal)
> - Wish-back (preset + custom, one per message)
> - User search (pg_trgm fuzzy on username/name/email)
> - Profile pages at `/u/[username]` with share link
> - In-app notification badge
> - Eid countdown + auto-unlock via polling
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES — 4 waves + final verification
> **Critical Path**: Cruft cleanup → DB schema → Auth → Inbox → Animations → QA

---

## Context

### Original Request
Build an Eid Mubarak messaging app where users can send heartfelt messages to each other, locked until Eid day, then revealed with beautiful envelope animations.

### Interview Summary
**Key Discussions**:
- **Auth**: Google OAuth only (any Google account), remove all email/password flows
- **Eid unlock**: Hardcoded time in .env (BDT timezone), stored in DB `app_settings` so RLS can reference
- **Messages**: 280 char limit, anonymous toggle, sender_id always stored for moderation
- **Wish-back**: Both preset text + custom reply, one per message only
- **Username**: Auto-generated from email prefix, unlimited changes allowed
- **Search**: pg_trgm fuzzy search on username + name + email
- **Reveal**: Individual tap on locked envelopes, letter slide-out animation
- **Profile**: Minimal (avatar, name, msg count, share link at `/u/[username]`)
- **Multi-year**: Events table for yearly Eid cycles
- **After Eid**: Messages persist forever
- **Notifications**: In-app badge only (no push/email)
- **Self-send**: Blocked via RLS + client check
- **Auto-unlock**: Browser polling detects Eid time, auto-reveals

**Research Findings**:
- Root `proxy.ts` is from Supabase's older starter template — exports `proxy()` but Next.js only recognizes `middleware.ts` with `export function middleware()`. Supabase's newest auth guide uses `middleware` as function name. Must rename to `middleware.ts` with updated export name. All `lib/supabase/` files confirmed current via Context7.
- Server client uses `getClaims()` not `getUser()` — follow this pattern
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is the env var (newer format)
- Tailwind v3, shadcn/ui new-york style, lucide icons already installed
- No framer-motion installed — must add

### Metis Review
**Identified Gaps** (addressed in plan):
- Store EID_UNLOCK_TIME in DB `app_settings` table, not just .env, so RLS can reference it
- Always store `sender_id` even for anonymous messages (moderation capability)
- RLS message content SELECT must use `NOW() >= unlock_time` server-side check
- Enable `pg_trgm` extension for fuzzy search
- Remove dark mode / ThemeProvider entirely, lock to light mode
- DB trigger on auth.users INSERT → auto-create profile with username from email prefix
- Use `LazyMotion` with `domAnimation` for Framer Motion bundle size
- Username collision handling: UNIQUE constraint + counter-based retry in trigger

---

## Work Objectives

### Core Objective
Transform a stock Next.js + Supabase starter into a mobile-first Eid greeting app with time-locked messages, envelope reveal animations, and Google OAuth.

### Concrete Deliverables
- 5 database tables with RLS policies and triggers
- Google OAuth sign-in (replace email/password)
- Golden Serenity design system (CSS variables, serif font, gold palette)
- Message compose form with anonymous toggle
- Locked inbox with Framer Motion envelope animations
- Wish-back system (preset + custom text)
- User search with pg_trgm
- Profile page at `/u/[username]`
- In-app notification badge
- Eid countdown timer + auto-unlock polling

### Definition of Done
- [ ] `npm run build` succeeds with zero errors
- [ ] All RLS policies verified via `supabase-mcp-server_get_advisors` (security)
- [ ] Google OAuth login → profile creation → send message → view locked inbox → Eid reveal flow works end-to-end
- [ ] No references to email/password auth remain in codebase
- [ ] All starter cruft files deleted

### Must Have
- Google OAuth as sole auth method
- Time-locked message content (RLS enforced server-side)
- sender_id always stored (even anonymous messages)
- 280 character message limit (DB constraint)
- Self-send blocked (RLS + client)
- Golden Serenity light-only theme
- Mobile-first responsive design
- Envelope tap-to-reveal animation
- One wish-back per message

### Must NOT Have (Guardrails)
- ❌ Dark mode or theme switching
- ❌ Email/password authentication **UI** (remove all email/password form components and routes)
- ❌ Follow/friend/block system
- ❌ Push notifications or email notifications
- ❌ Image/media attachments in messages
- ❌ Admin panel or moderation UI
- ❌ Message editing or deletion by sender
- ❌ Read receipts visible to sender
- ❌ Real-time chat (async message drop-off only)
- ❌ Custom avatar upload (Google avatar only)
- ❌ Hardcoded colors in component files (all via CSS variables)
- ❌ Global Supabase client instances (per-request server, per-component client)
- ❌ `getUser()` calls (use `getClaims()`)

---

## MCP & Tool Rules (MANDATORY)

### Context7 — Documentation First
Before writing ANY code for Framer Motion, Supabase Auth, or Next.js App Router:
1. Call `context7_resolve-library-id` with the library name
2. Call `context7_query-docs` with the resolved ID and specific query
3. Save retrieved context to `.sisyphus/latestContext.md`

**Known Library IDs**: `/vercel/next.js`, `/framer/motion`, `/supabase/supabase-js`

### Supabase MCP — All DDL via Migration
- ALL table creation, RLS, triggers, functions → `supabase-mcp-server_apply_migration`
- After EVERY migration batch → `supabase-mcp-server_get_advisors` type=security
- Data queries for verification → `supabase-mcp-server_execute_sql`
- **Timeout**: Use `timeout: 600000` (10 minutes) for all MCP calls
- **Project ID**: Discover via `supabase-mcp-server_list_projects` at start of DB tasks
- **No local migration files**: This project has NO `supabase/` directory. All DDL lives only
  in Supabase via MCP `apply_migration`. Do NOT create a `supabase/migrations/` folder.
  Migration SQL is specified inline in each task's "What to do" section.

### Protected Files — NEVER Modify
- `lib/supabase/server.ts`
- `lib/supabase/client.ts`
- `lib/supabase/proxy.ts`

### Notepad Protocol
- Location: `.sisyphus/notepads/eid-moon/`
- Files: `learnings.md`, `decisions.md`, `issues.md`, `problems.md`
- Rule: Always APPEND with timestamped headers. NEVER overwrite.

### Timeout Rule
- All `bash` commands with MCP or build: `timeout: 600000` (10 minutes)
- Standard bash commands: default timeout is fine

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (stock starter, no test setup)
- **Automated tests**: NO (user did not request tests)
- **Framework**: None
- **Primary verification**: Agent-Executed QA Scenarios (Playwright for UI, SQL for DB, curl for API)

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (`playwright` skill) — Navigate, interact, assert DOM, screenshot
- **Database**: Use `supabase-mcp-server_execute_sql` — Run queries, verify RLS, check constraints
- **API/Auth**: Use Bash (curl) — Send requests, assert status + response fields
- **Build**: Use Bash — `npm run build`, check exit code

### QA Auth Strategy — Manual Google Login + SQL Data Seeding

> **Approach**: Playwright QA scenarios requiring "logged in" state use a **manual login** workflow.
> The agent opens the browser, the USER logs in with their Google account once, and then the agent
> continues automated steps. Backend/DB verification uses `supabase-mcp-server_execute_sql` with
> JWT claims — no browser login needed.

**How Playwright "logged in" scenarios work**:
1. Agent navigates to `http://localhost:3000/auth/login`
2. Agent pauses and asks the user to manually complete Google OAuth sign-in
3. Once the user confirms login is complete, the agent resumes automated steps
4. The browser session persists — subsequent scenarios in the SAME Playwright session reuse the cookie (no re-login needed)

> **GLOBAL QA DIRECTIVE**: Every Playwright QA scenario in this plan that says
> "Preconditions: logged in" MUST start with:
> 1. Navigate to `http://localhost:3000/auth/login`
> 2. Pause — ask user to complete Google sign-in (first time only; skip if session already active)
> 3. Wait for redirect away from `/auth/login` (confirms session exists)
> 4. Navigate to the target page
>
> After the FIRST manual login, the Playwright browser session retains the cookie.
> Subsequent scenarios can skip step 2 and just navigate directly — verify by checking
> that the URL does NOT redirect back to `/auth/login`.

### QA Data Seeding — via Supabase MCP SQL

> **Problem**: Many QA scenarios require "at least 1 message sent to user", "target user exists",
> or "multiple messages exist". Self-send is blocked, so a SECOND user is required.
>
> **Solution**: Use `supabase-mcp-server_execute_sql` with service role to seed test data
> directly into the database. The user logs in via Google to create the primary profile;
> a second test user + messages are seeded via SQL after the user's profile exists.

**Seeding workflow** (run ONCE after Task 8 completes and user has logged in):
```sql
-- Step 1: Create a second test user via Supabase Auth Admin API
-- (Use supabase-mcp-server_execute_sql for this)
-- NOTE: The agent should use the Supabase Dashboard or MCP to create a second user,
-- then seed messages between the two users.

-- Step 2: After both users exist, seed messages (run via supabase-mcp-server_execute_sql):
INSERT INTO public.messages (recipient_id, sender_id, content, is_anonymous, event_id)
SELECT
  p_recipient.id,
  p_sender.id,
  msg.content,
  msg.is_anon,
  (SELECT id FROM public.events WHERE slug = 'eid-2026')
FROM
  (VALUES
    ('Eid Mubarak! Wishing you peace and joy 🌙', false),
    ('May this Eid bring happiness to your family', true),
    ('JazakAllah for everything you do!', false)
  ) AS msg(content, is_anon),
  public.profiles p_recipient,
  public.profiles p_sender
WHERE p_recipient.username != p_sender.username
  AND p_recipient.id = (SELECT id FROM public.profiles ORDER BY created_at ASC LIMIT 1)
  AND p_sender.id = (SELECT id FROM public.profiles ORDER BY created_at ASC LIMIT 1 OFFSET 1);

-- Step 3: Update message count
UPDATE public.profiles
SET message_count = (SELECT count(*) FROM public.messages WHERE recipient_id = profiles.id);
```

**Known test data after seeding**:
- **Primary user** (recipient): The user's own Google account — username from their email
- **Second user** (sender): Created via Supabase Dashboard or MCP admin API
- **Messages**: 3 messages from sender to recipient (1 anonymous, 2 named)

> **QA PLACEHOLDER RESOLUTION (CRITICAL — all agents MUST follow this)**:
>
> | Placeholder | Resolves To | How to Obtain |
> |---|---|---|
> | `{known-username}` | Username of the primary user (logged-in Google account) | Query: `SELECT username FROM profiles ORDER BY created_at ASC LIMIT 1` via MCP |
> | `{target-username}` | Same as `{known-username}` — the recipient | Same query as above |
> | `{own-username}` | Username of the currently logged-in user | Same as `{known-username}` for primary user |
> | `{sender-username}` | Username of the second seeded user | Query: `SELECT username FROM profiles ORDER BY created_at ASC LIMIT 1 OFFSET 1` via MCP |
>
> **Agent workflow**: Before running ANY scenario with placeholders:
> 1. Query `SELECT username FROM profiles ORDER BY created_at ASC LIMIT 2` via `supabase-mcp-server_execute_sql`
> 2. First result = `{known-username}` / `{target-username}` / `{own-username}`
> 3. Second result = `{sender-username}`
> 4. Substitute ALL placeholders in subsequent Playwright/Bash steps with real values

> **GLOBAL QA DIRECTIVE**: Any scenario with "messages exist" precondition must verify
> data exists via `supabase-mcp-server_execute_sql` query `SELECT count(*) FROM public.messages`.
> If count = 0, run the seeding SQL above first.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — start immediately, MAX PARALLEL):
├── Task 1:  Delete starter cruft files [quick]
├── Task 2:  Install dependencies (framer-motion, font) [quick]
├── Task 3:  Create middleware.ts [quick]
├── Task 4:  Golden Serenity theme + remove dark mode [quick]
├── Task 5:  DB: profiles + app_settings + events + pg_trgm [unspecified-high]
├── Task 6:  DB: messages + wishes tables [unspecified-high] (depends: 5)
└── Task 7:  DB: RLS policies + triggers + functions [unspecified-high] (depends: 5, 6)

Wave 2 (Auth + Core — after Wave 1):
├── Task 8:  Google OAuth: callback route + sign-in page [unspecified-high] (depends: 1-4, 7)
├── Task 9:  Layout + bottom nav + app shell [visual-engineering] (depends: 4)
├── Task 10: Profile page /u/[username] [visual-engineering] (depends: 7, 9)
├── Task 11: User search with pg_trgm [unspecified-high] (depends: 7, 9)
└── Task 12: Message compose form [visual-engineering] (depends: 7, 9)

Wave 3 (Features + Animation — after Wave 2):
├── Task 13: Inbox page (locked state + countdown) [visual-engineering] (depends: 8, 12)
├── Task 14: Envelope reveal animation (Framer Motion) [visual-engineering] (depends: 13)
├── Task 15: Wish-back feature [visual-engineering] (depends: 14)
├── Task 16: In-app notification badge [quick] (depends: 13)
└── Task 17: Profile share + OG meta [quick] (depends: 10)

Wave 4 (Polish — after Wave 3):
├── Task 18: Mobile responsiveness pass [visual-engineering] (depends: 13-17)
├── Task 19: Auto-unlock polling + live reveal [unspecified-high] (depends: 14)
└── Task 20: Build verification + Vercel prep [quick] (depends: all)

Wave FINAL (Verification — after ALL tasks, 4 parallel):
├── Task F1: Plan compliance audit [oracle]
├── Task F2: Code quality review [unspecified-high]
├── Task F3: Real manual QA [unspecified-high + playwright]
└── Task F4: Scope fidelity check [deep]
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| 1 | — | 8 |
| 2 | — | 8, 14 |
| 3 | — | 8 |
| 4 | — | 8, 9 |
| 5 | — | 6, 7 |
| 6 | 5 | 7 |
| 7 | 5, 6 | 8, 10, 11, 12 |
| 8 | 1-4, 7 | 13 |
| 9 | 4 | 10, 11, 12, 13 |
| 10 | 7, 9 | 17 |
| 11 | 7, 9 | — |
| 12 | 7, 9 | 13 |
| 13 | 8, 12 | 14, 16, 18 |
| 14 | 13 | 15, 18, 19 |
| 15 | 14 | 18 |
| 16 | 13 | 18 |
| 17 | 10 | 18 |
| 18 | 13-17 | 20 |
| 19 | 14 | 20 |
| 20 | all | F1-F4 |

### Agent Dispatch Summary

| Wave | Tasks | Categories |
|------|-------|-----------|
| 1 | 7 | T1-T4 → `quick`, T5-T7 → `unspecified-high` |
| 2 | 5 | T8,T11 → `unspecified-high`, T9,T10,T12 → `visual-engineering` |
| 3 | 5 | T13-T15 → `visual-engineering`, T16-T17 → `quick` |
| 4 | 3 | T18 → `visual-engineering`, T19 → `unspecified-high`, T20 → `quick` |
| FINAL | 4 | F1 → `oracle`, F2,F3 → `unspecified-high`, F4 → `deep` |

---

## TODOs

### Wave 1 — Foundation (Start Immediately, MAX PARALLEL)

- [ ] 1. Delete Starter Cruft Files

  **What to do**:
  - Delete ALL starter-kit files that will be replaced:
    - `components/deploy-button.tsx`
    - `components/env-var-warning.tsx`
    - `components/hero.tsx`
    - `components/next-logo.tsx`
    - `components/supabase-logo.tsx`
    - `components/theme-switcher.tsx`
    - `components/tutorial/` (entire directory)
    - `components/login-form.tsx`
    - `components/sign-up-form.tsx`
    - `components/forgot-password-form.tsx`
    - `components/update-password-form.tsx`
    - `components/auth-button.tsx`
    - `components/logout-button.tsx` (will be recreated as Google-aware logout)
  - Delete root-level `proxy.ts` (this file is from Supabase's older starter template — it works correctly
    but uses the legacy naming convention: `proxy.ts` with `export function proxy()`. Next.js requires
    `middleware.ts` with `export function middleware()`. Supabase's newest auth guide confirms the
    `middleware` naming. Task 3 creates the properly-named replacement. **DO NOT confuse with
    `lib/supabase/proxy.ts` which is a PROTECTED helper file exporting `updateSession` and must NOT
    be deleted — it is identical to Supabase's latest official docs (verified via Context7).**)
  - Delete unused auth routes:
    - `app/auth/sign-up/` (entire directory)
    - `app/auth/sign-up-success/` (entire directory)
    - `app/auth/forgot-password/` (entire directory)
    - `app/auth/update-password/` (entire directory)
    - `app/auth/sign-up-success/` (entire directory)
  - **KEEP AS-IS (Supabase original)**: `app/auth/confirm/route.ts` — handles magic link verification. DO NOT modify or delete.
  - Keep but update: `app/auth/error/page.tsx` (update for OAuth error display)
  - Delete existing protected route group: `app/protected/` (will recreate as `app/(protected)/`)
  - Clean `app/page.tsx` — replace with minimal placeholder (just "Eid Moon" text)
  - Remove all imports of deleted components from any remaining files
  - Run `npm run build` to verify nothing is broken after deletions

  **Must NOT do**:
  - Do NOT delete `lib/supabase/server.ts`, `client.ts`, or `lib/supabase/proxy.ts` (the root `proxy.ts` IS deleted — see above)
  - Do NOT delete `app/layout.tsx` or `app/globals.css`
  - Do NOT delete the `components/ui/` directory (shadcn primitives)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`git-master`]
    - `git-master`: Needed for safe file deletion across repo, verifying no broken imports

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Task 8 (auth needs clean slate)
  - **Blocked By**: None

  **References**:
  - `components/` — glob this directory to find all files to delete
  - `app/auth/` — glob for auth route directories to remove
  - `app/page.tsx` — current home page referencing hero, tutorial, etc.
  - `app/layout.tsx` — may import ThemeProvider or theme-switcher

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: All cruft files deleted
    Tool: Bash
    Steps:
      1. Run: ls components/deploy-button.tsx components/hero.tsx components/tutorial/ 2>&1
      2. Assert: Each returns "No such file or directory"
      3. Run: ls app/auth/sign-up/ app/auth/forgot-password/ 2>&1
      4. Assert: Each returns "No such file or directory"
    Expected Result: All listed files/dirs are gone
    Evidence: .sisyphus/evidence/task-1-cruft-deleted.txt

  Scenario: Build still passes after deletion
    Tool: Bash
    Steps:
      1. Run: npm run build (timeout: 600000)
      2. Assert: Exit code 0
    Expected Result: Clean build with no import errors
    Evidence: .sisyphus/evidence/task-1-build-pass.txt
  ```

  **Commit**: YES (groups with 2, 3, 4)
  - Message: `chore: clean starter cruft, add deps, setup theme and middleware`
  - Pre-commit: `npm run build`

- [ ] 2. Install Dependencies

  **What to do**:
  - Install framer-motion: `npm install framer-motion`
  - Install missing shadcn components needed by later tasks:
    ```bash
    npx shadcn@latest add textarea switch separator avatar
    ```
  - Add Playfair Display font via `next/font/google` in `app/layout.tsx`
    - Import: `import { Playfair_Display } from 'next/font/google'`
    - Configure: `const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif', display: 'swap' })`
    - Add `playfair.variable` to the `<body>` className
  - Verify framer-motion is in package.json dependencies
  - Verify the font loads by checking layout.tsx compiles

  **Must NOT do**:
  - Do NOT install next-themes or any dark mode package
  - Do NOT install any auth libraries (Supabase handles OAuth)
  - Do NOT modify `lib/supabase/*` files

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: Task 8 (auth page needs fonts), Task 14 (animations need framer-motion)
  - **Blocked By**: None

  **References**:
  - `package.json` — current dependencies list
  - `app/layout.tsx` — where to add font configuration
  - Context7: Query `/vercel/next.js` for "next/font/google Playfair Display setup"

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: framer-motion installed
    Tool: Bash
    Steps:
      1. Run: cat package.json | grep framer-motion
      2. Assert: Output contains "framer-motion" with a version number
    Expected Result: framer-motion in dependencies
    Evidence: .sisyphus/evidence/task-2-deps-installed.txt

  Scenario: Font configured in layout
    Tool: Bash
    Steps:
      1. Run: grep -n "Playfair_Display" app/layout.tsx
      2. Assert: At least one match found
      3. Run: npm run build (timeout: 600000)
      4. Assert: Exit code 0
    Expected Result: Font import present and build passes
    Evidence: .sisyphus/evidence/task-2-font-configured.txt
  ```

  **Commit**: YES (groups with 1, 3, 4)

- [ ] 3. Create middleware.ts

  **What to do**:
  - **IMPORTANT**: Task 1 deletes the root `proxy.ts` file (Supabase's older starter naming convention).
    This task creates `middleware.ts` — the properly-named replacement per Supabase's latest auth guide
    and Next.js requirements. The root `proxy.ts` exported `proxy()` — Next.js only recognizes
    `middleware.ts` with `export function middleware()`.
  - All `lib/supabase/` files (server.ts, client.ts, proxy.ts) are **identical to Supabase's latest
    official documentation** (verified via Context7) — DO NOT modify them.
  - Create `middleware.ts` at the project root (NOT in `app/`)
  - Import from `lib/supabase/proxy.ts` — that file exports `updateSession` (NOT `proxy` or `middleware`)
  - Create middleware function that calls `updateSession(request)` and re-export:
    ```typescript
    import { updateSession } from '@/lib/supabase/proxy'
    import { type NextRequest } from 'next/server'

    export async function middleware(request: NextRequest) {
      return await updateSession(request)
    }
    ```
  - Add `config` export with matcher that protects all routes EXCEPT static files and auth callback:
    ```typescript
    export const config = {
      matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api/|u/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
      ],
    }
    ```
  - **NOTE**: `/u/` is excluded so profile pages are publicly accessible for OG meta crawlers.
    `/api/` is excluded so API routes work without auth redirect
    (API routes handle their own auth internally via service role or session checks).
    The profile page itself handles auth state gracefully (shows profile to all,
    "Send message" button links to login if unauthenticated).
  - Verify by running `npm run build`

  **Must NOT do**:
  - Do NOT modify `lib/supabase/proxy.ts` — only import from it
  - Do NOT create custom middleware logic — just wrap `updateSession`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: Task 8 (auth needs middleware for session refresh)
  - **Blocked By**: None

  **References**:
  - `lib/supabase/proxy.ts` — READ this file first to understand the export name and signature
  - Context7: Query `/vercel/next.js` for "middleware.ts configuration and matcher"

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: middleware.ts exists and exports correctly
    Tool: Bash
    Steps:
      1. Run: cat middleware.ts
      2. Assert: Contains "import { updateSession } from" and "export async function middleware"
      3. Assert: Contains "export const config" with matcher array
    Expected Result: Proper middleware file at project root wrapping updateSession
    Evidence: .sisyphus/evidence/task-3-middleware-created.txt

  Scenario: Build passes with middleware
    Tool: Bash
    Steps:
      1. Run: npm run build (timeout: 600000)
      2. Assert: Exit code 0, no middleware-related errors
    Expected Result: Next.js recognizes and compiles middleware
    Evidence: .sisyphus/evidence/task-3-build-pass.txt
  ```

  **Commit**: YES (groups with 1, 2, 4)

- [ ] 4. Golden Serenity Theme + Remove Dark Mode

  **What to do**:
  - Edit `app/globals.css` — replace the existing CSS variable palette with Golden Serenity:
    ```css
    :root {
      --background: 36 33% 95%;        /* #F7F4EF cream */
      --foreground: 28 27% 23%;        /* #4A3B2C warm brown */
      --card: 0 0% 100%;               /* #FFFFFF */
      --card-foreground: 28 27% 23%;
      --primary: 33 35% 53%;           /* #B38B59 gold */
      --primary-foreground: 0 0% 100%;
      --secondary: 36 33% 90%;
      --secondary-foreground: 28 27% 23%;
      --muted: 36 20% 90%;
      --muted-foreground: 28 15% 45%;
      --accent: 33 35% 53%;
      --accent-foreground: 0 0% 100%;
      --destructive: 0 84% 60%;
      --destructive-foreground: 0 0% 100%;
      --border: 33 35% 53%;            /* gold borders */
      --input: 33 25% 80%;
      --ring: 33 35% 53%;
      --radius: 0.75rem;
    }
    ```
  - REMOVE the `.dark { }` section entirely from globals.css
  - In `app/layout.tsx`:
    - Remove `next-themes` ThemeProvider if present
    - Remove `suppressHydrationWarning` from `<html>` if it was for themes
    - Set `<html lang="en" className="light">` to force light mode
    - Add Tailwind font-serif class: update `tailwind.config.ts` to extend `fontFamily.serif` with `var(--font-serif)`
  - Add to globals.css body: `font-family: var(--font-sans);` and heading rule:
    ```css
    h1, h2, h3, h4, h5, h6 { font-family: var(--font-serif), serif; }
    ```

  **Must NOT do**:
  - Do NOT hardcode hex colors in any component file
  - Do NOT install next-themes or any theme package
  - Do NOT add a `.dark` variant

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Needed for correct HSL color conversion and design system setup

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: Task 8, 9 (all UI depends on theme)
  - **Blocked By**: None

  **References**:
  - `app/globals.css` — READ current CSS variables to understand structure before replacing
  - `tailwind.config.ts` — READ to understand current font/theme extension points
  - `app/layout.tsx` — READ to find ThemeProvider imports and body className
  - `components/theme-switcher.tsx` — should be deleted by Task 1, verify no imports remain

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: Golden Serenity colors applied
    Tool: Bash
    Steps:
      1. Run: grep "B38B59\|b38b59\|--primary-gold\|33 35% 53%" app/globals.css
      2. Assert: At least one match for gold color
      3. Run: grep "\.dark" app/globals.css
      4. Assert: No matches (dark mode removed)
    Expected Result: Gold palette present, dark mode absent
    Evidence: .sisyphus/evidence/task-4-theme-applied.txt

  Scenario: No dark mode infrastructure remains
    Tool: Bash
    Steps:
      1. Run: grep -r "ThemeProvider\|next-themes\|theme-switcher" app/ components/ --include="*.tsx" --include="*.ts" 2>/dev/null
      2. Assert: No matches
      3. Run: npm run build (timeout: 600000)
      4. Assert: Exit code 0
    Expected Result: Zero dark mode references, clean build
    Evidence: .sisyphus/evidence/task-4-no-dark-mode.txt
  ```

  **Commit**: YES (groups with 1, 2, 3)

- [ ] 5. DB: Profiles + App Settings + Events + pg_trgm Extension

  **What to do**:
  - First: call `supabase-mcp-server_list_projects` to get the project ID
  - Enable pg_trgm extension
  - Create `app_settings` table to store Eid unlock time (so RLS can reference it):
    ```sql
    create extension if not exists pgcrypto;
    create extension if not exists pg_trgm;

    create table public.app_settings (
      key text primary key,
      value text not null,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    -- Insert the Eid unlock time (UTC! BDT 6PM = UTC 12PM)
    insert into public.app_settings (key, value)
    values ('eid_unlock_time', '2026-03-30T12:00:00Z');

    alter table public.app_settings enable row level security;
    create policy "App settings are readable by authenticated users"
      on public.app_settings for select
      to authenticated
      using (true);
    ```
  - Create `events` table for multi-year support:
    ```sql
    create table public.events (
      id uuid default gen_random_uuid() primary key,
      name text not null,
      unlock_time timestamptz not null,
      year int not null,
      is_active boolean default false,
      created_at timestamptz default now()
    );

    alter table public.events enable row level security;
    create policy "Events are readable by authenticated users"
      on public.events for select
      to authenticated
      using (true);

    insert into public.events (name, unlock_time, year, is_active)
    values ('Eid ul-Fitr 2026', '2026-03-30T12:00:00Z', 2026, true);
    ```
  - Create `profiles` table with auto-generation trigger:
    ```sql
    create table public.profiles (
      id uuid references auth.users on delete cascade primary key,
      username text unique not null check (char_length(username) >= 3 and char_length(username) <= 30),
      full_name text,
      avatar_url text,
      email text,
      message_count int default 0,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    -- GIN index for pg_trgm fuzzy search
    create index profiles_username_trgm_idx on public.profiles using gin (username gin_trgm_ops);
    create index profiles_full_name_trgm_idx on public.profiles using gin (full_name gin_trgm_ops);

    alter table public.profiles enable row level security;

    -- Authenticated users can view all profile fields (including email for search)
    create policy "Profiles are viewable by authenticated users"
      on public.profiles for select
      to authenticated
      using (true);

    -- Public-safe RPC for /u/[username] page (accessible without auth, for OG crawlers + visitors)
    -- Returns ONLY safe fields (no email) so unauthenticated access is safe
    create or replace function public.get_public_profile(lookup_username text)
    returns table (
      id uuid,
      username text,
      full_name text,
      avatar_url text,
      message_count int
    )
    language plpgsql
    security definer set search_path = ''
    as $$
    begin
      return query
      select
        p.id,
        p.username,
        p.full_name,
        p.avatar_url,
        p.message_count
      from public.profiles p
      where p.username = lookup_username
      limit 1;
    end;
    $$;

    create policy "Users can update own profile"
      on public.profiles for update
      to authenticated
      using (auth.uid() = id)
      with check (auth.uid() = id);

    create policy "Users can insert own profile"
      on public.profiles for insert
      to authenticated
      with check (auth.uid() = id);
    ```
  - Create the auto-profile trigger function:
    ```sql
    create or replace function public.handle_new_user()
    returns trigger
    language plpgsql
    security definer set search_path = ''
    as $$
    declare
      new_username text;
      username_base text;
      counter int := 0;
    begin
      -- Extract username from email (before @)
      username_base := split_part(new.email, '@', 1);
      -- Sanitize: only lowercase alphanumeric and underscores
      username_base := regexp_replace(lower(username_base), '[^a-z0-9_]', '', 'g');
      -- Ensure minimum length
      if char_length(username_base) < 3 then
        username_base := username_base || 'user';
      end if;

      new_username := username_base;

      -- Handle collision with counter
      loop
        begin
          insert into public.profiles (id, username, full_name, avatar_url, email)
          values (
            new.id,
            new_username,
            new.raw_user_meta_data ->> 'full_name',
            new.raw_user_meta_data ->> 'avatar_url',
            new.email
          );
          return new;
        exception when unique_violation then
          counter := counter + 1;
          new_username := username_base || counter::text;
        end;
      end loop;
    end;
    $$;

    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
    ```
  - Execute ALL above as a single migration via `supabase-mcp-server_apply_migration`
    - name: `create_foundation_tables`
  - After migration: run `supabase-mcp-server_get_advisors` type=security

  **Must NOT do**:
  - Do NOT run SQL manually in dashboard
  - Do NOT create tables without RLS enabled
  - Do NOT store unlock time without UTC conversion

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (independent of Tasks 1-4)
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 6, Task 7
  - **Blocked By**: None

  **References**:
  - `lib/supabase/server.ts` — READ ONLY to understand createClient pattern
  - Supabase MCP: `supabase-mcp-server_apply_migration` for DDL execution
  - Supabase MCP: `supabase-mcp-server_get_advisors` for security check after

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: Tables created successfully
    Tool: supabase-mcp-server_execute_sql
    Steps:
      1. Query: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
      2. Assert: Result contains 'profiles', 'app_settings', 'events'
    Expected Result: All 3 tables exist in public schema
    Evidence: .sisyphus/evidence/task-5-tables-created.txt

  Scenario: pg_trgm extension enabled
    Tool: supabase-mcp-server_execute_sql
    Steps:
      1. Query: SELECT extname FROM pg_extension WHERE extname = 'pg_trgm';
      2. Assert: Returns one row with 'pg_trgm'
    Expected Result: Extension is active
    Evidence: .sisyphus/evidence/task-5-pg-trgm.txt

  Scenario: Profile trigger fires on user insert
    Tool: supabase-mcp-server_execute_sql
    Steps:
      1. Query: SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';
      2. Assert: Returns one row
    Expected Result: Trigger exists on auth.users
    Evidence: .sisyphus/evidence/task-5-trigger-exists.txt

  Scenario: RLS security check passes
    Tool: supabase-mcp-server_get_advisors (type=security)
    Steps:
      1. Run security advisor
      2. Assert: No critical warnings about profiles, app_settings, or events tables
    Expected Result: All tables have RLS enabled with policies
    Evidence: .sisyphus/evidence/task-5-rls-check.txt
  ```

  **Commit**: YES (groups with 6, 7)
  - Message: `feat(db): create schema with RLS, triggers, and functions`

- [ ] 6. DB: Messages + Wishes Tables

  **What to do**:
  - Create `messages` table:
    ```sql
    create table public.messages (
      id uuid default gen_random_uuid() primary key,
      sender_id uuid not null references public.profiles(id) on delete cascade,
      recipient_id uuid not null references public.profiles(id) on delete cascade,
      content text not null check (char_length(content) >= 1 and char_length(content) <= 280),
      is_anonymous boolean default false,
      is_read boolean default false,
      event_id uuid references public.events(id),
      created_at timestamptz default now(),
      constraint no_self_send check (sender_id != recipient_id)
    );

    create index messages_recipient_idx on public.messages(recipient_id);
    create index messages_sender_idx on public.messages(sender_id);

    alter table public.messages enable row level security;
    ```
  - Create `wishes` table (wish-back, one per message):
    ```sql
    create table public.wishes (
      id uuid default gen_random_uuid() primary key,
      message_id uuid unique not null references public.messages(id) on delete cascade,
      sender_id uuid not null references public.profiles(id) on delete cascade,
      content text not null check (char_length(content) >= 1 and char_length(content) <= 280),
      is_preset boolean default false,
      created_at timestamptz default now()
    );

    alter table public.wishes enable row level security;
    ```
  - Create function to increment message_count on profiles:
    ```sql
    create or replace function public.increment_message_count()
    returns trigger
    language plpgsql
    security definer set search_path = ''
    as $$
    begin
      update public.profiles
      set message_count = message_count + 1
      where id = new.recipient_id;
      return new;
    end;
    $$;

    create trigger on_message_created
      after insert on public.messages
      for each row execute procedure public.increment_message_count();
    ```
  - Execute via `supabase-mcp-server_apply_migration` name: `create_messages_wishes`

  **Must NOT do**:
  - Do NOT allow sender_id to be NULL (always store for moderation)
  - Do NOT omit the self-send constraint

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (sequential after Task 5)
  - **Parallel Group**: Wave 1 sequential chain (5 → 6 → 7)
  - **Blocks**: Task 7
  - **Blocked By**: Task 5 (profiles table must exist for FK)

  **References**:
  - Task 5 output: profiles and events tables must exist first
  - Supabase MCP: `supabase-mcp-server_apply_migration`

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: Messages and wishes tables created
    Tool: supabase-mcp-server_execute_sql
    Steps:
      1. Query: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('messages', 'wishes') ORDER BY table_name;
      2. Assert: Returns 'messages' and 'wishes'
    Expected Result: Both tables exist
    Evidence: .sisyphus/evidence/task-6-tables-created.txt

  Scenario: Self-send constraint exists
    Tool: supabase-mcp-server_execute_sql
    Steps:
      1. Query: SELECT conname FROM pg_constraint WHERE conname = 'no_self_send';
      2. Assert: Returns one row
    Expected Result: Constraint prevents self-sending
    Evidence: .sisyphus/evidence/task-6-self-send-blocked.txt

  Scenario: Message count trigger exists
    Tool: supabase-mcp-server_execute_sql
    Steps:
      1. Query: SELECT tgname FROM pg_trigger WHERE tgname = 'on_message_created';
      2. Assert: Returns one row
    Expected Result: Trigger increments profile message_count
    Evidence: .sisyphus/evidence/task-6-count-trigger.txt
  ```

  **Commit**: YES (groups with 5, 7)

- [ ] 7. DB: RLS Policies for Messages + Wishes + RPC Functions

  **What to do**:
  - Create RLS policies for messages:
    ```sql
    -- Senders can insert messages (but not to themselves)
    create policy "Users can send messages"
      on public.messages for insert
      to authenticated
      with check (
        auth.uid() = sender_id
        and sender_id != recipient_id
      );

    -- IMPORTANT: RLS is ROW-level, not column-level. We CANNOT hide content column via RLS.
    -- Strategy: REVOKE direct SELECT on messages from authenticated role.
    -- ALL message reads go through SECURITY DEFINER RPCs that control column visibility.
    -- Senders can see their own sent messages (for confirmation), recipients get content only after Eid.
    revoke select on public.messages from authenticated;

    -- Grant only INSERT (for sending) and UPDATE (for marking read) to authenticated
    -- SELECT is handled exclusively via RPCs (get_inbox_messages, get_sent_messages)
    --
    -- IMPORTANT: Because SELECT is revoked, client-side .insert() and .update() MUST NOT
    -- chain .select() (which triggers PostgREST RETURNING *). Without .select(), supabase-js
    -- sends Prefer: return=minimal, which does NOT require SELECT privileges.
    -- Example: supabase.from('messages').insert({...}) ← CORRECT (no .select())
    -- Example: supabase.from('messages').insert({...}).select() ← WILL FAIL (needs SELECT)
    grant insert on public.messages to authenticated;
    grant update on public.messages to authenticated;

    -- Recipients can mark as read
    create policy "Recipients can mark messages read"
      on public.messages for update
      to authenticated
      using (auth.uid() = recipient_id)
      with check (auth.uid() = recipient_id);
    ```
  - Create RLS policies for wishes:
    ```sql
    -- Only message recipients can create wish-backs
    create policy "Recipients can wish back"
      on public.wishes for insert
      to authenticated
      with check (
        auth.uid() = sender_id
        and exists (
          select 1 from public.messages m
          where m.id = message_id
          and m.recipient_id = auth.uid()
        )
      );

    -- Both parties can view wishes
    create policy "Wish participants can view"
      on public.wishes for select
      to authenticated
      using (
        sender_id = auth.uid()
        or exists (
          select 1 from public.messages m
          where m.id = message_id
          and (m.sender_id = auth.uid() or m.recipient_id = auth.uid())
        )
      );
    ```
  - Create RPC function to get inbox preview (metadata without content before Eid):
    **SECURITY**: This RPC uses `auth.uid()` internally — NO user_id parameter.
    This prevents any authenticated user from querying someone else's inbox.
    Since direct SELECT on messages is revoked, this is the ONLY way to read messages.
    ```sql
    create or replace function public.get_inbox_messages()
    returns table (
      id uuid,
      sender_username text,
      sender_avatar text,
      sender_full_name text,
      is_anonymous boolean,
      is_read boolean,
      created_at timestamptz,
      content text,
      is_unlocked boolean,
      wish_content text,
      wish_is_preset boolean
    )
    language plpgsql
    security definer set search_path = ''
    as $$
    declare
      unlock_time timestamptz;
      calling_user_id uuid;
    begin
      -- Derive caller identity from JWT — never accept as parameter
      calling_user_id := auth.uid();
      if calling_user_id is null then
        raise exception 'Not authenticated';
      end if;

      select value::timestamptz into unlock_time
      from public.app_settings
      where key = 'eid_unlock_time';

      return query
      select
        m.id,
        case when m.is_anonymous then null else p.username end,
        case when m.is_anonymous then null else p.avatar_url end,
        case when m.is_anonymous then null else p.full_name end,
        m.is_anonymous,
        m.is_read,
        m.created_at,
        case when now() >= unlock_time then m.content else null end,
        (now() >= unlock_time) as is_unlocked,
        w.content as wish_content,
        w.is_preset as wish_is_preset
      from public.messages m
      left join public.profiles p on p.id = m.sender_id
      left join public.wishes w on w.message_id = m.id
      where m.recipient_id = calling_user_id
      order by m.created_at desc;
    end;
    $$;
    ```
  - Create search RPC function:
    **SECURITY**: Requires auth — checks `auth.uid()` is not null before executing.
    ```sql
    create or replace function public.search_users(search_query text)
    returns table (
      id uuid,
      username text,
      full_name text,
      avatar_url text,
      similarity_score real
    )
    language plpgsql
    security definer set search_path = 'public, extensions'
    as $$
    begin
      -- NOTE: search_path includes 'public' and 'extensions' (NOT empty '')
      -- because pg_trgm's similarity() function and % operator need schema resolution.
      -- In Supabase, extensions may be in 'extensions' schema or 'public' schema —
      -- including both ensures the function works regardless.

      -- Require authentication
      if auth.uid() is null then
        raise exception 'Not authenticated';
      end if;

      return query
      select
        p.id,
        p.username,
        p.full_name,
        p.avatar_url,
        greatest(
          similarity(p.username, search_query),
          similarity(coalesce(p.full_name, ''), search_query)
        ) as similarity_score
      from public.profiles p
      where
        p.username % search_query
        or p.full_name % search_query
      order by similarity_score desc
      limit 20;
    end;
    $$;
    ```
  - Create unread count RPC (used by notification badge — Task 16):
    **SECURITY**: Uses `auth.uid()` internally, no parameter accepted.
    Since direct SELECT on messages is revoked, this is the only way to get unread count.
    ```sql
    create or replace function public.get_unread_count()
    returns integer
    language plpgsql
    security definer set search_path = ''
    as $$
    declare
      calling_user_id uuid;
      count_val integer;
    begin
      calling_user_id := auth.uid();
      if calling_user_id is null then
        raise exception 'Not authenticated';
      end if;

      select count(*)::integer into count_val
      from public.messages
      where recipient_id = calling_user_id
        and is_read = false;

      return count_val;
    end;
    $$;
    ```
  - Execute via `supabase-mcp-server_apply_migration` name: `create_rls_and_rpcs`
  - After: run `supabase-mcp-server_get_advisors` type=security

  **Must NOT do**:
  - Do NOT expose message content before Eid unlock in any policy or function
  - Do NOT allow unauthenticated access to any table

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (sequential after Task 6)
  - **Parallel Group**: Wave 1 sequential chain (5 → 6 → 7)
  - **Blocks**: Tasks 8, 10, 11, 12
  - **Blocked By**: Tasks 5, 6

  **References**:
  - Tasks 5, 6: All tables must exist before creating policies
  - Supabase MCP: `supabase-mcp-server_apply_migration` and `supabase-mcp-server_get_advisors`

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: RLS policies exist for all tables
    Tool: supabase-mcp-server_execute_sql
    Steps:
      1. Query: SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;
      2. Assert: Policies exist for messages, wishes, profiles, app_settings, events
    Expected Result: All tables have RLS policies
    Evidence: .sisyphus/evidence/task-7-rls-policies.txt

  Scenario: Inbox RPC returns null content before unlock
    Tool: supabase-mcp-server_execute_sql
    Preconditions: QA Data Seeding completed (see "QA Data Seeding" section above)
    Steps:
      1. Query: UPDATE public.app_settings SET value = '2099-01-01T00:00:00Z' WHERE key = 'eid_unlock_time';
      2. Note: This sets unlock to far future for testing
       3. Query (single execute_sql call — derives UUID inline, no manual substitution):
          ```sql
          DO $$
          DECLARE
            test_uid uuid;
          BEGIN
            SELECT id INTO test_uid FROM auth.users WHERE email = 'eid-moon-test@example.com';
            IF test_uid IS NULL THEN RAISE EXCEPTION 'Test user not found'; END IF;
            PERFORM set_config('request.jwt.claim.sub', test_uid::text, true);
          END $$;
          SELECT * FROM public.get_inbox_messages();
          ```
      4. Assert: content column is NULL for all rows (messages exist but content hidden)
      5. Cleanup: UPDATE public.app_settings SET value = '2026-03-30T12:00:00Z' WHERE key = 'eid_unlock_time';
    Expected Result: Content hidden before unlock time
    Evidence: .sisyphus/evidence/task-7-content-locked.txt

  Scenario: Direct SELECT on messages table is blocked
    Tool: supabase-mcp-server_execute_sql
    Steps:
      1. Query: SET ROLE authenticated; SELECT * FROM public.messages LIMIT 1;
      2. Assert: Returns permission denied error (SELECT revoked from authenticated role)
      3. Cleanup: RESET ROLE;
    Expected Result: Authenticated users cannot directly query messages table
    Evidence: .sisyphus/evidence/task-7-direct-select-blocked.txt

  Scenario: Search RPC returns fuzzy results
    Tool: supabase-mcp-server_execute_sql
    Steps:
      1. Query: SELECT * FROM public.search_users('test');
      2. Assert: Query executes without error (may return 0 rows if no users yet)
    Expected Result: Function exists and runs
    Evidence: .sisyphus/evidence/task-7-search-works.txt

  Scenario: Security advisor clean
    Tool: supabase-mcp-server_get_advisors (type=security)
    Steps:
      1. Run security advisor
      2. Assert: No critical warnings for any public table
    Expected Result: All tables secured
    Evidence: .sisyphus/evidence/task-7-security-clean.txt
  ```

  **Commit**: YES (groups with 5, 6)

### Wave 2 — Auth + Core UI (After Wave 1)

- [ ] 8. Google OAuth: Callback Route + Sign-In Page

  **What to do**:
  - **Before writing any code**: Call Context7 for Supabase Auth Google OAuth docs:
    1. `context7_resolve-library-id` query="Supabase JS Google OAuth signInWithOAuth" libraryName="supabase-js"
    2. `context7_query-docs` with resolved ID, query="Google OAuth signInWithOAuth provider redirect callback exchangeCodeForSession"
    3. Save to `.sisyphus/latestContext.md`
  - Create `app/auth/callback/route.ts`:
    - Handles **Google OAuth ONLY**: `?code=...` → `exchangeCodeForSession(code)`
    - Magic link verification is handled by the EXISTING `app/auth/confirm/route.ts` (Supabase's original — DO NOT modify or delete)
    ```typescript
    import { createClient } from '@/lib/supabase/server'
    import { NextResponse } from 'next/server'

    export async function GET(request: Request) {
      const { searchParams, origin } = new URL(request.url)
      const code = searchParams.get('code')
      const next = searchParams.get('next') ?? '/inbox'

      if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          return NextResponse.redirect(`${origin}${next}`)
        }
      }

      // Return to login with error
      return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
    }
    ```
    - **NOTE**: The existing `app/auth/confirm/route.ts` (Supabase original) handles magic link verification separately. The callback route handles Google OAuth ONLY.
  - Create `app/auth/login/page.tsx` — a beautiful Golden Serenity login page:
    - Center-aligned card with Eid Moon branding (crescent moon icon from lucide)
    - "Sign in with Google" button using Supabase client:
      ```typescript
      const supabase = createClient() // client-side
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      })
      ```
    - Warm, inviting copy: "Send heartfelt Eid wishes to your loved ones"
    - Golden border card on cream background
    - No email/password fields — ONLY Google button
  - Create `app/(protected)/layout.tsx` — a route group that checks auth:
    - Use `createClient()` from server + `getClaims()` to verify session
    - Redirect to `/auth/login` if no session
    - Pass user data to children via props or context
  - Delete old `app/auth/login/page.tsx` if it exists (email/password version)
  - Update root `app/page.tsx` to redirect authenticated users to `/inbox`, unauthenticated to `/auth/login`
  - **QA Note**: All Playwright scenarios requiring "logged in" state use manual Google sign-in.
    The agent navigates to `/auth/login`, pauses for user to complete Google OAuth, then continues.

  **Must NOT do**:
  - Do NOT use `getUser()` — use `getClaims()` for auth checks
  - Do NOT add email/password form fields
  - Do NOT modify `lib/supabase/server.ts` or `client.ts`
  - Do NOT hardcode colors — use CSS variables

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Login page needs polished Golden Serenity design

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (can run with 9, 10, 11 once Wave 1 completes)
  - **Blocks**: Task 13 (inbox needs authenticated user)
  - **Blocked By**: Tasks 1-4 (clean slate + theme), Task 7 (DB + trigger for profile creation)

  **References**:
  - `lib/supabase/server.ts` — READ ONLY to see `createClient` and `getClaims` signatures
  - `lib/supabase/client.ts` — READ ONLY for client-side `createClient`
  - `lib/supabase/proxy.ts` — READ ONLY to understand session refresh
  - `app/globals.css` — Golden Serenity CSS variables (set by Task 4)
  - Context7: Query Supabase Auth docs for `signInWithOAuth` and `exchangeCodeForSession`
  - Context7: Query Next.js docs for "route handlers app router GET request"
  - **NOTE**: Google OAuth must be enabled in Supabase Dashboard → Authentication → Providers → Google. This is a MANUAL step documented here but not automated.

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: Auth callback route handles Google OAuth only
    Tool: Bash
    Steps:
      1. Read file app/auth/callback/route.ts
      2. Assert: Contains "exchangeCodeForSession" for Google OAuth code handling
      3. Assert: Does NOT contain "verifyOtp" (magic links handled by existing app/auth/confirm/route.ts)
      4. Read file app/auth/confirm/route.ts
      5. Assert: Contains "verifyOtp" — confirms Supabase's original magic link handler is intact
      6. Run: npm run build (timeout: 600000)
      7. Assert: Exit code 0
    Expected Result: Callback route handles OAuth only; confirm route handles magic links (Supabase original)
    Evidence: .sisyphus/evidence/task-8-callback-route.txt

  Scenario: Login page renders Google button only
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running (npm run dev)
    Steps:
      1. Navigate to http://localhost:3000/auth/login
      2. Assert: Page contains text "Sign in with Google" or button with Google
      3. Assert: NO input[type="email"] exists
      4. Assert: NO input[type="password"] exists
      5. Screenshot the page
    Expected Result: Only Google sign-in button visible, no email/password fields
    Evidence: .sisyphus/evidence/task-8-login-page.png

  Scenario: Unauthenticated redirect works
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000/inbox (without being logged in)
      2. Assert: Redirected to /auth/login
    Expected Result: Protected routes redirect to login
    Evidence: .sisyphus/evidence/task-8-redirect.png
  ```

  **Commit**: YES
  - Message: `feat(auth): implement Google OAuth flow`
  - Pre-commit: `npm run build`

- [ ] 9. Layout + Bottom Nav + App Shell

  **What to do**:
  - Create `app/(protected)/layout.tsx` (if not already from Task 8) with:
    - Top header: "Eid Moon" in serif font + crescent moon icon
    - Bottom navigation bar (mobile-first, fixed bottom):
      - Home/Inbox icon → `/inbox`
      - Search icon → `/search`
      - Profile icon → `/profile`
    - Use shadcn `Button` variants for nav items
    - Active tab indicator with gold underline
    - Cream background (`var(--background)`)
  - Create `components/bottom-nav.tsx`:
    - Client component (needs `usePathname()`)
    - 3 tab items with lucide icons: `Mail`, `Search`, `User`
    - Highlight active tab with gold color
    - Fixed to bottom on mobile, sidebar on desktop (≥768px)
  - Desktop layout: Convert bottom nav to left sidebar on ≥768px
  - All colors via CSS variables, no hardcoded values
  - **Create placeholder pages** so layout QA can run (Task 13 replaces inbox later):
    - `app/(protected)/inbox/page.tsx`: Simple "Your inbox — loading..." placeholder
    - `app/(protected)/search/page.tsx`: Simple "Search — coming soon" placeholder
    - `app/(protected)/profile/page.tsx`: Simple "Profile — coming soon" placeholder
    - These are minimal server components that just render a heading. Task 11/12/13 will replace them with real implementations.

  **Must NOT do**:
  - Do NOT create a top navbar that scrolls away on mobile
  - Do NOT hardcode colors
  - Do NOT use dark mode classes

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Layout and navigation require polished responsive design

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 8, 10, 11 in Wave 2, once Task 4 done)
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 10, 11, 12, 13
  - **Blocked By**: Task 4 (theme must be set up)

  **References**:
  - `app/globals.css` — CSS variables for colors (from Task 4)
  - `components/ui/button.tsx` — shadcn button component to extend
  - `tailwind.config.ts` — responsive breakpoints
  - Context7: Query Next.js docs for "usePathname app router client component"

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: Bottom nav renders on mobile
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Set viewport to 375x812 (iPhone size)
      2. Navigate to http://localhost:3000/auth/login
      3. Complete Google sign-in (user interaction required, timeout: 60s)
      4. Wait for redirect to complete (should land on / or /inbox)
      5. Navigate to http://localhost:3000/inbox
      4. Assert: Bottom nav visible with 3 icons (Mail, Search, User)
      5. Assert: Bottom nav is fixed at bottom (position: fixed, bottom: 0)
      6. Screenshot
    Expected Result: 3-tab bottom nav fixed to bottom
    Evidence: .sisyphus/evidence/task-9-bottom-nav-mobile.png

  Scenario: Sidebar renders on desktop
    Tool: Playwright
    Steps:
      1. Set viewport to 1280x800
      2. Navigate to http://localhost:3000/inbox (if not logged in, complete Google sign-in at /auth/login first — see QA Auth Bootstrap)
      3. Wait for URL to contain "/inbox" (timeout: 15s)
      4. Assert: Navigation is on the left side, not bottom
      5. Screenshot
    Expected Result: Sidebar navigation on desktop
    Evidence: .sisyphus/evidence/task-9-sidebar-desktop.png

  Scenario: Active tab highlights correctly
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000/inbox (if not logged in, complete Google sign-in at /auth/login first — see QA Auth Bootstrap)
      2. Wait for URL to contain "/inbox" (timeout: 15s)
      3. Assert: Mail/Inbox tab has gold accent color
      4. Navigate to /search
      5. Assert: Search tab now has gold accent
    Expected Result: Active tab visually distinguished
    Evidence: .sisyphus/evidence/task-9-active-tab.png
  ```

  **Commit**: YES (groups with 10, 11, 12)
  - Message: `feat(ui): add layout, profile, search, and compose pages`
  - Pre-commit: `npm run build`

- [ ] 10. Profile Page `/u/[username]`

  **What to do**:
  - Create `app/u/[username]/page.tsx` (PUBLIC route — NOT under `(protected)`, so OG crawlers and unauthenticated visitors can access):
    - Server component that fetches profile via the `get_public_profile` RPC (from Task 5):
      ```typescript
      const supabase = await createClient()
      const { data: profile } = await supabase.rpc('get_public_profile', { lookup_username: username })
      ```
    - This RPC returns ONLY safe fields (id, username, full_name, avatar_url, message_count) — no email leak
    - Display: avatar (Google photo, rounded), full_name, username, message_count
    - "Send a message" button:
      - If authenticated → navigates to `/send/{username}` compose page
      - If NOT authenticated → navigates to `/auth/login` with `?redirect=/u/{username}` param
    - Share link section: copy button that copies `{origin}/u/{username}` to clipboard
    - If viewing own profile (check via `getClaims()` on server): show "Edit Username" option
    - If user not found: show 404-style page with "User not found"
  - Create `components/profile-card.tsx`:
    - Reusable card with avatar, name, username, message count
    - Gold border (`var(--border)`), cream background
    - Responsive: full-width on mobile, constrained on desktop
  - Username edit: inline edit with validation (3-30 chars, alphanumeric + underscore)
    - Client component for edit mode
    - Calls `supabase.from('profiles').update({ username }).eq('id', userId)`
    - Shows error if username taken (unique constraint)

  **Must NOT do**:
  - Do NOT allow custom avatar upload — Google avatar only
  - Do NOT show message content on profile page
  - Do NOT hardcode any colors

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Profile page needs polished card design with Golden Serenity aesthetic

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 8, 11, 12 in Wave 2)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 17 (share/OG meta)
  - **Blocked By**: Task 7 (profiles table + RLS), Task 9 (layout shell)

  **References**:
  - `lib/supabase/server.ts` — READ ONLY for server-side createClient
  - `lib/supabase/client.ts` — READ ONLY for client-side createClient (username edit)
  - `components/ui/` — shadcn card, button, input components
  - `app/globals.css` — CSS variables for Golden Serenity palette

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: Profile page renders for existing user
    Tool: Playwright
    Preconditions: At least one user exists in profiles table, dev server running
    Steps:
      1. Navigate to /u/{known-username}
      2. Assert: Page shows avatar image element
      3. Assert: Page shows username text
      4. Assert: Page shows "Send a message" button or link
      5. Screenshot
    Expected Result: Profile card with user info displayed
    Evidence: .sisyphus/evidence/task-10-profile-page.png

  Scenario: Non-existent user shows 404
    Tool: Playwright
    Steps:
      1. Navigate to /u/thisuserdoesnotexist99999
      2. Assert: Page shows "User not found" or similar message
    Expected Result: Graceful 404 handling
    Evidence: .sisyphus/evidence/task-10-profile-404.png

  Scenario: Share link copy works
    Tool: Playwright
    Steps:
      1. Navigate to own profile /u/{own-username}
      2. Click share/copy button
      3. Assert: Button text changes to "Copied!" or shows confirmation
    Expected Result: Copy interaction provides feedback
    Evidence: .sisyphus/evidence/task-10-share-copy.png
  ```

  **Commit**: YES (groups with 9, 11, 12)

- [ ] 11. User Search with pg_trgm

  **What to do**:
  - Create `app/(protected)/search/page.tsx`:
    - Search input at top with debounced query (300ms)
    - Calls the `search_users` RPC function from Task 7:
      ```typescript
      const { data } = await supabase.rpc('search_users', { search_query: query })
      ```
    - Results list showing profile cards (avatar, username, full_name)
    - Each result is clickable → navigates to `/u/{username}`
    - Empty state: "Search for users to send Eid wishes"
    - No results state: "No users found for '{query}'"
    - Min 2 characters before search triggers
  - Use client component for search input + debounce
  - Server-side search via Supabase RPC (not client-side filtering)

  **Must NOT do**:
  - Do NOT implement follow/friend/block features
  - Do NOT expose email in search results UI (even though DB may match on it)
  - Do NOT use client-side filtering — always use pg_trgm RPC

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Search UI needs clean, responsive design

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 8, 10, 12 in Wave 2)
  - **Parallel Group**: Wave 2
  - **Blocks**: None directly
  - **Blocked By**: Task 7 (search_users RPC), Task 9 (layout shell)

  **References**:
  - Task 7: `search_users` RPC function signature
  - `lib/supabase/client.ts` — READ ONLY for client createClient
  - `components/ui/input.tsx` — shadcn input for search field
  - `components/profile-card.tsx` — reuse from Task 10 for result items

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: Search returns results for partial username
    Tool: Playwright
    Preconditions: At least one user exists (run seed first), dev server running
    Steps:
      1. Navigate to http://localhost:3000/search (if not logged in, complete Google sign-in at /auth/login first — see QA Auth Bootstrap)
      2. Wait for URL to contain "/search" (timeout: 15s)
      3. Type first 3 chars of {known-username} into search input
      4. Wait 500ms for debounce
      5. Assert: At least one result card appears
      6. Assert: Result shows username and avatar
      7. Screenshot
    Expected Result: Fuzzy search returns matching profiles
    Evidence: .sisyphus/evidence/task-11-search-results.png

  Scenario: Empty search shows placeholder
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000/search (if not logged in, complete Google sign-in at /auth/login first — see QA Auth Bootstrap)
      2. Wait for URL to contain "/search" (timeout: 15s)
      3. Assert: Page shows "Search for users" placeholder text
      4. Assert: No result cards displayed
    Expected Result: Clean empty state
    Evidence: .sisyphus/evidence/task-11-empty-state.png

  Scenario: No results shows message
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000/search (if not logged in, complete Google sign-in at /auth/login first — see QA Auth Bootstrap)
      2. Wait for URL to contain "/search" (timeout: 15s)
      3. Type "zzzznonexistent999" into search input
      4. Wait 500ms
      5. Assert: Page shows "No users found" message
    Expected Result: Graceful no-results state
    Evidence: .sisyphus/evidence/task-11-no-results.png
  ```

  **Commit**: YES (groups with 9, 10, 12)

- [ ] 12. Message Compose Form

  **What to do**:
  - Create `app/(protected)/send/[username]/page.tsx`:
    - Server component that loads recipient profile by username
    - If recipient not found → show error
    - If recipient is self → show "You can't send a message to yourself"
    - Render compose form (client component)
  - Create `components/compose-form.tsx`:
    - Client component with:
      - Recipient display (avatar + username, non-editable)
      - Textarea for message content (280 char limit)
      - Character counter showing remaining chars (e.g., "142/280")
      - Counter turns red at ≤20 chars remaining
      - Anonymous toggle switch with label "Send anonymously"
      - "Send Eid Wish" button (gold primary color)
    - On submit:
      ```typescript
      const supabase = createClient()
      // Use getSession() for client-side auth (NOT getUser — see guardrails)
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id
      // Get active event
      const { data: event } = await supabase
        .from('events')
        .select('id')
        .eq('is_active', true)
        .single()

      // IMPORTANT: Do NOT chain .select() — SELECT is revoked on messages.
      // supabase-js sends Prefer: return=minimal by default when .select() is omitted.
      const { error } = await supabase.from('messages').insert({
        sender_id: userId,
        recipient_id: recipientId,
        content: messageText,
        is_anonymous: isAnonymous,
        event_id: event?.id
      })
      ```
    - Success state: "Your Eid wish has been sent! 🌙" with link back to recipient's profile
    - Error state: Display error message from Supabase (e.g., constraint violation)
  - Validation:
    - Min 1 char, max 280 chars (also enforced by DB constraint)
    - Self-send blocked in UI + DB constraint
    - Must be authenticated

  **Must NOT do**:
  - Do NOT allow image/media attachments
  - Do NOT allow message editing after send
  - Do NOT show the message in recipient's inbox immediately (it's locked)
  - Do NOT hardcode colors

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Compose form needs polished design with character counter UX

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 8, 10, 11 in Wave 2)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 13 (inbox shows sent messages)
  - **Blocked By**: Task 7 (messages table + RLS), Task 9 (layout shell)

  **References**:
  - Task 6: messages table schema (content check constraint, sender_id NOT NULL, no_self_send)
  - `lib/supabase/client.ts` — READ ONLY for client createClient
  - `components/ui/textarea.tsx` — shadcn textarea
  - `components/ui/switch.tsx` — shadcn switch for anonymous toggle
  - `components/ui/button.tsx` — shadcn button for submit

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: Compose form renders with character counter
    Tool: Playwright
    Preconditions: Dev server running, target user exists (run seed first)
    Steps:
      1. Navigate to http://localhost:3000/send/{target-username} (if not logged in, complete Google sign-in at /auth/login first — see QA Auth Bootstrap)
      2. Wait for URL to contain "/send/" (timeout: 15s)
      3. Assert: Textarea is visible
      4. Assert: Character counter shows "0/280"
      5. Type "Eid Mubarak!" into textarea
      6. Assert: Counter updates to "12/280"
      7. Assert: Anonymous toggle switch exists
      8. Screenshot
    Expected Result: Form with working character counter
    Evidence: .sisyphus/evidence/task-12-compose-form.png

  Scenario: Self-send is blocked
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000/send/{own-username} (if not logged in, complete Google sign-in at /auth/login first — see QA Auth Bootstrap)
      2. Wait for URL to contain "/send/" (timeout: 15s)
      3. Assert: Page shows error message about self-sending
      4. Assert: No compose form is displayed
    Expected Result: Cannot send message to yourself
    Evidence: .sisyphus/evidence/task-12-self-send-blocked.png

  Scenario: Message over 280 chars is rejected
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000/send/{target-username} (if not logged in, complete Google sign-in at /auth/login first — see QA Auth Bootstrap)
      2. Wait for URL to contain "/send/" (timeout: 15s)
      3. Type 281 characters into textarea
      4. Assert: Character counter shows red/over-limit indicator
      5. Assert: Send button is disabled OR shows error on submit
    Expected Result: 280 char limit enforced in UI
    Evidence: .sisyphus/evidence/task-12-char-limit.png
  ```

  **Commit**: YES (groups with 9, 10, 11)

### Wave 3 — Features + Animation (After Wave 2)

- [ ] 13. Inbox Page (Locked State + Countdown)

  **What to do**:
  - Create `app/(protected)/inbox/page.tsx`:
    - Server component that fetches messages via `get_inbox_messages` RPC (from Task 7)
    - Pass data to client component for interactive UI
  - Create `components/inbox.tsx` (client component):
    - **Before Eid unlock**:
      - Show countdown timer to Eid unlock time (days, hours, minutes, seconds)
      - Fetch unlock time from `app_settings` or pass from server component
      - Display locked envelope cards in a grid:
        - Each card shows: sender name (if not anonymous) or "Anonymous ✨", timestamp
        - Content is hidden — show a sealed envelope icon/illustration
        - Gold border, cream card, warm brown text
        - Message: "You have {N} Eid wishes waiting! 🌙"
      - Bento grid layout on desktop (≥768px), stacked cards on mobile
    - **After Eid unlock**:
      - Same grid of envelopes but now each is "tappable"
      - Show a subtle shimmer/glow on unopened envelopes
      - Tapping an envelope triggers the reveal animation (Task 14)
      - Mark message as read after opening (do NOT chain `.select()` — SELECT is revoked):
        `const { error } = await supabase.from('messages').update({ is_read: true }).eq('id', msgId)`
    - **Empty state**: "No Eid wishes yet. Share your profile link so friends can send you wishes!"
  - Countdown timer component (`components/countdown-timer.tsx`):
    - Uses `useState` + `useEffect` with `setInterval(1000)`
    - Displays: DD days HH hours MM min SS sec
    - Beautiful typography in serif font
    - When countdown reaches 0: trigger unlock state change

  **Must NOT do**:
  - Do NOT reveal message content before unlock time (enforce via RPC return)
  - Do NOT use real-time subscriptions — polling only (Task 19)
  - Do NOT hardcode the unlock time — read from app_settings

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Inbox needs polished card grid, countdown timer, and state transitions

  **Parallelization**:
  - **Can Run In Parallel**: NO (needs auth + compose working)
  - **Parallel Group**: Wave 3 start
  - **Blocks**: Tasks 14, 16, 18
  - **Blocked By**: Task 8 (auth), Task 12 (compose form to have messages)

  **References**:
  - Task 7: `get_inbox_messages` RPC — returns id, sender info, is_anonymous, content (null before unlock), is_unlocked boolean
  - `lib/supabase/client.ts` — READ ONLY for client createClient
  - `lib/supabase/server.ts` — READ ONLY for server createClient
  - `components/ui/card.tsx` — shadcn card for envelope cards
  - `app/globals.css` — CSS variables for Golden Serenity palette
  - Context7: Query `/vercel/next.js` for "server component data fetching to client component"

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: DB prep — set unlock time to future for locked inbox testing
    Tool: supabase-mcp-server_execute_sql
    Steps:
      1. Query: UPDATE public.app_settings SET value = '2099-01-01T00:00:00Z' WHERE key = 'eid_unlock_time';
      2. Assert: UPDATE 1 (row updated)
    Expected Result: Unlock time set to far future
    Evidence: .sisyphus/evidence/task-13-db-prep-future.txt

  Scenario: Inbox shows locked envelopes before Eid
    Tool: Playwright
    Preconditions: Dev server running, DB prep scenario above completed (unlock time is future), at least 1 message sent to user
    Steps:
      1. Navigate to http://localhost:3000/inbox (if not logged in, complete Google sign-in at /auth/login first — see QA Auth Bootstrap)
      2. Wait for URL to contain "/inbox" (timeout: 15s)
      3. Assert: Countdown timer is visible with days/hours/minutes
      4. Assert: At least one envelope card is visible
      5. Assert: No message content text is visible (content should be hidden)
      6. Assert: Sender name or "Anonymous" label visible
      7. Screenshot
    Expected Result: Locked envelopes with countdown, no content visible
    Evidence: .sisyphus/evidence/task-13-locked-inbox.png

  Scenario: Empty inbox shows placeholder
    Tool: Playwright
    Preconditions: A user with zero messages. Either:
      (a) Use SQL via supabase-mcp-server_execute_sql to temporarily DELETE all messages for the test user
          (save IDs first to restore after), OR
      (b) Log in with a second Google account that has never received messages.
    Steps:
      1. Navigate to http://localhost:3000/inbox (if not logged in, complete Google sign-in at /auth/login first — see QA Auth Bootstrap)
      2. Wait for URL to contain "/inbox" (timeout: 15s)
      3. Assert: Page shows "No Eid wishes yet" or similar empty state
      4. Assert: Share profile link prompt visible
    Expected Result: Helpful empty state
    Evidence: .sisyphus/evidence/task-13-empty-inbox.png

  Scenario: Countdown timer ticks
    Tool: Playwright
    Preconditions: Unlock time set to future (from DB prep scenario)
    Steps:
      1. Navigate to http://localhost:3000/inbox (if not logged in, complete Google sign-in at /auth/login first — see QA Auth Bootstrap)
      2. Wait for URL to contain "/inbox" (timeout: 15s)
      3. Read countdown seconds value
      4. Wait 2 seconds
      5. Read countdown seconds value again
      6. Assert: Second reading is less than first (timer is ticking)
    Expected Result: Live countdown
    Evidence: .sisyphus/evidence/task-13-countdown-ticks.txt
  ```

  **Commit**: YES (groups with 14, 15)
  - Message: `feat(inbox): locked inbox, envelope animations, wish-back`
  - Pre-commit: `npm run build`

- [ ] 14. Envelope Reveal Animation (Framer Motion)

  **What to do**:
  - **Before writing any code**: Call Context7 for Framer Motion docs:
    1. `context7_resolve-library-id` query="Framer Motion React animation spring tap gesture" libraryName="framer-motion"
    2. `context7_query-docs` with resolved ID, query="LazyMotion domAnimation AnimatePresence motion.div spring animation tap gesture useReducedMotion"
    3. Save to `.sisyphus/latestContext.md`
  - Create `components/envelope-card.tsx`:
    - Uses Framer Motion `motion.div` for animations
    - **Sealed state**: Envelope icon with gold border, subtle idle animation (slight float/pulse)
    - **Tap interaction**: On tap/click, trigger reveal sequence:
      1. Envelope flap opens (rotateX on top portion, 0 → 180deg, spring physics)
      2. Letter slides up out of envelope (translateY with spring, staggered 200ms after flap)
      3. Message content fades in on the letter
      4. Sender info appears below
    - Spring config: `{ type: "spring", stiffness: 200, damping: 20 }`
    - Use `AnimatePresence` for smooth mount/unmount
    - After reveal: show wish-back button (Task 15)
  - Create `components/motion-provider.tsx`:
    - Wraps app with `LazyMotion` using `domAnimation` features for bundle size
    - ```typescript
      import { LazyMotion, domAnimation } from 'framer-motion'
      export function MotionProvider({ children }) {
        return <LazyMotion features={domAnimation}>{children}</LazyMotion>
      }
      ```
    - Add to `app/(protected)/layout.tsx`
  - Implement `useReducedMotion` hook:
    - If user prefers reduced motion, skip animation and show content immediately
  - Staggered grid reveal: when inbox unlocks, envelopes appear with 0.1s stagger between items
    - Use `motion.div` with `variants` and `staggerChildren: 0.1`

  **Must NOT do**:
  - Do NOT import full framer-motion bundle — use `LazyMotion` + `domAnimation`
  - Do NOT auto-reveal all messages at once — individual tap required
  - Do NOT skip `useReducedMotion` accessibility check
  - Do NOT hardcode colors in animation components

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Complex animation choreography needs design sensibility

  **Parallelization**:
  - **Can Run In Parallel**: NO (sequential after Task 13)
  - **Parallel Group**: Wave 3 (after 13)
  - **Blocks**: Tasks 15, 18, 19
  - **Blocked By**: Task 13 (inbox page must exist)

  **References**:
  - Task 13: Inbox page with envelope cards
  - Context7: Framer Motion docs for `LazyMotion`, `domAnimation`, `AnimatePresence`, `motion.div`, spring physics
  - `package.json` — verify framer-motion is installed (Task 2)
  - `app/globals.css` — CSS variables for colors
  - Context7: Query `/framer/motion` for "LazyMotion domAnimation AnimatePresence spring animation"

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: DB prep — set unlock time to past for reveal testing
    Tool: supabase-mcp-server_execute_sql
    Steps:
      1. Query: UPDATE public.app_settings SET value = '2020-01-01T00:00:00Z' WHERE key = 'eid_unlock_time';
      2. Assert: UPDATE 1 (row updated)
    Expected Result: Unlock time set to past (messages are unlocked)
    Evidence: .sisyphus/evidence/task-14-db-prep-past.txt

  Scenario: Envelope tap triggers reveal animation
    Tool: Playwright
    Preconditions: Dev server running, DB prep scenario above completed (unlock time is past), at least 1 message sent to user
    Steps:
      1. Navigate to http://localhost:3000/inbox (if not logged in, complete Google sign-in at /auth/login first — see QA Auth Bootstrap)
      2. Wait for URL to contain "/inbox" (timeout: 15s)
      3. Assert: Envelope cards are visible and tappable
      4. Click first envelope card
      5. Wait 1 second (animation duration)
      6. Assert: Message content text is now visible
      7. Screenshot after animation
    Expected Result: Tap reveals message content with animation
    Evidence: .sisyphus/evidence/task-14-reveal-animation.png

  Scenario: LazyMotion provider is wrapping the app
    Tool: Bash
    Steps:
      1. Use Grep tool to search for "LazyMotion" and "domAnimation" in components/ and app/ (*.tsx files)
      2. Assert: LazyMotion import and usage found
      3. Use Grep tool to search for "useReducedMotion" in components/ (*.tsx files)
      4. Assert: Reduced motion hook is used
    Expected Result: Proper motion setup with accessibility
    Evidence: .sisyphus/evidence/task-14-motion-setup.txt

  Scenario: Multiple envelopes stagger on load
    Tool: Playwright
    Preconditions: DB prep scenario completed (unlock time is past), multiple messages exist
    Steps:
      1. Navigate to http://localhost:3000/inbox (if not logged in, complete Google sign-in at /auth/login first — see QA Auth Bootstrap)
      2. Wait for URL to contain "/inbox" (timeout: 15s)
      3. Assert: Multiple envelope cards visible
      4. Screenshot immediately on load to capture stagger
    Expected Result: Envelopes appear with staggered timing
    Evidence: .sisyphus/evidence/task-14-stagger.png
  ```

  **Commit**: YES (groups with 13, 15)

- [ ] 15. Wish-Back Feature

  **What to do**:
  - Add wish-back UI to the revealed message card (after envelope animation completes):
    - "Send a wish back" button appears below revealed message content
    - On click, show a modal or expandable section with:
      - **Preset wishes** (radio buttons or pill buttons):
        - "Eid Mubarak! 🌙"
        - "May Allah bless you! ✨"
        - "Thank you for the kind words! 💛"
        - "Wishing you joy and peace! 🕊️"
        - "JazakAllah Khair! 🤲"
      - **Custom text** option: textarea (280 char limit) with character counter
      - "Send Wish" button
    - On submit:
      ```typescript
      // IMPORTANT: Do NOT chain .select() — SELECT may be revoked on wishes too.
      const { error } = await supabase.from('wishes').insert({
        message_id: messageId,
        sender_id: currentUserId, // the recipient wishing back
        content: wishText,
        is_preset: isPresetSelected
      })
      ```
    - After sending: button changes to "Wish sent ✓" (disabled)
    - If wish already exists for this message: show "Wish sent ✓" immediately
  - Create `components/wish-back-form.tsx`:
    - Client component
    - Preset pills in a flex wrap layout
    - Custom textarea appears when "Write custom wish" is selected
    - Optimistic UI: show sent state immediately, rollback on error

  **Must NOT do**:
  - Do NOT allow multiple wishes per message (unique constraint on message_id)
  - Do NOT allow wish-back before Eid unlock
  - Do NOT create a reply thread — one wish-back and done
  - Do NOT hardcode preset texts in database — keep in component

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Wish-back UI needs polished modal/expandable design

  **Parallelization**:
  - **Can Run In Parallel**: NO (sequential after Task 14)
  - **Parallel Group**: Wave 3 (after 14)
  - **Blocks**: Task 18
  - **Blocked By**: Task 14 (envelope reveal must work first)

  **References**:
  - Task 7: wishes table RLS policies, insert policy checks recipient owns the message
  - Task 6: wishes table schema (message_id UNIQUE constraint)
  - `components/envelope-card.tsx` — from Task 14, add wish-back button after reveal
  - `components/ui/button.tsx`, `components/ui/textarea.tsx` — shadcn components

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: Wish-back form appears after revealing message
    Tool: Playwright
    Preconditions: Dev server, message exists, unlock time past (set via seed)
    Steps:
      1. Navigate to http://localhost:3000/inbox (if not logged in, complete Google sign-in at /auth/login first — see QA Auth Bootstrap)
      2. Wait for URL to contain "/inbox" (timeout: 15s)
      3. Click on an envelope to reveal it
      4. Wait for reveal animation
      5. Assert: "Send a wish back" button is visible
      6. Click the wish-back button
      7. Assert: Preset wish options are visible (at least 3 options)
      8. Assert: Custom text option/textarea is available
      9. Screenshot
    Expected Result: Wish-back form with presets and custom option
    Evidence: .sisyphus/evidence/task-15-wish-form.png

  Scenario: Sending a preset wish works
    Tool: Playwright
    Preconditions: Logged in from previous scenario (session persists), or re-navigate
    Steps:
      1. Navigate to http://localhost:3000/inbox (if not logged in, complete Google sign-in at /auth/login first — see QA Auth Bootstrap)
      2. Wait for URL to contain "/inbox" (timeout: 15s)
      3. Click on an envelope to reveal it, then click wish-back button
      4. Click first preset option ("Eid Mubarak! 🌙")
      5. Click "Send Wish" button
      6. Assert: Button changes to "Wish sent ✓" or disabled state
      7. Refresh page
      8. Assert: Same message shows "Wish sent ✓" (persisted)
    Expected Result: Preset wish saved and displayed
    Evidence: .sisyphus/evidence/task-15-preset-wish-sent.png

  Scenario: Cannot send second wish to same message
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000/inbox (if not logged in, complete Google sign-in at /auth/login first — see QA Auth Bootstrap)
      2. Wait for URL to contain "/inbox" (timeout: 15s)
      3. Navigate to a message that already has a wish-back
      4. Assert: "Wish sent ✓" is shown instead of wish-back form
      5. Assert: No way to submit another wish
    Expected Result: One wish per message enforced in UI
    Evidence: .sisyphus/evidence/task-15-no-double-wish.png
  ```

  **Commit**: YES (groups with 13, 14)

- [ ] 16. In-App Notification Badge

  **What to do**:
  - Add unread message count badge to the inbox icon in bottom nav / sidebar:
    - Query unread count via RPC (direct SELECT on messages is revoked):
      ```typescript
      // Use the get_unread_count RPC (added in Task 7)
      const { data } = await supabase.rpc('get_unread_count')
      ```
    - Display red/gold badge with count on the Mail icon
    - Badge disappears when count is 0
  - Create `components/notification-badge.tsx`:
    - Small circular badge (absolute positioned on nav icon)
    - Shows count number (max "9+" for ≥10)
    - Gold background with white text
    - Subtle pulse animation on new messages (CSS animation, not framer-motion)
  - Update `components/bottom-nav.tsx` to include the badge on the inbox tab
  - Fetch count on layout mount and refresh on navigation

  **Must NOT do**:
  - Do NOT implement push notifications
  - Do NOT implement email notifications
  - Do NOT use WebSocket/real-time for badge updates — refresh on navigation is fine
  - Do NOT show notification for messages you SENT, only received

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 14, 15, 17 in Wave 3)
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 18
  - **Blocked By**: Task 13 (inbox page + bottom nav must exist)

  **References**:
  - `components/bottom-nav.tsx` — from Task 9, add badge overlay
  - `lib/supabase/server.ts` — READ ONLY for server-side count query
  - `app/globals.css` — CSS variables for badge colors

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: Badge shows unread count
    Tool: Playwright
    Preconditions: User has unread messages
    Steps:
      1. Navigate to /search (not inbox, so messages stay unread)
      2. Assert: Badge element visible on inbox nav icon
      3. Assert: Badge shows a number > 0
      4. Screenshot
    Expected Result: Badge displays unread message count
    Evidence: .sisyphus/evidence/task-16-badge-visible.png

  Scenario: Badge disappears when all read
    Tool: Playwright
    Steps:
      1. Navigate to /inbox
      2. Open all envelopes (marking them read)
      3. Navigate to /search
      4. Assert: Badge is hidden or shows 0
    Expected Result: Badge reflects read state
    Evidence: .sisyphus/evidence/task-16-badge-cleared.png
  ```

  **Commit**: YES (groups with 17)
  - Message: `feat: notification badge and profile sharing`
  - Pre-commit: `npm run build`

- [ ] 17. Profile Share + OG Meta Tags

  **What to do**:
  - Add OpenGraph meta tags to profile pages for social sharing:
    - In `app/u/[username]/page.tsx` (public route), export `generateMetadata`:
      ```typescript
      export async function generateMetadata({ params }) {
        const profile = await fetchProfile(params.username)
        return {
          title: `${profile.full_name} | Eid Moon`,
          description: `Send Eid wishes to ${profile.full_name} on Eid Moon!`,
          openGraph: {
            title: `${profile.full_name} | Eid Moon`,
            description: `Send Eid wishes to ${profile.full_name}!`,
            type: 'profile',
          }
        }
      }
      ```
  - Enhance share link section on profile page:
    - Show the full URL: `eidmoon.vercel.app/u/{username}` (or dynamic origin)
    - Copy button with clipboard API
    - Optional: "Share on WhatsApp" button (generates wa.me link with pre-filled text)
  - Add OG meta to the main app layout too:
    - App name: "Eid Moon 🌙"
    - Description: "Send heartfelt Eid wishes to your loved ones"

  **Must NOT do**:
  - Do NOT generate OG images dynamically (too complex for v1)
  - Do NOT add social login share (just link sharing)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 14, 15, 16 in Wave 3)
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 18
  - **Blocked By**: Task 10 (profile page must exist)

  **References**:
  - `app/u/[username]/page.tsx` — from Task 10 (public route, NOT under protected)
  - `app/layout.tsx` — root layout for app-wide OG tags
  - Context7: Query `/vercel/next.js` for "generateMetadata openGraph app router"

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: OG meta tags present on profile page
    Tool: Bash
    Steps:
      1. Run: curl -s http://localhost:3000/u/{known-username} | grep -i "og:title\|og:description"
      2. Assert: og:title and og:description meta tags present in HTML
    Expected Result: OpenGraph tags rendered in page head
    Evidence: .sisyphus/evidence/task-17-og-tags.txt

  Scenario: WhatsApp share link works
    Tool: Playwright
    Steps:
      1. Navigate to /u/{own-username}
      2. Assert: Share section visible with URL and copy button
      3. If WhatsApp button exists: assert href contains "wa.me" or "api.whatsapp.com"
    Expected Result: Share functionality available
    Evidence: .sisyphus/evidence/task-17-share-link.png
  ```

  **Commit**: YES (groups with 16)

### Wave 4 — Polish (After Wave 3)

- [ ] 18. Mobile Responsiveness Pass

  **What to do**:
  - Audit ALL pages for mobile-first responsive design (375px → 768px → 1280px):
    - `/auth/login` — centered card, full-width on mobile
    - `/inbox` — stacked cards on mobile, bento grid on desktop
    - `/search` — full-width search input, stacked results
    - `/send/[username]` — full-width form
    - `/u/[username]` — centered profile card
    - Bottom nav — fixed bottom on mobile, left sidebar on desktop
  - Fix any overflow issues, text truncation, touch targets (min 44x44px)
  - Ensure envelope cards are tap-friendly on mobile (large enough touch target)
  - Test with viewport sizes: 375x812 (iPhone), 390x844 (iPhone 14), 768x1024 (iPad), 1280x800 (desktop)
  - Add proper `<meta name="viewport" content="width=device-width, initial-scale=1">` if not present
  - Ensure safe area insets for notched phones: `env(safe-area-inset-bottom)` on bottom nav

  **Must NOT do**:
  - Do NOT redesign existing components — only fix responsiveness issues
  - Do NOT add new features in this task
  - Do NOT change the Golden Serenity color palette

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`, `playwright`]
    - `frontend-ui-ux`: Responsive design expertise
    - `playwright`: Browser testing at multiple viewport sizes

  **Parallelization**:
  - **Can Run In Parallel**: NO (needs all UI tasks complete)
  - **Parallel Group**: Wave 4
  - **Blocks**: Task 20
  - **Blocked By**: Tasks 13-17 (all UI must be built)

  **References**:
  - All page files created in Tasks 8-17
  - `app/globals.css` — CSS variables and global styles
  - `tailwind.config.ts` — breakpoint configuration
  - `components/bottom-nav.tsx` — nav component from Task 9

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: Mobile layout — no horizontal overflow
    Tool: Playwright
    Steps:
      1. Set viewport to 375x812
      2. Navigate to /inbox
      3. Evaluate JS: document.documentElement.scrollWidth <= document.documentElement.clientWidth
      4. Assert: true (no horizontal scroll)
      5. Navigate to /search, /u/{username}, /send/{username}
      6. Repeat scroll width check for each
      7. Screenshot each page
    Expected Result: No horizontal overflow on any page at 375px
    Evidence: .sisyphus/evidence/task-18-mobile-375.png

  Scenario: Desktop layout — bento grid on inbox
    Tool: Playwright
    Steps:
      1. Set viewport to 1280x800
      2. Navigate to /inbox (with messages)
      3. Assert: Envelope cards arranged in multi-column grid (not single column)
      4. Assert: Sidebar nav visible (not bottom nav)
      5. Screenshot
    Expected Result: Multi-column layout on desktop
    Evidence: .sisyphus/evidence/task-18-desktop-1280.png

  Scenario: Touch targets are large enough
    Tool: Playwright
    Steps:
      1. Set viewport to 375x812
      2. Navigate to /inbox
      3. Evaluate JS: check all button/link elements have min height/width >= 44px
      4. Assert: All interactive elements meet 44px minimum
    Expected Result: Accessible touch targets on mobile
    Evidence: .sisyphus/evidence/task-18-touch-targets.txt
  ```

  **Commit**: YES (groups with 19, 20)
  - Message: `chore: responsiveness, auto-unlock, build verification`
  - Pre-commit: `npm run build`

- [ ] 19. Auto-Unlock Polling + Live Reveal

  **What to do**:
  - Create `hooks/use-eid-unlock.ts`:
    - Custom hook that polls for Eid unlock status
    - Fetches unlock time from `app_settings` on mount
    - Uses `setInterval` to check `Date.now() >= unlockTime` every 30 seconds
    - When unlock detected:
      1. Set `isUnlocked = true` state
      2. Re-fetch inbox messages via `get_inbox_messages` RPC
      3. Trigger staggered envelope appearance animation
    - Cleanup interval on unmount
    - Return: `{ isUnlocked, timeRemaining, messages }`
  - Integrate into inbox page:
    - Replace static unlock check with `useEidUnlock` hook
    - When hook detects unlock while user is on page:
      - Countdown timer hits 0:00:00
      - Brief celebration animation (confetti-like shimmer or golden particles — keep simple with CSS)
      - Envelopes transition from locked to tappable state
      - No page refresh needed — state update triggers re-render
  - Edge case: if user opens inbox AFTER Eid has passed, skip countdown and show tappable envelopes directly

  **Must NOT do**:
  - Do NOT use WebSocket or Supabase Realtime — polling only
  - Do NOT poll more frequently than every 30 seconds
  - Do NOT add heavy confetti library — use CSS animations for celebration effect
  - Do NOT auto-open envelopes — user must tap each one

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Transition from locked to unlocked state needs smooth UX

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 18)
  - **Parallel Group**: Wave 4
  - **Blocks**: Task 20
  - **Blocked By**: Task 14 (envelope reveal animation must exist)

  **References**:
  - Task 13: Inbox page with countdown timer
  - Task 14: Envelope card with reveal animation
  - `hooks/` directory — create if doesn't exist
  - `lib/supabase/client.ts` — READ ONLY for client-side queries

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: DB prep — set unlock time to 30 seconds from now
    Tool: supabase-mcp-server_execute_sql
    Steps:
      1. Query: UPDATE public.app_settings SET value = to_char((NOW() + INTERVAL '30 seconds') AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') WHERE key = 'eid_unlock_time';
      2. Assert: UPDATE 1 (row updated)
    Expected Result: Unlock time set to ~30 seconds in the future
    Evidence: .sisyphus/evidence/task-19-db-prep-near-future.txt

  Scenario: Hook detects unlock when time passes
    Tool: Playwright
    Preconditions: Dev server running, DB prep scenario above completed (unlock ~30s away), messages exist
    Steps:
      1. Navigate to http://localhost:3000/inbox (if not logged in, complete Google sign-in at /auth/login first — see QA Auth Bootstrap)
      2. Wait for URL to contain "/inbox" (timeout: 15s)
      3. Assert: Countdown timer visible and ticking
      4. Wait 35 seconds
      5. Assert: Countdown is gone or shows 0
      6. Assert: Envelopes are now tappable (not locked)
      7. Screenshot
    Expected Result: Auto-transition from locked to unlocked state
    Evidence: .sisyphus/evidence/task-19-auto-unlock.png

  Scenario: DB prep — set unlock time to past for already-unlocked test
    Tool: supabase-mcp-server_execute_sql
    Steps:
      1. Query: UPDATE public.app_settings SET value = '2020-01-01T00:00:00Z' WHERE key = 'eid_unlock_time';
      2. Assert: UPDATE 1 (row updated)
    Expected Result: Unlock time set to past
    Evidence: .sisyphus/evidence/task-19-db-prep-past.txt

  Scenario: Already-unlocked inbox skips countdown
    Tool: Playwright
    Preconditions: DB prep scenario above completed (unlock time is past)
    Steps:
      1. Navigate to http://localhost:3000/inbox (if not logged in, complete Google sign-in at /auth/login first — see QA Auth Bootstrap)
      2. Wait for URL to contain "/inbox" (timeout: 15s)
      3. Assert: No countdown timer visible
      4. Assert: Envelopes are immediately tappable
    Expected Result: Skip countdown when already unlocked
    Evidence: .sisyphus/evidence/task-19-already-unlocked.png
  ```

  **Commit**: YES (groups with 18, 20)

- [ ] 20. Build Verification + Vercel Prep

  **What to do**:
  - Run full build verification:
    ```bash
    npm run build  # Must exit 0
    npx tsc --noEmit  # Must exit 0, no type errors
    ```
  - Check for common issues:
    - `grep -r "console.log" app/ components/ hooks/ lib/ --include="*.ts" --include="*.tsx"` — remove any debug logs
    - `grep -r "TODO\|FIXME\|HACK" app/ components/ --include="*.ts" --include="*.tsx"` — resolve or document
    - `grep -r "as any\|@ts-ignore" app/ components/ --include="*.ts" --include="*.tsx"` — remove type bypasses
  - Verify environment variables needed for Vercel:
    - `NEXT_PUBLIC_SUPABASE_URL` — required
    - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — required (newer format)
    - `EID_UNLOCK_TIME` — for reference (actual time is in DB)
  - Create/verify `.env.example` with all required env vars (no values, just keys)
  - Verify `next.config.js` has no issues for Vercel deployment
  - Check that all pages are accessible and render (no 500 errors):
    - `/` (redirects to /inbox or /auth/login)
    - `/auth/login`
    - `/auth/callback` (just verify route exists)
    - `/inbox`
    - `/search`
    - `/u/[username]`
    - `/send/[username]`

  **Must NOT do**:
  - Do NOT actually deploy to Vercel — just verify build readiness
  - Do NOT add new features
  - Do NOT change functionality

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (must be last implementation task)
  - **Parallel Group**: Wave 4 (after 18, 19)
  - **Blocks**: F1-F4 (final verification)
  - **Blocked By**: ALL previous tasks

  **References**:
  - `package.json` — build scripts
  - `next.config.js` or `next.config.mjs` — Next.js configuration
  - `.env.local` — current env vars (READ ONLY, don't commit)
  - All page files across the app

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: Production build succeeds
    Tool: Bash
    Steps:
      1. Run: npm run build (timeout: 600000)
      2. Assert: Exit code 0
      3. Assert: Output contains "Compiled successfully" or similar
      4. Run: npx tsc --noEmit (timeout: 600000)
      5. Assert: Exit code 0
    Expected Result: Clean production build with zero errors
    Evidence: .sisyphus/evidence/task-20-build-pass.txt

  Scenario: No debug artifacts in code
    Tool: Bash
    Steps:
      1. Run: grep -rn "console.log" app/ components/ hooks/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules
      2. Assert: Zero matches (or only intentional error logging)
      3. Run: grep -rn "as any" app/ components/ --include="*.ts" --include="*.tsx" 2>/dev/null
      4. Assert: Zero matches
    Expected Result: No debug logs or type bypasses
    Evidence: .sisyphus/evidence/task-20-clean-code.txt

  Scenario: All routes respond without 500 errors
    Tool: Bash
    Preconditions: Dev server running
    Steps:
      1. Run: curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
      2. Assert: Status is 200 or 307 (redirect)
      3. Run: curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/auth/login
      4. Assert: Status is 200
      5. Run: curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/search
      6. Assert: Status is 200 or 307 (redirect to login if not authed)
    Expected Result: No 500 errors on any route
    Evidence: .sisyphus/evidence/task-20-routes-healthy.txt

  Scenario: .env.example exists with required keys
    Tool: Bash
    Steps:
      1. Run: cat .env.example
      2. Assert: Contains NEXT_PUBLIC_SUPABASE_URL
      3. Assert: Contains NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    Expected Result: Environment template file exists
    Evidence: .sisyphus/evidence/task-20-env-example.txt
  ```

  **Commit**: YES (groups with 18, 19)

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in `.sisyphus/evidence/`. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npx tsc --noEmit` + `npm run build`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration. Test edge cases: empty state, invalid input, rapid actions. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built, nothing beyond spec was built. Check "Must NOT do" compliance. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | VERDICT`

---

## Commit Strategy

| After Task(s) | Commit Message | Pre-commit Check |
|--------------|---------------|-----------------|
| 1-4 | `chore: clean starter cruft, add deps, setup theme and middleware` | `npm run build` |
| 5-7 | `feat(db): create schema with RLS, triggers, and functions` | `supabase-mcp-server_get_advisors` |
| 8 | `feat(auth): implement Google OAuth flow` | `npm run build` |
| 9-12 | `feat(ui): add layout, profile, search, and compose pages` | `npm run build` |
| 13-15 | `feat(inbox): locked inbox, envelope animations, wish-back` | `npm run build` |
| 16-17 | `feat: notification badge and profile sharing` | `npm run build` |
| 18-20 | `chore: responsiveness, auto-unlock, build verification` | `npm run build` |

---

## Success Criteria

### Verification Commands
```bash
npm run build                    # Expected: exit 0, no errors
npx tsc --noEmit                 # Expected: exit 0, no type errors
```

### Final Checklist
- [ ] All "Must Have" items present and functional
- [ ] All "Must NOT Have" items verified absent
- [ ] Google OAuth login works end-to-end
- [ ] Message sending with anonymous toggle works
- [ ] Inbox shows locked envelopes before Eid
- [ ] Envelope tap-to-reveal animation works after Eid
- [ ] Wish-back (preset + custom) works
- [ ] User search returns results
- [ ] Profile page renders at `/u/[username]`
- [ ] No email/password auth code remains
- [ ] No dark mode / theme switcher remains
- [ ] All starter cruft deleted
- [ ] `npm run build` passes
- [ ] RLS security advisors show no warnings
