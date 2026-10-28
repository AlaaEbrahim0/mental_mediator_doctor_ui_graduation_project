# Shared UI primitives

> Vendored from [nexus-shared-ui](https://github.com/AlaaEbrahim0/nexus-shared-ui) at the
> ref in `.shared-ui.json`. Edit upstream and run `npm run shared-ui:sync` — changes made
> here are overwritten on the next sync.

The shared UI layer lives in `src/components/ui`. Pages should import from the
barrel:

```js
import { Alert, Button, Card, Input, Modal } from "../ui";
```

## Token ownership

`tailwind.config.js` is the single source of truth for colour, spacing,
radius, and elevation:

- `palette` holds the raw brand, neutral, success, warning, danger, and info
  values.
- Tailwind colour aliases (`primary`, `neutral`, `success`, `warning`,
  `danger`, `error`, `info`, `ink`, `muted`, `line`, `canvas`, `surface`,
  `navy`) and the `shadow-card` utility come from that palette. DaisyUI
  registers flat `neutral-*` defaults that shadow a nested scale, so the
  config re-emits those flat keys from `palette.neutral`; keep that in mind
  before adding another `neutral` value.
- The DaisyUI `nexus` and `dark` themes are generated from the same palette.
  `public/index.html` selects `nexus` with `data-theme="nexus"`. There is no
  runtime theme toggle yet; the dark theme is reserved for that work.
- `src/index.css` exposes the `--nexus-*` variables as `theme()` aliases. They
  are convenience aliases, not a second palette.

Do not add a new hex value in a component or page. Use a Tailwind semantic
utility (`text-muted`, `border-line`, `bg-canvas`) or a `--nexus-*` variable
when CSS needs the value outside a utility class. A new colour belongs in
`palette` first.

Charts still use literal colours in `src/pages/Home.js`; chart tokenisation is
deferred until the dashboard is migrated so the canvas palette can be tested
against the real data view.

## Components

| Component | Purpose |
| --- | --- |
| `Spinner` | Inline busy indicator. Pass `label` when it is the only status text. |
| `Button` | Variants: `primary`, `secondary`, `outline`, `ghost`, `danger`, `success`, `link`. Sizes: `sm`, `md`, `lg`. Supports `loading`, `loadingText`, `fullWidth`, `iconOnly`. Use `as={Link}` for navigation actions. |
| `Field` | Label, error, hint, and required marker for custom controls. |
| `Input`, `Textarea`, `Select` | Labelled form controls with `aria-invalid` and `aria-describedby` wiring. |
| `Card` | Bordered surface with `shadow-card`; `padded` and `hover` are opt-in. |
| `Badge` | Compact status label. |
| `Alert` | Info, success, warning, or error message with matching live-region semantics. |
| `Modal` | Portal dialog with Escape handling, focus trap, scroll lock, and focus restore. |
| `ConfirmDialog` | Async confirmation built on `Modal`; awaits `onConfirm`, closes on success, and routes failures to `onError`. |
| `EmptyState` | Placeholder for a valid but empty collection. |
| `ErrorState` | Recoverable error panel with optional retry. |
| `Skeleton`, `SkeletonText` | Loading placeholders marked `aria-hidden`. |

### Form fields

Prefer the labelled controls. If a custom control is unavoidable, wrap it in
`Field` and pass the same id to the control's `htmlFor`:

```jsx
<Field id="specialty" label="Specialty" required error={errors.specialty}>
    <SpecialtyPicker id="specialty" />
</Field>
```

Errors are rendered with `role="alert"`; hints and errors are linked through
`aria-describedby`. The required marker is decorative (CSS-generated) so it
does not pollute the field's accessible name.

### Dialogs

```jsx
<ConfirmDialog
    isOpen={isOpen}
    onClose={close}
    onConfirm={() => deletePost(post.id)}
    onError={(error) => setDeleteError(error.message)}
    title="Delete post"
    message="This cannot be undone."
    confirmLabel="Delete"
/>
```

`ConfirmDialog` owns the busy state while the promise is pending and blocks a
second submit. It closes after a successful `onConfirm`; on rejection it calls
`onError` and stays open.

### Buttons as links

```jsx
<Button as={Link} to="/login" variant="outline">
    Back to sign in
</Button>
```

Use this for navigation so the result keeps link semantics. `disabled`
styling is only enforced for native buttons.

## Accessibility expectations

- Every interactive primitive is keyboard reachable and has a visible
  `focus-visible` ring.
- `Modal` focuses the first focusable element (or `initialFocusRef`), loops
  Tab and Shift+Tab, closes on Escape and backdrop click, locks background
  scroll, and restores focus to the opener.
- `Alert` uses `role="alert"` for errors and `role="status"` for non-error
  messages so assistive technology announces the right urgency.
- Loading buttons expose `aria-busy` and are disabled while pending.
- Motion respects the global `prefers-reduced-motion` rule in `src/index.css`.

## Migration notes

The older components in this folder (`Post`, `FilterationComponent`,
`CustomToast`, modal wrappers, and so on) predate the primitives. They are
still imported directly by pages and are being migrated incrementally. New
work should use the primitives; do not add features to the legacy `index.js`
barrel, which now only re-exports `primitives.js`.
