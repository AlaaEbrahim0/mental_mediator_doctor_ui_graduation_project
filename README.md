# Nexus — Doctor Portal

**React frontend for the Mental Mediator platform.** Provides clinical workflows for doctors: appointment scheduling, patient community, profile management, and real-time chat rooms.

- **Production URL:** https://mental-mediator-doctor-ui-graduation-project.vercel.app
- **Backend API:** https://nexus-api.runasp.net/
- **Patient portal:** https://mental-health-ochre-xi.vercel.app
- **Shared UI library:** https://github.com/AlaaEbrahim0/nexus-shared-ui

---

## Features

| Area | Description |
|------|-------------|
| **Dashboard** | Real-time workload overview and session status |
| **Appointment scheduling** | Weekly schedule editor; book, confirm, reject, and cancel appointments |
| **Public profiles** | Shareable doctor profiles with certificates, qualifications, social links, and public contact details — viewable without signing in |
| **Profile editor** | Photo/cover upload, visibility controls, languages, interests, and practice details |
| **Forums & discussions** | Anonymous peer-support threads with nested comments and replies |
| **Chat rooms** | Real-time SignalR-based group chat with moderation |
| **Notifications** | In-app real-time notifications via SignalR |

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 (Create React App) |
| Styling | Tailwind CSS 3 + DaisyUI 4 (`nexus` theme) |
| Forms | Formik + Yup |
| Charts | Chart.js + react-chartjs-2 |
| Real-time | `@microsoft/signalr` |
| HTTP | Axios |
| Routing | React Router v6 |
| Shared UI | [@nexus/shared-ui](https://github.com/AlaaEbrahim0/nexus-shared-ui) |

---

## Quick start

### Prerequisites

- Node.js ≥ 18 (LTS recommended)
- npm

### Install and run

```bash
git clone https://github.com/AlaaEbrahim0/mental_mediator_doctor_ui_graduation_project.git
cd mental_mediator_doctor_ui_graduation_project

npm install

cp .env.example .env
# Edit .env — see "Environment variables" below

npm start        # http://localhost:3000
```

### Build for production

```bash
npm run build    # Output: build/
```

---

## Environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_API_URL` | Yes | Backend API base URL. Production: `https://nexus-api.runasp.net/` |
| `REACT_APP_IMAGE_BASE_URL` | No | Path to bundled static images. Default: `/images` |
| `REACT_APP_PATIENT_APP_URL` | No | Patient portal base URL. When set, public doctor profiles show a "Book a session" link. Production: `https://mental-health-ochre-xi.vercel.app` |

> `.env` is gitignored. Never commit credentials or tokens.

---

## Project structure

```
src/
├── api/            # Axios modules (auth, community, chat, schedule, profile, appointments)
├── auth/           # AuthProvider, session helpers, login and reset forms
├── components/
│   ├── chat/       # ChatMessageItem, ChatComposer, RoomMembersPanel, ReportMessageModal
│   ├── form/       # LoginForm, WeeklyScheduleEditor, TimeOffSection, UpcomingAppointmentsCard
│   ├── layout/     # MainLayout, Sidebar, TopBar
│   ├── profile/    # ProfileView, CertificateModal, QualificationModal
│   └── ui/         # Design system: Button, Card, Input, Modal, Post, Comment, Reply, …
├── context/        # profileContext, notificationsContext
├── hooks/          # useChatHub, useSignalR, useInView, useRefreshOnFocus
├── pages/          # Home, Forums, ChatRooms, ChatRoom, Appointments, Schedule, Profile, ProfileEditor, PublicDoctorProfile
├── routes/         # Route definitions + ProtectedRoute
└── utils/          # chat helpers, date formatting
```

---

## Design system

Both portals share a design system defined in `tailwind.config.js`:

- **Theme:** DaisyUI `nexus` (teal primary + slate neutrals)
- **Font:** Albert Sans
- **Tokens:** Palette, spacing, radii, shadows, and semantic aliases all live in `tailwind.config.js`

Shared primitive components (`Button`, `Card`, `Input`, `Modal`, `Post`, `Comment`, …), the auth/session helpers, the API client, and `tailwind.config.js` are maintained in [nexus-shared-ui](https://github.com/AlaaEbrahim0/nexus-shared-ui) and **vendored** into this portal by `scripts/shared-ui-sync.mjs`. The pinned upstream commit is recorded in `.shared-ui.json`.

Vendoring (rather than a `node_modules` import) is deliberate: `react-scripts` transpiles JSX only inside this app's `src/`, so raw-JSX sources installed from Git would fail the production build. No build-tool override (craco/rewired) was added.

To update a shared component:

1. Edit the source in `nexus-shared-ui`, push it, and bump `version` in its `package.json`.
2. In this repo, update the pin and pull the new files:
   ```bash
   npm run shared-ui:sync -- --ref <new commit sha>   # or edit .shared-ui.json, then:
   npm run shared-ui:sync
   ```
3. Run `npm run shared-ui:check`, build, and commit the synced files together with the new pin.

`npm run shared-ui:check` exits non-zero when a vendored file no longer matches the pinned upstream commit — run it in CI so the two portals cannot drift apart silently.

---

## Available scripts

| Command | Description |
|---------|-------------|
| `npm start` | Development server at `http://localhost:3000` |
| `npm run build` | Production build in `build/` |
| `npm test` | Run tests with Jest / React Testing Library |
| `npm run shared-ui:sync` | Copy the pinned `@nexus/shared-ui` files into this portal |
| `npm run shared-ui:check` | Fail if a vendored file has drifted from the pinned upstream |

---

## Deployment

Hosted on [Vercel](https://vercel.com) as project **`mental-mediator-doctor-ui-graduation-project`** in the `alaa-ebrahims-projects` team.

**The project is not connected to GitHub**, so pushing to `master` does **not** trigger a build. Production is deployed from the CLI:

```bash
npx vercel --prod
```

`REACT_APP_API_URL` and `REACT_APP_IMAGE_BASE_URL` are stored in the Vercel project settings for
Production, Preview, and Development; they are **not** read from `.env` during a hosted build.
`REACT_APP_PATIENT_APP_URL` is currently **not** set in the Vercel project, so the "Book a session"
link on public doctor profiles only appears in local builds that define it — set it in the
dashboard (or `npx vercel env add REACT_APP_PATIENT_APP_URL production`) and redeploy to enable it
in production.

The `vercel.json` at the project root rewrites every non-asset path to `/index.html` so
client-side routes resolve on a hard refresh.

Older deployments stay under the same project, so a previous release can be promoted again as a
rollback.

---

## Related repositories

| Repository | Description |
|-----------|-------------|
| [mental-mediator-api-graduation-project](https://github.com/AlaaEbrahim0/mental-mediator-api-graduation-project) | ASP.NET Core 8 backend API |
| [mental_mediator_patient_ui_graduation_project-](https://github.com/AlaaEbrahim0/mental_mediator_patient_ui_graduation_project-) | Patient portal |
| [nexus-shared-ui](https://github.com/AlaaEbrahim0/nexus-shared-ui) | Shared UI library |

---

> Graduation project · Computer Science 2026 · Alaa Ebrahim
