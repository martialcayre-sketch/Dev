# Neuronutrition Practitioner App

Next.js 14 application for practitioners.

## Structure

```
practitioner/
├── app/              # Next.js App Router
│   ├── layout.tsx    # Root layout
│   └── page.tsx      # Home page
├── lib/              # Utilities
│   └── firebase.ts   # Firebase configuration
├── components/       # UI components
├── .env.local        # Environment variables
├── package.json      # Dependencies
├── tsconfig.json     # TypeScript config
└── next.config.mjs   # Next.js config
```

## Setup

1. Install dependencies:
   ```bash
   cd apps/practitioner
   pnpm install
   ```

2. Run development server:
   ```bash
   pnpm dev
   ```

The app will be available at http://localhost:3010

## Environment Variables

The app is configured to use production Firebase by default (NEXT_PUBLIC_USE_EMULATORS=0).
All Firebase configuration is stored in .env.local.

## Scripts

- `pnpm dev` - Start development server on port 3010
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
