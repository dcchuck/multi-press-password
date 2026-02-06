# Multi-Press Password — Design

## Concept

A cooperative login gate with racing crew theming. Multiple users must simultaneously hold down a "Ready" button to unlock the "Login" button. Think pit crew — everyone has to be in position before the car can go.

## Tech Stack

- **Next.js 15** (App Router) with TypeScript
- **Tailwind CSS** for styling
- In-memory server state (no database)
- No external dependencies beyond Next.js

## Project Structure

```
multi-press-password/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                # Homepage — Ready + Login buttons
│   ├── dashboard/
│   │   └── page.tsx            # Protected page
│   └── api/
│       ├── press/
│       │   └── route.ts        # POST — report pressing state, returns count
│       └── login/
│           └── route.ts        # POST — attempt login, checks threshold
├── lib/
│   └── state.ts                # In-memory pressing state (module-level Map)
├── .env.local                  # PRESS_THRESHOLD=2
└── package.json
```

## In-Memory State (`lib/state.ts`)

A module-level `Map<string, number>` mapping user UUIDs to their last-seen-pressing timestamp.

- `setPressed(userId: string)` — sets/updates timestamp to `Date.now()`
- `removePressed(userId: string)` — deletes the entry
- `getActiveCount()` — counts entries with timestamps within the last 2 seconds (handles network jitter beyond the 1s poll interval). Lazily cleans stale entries.
- `isThresholdMet()` — returns `getActiveCount() >= PRESS_THRESHOLD`

Threshold is read from `process.env.PRESS_THRESHOLD`, defaulting to `2`.

## User Identity

On first visit, generate a random UUID via `crypto.randomUUID()` and store it in `localStorage`. Reuse on subsequent visits/refreshes. No auth, no cookies for identity — just a stable anonymous ID.

## API Routes

### `POST /api/press`

Called every 1 second while the user holds the Ready button.

**Request body:**
```json
{ "userId": "uuid", "pressing": true }
```

**Behavior:**
- `pressing: true` → call `setPressed(userId)`
- `pressing: false` → call `removePressed(userId)`

**Response:**
```json
{ "activeCount": 2 }
```

### `POST /api/login`

Called when the user clicks Login.

**Request body:**
```json
{ "userId": "uuid" }
```

**Behavior:**
- If `isThresholdMet()` is false → return 403:
  ```json
  { "success": false, "error": "You need the whole crew for a job like this." }
  ```
- If threshold is met → set HTTP-only cookie `crew-authenticated=true` (5-minute expiry), return:
  ```json
  { "success": true }
  ```

## Homepage (`app/page.tsx`)

Client component. Centered layout with two buttons and an active count display.

### Ready Button

- **Press interaction**: `mousedown`/`touchstart` starts a 1-second interval POSTing to `/api/press` with `pressing: true`. `mouseup`/`touchend`/`mouseleave` stops the interval and sends a final `pressing: false`.
- **Visual fill**: While holding, a colored bar fills left-to-right over ~1 second, then resets and fills again — a pulsing heartbeat effect. Color: racing green or electric blue.
- **Large, tactile appearance** — feels like a real button you're physically holding.

### Login Button

- **Below threshold**: Dimmed/grayed out. Clicking shows an error toast.
- **At or above threshold**: Lights up with a glow effect — green flag energy. Clicking POSTs to `/api/login`. On success, redirects to `/dashboard`.
- The server-side threshold check is the source of truth — the client visual state is just UX.

### Active Count Display

Text between the buttons: `"1 / 2 crew members ready"` (using the threshold value). Updates every second from the `/api/press` response.

### Error Toast

A state-driven div with CSS fade-in/fade-out animation. Displays *"You need the whole crew for a job like this."* for 3 seconds. No toast library.

## Protected Page (`app/dashboard/page.tsx`)

Server component. Reads the `crew-authenticated` cookie.

- **Missing/invalid cookie**: redirect to `/`
- **Valid cookie**: Render a simple page — "You're in." with a checkered flag motif. Includes a logout button that clears the cookie and redirects home.

## Visual Design

**Racing crew / pit stop aesthetic:**

- Dark background (near-black, like asphalt)
- Monospace or bold sans-serif font
- Checkered flag patterns as accents (borders, background elements, or decorative strips)
- Racing green for the "go" state, red/amber for "not ready"
- The fill animation on the Ready button evokes a tachometer or fuel gauge
- Dashboard page leans into the "finish line" feel — checkered flags, "You're in."
- All done with Tailwind CSS + inline CSS for animations. No component library.

## Environment Variables

```env
PRESS_THRESHOLD=2
```

## Key Design Decisions

1. **In-memory state, no database** — This is ephemeral by nature. Server restart clears all pressers, which is fine.
2. **2-second staleness window** — Accounts for network latency beyond the 1s poll interval without being so generous that departed users linger.
3. **Server-side login check** — The client dims/enables the login button for UX, but the server is the authority. You can't bypass the gate by manipulating the client.
4. **HTTP-only cookie for auth** — Simple, short-lived (5 min), can't be read/spoofed by client JS.
5. **localStorage UUID** — Simplest correct way to distinguish users without auth.
6. **No external dependencies** — Just Next.js and Tailwind. Keeps it lean and fun.
