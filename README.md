# EventCraft AI

AI-powered event discovery and management platform built with Next.js, Convex, and shadcn/ui.

## Features

- **AI-Powered Event Creation** - Generate event details using AI from natural language prompts
- **Event Discovery** - Browse and search events by category, location, and interests
- **Ticket Management** - Register for events and manage QR code tickets
- **User Authentication** - Secure sign-in with GitHub, Google, or passkeys
- **Onboarding** - Personalized event recommendations based on interests and location
- **QR Code Check-in** - Scanner for organizers to verify attendee tickets
- **Event Analytics** - Dashboard for organizers to track registrations and engagement

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Backend**: Convex (real-time database, functions, file storage)
- **Authentication**: Better Auth with passkey support
- **AI**: AI SDK with Google Gemini for event generation
- **UI Components**: shadcn/ui, Radix UI primitives
- **State Management**: Jotai (atomic state), TanStack Query
- **QR Codes**: qrcode library for ticket generation

## Getting Started

### Prerequisites

- Node.js 20+
- npm or bun

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
# Create .env.local with required keys (see below)

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with:

```
# Convex (get from Convex dashboard)
CONVEX_DEPLOYMENT=
CONVEX_DEPLOY_KEY=

# Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# OAuth (GitHub)
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=

# OAuth (Google)
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# AI (Google Gemini)
GOOGLE_GENERATIVE_AI_API_KEY=
```

### Running Convex

```bash
npx convex dev
```

## Project Structure

```
app/                    # Next.js App Router pages
├── (auth)/            # Authentication pages
├── (protected)/       # Protected routes (requires auth)
│   ├── admin/         # Admin panel
│   ├── dashboard/     # User dashboard
│   ├── events/       # Event creation & management
│   ├── explore/       # Event discovery
│   ├── profile/       # User profile
│   ├── scanner/       # QR code scanner
│   └── tickets/       # Ticket management
├── layout.tsx         # Root layout
└── page.tsx          # Landing page

components/            # React components
├── layout/            # Header, navigation
└── ui/                # shadcn/ui components

features/              # Feature-specific components
├── admin/             # Admin functionality
├── analytics/         # Event analytics
├── auth/              # Authentication
├── checkin/           # QR code check-in
├── discovery/         # Event search & discovery
├── events/            # Event creation & management
└── onboarding/        # User onboarding flow

convex/                # Convex backend
├── functions/         # API functions
└── schema.ts          # Database schema
```

## Available Scripts

| Command                | Description               |
| ---------------------- | ------------------------- |
| `npm run dev`          | Start development server  |
| `npm run build`        | Build for production      |
| `npm run lint`         | Run ESLint                |
| `npm run check`        | Run ESLint and TypeScript |
| `npm run format:write` | Format code with Prettier |

## License

MIT
