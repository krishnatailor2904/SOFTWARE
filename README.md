# Tailor Shop Manager — Frontend

React + Vite frontend for the tailor shop billing app.

## Local development

```bash
npm install
cp .env.example .env
# .env me VITE_API_URL ko apne local backend URL pe rakho, jaise:
# VITE_API_URL=http://127.0.0.1:8000/api
npm run dev
```

## Deploy on Vercel

1. Repo ko GitHub pe push karo, Vercel me "Add New Project" se import karo.
2. Root Directory me `frontend` select karo (jahan `package.json` hai).
   Vercel Vite ko khud detect kar lega — build command `vite build`,
   output `dist` already default hai.
3. **Settings -> Environment Variables** me add karo:
   ```
   VITE_API_URL = https://your-backend-project.vercel.app/api
   ```
   Ye backend deploy hone ke baad uska URL hoga, `/api` suffix ke saath.
4. Deploy karo. Env var change karne ke baad hamesha redeploy karna.

Backend deploy karne ke instructions backend folder ke `DEPLOY_VERCEL.md`
me hain.
