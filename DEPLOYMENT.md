# 🚀 Deployment Guide for Rage

The Rage game uses a **split architecture**:
1. **Frontend**: Next.js app (deployed to Vercel)
2. **Backend**: Standalone WebSocket server (deployed to Render/Railway)

---

## 🏗️ Architecture

- **Frontend**: `src/` (Next.js) -> Deploys to Vercel
- **Backend**: `websocket-server/` (Node.js + ws) -> Deploys to Render/Railway

---

## 1️⃣ Deploy Backend (WebSocket Server)

We recommend **Render** or **Railway** because they support long-running WebSocket processes (Vercel does NOT).

### Option A: Render (Recommended)

1. Fork/Push this repo to GitHub.
2. Create a new **Web Service** on Render.
3. Connect your repository.
4. **Settings**:
   - **Root Directory**: `websocket-server`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. **Environment Variables**:
   - `PORT`: `10000` (default)
6. Deploy! Copy the `.onrender.com` URL (e.g., `wss://rage-server.onrender.com`).

### Option B: Railway

1. New Project -> Deploy from Repo.
2. **Settings**:
   - **Root Directory**: `websocket-server`
3. Railway auto-detects the setup.
4. Add domain settings to get your URL.

---

## 2️⃣ Deploy Frontend

**Vercel** is recommended for the Next.js frontend.

1. Go to [Vercel](https://vercel.com).
2. "Add New..." -> "Project".
3. Import your repository.
4. **Environment Variables**:
   - Add `NEXT_PUBLIC_WS_URL`
   - Value: The URL from step 1 (e.g., `wss://rage-server.onrender.com`)
   - **Important**: Must start with `wss://` (secure) or `ws://` (insecure, not recommended for prod).
5. Deploy!

---

## 🛠️ Local Development

You will need **two terminal windows** to run the full stack locally:

**Terminal 1 (Frontend):**
```bash
npm run dev
# Starts Next.js on http://localhost:3000
```

**Terminal 2 (WebSocket Server):**
```bash
npm run ws:dev
# Starts WebSocket server on ws://localhost:8080
```
