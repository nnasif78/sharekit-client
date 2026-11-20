# ShareKit

ShareKit is a community equipment-rental marketplace. Rent useful gear from nearby owners, list equipment you own, and keep good equipment in use instead of buying items for one-off projects.

## Live URL

No production URL is configured in this repository. Set `NEXT_PUBLIC_API_URL` to the deployed API origin and publish the client to record the live site URL here.

## Features

- Discover approved equipment with search, category, price, availability, and rental-type filters.
- Browse paginated listings and view equipment details.
- Book equipment with Stripe Checkout and manage rentals from customer dashboards.
- Save favorite listings, manage profiles, and sign in with email/password or Google. BetterAuth handles sign-in; protected API requests use short-lived JWT access tokens.
- Owner listing management, rental activity, and earnings analytics.
- Admin tools for users, listings, booking status, and platform analytics.
- Light/dark theme, responsive layouts, and animated homepage sections.

## Run locally

Install dependencies and start the Next.js development server:

```bash
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL` in `.env.local` to the ShareKit server origin (defaults to `http://localhost:5000`). The server also needs MongoDB, BetterAuth, Google OAuth, Stripe, and email-provider configuration; see the [server README](../sharekit-server/README.md).

## Main packages

- `next`, `react`, `react-dom` — application framework and UI.
- `framer-motion` — homepage motion and transitions.
- `better-auth`, `@better-auth/mongo-adapter` — authentication client integration.
- `lucide-react` — interface icons.
- `tailwindcss`, `tw-animate-css`, `shadcn`, `@base-ui/react` — styling and UI primitives.
- `mongodb` — shared data types and client-side package compatibility.
