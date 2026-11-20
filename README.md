# ShareKit

ShareKit is a community equipment-rental marketplace. Rent useful gear from nearby owners, list equipment you own, and keep good equipment in use instead of buying items for one-off projects.

## Live URL

No production URL is configured in this repository. Set `NEXT_PUBLIC_API_URL` to the deployed API origin and publish the client to record the live site URL here.

## Features

- Photo-led homepage with six approved listings, category discovery, benefits, and four rated customer reviews.
- Discover approved equipment with search, category, price, availability, and rental-type filters.
- Browse paginated listings and rental history, then view equipment details.
- Book equipment with Stripe Checkout and manage rentals from customer dashboards.
- Save favorite listings, manage profile photos and details, and sign in with email/password or Google. BetterAuth handles sign-in; protected API requests use short-lived JWT access tokens.
- Owner listing management, rental activity, and earnings analytics.
- Admin tools for users, approvals, booking status, and platform analytics.
- Light/dark theme, responsive layouts, and animated homepage sections.
- Scheduled rental completion and email notifications are provided by the API when configured.

## Run locally

Install dependencies and start the Next.js development server:

```bash
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_APP_URL` in `.env.local` to the API and client origins (defaults are `http://localhost:5000` and `http://localhost:3000`). The Next.js server runtime also requires `MONGODB_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET`. Set `NEXT_PUBLIC_IMGBB_API_KEY` to enable owner image uploads; this key is sent to the browser, so use a key intended for client-side uploads. The Express service needs its own environment configuration; see the [server README](../sharekit-server/README.md). Never commit `.env` files or private credentials.

## Main packages

Runtime dependencies: `next`, `react`, `react-dom`, `better-auth`, `@better-auth/mongo-adapter`, `@base-ui/react`, `class-variance-authority`, `cn`, `framer-motion`, `lucide-react`, `mongodb`, `react-hot-toast`, `shadcn`, and `tw-animate-css`.

Development dependencies: `@tailwindcss/turbopack`, `@types/node`, `@types/react`, `@types/react-dom`, `babel-plugin-react-compiler`, `eslint`, `eslint-config-next`, `tailwindcss`, and `typescript`.
