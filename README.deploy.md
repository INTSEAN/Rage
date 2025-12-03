# 🚀 Deployment Guide for Level Devil Game

Your game uses a **custom Node.js server with WebSockets**, which requires specific hosting platforms.

## ⚠️ Important: Vercel Won't Work

**DO NOT deploy to Vercel** - it doesn't support custom servers or WebSockets. Use one of these instead:

---

## ✅ Option 1: Railway (Recommended - Easiest)

**Why Railway?** 
- One-click deploy
- Free tier available
- Native WebSocket support
- Auto-detects configuration

**Steps:**

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add deployment config"
   git push origin main
   ```

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub"
   - Select your repository
   - Railway will auto-detect `railway.json` and deploy!

3. **Add Environment Variables**
   - In Railway dashboard, go to your project
   - Click "Variables" tab
   - Add:
     - `TURSO_CONNECTION_URL`
     - `TURSO_AUTH_TOKEN`
   - Copy values from your `.env` file

4. **Done!** 
   - Railway will provide you with a URL like `https://your-app.railway.app`
   - WebSockets will work automatically at `wss://your-app.railway.app/ws`

---

## ✅ Option 2: Render

**Steps:**

1. **Push to GitHub** (same as above)

2. **Deploy on Render**
   - Go to [render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect `render.yaml`!

3. **Or Manual Setup:**
   - **Build Command:** `bun install && bun run build`
   - **Start Command:** `NODE_ENV=production bun server.ts`
   - **Plan:** Free

4. **Add Environment Variables**
   - In Render dashboard, go to "Environment"
   - Add both Turso variables

5. **Done!** 
   - Your app will be at `https://your-app.onrender.com`
   - WebSockets: `wss://your-app.onrender.com/ws`

---

## ✅ Option 3: Docker (DigitalOcean, Fly.io, AWS, etc.)

**For platforms that support Docker:**

1. **Build Docker Image**
   ```bash
   docker build -t level-devil-game .
   ```

2. **Test Locally**
   ```bash
   docker run -p 3000:3000 \
     -e TURSO_CONNECTION_URL="your_url" \
     -e TURSO_AUTH_TOKEN="your_token" \
     level-devil-game
   ```

3. **Deploy to your platform:**
   - **DigitalOcean App Platform:** Upload Dockerfile
   - **Fly.io:** `fly launch` → `fly deploy`
   - **AWS ECS/Fargate:** Push to ECR and deploy

---

## 🔧 Post-Deployment Checklist

After deploying, verify:

1. ✅ **HTTP works**: Visit `https://your-domain.com`
2. ✅ **WebSocket connects**: Check game page - should show "🟢 Connected"
3. ✅ **Multiplayer works**: Create a room, join from another device
4. ✅ **Database works**: Room data persists

---

## 🐛 Troubleshooting

### WebSocket shows "🔴 Disconnected"

**Check browser console** (F12 → Console):
- Look for WebSocket errors
- Check the connection URL

**Common issues:**
- Mixed content (HTTP page trying WSS): Make sure your site uses HTTPS
- CORS issues: WebSocket should connect to same domain
- Firewall: Ensure port 443/80 allows WebSocket upgrades

### "Cannot connect to database"

- Verify environment variables are set correctly
- Check Turso URL and token are valid
- Test connection locally first

---

## 📊 Monitoring

**Check WebSocket health:**
- Open browser DevTools → Network tab → WS filter
- Should see connection to `/ws` with status 101 (Switching Protocols)

**Server logs:**
- Railway: Click "Deployments" → "Logs"
- Render: Click "Logs" tab
- Shows connection/disconnection events

---

## 💰 Pricing

| Platform | Free Tier | WebSocket Support |
|----------|-----------|-------------------|
| **Railway** | $5 credit/month | ✅ Yes |
| **Render** | 750 hours/month | ✅ Yes |
| **Fly.io** | 3 VMs free | ✅ Yes |
| **Vercel** | Unlimited | ❌ No custom servers |

---

## 🎮 Your App is Ready!

Your custom server at `server.ts` handles:
- ✅ Next.js HTTP requests
- ✅ WebSocket connections at `/ws`
- ✅ Real-time multiplayer game state

Just deploy to a platform that supports custom Node.js servers! 🚀
