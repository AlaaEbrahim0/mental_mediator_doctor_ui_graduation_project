# Nexus Doctor Portal — Doctor UI

**Doctor Attendance & Mental Health Support Portal** — A professional graduation project (Computer Science, 2026)
Hosted at: https://mental-mediator.onrender.com

---

## 📦 Overview

Nexus is a full-stack web application designed to streamline doctor attendance tracking and patient mental health support. This repository contains the **Doctor UI** — a React-based frontend that presents clinical workflows in a clean, production-grade interface.

### What This Portal Does

| Area | Purpose |
|------|---------|
| **Doctor Queue & Dashboard** | Real-time workload overview, patient queues, session status |
| **Appointment Scheduling** | Book, view, and manage patient appointments with doctors |
| **Weekly Schedule** | Visual calendar grid showing daily clinic slots and progression |
| **Patient Records & Reviews** | Anonymized patient overview cards and consultation history |
| **Forums & Discussions** | Anonymous peer support threads with nested replies and moderation |
| **News & Announcements** | Clinic news, policy updates, and important notices |
| **Stats & Charts** | Attendance metrics and session analytics at a glance |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18 (LTS recommended)
- **npm** (installed with Node)
- **Git**

### Install & Run

```bash
# 1. Clone the repository
git clone https://github.com/AlaaEbrahim0/mental-mediator-doctor-ui-graduation-project.git
cd mental-mediator-doctor-ui-graduation-project

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**

### Build for Production

```bash
npm run build
# Output: dist/ (ready for deployment / GitHub Pages / Vercel / Render)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 (Vite) |
| **Styling** | Tailwind CSS + DaisyUI |
| **Components** | Framer Motion (animations), react-icons |
| **Forms** | Formik + Yup (validation) |
| **Charts** | Chart.js |
| **Notifications** | React Toastify |
| **Deployment** | Render / Vercel / GitHub Pages |

---

## 🎨 Design System

The UI is built on a consistent design system:

- **Primary palette**: Teal (`teal-500/600`) + Slate neutrals
- **Semantic colors**: Success `emerald-500`, Warning `amber-500`, Danger `rose-600`
- **Typography**: `Gilroy` (Sora fallback stack) with tabular-nums for schedules/timestamps
- **Spacing**: 4px baseline scale, `rounded-xl`/`12px` border radius
- **Shadows**: Subtle `shadow-sm` / `shadow-md` for elevation

### Core UI Components

All components are centralized in `src/components/ui/index.js`:

#### Base Primitives
- **Button** — primary, secondary, ghost, danger, success, link variants; solid/outline; loading state; full width; icon support
- **Card** — content cards with optional hover elevation, configurable shadow, padding
- **Badge** — semantic status indicators (default, primary, success, warning, error, info); size variants
- **Modal** — accessible dialogs with backdrop, focus trap support, responsive sizes
- **Input / Select / Textarea** — unified styled form controls with labeled wrappers, error/success states, floating labels, accessible focus rings
- **Avatar** — user profile images with fallback initials, multiple sizes
- **Spinner / Skeleton** — async loading states with shimmer animations (SkeletonBlock, SkeletonText)

#### Interactive Components
- **Alert** — success, warning, error, info feedback banners with colored icons
- **Rating** — interactive star rating with read-only mode
- **Toggle** — interactive on/off switch with label
- **Switch** — styled on/off toggle with label and description
- **Tabs** — tabbed interface component
- **CollapsibleSection** — accordion-style expandable sections
- **Pagination** — page navigation controls with previous/next
- **EmptyState** — helpful empty states with optional action buttons
- **ProgressBar** — animated progress bars with color variants
- **StepIndicator** — multi-step progress indicator
- **BackToTop** — scroll-to-top button with scroll detection
- **ImageUpload** — drag-and-drop file upload with preview
- **SearchInput** — search field with clear button and animated icon
- **CopyToClipboard** — one-click copy with feedback
- **ConfirmDialog** — reusable confirmation dialog
- **CardAction** — ghost action button for cards
- **ChatBubble** — contextual chat message bubble
- **SocialProof** — social proof indicators
- **WaveSection** — decorative wave divider for section separation
- **LoadingOverlay** — full-screen background loading overlay

### Dashboard Visual Elements
- **StatCard** — metric cards with trend indicators and icon badges
- **DataTable** — responsive tables with skeleton loading, hover states

---

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/     # MainLayout, Sidebar, TopBar
│   ├── ui/         # Design system primitives (Button, Card, Modal, etc.)
│   └── form/       # ScheduleForm, LoginForm, AppointmentForm
├── pages/          # Dashboard, Schedule, Appointments, Forums, etc.
├── context/        # Profile context (auth state)
├── routes/         # Route definitions
├── api/            # API client functions
├── utilities/      # Helpers
└── index.css       # Global styles + design token overrides
```

---

## 🔑 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | Production-ready build in `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## 📜 Environment Variables

Create a `.env` file by copying `.env.example`:

```bash
cp .env.example .env
```

| Variable | Required | Usage |
|----------|----------|-------|
| `VITE_APP_API_URL` | Yes | Backend API base URL (e.g. `https://api.example.com/api`) |

> **Note:** Never commit `.env`; `.env` is already in `.gitignore`.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-ui`)
3. Write/modify code following existing patterns
4. Commit using [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, etc.)
5. Push and open a Pull Request

---

## 📄 License

MIT © 2026 — **Alaa Ebrahim** (alaaebrahim0)

---

> **Project Status:** Graduation Project · PSAD 2026 · Backend API companion: [mental-mediator-api-graduation-project](https://github.com/AlaaEbrahim0/mental-mediator-api-graduation-project)
