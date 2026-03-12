# Frontend - Next.js App

## Structure

```
src/
├── app/              # App router pages
│   ├── page.tsx      # Home page
│   ├── layout.tsx    # Root layout
│   └── analysis/     # Analysis pages
├── components/       # React components
└── lib/             # Utilities
    └── api.ts       # API client
```

## Development

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Build
pnpm build

# Start production
pnpm start
```

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Features

- 🎨 Modern UI with Tailwind CSS
- 🔄 Real-time progress tracking
- 📊 Interactive score cards
- 📱 Responsive design
- 🌙 Dark mode support
