# ShareKit · Gear worth sharing

<p align="center">
  <strong>Find the gear. Make the thing. Pass it on.</strong><br />
  A community-powered marketplace for renting useful equipment from people nearby.
</p>

<p align="center">
  <a href="https://sharekit-client.vercel.app/">Explore ShareKit</a> ·
  <a href="https://sharekit-server.vercel.app/api/health">API status</a> ·
  <a href="https://github.com/nnasif78/sharekit-server">Server repository</a>
</p>

<p align="center">
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img alt="React 19" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Vercel deployment" src="https://img.shields.io/badge/deployed-on%20Vercel-black?logo=vercel" />
</p>

---

## The right tool is closer than you think

Need a camera for the weekend, a drill for one shelf, or a tent for one trip? ShareKit helps you discover equipment around you, book what you need, and put your own gear to work when you are done with it.

**Browse locally. Book confidently. Share more.**

## What you can do

- **Discover equipment** with search and filters for category, price, availability, and rental type.
- **Book in a few steps** with date selection, quantity, and secure Stripe Checkout.
- **Keep track of your rentals** with customer dashboards, rental history, and saved favorites.
- **Put your gear to work** with owner listings, rental activity, and earnings analytics.
- **Run the marketplace** with admin tools for users, listing approvals, bookings, and platform analytics.
- **Make it yours** with profile management, Google or email sign-in, responsive layouts, and light or dark themes.

## Take a look

Visit the live app: **[sharekit-client.vercel.app](https://sharekit-client.vercel.app/)**

The companion API is at **[sharekit-server.vercel.app](https://sharekit-server.vercel.app/)**. Its health endpoint is [`/api/health`](https://sharekit-server.vercel.app/api/health).

## Run it locally

```bash
git clone https://github.com/nnasif78/sharekit-client.git
cd sharekit-client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to get started.

Create `.env.local` and configure the app origins and authentication services:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
MONGODB_URI=your-mongodb-connection-string
BETTER_AUTH_SECRET=your-auth-secret
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_IMGBB_API_KEY=your-imgbb-client-upload-key
```

`NEXT_PUBLIC_IMGBB_API_KEY` enables owner image uploads. Because it is exposed to the browser, use a key intended for client-side uploads. The API has its own configuration; see the [server setup guide](https://github.com/nnasif78/sharekit-server#configuration).

## Built with

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Better Auth · MongoDB · Framer Motion · Lucide

## The other half

The ShareKit API powers equipment, bookings, authentication, payments, notifications, and scheduled rental completion.

**[Explore the API repository →](https://github.com/nnasif78/sharekit-server)**
