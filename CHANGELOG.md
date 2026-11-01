# Changelog

All notable changes to this project are documented in this file.

The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html). The portal's own version is
`0.1.0` in `package.json`; the reproducible identifier for shared code is the commit pin
in `.shared-ui.json`.

## [Unreleased]

Nothing staged. The project is in **feature freeze**.

## [0.1.0] - 2026-11-01

Navigation, chat-media, and vendoring polish pass. No routes, no data contracts, and no
authorisation behaviour changed — the .NET API remains the source of truth for who may do
what, including moderation and patient-history access.

### Added

- **Chat photo and video attachments.** The message composer (`ChatComposer.js`, now
  vendored) has an attach control accepting `image/*,video/*`, a local size pre-check
  against the API's storage caps (5 MB images, 20 MB videos) so an oversized pick fails
  before a long upload starts, a thumbnail preview with the file name, an accessible
  percentage progress bar (`role="progressbar"`), an "Uploaded" / failure line, and a
  remove-attachment button. Media is uploaded immediately on pick to
  `POST /api/chat/rooms/{roomId}/media`; the draft and attachment stay on screen until the
  send succeeds, and sending is blocked while an upload is running or has failed. Moderators
  get the same reporting and deletion affordances as before, now from the shared modules.

### Changed

- **Re-pinned `@nexus/shared-ui` to `f082cb5d2f2d45de0b38f43fbea2cc9de9f7d1fd`.**
  This portal now vendors **51 files** and `npm run shared-ui:check` reports
  `In sync with @nexus/shared-ui@f082cb5 (51 files)`.
- **Chat code moved upstream.** `src/api/chat.api.js`, `src/utils/chat.js`, and the chat
  components `ChatComposer.js`, `CreateRoomModal.js`, `ReportMessageModal.js`, and
  `RoomReportsPanel.js` joined the vendored set, so their portal-local copies are now
  synced artifacts and must not be edited here.
- The vendored set is 6 files larger than the patient portal's: the shared test files
  (`RoomCard.test.js`, `roomsFilter.test.js`, `profileUtils.test.js`,
  `primitives.test.js`) plus the doctor-only `CertificateModal.js` and
  `QualificationModal.js`.
- `ChatMessageItem.js` and `RoomMembersPanel.js` stay portal-local on purpose — the doctor
  versions link out to patient profiles.

### Fixed

- **Mobile navigation drawer.** The drawer and its backdrop now have explicit stacking
  levels — backdrop `z-30`, panel `z-50`, top-bar dropdowns `z-[60]` — so an open drawer
  is no longer painted below page content. The panel is `fixed` under 1024px and
  `lg:sticky` above it.
- **Sidebar viewport and collapse behaviour.** The drawer tracks a `< 1024px` viewport on
  resize, closes on `Escape` and on backdrop click, restores focus to `#sidebar-toggle`,
  locks background scroll while open, sizes itself with `100dvh` instead of `100vh` so
  mobile browser chrome cannot clip the nav, and the closed panel is marked `inert` with
  `aria-hidden` and `tabIndex={-1}` on its links so it cannot be tabbed into.
- **Failed messages are withdrawn from the transcript.** When a send is rejected, the
  optimistic message added on submit is removed by its `clientMessageId` and an error
  toast is shown, instead of leaving an unsent bubble in the room.
- Chat rendering no longer depends on portal-local copies of the composer and report
  panels, so the doctor and patient views of the same room stay consistent.

## Notes on this release

`npm test` (Jest + React Testing Library via `react-scripts`): **15 suites / 131 tests**,
all passing with exit code 0. The run prints a repeated
`ReactDOMTestUtils.act is deprecated in favor of React.act` warning from the RTL render
helpers — known noise, not a failure. `CI=true npm run build` is clean; with `CI=true`
ESLint warnings fail the build.
