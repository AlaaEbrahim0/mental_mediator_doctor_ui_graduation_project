# AGENTS.md — doctor-ui (Mental Mediator doctor portal)

Read this before touching anything in this repository. Most of what looks like a
convention here is a constraint, not a preference.

**Status: FEATURE FREEZE (graduation project).** No new features, no opportunistic
refactors, no dependency upgrades. Fix real defects and do the smallest change that
fixes them. If a change is not required by the task, do not make it.

---

## What this is

React 18 + Create React App (`react-scripts` 5.0.1) SPA. Tailwind CSS 3 + DaisyUI 4
(`nexus` theme), React Router v6 (`createBrowserRouter`), Axios, SignalR 8, Formik + Yup,
Chart.js + react-chartjs-2, `react-date-picker`.

- Package name: `mental_mediator_doctor_ui` (version `0.1.0`), `engines.node: "24.x"`
- Production: https://mental-mediator-doctor-ui-graduation-project.vercel.app
- Backend: ASP.NET Core 8 API at https://nexus-api.runasp.net/ (sibling `../api`)
- Shared design system: https://github.com/AlaaEbrahim0/nexus-shared-ui (**vendored**, see below)
- Patient portal: https://mental-health-ochre-xi.vercel.app (sibling `../patient-ui`)
- Git branch: **`master`** (matches the drift workflow's `on.push` filter here)
- Sign-in is **email/password only**. There is no Google OAuth in this portal — do not add
  one; the patient portal owns that flow.

## Commands

These are the scripts in `package.json`. There is **no `lint` script** — ESLint runs inside
`react-scripts build`. `npm run eject` exists (CRA scaffold) and **must not be used**: it
rewrites the build config the vendoring model and the `react-markdown` test rule depend on.

| Command | What it does |
|---|---|
| `npm start` | CRA dev server on http://localhost:3000 |
| `npm run build` | CRA production build into `build/`; runs ESLint. **With `CI=true`, warnings are treated as errors and the build fails.** |
| `npm test` | `react-scripts test` (Jest + RTL). Watches by default; use `CI=true npm test` for a single run |
| `npm run shared-ui:sync` | Copy the pinned `@nexus/shared-ui` files into this portal |
| `npm run shared-ui:check` | Same script in check mode: exit 1 if any vendored file has drifted from the pin |

Current suite: **15 suites / 131 tests**, all passing with `CI=true npm test` (exit 0). The
run prints a repeated `ReactDOMTestUtils.act is deprecated in favor of React.act` console
warning from the RTL render helpers — pre-existing noise, not a failure. A timer-leak
warning at Jest teardown has been reported intermittently; it did not reproduce in the
`CI=true npm test` run behind these numbers.

## Repo map

```
package.json                 scripts + dependencies + engines (no lint script)
vercel.json                  SPA rewrite: every non-asset path -> /index.html
.shared-ui.json              the pin: upstream repo URL, commit `ref`, and the 51 vendored files
scripts/shared-ui-sync.mjs   the vendoring tool (Node built-ins + git only, no deps)
.github/workflows/shared-ui-drift.yml  CI: runs `npm run shared-ui:check` on push/PR to `master`
.env / .env.example          REACT_APP_API_URL, REACT_APP_IMAGE_BASE_URL, REACT_APP_PATIENT_APP_URL
                             (.env, .env.local, .env.*.local are gitignored)
tailwind.config.js           VENDORED — canonical design tokens live upstream
src/index.js                 ReactDOM.createRoot, StrictMode
src/App.js                   ThemeProvider > AuthProvider > UserProfileProvider > NotificationsProvider > Routes
src/routes/index.js          the single module-scope createBrowserRouter; all routes
src/routes/ProtectedRoute.js token + `doctor` role check (case-insensitive); falls back to persisted session
src/auth/
  authProvider.js            VENDORED — session state, chunked expiry timers, `auth:expired`
  session.js                 VENDORED — localStorage key `nexus_auth_session`, getToken/saveSession/clearSession
  login.js logout.js forgetPassword.js
src/api/
  client.js                  VENDORED — axios instance, base-URL trim, JWT request interceptor, 401 -> `auth:expired`, RFC 7807 message helpers
  chat.api.js notifications.api.js   VENDORED
  auth.api.js appointments.api.js community.api.js history.api.js profile.api.js schedule.api.js workspace.api.js   LOCAL
src/components/
  ui/                        VENDORED design system — primitives.js, community.js, index.js, Post, Comment, Reply, …
                             (README.md in this folder is a portal-local usage guide: it is NOT in
                             the manifest and has no upstream counterpart, so nothing syncs it)
  chat/                      mixed: ChatComposer, CreateRoomModal, ReportMessageModal, RoomReportsPanel,
                             JoinRoomModal, RoomCard, RoomInviteModal, RoomInvitationList, RoomSettingsModal,
                             roomsFilter are VENDORED; ChatMessageItem and RoomMembersPanel are LOCAL
                             (the doctor versions link to patient profiles — they genuinely diverge)
  layout/                    LOCAL — MainLayout, Sidebar (mobile drawer), TopBar
  profile/                   VENDORED — ProfileView, CertificateModal, QualificationModal, profileUtils
                             (+ profileUtils.test.js)
  dashboard/ form/            LOCAL — ActivityFeed, DashboardInsights, LiveRoomsPanel, MetricCards,
                             LoginForm, WeeklyScheduleEditor, TimeOffSection, AvailableSlotsPreview, …
  media/MediaGallery.js history/PatientHistoryTimeline.js routing/ScrollManager.js   VENDORED
src/hooks/                   useChatHub.js + useModerationStage.js VENDORED; useSignalR.js useInView.js useRefreshOnFocus.js LOCAL
src/context/                 notificationsContext.js VENDORED; profileContext.js signalRContext.js LOCAL
src/utils/                   chat.js moderationState.js postComposerConfig.js utcToRelativeTime.js VENDORED
src/pages/                   LOCAL — Home (dashboard), Appointment, Schedule, Workspace,
                             PatientHistoryView, Profile, ProfileEditor, PublicDoctorProfile, Notifications,
                             CommunityLayout, Forums, ForumsDetails, Rooms, ChatRoom
```

The authoritative vendored list is the `files` array in `.shared-ui.json` (51 entries —
6 more than `patient-ui`: the shared test files `RoomCard.test.js`, `roomsFilter.test.js`,
`profileUtils.test.js`, `primitives.test.js`, plus the doctor-only `CertificateModal.js` and
`QualificationModal.js`). When in doubt about whether a file is shared, check that array —
do not guess.

## The vendored shared-ui rule (hard)

`@nexus/shared-ui` is **not an npm package**. It is not in `node_modules` and is not
resolved at build time. Each portal keeps a byte-for-byte copy of the upstream files at a
commit pinned in `.shared-ui.json` (`ref: f082cb5d2f2d45de0b38f43fbea2cc9de9f7d1fd` right
now, in sync: `In sync with @nexus/shared-ui@f082cb5 (51 files)`).

**NEVER edit a file that appears in `.shared-ui.json`'s `files` list.** Not to fix a bug,
not to tweak a class name, not to "just add one prop". Those copies are overwritten by the
next `npm run shared-ui:sync`, and the drift check turns red in the other portal too.

The correct loop:

1. Edit the file in the upstream `nexus-shared-ui` checkout, commit, and **push it**.
2. In each portal that needs the change: `npm run shared-ui:sync -- --ref <new sha>`
   (rewrites `.shared-ui.json` and copies the files in).
3. `npm run shared-ui:check` — must print "In sync".
4. `npm run build` and `npm test`.
5. Commit the re-pinned `.shared-ui.json` **together with** the synced files.
6. `shared-ui` is pushed **first**, portals after — never the other way round.

Why vendoring at all: `react-scripts`'s Babel rule is `include: paths.appSrc`, so JSX is
transpiled only under this app's `src/`. A `github:`/`node_modules` dependency shipping raw
JSX would fail the build unless craco or react-app-rewired were added, and neither is. Do
not "simplify" this by adding the package to `dependencies`.

Note: `src/index.css` and `tailwind.config.js` are **also vendored**. A token or global-CSS
change belongs upstream, not here. Keep both portals on the same pin — a shared component
"fixed" only in one portal is a guaranteed divergence between doctor and patient views.

Portal-owned code imports the vendored copy by relative path, never from `@nexus/shared-ui`:

```jsx
import { Button, Card } from "../components/ui";          // primitives entry only
import { Post, Comment } from "../components/ui/community"; // the react-markdown entry
import { ChatComposer } from "../components/chat/ChatComposer"; // chat modules have no barrel
```

## Auth rules (hard)

- The JWT lives in localStorage under **`nexus_auth_session`** as
  `{ token, userId, roles, expiresOn }`, written and read **only** through
  `src/auth/session.js`. That key and shape are shared with `patient-ui` through upstream.
- **Never change the JWT audience.** The API's `JwtSettings:Audience`
  (`api/API/appsettings.json`) is a **single value for both portals**:
  `https://mental-health-ochre-xi.vercel.app` (the patient alias), with
  `ValidateAudience = true`. Tokens minted for one audience are rejected for another, so
  any change to how a token is obtained, stored, or replayed here can break sign-in in
  *both* portals. Same discipline for the storage key and the `roles` claim
  (compared case-insensitively against `doctor`).
- This portal is password-only. Do not port the patient portal's Google handoff
  (`ExternalLoginGate` / `externalSession.js`) here — the API routes the patient flow
  through are role-gated and refuse clinician accounts.
- Never commit secrets. No API keys, no tokens, no real credentials in source, fixtures,
  tests, `.env`, or committed `build/` output. `.env`, `.env.local`, and
  `.env.*.local` are gitignored; `.env.example` is the template. Only `REACT_APP_*` values
  reach the client bundle, and **everything inlined there is public** — put nothing
  sensitive in them.
- The sign-in screen renders a seeded demo account (`doctor@example.com`) with a "Fill
  sign-in details" button, unconditionally — it is not behind a `NODE_ENV` check. It is a
  graduation-demo convenience, not a credential to reuse elsewhere; do not add real
  accounts to it and do not treat it as auth infrastructure.

## Authorization: the .NET API is the source of truth

`src/routes/ProtectedRoute.js` and every role/permission helper in `src/utils/chat.js`
(e.g. `canModerateRoom`, `canDeleteChatMessage`, `canManageChatMemberRole`) only decide
**which screen to show**. The ASP.NET Core API authorises every request and every mutation
independently. Frontend checks are UX, not a security boundary:

- Never weaken, bypass, or replicate a server rule in the client to make a screen work.
- Never add a client-side permission that the API does not enforce.
- A `403` means the account genuinely lacks the role — `src/api/client.js` deliberately
  does **not** redirect on 403 (the user *is* authenticated). Leave that alone.
- Moderation, patient-history visibility, appointment state transitions, and pricing all
  belong to the API. If a permission seems wrong, the fix is in the API repo, not here.

## Deployment

Vercel, project `mental-mediator-doctor-ui-graduation-project`, deployed with
`npx vercel --prod`. Not connected to GitHub, so pushing to `master` does not build
anything. `REACT_APP_*` values are inlined at build time — changing one needs a redeploy,
not just an env edit. `REACT_APP_PATIENT_APP_URL` is what makes "Book a session" on public
doctor profiles point at the live patient portal.

**Vercel preview URLs are intentionally not in the API's CORS allowlist**
(`api/API/Configurations/DependencyInjection.cs` lists only the two production aliases
plus localhost). Google sign-in and API calls therefore **fail on preview deployments by
design**. That is not a bug to chase: verify on `localhost:3000` against the real API, or
promote the deployment to the production alias.

## Gotchas

- `src/components/ui/index.js` re-exports **only primitives**. `Post`/`Comment`/`Reply`
  import `react-markdown`, which is ESM-only; CRA's Jest never transforms `node_modules`
  and cannot be configured without ejecting, so adding them to that barrel breaks every
  test that imports `"../ui"`. Keep any ESM-only dependency out of `index.js`.
- `CI=true npm run build` fails on ESLint **warnings**, not just errors. Keep the build
  warning-free.
- `authProvider.js` chunks its expiry `setTimeout` because browsers clamp delays to
  `2147483647` ms; a 30-day token would overflow and wipe the session immediately.
- `API_BASE_URL` trims trailing slashes in `src/api/client.js`; hub URLs (`/chat-hub`,
  `/notification-hub`) are string concatenated, so an untrimmed slash produces `//…` and a
  404.
- Doctor role matching is case-insensitive against `doctor`; the API issues `Doctor`.
  `routes/index.js`'s `LoginRoute` compares `roles.includes("Doctor")` exactly — another
  reason not to touch role handling casually.
- Adding a third-party import to a shared file means adding that package to **both**
  portals' dependencies before re-pinning, or the portal without it fails its build.

## Known gaps

- The drift workflow's `on.push` / `on.pull_request` path filters cover
  `tailwind.config.js`, `src/index.css`, `src/api/**`, `src/auth/**`,
  `src/components/ui/**`, `src/components/profile/**`,
  `src/context/notificationsContext.js`, `src/hooks/useChatHub.js`, and
  `src/utils/utcToRelativeTime.js`. `src/components/chat/**`, `src/utils/chat.js`,
  `src/utils/moderationState.js`, `src/utils/postComposerConfig.js`,
  `src/hooks/useModerationStage.js`, `src/components/media/**`,
  `src/components/history/**`, `src/components/routing/**`, and `src/theme/**` are **not**
  in those filters, so a change limited to them does not run the job automatically — run
  `npm run shared-ui:check` locally in both portals, or dispatch the workflow manually.
- `scripts/shared-ui-sync.mjs` **only copies** — it never deletes. A file dropped from the
  `files` array or from upstream stays in this portal until deleted by hand.
- `npm run shared-ui:sync -- --clone` forces a fresh clone from GitHub instead of using a
  sibling `../shared-ui` checkout (use it if the sibling is at a different commit).
- `version` in `.shared-ui.json` is a label; the sync script ignores it. Reproducibility
  comes from `ref` alone.
- Stray local artifacts (`build_output.txt`, `scan_summary.json`, `src/logo.svg`) are not
  part of the app.
