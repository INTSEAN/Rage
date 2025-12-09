# Rage


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Architecture Overview

Rage uses a split architecture to ensure scalability and platform compatibility:

### 1. Frontend (Next.js)
- **Framework**: Next.js 14+ (App Router)
- **Hosting**: Vercel (recommended) or any static/Node.js host.
- **Responsibility**: Renders the game UI, handles user input, and manages game state interpolation.
- **Path**: Root directory.

### 2. WebSocket Server (Node.js)
- **Framework**: `ws` (Native WebSocket library)
- **Hosting**: Render, Railway, or any platform supporting long-running Node.js processes.
- **Responsibility**: Handles real-time multiplayer state, room management, and player synchronization.
- **Path**: `websocket-server/` directory.

### Communication
The frontend connects to the WebSocket server using the `NEXT_PUBLIC_WS_URL` environment variable. If not set, it defaults to:
- Local: `ws://localhost:8080`
- Production: Auto-detects (but recommended to set explicitly).
